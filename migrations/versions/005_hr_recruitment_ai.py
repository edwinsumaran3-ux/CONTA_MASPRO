from alembic import op
from sqlalchemy import text

revision = "005_hr_recruitment_ai"
down_revision = "004_rag_sunat_treasury_indexes"
branch_labels = None
depends_on = None


def _run_sql_file(path: str) -> None:
    sql = open(path, encoding="utf-8").read()
    for stmt in sql.split(";"):
        stmt = stmt.strip()
        if stmt:
            op.execute(text(stmt))


def upgrade():
    _run_sql_file("sql/005_hr_recruitment_ai.sql")


def downgrade():
    op.execute("DROP TABLE IF EXISTS hr_contracts CASCADE")
    op.execute("DROP TABLE IF EXISTS hr_workers CASCADE")
