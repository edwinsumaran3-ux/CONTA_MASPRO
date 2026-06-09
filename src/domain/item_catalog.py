"""
Catálogo maestro de artículos de almacén — versión Python.
Espejo de itemCatalog.ts. Usado por la IA de compras para asignar
códigos estructurados CTA-NAT-RUB-SEQQ-TK al detectar bienes físicos.
Multi-empresa: el código de catálogo es universal; el producto en BD es por empresa.
"""
from __future__ import annotations

# ──────────────────────────────────────────────────────────────────────────────
# NATURALEZA → sufijo de token code e item_class
# ──────────────────────────────────────────────────────────────────────────────
NAT_TO_CLASS: dict[str, str] = {
    "SU": "INSUMOS", "CO": "INSUMOS", "EP": "INSUMOS", "LI": "INSUMOS",
    "GA": "INSUMOS", "TI": "INSUMOS", "AG": "INSUMOS", "AL": "INSUMOS",
    "ME": "MERCADERIA", "MD": "MERCADERIA",
    "MP": "MATERIA_PRIMA", "MC": "MATERIA_PRIMA", "MM": "MATERIA_PRIMA",
    "MA": "MATERIA_PRIMA", "MF": "MATERIA_PRIMA",
    "RM": "INSUMOS", "RE": "INSUMOS", "RN": "INSUMOS", "RI": "INSUMOS",
    "MQ": "ACTIVO_FIJO", "EQ": "ACTIVO_FIJO", "VH": "ACTIVO_FIJO",
    "HT": "HERRAMIENTAS", "HE": "HERRAMIENTAS", "HM": "HERRAMIENTAS", "MU": "ACTIVO_FIJO",
    "EX": "INSUMOS", "QU": "INSUMOS", "EC": "INSUMOS", "CB": "INSUMOS",
}

# ──────────────────────────────────────────────────────────────────────────────
# CATÁLOGO MAESTRO
# Formato: code, name, cta, nat, rub, tk, unit, gasto, gasto_name, ai_keywords
# ──────────────────────────────────────────────────────────────────────────────
CATALOG: list[dict] = [
    # ── SUMINISTROS GENERALES ─────────────────────────────────────────────────
    {"code":"252-SU-GE-0001-F","name":"Papel Bond A4 75g (millar)","cta":"252","nat":"SU","rub":"GE","tk":"F","unit":"MIL","gasto":"6561","gasto_name":"Útiles de oficina","ai_keywords":["papel","bond","a4","fotocopia","millar","resma","papel bond a4","papel fotocopia"]},
    {"code":"252-SU-GE-0002-F","name":"Papel Bond A4 80g (millar)","cta":"252","nat":"SU","rub":"GE","tk":"F","unit":"MIL","gasto":"6561","gasto_name":"Útiles de oficina","ai_keywords":["papel bond 80","papel a4 80g","resma 80g"]},
    {"code":"252-SU-GE-0003-F","name":"Papel Bond A3 75g (millar)","cta":"252","nat":"SU","rub":"GE","tk":"F","unit":"MIL","gasto":"6561","gasto_name":"Útiles de oficina","ai_keywords":["papel a3","bond a3","papel plano"]},
    {"code":"252-SU-GE-0004-F","name":"Tóner impresora HP LaserJet","cta":"252","nat":"SU","rub":"GE","tk":"F","unit":"UND","gasto":"6561","gasto_name":"Útiles de oficina","ai_keywords":["toner","cartucho","hp","laser","impresora","laserjet","toner hp"]},
    {"code":"252-SU-GE-0005-F","name":"Tóner impresora Epson / Canon","cta":"252","nat":"SU","rub":"GE","tk":"F","unit":"UND","gasto":"6561","gasto_name":"Útiles de oficina","ai_keywords":["toner epson","cartucho epson","toner canon","inyeccion","cartuchos tinta"]},
    {"code":"252-SU-GE-0006-F","name":"Útiles de escritorio (set)","cta":"252","nat":"SU","rub":"GE","tk":"F","unit":"SET","gasto":"6561","gasto_name":"Útiles de oficina","ai_keywords":["utiles","escritorio","lapiz","boligrafo","archivador","folder","utiles oficina"]},
    {"code":"252-SU-GE-0007-F","name":"Archivadores y fólderes","cta":"252","nat":"SU","rub":"GE","tk":"F","unit":"UND","gasto":"6561","gasto_name":"Útiles de oficina","ai_keywords":["archivador","folder","legajador","manila","palanca"]},
    {"code":"252-SU-GE-0008-F","name":"Cinta adhesiva / masking tape","cta":"252","nat":"SU","rub":"GE","tk":"F","unit":"UND","gasto":"6561","gasto_name":"Útiles de oficina","ai_keywords":["cinta","scotch","masking","adhesiva","tape","cinta adhesiva"]},
    {"code":"252-SU-GE-0009-F","name":"Bolígrafo/lapicero (caja x12)","cta":"252","nat":"SU","rub":"GE","tk":"F","unit":"CAJ","gasto":"6561","gasto_name":"Útiles de oficina","ai_keywords":["boligrafo","lapicero","biro","birome","esfero","caja lapiceros"]},
    {"code":"252-SU-GE-0010-F","name":"Lápiz HB grafito (caja x12)","cta":"252","nat":"SU","rub":"GE","tk":"F","unit":"CAJ","gasto":"6561","gasto_name":"Útiles de oficina","ai_keywords":["lapiz","hb","grafito","lapiz hb","caja lapices"]},
    {"code":"252-SU-GE-0011-F","name":"Marcador permanente (caja x12)","cta":"252","nat":"SU","rub":"GE","tk":"F","unit":"CAJ","gasto":"6561","gasto_name":"Útiles de oficina","ai_keywords":["marcador","permanente","marcador indeleble","indeleble","sharpie"]},
    {"code":"252-SU-GE-0012-F","name":"Resaltador fluorescente (set x4)","cta":"252","nat":"SU","rub":"GE","tk":"F","unit":"SET","gasto":"6561","gasto_name":"Útiles de oficina","ai_keywords":["resaltador","fluorescente","highlighter","marcador fluorescente"]},
    {"code":"252-SU-GE-0013-F","name":"Corrector líquido / cinta correctora","cta":"252","nat":"SU","rub":"GE","tk":"F","unit":"UND","gasto":"6561","gasto_name":"Útiles de oficina","ai_keywords":["corrector","liquido","liquid paper","cinta correctora","corrector liquido"]},
    {"code":"252-SU-GE-0014-F","name":"Tijeras de escritorio","cta":"252","nat":"SU","rub":"GE","tk":"F","unit":"UND","gasto":"6561","gasto_name":"Útiles de oficina","ai_keywords":["tijeras","tijera","tijeras de escritorio","tijera oficina"]},
    {"code":"252-SU-GE-0015-F","name":"Grapadora de escritorio metálica","cta":"252","nat":"SU","rub":"GE","tk":"F","unit":"UND","gasto":"6561","gasto_name":"Útiles de oficina","ai_keywords":["grapadora","engrapadora","grapas","grapadora metalica"]},
    {"code":"252-SU-GE-0016-F","name":"Grapas 26/6 (caja x1000)","cta":"252","nat":"SU","rub":"GE","tk":"F","unit":"CAJ","gasto":"6561","gasto_name":"Útiles de oficina","ai_keywords":["grapas","26/6","caja grapas","grapas x1000"]},
    {"code":"252-SU-GE-0017-F","name":"Perforadora 2 agujeros","cta":"252","nat":"SU","rub":"GE","tk":"F","unit":"UND","gasto":"6561","gasto_name":"Útiles de oficina","ai_keywords":["perforadora","perforadora 2 agujeros","horadadora","perforador"]},
    {"code":"252-SU-GE-0018-F","name":"Clips/sujetapapeles (caja x100)","cta":"252","nat":"SU","rub":"GE","tk":"F","unit":"CAJ","gasto":"6561","gasto_name":"Útiles de oficina","ai_keywords":["clips","sujetapapeles","clip metalico","caja clips"]},
    {"code":"252-SU-GE-0019-F","name":"Fastener palanca metálico (caja)","cta":"252","nat":"SU","rub":"GE","tk":"F","unit":"CAJ","gasto":"6561","gasto_name":"Útiles de oficina","ai_keywords":["fastener","palanca","fastener metalico","palanca archivador"]},
    {"code":"252-SU-GE-0020-F","name":"Notas adhesivas Post-It (set x4)","cta":"252","nat":"SU","rub":"GE","tk":"F","unit":"SET","gasto":"6561","gasto_name":"Útiles de oficina","ai_keywords":["post-it","notas adhesivas","nota adhesiva","sticky notes"]},
    {"code":"252-SU-GE-0021-F","name":"Cuaderno cuadriculado A4 96h","cta":"252","nat":"SU","rub":"GE","tk":"F","unit":"UND","gasto":"6561","gasto_name":"Útiles de oficina","ai_keywords":["cuaderno","cuadriculado","cuaderno a4","cuaderno 96 hojas"]},
    {"code":"252-SU-GE-0022-F","name":"Calculadora de escritorio 12 dígitos","cta":"252","nat":"SU","rub":"GE","tk":"F","unit":"UND","gasto":"6561","gasto_name":"Útiles de oficina","ai_keywords":["calculadora","calculadora escritorio","calculadora 12 digitos"]},
    {"code":"252-SU-GE-0023-F","name":"Regla plástica 30cm / escuadra","cta":"252","nat":"SU","rub":"GE","tk":"F","unit":"UND","gasto":"6561","gasto_name":"Útiles de oficina","ai_keywords":["regla","regla 30cm","escuadra","regla plastica"]},
    {"code":"252-SU-GE-0024-F","name":"Cutter / cuchilla de seguridad","cta":"252","nat":"SU","rub":"GE","tk":"F","unit":"UND","gasto":"6561","gasto_name":"Útiles de oficina","ai_keywords":["cutter","cuchilla","navaja cutter","cuchilla de seguridad"]},
    {"code":"252-SU-GE-0025-F","name":"Sello automático de oficina","cta":"252","nat":"SU","rub":"GE","tk":"F","unit":"UND","gasto":"6561","gasto_name":"Útiles de oficina","ai_keywords":["sello","sello automatico","estampilla","sello de oficina"]},
    {"code":"252-SU-GE-0026-F","name":"Tinta para sello (frasco)","cta":"252","nat":"SU","rub":"GE","tk":"F","unit":"UND","gasto":"6561","gasto_name":"Útiles de oficina","ai_keywords":["tinta sello","tinta para sello","tinta estampilla"]},
    {"code":"252-SU-GE-0027-F","name":"Sobre Manila oficio (ciento)","cta":"252","nat":"SU","rub":"GE","tk":"F","unit":"CTO","gasto":"6561","gasto_name":"Útiles de oficina","ai_keywords":["sobre manila","sobre oficio","manila oficio","ciento sobres"]},
    {"code":"252-SU-GE-0028-F","name":"Caja de archivo muerta","cta":"252","nat":"SU","rub":"GE","tk":"F","unit":"UND","gasto":"6561","gasto_name":"Útiles de oficina","ai_keywords":["caja archivo","caja muerta","caja archivadora","archivo muerto"]},
    {"code":"252-SU-GE-0029-F","name":"Etiquetas autoadhesivas (hoja A4)","cta":"252","nat":"SU","rub":"GE","tk":"F","unit":"HOJ","gasto":"6561","gasto_name":"Útiles de oficina","ai_keywords":["etiquetas","autoadhesivas","etiqueta adhesiva","stickers etiquetas"]},
    {"code":"252-SU-GE-0030-F","name":"Papel térmico 80mm x 50m (rollo)","cta":"252","nat":"SU","rub":"GE","tk":"F","unit":"ROL","gasto":"6561","gasto_name":"Útiles de oficina","ai_keywords":["papel termico","rollo termico","80mm","caja registradora","ticket termico"]},
    {"code":"252-SU-GE-0031-F","name":"Memoria USB 32GB","cta":"252","nat":"SU","rub":"GE","tk":"F","unit":"UND","gasto":"6561","gasto_name":"Útiles de oficina","ai_keywords":["usb","32gb","pendrive","memoria usb","memoria flash 32gb"]},
    {"code":"252-SU-GE-0032-F","name":"Plumones/marcadores de pizarra (set)","cta":"252","nat":"SU","rub":"GE","tk":"F","unit":"SET","gasto":"6561","gasto_name":"Útiles de oficina","ai_keywords":["plumones pizarra","marcador pizarra","marcador borrable","tiza liquida"]},
    {"code":"252-SU-GE-0033-F","name":"Cinta de embalaje/strapping (rollo)","cta":"252","nat":"SU","rub":"GE","tk":"F","unit":"ROL","gasto":"6561","gasto_name":"Útiles de oficina","ai_keywords":["cinta embalaje","strapping","cinta de embalaje","cinta packing"]},
    {"code":"252-SU-GE-0034-F","name":"Folder colgante / archivador colgante","cta":"252","nat":"SU","rub":"GE","tk":"F","unit":"UND","gasto":"6561","gasto_name":"Útiles de oficina","ai_keywords":["folder colgante","archivador colgante","carpeta colgante"]},
    {"code":"252-SU-GE-0035-F","name":"Agenda ejecutiva anual","cta":"252","nat":"SU","rub":"GE","tk":"F","unit":"UND","gasto":"6561","gasto_name":"Útiles de oficina","ai_keywords":["agenda","ejecutiva","agenda anual","agenda ejecutiva"]},
    # ── COMBUSTIBLES Y LUBRICANTES ────────────────────────────────────────────
    {"code":"252-CO-GE-0001-F","name":"Gasolina 84 octanos (galón)","cta":"252","nat":"CO","rub":"GE","tk":"F","unit":"GLN","gasto":"6562","gasto_name":"Combustibles y lubricantes","ai_keywords":["gasolina","84","combustible","gasohol","galones","gasolina 84"]},
    {"code":"252-CO-GE-0002-F","name":"Gasolina 90 octanos (galón)","cta":"252","nat":"CO","rub":"GE","tk":"F","unit":"GLN","gasto":"6562","gasto_name":"Combustibles y lubricantes","ai_keywords":["gasolina 90","combustible 90","gasohol 90"]},
    {"code":"252-CO-GE-0003-F","name":"Gasolina 95 octanos (galón)","cta":"252","nat":"CO","rub":"GE","tk":"F","unit":"GLN","gasto":"6562","gasto_name":"Combustibles y lubricantes","ai_keywords":["gasolina 95","combustible 95","premium 95","gasolina premium"]},
    {"code":"252-CO-GE-0004-F","name":"Petróleo Diesel B5 (galón)","cta":"252","nat":"CO","rub":"GE","tk":"F","unit":"GLN","gasto":"6562","gasto_name":"Combustibles y lubricantes","ai_keywords":["diesel","petroleo","b5","combustible","gasoil","diesel b5"]},
    {"code":"252-CO-GE-0005-F","name":"Gas Natural Vehicular GNV (m³)","cta":"252","nat":"CO","rub":"GE","tk":"F","unit":"M3","gasto":"6562","gasto_name":"Combustibles y lubricantes","ai_keywords":["gnv","gas natural vehicular","gas comprimido"]},
    {"code":"252-CO-GE-0006-F","name":"Aceite motor SAE 20W50 (galón)","cta":"252","nat":"CO","rub":"GE","tk":"F","unit":"GLN","gasto":"6562","gasto_name":"Combustibles y lubricantes","ai_keywords":["aceite","motor","20w50","lubricante","sae","aceite motor 20w50"]},
    {"code":"252-CO-GE-0007-F","name":"Aceite motor SAE 15W40 (galón)","cta":"252","nat":"CO","rub":"GE","tk":"F","unit":"GLN","gasto":"6562","gasto_name":"Combustibles y lubricantes","ai_keywords":["aceite 15w40","lubricante 15w40"]},
    {"code":"252-CO-GE-0008-F","name":"Grasa multiusos (kg)","cta":"252","nat":"CO","rub":"GE","tk":"F","unit":"KGM","gasto":"6562","gasto_name":"Combustibles y lubricantes","ai_keywords":["grasa","lubricante","industrial","multiuso","grasa industrial"]},
    {"code":"252-CO-GE-0009-F","name":"Aceite de caja/transmisión SAE 80W90 (galón)","cta":"252","nat":"CO","rub":"GE","tk":"F","unit":"GLN","gasto":"6562","gasto_name":"Combustibles y lubricantes","ai_keywords":["aceite caja","aceite transmision","80w90","sae 80w90"]},
    {"code":"252-CO-GE-0010-F","name":"Aceite diferencial SAE 90 (galón)","cta":"252","nat":"CO","rub":"GE","tk":"F","unit":"GLN","gasto":"6562","gasto_name":"Combustibles y lubricantes","ai_keywords":["aceite diferencial","sae 90","diferencial 90"]},
    {"code":"252-CO-GE-0011-F","name":"Aceite hidráulico ISO 68 (galón)","cta":"252","nat":"CO","rub":"GE","tk":"F","unit":"GLN","gasto":"6562","gasto_name":"Combustibles y lubricantes","ai_keywords":["aceite hidraulico","hidraulico iso 68","fluido hidraulico"]},
    {"code":"252-CO-GE-0012-F","name":"Refrigerante/anticongelante (galón)","cta":"252","nat":"CO","rub":"GE","tk":"F","unit":"GLN","gasto":"6562","gasto_name":"Combustibles y lubricantes","ai_keywords":["refrigerante","anticongelante","coolant","liquido refrigerante"]},
    {"code":"252-CO-GE-0013-F","name":"Líquido de frenos DOT3/DOT4 (litro)","cta":"252","nat":"CO","rub":"GE","tk":"F","unit":"LTR","gasto":"6562","gasto_name":"Combustibles y lubricantes","ai_keywords":["liquido frenos","dot3","dot4","brake fluid","liquido de frenos"]},
    {"code":"252-CO-GE-0014-F","name":"Aceite dirección hidráulica (litro)","cta":"252","nat":"CO","rub":"GE","tk":"F","unit":"LTR","gasto":"6562","gasto_name":"Combustibles y lubricantes","ai_keywords":["aceite direccion hidraulica","fluido direccion","power steering"]},
    {"code":"252-CO-GE-0015-F","name":"Agua destilada (bidón 5L)","cta":"252","nat":"CO","rub":"GE","tk":"F","unit":"UND","gasto":"6562","gasto_name":"Combustibles y lubricantes","ai_keywords":["agua destilada","agua desmineralizada","bidon agua destilada"]},
    {"code":"252-CO-GE-0016-F","name":"Aceite 2 tiempos (litro)","cta":"252","nat":"CO","rub":"GE","tk":"F","unit":"LTR","gasto":"6562","gasto_name":"Combustibles y lubricantes","ai_keywords":["aceite 2 tiempos","aceite 2t","dos tiempos","2-stroke"]},
    # ── EPP — EQUIPOS DE PROTECCIÓN PERSONAL ─────────────────────────────────
    {"code":"252-EP-GE-0001-F","name":"Casco de seguridad Clase E","cta":"252","nat":"EP","rub":"GE","tk":"F","unit":"UND","gasto":"6564","gasto_name":"Suministros - EPP","ai_keywords":["casco","seguridad","industrial","obra","clase e","casco seguridad","casco de obra","casco industrial","casco proteccion"]},
    {"code":"252-EP-GE-0002-F","name":"Guantes de cuero/nitrilo","cta":"252","nat":"EP","rub":"GE","tk":"F","unit":"PAR","gasto":"6564","gasto_name":"Suministros - EPP","ai_keywords":["guantes","cuero","nitrilo","seguridad","proteccion","guantes de trabajo","guantes industriales","guantes seguridad"]},
    {"code":"252-EP-GE-0003-F","name":"Lentes de seguridad luna clara","cta":"252","nat":"EP","rub":"GE","tk":"F","unit":"UND","gasto":"6564","gasto_name":"Suministros - EPP","ai_keywords":["lentes","gafas","seguridad","industrial","luna","lentes seguridad","gafas proteccion","lentes industriales","gafas de seguridad"]},
    {"code":"252-EP-GE-0004-F","name":"Zapatos de seguridad punta acero","cta":"252","nat":"EP","rub":"GE","tk":"F","unit":"PAR","gasto":"6564","gasto_name":"Suministros - EPP","ai_keywords":["zapatos","botas","seguridad","calzado","zapatos punta acero","botas punta acero","calzado de seguridad","zapatos de seguridad","botas seguridad industrial","botas industriales"]},
    {"code":"252-EP-GE-0005-F","name":"Chaleco de seguridad reflectivo","cta":"252","nat":"EP","rub":"GE","tk":"F","unit":"UND","gasto":"6564","gasto_name":"Suministros - EPP","ai_keywords":["chaleco","seguridad","reflectivo","naranja","alta visibilidad","chaleco reflectivo","chaleco seguridad","chaleco naranja"]},
    {"code":"252-EP-GE-0006-F","name":"Protector de oídos (tapones)","cta":"252","nat":"EP","rub":"GE","tk":"F","unit":"PAR","gasto":"6564","gasto_name":"Suministros - EPP","ai_keywords":["tapones","oidos","protector","auditivo","orejeras","tapones de oidos","protector auditivo"]},
    {"code":"252-EP-GE-0007-F","name":"Mascarilla N95 respiratoria","cta":"252","nat":"EP","rub":"GE","tk":"F","unit":"UND","gasto":"6564","gasto_name":"Suministros - EPP","ai_keywords":["mascarilla","n95","respirador","proteccion","facial","mascarilla n95","respirador n95","mascarilla respiratoria","mascarilla industrial"]},
    {"code":"252-EP-GE-0008-F","name":"Arnés de seguridad altura","cta":"252","nat":"EP","rub":"GE","tk":"F","unit":"UND","gasto":"6564","gasto_name":"Suministros - EPP","ai_keywords":["arnes","seguridad","altura","cinturon","caida","arnes de seguridad","arnes altura","cinturon seguridad"]},
    {"code":"252-EP-GE-0009-F","name":"Uniforme de trabajo (overol)","cta":"252","nat":"EP","rub":"GE","tk":"F","unit":"UND","gasto":"6564","gasto_name":"Suministros - EPP","ai_keywords":["overol","uniforme","trabajo","overall","mameluco","ropa de trabajo"]},
    {"code":"252-EP-GE-0010-F","name":"Cono de señalización vial","cta":"252","nat":"EP","rub":"GE","tk":"F","unit":"UND","gasto":"6564","gasto_name":"Suministros - EPP","ai_keywords":["cono","señalizacion","vial","cono de seguridad","cono naranja","señal de seguridad"]},
    {"code":"252-EP-GE-0011-F","name":"Extintor PQS 6kg","cta":"252","nat":"EP","rub":"GE","tk":"F","unit":"UND","gasto":"6564","gasto_name":"Suministros - EPP","ai_keywords":["extintor","pqs","6kg","extinguidor","polvo","quimico","extintor de incendio"]},
    {"code":"252-EP-GE-0012-F","name":"Protector facial careta","cta":"252","nat":"EP","rub":"GE","tk":"F","unit":"UND","gasto":"6564","gasto_name":"Suministros - EPP","ai_keywords":["careta","protector facial","mascara facial","shield","careto","pantalla protectora"]},
    # ── LIMPIEZA E HIGIENE ────────────────────────────────────────────────────
    {"code":"252-LI-GE-0001-F","name":"Jabón líquido antibacterial (gl)","cta":"252","nat":"LI","rub":"GE","tk":"F","unit":"GLN","gasto":"6569","gasto_name":"Suministros diversos","ai_keywords":["jabon","liquido","antibacterial","limpieza","higiene","jabon liquido","jabon industrial"]},
    {"code":"252-LI-GE-0002-F","name":"Lejía / cloro (galón)","cta":"252","nat":"LI","rub":"GE","tk":"F","unit":"GLN","gasto":"6569","gasto_name":"Suministros diversos","ai_keywords":["lejia","cloro","hipoclorito","desinfectante","blanqueador"]},
    {"code":"252-LI-GE-0003-F","name":"Papel higiénico industrial","cta":"252","nat":"LI","rub":"GE","tk":"F","unit":"PAQ","gasto":"6569","gasto_name":"Suministros diversos","ai_keywords":["papel higienico","papel bano","tissue","sanitario","papel de bano"]},
    {"code":"252-LI-GE-0004-F","name":"Detergente industrial (kg)","cta":"252","nat":"LI","rub":"GE","tk":"F","unit":"KGM","gasto":"6569","gasto_name":"Suministros diversos","ai_keywords":["detergente","polvo limpieza","limpiador","lavado","detergente industrial"]},
    {"code":"252-LI-GE-0005-F","name":"Alcohol isopropílico / gel","cta":"252","nat":"LI","rub":"GE","tk":"F","unit":"GLN","gasto":"6569","gasto_name":"Suministros diversos","ai_keywords":["alcohol","isopropilico","gel","alcohol gel","sanitizante","antibacterial gel"]},
    # ── CONSTRUCCIÓN ─────────────────────────────────────────────────────────
    {"code":"241-MC-CO-0001-F","name":"Cemento Portland Tipo I x 42.5kg","cta":"241","nat":"MC","rub":"CO","tk":"F","unit":"BOL","gasto":"6021","gasto_name":"Compras MP manufact.","ai_keywords":["cemento","portland","tipo i","42.5","saco","bolsa","cpo","cemento portland","cemento 42.5"]},
    {"code":"241-MC-CO-0002-F","name":"Cemento Andino Tipo V x 42.5kg","cta":"241","nat":"MC","rub":"CO","tk":"F","unit":"BOL","gasto":"6021","gasto_name":"Compras MP manufact.","ai_keywords":["cemento andino","cemento tipo v","sulfatos","cemento andino 42.5"]},
    {"code":"241-MC-CO-0003-F","name":"Acero corrugado Grado 60 3/8\"","cta":"241","nat":"MC","rub":"CO","tk":"F","unit":"BAR","gasto":"6021","gasto_name":"Compras MP manufact.","ai_keywords":["acero","fierro","3/8","corrugado","grado 60","barra","varilla 3/8","fierro 3/8"]},
    {"code":"241-MC-CO-0004-F","name":"Acero corrugado Grado 60 1/2\"","cta":"241","nat":"MC","rub":"CO","tk":"F","unit":"BAR","gasto":"6021","gasto_name":"Compras MP manufact.","ai_keywords":["acero 1/2","fierro 1/2","varilla 1/2","barra 1/2"]},
    {"code":"241-MC-CO-0005-F","name":"Acero corrugado Grado 60 5/8\"","cta":"241","nat":"MC","rub":"CO","tk":"F","unit":"BAR","gasto":"6021","gasto_name":"Compras MP manufact.","ai_keywords":["acero 5/8","fierro 5/8","varilla 5/8"]},
    {"code":"242-MC-CO-0001-F","name":"Arena gruesa de río (m³)","cta":"242","nat":"MC","rub":"CO","tk":"F","unit":"M3","gasto":"6022","gasto_name":"Compras MP no manufact.","ai_keywords":["arena","gruesa","rio","arena gruesa","arena de rio","agregado fino"]},
    {"code":"242-MC-CO-0002-F","name":"Piedra chancada 3/4\" (m³)","cta":"242","nat":"MC","rub":"CO","tk":"F","unit":"M3","gasto":"6022","gasto_name":"Compras MP no manufact.","ai_keywords":["piedra chancada","agregado grueso","piedra 3/4","chancada"]},
    {"code":"242-MC-CO-0003-F","name":"Hormigón / Gravilla (m³)","cta":"242","nat":"MC","rub":"CO","tk":"F","unit":"M3","gasto":"6022","gasto_name":"Compras MP no manufact.","ai_keywords":["hormigon","gravilla","ripio","agregado"]},
    {"code":"241-MC-CO-0006-F","name":"Ladrillo King Kong 18 huecos","cta":"241","nat":"MC","rub":"CO","tk":"F","unit":"UND","gasto":"6021","gasto_name":"Compras MP manufact.","ai_keywords":["ladrillo","king kong","18 huecos","arcilla","kk"]},
    {"code":"241-MC-CO-0007-F","name":"Madera tornillo 2\"x3\" (pie tablar)","cta":"241","nat":"MF","rub":"CO","tk":"F","unit":"PTA","gasto":"6021","gasto_name":"Compras MP manufact.","ai_keywords":["madera","tornillo","pie tablar","encofrado","2x3","madera tornillo"]},
    {"code":"241-MC-CO-0008-F","name":"Triplay 4mm 1.22x2.44m","cta":"241","nat":"MF","rub":"CO","tk":"F","unit":"PLN","gasto":"6021","gasto_name":"Compras MP manufact.","ai_keywords":["triplay","plywood","madera","encofrado","4mm"]},
    {"code":"241-MC-CO-0009-F","name":"Acero corrugado Grado 60 3/4\"","cta":"241","nat":"MC","rub":"CO","tk":"F","unit":"BAR","gasto":"6021","gasto_name":"Compras MP manufact.","ai_keywords":["acero 3/4","fierro 3/4","varilla 3/4","corrugado 3/4"]},
    {"code":"241-MC-CO-0010-F","name":"Acero corrugado Grado 60 1\"","cta":"241","nat":"MC","rub":"CO","tk":"F","unit":"BAR","gasto":"6021","gasto_name":"Compras MP manufact.","ai_keywords":["acero 1","fierro 1 pulgada","varilla 1 pulgada","corrugado 1 pulg"]},
    {"code":"241-MC-CO-0011-F","name":"Alambre negro recocido N°16 (kg)","cta":"241","nat":"MC","rub":"CO","tk":"F","unit":"KGM","gasto":"6021","gasto_name":"Compras MP manufact.","ai_keywords":["alambre negro","alambre recocido","alambre 16","alambre negro recocido"]},
    {"code":"241-MC-CO-0012-F","name":"Bloqueta concreto 15x20x40cm","cta":"241","nat":"MC","rub":"CO","tk":"F","unit":"UND","gasto":"6021","gasto_name":"Compras MP manufact.","ai_keywords":["bloqueta","bloque concreto","bloqueta concreto","15x20x40"]},
    {"code":"241-MC-CO-0013-F","name":"Bloqueta concreto 9x19x39cm (pared delgada)","cta":"241","nat":"MC","rub":"CO","tk":"F","unit":"UND","gasto":"6021","gasto_name":"Compras MP manufact.","ai_keywords":["bloqueta 9x19","bloque 9cm","pared delgada","bloqueta delgada"]},
    {"code":"241-MC-CO-0014-F","name":"Madera huarango / eucalipto (pie tablar)","cta":"241","nat":"MF","rub":"CO","tk":"F","unit":"PTA","gasto":"6021","gasto_name":"Compras MP manufact.","ai_keywords":["madera huarango","eucalipto","madera dura","huarango"]},
    {"code":"241-MC-CO-0015-F","name":"Calamina galvanizada 1.80x0.80m","cta":"241","nat":"MC","rub":"CO","tk":"F","unit":"UND","gasto":"6021","gasto_name":"Compras MP manufact.","ai_keywords":["calamina","calamina galvanizada","plancha calamina","techo calamina"]},
    {"code":"241-MC-CO-0016-F","name":"Plancha/chapa lisa 1/16\" acero","cta":"241","nat":"MC","rub":"CO","tk":"F","unit":"UND","gasto":"6021","gasto_name":"Compras MP manufact.","ai_keywords":["plancha acero","chapa lisa","plancha 1/16","chapa acero lisa"]},
    {"code":"242-MC-CO-0004-F","name":"Arena fina lavada (m³)","cta":"242","nat":"MC","rub":"CO","tk":"F","unit":"M3","gasto":"6022","gasto_name":"Compras MP no manufact.","ai_keywords":["arena fina","arena lavada","arena fina lavada"]},
    {"code":"242-MC-CO-0005-F","name":"Confitillo/canto rodado (m³)","cta":"242","nat":"MC","rub":"CO","tk":"F","unit":"M3","gasto":"6022","gasto_name":"Compras MP no manufact.","ai_keywords":["confitillo","canto rodado","piedra canto rodado"]},
    {"code":"242-MC-CO-0006-F","name":"Desmonte/material de corte (m³)","cta":"242","nat":"MC","rub":"CO","tk":"F","unit":"M3","gasto":"6022","gasto_name":"Compras MP no manufact.","ai_keywords":["desmonte","material de corte","material excedente"]},
    {"code":"242-MC-CO-0007-F","name":"Relleno compactado seleccionado (m³)","cta":"242","nat":"MC","rub":"CO","tk":"F","unit":"M3","gasto":"6022","gasto_name":"Compras MP no manufact.","ai_keywords":["relleno compactado","relleno seleccionado","material relleno"]},
    {"code":"242-MC-RE-0001-F","name":"Porcelanato 60x60 rectificado","cta":"242","nat":"MC","rub":"RE","tk":"F","unit":"M2","gasto":"6022","gasto_name":"Compras MP no manufact.","ai_keywords":["porcelanato","ceramica","60x60","rectificado","piso ceramico"]},
    {"code":"242-MC-RE-0002-F","name":"Pintura látex interior (galón)","cta":"242","nat":"MC","rub":"RE","tk":"F","unit":"GLN","gasto":"6022","gasto_name":"Compras MP no manufact.","ai_keywords":["pintura","latex","interior","gallon","vinilico","latex interior"]},
    {"code":"242-MC-RE-0003-F","name":"Porcelana sanitaria blanca","cta":"242","nat":"MC","rub":"RE","tk":"F","unit":"UND","gasto":"6022","gasto_name":"Compras MP no manufact.","ai_keywords":["inodoro","lavatorio","sanitario","porcelana","blanca","sanitario blanco"]},
    {"code":"242-MC-RE-0004-F","name":"Cerámico 30x30 para pared (m²)","cta":"242","nat":"MC","rub":"RE","tk":"F","unit":"M2","gasto":"6022","gasto_name":"Compras MP no manufact.","ai_keywords":["ceramico 30x30","ceramica pared","azulejo 30x30"]},
    {"code":"242-MC-RE-0005-F","name":"Mayólica 20x30 baño (m²)","cta":"242","nat":"MC","rub":"RE","tk":"F","unit":"M2","gasto":"6022","gasto_name":"Compras MP no manufact.","ai_keywords":["mayolica 20x30","mayolica bano","ceramica bano 20x30"]},
    {"code":"242-MC-RE-0006-F","name":"Piso vinílico autoadhesivo (m²)","cta":"242","nat":"MC","rub":"RE","tk":"F","unit":"M2","gasto":"6022","gasto_name":"Compras MP no manufact.","ai_keywords":["piso vinilico","vinil piso","vinyl autoadhesivo","piso vinil"]},
    {"code":"242-MC-RE-0007-F","name":"Pintura esmalte sintético (galón)","cta":"242","nat":"MC","rub":"RE","tk":"F","unit":"GLN","gasto":"6022","gasto_name":"Compras MP no manufact.","ai_keywords":["pintura esmalte","esmalte sintetico","esmalte gallon"]},
    {"code":"242-MC-RE-0008-F","name":"Pintura anticorrosivo base (galón)","cta":"242","nat":"MC","rub":"RE","tk":"F","unit":"GLN","gasto":"6022","gasto_name":"Compras MP no manufact.","ai_keywords":["pintura anticorrosivo","anticorrosiva gallon","anticorrosivo base"]},
    {"code":"242-MC-RE-0009-F","name":"Imprimante / sellador de muros (galón)","cta":"242","nat":"MC","rub":"RE","tk":"F","unit":"GLN","gasto":"6022","gasto_name":"Compras MP no manufact.","ai_keywords":["imprimante","sellador de muros","pasta base muro"]},
    {"code":"242-MC-RE-0010-F","name":"Yeso en polvo (bolsa 25kg)","cta":"242","nat":"MC","rub":"RE","tk":"F","unit":"BOL","gasto":"6022","gasto_name":"Compras MP no manufact.","ai_keywords":["yeso en polvo","yeso bolsa","yeso construccion"]},
    {"code":"242-MC-RE-0011-F","name":"Pasta de resane / masilla (kg)","cta":"242","nat":"MC","rub":"RE","tk":"F","unit":"KGM","gasto":"6022","gasto_name":"Compras MP no manufact.","ai_keywords":["pasta resane","masilla muro","pasta masilla","resane"]},
    {"code":"242-MC-RE-0012-F","name":"Silicona selladora transparente (tubo)","cta":"242","nat":"MC","rub":"RE","tk":"F","unit":"UND","gasto":"6022","gasto_name":"Compras MP no manufact.","ai_keywords":["silicona selladora","silicone transparente","sellador silicona tubo"]},
    {"code":"242-MC-RE-0013-F","name":"Impermeabilizante (galón)","cta":"242","nat":"MC","rub":"RE","tk":"F","unit":"GLN","gasto":"6022","gasto_name":"Compras MP no manufact.","ai_keywords":["impermeabilizante","pintura impermeabilizante","membrana liquida"]},
    {"code":"242-MC-RE-0014-F","name":"Aditivo plastificante concreto (litro)","cta":"242","nat":"MC","rub":"CO","tk":"F","unit":"LTR","gasto":"6022","gasto_name":"Compras MP no manufact.","ai_keywords":["aditivo plastificante","plastificante concreto","aditivo cemento"]},
    {"code":"242-MC-RE-0015-F","name":"Pegamento PVC / CPVC (litro)","cta":"242","nat":"MC","rub":"RE","tk":"F","unit":"LTR","gasto":"6022","gasto_name":"Compras MP no manufact.","ai_keywords":["pegamento pvc","cemento pvc cpvc","pegamento tuberias pvc"]},
    # ── HERRAMIENTAS ─────────────────────────────────────────────────────────
    {"code":"337-HT-CO-0001-T","name":"Mezcladora concreto 9P³ diesel","cta":"337","nat":"HT","rub":"CO","tk":"T","unit":"UND","gasto":"6817","gasto_name":"Depreciación herramientas","ai_keywords":["mezcladora","concreto","hormigonera","diesel","9p"]},
    {"code":"337-HT-CO-0002-T","name":"Vibrador de concreto c/manguera","cta":"337","nat":"HT","rub":"CO","tk":"T","unit":"UND","gasto":"6817","gasto_name":"Depreciación herramientas","ai_keywords":["vibrador","concreto","aguja","manguera","vibrador concreto"]},
    {"code":"337-HT-CO-0003-T","name":"Andamio tubular modular (paño)","cta":"337","nat":"HT","rub":"CO","tk":"T","unit":"PAR","gasto":"6817","gasto_name":"Depreciación herramientas","ai_keywords":["andamio","tubular","metalico","scaffolding","andamio tubular"]},
    {"code":"337-HE-CO-0001-P","name":"Amoladora angular 7\" 2200W","cta":"337","nat":"HE","rub":"CO","tk":"P","unit":"UND","gasto":"6817","gasto_name":"Depreciación herramientas","ai_keywords":["amoladora","angular","7","grinder","esmeril","bosch","dewalt","amoladora angular"]},
    {"code":"337-HE-CO-0002-P","name":"Taladro percutor 13mm SDS","cta":"337","nat":"HE","rub":"CO","tk":"P","unit":"UND","gasto":"6817","gasto_name":"Depreciación herramientas","ai_keywords":["taladro","percutor","sds","electrico","taladro percutor","makita","bosch taladro"]},
    {"code":"337-HE-CO-0003-P","name":"Sierra circular eléctrica 7.5\"","cta":"337","nat":"HE","rub":"CO","tk":"P","unit":"UND","gasto":"6817","gasto_name":"Depreciación herramientas","ai_keywords":["sierra circular","sierra electrica 7.5","sierra de corte","sierra madera"]},
    {"code":"337-HE-CO-0004-P","name":"Cortadora de cerámica eléctrica","cta":"337","nat":"HE","rub":"CO","tk":"P","unit":"UND","gasto":"6817","gasto_name":"Depreciación herramientas","ai_keywords":["cortadora ceramica","cortadora ceramica electrica","cortadora porcelanato"]},
    {"code":"337-HE-CO-0005-P","name":"Compactadora de suelos plancha","cta":"337","nat":"HE","rub":"CO","tk":"P","unit":"UND","gasto":"6817","gasto_name":"Depreciación herramientas","ai_keywords":["compactadora plancha","placa vibratoria","compactadora suelos"]},
    {"code":"337-HT-CO-0004-T","name":"Panel de encofrado metálico (m²)","cta":"337","nat":"HT","rub":"CO","tk":"T","unit":"M2","gasto":"6817","gasto_name":"Depreciación herramientas","ai_keywords":["panel encofrado metalico","encofrado metalico","formaleta metalica"]},
    {"code":"337-HT-CO-0005-T","name":"Puntal telescópico 2-3m (und)","cta":"337","nat":"HT","rub":"CO","tk":"T","unit":"UND","gasto":"6817","gasto_name":"Depreciación herramientas","ai_keywords":["puntal telescopico","puntales construccion","puntal apuntalamiento"]},
    {"code":"337-HE-GE-0001-P","name":"Nivel láser rotativo","cta":"337","nat":"HE","rub":"GE","tk":"P","unit":"UND","gasto":"6817","gasto_name":"Depreciación herramientas","ai_keywords":["nivel","laser","rotativo","electronico","nivel laser"]},
    # ── MERCADERÍAS CONSTRUCCIÓN (tubería, cable, accesorios) ─────────────────
    {"code":"202-ME-CO-0001-F","name":"Tubería PVC SAP 4\" desagüe x 3m","cta":"202","nat":"ME","rub":"CO","tk":"F","unit":"UND","gasto":"6912","gasto_name":"Costo de ventas merc.","ai_keywords":["tubo","tuberia","pvc","4","desague","sap","nicoll"]},
    {"code":"202-ME-CO-0002-F","name":"Tubería PVC SAP 2\" presión x 5m","cta":"202","nat":"ME","rub":"CO","tk":"F","unit":"UND","gasto":"6912","gasto_name":"Costo de ventas merc.","ai_keywords":["tubo pvc 2","tuberia pvc presion","pvc 2 presion"]},
    {"code":"202-ME-CO-0003-F","name":"Cable NYY 3x6mm² (m)","cta":"202","nat":"ME","rub":"CO","tk":"F","unit":"MTR","gasto":"6912","gasto_name":"Costo de ventas merc.","ai_keywords":["cable","nyy","conductor","electrico","3x6"]},
    {"code":"202-ME-CO-0004-F","name":"Tubería PVC 3\" SAP desagüe (3m)","cta":"202","nat":"ME","rub":"CO","tk":"F","unit":"UND","gasto":"6912","gasto_name":"Costo de ventas merc.","ai_keywords":["tubo pvc 3","tuberia pvc 3","desague 3 pulgadas","pvc 3 desague"]},
    {"code":"202-ME-CO-0005-F","name":"Codo PVC 4\" x 90° (und)","cta":"202","nat":"ME","rub":"CO","tk":"F","unit":"UND","gasto":"6912","gasto_name":"Costo de ventas merc.","ai_keywords":["codo pvc 4","codo 4 pulgadas","codo desague 4"]},
    {"code":"202-ME-CO-0006-F","name":"Codo PVC 2\" x 90° (und)","cta":"202","nat":"ME","rub":"CO","tk":"F","unit":"UND","gasto":"6912","gasto_name":"Costo de ventas merc.","ai_keywords":["codo pvc 2","codo 2 pulgadas","codo desague 2"]},
    {"code":"202-ME-CO-0007-F","name":"Reducción PVC 4\" a 2\" (und)","cta":"202","nat":"ME","rub":"CO","tk":"F","unit":"UND","gasto":"6912","gasto_name":"Costo de ventas merc.","ai_keywords":["reduccion pvc","reduccion 4 a 2","bushing pvc 4 a 2"]},
    {"code":"202-ME-CO-0008-F","name":"Sombrero ventilación PVC 4\" (und)","cta":"202","nat":"ME","rub":"CO","tk":"F","unit":"UND","gasto":"6912","gasto_name":"Costo de ventas merc.","ai_keywords":["sombrero ventilacion pvc","sombrerete pvc","sombrero pvc 4"]},
    {"code":"202-ME-CO-0009-F","name":"Tubería CPVC 1/2\" agua caliente (m)","cta":"202","nat":"ME","rub":"CO","tk":"F","unit":"MTR","gasto":"6912","gasto_name":"Costo de ventas merc.","ai_keywords":["tuberia cpvc","cpvc 1/2","tubo agua caliente","cpvc agua caliente"]},
    {"code":"202-ME-CO-0010-F","name":"Niple roscado galvanizado 1/2\" (und)","cta":"202","nat":"ME","rub":"CO","tk":"F","unit":"UND","gasto":"6912","gasto_name":"Costo de ventas merc.","ai_keywords":["niple galvanizado","niple roscado","niple 1/2","niple galvanizado 1/2"]},
    {"code":"202-ME-CO-0011-F","name":"Codo galvanizado 1/2\" x 90° (und)","cta":"202","nat":"ME","rub":"CO","tk":"F","unit":"UND","gasto":"6912","gasto_name":"Costo de ventas merc.","ai_keywords":["codo galvanizado","codo fierro galvanizado","codo 1/2 galvanizado"]},
    {"code":"202-ME-CO-0012-F","name":"Válvula/llave de paso 1/2\" bronce","cta":"202","nat":"ME","rub":"CO","tk":"F","unit":"UND","gasto":"6912","gasto_name":"Costo de ventas merc.","ai_keywords":["valvula paso","llave de paso","valvula bronce 1/2"]},
    # ── FERRETERÍA DE CONSTRUCCIÓN ────────────────────────────────────────────
    {"code":"252-FE-CO-0001-F","name":"Clavos de obra 3\" (kg)","cta":"252","nat":"SU","rub":"CO","tk":"F","unit":"KGM","gasto":"6569","gasto_name":"Suministros ferretería","ai_keywords":["clavo 3","clavos obra","clavo de acero","clavos 3 pulgadas"]},
    {"code":"252-FE-CO-0002-F","name":"Clavos de obra 4\" (kg)","cta":"252","nat":"SU","rub":"CO","tk":"F","unit":"KGM","gasto":"6569","gasto_name":"Suministros ferretería","ai_keywords":["clavo 4","clavos 4 pulgadas","clavo obra 4","clavo acero 4"]},
    {"code":"252-FE-CO-0003-F","name":"Clavos para calamina (kg)","cta":"252","nat":"SU","rub":"CO","tk":"F","unit":"KGM","gasto":"6569","gasto_name":"Suministros ferretería","ai_keywords":["clavos calamina","clavo para calamina","clavo techo","clavo con cabeza"]},
    {"code":"252-FE-CO-0004-F","name":"Pernos hexagonales c/tuerca 1/2\" (ciento)","cta":"252","nat":"SU","rub":"CO","tk":"F","unit":"CTO","gasto":"6569","gasto_name":"Suministros ferretería","ai_keywords":["perno hexagonal","perno 1/2","perno con tuerca","perno galvanizado"]},
    {"code":"252-FE-CO-0005-F","name":"Tornillo autoperforante 8x1\" (ciento)","cta":"252","nat":"SU","rub":"CO","tk":"F","unit":"CTO","gasto":"6569","gasto_name":"Suministros ferretería","ai_keywords":["tornillo autoperforante","tornillo 8x1","tornillo metalico","autoperforante"]},
    {"code":"252-FE-CO-0006-F","name":"Arandelas y tuercas galvanizadas (ciento)","cta":"252","nat":"SU","rub":"CO","tk":"F","unit":"CTO","gasto":"6569","gasto_name":"Suministros ferretería","ai_keywords":["arandela galvanizada","tuerca galvanizada","arandelas y tuercas"]},
    {"code":"252-FE-CO-0007-F","name":"Disco de corte 4.5\" metal (und)","cta":"252","nat":"SU","rub":"CO","tk":"F","unit":"UND","gasto":"6569","gasto_name":"Suministros ferretería","ai_keywords":["disco corte metal","disco amoladora corte","disco de corte 4.5"]},
    {"code":"252-FE-CO-0008-F","name":"Disco de desbaste 4.5\" (und)","cta":"252","nat":"SU","rub":"CO","tk":"F","unit":"UND","gasto":"6569","gasto_name":"Suministros ferretería","ai_keywords":["disco desbaste","disco abrasivo","disco esmeril 4.5"]},
    {"code":"252-FE-CO-0009-F","name":"Lija/papel abrasivo P80 (pliego)","cta":"252","nat":"SU","rub":"CO","tk":"F","unit":"UND","gasto":"6569","gasto_name":"Suministros ferretería","ai_keywords":["lija p80","papel abrasivo","lija pliego","papel lija"]},
    {"code":"252-FE-CO-0010-F","name":"Alambre galvanizado N°16 (kg)","cta":"252","nat":"SU","rub":"CO","tk":"F","unit":"KGM","gasto":"6569","gasto_name":"Suministros ferretería","ai_keywords":["alambre galvanizado","alambre galvanizado 16","alambre galv"]},
    {"code":"252-FE-CO-0011-F","name":"Malla metálica galvanizada (m²)","cta":"252","nat":"SU","rub":"CO","tk":"F","unit":"M2","gasto":"6569","gasto_name":"Suministros ferretería","ai_keywords":["malla metalica galvanizada","malla galvanizada","malla acero"]},
    {"code":"252-FE-CO-0012-F","name":"Ángulo de acero 1\"x1\"x1/8\" (m)","cta":"252","nat":"SU","rub":"CO","tk":"F","unit":"MTR","gasto":"6569","gasto_name":"Suministros ferretería","ai_keywords":["angulo de acero","angular acero","perfil angulo","angulo 1x1"]},
    {"code":"252-FE-CO-0013-F","name":"Platina de acero 1/8\"x1\" (m)","cta":"252","nat":"SU","rub":"CO","tk":"F","unit":"MTR","gasto":"6569","gasto_name":"Suministros ferretería","ai_keywords":["platina acero","platina de acero","platina 1/8","platina metalica"]},
    {"code":"252-FE-CO-0014-F","name":"Tubo cuadrado acero 1\"x1\" (m)","cta":"252","nat":"SU","rub":"CO","tk":"F","unit":"MTR","gasto":"6569","gasto_name":"Suministros ferretería","ai_keywords":["tubo cuadrado acero","tubo estructural","tubo cuadrado 1x1"]},
    {"code":"252-FE-CO-0015-F","name":"Espuma poliuretano expandible (lata)","cta":"252","nat":"SU","rub":"CO","tk":"F","unit":"UND","gasto":"6569","gasto_name":"Suministros ferretería","ai_keywords":["espuma poliuretano","espuma expansiva","espuma expandible","poliuretano expansivo"]},
    # ── INSTALACIONES ELÉCTRICAS ──────────────────────────────────────────────
    {"code":"202-ME-EN-0001-F","name":"Cable de energía THW 10mm² (m)","cta":"202","nat":"ME","rub":"EN","tk":"F","unit":"MTR","gasto":"6912","gasto_name":"Costo de ventas merc.","ai_keywords":["cable","thw","conductor","energia","10mm","metro"]},
    {"code":"202-ME-EN-0002-F","name":"Transformador de distribución 15KVA","cta":"202","nat":"ME","rub":"EN","tk":"P","unit":"UND","gasto":"6912","gasto_name":"Costo de ventas merc.","ai_keywords":["transformador","trafo","15kva","electrico","distribucion"]},
    {"code":"202-ME-EN-0003-F","name":"Cable TW 2.5mm² sólido (m)","cta":"202","nat":"ME","rub":"EN","tk":"F","unit":"MTR","gasto":"6912","gasto_name":"Costo de ventas merc.","ai_keywords":["cable tw 2.5","cable tw solido","conductor tw 2.5"]},
    {"code":"202-ME-EN-0004-F","name":"Cable TW 4mm² sólido (m)","cta":"202","nat":"ME","rub":"EN","tk":"F","unit":"MTR","gasto":"6912","gasto_name":"Costo de ventas merc.","ai_keywords":["cable tw 4","conductor tw 4mm","cable electrico 4mm"]},
    {"code":"202-ME-EN-0005-F","name":"Interruptor simple empotrar","cta":"202","nat":"ME","rub":"EN","tk":"F","unit":"UND","gasto":"6912","gasto_name":"Costo de ventas merc.","ai_keywords":["interruptor simple","interruptor empotrar","switch electrico simple"]},
    {"code":"202-ME-EN-0006-F","name":"Tomacorriente doble 15A","cta":"202","nat":"ME","rub":"EN","tk":"F","unit":"UND","gasto":"6912","gasto_name":"Costo de ventas merc.","ai_keywords":["tomacorriente doble","toma corriente","enchufe pared doble"]},
    {"code":"202-ME-EN-0007-F","name":"Tablero eléctrico 6 polos","cta":"202","nat":"ME","rub":"EN","tk":"F","unit":"UND","gasto":"6912","gasto_name":"Costo de ventas merc.","ai_keywords":["tablero electrico 6 polos","panel electrico","tablero caja electrica"]},
    {"code":"202-ME-EN-0008-F","name":"Breaker termomagn. 20A (und)","cta":"202","nat":"ME","rub":"EN","tk":"F","unit":"UND","gasto":"6912","gasto_name":"Costo de ventas merc.","ai_keywords":["breaker 20a","interruptor termomagnetico 20a","disyuntor 20a"]},
    {"code":"202-ME-EN-0009-F","name":"Conduit PVC eléctrico 3/4\" (m)","cta":"202","nat":"ME","rub":"EN","tk":"F","unit":"MTR","gasto":"6912","gasto_name":"Costo de ventas merc.","ai_keywords":["conduit pvc","tubo conduit","conduit electrico 3/4"]},
    {"code":"202-ME-EN-0010-F","name":"Caja octogonal empotrar (und)","cta":"202","nat":"ME","rub":"EN","tk":"F","unit":"UND","gasto":"6912","gasto_name":"Costo de ventas merc.","ai_keywords":["caja octogonal","caja octogonal empotrar","octogonal electrica"]},
    # ── HERRAMIENTAS MANUALES (suministro fungible) ───────────────────────────
    # Palas — SKU único por marca para rastrear costo exacto por partida
    # ── HERRAMIENTAS MANUALES — cta:252, suministros (no activo fijo) ──────────
    # Pala y variantes
    {"code":"252-HM-GE-0001-F","name":"Pala punta de acero con mango","cta":"252","nat":"HM","rub":"GE","tk":"F","unit":"UND","gasto":"6569","gasto_name":"Suministros - herramientas menores","ai_keywords":["pala","pala punta","pala punta de acero","pala acero","pala cuchara","lampa","palana","pala de trabajo","pala obra","pala recta","pala mango","pala mango madera","truper pala","lampa truper"]},
    # Pico y variantes
    {"code":"252-HM-GE-0002-F","name":"Pico punta y pala con mango","cta":"252","nat":"HM","rub":"GE","tk":"F","unit":"UND","gasto":"6569","gasto_name":"Suministros - herramientas menores","ai_keywords":["pico","pico punta","pico y pala","pico punta y pala","azadon","piocha","zapa","pico mango","pico con mango","pico de trabajo"]},
    # Otras herramientas manuales
    {"code":"252-HM-GE-0003-F","name":"Carretilla de obra","cta":"252","nat":"HM","rub":"GE","tk":"F","unit":"UND","gasto":"6569","gasto_name":"Suministros - herramientas menores","ai_keywords":["carretilla","buggy","wheelbarrow","carretilla obra"]},
    {"code":"252-HM-GE-0004-F","name":"Barreta / palanca metálica","cta":"252","nat":"HM","rub":"GE","tk":"F","unit":"UND","gasto":"6569","gasto_name":"Suministros - herramientas menores","ai_keywords":["barreta","palanca","barra metalica","crowbar","barreta metalica"]},
    {"code":"252-HM-GE-0005-F","name":"Comba / martillo de obra","cta":"252","nat":"HM","rub":"GE","tk":"F","unit":"UND","gasto":"6569","gasto_name":"Suministros - herramientas menores","ai_keywords":["comba","martillo","mazo","marro","comba de obra"]},
    {"code":"252-HM-GE-0006-F","name":"Serrucho / sierra manual","cta":"252","nat":"HM","rub":"GE","tk":"F","unit":"UND","gasto":"6569","gasto_name":"Suministros - herramientas menores","ai_keywords":["serrucho","sierra manual","sierra de mano","hoja de sierra"]},
    {"code":"252-HM-GE-0007-F","name":"Cincel y combo (juego)","cta":"252","nat":"HM","rub":"GE","tk":"F","unit":"JGO","gasto":"6569","gasto_name":"Suministros - herramientas menores","ai_keywords":["cincel","combo","juego cincel","punzon","formón"]},
    {"code":"252-HM-GE-0008-F","name":"Rastrillo de jardín/obra","cta":"252","nat":"HM","rub":"GE","tk":"F","unit":"UND","gasto":"6569","gasto_name":"Suministros - herramientas menores","ai_keywords":["rastrillo","rastro","escardillo"]},
    # ── EQUIPOS DIVERSOS (activo fijo) ────────────────────────────────────────
    {"code":"336-EQ-GE-0001-P","name":"Computadora de escritorio Core i5","cta":"336","nat":"EQ","rub":"GE","tk":"P","unit":"UND","gasto":"6816","gasto_name":"Depreciación equipos","ai_keywords":["computadora","pc","desktop","escritorio","core i5","computadora escritorio"]},
    {"code":"336-EQ-GE-0002-P","name":"Impresora multifuncional láser","cta":"336","nat":"EQ","rub":"GE","tk":"P","unit":"UND","gasto":"6816","gasto_name":"Depreciación equipos","ai_keywords":["impresora","laser","multifuncional","oficina","impresora laser"]},
    {"code":"336-EQ-TE-0001-P","name":"Servidor rack Dell PowerEdge","cta":"336","nat":"EQ","rub":"TE","tk":"P","unit":"UND","gasto":"6816","gasto_name":"Depreciación equipos","ai_keywords":["servidor","rack","dell","poweredge","server","servidor rack"]},
    {"code":"336-EQ-TE-0002-P","name":"Switch administrable 24 puertos","cta":"336","nat":"EQ","rub":"TE","tk":"P","unit":"UND","gasto":"6816","gasto_name":"Depreciación equipos","ai_keywords":["switch","red","24","puertos","administrable","conmutador","switch red"]},
    # ── MUEBLES Y ENSERES ─────────────────────────────────────────────────────
    {"code":"335-MU-GE-0001-P","name":"Escritorio ejecutivo 1.60m","cta":"335","nat":"MU","rub":"GE","tk":"P","unit":"UND","gasto":"6815","gasto_name":"Depreciación muebles","ai_keywords":["escritorio","ejecutivo","oficina","mueble","1.60m","escritorio oficina"]},
    {"code":"335-MU-GE-0002-P","name":"Silla ergonómica de oficina","cta":"335","nat":"MU","rub":"GE","tk":"P","unit":"UND","gasto":"6815","gasto_name":"Depreciación muebles","ai_keywords":["silla","ergonomica","oficina","ejecutiva","silla oficina","silla ergonomica"]},
    # ── MAQUINARIA ────────────────────────────────────────────────────────────
    {"code":"333-MQ-GE-0001-P","name":"Compresora de aire 100L 3HP","cta":"333","nat":"MQ","rub":"GE","tk":"P","unit":"UND","gasto":"6813","gasto_name":"Depreciación maquinaria","ai_keywords":["compresora","aire","100l","3hp","industrial","compresora aire"]},
    {"code":"333-MQ-GE-0002-P","name":"Grupo electrógeno 15KVA diesel","cta":"333","nat":"MQ","rub":"GE","tk":"P","unit":"UND","gasto":"6813","gasto_name":"Depreciación maquinaria","ai_keywords":["generador","grupo electrogeno","15kva","diesel","generador electrico"]},
    {"code":"333-MQ-AG-0001-P","name":"Tractor agrícola 85HP 4WD","cta":"333","nat":"MQ","rub":"AG","tk":"P","unit":"UND","gasto":"6813","gasto_name":"Depreciación maquinaria","ai_keywords":["tractor","agricola","85hp","campo","4wd","tractor agricola"]},
    # ── VEHÍCULOS ─────────────────────────────────────────────────────────────
    {"code":"334-VH-GE-0001-P","name":"Camioneta Pick-Up 4x4 diesel","cta":"334","nat":"VH","rub":"GE","tk":"P","unit":"UND","gasto":"6814","gasto_name":"Depreciación transp.","ai_keywords":["camioneta","hilux","pickup","4x4","diesel","toyota","camioneta 4x4"]},
    {"code":"334-VH-TR-0001-P","name":"Camión de carga 10 tn.","cta":"334","nat":"VH","rub":"TR","tk":"P","unit":"UND","gasto":"6814","gasto_name":"Depreciación transp.","ai_keywords":["camion","carga","10tn","transporte","furgon","camion carga"]},
    # ── REPUESTOS ─────────────────────────────────────────────────────────────
    {"code":"253-RM-GE-0001-T","name":"Correa de transmisión (und)","cta":"253","nat":"RM","rub":"GE","tk":"T","unit":"UND","gasto":"6531","gasto_name":"Repuestos y accesorios","ai_keywords":["correa","transmision","faja","belt","correa transmision"]},
    {"code":"253-RV-TR-0001-T","name":"Llanta 195/65R15","cta":"253","nat":"RN","rub":"TR","tk":"T","unit":"UND","gasto":"6531","gasto_name":"Repuestos y accesorios","ai_keywords":["llanta","neumatico","goma","cubierta","195/65","r15","llanta auto"]},
    {"code":"253-RV-TR-0002-T","name":"Llanta 295/80R22.5 camión","cta":"253","nat":"RN","rub":"TR","tk":"T","unit":"UND","gasto":"6531","gasto_name":"Repuestos y accesorios","ai_keywords":["llanta camion","neumatico camion","cubierta 22.5","295/80","llanta de camion"]},
    {"code":"253-RV-TR-0003-T","name":"Filtro de aceite motor","cta":"253","nat":"RM","rub":"TR","tk":"T","unit":"UND","gasto":"6531","gasto_name":"Repuestos y accesorios","ai_keywords":["filtro aceite","filtro motor","oil filter","filtro de aceite"]},
    {"code":"253-RV-TR-0004-T","name":"Pastillas de freno (juego)","cta":"253","nat":"RM","rub":"TR","tk":"T","unit":"JGO","gasto":"6531","gasto_name":"Repuestos y accesorios","ai_keywords":["pastillas","freno","zapata","brake","pastillas de freno","zapata de freno"]},
    {"code":"253-RM-MI-0001-F","name":"Broca de perforación","cta":"253","nat":"RM","rub":"MI","tk":"T","unit":"UND","gasto":"6531","gasto_name":"Repuestos y accesorios","ai_keywords":["broca","perforacion","bit","tricono","broca minera"]},
    # ── REPUESTOS MECÁNICOS FLOTAS ─────────────────────────────────────────────
    {"code":"253-RM-TR-0001-T","name":"Filtro de aire seco (und)","cta":"253","nat":"RM","rub":"TR","tk":"T","unit":"UND","gasto":"6531","gasto_name":"Repuestos y accesorios","ai_keywords":["filtro de aire","filtro aire seco","air filter","filtro aire vehiculo"]},
    {"code":"253-RM-TR-0002-T","name":"Filtro de combustible (und)","cta":"253","nat":"RM","rub":"TR","tk":"T","unit":"UND","gasto":"6531","gasto_name":"Repuestos y accesorios","ai_keywords":["filtro de combustible","filtro combustible","filtro diesel","fuel filter"]},
    {"code":"253-RM-TR-0003-T","name":"Filtro hidráulico (und)","cta":"253","nat":"RM","rub":"TR","tk":"T","unit":"UND","gasto":"6531","gasto_name":"Repuestos y accesorios","ai_keywords":["filtro hidraulico","filtro fluido hidraulico","hydraulic filter"]},
    {"code":"253-RM-TR-0004-T","name":"Kit embrague/clutch completo","cta":"253","nat":"RM","rub":"TR","tk":"T","unit":"UND","gasto":"6531","gasto_name":"Repuestos y accesorios","ai_keywords":["kit embrague","clutch completo","embrague completo","kit clutch"]},
    {"code":"253-RM-TR-0005-T","name":"Amortiguador delantero Monroe/KYB","cta":"253","nat":"RM","rub":"TR","tk":"T","unit":"UND","gasto":"6531","gasto_name":"Repuestos y accesorios","ai_keywords":["amortiguador delantero","shock delantero","amortiguador monroe","amortiguador kyb"]},
    {"code":"253-RM-TR-0006-T","name":"Amortiguador trasero (und)","cta":"253","nat":"RM","rub":"TR","tk":"T","unit":"UND","gasto":"6531","gasto_name":"Repuestos y accesorios","ai_keywords":["amortiguador trasero","shock trasero","amortiguador posterior"]},
    {"code":"253-RM-TR-0007-T","name":"Rodamiento/rulimán rueda (und)","cta":"253","nat":"RM","rub":"TR","tk":"T","unit":"UND","gasto":"6531","gasto_name":"Repuestos y accesorios","ai_keywords":["rodamiento rueda","ruliman rueda","bearing rueda"]},
    {"code":"253-RM-TR-0008-T","name":"Rótula de dirección (und)","cta":"253","nat":"RM","rub":"TR","tk":"T","unit":"UND","gasto":"6531","gasto_name":"Repuestos y accesorios","ai_keywords":["rotula de direccion","ball joint","rotula direccion"]},
    {"code":"253-RM-TR-0009-T","name":"Buje/muñón dirección (und)","cta":"253","nat":"RM","rub":"TR","tk":"T","unit":"UND","gasto":"6531","gasto_name":"Repuestos y accesorios","ai_keywords":["buje de direccion","munon direccion","buje munon"]},
    {"code":"253-RM-TR-0010-T","name":"Bomba de agua motor (und)","cta":"253","nat":"RM","rub":"TR","tk":"T","unit":"UND","gasto":"6531","gasto_name":"Repuestos y accesorios","ai_keywords":["bomba de agua motor","water pump","bomba refrigerante motor"]},
    {"code":"253-RM-TR-0011-T","name":"Bomba de combustible (und)","cta":"253","nat":"RM","rub":"TR","tk":"T","unit":"UND","gasto":"6531","gasto_name":"Repuestos y accesorios","ai_keywords":["bomba de combustible","fuel pump","bomba gasolina","bomba diesel"]},
    {"code":"253-RM-TR-0012-T","name":"Termostato motor (und)","cta":"253","nat":"RM","rub":"TR","tk":"T","unit":"UND","gasto":"6531","gasto_name":"Repuestos y accesorios","ai_keywords":["termostato motor","termostato vehiculo","thermostat motor"]},
    {"code":"253-RM-TR-0013-T","name":"Manguera superior de radiador","cta":"253","nat":"RM","rub":"TR","tk":"T","unit":"UND","gasto":"6531","gasto_name":"Repuestos y accesorios","ai_keywords":["manguera radiador superior","manguera refrigerante superior"]},
    {"code":"253-RM-TR-0014-T","name":"Manguera inferior de radiador","cta":"253","nat":"RM","rub":"TR","tk":"T","unit":"UND","gasto":"6531","gasto_name":"Repuestos y accesorios","ai_keywords":["manguera radiador inferior","manguera refrigerante inferior"]},
    {"code":"253-RM-TR-0015-T","name":"Radiador de motor (und)","cta":"253","nat":"RM","rub":"TR","tk":"T","unit":"UND","gasto":"6531","gasto_name":"Repuestos y accesorios","ai_keywords":["radiador motor","radiador de motor","radiator vehiculo"]},
    {"code":"253-RM-TR-0016-T","name":"Correa poly-V multi-ristra","cta":"253","nat":"RM","rub":"TR","tk":"T","unit":"UND","gasto":"6531","gasto_name":"Repuestos y accesorios","ai_keywords":["correa poly-v","faja poly v","serpentine belt","correa multi-ristra"]},
    {"code":"253-RM-TR-0017-T","name":"Kit correa de distribución + tensor","cta":"253","nat":"RM","rub":"TR","tk":"T","unit":"KIT","gasto":"6531","gasto_name":"Repuestos y accesorios","ai_keywords":["kit distribucion","correa de distribucion","kit timing belt","tensor distribucion"]},
    {"code":"253-RM-TR-0018-T","name":"Batería 60Ah 12V auto/camioneta","cta":"253","nat":"RM","rub":"TR","tk":"T","unit":"UND","gasto":"6531","gasto_name":"Repuestos y accesorios","ai_keywords":["bateria 60ah","bateria auto 12v","bateria 60ah 12v"]},
    {"code":"253-RM-TR-0019-T","name":"Batería 100Ah 12V camión","cta":"253","nat":"RM","rub":"TR","tk":"T","unit":"UND","gasto":"6531","gasto_name":"Repuestos y accesorios","ai_keywords":["bateria 100ah","bateria camion 12v","bateria 100ah 12v"]},
    {"code":"253-RM-TR-0020-T","name":"Disco de freno delantero (par)","cta":"253","nat":"RM","rub":"TR","tk":"T","unit":"PAR","gasto":"6531","gasto_name":"Repuestos y accesorios","ai_keywords":["disco freno delantero","disco de freno","brake disc","disco freno par"]},
    # ── REPUESTOS ELÉCTRICOS FLOTAS ───────────────────────────────────────────
    {"code":"253-RE-TR-0001-T","name":"Bujía NGK BKR6E (und)","cta":"253","nat":"RE","rub":"TR","tk":"T","unit":"UND","gasto":"6531","gasto_name":"Repuestos y accesorios","ai_keywords":["bujia ngk","bujia bkr6e","spark plug ngk","bujia motor"]},
    {"code":"253-RE-TR-0002-T","name":"Juego de cables de bujías","cta":"253","nat":"RE","rub":"TR","tk":"T","unit":"JGO","gasto":"6531","gasto_name":"Repuestos y accesorios","ai_keywords":["cables de bujias","set cables encendido","juego cables bujias"]},
    {"code":"253-RE-TR-0003-T","name":"Alternador reconstruido (und)","cta":"253","nat":"RE","rub":"TR","tk":"T","unit":"UND","gasto":"6531","gasto_name":"Repuestos y accesorios","ai_keywords":["alternador reconstruido","alternador motor","generador alternador"]},
    {"code":"253-RE-TR-0004-T","name":"Motor de arranque (und)","cta":"253","nat":"RE","rub":"TR","tk":"T","unit":"UND","gasto":"6531","gasto_name":"Repuestos y accesorios","ai_keywords":["motor de arranque","arranque motor","starter motor"]},
    {"code":"253-RE-TR-0005-T","name":"Bobina de ignición (und)","cta":"253","nat":"RE","rub":"TR","tk":"T","unit":"UND","gasto":"6531","gasto_name":"Repuestos y accesorios","ai_keywords":["bobina de ignicion","bobina encendido","ignition coil"]},
    # ── NEUMÁTICOS GENERALES ──────────────────────────────────────────────────
    {"code":"253-RN-GE-0001-T","name":"Llanta 195/65R15 auto","cta":"253","nat":"RN","rub":"GE","tk":"T","unit":"UND","gasto":"6531","gasto_name":"Repuestos y accesorios","ai_keywords":["llanta 195/65r15","neumatico 195/65","llanta auto 195"]},
    {"code":"253-RN-GE-0002-T","name":"Llanta 215/75R15 pickup 4x4","cta":"253","nat":"RN","rub":"GE","tk":"T","unit":"UND","gasto":"6531","gasto_name":"Repuestos y accesorios","ai_keywords":["llanta 215/75r15","llanta pickup 4x4","llanta 215/75"]},
    {"code":"253-RN-GE-0003-T","name":"Llanta 265/65R17 SUV","cta":"253","nat":"RN","rub":"GE","tk":"T","unit":"UND","gasto":"6531","gasto_name":"Repuestos y accesorios","ai_keywords":["llanta 265/65r17","llanta suv 265","llanta 265/65"]},
    {"code":"253-RN-GE-0004-T","name":"Llanta 750-16 camión liviano","cta":"253","nat":"RN","rub":"GE","tk":"T","unit":"UND","gasto":"6531","gasto_name":"Repuestos y accesorios","ai_keywords":["llanta 750-16","llanta camion liviano 750","750-16"]},
    {"code":"253-RN-GE-0005-T","name":"Llanta 900-20 camión pesado","cta":"253","nat":"RN","rub":"GE","tk":"T","unit":"UND","gasto":"6531","gasto_name":"Repuestos y accesorios","ai_keywords":["llanta 900-20","llanta camion pesado 900","900-20"]},
    # ── MERCADERÍAS COMERCIALES ───────────────────────────────────────────────
    {"code":"201-ME-CM-0001-P","name":"Laptop HP Core i7 16GB","cta":"201","nat":"ME","rub":"CM","tk":"P","unit":"UND","gasto":"6911","gasto_name":"Costo de ventas merc.","ai_keywords":["laptop","hp","core i7","notebook","portatil","laptop hp"]},
    {"code":"201-ME-CM-0002-P","name":"Televisor LED Smart 50\" 4K","cta":"201","nat":"ME","rub":"CM","tk":"P","unit":"UND","gasto":"6911","gasto_name":"Costo de ventas merc.","ai_keywords":["televisor","tv","smart","led","50","4k","television"]},
    {"code":"202-ME-CM-0001-F","name":"Calzado deportivo (par)","cta":"202","nat":"ME","rub":"CM","tk":"F","unit":"PAR","gasto":"6912","gasto_name":"Costo de ventas merc.","ai_keywords":["calzado","zapatilla","zapato","deportivo","par","calzado deportivo"]},
    {"code":"202-ME-CM-0002-F","name":"Prenda de vestir (textil)","cta":"202","nat":"ME","rub":"CM","tk":"F","unit":"UND","gasto":"6912","gasto_name":"Costo de ventas merc.","ai_keywords":["ropa","prenda","vestir","textil","polo","camisa","pantalon"]},
    # ── DISTRIBUCIÓN ─────────────────────────────────────────────────────────
    {"code":"202-ME-DI-0001-F","name":"Arroz extra blanco (saco 50kg)","cta":"202","nat":"MD","rub":"DI","tk":"F","unit":"SAC","gasto":"6912","gasto_name":"Costo de ventas merc.","ai_keywords":["arroz","blanco","extra","50kg","saco","arroz blanco"]},
    {"code":"202-ME-DI-0002-F","name":"Azúcar rubia (saco 50kg)","cta":"202","nat":"MD","rub":"DI","tk":"F","unit":"SAC","gasto":"6912","gasto_name":"Costo de ventas merc.","ai_keywords":["azucar","rubia","50kg","saco","azucar rubia"]},
    {"code":"202-ME-DI-0003-F","name":"Aceite vegetal botella 1L","cta":"202","nat":"MD","rub":"DI","tk":"F","unit":"UND","gasto":"6912","gasto_name":"Costo de ventas merc.","ai_keywords":["aceite vegetal","cocinero","soya","1l","botella","aceite cocinero"]},
    # ── SUMINISTROS TI ────────────────────────────────────────────────────────
    {"code":"252-TI-GE-0001-F","name":"Disco SSD 1TB","cta":"252","nat":"TI","rub":"GE","tk":"F","unit":"UND","gasto":"6561","gasto_name":"Suministros TI","ai_keywords":["disco","ssd","1tb","solido","unidad","almacenamiento","ssd 1tb"]},
    {"code":"252-TI-GE-0002-F","name":"Memoria RAM DDR4 8GB","cta":"252","nat":"TI","rub":"GE","tk":"F","unit":"UND","gasto":"6561","gasto_name":"Suministros TI","ai_keywords":["ram","8gb","memoria","ddr4","modulo","memoria ram"]},
    {"code":"252-TI-GE-0003-F","name":"Cable UTP cat6 (m)","cta":"252","nat":"TI","rub":"GE","tk":"F","unit":"MTR","gasto":"6561","gasto_name":"Suministros TI","ai_keywords":["cable utp","cat6","red","ethernet","metro","cable de red"]},
    # ── MATERIALES AUXILIARES ─────────────────────────────────────────────────
    {"code":"251-MA-FA-0001-F","name":"Soldadura electrodo 7018 (kg)","cta":"251","nat":"MA","rub":"FA","tk":"F","unit":"KGM","gasto":"6031","gasto_name":"Materiales auxiliares","ai_keywords":["soldadura","7018","electrodo","acero","punto azul","electrodo soldadura"]},
    # ── GAS INDUSTRIAL ────────────────────────────────────────────────────────
    {"code":"252-GA-FA-0001-F","name":"Oxígeno industrial (m³)","cta":"252","nat":"GA","rub":"FA","tk":"F","unit":"M3","gasto":"6569","gasto_name":"Suministros diversos","ai_keywords":["oxigeno","industrial","gas","cilindro","m3","oxigeno industrial"]},
    {"code":"252-GA-FA-0002-F","name":"Acetileno industrial (kg)","cta":"252","nat":"GA","rub":"FA","tk":"F","unit":"KGM","gasto":"6569","gasto_name":"Suministros diversos","ai_keywords":["acetileno","gas","industrial","cilindro","corte","acetileno industrial"]},
    {"code":"252-AL-HO-0003-F","name":"Gas propano balón 10kg","cta":"252","nat":"CO","rub":"HO","tk":"F","unit":"UND","gasto":"6562","gasto_name":"Combustibles y lubricantes","ai_keywords":["gas propano","balon","10kg","garrafa","cocina","propano"]},
    # ── AGROQUÍMICOS ─────────────────────────────────────────────────────────
    {"code":"252-AG-AG-0001-F","name":"Urea fertilizante granulado (kg)","cta":"252","nat":"AG","rub":"AG","tk":"F","unit":"KGM","gasto":"6569","gasto_name":"Suministros agroquímicos","ai_keywords":["urea","fertilizante","nitrogeno","abono","granulado","urea fertilizante"]},
    {"code":"252-AG-AG-0002-F","name":"Fosfato diamónico DAP (saco)","cta":"252","nat":"AG","rub":"AG","tk":"F","unit":"SAC","gasto":"6569","gasto_name":"Suministros agroquímicos","ai_keywords":["dap","fosfato","diamonico","fertilizante","fosfatado"]},
    {"code":"252-AG-AG-0003-F","name":"Pesticida/Fungicida (litro)","cta":"252","nat":"AG","rub":"AG","tk":"F","unit":"LTR","gasto":"6569","gasto_name":"Suministros agroquímicos","ai_keywords":["pesticida","fungicida","herbicida","plaguicida"]},
]

# ──────────────────────────────────────────────────────────────────────────────
# ÍNDICE: keyword → catalog item (pre-compilado al importar)
# ──────────────────────────────────────────────────────────────────────────────
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
                # Multi-word keywords score higher to avoid false positives
                score += 2 if " " in kw else 1
        if score > 0:
            # Bonus si la cuenta PCGE coincide
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
    if any(k in desc for k in ["casco","guante","lente","zapato","bota","chaleco","arnes","mascarilla","careta","extintor","cono","overol","uniforme"]):
        return "EP"
    if any(k in desc for k in ["gasolina","diesel","petroleo","gnv","combustible","aceite motor","lubricante","grasa"]):
        return "CO"
    if any(k in desc for k in ["jabon","cloro","lejia","detergente","papel higienico","desinfectante","alcohol gel"]):
        return "LI"
    if any(k in desc for k in ["papel","toner","cartucho","lapiz","boligrafo","archivador","folder","cinta","utiles"]):
        return "SU"
    # Herramientas MANUALES de bajo valor → suministros (252), NO activo fijo
    if any(k in desc for k in ["pala","pico","lampa","palana","comba","martillo","barreta","carretilla",
                                 "serrucho","machete","rastrillo","zapapico","azadon","cincel","espatula",
                                 "llana","plomada","escuadra","nivel de burbuja","mango","paleta"]):
        return "HM"
    if any(k in desc for k in ["laptop","computadora","monitor","tablet","celular","cpu"]):
        return "EQ"
    if any(k in desc for k in ["ssd","ram","disco","memoria","cable utp","cable red"]):
        return "TI"
    if any(k in desc for k in ["servidor","switch","router","ups"]):
        return "EQ"
    if any(k in desc for k in ["camion","camioneta","auto","vehiculo","furgon"]):
        return "VH"
    # Herramientas ELÉCTRICAS/MECÁNICAS (mayor valor) → pueden ser activo fijo
    if any(k in desc for k in ["taladro","amoladora","esmeril","soldadora","compresor","sierra","cortadora","rotomartillo"]):
        return "HE"
    if any(k in desc for k in ["andamio","vibrador","mezcladora"]):
        return "HT"
    if any(k in desc for k in ["tractor","generador","grupo electrogeno","maquina","maquinaria"]):
        return "MQ"
    if any(k in desc for k in ["escritorio","silla","mueble","estante","archivero"]):
        return "MU"
    if any(k in desc for k in ["cemento","acero","fierro","ladrillo","madera","triplay","plancha"]):
        return "MC"
    if any(k in desc for k in ["arena","piedra","gravilla","hormigon","mineral","concentrado"]):
        return "MM"
    if any(k in desc for k in ["filtro","llanta","correa","faja","repuesto","pieza","pastilla"]):
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
