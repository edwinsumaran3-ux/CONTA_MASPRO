
from pathlib import Path
import re

path = Path("src/api/routes/purchases.py")
if not path.exists():
    raise SystemExit("No existe src/api/routes/purchases.py. Ejecuta este script desde la raiz del proyecto.")

text = path.read_text(encoding="utf-8")

backup_dir = Path("backups_fix_servicios_v7")
backup_dir.mkdir(exist_ok=True)
(backup_dir / "purchases.py.bak").write_text(text, encoding="utf-8")

text = text.replace('AUTO_ROUNDING_TOLERANCE = Decimal("0.50")', 'AUTO_ROUNDING_TOLERANCE = Decimal("0.10")')

if "UTILITY_SERVICE_LIBRARY" not in text:
    marker = "LEGAL_TAX_REVIEW_LIBRARY = ["
    start = text.find(marker)
    if start == -1:
        raise SystemExit("No encontre LEGAL_TAX_REVIEW_LIBRARY.")
    end = text.find("\n]\n", start)
    if end == -1:
        raise SystemExit("No encontre cierre de LEGAL_TAX_REVIEW_LIBRARY.")
    end += len("\n]\n")

    library = r'''

# Biblioteca sectorial de servicios publicos.
# Prioridad: estos conceptos se clasifican ANTES que redondeo.
# Aporte Ley, FOSE, FISE, MRSE, alumbrado, saneamiento, mantenimiento y cargos regulados NO son redondeo.
UTILITY_SERVICE_LIBRARY = [
    {"sector": "ELECTRICIDAD", "account_code": "636101", "account_name": "Energia electrica - consumo activo", "line_type": "EXPENSE_OR_ASSET", "patterns": [r"ENERGIA\s+ACTIVA", r"CONSUMO\s+ENERGIA", r"ENERG[IÍ]A\s+EL[EÉ]CTRICA"], "taxable_default": True, "igv_credit": "SI", "requires_support": False},
    {"sector": "ELECTRICIDAD", "account_code": "636102", "account_name": "Energia electrica - cargo fijo", "line_type": "EXPENSE_OR_ASSET", "patterns": [r"CARGO\s+FIJO"], "taxable_default": True, "igv_credit": "SI", "requires_support": False},
    {"sector": "ELECTRICIDAD", "account_code": "636103", "account_name": "Energia electrica - alumbrado publico", "line_type": "REGULATED_CHARGE", "patterns": [r"ALUMBRADO\s+P[UÚ]BLICO", r"ALUMBRADO\s+PUBLICO"], "taxable_default": False, "igv_credit": "NO", "requires_support": False},
    {"sector": "ELECTRICIDAD", "account_code": "636104", "account_name": "Energia electrica - reposicion y mantenimiento", "line_type": "REGULATED_CHARGE", "patterns": [r"REPOSICI[OÓ]N", r"MANTENIMIENTO", r"REPOSICION\s*/\s*MANTENIMIENTO"], "taxable_default": False, "igv_credit": "NO", "requires_support": False},
    {"sector": "ELECTRICIDAD", "account_code": "636105", "account_name": "Energia electrica - Aporte Ley 28749", "line_type": "REGULATED_CHARGE", "patterns": [r"APORTE\s+LEY", r"LEY\s+28749", r"APORTE\s+LEY\s+NRO\.?\s*28749"], "taxable_default": False, "igv_credit": "NO", "requires_support": False},
    {"sector": "ELECTRICIDAD", "account_code": "636106", "account_name": "Energia electrica - FOSE/FISE", "line_type": "REGULATED_CHARGE", "patterns": [r"FOSE", r"FISE", r"LEY\s+27510"], "taxable_default": False, "igv_credit": "NO", "requires_support": False},

    {"sector": "AGUA", "account_code": "636111", "account_name": "Agua potable - consumo", "line_type": "EXPENSE_OR_ASSET", "patterns": [r"SERVICIO\s+DE\s+AGUA", r"AGUA\s+POTABLE", r"CONSUMO\s+AGUA", r"\bAGUA\b"], "taxable_default": True, "igv_credit": "SI", "requires_support": False},
    {"sector": "AGUA", "account_code": "636112", "account_name": "Agua potable - alcantarillado", "line_type": "EXPENSE_OR_ASSET", "patterns": [r"ALCANTARILLADO", r"SANEAMIENTO"], "taxable_default": True, "igv_credit": "SI", "requires_support": False},
    {"sector": "AGUA", "account_code": "636113", "account_name": "Agua potable - cargo fijo", "line_type": "EXPENSE_OR_ASSET", "patterns": [r"CARGO\s+FIJO"], "taxable_default": True, "igv_credit": "SI", "requires_support": False},
    {"sector": "AGUA", "account_code": "636114", "account_name": "Agua potable - reposicion y mantenimiento", "line_type": "REGULATED_CHARGE", "patterns": [r"REPOSICI[OÓ]N", r"MANTENIMIENTO", r"CONEXI[OÓ]N", r"RECONEXI[OÓ]N"], "taxable_default": False, "igv_credit": "NO", "requires_support": False},
    {"sector": "AGUA", "account_code": "636115", "account_name": "Agua potable - cargos regulados/aportes/MRSE", "line_type": "REGULATED_CHARGE", "patterns": [r"MRSE", r"MECANISMO\s+DE\s+RETRIBUCI[OÓ]N", r"SERVICIOS\s+ECOSIST[EÉ]MICOS", r"APORTE", r"FONDO", r"CARGO\s+REGULADO"], "taxable_default": False, "igv_credit": "NO", "requires_support": False},

    {"sector": "TELECOM", "account_code": "636121", "account_name": "Internet empresarial", "line_type": "EXPENSE_OR_ASSET", "patterns": [r"INTERNET", r"BANDA\s+ANCHA", r"FIBRA", r"DATOS"], "taxable_default": True, "igv_credit": "SI", "requires_support": False},
    {"sector": "TELECOM", "account_code": "636122", "account_name": "Telefonia fija y movil", "line_type": "EXPENSE_OR_ASSET", "patterns": [r"TELEFON[IÍ]A", r"TELEFONO", r"CELULAR", r"M[OÓ]VIL", r"LINEA"], "taxable_default": True, "igv_credit": "SI", "requires_support": False},
    {"sector": "TELECOM", "account_code": "636123", "account_name": "Telecomunicaciones - instalacion/equipos", "line_type": "EXPENSE_OR_ASSET", "patterns": [r"INSTALACI[OÓ]N", r"ROUTER", r"MODEM", r"EQUIPO", r"RECONEXI[OÓ]N"], "taxable_default": True, "igv_credit": "SI", "requires_support": False},

    {"sector": "GAS", "account_code": "636131", "account_name": "Gas - consumo", "line_type": "EXPENSE_OR_ASSET", "patterns": [r"GAS\s+NATURAL", r"CONSUMO\s+GAS", r"\bGAS\b", r"GLP"], "taxable_default": True, "igv_credit": "SI", "requires_support": False},
    {"sector": "GAS", "account_code": "636132", "account_name": "Gas - cargo fijo/distribucion", "line_type": "EXPENSE_OR_ASSET", "patterns": [r"CARGO\s+FIJO", r"DISTRIBUCI[OÓ]N", r"TRANSPORTE"], "taxable_default": True, "igv_credit": "SI", "requires_support": False},
]

REGULATED_LINE_TYPES = {"REGULATED_CHARGE", "REGULATED_DISCOUNT"}
'''
    text = text[:end] + library + text[end:]

if "def _utility_service_rule" not in text:
    marker = "\ndef _money("
    helpers = r'''
def _matches_any(patterns: list[str], value: str) -> bool:
    return any(re.search(pattern, value, flags=re.IGNORECASE) for pattern in patterns)


def _utility_service_rule(description: str, supplier_name: str = "") -> dict[str, Any] | None:
    text = f"{description or ''} {supplier_name or ''}".upper()
    for rule in UTILITY_SERVICE_LIBRARY:
        if _matches_any(rule["patterns"], text):
            return rule
    return None


def _is_rounding_description(description: str, code: str = "") -> bool:
    text = f"{code or ''} {description or ''}".upper()
    if _utility_service_rule(text):
        return False
    return bool(re.search(
        r"REDONDEO|ROUNDING|AJUSTE\s+POR\s+REDONDEO|SALDO\s+POR\s+REDONDEO|DIFERENCIA\s+(DE|POR)\s+REDONDEO|AJUSTE\s+MONEDA|REDONDEO\s+MES",
        text,
    ))

'''
    if marker not in text:
        raise SystemExit("No encontre def _money.")
    text = text.replace(marker, helpers + marker, 1)

start = text.find("def _line_kind(")
end = text.find("\n\ndef _classify_local", start)
if start == -1 or end == -1:
    raise SystemExit("No encontre _line_kind.")
new_line_kind = r'''def _line_kind(description: str, code: str = "") -> str:
    text = f"{code} {description}".upper()

    if _utility_service_rule(text):
        return "REGULATED_CHARGE"

    if _is_rounding_description(description, code):
        return "ROUNDING"

    if re.search(r"DEUDA\s+ANT|DEUDA\s+ANTERIOR|SALDO\s+ANTERIOR|SALDO\s+VENCIDO|RECIBO\s+ANTERIOR|PENDIENTE\s+DE\s+PAGO|CARGO\s+ANTERIOR", text):
        return "PRIOR_BALANCE"
    if re.search(r"PAGO\s+A\s+CUENTA|ABONO|SALDO\s+A\s+FAVOR|CREDITO\s+ANTERIOR|CR[EÉ]DITO\s+ANTERIOR|COMPENSACION|COMPENSACI[OÓ]N", text):
        return "ADVANCE_PAYMENT"
    if re.search(r"MORA|INTER[EÉ]S|INTERES|PENALIDAD|RECARGO|CARGO\s+POR\s+ATRASO", text):
        return "LATE_FEE"
    return "NORMAL"
'''
text = text[:start] + new_line_kind + text[end:]

needle = '    kind = _line_kind(description)\n'
sector_rule = r'''    kind = _line_kind(description)
    utility_rule = _utility_service_rule(description, supplier_name)
    if utility_rule:
        return {
            "account_code": utility_rule["account_code"],
            "account_name": utility_rule["account_name"],
            "cost_center": fallback_cost_center,
            "tax_treatment": (
                f"Concepto sectorial {utility_rule['sector']} clasificado por biblioteca de servicios publicos. "
                "No es redondeo. IGV solo segun discriminacion expresa del comprobante y reglas vigentes del regulador/SUNAT."
            ),
            "deductibility": "DEDUCIBLE",
            "igv_credit": utility_rule["igv_credit"],
            "requires_support": bool(utility_rule.get("requires_support", False)),
            "line_type": utility_rule["line_type"],
            "ai_reason": f"Clasificado por biblioteca sectorial de servicios publicos: {utility_rule['account_name']}.",
            "ai_confidence": 0.97,
        }
'''
if sector_rule not in text:
    if needle not in text:
        raise SystemExit("No encontre inicio de _classify_local.")
    text = text.replace(needle, sector_rule, 1)

norm_marker = '        kind = _norm_text(raw.get("line_type")) or local.get("line_type") or _line_kind(description, raw.get("code", ""))\n'
norm_insert = r'''        if local.get("line_type") in REGULATED_LINE_TYPES:
            kind = local["line_type"]
            raw["line_type"] = kind
            raw["taxable"] = False
            raw["igv_credit"] = local["igv_credit"]
            raw["requires_support"] = False
'''
if norm_insert not in text:
    if norm_marker not in text:
        raise SystemExit("No encontre marcador de kind en normalizacion.")
    text = text.replace(norm_marker, norm_marker + norm_insert, 1)

text = text.replace(
    '        if kind in {"ROUNDING", "PRIOR_BALANCE", "ADVANCE_PAYMENT", "LATE_FEE"}:',
    '        if kind in {"REGULATED_CHARGE", "REGULATED_DISCOUNT", "ROUNDING", "PRIOR_BALANCE", "ADVANCE_PAYMENT", "LATE_FEE"}:',
    1
)

advance_marker = '        if kind == "ADVANCE_PAYMENT":\n'
regulated_block = r'''        if kind in REGULATED_LINE_TYPES:
            target_cc = cc if code[:1] in {"6", "9"} else "-"
            key = (code, name, target_cc, kind)
            debit_by_key[key] = debit_by_key.get(key, Decimal("0.00")) + amount
            continue

'''
if regulated_block not in text:
    if advance_marker not in text:
        raise SystemExit("No encontre bloque ADVANCE_PAYMENT.")
    text = text.replace(advance_marker, regulated_block + advance_marker, 1)

prompt_marker = "REGLAS ESPECIALES OBLIGATORIAS:"
prompt_add = r'''REGLAS SECTORIALES DE SERVICIOS PUBLICOS - OBLIGATORIAS:
- Para electricidad, agua/saneamiento, telecom y gas, lee todos los conceptos y usa subcuentas.
- Aporte Ley 28749, FOSE, FISE, alumbrado publico, electrificacion, reposicion, mantenimiento, MRSE, fondos, aportes o cargos regulados NO son redondeo.
- Redondeo solo si el texto dice explicitamente redondeo, saldo por redondeo, diferencia por redondeo o ajuste monetario.
- Si aparece Aporte/Ley/FOSE/FISE/Alumbrado/MRSE/Saneamiento/Fondo/Cargo regulado, clasifica como REGULATED_CHARGE.
- No inventes IGV por concepto. Usa el IGV discriminado del comprobante.
- Si falta diferencia mayor a 0.10, busca concepto regulado omitido antes de crear ajuste.
- Subcuentas sugeridas:
  electricidad consumo 636101, cargo fijo 636102, alumbrado 636103, reposicion/mantenimiento 636104, aporte ley 636105, FOSE/FISE 636106.
  agua consumo 636111, alcantarillado 636112, cargo fijo 636113, reposicion/mantenimiento 636114, aportes/MRSE/cargos regulados 636115.
  internet 636121, telefonia 636122, equipos/instalacion telecom 636123.
  gas consumo 636131, cargo fijo/distribucion 636132.

'''
if prompt_add not in text:
    if prompt_marker not in text:
        raise SystemExit("No encontre REGLAS ESPECIALES OBLIGATORIAS.")
    text = text.replace(prompt_marker, prompt_add + prompt_marker, 1)

text = text.replace(
    '"account_name": "Ajuste por redondeo o diferencia de lectura"',
    '"account_name": "Diferencia de conciliacion OCR / concepto regulado no identificado"'
)
text = text.replace(
    '"tax_treatment": "Ajuste para reconciliar contra total impreso; no integra base IGV. Revisar si excede tolerancia."',
    '"tax_treatment": "Diferencia contra total impreso. Si excede tolerancia de redondeo, revisar concepto regulado omitido; no clasificar automaticamente como redondeo."'
)

path.write_text(text, encoding="utf-8")
print("OK purchases.py: biblioteca sectorial servicios publicos V7 aplicada.")
print("Backup:", backup_dir / "purchases.py.bak")
