$ErrorActionPreference = "Stop"
Write-Host "== CONTA_PRO: reemplazo DIRECTO EnterpriseWorkspace ==" -ForegroundColor Cyan
Write-Host "Este script toca SOLO src/features/accounting/EnterpriseWorkspace.tsx" -ForegroundColor Yellow

$target = ".\src\features\accounting\EnterpriseWorkspace.tsx"
$source = ".\enterprise_workspace_emergencia_actual\EnterpriseWorkspace.tsx"

if (!(Test-Path $target)) {
    throw "No existe $target. Ejecuta desde la raiz del proyecto."
}
if (!(Test-Path $source)) {
    throw "No existe $source. Descomprime el ZIP en la raiz del proyecto."
}

New-Item -ItemType Directory -Force -Path ".\backups_enterprise_workspace_emergencia_actual" | Out-Null
Copy-Item $target ".\backups_enterprise_workspace_emergencia_actual\EnterpriseWorkspace.tsx.bak" -Force
Copy-Item $source $target -Force

Write-Host "OK: EnterpriseWorkspace.tsx reemplazado por version corregida." -ForegroundColor Green
Write-Host "Ahora ejecuta: npm run dev" -ForegroundColor Green
