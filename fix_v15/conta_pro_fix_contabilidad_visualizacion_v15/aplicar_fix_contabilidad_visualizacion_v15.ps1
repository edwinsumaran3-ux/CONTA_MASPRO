
$ErrorActionPreference = "Stop"
Write-Host "== CONTA_PRO FIX V15: cargar y visualizar contabilidad ==" -ForegroundColor Cyan
Write-Host "No toca purchases.py ni PurchaseFormEnterprise.tsx." -ForegroundColor Yellow
Write-Host "Corrige solo Libro Diario y cierre del panel tras postear compra." -ForegroundColor Yellow

New-Item -ItemType Directory -Force -Path ".\backups_fix_v15_visualizacion" | Out-Null

Copy-Item ".\src\api\routes\ledger.py" ".\backups_fix_v15_visualizacion\ledger.py.bak" -Force
Copy-Item ".\src\features\accounting\EnterpriseWorkspace.tsx" ".\backups_fix_v15_visualizacion\EnterpriseWorkspace.tsx.bak" -Force

$py = @'
from pathlib import Path
import re
import ast

ledger_path = Path("src/api/routes/ledger.py")
text = ledger_path.read_text(encoding="utf-8")

if "from sqlalchemy import and_, select, desc" not in text:
    text = text.replace("from sqlalchemy import and_, select", "from sqlalchemy import and_, select, desc")
if "from sqlalchemy.orm import selectinload" not in text:
    if "from sqlalchemy import and_, select, desc\n" in text:
        text = text.replace("from sqlalchemy import and_, select, desc\n", "from sqlalchemy import and_, select, desc\nfrom sqlalchemy.orm import selectinload\n", 1)
    elif "from sqlalchemy import and_, select\n" in text:
        text = text.replace("from sqlalchemy import and_, select\n", "from sqlalchemy import and_, select, desc\nfrom sqlalchemy.orm import selectinload\n", 1)

pattern = re.compile(
    r'@router\.get\("/journal",\s*response_model=list\[JournalEntryListItem\]\)\s*'
    r'async def list_journal\(.*?\n(?=\n@router\.)',
    re.S,
)

new_func = """@router.get("/journal", response_model=list[JournalEntryListItem])
async def list_journal(
    year: int | None = None,
    month: int | None = None,
    limit: int = 100,
    offset: int = 0,
    ctx=Depends(get_current_context),
):
    \"\"\"Libro Diario para visualizacion contable.

    Correccion raiz:
    - period_id es UUID, no se debe comparar con 'YYYY-MM' ni usar LIKE.
    - El filtro de periodo se hace por JournalEntry.entry_date.
    - El campo response.period debe ser string 'YYYY-MM', no UUID.
    \"\"\"
    try:
        tenant_id = ctx["tenant_id"]
        async with build_uow_factory()(tenant_id) as uow:
            stmt = (
                select(JournalEntry)
                .options(selectinload(JournalEntry.lines))
                .where(JournalEntry.tenant_id == tenant_id)
                .order_by(desc(JournalEntry.entry_date), desc(JournalEntry.created_at))
                .offset(offset)
                .limit(limit)
            )

            if year is not None and month is not None:
                start_date = date(year, month, 1)
                end_date = date(year + 1, 1, 1) if month == 12 else date(year, month + 1, 1)
                stmt = stmt.where(JournalEntry.entry_date >= start_date, JournalEntry.entry_date < end_date)
            elif year is not None:
                start_date = date(year, 1, 1)
                end_date = date(year + 1, 1, 1)
                stmt = stmt.where(JournalEntry.entry_date >= start_date, JournalEntry.entry_date < end_date)

            result = await uow.session.execute(stmt)
            entries = result.scalars().unique().all()

        response: list[JournalEntryListItem] = []
        for entry in entries:
            lines = list(getattr(entry, "lines", []) or [])
            first_line = lines[0] if lines else None
            period_value = entry.entry_date.strftime("%Y-%m") if entry.entry_date else ""

            response.append(
                JournalEntryListItem(
                    id=str(entry.id),
                    entry_date=entry.entry_date.isoformat() if entry.entry_date else "",
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
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"No se pudo consultar libro diario: {exc}") from exc

"""

new_text, count = pattern.subn(new_func, text, count=1)
if count != 1:
    raise SystemExit("No encontre exactamente el endpoint @router.get('/journal') en ledger.py")

for required in ["build_hash_service", "build_uow_factory"]:
    if required not in new_text:
        raise SystemExit(f"ledger.py no contiene {required}; no aplico cambios para evitar romper importaciones.")

ast.parse(new_text)
ledger_path.write_text(new_text, encoding="utf-8")
print("OK ledger.py: /ledger/journal filtra por entry_date y devuelve period string.")


workspace_path = Path("src/features/accounting/EnterpriseWorkspace.tsx")
ws = workspace_path.read_text(encoding="utf-8")

old = """      setStatusMessage(`Compra ${formSource.serie}-${formSource.number} posteada con cuentas y centros de costo.`);
      setActivePanel(null);
      setToken(purchaseToken);
      await loadJournal(purchaseToken);
    } catch (error) {
"""
new = """      const postedMessage = `Compra ${formSource.serie}-${formSource.number} posteada con cuentas y centros de costo.`;
      setStatusMessage(postedMessage);
      setToken(purchaseToken);

      // CONTA_PRO FIX V15:
      // La compra ya fue posteada. Si falla refrescar el Libro Diario,
      // no convertirlo en error de compra ni cerrar la tabla.
      try {
        await loadJournal(purchaseToken);
        setActivePanel(null);
      } catch (journalError) {
        console.warn('CONTA_PRO loadJournal after purchase warning:', journalError);
        setStatusMessage(
          `${postedMessage} Pendiente refrescar Libro Diario: ${
            journalError instanceof Error ? journalError.message : 'error desconocido'
          }`
        );
      }
    } catch (error) {
"""

if old in ws:
    ws = ws.replace(old, new, 1)
else:
    if "loadJournal after purchase warning" not in ws:
        raise SystemExit("No encontre bloque postPurchase original en EnterpriseWorkspace.tsx; no aplique cambios.")

workspace_path.write_text(ws, encoding="utf-8")
print("OK EnterpriseWorkspace.tsx: no cierra panel por fallo de loadJournal.")
'@

$py | python

Write-Host "== FIX V15 aplicado ==" -ForegroundColor Green
Write-Host "Ahora reinicia backend y frontend." -ForegroundColor Green
