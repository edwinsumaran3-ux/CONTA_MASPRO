from __future__ import annotations

import base64
import json
import mimetypes
import re
from decimal import Decimal, ROUND_HALF_UP
from typing import Any

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from src.api.dependencies import get_current_context
from src.config import settings

router = APIRouter(prefix="/purchases", tags=["Purchases IA"])


def _decimal(value: Any, default: str = "0.00") -> Decimal:
    try:
        if value is None or value == "":
            return Decimal(default).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        clean = str(value).strip().replace("S/", "").replace("s/", "").replace(" ", "")
        if clean.count(",") == 1 and clean.count(".") == 0:
            clean = clean.replace(",", ".")
        else:
            clean = clean.replace(",", "")
        return Decimal(clean).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    except Exception:
        return Decimal(default).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def _money(value: Any) -> str:
    return str(_decimal(value))


def _normalize_code(value: Any, fallback: str = "659101") -> str:
    clean = "".join(ch for ch in str(value or "") if ch.isdigit())
    return clean or fallback


def _extract_json(text: str) -> dict[str, Any]:
    text = (text or "{}").strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?", "", text, flags=re.IGNORECASE).strip()
        text = re.sub(r"```$", "", text).strip()
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        start = text.find("{")
        end = text.rfind("}")
        if start < 0 or end < 0 or end <= start:
            raise
        data = json.loads(text[start : end + 1])
    if not isinstance(data, dict):
        raise ValueError("Gemini no devolvió un objeto JSON")
    return data


def _pcge_and_tax_instruction() -> str:
    return r'''
BIBLIOTECA CONTABLE/TRIBUTARIA PERUANA PARA CLASIFICACION:

PRINCIPIO RECTOR:
- El total impreso/visible del comprobante manda. No recalcules el total ignorando cargos, deuda anterior, pagos a cuenta, saldos a favor, redondeos, mora, intereses, alumbrado publico u otros conceptos pequeños.
- La suma del asiento debe cuadrar exactamente contra el total a pagar, salvo detraccion/retencion/percepcion expresamente mostrada.
- Si existe diferencia por lectura o redondeo, crea una linea separada de ajuste y marca la razon. No alteres arbitrariamente los conceptos leidos.

IDENTIFICACION ESTRICTA DE PROVEEDOR:
- supplier_ruc debe ser el RUC DEL EMISOR/PROVEEDOR, no el RUC/DNI del cliente, no el codigo de suministro, no el numero de recibo, no el numero de medidor, no el codigo de pago.
- supplier_name debe ser la razon social/nombre del EMISOR/PROVEEDOR.
- En recibos de servicios publicos, el proveedor suele estar en el encabezado con logo y RUC. Ejemplos: Hidrandina, Enel, Luz del Sur, Sedapal, Claro, Movistar, Entel, Bitel, Calidda.
- Si ves varios RUC, decide asi: el RUC junto al logo/razon social del emisor es supplier_ruc; el RUC/DNI junto a "cliente", "suministro", "titular", "usuario" NO es proveedor.
- Si no puedes leer con certeza el RUC del proveedor, deja supplier_ruc vacio y agrega warning. No inventes RUC.
- Si no puedes leer razon social del proveedor, deja supplier_name vacio y agrega warning. No uses el nombre del cliente como proveedor.

PCGE / CUENTAS SUGERIDAS:
- 636101 Servicios basicos: agua, alcantarillado, electricidad, energia activa, cargo fijo, reposicion/mantenimiento del servicio, gas, internet, telefonia usados por la empresa.
- 40111 IGV credito fiscal: solo el IGV del consumo/servicio actual gravado que cumpla requisitos formales, causalidad, comprobante valido, anotacion oportuna y proveedor habilitado.
- 4212 Cuentas por pagar comerciales: total pendiente del comprobante actual.
- 421201 Cuentas por pagar - deuda anterior/saldo previo: deuda anterior, saldo anterior, recibo vencido, deuda pendiente, saldo acumulado, cuota anterior. No es gasto nuevo y no genera IGV nuevo.
- 422 o 4212 anticipo/compensacion: pago a cuenta, abono anterior, saldo a favor, credito aplicado, compensacion. No es gasto nuevo y no genera IGV nuevo.
- 659101 Otros gastos de gestion / gastos observados: mora, penalidad, recargo, intereses por atraso, gastos no identificados. Deducibilidad REVISION y sustento obligatorio.
- 759901 Otros ingresos/ajuste menor: redondeo a favor de la empresa o ajuste acreedor menor, si corresponde.
- 632101 Asesoria y consultoria: servicios profesionales, legales, contables, auditoria, consultoria.
- 624101 Transportes y fletes: transporte, flete, courier, delivery logistico.
- 634101 Mantenimiento y reparaciones.
- 635101 Alquileres.
- 637101 Publicidad y marketing.
- 656101 Suministros diversos: utiles, limpieza, oficina.
- 601101 Compras de mercaderias: productos para venta/inventario.
- 336101 Activo fijo - equipos diversos: laptop, equipos, maquinaria, mobiliario, vehiculo, si corresponde activar.

CRITERIO DE SERVICIOS PUBLICOS:
- Conceptos como agua, alcantarillado, energia activa, cargo fijo, reposicion y mantenimiento: gasto actual 636101, centro de costo operativo/administrativo.
- Alumbrado publico, redondeo, otros cargos regulados: analizar separado. Si forma parte del recibo y es deducible por causalidad, puede ir a 636101 o ajuste menor segun materialidad; indicar criterio.
- Deuda anterior/saldo anterior/recibo anterior: NO clasificar como gasto actual; usar 421201 o linea de obligacion previa, sin IGV nuevo; requiere revisar si ya fue contabilizado.
- Pago a cuenta/saldo a favor/abono: NO clasificar como gasto; usar compensacion/anticipo/reduccion de CXP.
- Mora/interes/penalidad por pago tardio: NO mezclar con gasto operativo; usar cuenta separada y marcar REVISION.

CENTROS DE COSTO:
- Asigna centro por linea. No basta centro general.
- LIM-ADM: administracion/oficina general, servicios basicos administrativos.
- LIM-COM: comercial/ventas, local comercial, showroom, atencion clientes.
- FIN-TES: tesoreria, bancos, finanzas.
- FIN-CXP: cuentas por pagar.
- FIN-CXC: cuentas por cobrar.
- TI-CORE: sistemas, software, internet de infraestructura, nube, tecnologia.
- OPS-PROD: produccion, operaciones, planta.
- LOG-ALM: almacen, logistica, distribucion.
- RRHH: recursos humanos.
- GER: gerencia.
- Si el documento no evidencia area, usa el centro de costo general recibido del sistema y explica el motivo.
- Cuentas clase 6 o 9 deben tener centro de costo real, salvo impuestos/obligaciones previas/IGV/CXP.

VALIDACIONES LEGALES/TRIBUTARIAS:
- Causalidad: gasto vinculado con la generacion o mantenimiento de renta.
- Fehaciencia: comprobante legible, proveedor identificable, detalle razonable, sustento documental.
- IGV credito fiscal: operacion gravada, comprobante valido, RUC proveedor, anotacion oportuna, destino a operaciones gravadas.
- Bancarizacion: marcar true si el total supera umbral/politica o si corresponde medio de pago verificable.
- Detraccion/retencion/percepcion: marcar revision si el servicio/producto puede estar sujeto.
- No deducible/observado: multas, penalidades, gastos personales, conceptos no vinculados, deuda previa ya registrada, intereses por atraso sin sustento.

FORMATO JSON OBLIGATORIO:
Devuelve SOLO JSON valido, sin markdown, sin texto adicional.
Campos obligatorios:
{
  "document_type": "01|03|14|RECIBO_SERVICIO|OTRO",
  "serie": "",
  "number": "",
  "issue_date": "YYYY-MM-DD",
  "due_date": "YYYY-MM-DD",
  "period": "YYYY-MM",
  "supplier_ruc": "",
  "supplier_name": "",
  "customer_or_supply_code": "",
  "currency": "PEN",
  "subtotal": "0.00",
  "igv": "0.00",
  "non_taxed_amount": "0.00",
  "exempt_amount": "0.00",
  "other_charges": "0.00",
  "prior_balance": "0.00",
  "advance_payment": "0.00",
  "late_fee_or_interest": "0.00",
  "rounding_adjustment": "0.00",
  "total": "0.00",
  "total_read_from_document": "0.00",
  "reconciliation_status": "OK|OBSERVED|REQUIRES_REVIEW",
  "reconciliation_difference": "0.00",
  "cost_center": "LIM-ADM",
  "expense_account": "636101",
  "items": [
    {
      "code": "",
      "description": "",
      "unit": "UND",
      "quantity": "1.00",
      "unit_price": "0.00",
      "line_subtotal": "0.00",
      "taxable": true,
      "igv_amount": "0.00",
      "total_line": "0.00",
      "account_code": "",
      "account_name": "",
      "cost_center": "",
      "line_type": "CURRENT_EXPENSE|PRIOR_BALANCE|ADVANCE_PAYMENT|TAX|PAYABLE|ROUNDING|LATE_FEE|ASSET|INVENTORY|OTHER",
      "tax_treatment": "",
      "deductibility": "DEDUCIBLE|NO_DEDUCIBLE|OBSERVADO|REVISION",
      "igv_credit": "SI|NO|REVISION",
      "requires_bancarization": false,
      "requires_detraccion_review": false,
      "requires_support": false,
      "ai_reason": "",
      "ai_confidence": 0.00
    }
  ],
  "account_lines": [
    {
      "account_code": "",
      "account_name": "",
      "cost_center": "",
      "debit": "0.00",
      "credit": "0.00",
      "line_type": "EXPENSE_OR_ASSET|TAX|PAYABLE|PRIOR_BALANCE|ADVANCE_PAYMENT|ROUNDING|LATE_FEE|WITHHOLDING|DETRACTION|PERCEPTION",
      "tax_treatment": "",
      "audit_note": ""
    }
  ],
  "accounts_to_upsert": [],
  "cost_centers_to_upsert": [],
  "audit_metadata": {
    "document_quality": "GOOD|MEDIUM|LOW",
    "ocr_warnings": [],
    "tax_warnings": [],
    "accounting_warnings": [],
    "legal_warnings": [],
    "reconciliation_notes": [],
    "requires_human_review": false,
    "review_reason": ""
  },
  "warnings": []
}

REGLA FINAL ANTES DE RESPONDER:
- Verifica que suma(debit) = suma(credit).
- Verifica que el total de PAYABLE coincida con total_read_from_document ajustado por retenciones/detracciones/percepciones, si corresponde.
- Verifica que total = total_read_from_document.
- Verifica que todo gasto clase 6/9 tenga centro de costo.
- Si no cuadra, no fuerces: marca REQUIRES_REVIEW y explica la diferencia.
'''


def _normalize_gemini_response(data: dict[str, Any]) -> dict[str, Any]:
    warnings = list(data.get("warnings") or [])
    audit = data.get("audit_metadata") if isinstance(data.get("audit_metadata"), dict) else {}
    audit.setdefault("ocr_warnings", [])
    audit.setdefault("tax_warnings", [])
    audit.setdefault("accounting_warnings", [])
    audit.setdefault("legal_warnings", [])
    audit.setdefault("reconciliation_notes", [])

    data.setdefault("items", [])
    data.setdefault("account_lines", [])
    data.setdefault("accounts_to_upsert", [])
    data.setdefault("cost_centers_to_upsert", [])
    data.setdefault("cost_center", "LIM-ADM")
    data.setdefault("expense_account", "636101")
    data.setdefault("currency", "PEN")

    if not str(data.get("supplier_ruc") or "").strip():
        warnings.append("No se pudo confirmar el RUC del proveedor/emisor. Requiere revisión manual.")
        audit["ocr_warnings"].append("supplier_ruc vacío o no confiable")
    if not str(data.get("supplier_name") or "").strip():
        warnings.append("No se pudo confirmar la razón social del proveedor/emisor. Requiere revisión manual.")
        audit["ocr_warnings"].append("supplier_name vacío o no confiable")

    total_read = _decimal(data.get("total_read_from_document") or data.get("total"))
    data["total_read_from_document"] = _money(total_read)
    data["total"] = _money(total_read)

    # Normalizar importes de items y detectar deuda/pagos/cargos especiales aunque Gemini no los marque bien.
    normalized_items = []
    for item in data.get("items") or []:
        if not isinstance(item, dict):
            continue
        desc = str(item.get("description") or "").upper()
        line_type = str(item.get("line_type") or "").upper()
        amount = _decimal(item.get("total_line") or item.get("line_subtotal") or item.get("unit_price"))

        if any(token in desc for token in ["DEUDA", "SALDO ANTERIOR", "RECIBO ANTERIOR", "VENCIDO", "PENDIENTE"]):
            item["line_type"] = "PRIOR_BALANCE"
            item["taxable"] = False
            item["igv_amount"] = "0.00"
            item["account_code"] = "421201"
            item["account_name"] = "Cuentas por pagar - deuda anterior"
            item["cost_center"] = "-"
            item["igv_credit"] = "NO"
            item["deductibility"] = "REVISION"
            item["requires_support"] = True
            item["tax_treatment"] = "Saldo anterior u obligación previa. No representa gasto nuevo ni genera nuevo crédito fiscal. Validar si ya fue contabilizado."
        elif any(token in desc for token in ["PAGO A CUENTA", "ABONO", "SALDO A FAVOR", "CREDITO", "COMPENSACION"]):
            item["line_type"] = "ADVANCE_PAYMENT"
            item["taxable"] = False
            item["igv_amount"] = "0.00"
            item["account_code"] = "4212"
            item["account_name"] = "Compensación / pago a cuenta"
            item["cost_center"] = "-"
            item["igv_credit"] = "NO"
            item["deductibility"] = "REVISION"
            item["requires_support"] = True
            item["tax_treatment"] = "Pago a cuenta, abono o saldo a favor. No es gasto nuevo ni genera IGV."
        elif any(token in desc for token in ["MORA", "INTERES", "PENALIDAD", "RECARGO", "ATRASO"]):
            item["line_type"] = "LATE_FEE"
            item["taxable"] = False
            item["igv_amount"] = "0.00"
            item.setdefault("account_code", "659101")
            item.setdefault("account_name", "Otros gastos de gestión - recargos/moras")
            item.setdefault("cost_center", data.get("cost_center") or "LIM-ADM")
            item["igv_credit"] = "NO"
            item["deductibility"] = "REVISION"
            item["requires_support"] = True
            item["tax_treatment"] = "Mora/interés/recargo por atraso. Separar del gasto operativo y revisar deducibilidad."
        else:
            item.setdefault("line_type", line_type or "CURRENT_EXPENSE")
            item.setdefault("account_code", "636101")
            item.setdefault("account_name", "Servicios básicos")
            item.setdefault("cost_center", data.get("cost_center") or "LIM-ADM")
            item.setdefault("tax_treatment", "IGV crédito fiscal si cumple causalidad, comprobante válido y anotación oportuna.")
            item.setdefault("deductibility", "DEDUCIBLE")
            item.setdefault("igv_credit", "SI")

        item["line_subtotal"] = _money(item.get("line_subtotal") or amount)
        item["unit_price"] = _money(item.get("unit_price") or item.get("line_subtotal") or amount)
        item["total_line"] = _money(item.get("total_line") or amount)
        item["quantity"] = str(item.get("quantity") or "1.00")
        item["ai_confidence"] = float(item.get("ai_confidence") or 0.85)
        normalized_items.append(item)
    data["items"] = normalized_items

    debit_sum = sum(_decimal(line.get("debit")) for line in data.get("account_lines") or [] if isinstance(line, dict))
    credit_sum = sum(_decimal(line.get("credit")) for line in data.get("account_lines") or [] if isinstance(line, dict))
    if data.get("account_lines") and debit_sum != credit_sum:
        diff = (debit_sum - credit_sum).quantize(Decimal("0.01"))
        data["reconciliation_status"] = "REQUIRES_REVIEW"
        data["reconciliation_difference"] = str(diff)
        audit["reconciliation_notes"].append(f"Asiento IA descuadrado: Debe {debit_sum} vs Haber {credit_sum}.")
        warnings.append(f"Asiento IA descuadrado: Debe {debit_sum} vs Haber {credit_sum}.")
    else:
        data.setdefault("reconciliation_status", "OK")
        data.setdefault("reconciliation_difference", "0.00")

    data["audit_metadata"] = audit
    data["warnings"] = list(dict.fromkeys(str(w) for w in warnings if w))
    return data


@router.post("/process-ia")
async def process_purchase_with_gemini(
    file: UploadFile = File(...),
    ctx=Depends(get_current_context),
):
    if not settings.gemini_api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY no configurado")

    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Archivo vacío")

    mime_type = file.content_type or mimetypes.guess_type(file.filename or "")[0] or "application/octet-stream"
    encoded = base64.b64encode(raw).decode("utf-8")

    try:
        import google.generativeai as genai
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Falta instalar google-generativeai. Ejecuta: pip install google-generativeai",
        ) from exc

    tenant_id = ctx.get("tenant_id", "")
    prompt = f'''
Eres un motor experto senior de OCR, contabilidad peruana, tributación, auditoría, PCGE, SIRE/Registro de Compras y análisis legal-documentario para un ERP empresarial.

Analiza el archivo pixel por pixel si es imagen o PDF. Prioriza la lectura visual del comprobante, encabezados, logos, RUC del emisor, totales impresos, tablas de conceptos, importes facturados, notas de deuda/saldos y códigos de suministro.

Contexto del sistema:
- tenant_id: {tenant_id}
- centro de costo general de respaldo: LIM-ADM
- moneda por defecto: PEN

{_pcge_and_tax_instruction()}
'''

    try:
        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel(settings.gemini_model or "gemini-1.5-pro")
        result = model.generate_content(
            [
                prompt,
                {
                    "mime_type": mime_type,
                    "data": encoded,
                },
            ],
            generation_config={
                "temperature": 0.0,
                "response_mime_type": "application/json",
            },
        )

        data = _extract_json(result.text or "{}")
        return _normalize_gemini_response(data)

    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=502, detail=f"Gemini devolvió JSON inválido: {str(exc)}") from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Error Gemini: {str(exc)}") from exc
