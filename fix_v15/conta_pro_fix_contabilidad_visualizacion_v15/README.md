# CONTA_PRO FIX V15 - Cargar y visualizar contabilidad

Analisis de raiz del chat de hoy:

1. El error que impedia visualizar contabilidad no era Gemini ni el recibo.
   Era el Libro Diario:
   - period_id es UUID.
   - El codigo lo trataba como texto YYYY-MM o hacia LIKE.
   - Resultado: error PostgreSQL `uuid ~~ uuid` o validacion Pydantic `period UUID no es string`.

2. Al guardar compra, el frontend cerraba el panel antes de refrescar Libro Diario.
   Si `loadJournal` fallaba, la compra parecia fallida y la tabla desaparecia.

3. Este fix NO toca:
   - purchases.py
   - PurchaseFormEnterprise.tsx
   - CXP
   - IGV
   - reglas de recibos
   - centros de costo

Archivos corregidos:
- src/api/routes/ledger.py
- src/features/accounting/EnterpriseWorkspace.tsx

Instalar:

```powershell
cd C:\Users\USUARIO\Downloads\CONTA_PRO_ENTERPRISE_MASTER
mkdir fix_v15 -Force
Expand-Archive "$env:USERPROFILE\Downloads\conta_pro_fix_contabilidad_visualizacion_v15.zip" ".\fix_v15" -Force
powershell -ExecutionPolicy Bypass -File ".\fix_v15\conta_pro_fix_contabilidad_visualizacion_v15\aplicar_fix_contabilidad_visualizacion_v15.ps1"
```

Reiniciar:

```powershell
python -m uvicorn src.main:app --reload --host 127.0.0.1 --port 8000
```

En otra terminal:

```powershell
npm run dev
```
