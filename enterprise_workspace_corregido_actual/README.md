# EnterpriseWorkspace corregido sobre archivo actual

Este paquete corrige el EnterpriseWorkspace.tsx que entregaste ahora.

Se conserva la arquitectura actual:
- Compras usa postPurchase en EnterpriseWorkspace.
- Ventas usa SaleFormEnterprise con form/onFormChange/onSubmit.
- El workspace sigue posteando ventas con postSale.
- No se cambia SaleFormEnterprise.tsx.

Corrige:
- import duplicado de SaleFormEnterprise.
- SaleSubmitResult inexistente.
- rows / selectedRow duplicados.
- loadJournal duplicado y mal cerrado.
- resultRows duplicado.
- fallback seedRows contradiciendo backend real.
- return duplicado en displayRows.
- exportExcel con doble const csv.
- exportPdf con doble const lines.
- refreshJournal roto.
- JSX duplicado en detalle analítico.
- prop token sobrante en SaleFormEnterprise.
- segundo refresh innecesario después de postear venta.

Mantiene:
- seedRows, pero controlado con USE_DEMO_ROWS=false.
- postPurchase.
- postSale.
- Planillas.
- Inventario.
- IA de botones globales.
- Vista contabilidad.

Aplicar:
1. Descomprime en la raíz del proyecto.
2. Ejecuta:
   powershell -ExecutionPolicy Bypass -File ".\enterprise_workspace_corregido_actual\aplicar_enterprise_workspace_corregido_actual.ps1"
3. Valida:
   npm run dev
