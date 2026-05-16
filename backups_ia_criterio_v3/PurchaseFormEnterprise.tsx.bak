import React, { useMemo, useRef, useState } from 'react';
import { Button, Field, Input, MessageBar, MessageBarBody, Text } from '@fluentui/react-components';
import { Search24Regular } from '@fluentui/react-icons';

export type PurchaseFormData = {
  serie: string;
  number: string;
  supplierRuc: string;
  subtotal: string;
  igv: string;
  expenseAccount: string;
  costCenter: string;
};

type PurchaseItem = {
  id: string;
  code: string;
  description: string;
  unit: string;
  quantity: string;
  unitPrice: string;
  lineSubtotal: string;
  accountCode: string;
  accountName: string;
  costCenter: string;
  taxTreatment: string;
  aiReason: string;
  aiConfidence: number;
  requiresReview: boolean;
};

type GuideForm = {
  serie: string;
  number: string;
  transferDate: string;
  motivoTraslado: string;
  modalidadTransporte: string;
  pesoBrutoTotal: string;
  numeroBultos: string;
  partidaDireccion: string;
  partidaUbigeo: string;
  llegadaDireccion: string;
  llegadaUbigeo: string;
  transportistaRuc: string;
  transportistaRazonSocial: string;
  conductorDni: string;
  conductorLicencia: string;
  placaVehiculo: string;
};

type RucValidationState = 'idle' | 'validating' | 'valid' | 'invalid' | 'unknown';

export type PurchaseSubmitPayload = {
  form: PurchaseFormData;
  supplierName: string;
  issueDate: string;
  subtotal: string;
  igv: string;
  total: string;
  items: Array<{
    code: string;
    description: string;
    unit: string;
    quantity: string;
    unitPrice: string;
    lineSubtotal: string;
    accountCode: string;
    accountName: string;
    costCenter: string;
    taxTreatment: string;
    aiReason: string;
    aiConfidence: number;
    requiresReview: boolean;
  }>;
  accountLines: Array<{
    accountCode: string;
    accountName: string;
    costCenter: string;
    debit: string;
    credit: string;
    lineType: 'EXPENSE_OR_ASSET' | 'TAX' | 'PAYABLE';
    taxTreatment: string;
  }>;
  accountsToUpsert: Array<{
    accountCode: string;
    accountName: string;
    accountClass: string;
    nature: 'DEBIT' | 'CREDIT';
    taxTreatment: string;
    requiresReview: boolean;
  }>;
  costCentersToUpsert: Array<{
    code: string;
    name: string;
    source: 'PURCHASE_FORM' | 'GEMINI' | 'MANUAL';
  }>;
  auditMetadata: {
    source: 'MANUAL' | 'GEMINI';
    selectedFileName: string;
    aiWarnings: string[];
    modifyReason: string;
    modifyDetail: string;
    engineVersion: string;
  };
};

type PurchaseFormEnterpriseProps = {
  form: PurchaseFormData;
  onFormChange: (next: PurchaseFormData) => void;
  tenantId?: string;
  onClose: () => void;
  onSubmit: (payload: PurchaseSubmitPayload) => Promise<void> | void;
};

type GeminiPurchaseItem = {
  code?: string;
  description?: string;
  unit?: string;
  quantity?: number | string;
  unit_price?: number | string;
  line_subtotal?: number | string;
  account_code?: string;
  account_name?: string;
  cost_center?: string;
  tax_treatment?: string;
  ai_reason?: string;
  ai_confidence?: number;
};

type GeminiPurchaseResponse = {
  serie?: string;
  number?: string;
  issue_date?: string;
  supplier_ruc?: string;
  supplier_name?: string;
  subtotal?: number | string;
  igv?: number | string;
  total?: number | string;
  cost_center?: string;
  expense_account?: string;
  items?: GeminiPurchaseItem[];
  warnings?: string[];
};

const API_BASE = '/api/v1';
const DEFAULT_COST_CENTER = 'LIM-ADM';
const ENGINE_VERSION = 'CONTA_PRO_PURCHASE_AI_RULES_PE_2026_01';

const toNumber = (value: string | number | undefined | null) => {
  const parsed = Number.parseFloat(String(value ?? '0').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
};

const money = (value: number) => value.toFixed(2);

const newId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random()}`;
};

const normalizeDate = (value?: string) => {
  if (!value) return '';
  const clean = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;
  const match = clean.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (!match) return '';
  const [, dd, mm, yyyy] = match;
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
};

const normalizeAccount = (value: string) => String(value || '').replace(/\D/g, '').slice(0, 10);

const accountClassName = (accountCode: string) => {
  const first = normalizeAccount(accountCode).charAt(0);
  if (first === '1') return 'Activo';
  if (first === '2') return 'Pasivo';
  if (first === '3') return 'Patrimonio';
  if (first === '4') return 'Tributos y aportes';
  if (first === '5') return 'Patrimonio / resultados acumulados';
  if (first === '6') return 'Gastos por naturaleza';
  if (first === '7') return 'Ingresos';
  if (first === '8') return 'Saldos intermediarios de gestión';
  if (first === '9') return 'Contabilidad analítica';
  return 'Cuenta por clasificar';
};

const accountNature = (accountCode: string): 'DEBIT' | 'CREDIT' => {
  const first = normalizeAccount(accountCode).charAt(0);
  return ['2', '3', '4', '5', '7'].includes(first) ? 'CREDIT' : 'DEBIT';
};

const normalizeCostCenter = (value?: string) => {
  const clean = String(value || DEFAULT_COST_CENTER).trim().toUpperCase().replace(/\s+/g, '-');
  return clean || DEFAULT_COST_CENTER;
};

const classifyPurchaseItem = (description: string, providerName = '') => {
  const text = `${description} ${providerName}`.toUpperCase();

  if (/AGUA|ALCANTARILLADO|SEDAPAL|LUZ|ELECTRICIDAD|ENEL|LUZ DEL SUR|ENERGIA|GAS|INTERNET|TELEFON|CARGO FIJO/.test(text)) {
    return { accountCode: '636101', accountName: 'Servicios básicos', taxTreatment: 'IGV crédito fiscal si cumple causalidad, comprobante válido, fehaciencia y anotación oportuna', aiConfidence: 0.95, aiReason: 'Servicio básico identificado por proveedor/descripción.', requiresReview: false };
  }
  if (/ASESORIA|CONSULTORIA|CONSULTOR|SERVICIO PROFESIONAL|HONORARIO|AUDITORIA|LEGAL|CONTABLE/.test(text)) {
    return { accountCode: '632101', accountName: 'Asesoría y consultoría', taxTreatment: 'Gasto deducible sujeto a causalidad, sustento, fehaciencia y bancarización si corresponde', aiConfidence: 0.91, aiReason: 'Servicio profesional o consultoría.', requiresReview: false };
  }
  if (/FLETE|TRANSPORTE|DELIVERY|COURIER|MOVILIDAD|TRASLADO|CARGA|ENVIO/.test(text)) {
    return { accountCode: '624101', accountName: 'Transportes y fletes', taxTreatment: 'Evaluar detracción si corresponde al servicio de transporte', aiConfidence: 0.9, aiReason: 'Gasto de transporte/flete.', requiresReview: false };
  }
  if (/MANTENIMIENTO|REPARACION|SOPORTE|TECNICO|SERVICIO TECNICO/.test(text)) {
    return { accountCode: '634101', accountName: 'Mantenimiento y reparaciones', taxTreatment: 'Gasto deducible si está vinculado a bienes del negocio y existe sustento', aiConfidence: 0.88, aiReason: 'Mantenimiento o reparación.', requiresReview: false };
  }
  if (/UTILES|SUMINISTRO|MATERIAL|LIMPIEZA|OFICINA|PAPEL|TONER|TINTA/.test(text)) {
    return { accountCode: '656101', accountName: 'Suministros diversos', taxTreatment: 'Gasto operativo deducible si cumple causalidad y sustento', aiConfidence: 0.87, aiReason: 'Suministros de operación/oficina.', requiresReview: false };
  }
  if (/PUBLICIDAD|MARKETING|ANUNCIO|CAMPAÑA|DISEÑO|REDES/.test(text)) {
    return { accountCode: '637101', accountName: 'Publicidad y marketing', taxTreatment: 'Deducible si acredita necesidad comercial, contrato/orden y sustento documental', aiConfidence: 0.88, aiReason: 'Publicidad o marketing.', requiresReview: false };
  }
  if (/ALQUILER|ARRENDAMIENTO|RENTA|LOCAL|OFICINA/.test(text)) {
    return { accountCode: '635101', accountName: 'Alquileres', taxTreatment: 'Revisar detracción, contrato y bancarización según corresponda', aiConfidence: 0.9, aiReason: 'Alquiler/arrendamiento.', requiresReview: false };
  }
  if (/LAPTOP|COMPUTADORA|IMPRESORA|MAQUINA|EQUIPO|MOBILIARIO|ACTIVO|VEHICULO/.test(text)) {
    return { accountCode: '336101', accountName: 'Activo fijo - equipos diversos', taxTreatment: 'No enviar directo a gasto; activar y depreciar si supera política de capitalización', aiConfidence: 0.82, aiReason: 'Posible activo fijo. Requiere revisión de capitalización.', requiresReview: true };
  }
  if (/MERCADERIA|PRODUCTO PARA VENTA|INVENTARIO|STOCK/.test(text)) {
    return { accountCode: '601101', accountName: 'Compras de mercaderías', taxTreatment: 'Afecta inventario/kardex y costo de ventas según política', aiConfidence: 0.86, aiReason: 'Mercadería/inventario.', requiresReview: false };
  }

  return { accountCode: '659101', accountName: 'Otros gastos de gestión', taxTreatment: 'Requiere revisión contable antes de postear', aiConfidence: 0.55, aiReason: 'No se identificó una regla confiable.', requiresReview: true };
};

const createItem = (costCenter = DEFAULT_COST_CENTER): PurchaseItem => ({
  id: newId(),
  code: '',
  description: '',
  unit: 'UND',
  quantity: '1.00',
  unitPrice: '0.00',
  lineSubtotal: '0.00',
  accountCode: '',
  accountName: '',
  costCenter: normalizeCostCenter(costCenter),
  taxTreatment: '',
  aiReason: '',
  aiConfidence: 0,
  requiresReview: true,
});

export const PurchaseFormEnterprise = ({ form, onFormChange, tenantId, onClose, onSubmit }: PurchaseFormEnterpriseProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [supplierName, setSupplierName] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [isAutoIgv, setIsAutoIgv] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [isReadingAi, setIsReadingAi] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [rucState, setRucState] = useState<RucValidationState>('idle');
  const [rucMessage, setRucMessage] = useState('Pendiente de validación externa');
  const [status, setStatus] = useState('');
  const [aiWarnings, setAiWarnings] = useState<string[]>([]);
  const [showGuide, setShowGuide] = useState(false);
  const [showModify, setShowModify] = useState(false);
  const [modifyReason, setModifyReason] = useState('');
  const [modifyDetail, setModifyDetail] = useState('');

  const [guide, setGuide] = useState<GuideForm>({
    serie: 'T001',
    number: '',
    transferDate: '',
    motivoTraslado: 'COMPRA',
    modalidadTransporte: 'PUBLICO',
    pesoBrutoTotal: '0.00',
    numeroBultos: '1',
    partidaDireccion: '',
    partidaUbigeo: '150101',
    llegadaDireccion: '',
    llegadaUbigeo: '150101',
    transportistaRuc: '',
    transportistaRazonSocial: '',
    conductorDni: '',
    conductorLicencia: '',
    placaVehiculo: '',
  });

  const subtotalItems = useMemo(() => items.reduce((acc, item) => acc + toNumber(item.lineSubtotal), 0), [items]);
  const subtotal = subtotalItems > 0 ? subtotalItems : toNumber(form.subtotal);
  const igv = isAutoIgv ? subtotal * 0.18 : toNumber(form.igv);
  const total = subtotal + igv;

  const groupedLines = useMemo(() => {
    const map = new Map<string, { accountCode: string; accountName: string; costCenter: string; amount: number; taxTreatment: string }>();
    items.forEach((item) => {
      if (!item.accountCode) return;
      const costCenter = normalizeCostCenter(item.costCenter || form.costCenter);
      const key = `${normalizeAccount(item.accountCode)}|${costCenter}`;
      const current = map.get(key);
      if (current) current.amount += toNumber(item.lineSubtotal);
      else map.set(key, {
        accountCode: normalizeAccount(item.accountCode),
        accountName: item.accountName,
        costCenter,
        amount: toNumber(item.lineSubtotal),
        taxTreatment: item.taxTreatment,
      });
    });
    return Array.from(map.values());
  }, [items, form.costCenter]);

  const accountsToUpsert = useMemo(() => {
    const map = new Map<string, PurchaseSubmitPayload['accountsToUpsert'][number]>();
    groupedLines.forEach((line) => {
      if (!line.accountCode) return;
      map.set(line.accountCode, {
        accountCode: line.accountCode,
        accountName: line.accountName || 'Cuenta por clasificar',
        accountClass: accountClassName(line.accountCode),
        nature: accountNature(line.accountCode),
        taxTreatment: line.taxTreatment,
        requiresReview: line.accountCode === '659101',
      });
    });
    map.set('40111', {
      accountCode: '40111',
      accountName: 'IGV crédito fiscal',
      accountClass: accountClassName('40111'),
      nature: 'DEBIT',
      taxTreatment: 'Crédito fiscal condicionado a comprobante válido, fehaciencia, causalidad y anotación oportuna',
      requiresReview: false,
    });
    map.set('4212', {
      accountCode: '4212',
      accountName: 'Cuentas por pagar comerciales',
      accountClass: accountClassName('4212'),
      nature: 'CREDIT',
      taxTreatment: 'Obligación comercial por comprobante pendiente de pago',
      requiresReview: false,
    });
    return Array.from(map.values());
  }, [groupedLines]);

  const costCentersToUpsert = useMemo(() => {
    const codes = new Set<string>();
    items.forEach((item) => codes.add(normalizeCostCenter(item.costCenter || form.costCenter)));
    if (codes.size === 0) codes.add(normalizeCostCenter(form.costCenter));
    return Array.from(codes).map((code) => ({ code, name: code, source: 'PURCHASE_FORM' as const }));
  }, [items, form.costCenter]);

  const updateField = (key: keyof PurchaseFormData, value: string) => {
    const next = { ...form, [key]: value };

    if (key === 'subtotal' && isAutoIgv) {
      next.igv = money(toNumber(value) * 0.18);
    }

    if (key === 'costCenter') {
      const previousGeneralCostCenter = normalizeCostCenter(form.costCenter);
      const nextCostCenter = normalizeCostCenter(value);

      setItems((prev) =>
        prev.map((item) => {
          const itemCostCenter = normalizeCostCenter(item.costCenter);
          const shouldUpdate =
            !item.costCenter ||
            itemCostCenter === DEFAULT_COST_CENTER ||
            itemCostCenter === previousGeneralCostCenter;

          return shouldUpdate ? { ...item, costCenter: nextCostCenter } : item;
        }),
      );
    }

    onFormChange(next);
  };

  const updateItem = (id: string, key: keyof PurchaseItem, value: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const next = { ...item, [key]: value };

        if (key === 'quantity' || key === 'unitPrice') {
          next.lineSubtotal = money(toNumber(next.quantity) * toNumber(next.unitPrice));
        }

        if (key === 'accountCode') {
          next.accountCode = normalizeAccount(value);
        }

        if (key === 'costCenter') {
          next.costCenter = normalizeCostCenter(value);
        }

        if (key === 'description') {
          const c = classifyPurchaseItem(value, supplierName);
          next.accountCode = c.accountCode;
          next.accountName = c.accountName;
          next.taxTreatment = c.taxTreatment;
          next.aiReason = c.aiReason;
          next.aiConfidence = c.aiConfidence;
          next.requiresReview = c.requiresReview;
          next.costCenter = normalizeCostCenter(form.costCenter || next.costCenter || DEFAULT_COST_CENTER);
        }

        return next;
      }),
    );
  };

  const addItem = () => setItems((prev) => [...prev, createItem(form.costCenter)]);
  const removeItem = (id: string) => setItems((prev) => prev.filter((item) => item.id !== id));

  const applyGeminiPayload = (payload: GeminiPurchaseResponse) => {
    const nextSerie = payload.serie || form.serie || '';
    const nextNumber = payload.number || form.number || '';
    const nextSupplierRuc = payload.supplier_ruc || form.supplierRuc || '';
    const nextSupplierName = payload.supplier_name || supplierName || '';
    const nextCostCenter = normalizeCostCenter(payload.cost_center || form.costCenter || DEFAULT_COST_CENTER);

    const mappedItems = (payload.items || []).map((raw) => {
      const description = String(raw.description || '');
      const fallback = classifyPurchaseItem(description, nextSupplierName);
      const qty = toNumber(raw.quantity || 1);
      const unitPrice = toNumber(raw.unit_price || 0);
      const lineSubtotal = toNumber(raw.line_subtotal || qty * unitPrice);
      const accountCode = normalizeAccount(String(raw.account_code || fallback.accountCode));
      const aiConfidence = Number(raw.ai_confidence ?? fallback.aiConfidence);

      return {
        id: newId(),
        code: String(raw.code || ''),
        description,
        unit: String(raw.unit || 'UND'),
        quantity: money(qty),
        unitPrice: money(unitPrice),
        lineSubtotal: money(lineSubtotal),
        accountCode,
        accountName: String(raw.account_name || fallback.accountName),
        costCenter: normalizeCostCenter(raw.cost_center || nextCostCenter),
        taxTreatment: String(raw.tax_treatment || fallback.taxTreatment),
        aiReason: String(raw.ai_reason || fallback.aiReason),
        aiConfidence,
        requiresReview: Boolean(fallback.requiresReview || aiConfidence < 0.8 || accountCode === '659101'),
      };
    });

    setIssueDate(normalizeDate(payload.issue_date));
    setSupplierName(nextSupplierName);
    setItems(mappedItems);
    setAiWarnings(payload.warnings || []);

    onFormChange({
      ...form,
      serie: nextSerie,
      number: nextNumber,
      supplierRuc: nextSupplierRuc,
      subtotal: money(toNumber(payload.subtotal ?? mappedItems.reduce((a, i) => a + toNumber(i.lineSubtotal), 0))),
      igv: money(toNumber(payload.igv ?? toNumber(payload.subtotal) * 0.18)),
      expenseAccount: normalizeAccount(String(payload.expense_account || mappedItems[0]?.accountCode || form.expenseAccount || '659101')),
      costCenter: nextCostCenter,
    });

    setStatus('Factura leída con Gemini. Revisa campos, cuenta contable y centro de costo antes de guardar.');
  };

  const readInvoiceWithGemini = async (file: File) => {
    setIsReadingAi(true);
    setSelectedFileName(file.name);
    setStatus('Leyendo factura con Gemini pixel por pixel...');
    setAiWarnings([]);

    try {
      const currentTenantId = tenantId || localStorage.getItem('tenant_id') || '11111111-1111-1111-1111-111111111111'

      const tokenResponse = await fetch(`${API_BASE}/auth/dev-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenant_id: currentTenantId,
          user_id: 'erp.operator',
          role: 'ADMIN',
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(await tokenResponse.text());
      }

      const tokenPayload = await tokenResponse.json();
      const token = tokenPayload.access_token;
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/purchases/process-ia`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'X-Tenant-Id': currentTenantId,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const payload = (await response.json()) as GeminiPurchaseResponse;
      applyGeminiPayload(payload);
    } catch (error) {
      setStatus(`No se pudo leer con Gemini. ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsReadingAi(false);
    }
  };

  const validateRucExternally = async () => {
    if (!/^\d{11}$/.test(form.supplierRuc)) {
      setRucState('invalid');
      setRucMessage('RUC inválido: debe tener 11 dígitos.');
      return;
    }
    setRucState('validating');
    setRucMessage('Consultando servicio externo...');
    try {
      const response = await fetch(`https://api.apis.net.pe/v2/sunat/ruc?numero=${form.supplierRuc}`);
      if (response.ok) {
        const data = await response.json();
        setSupplierName(data.razonSocial || data.nombre || supplierName);
        setRucState('valid');
        setRucMessage('RUC validado. Razón social cargada si el servicio la devolvió.');
        return;
      }
      setRucState('unknown');
      setRucMessage('SUNAT externo no disponible. Continuar con validación manual.');
    } catch {
      setRucState('unknown');
      setRucMessage('No se pudo validar externamente. Verifica red/CORS.');
    }
  };

  const openGuideFromInvoice = () => {
    setGuide((prev) => ({
      ...prev,
      transferDate: issueDate || prev.transferDate,
      motivoTraslado: 'COMPRA',
      numeroBultos: String(Math.max(items.length, 1)),
    }));
    setShowGuide(true);
  };

  const validateBeforeSubmit = () => {
    if (!form.serie.trim()) return 'Falta serie.';
    if (!form.number.trim()) return 'Falta número.';
    if (!issueDate.trim()) return 'Falta fecha.';
    if (!/^\d{11}$/.test(form.supplierRuc)) return 'RUC proveedor inválido.';
    if (!supplierName.trim()) return 'Falta razón social proveedor.';
    if (items.length === 0) return 'Agrega al menos un item.';
    if (subtotal <= 0) return 'Subtotal inválido.';
    for (const item of items) {
      if (!item.description.trim()) return 'Hay un item sin descripción.';
      if (!normalizeAccount(item.accountCode)) return `Item ${item.description}: falta cuenta contable.`;
      if (!normalizeCostCenter(item.costCenter)) return `Item ${item.description}: falta centro de costo.`;
      if (item.requiresReview && !modifyDetail.trim()) return `Item ${item.description}: requiere revisión contable. Usa Modificar y registra sustento.`;
    }
    return '';
  };

  const clearFormLabels = () => {
    setItems([]);
    setSupplierName('');
    setIssueDate('');
    setStatus('');
    setModifyReason('');
    setModifyDetail('');
    setAiWarnings([]);
    setSelectedFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    onFormChange({ ...form, serie: '', number: '', supplierRuc: '', subtotal: '0.00', igv: '0.00', expenseAccount: '', costCenter: DEFAULT_COST_CENTER });
  };

  const handleSubmit = async () => {
    const error = validateBeforeSubmit();
    if (error) {
      setStatus(error);
      return;
    }

    const firstLine = groupedLines[0];
    const nextForm: PurchaseFormData = {
      ...form,
      subtotal: money(subtotal),
      igv: money(igv),
      expenseAccount: firstLine?.accountCode || normalizeAccount(form.expenseAccount) || '659101',
      costCenter: firstLine?.costCenter || normalizeCostCenter(form.costCenter),
    };

    const normalizedItems = items.map((item) => ({
      code: item.code,
      description: item.description,
      unit: item.unit,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineSubtotal: item.lineSubtotal,
      accountCode: normalizeAccount(item.accountCode),
      accountName: item.accountName,
      costCenter: normalizeCostCenter(item.costCenter || nextForm.costCenter),
      taxTreatment: item.taxTreatment,
      aiReason: item.aiReason,
      aiConfidence: item.aiConfidence,
      requiresReview: item.requiresReview,
    }));

    const submitPayload: PurchaseSubmitPayload = {
      form: nextForm,
      supplierName,
      issueDate,
      subtotal: money(subtotal),
      igv: money(igv),
      total: money(total),
      items: normalizedItems,
      accountLines: [
        ...groupedLines.map((line) => ({
          accountCode: line.accountCode,
          accountName: line.accountName,
          costCenter: normalizeCostCenter(line.costCenter),
          debit: money(line.amount),
          credit: '0.00',
          lineType: 'EXPENSE_OR_ASSET' as const,
          taxTreatment: line.taxTreatment,
        })),
        {
          accountCode: '40111',
          accountName: 'IGV crédito fiscal',
          costCenter: '-',
          debit: money(igv),
          credit: '0.00',
          lineType: 'TAX' as const,
          taxTreatment: 'Crédito fiscal condicionado a comprobante válido, causalidad, fehaciencia y anotación oportuna',
        },
        {
          accountCode: '4212',
          accountName: 'Cuentas por pagar comerciales',
          costCenter: '-',
          debit: '0.00',
          credit: money(total),
          lineType: 'PAYABLE' as const,
          taxTreatment: 'Obligación comercial por comprobante de compra',
        },
      ],
      accountsToUpsert,
      costCentersToUpsert,
      auditMetadata: {
        source: selectedFileName ? 'GEMINI' : 'MANUAL',
        selectedFileName,
        aiWarnings,
        modifyReason,
        modifyDetail,
        engineVersion: ENGINE_VERSION,
      },
    };

    onFormChange(nextForm);
    setIsPosting(true);

      try {
    await onSubmit(submitPayload);

    setStatus(
      'Compra posteada. Se actualizó registro de compras, centro de costos y asiento contable.'
    );

    // NO limpiar todavía hasta confirmar que todo funciona bien
    // clearFormLabels();
  } catch (error) {
    setStatus(
      `No se pudo guardar la compra. ${
        error instanceof Error ? error.message : 'Error desconocido'
      }`
    );
  } finally {
    setIsPosting(false);
  }
  };

  return (
    <div className="sheet-form" style={{ display: 'grid', gap: 14, maxHeight: '82vh', overflowY: 'auto', paddingRight: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
        <Text weight="semibold">Factura de Compra | Motor experto contable y tributario</Text>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button appearance="secondary" onClick={openGuideFromInvoice}>Generar guía</Button>
          <Button appearance="secondary" onClick={() => setShowModify(true)}>Modificar</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <Field label="Serie"><Input value={form.serie} onChange={(_, d) => updateField('serie', d.value)} /></Field>
        <Field label="Número"><Input value={form.number} onChange={(_, d) => updateField('number', d.value)} /></Field>
        <Field label="Fecha"><Input type="date" value={issueDate} onChange={(_, d) => setIssueDate(d.value)} /></Field>
      </div>

      <div style={{ border: '2px dashed #3b82f6', borderRadius: 12, padding: 16, background: '#f8fbff', textAlign: 'center' }}>
        <Text weight="semibold">Adjuntar factura / OCR Gemini</Text>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,application/pdf"
          style={{ display: 'none' }}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void readInvoiceWithGemini(file);
          }}
        />
        <div style={{ marginTop: 8, display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn-fluent-primary" type="button" onClick={() => fileInputRef.current?.click()} disabled={isReadingAi}>
            {isReadingAi ? 'Leyendo con Gemini...' : 'Adjuntar imagen/PDF y leer con IA'}
          </button>
          {selectedFileName && <span style={{ fontSize: 12, color: '#334155' }}>{selectedFileName}</span>}
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: '#64748b' }}>
          Gemini analiza imagen/PDF, extrae datos, clasifica cuenta contable, centro de costo y criterio tributario.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 12 }}>
        <Field label="RUC proveedor"><Input value={form.supplierRuc} onChange={(_, d) => updateField('supplierRuc', d.value)} contentAfter={<Search24Regular />} /></Field>
        <Field label="Razón social proveedor"><Input value={supplierName} onChange={(_, d) => setSupplierName(d.value)} /></Field>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 12 }}>
        <Button appearance="secondary" onClick={validateRucExternally}>Validar RUC Externo</Button>
        <MessageBar intent={rucState === 'valid' ? 'success' : rucState === 'invalid' ? 'error' : 'info'}><MessageBarBody>{rucMessage}</MessageBarBody></MessageBar>
      </div>

      {aiWarnings.length > 0 && (
        <MessageBar intent="warning"><MessageBarBody>{aiWarnings.join(' | ')}</MessageBarBody></MessageBar>
      )}

      <section className="dashboard-card" style={{ padding: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text weight="semibold">Detalle de Factura - Compras</Text>
          <button className="btn-fluent-primary" type="button" onClick={addItem}>+ Agregar producto</button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="erp-table" style={{ width: '100%', minWidth: 1320 }}>
            <thead>
              <tr>
                <th>Código</th><th>Descripción</th><th>Unidad</th><th>Cant.</th><th>P. Unit.</th><th>Subtotal</th><th>Cuenta</th><th>Nombre cuenta</th><th>Centro costo</th><th>Criterio tributario</th><th>IA</th><th>Acc.</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={12} style={{ textAlign: 'center', padding: 18, color: '#64748b' }}>Sin items. Agrega una línea o usa OCR Gemini.</td></tr>
              ) : items.map((item) => (
                <tr key={item.id}>
                  <td><input value={item.code} onChange={(e) => updateItem(item.id, 'code', e.target.value)} style={{ width: 80 }} /></td>
                  <td><input value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} style={{ width: 220 }} /></td>
                  <td><input value={item.unit} onChange={(e) => updateItem(item.id, 'unit', e.target.value)} style={{ width: 60 }} /></td>
                  <td><input value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', e.target.value)} style={{ width: 70, textAlign: 'right' }} /></td>
                  <td><input value={item.unitPrice} onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)} style={{ width: 85, textAlign: 'right' }} /></td>
                  <td><input value={item.lineSubtotal} onChange={(e) => updateItem(item.id, 'lineSubtotal', e.target.value)} style={{ width: 85, textAlign: 'right' }} /></td>
                  <td><input value={item.accountCode} onChange={(e) => updateItem(item.id, 'accountCode', e.target.value)} style={{ width: 80 }} /></td>
                  <td><input value={item.accountName} onChange={(e) => updateItem(item.id, 'accountName', e.target.value)} style={{ width: 170 }} /></td>
                  <td><input value={item.costCenter} onChange={(e) => updateItem(item.id, 'costCenter', e.target.value)} style={{ width: 90 }} /></td>
                  <td><input value={item.taxTreatment} onChange={(e) => updateItem(item.id, 'taxTreatment', e.target.value)} style={{ width: 240 }} /></td>
                  <td title={item.aiReason}>{Math.round(item.aiConfidence * 100)}%</td>
                  <td><Button appearance="secondary" onClick={() => removeItem(item.id)}>X</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="dashboard-card" style={{ padding: 12 }}>
        <Text weight="semibold">Asiento contable sugerido</Text>
        <table className="erp-table" style={{ width: '100%', marginTop: 10 }}>
          <thead><tr><th>Cuenta</th><th>Descripción</th><th>Centro costo</th><th>Debe</th><th>Haber</th></tr></thead>
          <tbody>
            {groupedLines.map((line) => (
              <tr key={`${line.accountCode}-${line.costCenter}`}><td>{line.accountCode}</td><td>{line.accountName}</td><td>{line.costCenter}</td><td style={{ textAlign: 'right' }}>{money(line.amount)}</td><td style={{ textAlign: 'right' }}>0.00</td></tr>
            ))}
            <tr><td>40111</td><td>IGV crédito fiscal</td><td>-</td><td style={{ textAlign: 'right' }}>{money(igv)}</td><td style={{ textAlign: 'right' }}>0.00</td></tr>
            <tr><td>4212</td><td>Cuentas por pagar comerciales</td><td>-</td><td style={{ textAlign: 'right' }}>0.00</td><td style={{ textAlign: 'right' }}>{money(total)}</td></tr>
          </tbody>
        </table>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
        <Field label="Cuenta fallback"><Input value={form.expenseAccount} onChange={(_, d) => updateField('expenseAccount', d.value)} /></Field>
        <Field label="Centro costo general"><Input value={form.costCenter} onChange={(_, d) => updateField('costCenter', d.value)} /></Field>
        <Field label="Subtotal"><Input value={money(subtotal)} disabled /></Field>
        <Field label="IGV"><Input value={money(igv)} disabled={isAutoIgv} onChange={(_, d) => updateField('igv', d.value)} /></Field>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
        <input type="checkbox" checked={isAutoIgv} onChange={(e) => setIsAutoIgv(e.target.checked)} />
        IGV auto-calculado 18%
      </label>

      <Text weight="semibold">Total: S/ {money(total)}</Text>

      {status && <MessageBar intent={status.includes('No se pudo') || status.includes('Falta') || status.includes('requiere') ? 'error' : 'success'}><MessageBarBody>{status}</MessageBarBody></MessageBar>}

      {showGuide && (
        <section className="dashboard-card" style={{ padding: 12, border: '2px solid #93c5fd' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text weight="semibold">Guía de remisión generada desde factura</Text>
            <Button appearance="secondary" onClick={() => setShowGuide(false)}>Cerrar guía</Button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 12 }}>
            {Object.entries(guide).map(([key, value]) => (
              <Field key={key} label={key}><Input value={value} onChange={(_, d) => setGuide((prev) => ({ ...prev, [key]: d.value }))} /></Field>
            ))}
          </div>
          <Text size={200}>Los items de la factura se usarán como detalle base de la guía. Completa datos de traslado, conductor y vehículo.</Text>
        </section>
      )}

      {showModify && (
        <section className="dashboard-card" style={{ padding: 12, border: '2px solid #fbbf24' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text weight="semibold">Solicitud de modificación controlada</Text>
            <Button appearance="secondary" onClick={() => setShowModify(false)}>Cerrar</Button>
          </div>
          <Field label="Qué se va a modificar"><Input value={modifyReason} onChange={(_, d) => setModifyReason(d.value)} placeholder="Ejemplo: cambiar cuenta, centro de costo, proveedor, fecha..." /></Field>
          <label style={{ display: 'grid', gap: 4, fontSize: 12, fontWeight: 600 }}>
            Explicación / sustento tributario
            <textarea value={modifyDetail} onChange={(e) => setModifyDetail(e.target.value)} rows={4} style={{ resize: 'vertical', border: '1px solid #cbd5e1', borderRadius: 6, padding: 8 }} placeholder="Explica el motivo. Si el periodo ya fue declarado, debe sugerir nota de crédito, reversión o ajuste." />
          </label>
          <Button appearance="primary" onClick={() => setStatus('Modificación registrada para auditoría. Debe validarse antes de alterar libros o asientos.')}>Guardar explicación</Button>
        </section>
      )}

      <div className="sheet-footer" style={{ position: 'static', borderTop: 'none', padding: 0, marginTop: 8, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Button appearance="secondary" onClick={onClose}>Cancelar</Button>
        <button type="button" className="btn-fluent-primary" onClick={handleSubmit} disabled={isPosting}>{isPosting ? 'Posteando...' : 'Guardar y Postear'}</button>
      </div>
    </div>
  );
};

export default PurchaseFormEnterprise;
