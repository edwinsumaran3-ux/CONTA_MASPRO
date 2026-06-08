from alembic import op
from sqlalchemy import text

revision = "002_enterprise_expansion"
down_revision = "001_enterprise_core"
branch_labels = None
depends_on = None


def _run_sql_file(path: str) -> None:
    sql = open(path, encoding="utf-8").read()
    for stmt in sql.split(";"):
        stmt = stmt.strip()
        if stmt:
            op.execute(text(stmt))


def upgrade():
    _run_sql_file("sql/002_enterprise_expansion.sql")


def downgrade():
    op.execute("DROP TABLE IF EXISTS integration_messages CASCADE")
    op.execute("DROP TABLE IF EXISTS integration_connectors CASCADE")
    op.execute("DROP TABLE IF EXISTS sunat_submissions CASCADE")
    op.execute("DROP TABLE IF EXISTS tax_determinations CASCADE")
    op.execute("DROP TABLE IF EXISTS annual_closing_runs CASCADE")
    op.execute("DROP TABLE IF EXISTS provisions CASCADE")
    op.execute("DROP TABLE IF EXISTS depreciation_runs CASCADE")
    op.execute("DROP TABLE IF EXISTS fixed_assets CASCADE")
    op.execute("DROP TABLE IF EXISTS treasury_movements CASCADE")
    op.execute("DROP TABLE IF EXISTS treasury_accounts CASCADE")
    op.execute("DROP TABLE IF EXISTS financial_documents CASCADE")
    op.execute("DROP TABLE IF EXISTS business_partners CASCADE")
    op.execute("DROP TABLE IF EXISTS currency_rates CASCADE")
    op.execute("DROP TABLE IF EXISTS cost_centers CASCADE")
    op.execute("DROP TABLE IF EXISTS chart_accounts CASCADE")
    op.execute("DROP TABLE IF EXISTS companies CASCADE")
    op.execute("ALTER TABLE journal_lines DROP COLUMN IF EXISTS company_id")
    op.execute("ALTER TABLE journal_entries DROP COLUMN IF EXISTS company_id")
