# Fix: compras duplicadas con corrección/auditoría por RUC

Este parche reemplaza:

src/application/services/ledger_posting_service.py

Corrige:
- UUID seguro para created_by/actor_user_id usando usuario sistema fijo.
- JSONB seguro para Decimal/date/datetime/UUID.
- Detección de comprobante de compra AP duplicado.
- Si el comprobante ya existe con diferencias de RUC/proveedor/fecha/importes, crea AuditLog:
  PURCHASE_CORRECTION_NOTE_REQUIRED
- Crea OutboxEvent:
  accounting.purchase.correction_required
- No duplica el documento.
- Si existe asiento vinculado, devuelve el asiento existente.
- Mantiene validación estricta Debe = Haber y centro de costo obligatorio para cuentas clase 6/9.

Instalación PowerShell desde la raíz del proyecto:

mkdir backups_correccion_ruc -Force
Copy-Item src\application\services\ledger_posting_service.py backups_correccion_ruc\ledger_posting_service.py.bak -Force
Copy-Item .\patch_correccion_ruc\src\application\services\ledger_posting_service.py .\src\application\services\ledger_posting_service.py -Force

Luego reiniciar backend:

python -m uvicorn src.main:app --reload --host 127.0.0.1 --port 8000
