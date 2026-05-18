# CONTA_PRO FIX V16 - IA compras reguladas

Este fix aplica solo a:

- src/api/routes/purchases.py

No toca:
- ledger.py
- EnterpriseWorkspace.tsx
- PurchaseFormEnterprise.tsx
- CXP
- centros de costo de pasivos
- frontend

Mejoras tomadas del chat de hoy:

1. Lectura primero, criterio despues.
   La IA debe leer los importes impresos y luego clasificar.

2. Recibos publicos/regulados.
   Para electricidad, agua, saneamiento, telecom, municipalidad/gobierno:
   - total impreso manda
   - subcuentas correctas
   - centro de costo solo en gastos/costos
   - no bloqueo por alertas OCR ya corregidas si el asiento cuadra

3. Hidrandina / electricidad.
   - cargo fijo, reposicion/mantenimiento, energia activa y alumbrado publico forman SUB TOTAL si aparecen antes de la linea SUB TOTAL.
   - IGV se calcula/valida contra SUB TOTAL visible.
   - Aporte Ley 28749 es cargo regulado no afecto.
   - FOSE/FISE posterior al total puede ser INFO_ONLY si el total cuadra sin sumarlo.
   - no crear ajuste falso si ya existe redondeo explicito.

4. Limpieza.
   - IGV no entra como item del detalle; va a 40111.
   - Ajuste OCR falso se elimina si ya hay redondeo explicito.
   - INFO_ONLY no se contabiliza.

Instalar:

```powershell
cd C:\Users\USUARIO\Downloads\CONTA_PRO_ENTERPRISE_MASTER
mkdir fix_v16 -Force
Expand-Archive "$env:USERPROFILE\Downloads\conta_pro_fix_ia_compras_reguladas_v16.zip" ".\fix_v16" -Force
powershell -ExecutionPolicy Bypass -File ".\fix_v16\conta_pro_fix_ia_compras_reguladas_v16\aplicar_fix_ia_compras_reguladas_v16.ps1"
```

Reiniciar:

```powershell
python -m uvicorn src.main:app --reload --host 127.0.0.1 --port 8000
```
