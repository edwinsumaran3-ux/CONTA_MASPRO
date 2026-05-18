$ErrorActionPreference = "Stop"
Write-Host "== CONTA_PRO: aplicar SaleFormEnterprise corregido ==" -ForegroundColor Cyan
Write-Host "Toca SOLO src/features/accounting/SaleFormEnterprise.tsx" -ForegroundColor Yellow

python ".\sale_form_enterprise_corregido_usuario\aplicar_sale_form_enterprise_corregido.py"

Write-Host "== Terminado. Ejecuta npm run dev para validar. ==" -ForegroundColor Green
