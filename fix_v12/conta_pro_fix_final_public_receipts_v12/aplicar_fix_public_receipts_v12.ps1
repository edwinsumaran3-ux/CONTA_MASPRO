$ErrorActionPreference = "Stop"
Write-Host "== CONTA_PRO FIX V12: recibos publicos sin observaciones falsas ==" -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path ".\backups_fix_public_receipts_v12" | Out-Null
Copy-Item ".\src\api\routes\purchases.py" ".\backups_fix_public_receipts_v12\purchases.py.bak" -Force
Copy-Item ".\fix_v12\conta_pro_fix_final_public_receipts_v12\purchases.py" ".\src\api\routes\purchases.py" -Force
Write-Host "OK: purchases.py reemplazado." -ForegroundColor Green
