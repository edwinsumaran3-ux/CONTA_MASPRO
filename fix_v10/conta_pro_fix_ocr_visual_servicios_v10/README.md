# CONTA_PRO Fix V10 - OCR visual por bloques para recibos de servicios

Este fix reemplaza `src/api/routes/purchases.py` por una version corregida.

Corrige:
- Obliga FASE 1 de lectura visual del bloque IMPORTES FACTURADOS.
- Agrega raw_visual_lines al JSON esperado.
- Corrige errores OCR frecuentes: 88.88/89.88, 16.00/15.00, 0.04/0.54, -0.01.
- Toma SUB TOTAL e IGV impresos cuando existen.
- Trata FOSE/FISE posterior al TOTAL como INFO_ONLY si el total ya cuadra sin sumarlo.
- Evita contabilizar doble FOSE/FISE.

Uso en PowerShell:

```powershell
cd C:\Users\USUARIO\Downloads\CONTA_PRO_ENTERPRISE_MASTER
mkdir fix_v10 -Force
Expand-Archive "$env:USERPROFILE\Downloads\conta_pro_fix_ocr_visual_servicios_v10.zip" ".\fix_v10" -Force
powershell -ExecutionPolicy Bypass -File ".\fix_v10\conta_pro_fix_ocr_visual_servicios_v10\aplicar_fix_ocr_visual_servicios_v10.ps1"
```

Reiniciar backend:

```powershell
python -m uvicorn src.main:app --reload --host 127.0.0.1 --port 8000
```
