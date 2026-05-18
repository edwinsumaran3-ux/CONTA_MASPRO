$ErrorActionPreference = "Stop"
Write-Host "== CONTA_PRO FIX V13: frontend no cierra modal + limpia payload viejo ==" -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path ".\backups_fix_frontend_v13" | Out-Null
Copy-Item ".\src\features\accounting\EnterpriseWorkspace.tsx" ".\backups_fix_frontend_v13\EnterpriseWorkspace.tsx.bak" -Force
Copy-Item ".\src\features\accounting\PurchaseFormEnterprise.tsx" ".\backups_fix_frontend_v13\PurchaseFormEnterprise.tsx.bak" -Force
Copy-Item ".\fix_v13\conta_pro_fix_frontend_no_close_v13\EnterpriseWorkspace.tsx" ".\src\features\accounting\EnterpriseWorkspace.tsx" -Force
Copy-Item ".\fix_v13\conta_pro_fix_frontend_no_close_v13\PurchaseFormEnterprise.tsx" ".\src\features\accounting\PurchaseFormEnterprise.tsx" -Force
Write-Host "OK: frontend corregido." -ForegroundColor Green
Write-Host "Reinicia frontend y backend. Cierra modal viejo y vuelve a subir recibo." -ForegroundColor Yellow
