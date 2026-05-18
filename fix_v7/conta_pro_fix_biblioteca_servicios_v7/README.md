# CONTA_PRO Fix V7 - Biblioteca sectorial de servicios publicos

Corrige IA/OCR para recibos de:
- Luz/electricidad
- Agua/saneamiento
- Telecom/internet/telefonia
- Gas

Reglas clave:
- Aporte Ley, FOSE, FISE, Alumbrado Publico, MRSE, aportes, fondos y cargos regulados NO son redondeo.
- Redondeo solo si el texto dice redondeo/saldo por redondeo/diferencia por redondeo.
- Se agregan subcuentas 63610x, 63611x, 63612x, 63613x.
- Tolerancia de redondeo baja a 0.10.

Uso:

```powershell
cd C:\Users\USUARIO\Downloads\CONTA_PRO_ENTERPRISE_MASTER
mkdir fix_v7 -Force
Expand-Archive "$env:USERPROFILE\Downloads\conta_pro_fix_biblioteca_servicios_v7.zip" ".\fix_v7" -Force
python ".\fix_v7\conta_pro_fix_biblioteca_servicios_v7\aplicar_fix_biblioteca_servicios_v7.py"
```

Reiniciar:

```powershell
python -m uvicorn src.main:app --reload --host 127.0.0.1 --port 8000
npm run dev
```
