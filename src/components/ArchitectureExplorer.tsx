import React, { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = 'arquitectura' | 'bounded' | 'motor_ia' | 'sql' | 'roadmap';

interface ArchChip {
  id: string;
  label: string;
  file: string;
  detail: string;
}

interface ArchLayer {
  id: string;
  name: string;
  color: string;
  bg: string;
  components: ArchChip[];
}

interface BoundedContext {
  id: string;
  name: string;
  color: string;
  emoji: string;
  entities: string[];
  rules: string[];
  events: string[];
}

interface AIPipelineStep {
  id: string;
  label: string;
  color: string;
  detail: string;
}

interface SqlSnippet {
  id: string;
  title: string;
  color: string;
  code: string;
}

interface RoadmapPhase {
  phase: string;
  months: string;
  title: string;
  color: string;
  milestones: string[];
  tech: string[];
}

// ─── Static data ─────────────────────────────────────────────────────────────

const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: 'arquitectura', label: 'Arquitectura',      emoji: '🏛' },
  { id: 'bounded',      label: 'Bounded Contexts',  emoji: '🧩' },
  { id: 'motor_ia',     label: 'Motor IA',           emoji: '🤖' },
  { id: 'sql',          label: 'SQL Avanzado',       emoji: '🗄' },
  { id: 'roadmap',      label: 'Roadmap',            emoji: '🗺' },
];

const ARCH_LAYERS: ArchLayer[] = [
  {
    id: 'presentation',
    name: 'Presentation Layer',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.08)',
    components: [
      { id: 'workspace',    label: 'EnterpriseWorkspace', file: 'src/features/accounting/EnterpriseWorkspace.tsx', detail: 'Hub principal: 13 módulos lazy, métricas en tiempo real, copiloto IA, nav rail con feature flags por plan.' },
      { id: 'journal_grid', label: 'JournalGrid',         file: 'src/features/accounting/JournalGrid.tsx',         detail: 'Grid virtualizado para 3000+ filas. Agrupación por entryId, badges OK/DESC/CC, expansión de líneas.' },
      { id: 'dashboard',    label: 'DashboardEnterprise', file: 'src/components/DashboardEnterprise.tsx',          detail: 'Métricas ejecutivas: ventas, IGV neto, asientos del periodo, alertas SUNAT, gráficos Recharts.' },
      { id: 'side_panel',   label: 'SaleForm / PurchaseForm', file: 'src/features/accounting/SaleFormEnterprise.tsx', detail: 'Formularios UBL 2.1 con IGV, detracción, mapeo automático de cuentas, validación antes de POST.' },
      { id: 'zustand',      label: 'Zustand: useTenantStore', file: 'src/hooks/useTenantStore.ts',                detail: 'Estado global: empresa activa, companies[], cambio de tenant, persistencia en localStorage.' },
    ],
  },
  {
    id: 'application',
    name: 'Application Layer',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.08)',
    components: [
      { id: 'orchestrator', label: 'LedgerEngineOrchestrator', file: 'src/application/services/ledger_engine_orchestrator.py', detail: 'Coordina Unit A → Unit B → PostingService. Retorna LedgerEngineOutput con ComplianceChecks y ActionFlags.' },
      { id: 'unit_a',       label: 'Unit A: Classification',   file: 'src/application/services/ledger_unit_a_classification.py', detail: 'Genera líneas contables desde plantilla: tipo FACTURA/RECIBO/etc. → debe/haber usando ChartAccount.' },
      { id: 'unit_b',       label: 'Unit B: Compliance',       file: 'src/application/services/ledger_unit_b_compliance.py',    detail: 'Valida 12 reglas SUNAT: naturaleza debe/haber, centros de costo 6xxx/9xxx, IGV proporcional, tipo cambio.' },
      { id: 'posting',      label: 'LedgerPostingService',     file: 'src/application/services/ledger_posting_service.py',      detail: 'Escribe JournalEntry + JournalLines. Calcula hash HMAC-SHA256. Crea OutboxEvent para publicación async.' },
      { id: 'guard',        label: 'ExpertAccountingGuard',    file: 'src/application/services/expert_accounting_guard.py',     detail: 'Validación pre-posting: balance ∑debe=∑haber, centros de costo requeridos, IGV, tipificación de riesgo.' },
    ],
  },
  {
    id: 'domain',
    name: 'Domain Layer',
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.08)',
    components: [
      { id: 'journal_entry', label: 'JournalEntry (Aggregate Root)', file: 'src/domain/models/accounting.py', detail: 'Invariante: total_debit = total_credit (CheckConstraint DB). Campos hash + previous_hash para cadena. No UPDATE en VALIDADO.' },
      { id: 'chart_account', label: 'ChartAccount',               file: 'src/domain/models/accounting.py', detail: 'Maestro de cuentas PCGE 2024: code, nature (DEUDORA/ACREEDORA), account_class, accepts_cost_center.' },
      { id: 'period',        label: 'AccountingPeriod',           file: 'src/domain/models/accounting.py', detail: 'Periodo contable con estado abierto/cerrado. Trigger DB bloquea postings en periodos cerrados.' },
      { id: 'exceptions',    label: 'Domain Exceptions',          file: 'src/domain/exceptions.py',        detail: 'ContaProException, ExpertValidationException. Nunca exponen stack trace; mensajes en español para el cliente.' },
    ],
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure Layer',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
    components: [
      { id: 'hash_chain',    label: 'HashChain',         file: 'src/infrastructure/hash_chain.py',       detail: 'HMAC-SHA256: hash = HMAC(prev_hash ‖ entry_data). Verificación on-demand por IntegrityScanner.' },
      { id: 'uow',           label: 'UnitOfWork',        file: 'src/infrastructure/unit_of_work.py',     detail: 'build_uow_factory() produce UoW con AsyncSession. Rollback automático en excepciones de dominio.' },
      { id: 'outbox',        label: 'Outbox + Celery',   file: 'src/infrastructure/events/',             detail: 'OutboxEvent → Celery workers → SUNAT, integraciones, analytics. Consistencia eventual entre servicios.' },
      { id: 'sunat_adapter', label: 'SUNAT Adapter',     file: 'src/infrastructure/adapters/sunat/',     detail: 'OSE/PSE SOAP, firma PFX, XSD UBL 2.1, CDR parsing, SIRE/PLE exportación. Timeout 3s con fallback.' },
      { id: 'pgvector',      label: 'pgvector RAG',      file: 'src/infrastructure/adapters/ai/',        detail: 'Embeddings de TUO_LIR, CÓDIGO_TRIBUTARIO, MANUAL_SUNAT. Similarity search en preguntas del copiloto.' },
    ],
  },
  {
    id: 'ai_service',
    name: 'AI Service Layer',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    components: [
      { id: 'gemini',    label: 'Gemini 2.0 Flash',    file: 'src/application/services/invoice_gemini_extractor.py', detail: 'Parsing de imágenes de facturas → JSON estructurado. Latencia <2 s. Fallback a extracción manual por el contador.' },
      { id: 'rag',       label: 'Legal RAG Service',   file: 'src/application/services/legal_rag_service.py',       detail: 'pgvector + embeddings de normas tributarias. Responde preguntas con citas de artículos reales.' },
      { id: 'reasoning', label: 'Reasoning Engine',    file: 'src/ai/reasoning_engine.py',                          detail: 'Pipeline multi-paso: Input → Dimensión (Patrimonial/Resultados/Control) → Reglas → Ajuste redondeo.' },
      { id: 'anomaly',   label: 'Anomaly Detection',   file: 'src/api/routes/ai.py',                                detail: 'Detecta asientos inusuales: montos atípicos, CC faltante, patrones de riesgo SUNAT.' },
    ],
  },
];

const BOUNDED_CONTEXTS: BoundedContext[] = [
  {
    id: 'ledger',
    name: 'Ledger BC',
    color: '#3b82f6',
    emoji: '📒',
    entities: ['JournalEntry (Aggregate Root)', 'JournalLine', 'ChartAccount', 'AccountingPeriod', 'CostCenter', 'AuditLog', 'OutboxEvent'],
    rules: [
      'Invariante: ∑debe = ∑haber por asiento',
      'Cadena inmutable: hash = HMAC(prev_hash ‖ data)',
      'Periodo cerrado: rechaza nuevos postings',
      'Cuentas 6xxx/9xxx: centro de costo obligatorio',
      'Moneda extranjera: tipo cambio SUNAT del día',
      'No UPDATE/DELETE en estado VALIDADO (trigger DB)',
    ],
    events: ['JournalPosted', 'PeriodClosed', 'EntryReverted'],
  },
  {
    id: 'inventory',
    name: 'Inventario BC',
    color: '#10b981',
    emoji: '📦',
    entities: ['Product', 'Warehouse', 'KardexMovement', 'StockLevel', 'CostLayer (CPP/PEPS)'],
    rules: [
      'Método CPP: recalcular costo promedio en cada ingreso',
      'Stock negativo no permitido (excepto tránsito)',
      'Movimiento genera asiento automático en Ledger BC',
      'Merma ≤ 3% del lote: no requiere nota de crédito',
      'PEPS opcional: activable por empresa en configuración',
    ],
    events: ['StockMoved', 'CostRecalculated', 'StockAlert'],
  },
  {
    id: 'planillas',
    name: 'Planillas BC',
    color: '#8b5cf6',
    emoji: '👥',
    entities: ['Worker', 'PayrollRun', 'PlanillaLine', 'Benefit', 'AFP/ONP', 'EsSalud'],
    rules: [
      'Remuneración mínima: S/ 1,025 (2024)',
      'AFP: 10% + comisión + seguro (variable por fondo)',
      'EsSalud: 9% sobre remuneración bruta',
      '5ta categoría: retención mensual por proyección anual',
      'CTS semestral: mayo y noviembre (15 días hábiles)',
    ],
    events: ['PayrollProcessed', 'BenefitCalculated', 'TaxWithheld'],
  },
  {
    id: 'facturacion',
    name: 'Facturación BC',
    color: '#f59e0b',
    emoji: '🧾',
    entities: ['Invoice', 'CreditNote', 'DebitNote', 'CDR', 'SunatResponse', 'XmlDocument'],
    rules: [
      'UBL 2.1: estructura XML obligatoria para SUNAT',
      'Firma digital PFX: obligatoria en facturas electrónicas',
      'CDR verde: único estado aceptado para IGV deducible',
      'Detracción: >S/ 700 en servicios afectos (variable por sector)',
      'Percepción: agentes designados por resolución SUNAT',
    ],
    events: ['InvoiceIssued', 'CDRReceived', 'DocumentVoided'],
  },
];

const AI_PIPELINE: AIPipelineStep[] = [
  { id: 'input',  label: 'Input',         color: '#64748b', detail: 'JournalPostRequest / InvoicePostRequest validado con Pydantic. Incluye tipo, montos, cuentas, RUC, periodo, tipo cambio.' },
  { id: 'unit_a', label: 'Unit A\nClasificar', color: '#3b82f6', detail: 'Genera líneas contables desde plantilla de tipo de transacción → mapeo debe/haber usando ChartAccount como lookup.' },
  { id: 'unit_b', label: 'Unit B\nCumplir',    color: '#8b5cf6', detail: 'Aplica reglas SUNAT: centros de costo, IGV proporcional, naturaleza deudora/acreedora, tipo cambio del día.' },
  { id: 'post',   label: 'Posting\n+ Hash',    color: '#10b981', detail: 'Escribe en PostgreSQL con HMAC-SHA256. Crea OutboxEvent para publicación asíncrona a SUNAT / integraciones.' },
  { id: 'audit',  label: 'Audit\nLog',         color: '#f59e0b', detail: 'AuditLog inmutable: qué, quién, cuándo, valores old/new. Alimenta dashboard de salud de auditoría y compliance.' },
];

const DECISION_DIMS = [
  {
    id: 'patrimonial',
    label: 'Patrimonial',
    color: '#3b82f6',
    items: ['Balance de Situación', 'Activo / Pasivo / Patrimonio', 'Cuentas 1x, 2x, 3x, 4x, 5x', 'Ajuste por tipo de cambio', 'Provisiones y depreciación'],
  },
  {
    id: 'resultados',
    label: 'Resultados',
    color: '#10b981',
    items: ['Estado de Ganancias y Pérdidas', 'Cuentas 6x (Gastos) / 7x (Ingresos)', 'Margen bruto y operativo', 'EBITDA por centro de costo', 'Variación vs presupuesto'],
  },
  {
    id: 'control',
    label: 'Control',
    color: '#f59e0b',
    items: ['Cadena hash HMAC-SHA256', 'AuditLog inmutable', 'Integridad IntegrityScanner', 'Alertas SUNAT en tiempo real', 'Pre-cierre IA por probabilidad'],
  },
];

const SQL_SNIPPETS: SqlSnippet[] = [
  {
    id: 'matview',
    title: 'Vista Materializada — Balance de Comprobación',
    color: '#3b82f6',
    code: `CREATE MATERIALIZED VIEW mv_trial_balance AS
SELECT
  je.tenant_id,
  jl.account_code,
  ca.name            AS account_name,
  ca.account_class,
  ca.nature,
  EXTRACT(YEAR  FROM je.entry_date)::INT AS year,
  EXTRACT(MONTH FROM je.entry_date)::INT AS month,
  SUM(jl.debit)                          AS total_debit,
  SUM(jl.credit)                         AS total_credit,
  SUM(jl.debit) - SUM(jl.credit)         AS balance
FROM  journal_entries je
JOIN  journal_lines jl ON jl.entry_id  = je.id
LEFT  JOIN chart_accounts ca
        ON ca.code = jl.account_code
       AND ca.tenant_id = je.tenant_id
WHERE je.estado_asiento = 'VALIDADO'
GROUP BY je.tenant_id, jl.account_code,
         ca.name, ca.account_class, ca.nature,
         EXTRACT(YEAR  FROM je.entry_date),
         EXTRACT(MONTH FROM je.entry_date);

CREATE UNIQUE INDEX idx_mv_trial_balance_pk
  ON mv_trial_balance (tenant_id, account_code, year, month);

-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_trial_balance;
-- (llamar desde Celery Beat post-cierre de periodo)`,
  },
  {
    id: 'hash_chain',
    title: 'Hash Chain — Trigger de Inmutabilidad + row_hash',
    color: '#06b6d4',
    code: `-- Impide UPDATE/DELETE en asientos ya validados
CREATE OR REPLACE FUNCTION trg_no_update_journal_fn()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.estado_asiento = 'VALIDADO' THEN
    RAISE EXCEPTION
      'LEDGER IMMUTABLE: asiento % ya validado. Hash: %',
      OLD.id, OLD.hash USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END; $$;

-- row_hash incluye previous_hash (encadenamiento tipo blockchain)
CREATE OR REPLACE FUNCTION compute_row_hash(
  p_previous_hash TEXT,
  p_entry_data    TEXT   -- JSON canónico del asiento
) RETURNS TEXT LANGUAGE sql IMMUTABLE AS $$
  SELECT encode(
    hmac(
      (p_previous_hash || '|' || p_entry_data)::bytea,
      current_setting('app.ledger_hmac_secret')::bytea,
      'sha256'
    ), 'hex'
  );
$$;

-- Verificar cadena completa de un tenant:
-- SELECT id, hash = compute_row_hash(previous_hash, ...)
-- FROM journal_entries WHERE tenant_id = $1
-- ORDER BY created_at;`,
  },
  {
    id: 'cpp',
    title: 'Procedimiento CPP — Costo Promedio Ponderado',
    color: '#10b981',
    code: `CREATE OR REPLACE FUNCTION recalculate_cpp(
  p_tenant_id  UUID,
  p_product_id UUID
) RETURNS TABLE(
  movement_id   UUID,
  new_unit_cost NUMERIC(18,6),
  running_stock NUMERIC(18,4)
) LANGUAGE plpgsql AS $$
DECLARE
  v_qty  NUMERIC := 0;
  v_cost NUMERIC := 0;
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
      'INGRESO','COMPRA','DEVOLUCION_SALIDA'
    ) THEN
      -- Recalcular CPP al ingresar stock
      v_cost := (v_qty * v_cost + rec.quantity * rec.unit_cost)
                / NULLIF(v_qty + rec.quantity, 0);
      v_qty  := v_qty + rec.quantity;
    ELSE
      -- Salida valorizada al CPP vigente
      v_qty  := v_qty - rec.quantity;
    END IF;

    UPDATE kardex_movements
       SET unit_cost = v_cost
     WHERE id = rec.id;

    movement_id   := rec.id;
    new_unit_cost := v_cost;
    running_stock := v_qty;
    RETURN NEXT;
  END LOOP;
END; $$;

-- Uso: SELECT * FROM recalculate_cpp('<tenant>', '<product>');`,
  },
  {
    id: 'period_close',
    title: 'Trigger — Validación de Cierre de Periodo',
    color: '#f59e0b',
    code: `CREATE OR REPLACE FUNCTION trg_validate_period_close_fn()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_unbalanced INT;
  v_missing_cc INT;
BEGIN
  IF NEW.is_closed AND NOT OLD.is_closed THEN

    -- 1. Rechazar si hay asientos descuadrados
    SELECT COUNT(*) INTO v_unbalanced
    FROM journal_entries
    WHERE tenant_id = NEW.tenant_id
      AND EXTRACT(YEAR  FROM entry_date)::INT = NEW.year
      AND EXTRACT(MONTH FROM entry_date)::INT = NEW.month
      AND validar_status != 'OK';

    IF v_unbalanced > 0 THEN
      RAISE EXCEPTION
        'PERIOD CLOSE BLOCKED: % asiento(s) con estado != OK',
        v_unbalanced USING ERRCODE = 'P0002';
    END IF;

    -- 2. Rechazar si cuentas 6/9 sin centro de costo
    SELECT COUNT(*) INTO v_missing_cc
    FROM  journal_lines jl
    JOIN  journal_entries je ON je.id = jl.entry_id
    WHERE je.tenant_id = NEW.tenant_id
      AND EXTRACT(YEAR  FROM je.entry_date)::INT = NEW.year
      AND EXTRACT(MONTH FROM je.entry_date)::INT = NEW.month
      AND LEFT(jl.account_code, 1) IN ('6','9')
      AND COALESCE(TRIM(jl.cost_center), '') = '';

    IF v_missing_cc > 0 THEN
      RAISE EXCEPTION
        'PERIOD CLOSE BLOCKED: % línea(s) 6/9 sin CC',
        v_missing_cc USING ERRCODE = 'P0003';
    END IF;

  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_period_close_validate
  BEFORE UPDATE ON accounting_periods
  FOR EACH ROW EXECUTE FUNCTION trg_validate_period_close_fn();`,
  },
];

const ROADMAP_PHASES: RoadmapPhase[] = [
  {
    phase: 'Fase 1',
    months: 'Meses 1–3',
    title: 'SQL Foundation & Hash v2',
    color: '#10b981',
    milestones: [
      'Vista materializada mv_trial_balance con REFRESH CONCURRENTLY',
      'Procedimiento CPP para inventario kardex',
      'Trigger de cierre de periodo con validaciones DB',
      'Hash v2: row_hash + block_hash estilo Merkle',
      'Índices compuestos en journal_entries / journal_lines',
      'Celery Beat: refresh automático post-cierre de periodo',
    ],
    tech: ['PostgreSQL 14', 'Alembic 011', 'pgcrypto', 'Celery Beat'],
  },
  {
    phase: 'Fase 2',
    months: 'Meses 4–6',
    title: 'Bounded Contexts & CQRS',
    color: '#3b82f6',
    milestones: [
      'Ledger BC en módulo Python aislado con interfaz pública',
      'Inventario BC con event sourcing propio (Kafka/Redis Streams)',
      'CQRS completo: write DB PostgreSQL + read replica para reportes',
      'API Gateway con routing por Bounded Context',
      'Event bus entre contextos (contrato de eventos tipados)',
      'Contract tests entre BCs con pact-python',
    ],
    tech: ['FastAPI Routers v2', 'Redis Streams', 'SQLAlchemy async', 'Pydantic v2'],
  },
  {
    phase: 'Fase 3',
    months: 'Meses 7–9',
    title: 'AI Reasoning Engine v2',
    color: '#8b5cf6',
    milestones: [
      'Motor de razonamiento multi-paso con árbol 3D (Patrimonial/Resultados/Control)',
      'RAG v2: ventanas de contexto por empresa y ejercicio fiscal',
      'Detección de anomalías con ML (isolation forest, scikit-learn)',
      'Pre-cierre predictivo: probabilidad de error antes de cerrar',
      'Copiloto con memoria de conversación por sesión',
      'Agente SUNAT autónomo: CDR + SIRE + PLE sin intervención manual',
    ],
    tech: ['Gemini 2.0 Flash', 'pgvector v0.7', 'scikit-learn', 'Claude claude-haiku-4-5-20251001'],
  },
];

// ─── Styles (dark theme matching the app) ────────────────────────────────────

const S = {
  container: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    background: '#050d1a',
    overflow: 'hidden',
  },
  header: {
    padding: '18px 24px 0',
    borderBottom: '1px solid #1e3a5f',
  },
  headerTitle: {
    margin: 0,
    color: '#e8f0fe',
    fontSize: 18,
    fontWeight: 800,
    fontFamily: "'Segoe UI', Arial, sans-serif",
  },
  headerSub: {
    margin: '4px 0 14px',
    color: '#4d7a9e',
    fontSize: 12,
    fontFamily: "'Segoe UI', Arial, sans-serif",
  },
  tabBar: {
    display: 'flex',
    gap: 4,
    padding: '0 0 0 0',
  },
  content: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto' as const,
    padding: '20px 24px',
  },
};

const tabBtn = (active: boolean, color: string): React.CSSProperties => ({
  padding: '8px 16px',
  background: active ? `rgba(${hexToRgb(color)},0.15)` : 'transparent',
  border: `1px solid ${active ? color : 'transparent'}`,
  borderBottom: active ? `2px solid ${color}` : '1px solid transparent',
  borderRadius: '6px 6px 0 0',
  color: active ? color : '#6e93b8',
  fontSize: 13,
  fontWeight: active ? 700 : 400,
  cursor: 'pointer',
  fontFamily: "'Segoe UI', Arial, sans-serif",
  transition: 'all 0.15s',
  whiteSpace: 'nowrap' as const,
});

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

// ─── Tab renderers ────────────────────────────────────────────────────────────

function ArquitecturaTab() {
  const [selected, setSelected] = useState<ArchChip | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <p style={{ margin: '0 0 12px', color: '#4d7a9e', fontSize: 12, fontFamily: "'Segoe UI',Arial,sans-serif" }}>
        5 capas — haz clic en cualquier chip para profundizar en ese componente.
      </p>

      {ARCH_LAYERS.map((layer) => (
        <div key={layer.id} style={{ background: layer.bg, border: `1px solid ${layer.color}33`, borderRadius: 10, padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 4, height: 20, background: layer.color, borderRadius: 2 }} />
            <span style={{ color: layer.color, fontSize: 13, fontWeight: 700, fontFamily: "'Segoe UI',Arial,sans-serif", letterSpacing: '0.04em' }}>
              {layer.name}
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
            {layer.components.map((chip) => {
              const isSelected = selected?.id === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setSelected(isSelected ? null : chip)}
                  style={{
                    padding: '5px 12px',
                    background: isSelected ? `rgba(${hexToRgb(layer.color)},0.25)` : `rgba(${hexToRgb(layer.color)},0.08)`,
                    border: `1px solid ${isSelected ? layer.color : `${layer.color}55`}`,
                    borderRadius: 20,
                    color: isSelected ? '#e8f0fe' : layer.color,
                    fontSize: 12,
                    fontWeight: isSelected ? 700 : 400,
                    cursor: 'pointer',
                    fontFamily: "'Segoe UI',Arial,sans-serif",
                    transition: 'all 0.15s',
                  }}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {selected && layer.components.some((c) => c.id === selected.id) && (
            <div style={{ marginTop: 12, background: 'rgba(0,0,0,0.3)', border: `1px solid ${layer.color}44`, borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ color: layer.color, fontSize: 11, fontWeight: 700, fontFamily: "'Segoe UI',Arial,sans-serif", marginBottom: 4 }}>
                {selected.label}
              </div>
              <div style={{ color: '#94a3b8', fontSize: 12, fontFamily: "'Segoe UI',Arial,sans-serif", lineHeight: 1.6, marginBottom: 6 }}>
                {selected.detail}
              </div>
              <div style={{ color: '#3b82f6', fontSize: 11, fontFamily: "'Courier New',monospace" }}>
                📄 {selected.file}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function BoundedContextsTab() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div>
      <p style={{ margin: '0 0 16px', color: '#4d7a9e', fontSize: 12, fontFamily: "'Segoe UI',Arial,sans-serif" }}>
        4 contextos DDD — haz clic en cada tarjeta para ver entidades y reglas de dominio internas.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {BOUNDED_CONTEXTS.map((ctx) => {
          const isOpen = selected === ctx.id;
          return (
            <div
              key={ctx.id}
              style={{
                background: isOpen ? `rgba(${hexToRgb(ctx.color)},0.12)` : 'rgba(11,21,37,0.8)',
                border: `1px solid ${isOpen ? ctx.color : '#1e3a5f'}`,
                borderRadius: 12,
                padding: '16px 18px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onClick={() => setSelected(isOpen ? null : ctx.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: isOpen ? 14 : 0 }}>
                <span style={{ fontSize: 20 }}>{ctx.emoji}</span>
                <span style={{ color: ctx.color, fontWeight: 800, fontSize: 14, fontFamily: "'Segoe UI',Arial,sans-serif" }}>{ctx.name}</span>
                <span style={{ marginLeft: 'auto', color: '#4d7a9e', fontSize: 16 }}>{isOpen ? '▲' : '▼'}</span>
              </div>

              {!isOpen && (
                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap' as const, gap: 4 }}>
                  {ctx.entities.slice(0, 3).map((e) => (
                    <span key={e} style={{ padding: '2px 8px', background: `rgba(${hexToRgb(ctx.color)},0.1)`, borderRadius: 10, color: ctx.color, fontSize: 10, fontFamily: "'Segoe UI',Arial,sans-serif" }}>
                      {e.split(' ')[0]}
                    </span>
                  ))}
                  <span style={{ padding: '2px 8px', color: '#4d7a9e', fontSize: 10, fontFamily: "'Segoe UI',Arial,sans-serif" }}>
                    +{ctx.entities.length - 3} más
                  </span>
                </div>
              )}

              {isOpen && (
                <>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ color: '#6e93b8', fontSize: 10, fontWeight: 700, fontFamily: "'Segoe UI',Arial,sans-serif", textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                      Entidades
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {ctx.entities.map((e) => (
                        <span key={e} style={{ color: '#94a3b8', fontSize: 12, fontFamily: "'Segoe UI',Arial,sans-serif" }}>
                          • {e}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <div style={{ color: '#6e93b8', fontSize: 10, fontWeight: 700, fontFamily: "'Segoe UI',Arial,sans-serif", textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                      Reglas de dominio
                    </div>
                    {ctx.rules.map((r) => (
                      <div key={r} style={{ color: '#cbd5e1', fontSize: 12, fontFamily: "'Segoe UI',Arial,sans-serif", lineHeight: 1.6 }}>
                        ✓ {r}
                      </div>
                    ))}
                  </div>

                  <div>
                    <div style={{ color: '#6e93b8', fontSize: 10, fontWeight: 700, fontFamily: "'Segoe UI',Arial,sans-serif", textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                      Domain Events
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
                      {ctx.events.map((ev) => (
                        <span key={ev} style={{ padding: '3px 10px', background: `rgba(${hexToRgb(ctx.color)},0.15)`, border: `1px solid ${ctx.color}44`, borderRadius: 12, color: ctx.color, fontSize: 11, fontFamily: "'Segoe UI',Arial,sans-serif" }}>
                          {ev}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MotorIATab() {
  const [selectedStep, setSelectedStep] = useState<string | null>(null);

  const step = AI_PIPELINE.find((s) => s.id === selectedStep);

  return (
    <div>
      <p style={{ margin: '0 0 16px', color: '#4d7a9e', fontSize: 12, fontFamily: "'Segoe UI',Arial,sans-serif" }}>
        Pipeline de razonamiento multi-paso — haz clic en cada etapa para ver el detalle.
      </p>

      {/* Pipeline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 16, overflowX: 'auto' as const, paddingBottom: 8 }}>
        {AI_PIPELINE.map((s, i) => (
          <React.Fragment key={s.id}>
            <button
              type="button"
              onClick={() => setSelectedStep(selectedStep === s.id ? null : s.id)}
              style={{
                minWidth: 90,
                padding: '10px 14px',
                background: selectedStep === s.id ? `rgba(${hexToRgb(s.color)},0.25)` : `rgba(${hexToRgb(s.color)},0.1)`,
                border: `1px solid ${selectedStep === s.id ? s.color : `${s.color}55`}`,
                borderRadius: 10,
                color: selectedStep === s.id ? '#e8f0fe' : s.color,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'pre' as const,
                lineHeight: 1.4,
                textAlign: 'center' as const,
                fontFamily: "'Segoe UI',Arial,sans-serif",
                transition: 'all 0.15s',
              }}
            >
              {s.label}
            </button>
            {i < AI_PIPELINE.length - 1 && (
              <div style={{ color: '#1e3a5f', fontSize: 20, padding: '0 4px', flexShrink: 0 }}>→</div>
            )}
          </React.Fragment>
        ))}
      </div>

      {step && (
        <div style={{ background: `rgba(${hexToRgb(step.color)},0.08)`, border: `1px solid ${step.color}44`, borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
          <div style={{ color: step.color, fontSize: 13, fontWeight: 700, fontFamily: "'Segoe UI',Arial,sans-serif", marginBottom: 6 }}>{step.label.replace('\n', ' ')}</div>
          <div style={{ color: '#94a3b8', fontSize: 13, fontFamily: "'Segoe UI',Arial,sans-serif", lineHeight: 1.7 }}>{step.detail}</div>
        </div>
      )}

      {/* 3-dimension decision tree */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ color: '#6e93b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'Segoe UI',Arial,sans-serif", marginBottom: 10 }}>
          Árbol de decisión — 3 dimensiones
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {DECISION_DIMS.map((dim) => (
            <div key={dim.id} style={{ background: `rgba(${hexToRgb(dim.color)},0.07)`, border: `1px solid ${dim.color}33`, borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ color: dim.color, fontSize: 12, fontWeight: 700, fontFamily: "'Segoe UI',Arial,sans-serif", marginBottom: 8 }}>{dim.label}</div>
              {dim.items.map((item) => (
                <div key={item} style={{ color: '#94a3b8', fontSize: 11, fontFamily: "'Segoe UI',Arial,sans-serif", lineHeight: 1.8 }}>• {item}</div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Golden rule */}
      <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>⚖️</span>
        <div>
          <div style={{ color: '#f59e0b', fontSize: 12, fontWeight: 700, fontFamily: "'Segoe UI',Arial,sans-serif", marginBottom: 4 }}>Regla de oro — Ajuste por redondeo</div>
          <div style={{ color: '#94a3b8', fontSize: 12, fontFamily: "'Segoe UI',Arial,sans-serif", lineHeight: 1.6 }}>
            Cuando <code style={{ color: '#f59e0b' }}>|∑debe − ∑haber| ≤ VARIANCE_TOLERANCE (0.05)</code>, el motor ajusta
            automáticamente la última línea del asiento al tipo de cuenta más probable (Diferencia de cambio o Redondeo).
            Si la diferencia supera el umbral, se marca <code style={{ color: '#ef4444' }}>DESCUADRADO</code> y se bloquea el posting.
          </div>
        </div>
      </div>
    </div>
  );
}

function SqlTab() {
  const [openId, setOpenId] = useState<string | null>('matview');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ margin: '0 0 4px', color: '#4d7a9e', fontSize: 12, fontFamily: "'Segoe UI',Arial,sans-serif" }}>
        4 componentes de base de datos — haz clic en cada sección para ver el SQL real.
      </p>
      {SQL_SNIPPETS.map((snip) => {
        const isOpen = openId === snip.id;
        return (
          <div key={snip.id} style={{ border: `1px solid ${isOpen ? snip.color : '#1e3a5f'}`, borderRadius: 10, overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : snip.id)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: isOpen ? `rgba(${hexToRgb(snip.color)},0.1)` : 'rgba(11,21,37,0.8)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                textAlign: 'left' as const,
              }}
            >
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: snip.color, flexShrink: 0 }} />
              <span style={{ color: isOpen ? '#e8f0fe' : '#94a3b8', fontSize: 13, fontWeight: 700, fontFamily: "'Segoe UI',Arial,sans-serif", flex: 1 }}>
                {snip.title}
              </span>
              <span style={{ color: '#4d7a9e', fontSize: 14 }}>{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
              <pre style={{
                margin: 0,
                padding: '16px 20px',
                background: '#020810',
                color: '#94a3b8',
                fontSize: 12,
                fontFamily: "'Courier New', Consolas, monospace",
                lineHeight: 1.65,
                overflowX: 'auto' as const,
                borderTop: `1px solid ${snip.color}33`,
              }}>
                <code style={{ color: '#cbd5e1' }}>{snip.code}</code>
              </pre>
            )}
          </div>
        );
      })}
    </div>
  );
}

function RoadmapTab() {
  return (
    <div>
      <p style={{ margin: '0 0 16px', color: '#4d7a9e', fontSize: 12, fontFamily: "'Segoe UI',Arial,sans-serif" }}>
        3 fases de 3 meses cada una — con hitos claros y tecnologías involucradas.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {ROADMAP_PHASES.map((phase, idx) => (
          <div key={phase.phase} style={{ background: 'rgba(11,21,37,0.8)', border: `1px solid ${phase.color}44`, borderRadius: 12, overflow: 'hidden' }}>
            {/* Phase header */}
            <div style={{ background: `rgba(${hexToRgb(phase.color)},0.12)`, borderBottom: `1px solid ${phase.color}33`, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: `rgba(${hexToRgb(phase.color)},0.2)`, border: `2px solid ${phase.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: phase.color, fontWeight: 800, fontSize: 14, flexShrink: 0, fontFamily: "'Segoe UI',Arial,sans-serif" }}>
                {idx + 1}
              </div>
              <div>
                <div style={{ color: phase.color, fontSize: 14, fontWeight: 800, fontFamily: "'Segoe UI',Arial,sans-serif" }}>{phase.phase} — {phase.title}</div>
                <div style={{ color: '#4d7a9e', fontSize: 11, fontFamily: "'Segoe UI',Arial,sans-serif", marginTop: 2 }}>{phase.months}</div>
              </div>
            </div>

            <div style={{ padding: '14px 18px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start' }}>
              {/* Milestones */}
              <div>
                <div style={{ color: '#6e93b8', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'Segoe UI',Arial,sans-serif", marginBottom: 8 }}>
                  Hitos
                </div>
                {phase.milestones.map((m) => (
                  <div key={m} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'flex-start' }}>
                    <span style={{ color: phase.color, fontSize: 12, flexShrink: 0, marginTop: 1 }}>◆</span>
                    <span style={{ color: '#cbd5e1', fontSize: 12, fontFamily: "'Segoe UI',Arial,sans-serif", lineHeight: 1.5 }}>{m}</span>
                  </div>
                ))}
              </div>

              {/* Tech stack */}
              <div style={{ minWidth: 140 }}>
                <div style={{ color: '#6e93b8', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'Segoe UI',Arial,sans-serif", marginBottom: 8 }}>
                  Stack
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {phase.tech.map((t) => (
                    <span key={t} style={{ padding: '3px 10px', background: `rgba(${hexToRgb(phase.color)},0.1)`, border: `1px solid ${phase.color}33`, borderRadius: 6, color: phase.color, fontSize: 11, fontFamily: "'Segoe UI',Arial,sans-serif", textAlign: 'center' as const }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Timeline bar */}
      <div style={{ marginTop: 20, padding: '14px 18px', background: 'rgba(30,58,95,0.15)', border: '1px solid #1e3a5f', borderRadius: 10 }}>
        <div style={{ color: '#6e93b8', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'Segoe UI',Arial,sans-serif", marginBottom: 10 }}>
          Timeline (9 meses)
        </div>
        <div style={{ display: 'flex', gap: 3 }}>
          {ROADMAP_PHASES.map((phase) => (
            <div key={phase.phase} style={{ flex: 1, height: 8, background: phase.color, borderRadius: 4, opacity: 0.8 }} />
          ))}
        </div>
        <div style={{ display: 'flex', marginTop: 6 }}>
          {ROADMAP_PHASES.map((phase) => (
            <div key={phase.phase} style={{ flex: 1, color: phase.color, fontSize: 10, fontFamily: "'Segoe UI',Arial,sans-serif", textAlign: 'center' as const }}>
              {phase.months}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const TAB_COLORS: Record<TabId, string> = {
  arquitectura: '#8b5cf6',
  bounded:      '#3b82f6',
  motor_ia:     '#f59e0b',
  sql:          '#10b981',
  roadmap:      '#06b6d4',
};

export const ArchitectureExplorer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('arquitectura');

  return (
    <div style={S.container}>
      <div style={S.header}>
        <h2 style={S.headerTitle}>Dev Center — Architecture Explorer</h2>
        <p style={S.headerSub}>
          Propuesta de evolución de la plataforma CONTA_PRO Enterprise · Puntos de partida: <code style={{ color: '#38bdf8', fontSize: 11 }}>build_uow_factory</code>, <code style={{ color: '#38bdf8', fontSize: 11 }}>row_hash</code>, <code style={{ color: '#38bdf8', fontSize: 11 }}>previous_hash</code>
        </p>

        <div style={S.tabBar}>
          {TABS.map((tab) => {
            const color = TAB_COLORS[tab.id];
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={tabBtn(activeTab === tab.id, color)}
              >
                {tab.emoji} {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={S.content}>
        {activeTab === 'arquitectura' && <ArquitecturaTab />}
        {activeTab === 'bounded'      && <BoundedContextsTab />}
        {activeTab === 'motor_ia'     && <MotorIATab />}
        {activeTab === 'sql'          && <SqlTab />}
        {activeTab === 'roadmap'      && <RoadmapTab />}
      </div>
    </div>
  );
};

export default ArchitectureExplorer;
