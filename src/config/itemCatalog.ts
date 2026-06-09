/**
 * CATÁLOGO MAESTRO DE ARTÍCULOS DE ALMACÉN — thin wrapper
 * Single source of truth: src/config/catalog.json
 * All derived fields (cta_name, gasto, gasto_name, nat_name, class_name)
 * are computed from the 5-part code: CTA-NAT-RUB-SEQQ-TK
 *
 * Código: CTA-NAT-RUB-SEQQ-TK
 *   CTA  = Cuenta PCGE de inventario (3 dígitos)
 *   NAT  = Naturaleza del bien (2 letras)
 *   RUB  = Rubro/industria (2 letras)
 *   SEQQ = Correlativo (4 dígitos)
 *   TK   = P(ermanente) | T(emporal) | F(ungible)
 */

// ============================================================
// TIPOS
// ============================================================
export type Rubro =
  | 'GE' | 'MI' | 'CO' | 'FA' | 'CM' | 'DI'
  | 'AG' | 'PE' | 'SA' | 'HO' | 'TR' | 'EN'
  | 'TE' | 'RE' | 'ED';

export type TokenTipo = 'P' | 'T' | 'F';

export interface CatalogItem {
  code: string;           // Código único del artículo
  name: string;           // Nombre principal
  aliases: string[];      // Nombres alternativos (para detección IA)
  cta: string;            // Cuenta PCGE inventario (Dr al comprar)
  cta_name: string;       // Nombre cuenta inventario
  gasto: string;          // Cuenta PCGE gasto (Dr al consumir)
  gasto_name: string;     // Nombre cuenta gasto
  nat: string;            // Naturaleza (SU, MP, ME, etc.)
  nat_name: string;       // Descripción naturaleza
  tk: TokenTipo;          // P=Permanente T=Temporal F=Fungible
  unit: string;           // Unidad de medida SUNAT
  rubros: Rubro[];        // Rubros que usan este artículo
  class_name: string;     // Clasificación PCGE legible
  description?: string;   // Descripción técnica
  ai_keywords: string[];  // Palabras clave para detección IA
}

// ============================================================
// RUBROS — DEFINICIÓN
// ============================================================
export const RUBROS_DEF: Record<Rubro, { name: string; icon: string; color: string }> = {
  GE: { name: 'General (Todas las empresas)',    icon: '🏢', color: '#58a6ff' },
  MI: { name: 'Minería',                         icon: '⛏',  color: '#d4a017' },
  CO: { name: 'Construcción',                    icon: '🏗',  color: '#e36f2a' },
  FA: { name: 'Fabricación / Manufactura',       icon: '🏭',  color: '#3fb950' },
  CM: { name: 'Comercial / Ventas',              icon: '🛒',  color: '#a371f7' },
  DI: { name: 'Distribución / Logística',        icon: '🚚',  color: '#22d3ee' },
  AG: { name: 'Agropecuario',                    icon: '🌾',  color: '#84cc16' },
  PE: { name: 'Pesca / Acuicultura',             icon: '🎣',  color: '#06b6d4' },
  SA: { name: 'Salud / Farmacéutico',            icon: '🏥',  color: '#f43f5e' },
  HO: { name: 'Hostelería / Restaurantes',       icon: '🍽',  color: '#fb923c' },
  TR: { name: 'Transporte',                      icon: '🚛',  color: '#fbbf24' },
  EN: { name: 'Energía / Utilities',             icon: '⚡',  color: '#eab308' },
  TE: { name: 'Tecnología / TI',                icon: '💻',  color: '#8b5cf6' },
  RE: { name: 'Inmobiliaria / Real Estate',      icon: '🏠',  color: '#10b981' },
  ED: { name: 'Educación',                       icon: '📚',  color: '#6366f1' },
};

// ============================================================
// MAPA DE CUENTAS PCGE
// ============================================================
export const PCGE_INVENTARIO: Record<string, string> = {
  '201': 'Mercaderías manufacturadas',
  '202': 'Mercaderías no manufacturadas',
  '211': 'Productos terminados',
  '221': 'Subproductos',
  '231': 'Productos en proceso',
  '241': 'Materias primas manufactureras',
  '242': 'Materias primas no manufactureras',
  '251': 'Materiales auxiliares',
  '252': 'Suministros',
  '253': 'Repuestos',
  '261': 'Envases',
  '262': 'Embalajes',
  '271': 'Activos NC disponibles para venta',
  '281': 'Existencias por recibir',
  '333': 'Maquinaria y equipo de explotación',
  '334': 'Unidades de transporte',
  '335': 'Muebles y enseres',
  '336': 'Equipos diversos',
  '337': 'Herramientas y unidades de reemplazo',
};

export const PCGE_GASTO: Record<string, string> = {
  '6011': 'Compras de mercaderías (manufact.)',
  '6012': 'Compras de mercaderías (no manufact.)',
  '6021': 'Compras de mat. primas (manufact.)',
  '6022': 'Compras de mat. primas (no manufact.)',
  '6031': 'Materiales auxiliares',
  '6032': 'Suministros',
  '6033': 'Repuestos',
  '6041': 'Envases',
  '6042': 'Embalajes',
  '6111': 'Variación MP manufactureras',
  '6112': 'Variación MP no manufactureras',
  '6131': 'Variación mat. auxiliares',
  '6132': 'Variación suministros',
  '6133': 'Variación repuestos',
  '6411': 'Envases y embalajes',
  '6412': 'Embalajes',
  '6561': 'Suministros - útiles de oficina',
  '6562': 'Suministros - combustibles',
  '6563': 'Suministros - pequeños instrumentos',
  '6564': 'Suministros - EPP',
  '6569': 'Suministros - otros',
  '6531': 'Repuestos y accesorios',
  '6811': 'Depreciación - edificios',
  '6813': 'Depreciación - maquinaria',
  '6814': 'Depreciación - transporte',
  '6815': 'Depreciación - muebles',
  '6816': 'Depreciación - equipos',
  '6817': 'Depreciación - herramientas',
  '6911': 'Costo de ventas (merc. manufact.)',
  '6912': 'Costo de ventas (merc. no manufact.)',
};

// ============================================================
// DERIVATION MAPS
// ============================================================
const NAT_TO_GASTO: Record<string, string> = {
  'SU': '6561', 'CO': '6562', 'EP': '6564', 'LI': '6569',
  'GA': '6569', 'TI': '6561', 'AG': '6569', 'AL': '6569',
  'HM': '6569', 'FE': '6569',
  'MP': '6021', 'MC': '6021', 'MF': '6021', 'MM': '6022', 'MA': '6031',
  'ME': '6012', 'MD': '6012',
  'RM': '6531', 'RE': '6531', 'RN': '6531', 'RI': '6531',
  'MQ': '6813', 'EQ': '6816', 'VH': '6814', 'MU': '6815',
  'HT': '6817', 'HE': '6817',
  'EX': '6562', 'QU': '6569', 'EC': '6411', 'CB': '6412',
};

const NAT_NAMES: Record<string, string> = {
  'SU': 'Suministro Oficina', 'CO': 'Combustible', 'EP': 'EPP Seguridad',
  'LI': 'Limpieza e Higiene', 'GA': 'Gas Industrial', 'TI': 'Suministro TI',
  'AG': 'Agroquímico', 'AL': 'Alimento Insumo', 'HM': 'Herramienta Manual',
  'FE': 'Suministro Ferretería',
  'MP': 'Materia Prima Manufact.', 'MC': 'Mat. Construcción',
  'MF': 'Mat. Forestal/Madera', 'MM': 'Mineral', 'MA': 'Mat. Auxiliar Producción',
  'ME': 'Mercadería', 'MD': 'Mercadería Distribución',
  'RM': 'Repuesto Mecánico', 'RE': 'Repuesto Eléctrico',
  'RN': 'Repuesto Neumático', 'RI': 'Repuesto Informático',
  'MQ': 'Maquinaria', 'EQ': 'Equipo Cómputo', 'VH': 'Vehículo',
  'MU': 'Mueble/Enser', 'HT': 'Herramienta Temporal', 'HE': 'Herramienta Permanente',
  'EX': 'Explosivo', 'QU': 'Químico Industrial', 'EC': 'Envase', 'CB': 'Embalaje Cartón',
};

const NAT_TO_CLASS_TS: Record<string, string> = {
  'SU': 'Suministros', 'CO': 'Suministros', 'EP': 'Suministros',
  'LI': 'Suministros', 'GA': 'Suministros', 'TI': 'Suministros',
  'AG': 'Suministros', 'AL': 'Suministros', 'HM': 'Suministros', 'FE': 'Suministros',
  'MP': 'Materias Primas', 'MC': 'Materias Primas', 'MF': 'Materias Primas',
  'MM': 'Materias Primas', 'MA': 'Materiales Auxiliares', 'ME': 'Mercaderías',
  'MD': 'Mercaderías',
  'RM': 'Repuestos', 'RE': 'Repuestos', 'RN': 'Repuestos', 'RI': 'Repuestos',
  'MQ': 'Activo Fijo', 'EQ': 'Activo Fijo', 'VH': 'Activo Fijo',
  'MU': 'Activo Fijo', 'HT': 'Activo Fijo', 'HE': 'Activo Fijo',
  'EX': 'Suministros', 'QU': 'Suministros', 'EC': 'Envases', 'CB': 'Embalajes',
};

// Special gasto overrides (CTA wins over NAT for these accounts)
const GASTO_OVERRIDES: Record<string, string> = {
  '201': '6911', '202': '6912', '211': '6111',
  '241': '6021', '242': '6022', '251': '6031',
  '261': '6411', '262': '6412',
  '333': '6813', '334': '6814', '335': '6815', '336': '6816', '337': '6817',
};

const ALL_RUBROS: Rubro[] = ['GE','MI','CO','FA','CM','DI','AG','PE','SA','HO','TR','EN','TE','RE','ED'];

interface CompactItem {
  c: string;
  n: string;
  a?: string[];
  u: string;
  r: Rubro[] | 'ALL';
  k: string[];
}

function expandItem(item: CompactItem): CatalogItem {
  const parts = item.c.split('-');
  const cta = parts[0], nat = parts[1], tk = parts[4] as TokenTipo;
  const gasto = GASTO_OVERRIDES[cta] ?? NAT_TO_GASTO[nat] ?? '6569';
  return {
    code: item.c,
    name: item.n,
    aliases: item.a ?? [],
    cta,
    cta_name: PCGE_INVENTARIO[cta] ?? cta,
    gasto,
    gasto_name: PCGE_GASTO[gasto] ?? gasto,
    nat,
    nat_name: NAT_NAMES[nat] ?? nat,
    tk,
    unit: item.u,
    rubros: item.r === 'ALL' ? ALL_RUBROS : item.r,
    class_name: NAT_TO_CLASS_TS[nat] ?? 'Suministros',
    ai_keywords: item.k,
  };
}

import COMPACT_CATALOG from './catalog.json';
export const CATALOG: CatalogItem[] = (COMPACT_CATALOG as CompactItem[]).map(expandItem);

// ============================================================
// FUNCIONES DE BÚSQUEDA Y MATCHING
// ============================================================

/** Filtra el catálogo por rubro(s) */
export function getCatalogByRubro(rubros: Rubro[]): CatalogItem[] {
  return CATALOG.filter(item => item.rubros.some(r => rubros.includes(r)));
}

/** Filtra por cuenta PCGE de inventario */
export function getCatalogByCta(cta: string): CatalogItem[] {
  return CATALOG.filter(item => item.cta === cta);
}

/** Matching IA: dada una descripción de factura, encuentra el artículo más cercano */
export function matchCatalogItem(
  description: string,
  accountCode?: string,
  rubro?: Rubro,
): CatalogItem | null {
  const desc = description.toLowerCase();
  const pool = rubro
    ? CATALOG.filter(i => i.rubros.includes(rubro) || i.rubros.includes('GE'))
    : CATALOG;

  let best: CatalogItem | null = null;
  let bestScore = 0;

  for (const item of pool) {
    if (accountCode && item.cta !== accountCode.slice(0, 3) && item.cta !== accountCode) continue;

    let score = 0;
    for (const kw of item.ai_keywords) {
      const kwl = kw.toLowerCase();
      if (desc.includes(kwl)) {
        score += kwl.includes(' ') ? 4 : 2;
      }
    }
    for (const alias of item.aliases) {
      if (desc.includes(alias.toLowerCase())) score += 5;
    }
    if (desc.includes(item.name.toLowerCase())) score += 8;

    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }

  return bestScore >= 2 ? best : null;
}

/** Genera el siguiente código secuencial para una CTA+NAT+RUB dado */
export function generateNextCode(
  existingCodes: string[],
  cta: string,
  nat: string,
  rub: string,
  tk: TokenTipo,
): string {
  const prefix = `${cta}-${nat}-${rub}-`;
  const existing = existingCodes
    .filter(c => c.startsWith(prefix))
    .map(c => parseInt(c.slice(prefix.length, prefix.length + 4)) || 0);
  const next = (Math.max(0, ...existing) + 1).toString().padStart(4, '0');
  return `${prefix}${next}-${tk}`;
}

/** Retorna todas las cuentas PCGE presentes en el catálogo para un rubro */
export function getCtasForRubro(rubro: Rubro): string[] {
  const ctas = new Set<string>();
  CATALOG.filter(i => i.rubros.includes(rubro)).forEach(i => ctas.add(i.cta));
  return Array.from(ctas).sort();
}
