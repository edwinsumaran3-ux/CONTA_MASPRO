# EnterpriseWorkspace nueva logica

Archivo corregido:
- src/features/accounting/EnterpriseWorkspace.tsx

Nueva logica:
- EnterpriseWorkspace queda como orquestador.
- Compras mantiene su IA dentro de PurchaseFormEnterprise.
- Ventas mantiene su IA dentro de SaleFormEnterprise.
- Planillas e inventario quedan independientes en sus modulos.
- Se mantiene seedRows, pero controlado por USE_DEMO_ROWS=false.
- No hay doble declaracion de rows, selectedRow, loadJournal, exportExcel, exportPdf ni refreshJournal.
- No se toca PurchaseFormEnterprise.tsx ni SaleFormEnterprise.tsx.

Aplicar:
1. Descomprimir el zip en la raiz del proyecto.
2. Ejecutar:
   powershell -ExecutionPolicy Bypass -File ".\enterprise_workspace_nueva_logica\aplicar_enterprise_workspace_nueva_logica.ps1"

Validar:
npm run dev
