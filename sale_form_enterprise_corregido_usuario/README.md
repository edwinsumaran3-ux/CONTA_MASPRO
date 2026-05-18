# SaleFormEnterprise corregido sobre el archivo exacto entregado

Este paquete corrige el archivo de ventas que entregaste.

Corrige:
- La IA ahora acepta `items` y `line_items`.
- La IA acepta nombres alternativos: product_code, sku, product_description, qty, unitPrice, lineSubtotal, accountCode, accountName, costCenter, taxTreatment.
- La fecha de emisión ya no se borra si la IA no devuelve fecha.
- Al editar cantidad, precio o subtotal se recalcula IGV y total de línea.
- El mapeo IA llena items, cliente, RUC, serie, número, subtotal, IGV, total leído, cuentas, centro de costo y alertas.
- Se corrige punto y coma faltante en currentTenantId.
- Se ordena el try/catch de handleSubmit.
- Se mejora el texto del botón y la descripción OCR de ventas.
- Se respeta '-' como centro de costo para líneas que no lo llevan.

No toca:
- EnterpriseWorkspace.tsx
- PurchaseFormEnterprise.tsx
- backend
- planillas
- inventario

Aplicar:
1. Descomprime el ZIP en la raíz del proyecto.
2. Ejecuta:
   powershell -ExecutionPolicy Bypass -File ".\sale_form_enterprise_corregido_usuario\aplicar_sale_form_enterprise_corregido.ps1"
3. Valida:
   npm run dev
