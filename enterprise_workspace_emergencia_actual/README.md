# EnterpriseWorkspace emergencia actual

Este paquete reemplaza DIRECTAMENTE:
src/features/accounting/EnterpriseWorkspace.tsx

No ejecuta transformaciones peligrosas sobre el archivo. Copia el archivo corregido ya generado.

Arquitectura conservada:
- SaleFormEnterprise usa form/onFormChange/onSubmit.
- EnterpriseWorkspace conserva postSale.
- Compras conserva postPurchase.
- Planillas e inventario no se tocan.

Corrige los errores visibles:
- import duplicado SaleFormEnterprise.
- rows / selectedRow duplicados.
- loadJournal doble.
- resultRows doble.
- exportExcel doble.
- exportPdf doble.
- refreshJournal roto.
- JSX doble en detalle analitico.
- token prop sobrante en SaleFormEnterprise.
- SaleSubmitResult inexistente.

Aplicar desde la raiz del proyecto:
powershell -ExecutionPolicy Bypass -File ".\enterprise_workspace_emergencia_actual\APLICAR_REEMPLAZO_DIRECTO.ps1"

Si algo sale mal:
Copy-Item ".\backups_enterprise_workspace_emergencia_actual\EnterpriseWorkspace.tsx.bak" ".\src\features\accounting\EnterpriseWorkspace.tsx" -Force
