$ErrorActionPreference = "Stop"
Write-Host "== CONTA_PRO FIX V16: IA compras reguladas / servicios publicos ==" -ForegroundColor Cyan
Write-Host "Toca SOLO src/api/routes/purchases.py" -ForegroundColor Yellow
Write-Host "No toca ledger.py, frontend, CXP ni centros de costo de pasivos." -ForegroundColor Yellow

New-Item -ItemType Directory -Force -Path ".\backups_fix_v16_ia_compras" | Out-Null
Copy-Item ".\src\api\routes\purchases.py" ".\backups_fix_v16_ia_compras\purchases.py.bak" -Force

python ".\fix_v16\conta_pro_fix_ia_compras_reguladas_v16\patch_purchases_v16.py"

Write-Host "== FIX V16 aplicado ==" -ForegroundColor Green
Write-Host "Reinicia backend y reprocesa el recibo desde cero." -ForegroundColor Green
