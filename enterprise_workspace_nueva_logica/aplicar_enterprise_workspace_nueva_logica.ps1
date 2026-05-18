$ErrorActionPreference = "Stop"
Write-Host "== CONTA_PRO EnterpriseWorkspace nueva logica ==" -ForegroundColor Cyan
Write-Host "Toca SOLO src/features/accounting/EnterpriseWorkspace.tsx" -ForegroundColor Yellow

python ".\enterprise_workspace_nueva_logica\aplicar_enterprise_workspace_nueva_logica.py"

Write-Host "== Terminado. Ejecuta npm run dev para validar. ==" -ForegroundColor Green
