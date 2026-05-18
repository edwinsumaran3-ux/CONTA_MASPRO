
$ErrorActionPreference = "Stop"
Write-Host "== CONTA_PRO FIX V11: redondeo explicito y FOSE informativo ==" -ForegroundColor Cyan

$py = @'
from pathlib import Path
import ast

path = Path("src/api/routes/purchases.py")
if not path.exists():
    raise SystemExit("No existe src/api/routes/purchases.py. Ejecuta desde la raiz del proyecto.")

text = path.read_text(encoding="utf-8")
backup_dir = Path("backups_fix_redondeo_explicito_v11")
backup_dir.mkdir(exist_ok=True)
(backup_dir / "purchases.py.bak").write_text(text, encoding="utf-8")

helper_marker = "\ndef _normalize_ai_response(data: dict[str, Any]) -> dict[str, Any]:"
helper_code = r"""

def _service_desc(item: dict[str, Any]) -> str:
    return _norm_upper(item.get("description"))


def _service_amount(item: dict[str, Any]) -> Decimal:
    return _money(item.get("line_subtotal") or item.get("total_line") or item.get("unit_price"))


def _service_set_amount(item: dict[str, Any], value: Decimal) -> None:
    amount = _money_str(value)
    item["line_subtotal"] = amount
    item["unit_price"] = amount
    item["total_line"] = amount


def _is_fose_or_fise(item: dict[str, Any]) -> bool:
    desc = _service_desc(item)
    return "FOSE" in desc or "FISE" in desc


def _is_saldo_redondeo(item: dict[str, Any]) -> bool:
    return "SALDO POR REDONDEO" in _service_desc(item)


def _is_diferencia_redondeo(item: dict[str, Any]) -> bool:
    desc = _service_desc(item)
    return "DIFERENCIA DE REDONDEO" in desc or "DIFERENCIA POR REDONDEO" in desc


def _is_aporte_ley(item: dict[str, Any]) -> bool:
    desc = _service_desc(item)
    return "APORTE LEY" in desc or "LEY NRO" in desc or "LEY 28749" in desc


def _has_explicit_rounding(items: list[dict[str, Any]]) -> bool:
    return any(_is_saldo_redondeo(item) or _is_diferencia_redondeo(item) for item in items)


def _normalize_explicit_rounding_and_fose(
    data: dict[str, Any],
    items: list[dict[str, Any]],
    subtotal: Decimal,
    igv: Decimal,
    total_read: Decimal,
    ocr_warnings: list[str],
    accounting_warnings: list[str],
    reconciliation_notes: list[str],
) -> tuple[Decimal, Decimal, Decimal]:
    if not items or total_read == 0:
        return subtotal, igv, total_read

    base_keywords = (
        "CARGO FIJO",
        "REPOSICION",
        "REPOSICIÓN",
        "MANTENIMIENTO",
        "ENERGIA ACTIVA",
        "ENERGÍA ACTIVA",
        "ALUMBRADO PUBLICO",
        "ALUMBRADO PÚBLICO",
    )
    base_items = [
        item for item in items
        if any(token in _service_desc(item) for token in base_keywords)
    ]
    base_sum = sum((_service_amount(item) for item in base_items), Decimal("0.00")).quantize(Decimal("0.01"))

    if base_sum > 0 and (subtotal == 0 or abs(subtotal - base_sum) <= Decimal("1.10")):
        if subtotal != base_sum:
            ocr_warnings.append(f"Subtotal corregido de {subtotal} a {base_sum} usando lineas visibles antes del SUB TOTAL.")
        subtotal = base_sum
        data["subtotal"] = _money_str(subtotal)

    if subtotal > 0:
        igv_expected = (subtotal * Decimal("0.18")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        if igv == 0 or abs(igv - igv_expected) <= Decimal("1.10"):
            if igv != igv_expected:
                ocr_warnings.append(f"IGV corregido de {igv} a {igv_expected} por base visible {subtotal}.")
            igv = igv_expected
            data["igv"] = _money_str(igv)

    saldo = sum((_service_amount(item) for item in items if _is_saldo_redondeo(item)), Decimal("0.00")).quantize(Decimal("0.01"))
    aporte = sum((_service_amount(item) for item in items if _is_aporte_ley(item)), Decimal("0.00")).quantize(Decimal("0.01"))
    diff_items = [item for item in items if _is_diferencia_redondeo(item)]
    diff_actual = sum((_service_amount(item) for item in diff_items), Decimal("0.00")).quantize(Decimal("0.01"))

    diff_correcto = (total_read - subtotal - igv - saldo - aporte).quantize(Decimal("0.01"))

    if diff_items and abs(diff_actual - diff_correcto) <= Decimal("2.00"):
        if diff_actual != diff_correcto:
            ocr_warnings.append(f"Diferencia de redondeo corregida de {diff_actual} a {diff_correcto} usando TOTAL impreso.")
        _service_set_amount(diff_items[0], diff_correcto)
        diff_actual = diff_correcto
        reconciliation_notes.append("Cuadre realizado sobre la linea explicita Diferencia de redondeo.")

    fose_items = [item for item in items if _is_fose_or_fise(item)]
    total_sin_fose = (subtotal + igv + saldo + diff_actual + aporte).quantize(Decimal("0.01"))
    if fose_items and abs(total_sin_fose - total_read) <= Decimal("0.02"):
        for item in fose_items:
            item["line_type"] = "INFO_ONLY"
            item["taxable"] = False
            item["igv_amount"] = "0.00"
            item["requires_support"] = False
            item["tax_treatment"] = "FOSE/FISE aparece como informacion posterior al total; no se contabiliza doble si el total ya cuadra."
            item["ai_reason"] = "FOSE/FISE informativo fuera del total contable del recibo."
        reconciliation_notes.append("FOSE/FISE tratado como INFO_ONLY porque el total cuadra sin sumarlo.")

    if _has_explicit_rounding(items):
        total_control = (subtotal + igv + saldo + diff_actual + aporte).quantize(Decimal("0.01"))
        if fose_items and not all(item.get("line_type") == "INFO_ONLY" for item in fose_items):
            total_control += sum((_service_amount(item) for item in fose_items), Decimal("0.00")).quantize(Decimal("0.01"))
        if abs(total_control - total_read) > Decimal("0.02"):
            accounting_warnings.append(f"Recibo con redondeo explicito no cuadra despues de correccion: control {total_control} vs total {total_read}. Revisar OCR.")
        else:
            reconciliation_notes.append(f"Recibo cuadrado por redondeo explicito: {total_control} = {total_read}.")

    return subtotal, igv, total_read
"""
if "def _normalize_explicit_rounding_and_fose" not in text:
    if helper_marker not in text:
        raise SystemExit("No encontre _normalize_ai_response.")
    text = text.replace(helper_marker, helper_code + helper_marker, 1)

text = text.replace(
    '        if local.get("line_type") in REGULATED_LINE_TYPES:',
    '        if kind != "INFO_ONLY" and local.get("line_type") in REGULATED_LINE_TYPES:',
    1
)

target = """    subtotal = _money(data.get("subtotal") or sum(_money(item["line_subtotal"]) for item in items if item.get("line_type") == "EXPENSE_OR_ASSET"))
    igv = _money(data.get("igv") or sum(_money(item.get("igv_amount")) for item in items))
    total_read = _money(data.get("total_read_from_document") or data.get("total") or subtotal + igv)
    total = total_read
"""
replacement = """    subtotal = _money(data.get("printed_subtotal") or data.get("subtotal") or sum(_money(item["line_subtotal"]) for item in items if item.get("line_type") == "EXPENSE_OR_ASSET"))
    igv = _money(data.get("printed_igv") or data.get("igv") or sum(_money(item.get("igv_amount")) for item in items))
    total_read = _money(data.get("printed_total") or data.get("total_read_from_document") or data.get("total") or subtotal + igv)
    total = total_read

    subtotal, igv, total_read = _normalize_explicit_rounding_and_fose(
        data,
        items,
        subtotal,
        igv,
        total_read,
        ocr_warnings,
        accounting_warnings,
        reconciliation_notes,
    )
    total = total_read
"""
norm_start = text.find("def _normalize_ai_response")
if "_normalize_explicit_rounding_and_fose(" not in text[norm_start + 1:]:
    if target not in text:
        raise SystemExit("No encontre bloque subtotal/igv/total_read.")
    text = text.replace(target, replacement, 1)

target2 = """        amount = _money(item.get("line_subtotal"))

        if kind == "ROUNDING" and abs(amount) <= AUTO_ROUNDING_TOLERANCE:
"""
replacement2 = """        amount = _money(item.get("line_subtotal"))

        if kind == "INFO_ONLY":
            reconciliation_notes.append(f"Linea informativa no contabilizada: {item.get('description')}.")
            continue

        if kind == "ROUNDING" and abs(amount) <= AUTO_ROUNDING_TOLERANCE:
"""
last_items_loop = text.rfind("    for item in items:")
if last_items_loop == -1:
    raise SystemExit("No encontre loop de items.")
if 'if kind == "INFO_ONLY":' not in text[last_items_loop:]:
    if target2 not in text:
        raise SystemExit("No encontre bloque amount para insertar INFO_ONLY.")
    text = text.replace(target2, replacement2, 1)

target3 = """    if difference != 0:
        if difference > 0:
"""
replacement3 = """    has_explicit_rounding = _has_explicit_rounding(items)

    if difference != 0 and not has_explicit_rounding:
        if difference > 0:
"""
if "has_explicit_rounding = _has_explicit_rounding(items)" not in text:
    if target3 not in text:
        raise SystemExit("No encontre bloque difference.")
    text = text.replace(target3, replacement3, 1)

target4 = """        reconciliation_notes.append(f"Ajuste automatico contra total impreso: {difference}.")
        if abs(difference) > AUTO_ROUNDING_TOLERANCE:
            accounting_warnings.append(f"Diferencia mayor a tolerancia de redondeo ({AUTO_ROUNDING_TOLERANCE}): {difference}. Revisar OCR/importes.")
"""
replacement4 = """        reconciliation_notes.append(f"Ajuste automatico contra total impreso: {difference}.")
        if abs(difference) > AUTO_ROUNDING_TOLERANCE:
            accounting_warnings.append(f"Diferencia mayor a tolerancia de redondeo ({AUTO_ROUNDING_TOLERANCE}): {difference}. Revisar OCR/importes.")
    elif difference != 0 and has_explicit_rounding:
        reconciliation_notes.append(f"Diferencia {difference} no genera ajuste adicional porque el comprobante ya tiene redondeo explicito.")
"""
if "no genera ajuste adicional porque el comprobante ya tiene redondeo explicito" not in text:
    if target4 not in text:
        raise SystemExit("No encontre cierre de ajuste automatico.")
    text = text.replace(target4, replacement4, 1)

target5 = """    for (code, name, cc, kind), amount in debit_by_key.items():
        if amount == 0:
            continue
        account_lines.append({
            "account_code": code,
            "account_name": name,
            "cost_center": cc,
            "debit": _money_str(amount),
            "credit": "0.00",
            "line_type": kind if kind in {"ROUNDING", "PRIOR_BALANCE", "LATE_FEE"} else "EXPENSE_OR_ASSET",
            "tax_treatment": "Clasificado por IA con validacion contable, tributaria y documental.",
            "audit_note": "",
        })
"""
replacement5 = """    for (code, name, cc, kind), amount in debit_by_key.items():
        if amount == 0:
            continue
        if amount < 0:
            account_lines.append({
                "account_code": ROUNDING_INCOME_ACCOUNT if kind == "ROUNDING" else code,
                "account_name": "Ajuste por redondeo favorable" if kind == "ROUNDING" else name,
                "cost_center": "-" if kind == "ROUNDING" else cc,
                "debit": "0.00",
                "credit": _money_str(abs(amount)),
                "line_type": kind if kind in {"ROUNDING", "PRIOR_BALANCE", "LATE_FEE"} else "EXPENSE_OR_ASSET",
                "tax_treatment": "Importe negativo normalizado al haber. No se permiten Debe/Haber negativos.",
                "audit_note": "",
            })
            continue
        account_lines.append({
            "account_code": code,
            "account_name": name,
            "cost_center": cc,
            "debit": _money_str(amount),
            "credit": "0.00",
            "line_type": kind if kind in {"ROUNDING", "PRIOR_BALANCE", "LATE_FEE"} else "EXPENSE_OR_ASSET",
            "tax_treatment": "Clasificado por IA con validacion contable, tributaria y documental.",
            "audit_note": "",
        })
"""
if "Importe negativo normalizado al haber" not in text:
    if target5 not in text:
        raise SystemExit("No encontre loop debit_by_key.")
    text = text.replace(target5, replacement5, 1)

ast.parse(text)
path.write_text(text, encoding="utf-8")
print("OK: V11 aplicado. Redondeo explicito no crea ajuste extra, FOSE puede ser INFO_ONLY, y no hay Debe/Haber negativos.")
print("Backup:", backup_dir / "purchases.py.bak")
'@

$py | python
