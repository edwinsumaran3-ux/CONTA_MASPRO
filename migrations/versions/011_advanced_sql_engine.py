"""Advanced SQL engine: materialized views, CPP procedure, period-close trigger, hash helpers.

Implements SQL Foundation (Fase 1) of the Architecture Explorer roadmap:
  - mv_trial_balance: OLAP-ready materialized view with CONCURRENT refresh
  - mv_period_summary: per-tenant period rollup for dashboard
  - recalculate_cpp(): function for Costo Promedio Ponderado on kardex movements
  - trg_period_close_validate: DB-level guard before AccountingPeriod is closed
  - compute_row_hash(): SQL function used by the Python HashChain service
  - Composite indexes for reporting queries
"""
from alembic import op
from sqlalchemy import text

revision = "011_advanced_sql_engine"
down_revision = "010_ledger_reinforced_schema"
branch_labels = None
depends_on = None


def upgrade():
    # ── 1. Materialized view: Trial Balance ──────────────────────────────────
    op.execute(text("""
        CREATE MATERIALIZED VIEW IF NOT EXISTS mv_trial_balance AS
        SELECT
            je.tenant_id,
            jl.account_code,
            ca.name                                 AS account_name,
            ca.account_class,
            ca.nature,
            EXTRACT(YEAR  FROM je.entry_date)::INT  AS year,
            EXTRACT(MONTH FROM je.entry_date)::INT  AS month,
            SUM(jl.debit)                           AS total_debit,
            SUM(jl.credit)                          AS total_credit,
            SUM(jl.debit) - SUM(jl.credit)          AS balance
        FROM  journal_entries je
        JOIN  journal_lines jl
               ON jl.entry_id  = je.id
        LEFT  JOIN chart_accounts ca
               ON ca.code      = jl.account_code
              AND ca.tenant_id = je.tenant_id
        WHERE je.estado_asiento = 'VALIDADO'
        GROUP BY je.tenant_id, jl.account_code,
                 ca.name, ca.account_class, ca.nature,
                 EXTRACT(YEAR  FROM je.entry_date),
                 EXTRACT(MONTH FROM je.entry_date)
        WITH NO DATA;
    """))

    op.execute(text("""
        CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_trial_balance_pk
            ON mv_trial_balance (tenant_id, account_code, year, month);
    """))

    # Populate on first deploy (non-concurrent since index was just created)
    op.execute(text("REFRESH MATERIALIZED VIEW mv_trial_balance;"))

    # ── 2. Materialized view: Period Summary (dashboard metrics) ─────────────
    op.execute(text("""
        CREATE MATERIALIZED VIEW IF NOT EXISTS mv_period_summary AS
        SELECT
            je.tenant_id,
            EXTRACT(YEAR  FROM je.entry_date)::INT  AS year,
            EXTRACT(MONTH FROM je.entry_date)::INT  AS month,
            COUNT(DISTINCT je.id)                   AS entry_count,
            SUM(je.total_debit)                     AS total_debit,
            SUM(CASE WHEN LEFT(jl.account_code,1)='7'
                     THEN jl.credit ELSE 0 END)     AS total_revenue,
            SUM(CASE WHEN LEFT(jl.account_code,1)='6'
                     THEN jl.debit  ELSE 0 END)     AS total_expense,
            SUM(CASE WHEN jl.document_type IN ('01','03')
                          AND LEFT(jl.account_code,2)='40'
                     THEN jl.credit ELSE 0 END)     AS igv_ventas,
            SUM(CASE WHEN jl.document_type IN ('01','03')
                          AND LEFT(jl.account_code,2)='40'
                     THEN jl.debit  ELSE 0 END)     AS igv_compras,
            COUNT(CASE WHEN je.validar_status != 'OK' THEN 1 END) AS entries_with_issues
        FROM  journal_entries je
        JOIN  journal_lines jl ON jl.entry_id = je.id
        GROUP BY je.tenant_id,
                 EXTRACT(YEAR  FROM je.entry_date),
                 EXTRACT(MONTH FROM je.entry_date)
        WITH NO DATA;
    """))

    op.execute(text("""
        CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_period_summary_pk
            ON mv_period_summary (tenant_id, year, month);
    """))

    op.execute(text("REFRESH MATERIALIZED VIEW mv_period_summary;"))

    # ── 3. SQL helper: compute_row_hash (mirrors Python HashChain) ───────────
    op.execute(text("""
        CREATE OR REPLACE FUNCTION compute_row_hash(
            p_previous_hash TEXT,
            p_entry_data    TEXT
        ) RETURNS TEXT
        LANGUAGE sql
        IMMUTABLE
        PARALLEL SAFE
        AS $$
            SELECT encode(
                hmac(
                    (COALESCE(p_previous_hash,'') || '|' || p_entry_data)::bytea,
                    current_setting('app.ledger_hmac_secret', true)::bytea,
                    'sha256'
                ),
                'hex'
            );
        $$;
    """))

    # ── 4. CPP recalculation function ────────────────────────────────────────
    # Recalculates Costo Promedio Ponderado for all kardex movements of a product.
    # Called after each ingreso or purchase to keep unit_cost consistent.
    op.execute(text("""
        CREATE OR REPLACE FUNCTION recalculate_cpp(
            p_tenant_id  UUID,
            p_product_id UUID
        ) RETURNS TABLE(
            movement_id   UUID,
            new_unit_cost NUMERIC(18,6),
            running_stock NUMERIC(18,4)
        )
        LANGUAGE plpgsql
        AS $$
        DECLARE
            v_qty  NUMERIC(18,4) := 0;
            v_cost NUMERIC(18,6) := 0;
            rec    RECORD;
        BEGIN
            FOR rec IN
                SELECT id, movement_type, quantity, unit_cost
                FROM   kardex_movements
                WHERE  tenant_id  = p_tenant_id
                  AND  product_id = p_product_id
                ORDER  BY movement_date, created_at
            LOOP
                IF rec.movement_type IN (
                    'INGRESO', 'COMPRA', 'DEVOLUCION_SALIDA', 'AJUSTE_POSITIVO'
                ) THEN
                    -- Recalculate weighted average on every inflow
                    v_cost := (v_qty * v_cost + rec.quantity * rec.unit_cost)
                              / NULLIF(v_qty + rec.quantity, 0);
                    v_qty  := v_qty + rec.quantity;
                ELSE
                    -- Outflow valued at current CPP
                    v_qty := v_qty - rec.quantity;
                END IF;

                UPDATE kardex_movements
                   SET unit_cost = v_cost
                 WHERE id = rec.id;

                movement_id   := rec.id;
                new_unit_cost := v_cost;
                running_stock := v_qty;
                RETURN NEXT;
            END LOOP;
        END;
        $$;
    """))

    # ── 5. Period-close validation trigger ──────────────────────────────────
    op.execute(text("""
        CREATE OR REPLACE FUNCTION trg_validate_period_close_fn()
        RETURNS TRIGGER
        LANGUAGE plpgsql
        AS $$
        DECLARE
            v_unbalanced INT;
            v_missing_cc INT;
        BEGIN
            -- Only fires when actually closing (false → true)
            IF NOT (NEW.is_closed AND NOT OLD.is_closed) THEN
                RETURN NEW;
            END IF;

            -- Guard 1: reject if any entry has validar_status != 'OK'
            SELECT COUNT(*)
              INTO v_unbalanced
              FROM journal_entries
             WHERE tenant_id = NEW.tenant_id
               AND EXTRACT(YEAR  FROM entry_date)::INT = NEW.year
               AND EXTRACT(MONTH FROM entry_date)::INT = NEW.month
               AND validar_status != 'OK';

            IF v_unbalanced > 0 THEN
                RAISE EXCEPTION
                    'PERIOD CLOSE BLOCKED: % asiento(s) con estado != OK en %-%',
                    v_unbalanced, NEW.year, NEW.month
                    USING ERRCODE = 'P0002';
            END IF;

            -- Guard 2: reject if class-6 or class-9 lines lack a cost center
            SELECT COUNT(*)
              INTO v_missing_cc
              FROM journal_lines jl
              JOIN journal_entries je ON je.id = jl.entry_id
             WHERE je.tenant_id = NEW.tenant_id
               AND EXTRACT(YEAR  FROM je.entry_date)::INT = NEW.year
               AND EXTRACT(MONTH FROM je.entry_date)::INT = NEW.month
               AND LEFT(jl.account_code, 1) IN ('6', '9')
               AND COALESCE(TRIM(jl.cost_center), '') = '';

            IF v_missing_cc > 0 THEN
                RAISE EXCEPTION
                    'PERIOD CLOSE BLOCKED: % línea(s) clase 6/9 sin centro de costo en %-%',
                    v_missing_cc, NEW.year, NEW.month
                    USING ERRCODE = 'P0003';
            END IF;

            -- Trigger a deferred refresh of the materialized views
            -- (actual REFRESH runs via Celery Beat; this just records the need)
            INSERT INTO outbox_events (
                id, aggregate_root_id, event_type, event_data, published_at
            ) VALUES (
                gen_random_uuid(),
                NEW.id::TEXT,
                'PERIOD_CLOSED',
                json_build_object(
                    'tenant_id', NEW.tenant_id,
                    'year',      NEW.year,
                    'month',     NEW.month
                )::TEXT,
                NULL
            )
            ON CONFLICT DO NOTHING;

            RETURN NEW;
        END;
        $$;
    """))

    op.execute(text("DROP TRIGGER IF EXISTS trg_period_close_validate ON accounting_periods"))
    op.execute(text("""
        CREATE TRIGGER trg_period_close_validate
            BEFORE UPDATE ON accounting_periods
            FOR EACH ROW
            EXECUTE FUNCTION trg_validate_period_close_fn()
    """))

    # ── 6. Composite indexes for reporting queries ───────────────────────────
    op.execute(text("""
        CREATE INDEX IF NOT EXISTS idx_je_tenant_period_status
            ON journal_entries (tenant_id, entry_date, estado_asiento);
    """))
    op.execute(text("""
        CREATE INDEX IF NOT EXISTS idx_je_tenant_validar
            ON journal_entries (tenant_id, validar_status)
            WHERE validar_status != 'OK';
    """))
    op.execute(text("""
        CREATE INDEX IF NOT EXISTS idx_jl_account_entry
            ON journal_lines (account_code, entry_id);
    """))
    op.execute(text("""
        CREATE INDEX IF NOT EXISTS idx_jl_cost_center_null
            ON journal_lines (entry_id)
            WHERE COALESCE(TRIM(cost_center), '') = ''
              AND LEFT(account_code, 1) IN ('6', '9');
    """))


def downgrade():
    # Triggers & functions
    op.execute(text("DROP TRIGGER IF EXISTS trg_period_close_validate ON accounting_periods;"))
    op.execute(text("DROP FUNCTION IF EXISTS trg_validate_period_close_fn();"))
    op.execute(text("DROP FUNCTION IF EXISTS recalculate_cpp(UUID, UUID);"))
    op.execute(text("DROP FUNCTION IF EXISTS compute_row_hash(TEXT, TEXT);"))

    # Materialized views
    op.execute(text("DROP MATERIALIZED VIEW IF EXISTS mv_period_summary;"))
    op.execute(text("DROP MATERIALIZED VIEW IF EXISTS mv_trial_balance;"))

    # Indexes (dropped automatically with their tables/views but listed for clarity)
    op.execute(text("DROP INDEX IF EXISTS idx_jl_cost_center_null;"))
    op.execute(text("DROP INDEX IF EXISTS idx_jl_account_entry;"))
    op.execute(text("DROP INDEX IF EXISTS idx_je_tenant_validar;"))
    op.execute(text("DROP INDEX IF EXISTS idx_je_tenant_period_status;"))
