from alembic import op

revision = "012_nullable_journal_created_by"
down_revision = "011_advanced_sql_engine"
branch_labels = None
depends_on = None


def upgrade():
    # created_by era NOT NULL con FK a users en varias tablas.
    # El usuario sistema (00000000-...) no existe en users → ForeignKeyViolationError al registrar compras.
    # Solución: created_by nullable — entradas de sistema no tienen usuario real en users.
    for table in ("journal_entries", "journal_lines", "depreciation_runs", "annual_closing_runs"):
        op.execute(f"ALTER TABLE {table} ALTER COLUMN created_by DROP NOT NULL")


def downgrade():
    for table in ("journal_entries", "journal_lines", "depreciation_runs", "annual_closing_runs"):
        op.execute(f"ALTER TABLE {table} ALTER COLUMN created_by SET NOT NULL")
