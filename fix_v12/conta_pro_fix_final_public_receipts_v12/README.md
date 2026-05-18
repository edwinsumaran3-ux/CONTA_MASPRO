# CONTA_PRO Fix V12

Reemplaza purchases.py con modo RECIBO_PUBLICO_FLEXIBLE.

Uso:
```powershell
cd C:\Users\USUARIO\Downloads\CONTA_PRO_ENTERPRISE_MASTER
mkdir fix_v12 -Force
Expand-Archive "$env:USERPROFILE\Downloads\conta_pro_fix_final_public_receipts_v12.zip" ".\fix_v12" -Force
powershell -ExecutionPolicy Bypass -File ".\fix_v12\conta_pro_fix_final_public_receipts_v12\aplicar_fix_public_receipts_v12.ps1"
python -m uvicorn src.main:app --reload --host 127.0.0.1 --port 8000
```
