# CONTA_PRO Fix V6 - Lineas del Libro Diario

Corrige que Contabilidad muestre Cuenta N/A / CC N/A por falta de `lines` en la respuesta.

Uso:

```powershell
cd C:\Users\USUARIO\Downloads\CONTA_PRO_ENTERPRISE_MASTER
mkdir fix_v6 -Force
Expand-Archive "$env:USERPROFILE\Downloads\conta_pro_fix_ledger_lines_v6.zip" ".\fix_v6" -Force
powershell -ExecutionPolicy Bypass -File ".\fix_v6\conta_pro_fix_ledger_lines_v6\aplicar_fix_ledger_lines_v6.ps1"
```

Reinicia backend y frontend:

```powershell
python -m uvicorn src.main:app --reload --host 127.0.0.1 --port 8000
npm run dev
```
