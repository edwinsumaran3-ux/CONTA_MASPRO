"""
Catálogo maestro de artículos de almacén — thin wrapper Python.
Single source of truth: src/config/catalog.json
Derived fields (cta, nat, tk, gasto, rubros) are computed from the code.
"""
from __future__ import annotations

import json
import pathlib

_JSON = pathlib.Path(__file__).parent.parent / "config" / "catalog.json"
_raw: list[dict] = json.loads(_JSON.read_text(encoding="utf-8"))

# ──────────────────────────────────────────────────────────────────────────────
# DERIVATION MAPS
# ──────────────────────────────────────────────────────────────────────────────
NAT_TO_GASTO: dict[str, str] = {
    "SU": "6561", "CO": "6562", "EP": "6564", "LI": "6569",
    "GA": "6569", "TI": "6561", "AG": "6569", "AL": "6569",
    "HM": "6569", "FE": "6569",
    "MP": "6021", "MC": "6021", "MF": "6021", "MM": "6022", "MA": "6031",
    "ME": "6012", "MD": "6012",
    "RM": "6531", "RE": "6531", "RN": "6531", "RI": "6531",
    "MQ": "6813", "EQ": "6816", "VH": "6814", "MU": "6815",
    "HT": "6817", "HE": "6817",
    "EX": "6562", "QU": "6569", "EC": "6411", "CB": "6412",
}

GASTO_OVERRIDES: dict[str, str] = {
    "201": "6911", "202": "6912", "211": "6111",
    "241": "6021", "242": "6022", "251": "6031",
    "261": "6411", "262": "6412",
    "333": "6813", "334": "6814", "335": "6815", "336": "6816", "337": "6817",
}

# Kept for backward compatibility
NAT_TO_CLASS: dict[str, str] = {
    "SU": "INSUMOS", "CO": "INSUMOS", "EP": "INSUMOS", "LI": "INSUMOS",
    "GA": "INSUMOS", "TI": "INSUMOS", "AG": "INSUMOS", "AL": "INSUMOS",
    "HM": "HERRAMIENTAS", "FE": "INSUMOS",
    "MP": "MATERIA_PRIMA", "MC": "MATERIA_PRIMA", "MF": "MATERIA_PRIMA",
    "MM": "MATERIA_PRIMA", "MA": "MATERIA_PRIMA", "ME": "MERCADERIA",
    "MD": "MERCADERIA",
    "RM": "INSUMOS", "RE": "INSUMOS", "RN": "INSUMOS", "RI": "INSUMOS",
    "MQ": "ACTIVO_FIJO", "EQ": "ACTIVO_FIJO", "VH": "ACTIVO_FIJO",
    "MU": "ACTIVO_FIJO", "HT": "HERRAMIENTAS", "HE": "HERRAMIENTAS",
    "EX": "INSUMOS", "QU": "INSUMOS", "EC": "INSUMOS", "CB": "INSUMOS",
}

ALL_RUBROS = ["GE", "MI", "CO", "FA", "CM", "DI", "AG", "PE", "SA", "HO", "TR", "EN", "TE", "RE", "ED"]


def _expand(raw: dict) -> dict:
    parts = raw["c"].split("-")
    cta, nat, tk = parts[0], parts[1], parts[4]
    gasto = GASTO_OVERRIDES.get(cta) or NAT_TO_GASTO.get(nat, "6569")
    rubros = ALL_RUBROS if raw.get("r") == "ALL" else raw.get("r", [parts[2]])
    return {
        "code": raw["c"],
        "name": raw["n"],
        "aliases": raw.get("a", []),
        "cta": cta,
        "nat": nat,
        "rub": parts[2],
        "tk": tk,
        "unit": raw["u"],
        "rubros": rubros,
        "gasto": gasto,
        "ai_keywords": raw["k"],
    }


CATALOG: list[dict] = [_expand(r) for r in _raw]

# Pre-compiled keyword index
_INDEX: list[tuple[list[str], dict]] = [
    (item["ai_keywords"], item) for item in CATALOG
]


def lookup(description: str, account_code: str = "") -> dict | None:
    """
    Busca en el catálogo por palabras clave de la descripción.
    Prioriza items cuya cuenta CTA coincide con account_code si se proporciona.
    Retorna el dict del catálogo o None si no hay match.
    """
    desc = description.lower()
    candidates: list[tuple[int, dict]] = []
    for keywords, item in _INDEX:
        score = 0
        for kw in keywords:
            if kw in desc:
                score += 2 if " " in kw else 1
        if score > 0:
            if account_code and item["cta"] and account_code.startswith(item["cta"]):
                score += 3
            candidates.append((score, item))
    if not candidates:
        return None
    candidates.sort(key=lambda x: x[0], reverse=True)
    best_score, best_item = candidates[0]
    return best_item if best_score >= 1 else None


def infer_nat_from_description(description: str, cta: str) -> str:
    """Infiere el código NAT a partir de la descripción para artículos nuevos."""
    desc = description.lower()
    if any(k in desc for k in ["casco", "guante", "lente", "zapato", "bota", "chaleco",
                                "arnes", "mascarilla", "careta", "extintor", "cono",
                                "overol", "uniforme"]):
        return "EP"
    if any(k in desc for k in ["gasolina", "diesel", "petroleo", "gnv", "combustible",
                                "aceite motor", "lubricante", "grasa"]):
        return "CO"
    if any(k in desc for k in ["jabon", "cloro", "lejia", "detergente",
                                "papel higienico", "desinfectante", "alcohol gel"]):
        return "LI"
    if any(k in desc for k in ["papel", "toner", "cartucho", "lapiz", "boligrafo",
                                "archivador", "folder", "cinta", "utiles"]):
        return "SU"
    if any(k in desc for k in ["pala", "pico", "lampa", "palana", "comba", "martillo",
                                "barreta", "carretilla", "serrucho", "machete", "rastrillo",
                                "zapapico", "azadon", "cincel", "espatula", "llana",
                                "plomada", "escuadra", "nivel de burbuja", "mango", "paleta"]):
        return "HM"
    if any(k in desc for k in ["laptop", "computadora", "monitor", "tablet", "celular", "cpu"]):
        return "EQ"
    if any(k in desc for k in ["ssd", "ram", "disco", "memoria", "cable utp", "cable red"]):
        return "TI"
    if any(k in desc for k in ["servidor", "switch", "router", "ups"]):
        return "EQ"
    if any(k in desc for k in ["camion", "camioneta", "auto", "vehiculo", "furgon"]):
        return "VH"
    if any(k in desc for k in ["taladro", "amoladora", "esmeril", "soldadora",
                                "compresor", "sierra", "cortadora", "rotomartillo"]):
        return "HE"
    if any(k in desc for k in ["andamio", "vibrador", "mezcladora"]):
        return "HT"
    if any(k in desc for k in ["tractor", "generador", "grupo electrogeno",
                                "maquina", "maquinaria"]):
        return "MQ"
    if any(k in desc for k in ["escritorio", "silla", "mueble", "estante", "archivero"]):
        return "MU"
    if any(k in desc for k in ["cemento", "acero", "fierro", "ladrillo", "madera", "triplay", "plancha"]):
        return "MC"
    if any(k in desc for k in ["arena", "piedra", "gravilla", "hormigon", "mineral", "concentrado"]):
        return "MM"
    if any(k in desc for k in ["filtro", "llanta", "correa", "faja", "repuesto", "pieza", "pastilla"]):
        return "RM"
    if cta.startswith("20") or cta.startswith("21"):
        return "ME"
    if cta.startswith("24"):
        return "MC"
    if cta.startswith("25"):
        return "SU"
    if cta.startswith("33"):
        return "MQ"
    if cta.startswith("34"):
        return "VH"
    return "SU"


def infer_tk_from_description(description: str, nat: str) -> str:
    """Infiere el tipo token (P/T/F) desde naturaleza."""
    if nat in {"MQ", "EQ", "VH", "MU", "HE"}:
        return "P"
    if nat in {"HT", "RM", "RN", "RE", "RI"}:
        return "T"
    return "F"


def build_structured_code(cta: str, nat: str, rub: str = "GE", seq: int = 9999, tk: str = "F") -> str:
    """Genera un código estructurado CTA-NAT-RUB-SEQQ-TK."""
    return f"{cta}-{nat}-{rub}-{seq:04d}-{tk}"


def item_class_from_nat(nat: str) -> str:
    return NAT_TO_CLASS.get(nat, "INSUMOS")
