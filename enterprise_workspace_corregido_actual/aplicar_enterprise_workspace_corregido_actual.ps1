$ErrorActionPreference = "Stop"
Write-Host "== CONTA_PRO: aplicar EnterpriseWorkspace corregido actual ==" -ForegroundColor Cyan
Write-Host "Toca SOLO src/features/accounting/EnterpriseWorkspace.tsx" -ForegroundColor Yellow

python ".\enterprise_workspace_corregido_actual\aplicar_enterprise_workspace_corregido_actual.py"

Write-Host "== Terminado. Ejecuta npm run dev para validar. ==" -ForegroundColor Green
