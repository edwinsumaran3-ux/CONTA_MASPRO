
# CONTA_PRO - Fix V6: mostrar lineas reales del asiento en Libro Diario
$ErrorActionPreference = "Stop"
Write-Host "== CONTA_PRO FIX V6: ledger lines / detalle analitico ==" -ForegroundColor Cyan

New-Item -ItemType Directory -Force -Path ".\backups_fix_ledger_lines_v6" | Out-Null

Copy-Item ".\src\api\routes\ledger.py" ".\backups_fix_ledger_lines_v6\ledger.py.bak" -Force
Copy-Item ".\src\application\dto\ledger.py" ".\backups_fix_ledger_lines_v6\ledger_dto.py.bak" -Force
Copy-Item ".\src\features\accounting\EnterpriseWorkspace.tsx" ".\backups_fix_ledger_lines_v6\EnterpriseWorkspace.tsx.bak" -Force

@'
from pathlib import Path
import re

path = Path("src/application/dto/ledger.py")
text = path.read_text(encoding="utf-8")

if "class JournalLineResponse" not in text:
    marker = "from pydantic import BaseModel, Field\n"
    model = """
class JournalLineResponse(BaseModel):
    id: str | None = None
    account_code: str | None = None
    account_name: str | None = None
    cost_center: str | None = None
    debit: str = "0.00"
    credit: str = "0.00"
    partner_ruc: str | None = None
    document_type: str | None = None
    document_series: str | None = None
    document_number: str | None = None

"""
    if marker in text:
        text = text.replace(marker, marker + model, 1)
    else:
        text = model + text

def inject(class_name: str, fields: str):
    global text
    m = re.search(rf"class {class_name}\\(BaseModel\\):\\n", text)
    if not m:
        print(f"AVISO: no encontre {class_name}")
        return
    start = m.end()
    n = re.search(r"\\nclass\\s+\\w+\\(BaseModel\\):", text[start:])
    end = start + n.start() if n else len(text)
    block = text[start:end]
    if "lines:" not in block:
        text = text[:end] + fields + text[end:]

inject("JournalEntryResponse", """
    lines: list[JournalLineResponse] = Field(default_factory=list)
""")

inject("JournalEntryListItem", """
    account_code: str | None = None
    account_name: str | None = None
    cost_center: str | None = None
    lines: list[JournalLineResponse] = Field(default_factory=list)
""")

path.write_text(text, encoding="utf-8")
print("OK dto/ledger.py: modelos aceptan lines.")
'@ | python

@'
from pathlib import Path

path = Path("src/api/routes/ledger.py")
text = path.read_text(encoding="utf-8")

if "from sqlalchemy.orm import selectinload" not in text:
    text = text.replace("from reportlab.lib.styles import getSampleStyleSheet", "from reportlab.lib.styles import getSampleStyleSheet\nfrom sqlalchemy.orm import selectinload")
if "from sqlalchemy import and_, select, desc" not in text:
    text = text.replace("from sqlalchemy import and_, select", "from sqlalchemy import and_, select, desc")

start = text.find('@router.get("/journal", response_model=list[JournalEntryListItem])')
if start == -1:
    raise SystemExit("No encontre endpoint list_journal.")
end = text.find('\n\n@router.get("/documents/lookup")', start)
if end == -1:
    raise SystemExit("No encontre fin de list_journal.")

new_func = """@router.get("/journal", response_model=list[JournalEntryListItem])
async def list_journal(year: int | None = None, month: int | None = None, limit: int = 100, offset: int = 0, ctx=Depends(get_current_context)):
    async with build_uow_factory()(ctx["tenant_id"]) as uow:
        stmt = (
            select(JournalEntry)
            .options(selectinload(JournalEntry.lines))
            .where(JournalEntry.tenant_id == ctx["tenant_id"])
            .order_by(desc(JournalEntry.entry_date), desc(JournalEntry.created_at))
            .offset(offset)
            .limit(limit)
        )

        if year is not None:
            stmt = stmt.where(JournalEntry.period_id.like(f"{year}-%"))
        if year is not None and month is not None:
            stmt = stmt.where(JournalEntry.period_id == f"{year}-{month:02d}")

        result = await uow.session.execute(stmt)
        entries = result.scalars().unique().all()

    response = []
    for entry in entries:
        lines = list(getattr(entry, "lines", []) or [])
        first_line = lines[0] if lines else None
        period_value = getattr(entry, "period_id", None) or (f"{year}-{month:02d}" if year and month else str(year or ""))

        response.append(
            JournalEntryListItem(
                id=str(entry.id),
                entry_date=entry.entry_date.isoformat(),
                period=period_value,
                description=entry.description,
                source_module=entry.source_module,
                currency=entry.currency,
                total_debit=str(entry.total_debit),
                total_credit=str(entry.total_credit),
                row_hash=entry.row_hash,
                previous_hash=entry.previous_hash,
                sunat_status=getattr(entry, "status", "POSTED"),
                account_code=None if first_line is None else first_line.account_code,
                account_name=None if first_line is None else first_line.account_name,
                cost_center=None if first_line is None else first_line.cost_center,
                lines=[
                    {
                        "id": str(line.id),
                        "account_code": line.account_code,
                        "account_name": line.account_name,
                        "cost_center": line.cost_center,
                        "debit": str(line.debit),
                        "credit": str(line.credit),
                        "partner_ruc": line.partner_ruc,
                        "document_type": line.document_type,
                        "document_series": line.document_series,
                        "document_number": line.document_number,
                    }
                    for line in lines
                ],
            )
        )
    return response
"""
text = text[:start] + new_func + text[end:]
path.write_text(text, encoding="utf-8")
print("OK routes/ledger.py: list_journal devuelve lines.")
'@ | python

@'
from pathlib import Path

path = Path("src/features/accounting/EnterpriseWorkspace.tsx")
text = path.read_text(encoding="utf-8")

old = """      return lines.map((line, lineIndex) => ({
        ...base,
        id: `${base.entryId}-${lineIndex}`,
        account: line.account_code || 'N/A',
        accountName: line.account_name || '',
        costCenter: line.cost_center || '-',
        debit: formatMoney(line.debit ?? '0.00'),
        credit: formatMoney(line.credit ?? '0.00'),
        partnerRuc: line.partner_ruc,
        documentType: line.document_type,
        documentSeries: line.document_series,
        documentNumber: line.document_number,
      }));"""

new = """      return lines.map((line, lineIndex) => ({
        ...base,
        id: `${base.entryId}-${lineIndex}`,
        account: line.account_code || item.account_code || 'N/A',
        accountName: line.account_name || item.account_name || '',
        costCenter: line.cost_center || item.cost_center || '-',
        debit: formatMoney(line.debit ?? '0.00'),
        credit: formatMoney(line.credit ?? '0.00'),
        partnerRuc: line.partner_ruc,
        documentType: line.document_type,
        documentSeries: line.document_series,
        documentNumber: line.document_number,
        lines,
      }));"""

if old in text:
    text = text.replace(old, new)

old2 = """    const resultRows = mapped.length ? mapped : seedRows;
    setRows(resultRows);
    setSelectedRow(resultRows[0]);"""
new2 = """    const resultRows = mapped.length ? mapped : seedRows;
    setRows(resultRows);
    setSelectedRow((current) => resultRows.find((row) => row.id === current?.id) || resultRows[0]);"""
if old2 in text:
    text = text.replace(old2, new2)

path.write_text(text, encoding="utf-8")
print("OK EnterpriseWorkspace.tsx: preparado para lines.")
'@ | python

Write-Host "== FIX V6 aplicado. Reinicia backend y frontend. ==" -ForegroundColor Green
