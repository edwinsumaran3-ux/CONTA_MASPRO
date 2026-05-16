# Parche CONTA_PRO IA Compras V3

Corrige:
- Redondeo monetario como línea técnica, no bloqueante si está dentro de tolerancia.
- Deuda anterior / saldo anterior como obligación previa, no gasto nuevo ni IGV nuevo.
- Pago a cuenta / abono / saldo a favor como compensación, no gasto.
- Mora / intereses / recargos separados del servicio principal.
- RUC proveedor: no confundir cliente, suministro, medidor, código de pago o recibo.
- Total del comprobante manda: el formulario usa total_read_from_document cuando la IA lo devuelve.
- El asiento usa account_lines de la IA cuando existen.

Instalación:
```powershell
cd C:\Users\USUARIO\Downloads\CONTA_PRO_ENTERPRISE_MASTER

mkdir backups_ia_criterio_v3 -Force
Copy-Item src\api\routes\purchases.py backups_ia_criterio_v3\purchases.py.bak -Force
Copy-Item src\features\accounting\PurchaseFormEnterprise.tsx backups_ia_criterio_v3\PurchaseFormEnterprise.tsx.bak -Force

mkdir patch_ia_criterio_v3 -Force
Expand-Archive "$env:USERPROFILE\Downloads\conta_pro_ia_criterio_redondeo_v3.zip" ".\patch_ia_criterio_v3" -Force

Copy-Item .\patch_ia_criterio_v3\src\api\routes\purchases.py .\src\api\routes\purchases.py -Force
Copy-Item .\patch_ia_criterio_v3\src\features\accounting\PurchaseFormEnterprise.tsx .\src\features\accounting\PurchaseFormEnterprise.tsx -Force
```

Reiniciar backend y frontend:
```powershell
python -m uvicorn src.main:app --reload --host 127.0.0.1 --port 8000
npm run dev
```
