# Patch IA Compras Enterprise V2

Reemplaza `src/api/routes/purchases.py`.

## Instalar

```powershell
cd C:\Users\USUARIO\Downloads\CONTA_PRO_ENTERPRISE_MASTER
mkdir backups_ia_compras_v2 -Force
Copy-Item src\api\routes\purchases.py backups_ia_compras_v2\purchases.py.bak -Force
Copy-Item .\patch_ia_compras_v2\src\api\routes\purchases.py .\src\api\routes\purchases.py -Force
```

Reinicia backend:

```powershell
python -m uvicorn src.main:app --reload --host 127.0.0.1 --port 8000
```

## Cambios

- Lectura estricta del RUC del proveedor/emisor.
- Evita confundir RUC del cliente, codigo de suministro, medidor, recibo o pago con proveedor.
- Exige supplier_name; si no se lee, warning.
- Reglas para deuda anterior, pago a cuenta, saldo a favor, mora, intereses, redondeo y servicios publicos.
- Total impreso manda.
- Devuelve estructura avanzada: items, account_lines, audit_metadata, warnings.
