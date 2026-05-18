# CONTA_PRO FIX V10 - OCR visual recibos servicios
$ErrorActionPreference = "Stop"
Write-Host "== CONTA_PRO FIX V10: OCR visual por bloques ==" -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path ".\backups_fix_ocr_visual_v10" | Out-Null
Copy-Item ".\src\api\routes\purchases.py" ".\backups_fix_ocr_visual_v10\purchases.py.bak" -Force
Copy-Item ".\fix_v10\conta_pro_fix_ocr_visual_servicios_v10\purchases.py" ".\src\api\routes\purchases.py" -Force
Write-Host "OK: purchases.py reemplazado. Reinicia backend." -ForegroundColor Green
