# CONTA_PRO Fix V8 - Conciliacion final de compras IA

Corrige el error:
Compra descuadrada: Debe 63.91 != Haber 64.60

Causa:
El frontend/IA muestra subcuentas reguladas, pero el backend recibe account_lines con una diferencia menor. Esa diferencia NO debe llamarse redondeo si es mayor a centimos: se registra como cargo regulado/concepto OCR no identificado segun sector.

Uso:

```powershell
cd C:\Users\USUARIO\Downloads\CONTA_PRO_ENTERPRISE_MASTER
mkdir fix_v8 -Force
Expand-Archive "$env:USERPROFILE\Downloads\conta_pro_fix_purchase_reconcile_v8.zip" ".\fix_v8" -Force
python ".\fix_v8\conta_pro_fix_purchase_reconcile_v8\aplicar_fix_purchase_reconcile_v8.py"
```

Reinicia backend:

```powershell
python -m uvicorn src.main:app --reload --host 127.0.0.1 --port 8000
```
