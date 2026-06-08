from alembic import op
from sqlalchemy import text

revision = "003_inventory_kardex_core"
down_revision = "002_enterprise_expansion"
branch_labels = None
depends_on = None


def _run_sql_file(path: str) -> None:
    sql = open(path, encoding="utf-8").read()
    for stmt in sql.split(";"):
        stmt = stmt.strip()
        if stmt:
            op.execute(text(stmt))


def upgrade():
    _run_sql_file("sql/004_inventory_kardex_core.sql")


def downgrade():
    op.execute("DROP TABLE IF EXISTS inventory_balances CASCADE")
    op.execute("DROP TABLE IF EXISTS kardex_movements CASCADE")
    op.execute("DROP TABLE IF EXISTS warehouses CASCADE")
    op.execute("DROP TABLE IF EXISTS products CASCADE")
