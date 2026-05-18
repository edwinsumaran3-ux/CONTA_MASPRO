# CONTA_PRO Fix V11 - Redondeo explicito y FOSE informativo

Corrige el bloqueo de registro cuando el recibo ya tiene:
- Saldo por redondeo
- Diferencia de redondeo
- FOSE/FISE posterior al total
- Importes negativos

Uso:

```powershell
cd C:\Users\USUARIO\Downloads\CONTA_PRO_ENTERPRISE_MASTER
mkdir fix_v11 -Force
Expand-Archive "$env:USERPROFILE\Downloads\conta_pro_fix_redondeo_explicito_v11.zip" ".\fix_v11" -Force
powershell -ExecutionPolicy Bypass -File ".\fix_v11\conta_pro_fix_redondeo_explicito_v11\aplicar_fix_redondeo_explicito_v11.ps1"
```

Reinicia backend:

```powershell
python -m uvicorn src.main:app --reload --host 127.0.0.1 --port 8000
```
