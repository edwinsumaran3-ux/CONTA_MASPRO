
from pathlib import Path

path = Path("src/application/services/ledger_posting_service.py")
if not path.exists():
    raise SystemExit("No existe src/application/services/ledger_posting_service.py. Ejecuta desde la raiz del proyecto.")

text = path.read_text(encoding="utf-8")
backup_dir = Path("backups_fix_purchase_reconcile_v8")
backup_dir.mkdir(exist_ok=True)
(backup_dir / "ledger_posting_service.py.bak").write_text(text, encoding="utf-8")

old = '''        total_debit = sum(self._as_decimal(line.get("debit")) for line in lines)
        total_credit = sum(self._as_decimal(line.get("credit")) for line in lines)
        if total_debit != total_credit:
            raise UnbalancedEntryException(f"Compra descuadrada: Debe {total_debit} != Haber {total_credit}")

        # Enforce cost center for expense/analytic accounts.'''

new = '''        total_debit = sum(self._as_decimal(line.get("debit")) for line in lines)
        total_credit = sum(self._as_decimal(line.get("credit")) for line in lines)

        if total_debit != total_credit:
            difference_to_debit = (total_credit - total_debit).quantize(Decimal("0.01"))
            difference_to_credit = (total_debit - total_credit).quantize(Decimal("0.01"))

            # Si las lineas vienen de la IA y el descuadre es menor, no usar redondeo grande.
            # Se registra como cargo regulado/conciliacion OCR para no perder el total del comprobante.
            # Esto evita confundir Aporte Ley, FOSE/FISE, alumbrado, MRSE u otros cargos con redondeo.
            if incoming_account_lines and difference_to_debit > 0 and difference_to_debit <= Decimal("2.00"):
                all_text = " ".join(
                    [
                        str(purchase_data.get("supplier_name") or ""),
                        str(purchase_data.get("supplier_ruc") or ""),
                        " ".join(str(item.get("description") or "") for item in (purchase_data.get("items") or purchase_data.get("line_items") or [])),
                        " ".join(str(line.get("account_code") or "") for line in lines),
                    ]
                ).upper()

                if any(token in all_text for token in ["HIDRANDINA", "ENEL", "LUZ", "ELECTRIC", "ENERGIA", "ENERGÍA", "FOSE", "FISE", "ALUMBRADO", "APORTE LEY"]):
                    reconcile_account = "636105"
                    reconcile_name = "Energia electrica - cargo regulado no identificado"
                elif any(token in all_text for token in ["AGUA", "ALCANTARILLADO", "SEDAPAL", "SANEAMIENTO", "SUNASS", "MRSE"]):
                    reconcile_account = "636115"
                    reconcile_name = "Agua potable - cargo regulado no identificado"
                elif any(token in all_text for token in ["INTERNET", "TELEFON", "MOVIL", "MÓVIL", "FIBRA"]):
                    reconcile_account = "636123"
                    reconcile_name = "Telecomunicaciones - cargo no identificado"
                elif any(token in all_text for token in ["GAS", "CALIDDA", "CÁLIDDA"]):
                    reconcile_account = "636132"
                    reconcile_name = "Gas - cargo regulado no identificado"
                else:
                    reconcile_account = self._normalize_code(purchase_data.get("expense_account"), "659101")
                    reconcile_name = "Diferencia de conciliacion OCR / concepto no identificado"

                lines.append({
                    "account_code": reconcile_account,
                    "account_name": reconcile_name,
                    "debit": difference_to_debit,
                    "credit": Decimal("0.00"),
                    "partner_ruc": supplier_ruc,
                    "document_type": doc_type,
                    "document_series": serie,
                    "document_number": number,
                    "cost_center": purchase_data.get("cost_center") or "LIM-ADM",
                    "project_code": None,
                })

                total_debit = sum(self._as_decimal(line.get("debit")) for line in lines)
                total_credit = sum(self._as_decimal(line.get("credit")) for line in lines)

            elif incoming_account_lines and difference_to_credit > 0 and difference_to_credit <= Decimal("2.00"):
                lines.append({
                    "account_code": "759901",
                    "account_name": "Diferencia de conciliacion favorable",
                    "debit": Decimal("0.00"),
                    "credit": difference_to_credit,
                    "partner_ruc": supplier_ruc,
                    "document_type": doc_type,
                    "document_series": serie,
                    "document_number": number,
                    "cost_center": None,
                    "project_code": None,
                })

                total_debit = sum(self._as_decimal(line.get("debit")) for line in lines)
                total_credit = sum(self._as_decimal(line.get("credit")) for line in lines)

            if total_debit != total_credit:
                raise UnbalancedEntryException(f"Compra descuadrada: Debe {total_debit} != Haber {total_credit}")

        # Enforce cost center for expense/analytic accounts.'''

if old not in text:
    if "cargo regulado/conciliacion OCR" in text:
        print("YA EXISTE: conciliacion V8 ya estaba aplicada.")
    else:
        raise SystemExit("No encontre el bloque exacto de validacion de compras. Ejecuta Select-String -Path .\\src\\application\\services\\ledger_posting_service.py -Pattern 'Compra descuadrada' -Context 8,8")
else:
    text = text.replace(old, new, 1)
    path.write_text(text, encoding="utf-8")
    print("OK: ledger_posting_service.py ahora respeta account_lines IA y concilia diferencias menores sin llamarlas redondeo.")
    print("Backup:", backup_dir / "ledger_posting_service.py.bak")
