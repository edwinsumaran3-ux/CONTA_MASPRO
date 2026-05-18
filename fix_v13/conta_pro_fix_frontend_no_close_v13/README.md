# CONTA_PRO FIX V13 - Frontend no cierra modal y limpia recibos públicos

Corrige los dos problemas que seguían:
1. `EnterpriseWorkspace.tsx` cerraba el modal antes de recargar Libro Diario. Si fallaba `loadJournal`, parecía que falló la compra y la tabla desaparecía.
2. `PurchaseFormEnterprise.tsx` no conocía `INFO_ONLY`, entonces FOSE/FISE y líneas informativas podían volver como gasto.
3. Limpia en frontend ajustes OCR falsos cuando ya existe redondeo explícito.
4. Oculta alertas viejas de IGV/OCR si el recibo público quedó conciliado OK.
5. En facturas comerciales normales sigue estricta la validación.

Uso:
```powershell
cd C:\Users\USUARIO\Downloads\CONTA_PRO_ENTERPRISE_MASTER
mkdir fix_v13 -Force
Expand-Archive "$env:USERPROFILE\Downloads\conta_pro_fix_frontend_no_close_v13.zip" ".\fix_v13" -Force
powershell -ExecutionPolicy Bypass -File ".\fix_v13\conta_pro_fix_frontend_no_close_v13\aplicar_fix_frontend_v13.ps1"
```

Luego reinicia backend y frontend. Importante: cerrar el modal viejo, Ctrl+F5 y volver a subir el recibo.
