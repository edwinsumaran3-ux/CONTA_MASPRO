from alembic import op
from sqlalchemy import text

revision = "007_hr_payroll_tables"
down_revision = "006_hr_worker_extra_fields"
branch_labels = None
depends_on = None


def _run_sql_file(path: str) -> None:
    sql = open(path, encoding="utf-8").read()
    for stmt in sql.split(";"):
        stmt = stmt.strip()
        if stmt:
            op.execute(text(stmt))


def upgrade():
    _run_sql_file("sql/007_hr_payroll_tables.sql")


def downgrade():
    op.execute("DROP TABLE IF EXISTS provisiones_sociales CASCADE")
    op.execute("DROP TABLE IF EXISTS detalle_asiento CASCADE")
    op.execute("DROP TABLE IF EXISTS libro_diario CASCADE")
    op.execute("ALTER TABLE hr_workers DROP COLUMN IF EXISTS ruta_cv_pdf")
    op.execute("ALTER TABLE hr_workers DROP COLUMN IF EXISTS estado_laboral")
    op.execute("ALTER TABLE hr_workers DROP COLUMN IF EXISTS tipo_seguro")
    op.execute("ALTER TABLE hr_workers DROP COLUMN IF EXISTS cci")
    op.execute("ALTER TABLE hr_workers DROP COLUMN IF EXISTS cuenta_bancaria")
