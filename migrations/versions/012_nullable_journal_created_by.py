from alembic import op

revision = "012_nullable_journal_created_by"
down_revision = "011_advanced_sql_engine"
branch_labels = None
depends_on = None


def upgrade():
    # created_by era NOT NULL con FK a users en journal_entries, depreciation_runs, annual_closing_runs.
    # journal_lines NO tiene created_by — NO incluir en esta migración.
    # El usuario sistema (00000000-...) no existe en users → ForeignKeyViolationError al registrar compras.
    # Solución 1: created_by nullable — entradas de sistema no tienen usuario real en users.
    for table in ("journal_entries", "depreciation_runs", "annual_closing_runs"):
        op.execute(f"ALTER TABLE {table} ALTER COLUMN created_by DROP NOT NULL")
    # Solución 2: eliminar FK constraint — created_by es auditoría interna, no necesita FK a users.
    for table in ("journal_entries", "depreciation_runs", "annual_closing_runs"):
        op.execute(
            f"ALTER TABLE {table} DROP CONSTRAINT IF EXISTS {table}_created_by_fkey"
        )


def downgrade():
    for table in ("journal_entries", "depreciation_runs", "annual_closing_runs"):
        op.execute(f"ALTER TABLE {table} ALTER COLUMN created_by SET NOT NULL")
