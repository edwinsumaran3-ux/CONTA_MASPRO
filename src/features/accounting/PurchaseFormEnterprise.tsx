import React, { useMemo, useState } from 'react';
import { Button, Field, Input, MessageBar, MessageBarBody, Text } from '@fluentui/react-components';
import { Search24Regular } from '@fluentui/react-icons';

type PurchaseFormData = {
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
  expenseType: string;
  aiReason: string;
  aiConfidence: number;
};

type RucValidationState = 'idle' | 'validating' | 'valid' | 'invalid' | 'unknown';

type PurchaseFormEnterpriseProps = {
  form: PurchaseFormData;
  onFormChange: (next: PurchaseFormData) => void;
  onClose: () => void;
  onSubmit: () => Promise<void> | void;
};

const toNumber = (value: string | number) => {
  const parsed = Number.parseFloat(String(value || '0'));
  return Number.isFinite(parsed) ? parsed : 0;
};

const money = (value: number) => value.toFixed(2);

const DEFAULT_COST_CENTER = 'LIM-ADM';

const classifyPurchaseItem = (description: string) => {
  const text = description.toUpperCase();

  if (/AGUA|ALCANTARILLADO|LUZ|ELECTRICIDAD|ENERGIA|GAS|INTERNET|TELEFON|CARGO FIJO/.test(text)) {
    return {
      accountCode: '636101',
      accountName: 'Servicios básicos',
      expenseType: 'SERVICIOS_BASICOS',
      aiConfidence: 0.95,
      aiReason: 'Clasificado como servicio básico por descripción del comprobante.',
    };
  }

  if (/ASESORIA|CONSULTORIA|CONSULTOR|SERVICIO PROFESIONAL|HONORARIO/.test(text)) {
    return {
      accountCode: '632101',
      accountName: 'Asesoría y consultoría',
      expenseType: 'SERVICIOS_PROFESIONALES',
      aiConfidence: 0.9,
      aiReason: 'Clasificado como servicio profesional / consultoría.',
    };
  }

  if (/FLETE|TRANSPORTE|DELIVERY|COURIER|MOVILIDAD|TRASLADO/.test(text)) {
    return {
      accountCode: '624101',
      accountName: 'Transportes y fletes',
      expenseType: 'TRANSPORTE',
      aiConfidence: 0.9,
      aiReason: 'Clasificado como gasto de transporte o flete.',
    };
  }

  if (/MANTENIMIENTO|REPARACION|SOPORTE|TECNICO/.test(text)) {
    return {
      accountCode: '634101',
      accountName: 'Mantenimiento y reparaciones',
      expenseType: 'MANTENIMIENTO',
      aiConfidence: 0.88,
      aiReason: 'Clasificado como mantenimiento o reparación.',
    };
  }

  if (/UTILES|SUMINISTRO|MATERIAL|LIMPIEZA|OFICINA/.test(text)) {
    return {
      accountCode: '656101',
      accountName: 'Suministros diversos',
      expenseType: 'SUMINISTROS',
      aiConfidence: 0.86,
      aiReason: 'Clasificado como suministros o materiales de oficina.',
    };
  }

  if (/PUBLICIDAD|MARKETING|ANUNCIO|CAMPAÑA|DISEÑO/.test(text)) {
    return {
      accountCode: '637101',
      accountName: 'Publicidad y marketing',
      expenseType: 'PUBLICIDAD',
      aiConfidence: 0.88,
      aiReason: 'Clasificado como publicidad o marketing.',
    };
  }

  if (/ALQUILER|ARRENDAMIENTO|RENTA/.test(text)) {
    return {
      accountCode: '635101',
      accountName: 'Alquileres',
      expenseType: 'ALQUILERES',
      aiConfidence: 0.9,
      aiReason: 'Clasificado como alquiler o arrendamiento.',
    };
  }

  if (/LAPTOP|COMPUTADORA|IMPRESORA|MAQUINA|EQUIPO|MOBILIARIO|ACTIVO/.test(text)) {
    return {
      accountCode: '336101',
      accountName: 'Activo fijo - equipos diversos',
      expenseType: 'ACTIVO_FIJO',
      aiConfidence: 0.82,
      aiReason: 'Posible activo fijo. Requiere revisión contable.',
    };
  }

  if (/MERCADERIA|PRODUCTO PARA VENTA|INVENTARIO/.test(text)) {
    return {
      accountCode: '601101',
      accountName: 'Compras de mercaderías',
      expenseType: 'MERCADERIA',
      aiConfidence: 0.85,
      aiReason: 'Clasificado como compra de mercadería.',
    };
  }

  return {
    accountCode: '659101',
    accountName: 'Otros gastos de gestión',
    expenseType: 'REVISION_CONTABLE',
    aiConfidence: 0.55,
    aiReason: 'No se pudo clasificar con alta confianza. Requiere revisión contable.',
  };
};

const createEmptyItem = (): PurchaseItem => ({
  id: crypto.randomUUID(),
  code: '',
  description: '',
  unit: 'UND',
  quantity: '1.00',
  unitPrice: '0.00',
  lineSubtotal: '0.00',
  accountCode: '',
  accountName: '',
  costCenter: DEFAULT_COST_CENTER,
  expenseType: '',
  aiReason: '',
  aiConfidence: 0,
});

export const PurchaseFormEnterprise = ({ form, onFormChange, onClose, onSubmit }: PurchaseFormEnterpriseProps) => {
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [supplierName, setSupplierName] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [isAutoIgv, setIsAutoIgv] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [rucState, setRucState] = useState<RucValidationState>('idle');
  const [rucMessage, setRucMessage] = useState('Pendiente de validación externa');
  const [status, setStatus] = useState('');

  const subtotalItems = useMemo(
    () => items.reduce((acc, item) => acc + toNumber(item.lineSubtotal), 0),
    [items],
  );

  const subtotal = subtotalItems > 0 ? subtotalItems : toNumber(form.subtotal);
  const igv = isAutoIgv ? subtotal * 0.18 : toNumber(form.igv);
  const total = subtotal + igv;

  const groupedExpenseLines = useMemo(() => {
    const groups = new Map<string, { accountCode: string; accountName: string; costCenter: string; amount: number }>();

    for (const item of items) {
      if (!item.accountCode) continue;
      const key = `${item.accountCode}|${item.costCenter || DEFAULT_COST_CENTER}`;
      const current = groups.get(key);
      if (current) {
        current.amount += toNumber(item.lineSubtotal);
      } else {
        groups.set(key, {
          accountCode: item.accountCode,
          accountName: item.accountName,
          costCenter: item.costCenter || DEFAULT_COST_CENTER,
          amount: toNumber(item.lineSubtotal),
        });
      }
    }

    return Array.from(groups.values());
  }, [items]);

  const updateField = (key: keyof PurchaseFormData, value: string) => {
    const next = { ...form, [key]: value };
    if (key === 'subtotal' && isAutoIgv) {
      next.igv = money(toNumber(value) * 0.18);
    }
    onFormChange(next);
  };

  const addItem = () => {
    setItems((prev) => [...prev, createEmptyItem()]);
  };

  const updateItem = (id: string, key: keyof PurchaseItem, value: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const next = { ...item, [key]: value };

        if (key === 'quantity' || key === 'unitPrice') {
          next.lineSubtotal = money(toNumber(next.quantity) * toNumber(next.unitPrice));
        }

        if (key === 'description') {
          const classified = classifyPurchaseItem(value);
          next.accountCode = classified.accountCode;
          next.accountName = classified.accountName;
          next.expenseType = classified.expenseType;
          next.aiReason = classified.aiReason;
          next.aiConfidence = classified.aiConfidence;
          next.costCenter = next.costCenter || form.costCenter || DEFAULT_COST_CENTER;
        }

        return next;
      }),
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
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
        setSupplierName(data.razonSocial || data.nombre || '');
        setRucState('valid');
        setRucMessage('RUC validado. Razón social cargada si el servicio la devolvió.');
        return;
      }

      setRucState('unknown');
      setRucMessage('SUNAT externo no disponible. Continuar con revisión manual.');
    } catch {
      setRucState('unknown');
      setRucMessage('No se pudo validar externamente. Verifica red/CORS.');
    }
  };

  const syncTotalsToParent = () => {
    const firstExpense = groupedExpenseLines[0];

    onFormChange({
      ...form,
      subtotal: money(subtotal),
      igv: money(igv),
      expenseAccount: firstExpense?.accountCode || form.expenseAccount || '659101',
      costCenter: form.costCenter || DEFAULT_COST_CENTER,
    });
  };

  const validateBeforeSubmit = () => {
    if (!form.serie.trim()) return 'Falta serie.';
    if (!form.number.trim()) return 'Falta número.';
    if (!issueDate.trim()) return 'Falta fecha de emisión.';
    if (!/^\d{11}$/.test(form.supplierRuc)) return 'RUC proveedor inválido.';
    if (!supplierName.trim()) return 'Falta razón social del proveedor.';
    if (items.length === 0) return 'Debe agregar al menos un item.';
    if (subtotal <= 0) return 'Subtotal debe ser mayor a cero.';

    for (const item of items) {
      if (!item.description.trim()) return 'Hay un item sin descripción.';
      if (toNumber(item.lineSubtotal) <= 0) return `El item "${item.description}" no tiene subtotal válido.`;
      if (!item.accountCode.trim()) return `El item "${item.description}" no tiene cuenta contable.`;
      if (!item.costCenter.trim()) return `El item "${item.description}" no tiene centro de costo.`;
    }

    return '';
  };

  const handleSubmit = async () => {
    const error = validateBeforeSubmit();
    if (error) {
      setStatus(error);
      return;
    }

    setIsPosting(true);
    setStatus('');

    try {
      syncTotalsToParent();
      await onSubmit();
      setStatus('Compra validada y enviada al backend.');
    } catch {
      setStatus('No se pudo guardar la compra. Revisar respuesta del backend.');
    } finally {
      setIsPosting(false);
    }
  };

  return ( 
  <div
    className="sheet-form"
    style={{
      display: 'grid',
      gap: 14,
      maxHeight: '80vh',
      overflowY: 'auto',
      paddingRight: 6,
    }}
  >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <Field label="Serie">
          <Input value={form.serie} onChange={(_, data) => updateField('serie', data.value)} />
        </Field>

        <Field label="Número">
          <Input value={form.number} onChange={(_, data) => updateField('number', data.value)} />
        </Field>

        <Field label="Fecha">
          <Input type="date" value={issueDate} onChange={(_, data) => setIssueDate(data.value)} />
        </Field>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 12 }}>
        <Field label="RUC proveedor">
          <Input
            value={form.supplierRuc}
            onChange={(_, data) => updateField('supplierRuc', data.value)}
            contentAfter={<Search24Regular />}
          />
        </Field>

        <Field label="Razón social proveedor">
          <Input value={supplierName} onChange={(_, data) => setSupplierName(data.value)} />
        </Field>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 12 }}>
        <Button appearance="secondary" onClick={validateRucExternally}>Validar RUC Externo</Button>
        <MessageBar intent={rucState === 'valid' ? 'success' : rucState === 'invalid' ? 'error' : 'info'}>
          <MessageBarBody>{rucMessage}</MessageBarBody>
        </MessageBar>
      </div>

      <section className="dashboard-card" style={{ padding: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text weight="semibold">Detalle de Factura - Compras</Text>
          <Button appearance="primary" onClick={addItem}>+ Agregar producto</Button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="erp-table" style={{ minWidth: 1200, width: '100%' }}>
            <thead>
              <tr>
                <th>Código</th>
                <th>Descripción</th>
                <th>Unidad</th>
                <th>Cantidad</th>
                <th>P. Unitario</th>
                <th>Subtotal</th>
                <th>Cuenta</th>
                <th>Nombre cuenta</th>
                <th>Centro costo</th>
                <th>Confianza IA</th>
                <th>Acc.</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: 20, color: '#64748b' }}>
                    Sin items. Agrega líneas o carga una factura con IA.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <input value={item.code} onChange={(e) => updateItem(item.id, 'code', e.target.value)} style={{ width: 80 }} />
                    </td>
                    <td>
                      <input value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} style={{ width: 240 }} />
                    </td>
                    <td>
                      <input value={item.unit} onChange={(e) => updateItem(item.id, 'unit', e.target.value)} style={{ width: 60 }} />
                    </td>
                    <td>
                      <input value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', e.target.value)} style={{ width: 70, textAlign: 'right' }} />
                    </td>
                    <td>
                      <input value={item.unitPrice} onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)} style={{ width: 90, textAlign: 'right' }} />
                    </td>
                    <td>
                      <input value={item.lineSubtotal} onChange={(e) => updateItem(item.id, 'lineSubtotal', e.target.value)} style={{ width: 90, textAlign: 'right' }} />
                    </td>
                    <td>
                      <input value={item.accountCode} onChange={(e) => updateItem(item.id, 'accountCode', e.target.value)} style={{ width: 90 }} />
                    </td>
                    <td>
                      <input value={item.accountName} onChange={(e) => updateItem(item.id, 'accountName', e.target.value)} style={{ width: 180 }} />
                    </td>
                    <td>
                      <input value={item.costCenter} onChange={(e) => updateItem(item.id, 'costCenter', e.target.value)} style={{ width: 90 }} />
                    </td>
                    <td title={item.aiReason}>
                      {(item.aiConfidence * 100).toFixed(0)}%
                    </td>
                    <td>
                      <Button appearance="secondary" onClick={() => removeItem(item.id)}>X</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="dashboard-card" style={{ padding: 12 }}>
        <Text weight="semibold">Asiento contable sugerido</Text>

        <div style={{ overflowX: 'auto', marginTop: 10 }}>
          <table className="erp-table" style={{ minWidth: 760, width: '100%' }}>
            <thead>
              <tr>
                <th>Cuenta</th>
                <th>Descripción</th>
                <th>Centro costo</th>
                <th>Debe</th>
                <th>Haber</th>
              </tr>
            </thead>
            <tbody>
              {groupedExpenseLines.map((line) => (
                <tr key={`${line.accountCode}-${line.costCenter}`}>
                  <td>{line.accountCode}</td>
                  <td>{line.accountName}</td>
                  <td>{line.costCenter}</td>
                  <td style={{ textAlign: 'right' }}>{money(line.amount)}</td>
                  <td style={{ textAlign: 'right' }}>0.00</td>
                </tr>
              ))}

              <tr>
                <td>40111</td>
                <td>IGV crédito fiscal</td>
                <td>-</td>
                <td style={{ textAlign: 'right' }}>{money(igv)}</td>
                <td style={{ textAlign: 'right' }}>0.00</td>
              </tr>

              <tr>
                <td>4212</td>
                <td>Cuentas por pagar comerciales</td>
                <td>-</td>
                <td style={{ textAlign: 'right' }}>0.00</td>
                <td style={{ textAlign: 'right' }}>{money(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
        <Field label="Subtotal">
          <Input value={money(subtotal)} disabled />
        </Field>

        <Field label="IGV">
          <Input value={money(igv)} disabled={isAutoIgv} onChange={(_, data) => updateField('igv', data.value)} />
        </Field>

        <Field label="Centro costo general">
          <Input value={form.costCenter || DEFAULT_COST_CENTER} onChange={(_, data) => updateField('costCenter', data.value)} />
        </Field>

        <Field label="Cuenta fallback">
          <Input value={form.expenseAccount} onChange={(_, data) => updateField('expenseAccount', data.value)} />
        </Field>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
        <input
          type="checkbox"
          checked={isAutoIgv}
          onChange={(event) => setIsAutoIgv(event.target.checked)}
        />
        IGV auto-calculado 18%
      </label>

      <Text weight="semibold">Total: S/ {money(total)}</Text>

      {status && (
        <MessageBar intent={status.includes('No se pudo') || status.includes('Falta') || status.includes('Debe') ? 'error' : 'success'}>
          <MessageBarBody>{status}</MessageBarBody>
        </MessageBar>
      )}

      <div className="sheet-footer" style={{ position: 'static', borderTop: 'none', padding: 0, marginTop: 8 }}>
        <Button appearance="secondary" onClick={onClose}>Cancelar</Button>
        <button type="button" className="btn-fluent-primary" onClick={handleSubmit} disabled={isPosting}>
          {isPosting ? 'Posteando...' : 'Guardar y Postear'}
        </button>
      </div>
    </div>
  );
};