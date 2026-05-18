import React, { useEffect, useMemo, useState } from 'react';

export type AccountingMovement = {
  id: string;
  date: string;
  period: string;
  glosa: string;
  account: string;
  accountName: string;
  costCenter: string;
  debit: number;
  credit: number;
  module: string;
  status: string;
  hash: string;
  risk: 'BAJO' | 'MEDIO' | 'ALTO';
};

type AccountingLivePanelProps = {
  movements?: AccountingMovement[];
  loading?: boolean;
  selectedMovementId?: string;
  statusMessage?: string;
  aiMessage?: string;
  onRefresh?: () => void;
  onExportCsv?: () => void;
  onRunAudit?: () => void;
  onSelectMovement?: (movement: AccountingMovement) => void;
};

const plan = [
  { code: '10', name: 'Efectivo y equivalentes', type: 'Activo', prefixes: ['10'] },
  { code: '12', name: 'Cuentas por cobrar comerciales', type: 'Activo', prefixes: ['12'] },
  { code: '40', name: 'Tributos, contraprestaciones y aportes', type: 'Tributario', prefixes: ['40'] },
  { code: '41', name: 'Remuneraciones por pagar', type: 'Pasivo', prefixes: ['41'], modules: ['PAYROLL', 'PLANILLAS'] },
  { code: '42', name: 'Cuentas por pagar comerciales', type: 'Pasivo', prefixes: ['42'] },
  { code: '60', name: 'Compras registradas', type: 'Modulo compras', prefixes: ['60'], modules: ['PURCHASING', 'COMPRAS'] },
  { code: '62', name: 'Gastos de personal', type: 'Planillas', prefixes: ['62'], modules: ['PAYROLL', 'PLANILLAS'] },
  { code: '63', name: 'Servicios prestados por terceros', type: 'Gasto', prefixes: ['63'] },
  { code: '67', name: 'Gastos financieros', type: 'Gasto', prefixes: ['67'] },
  { code: '68', name: 'Valorizacion y deterioro', type: 'Gasto', prefixes: ['68'] },
  { code: '70', name: 'Ventas', type: 'Ingreso', prefixes: ['70'], modules: ['BILLING', 'VENTAS', 'SALES_IA'] },
];

const money = (value: number) =>
  `S/ ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function AccountingLivePanel({
  movements = [],
  loading = false,
  selectedMovementId,
  statusMessage = '',
  aiMessage = '',
  onRefresh,
  onExportCsv,
  onRunAudit,
  onSelectMovement,
}: AccountingLivePanelProps) {
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(selectedMovementId ?? null);
  const [search, setSearch] = useState('');

  const accountTotals = useMemo(() => {
    const result = new Map<string, { count: number; debit: number; credit: number }>();
    for (const account of plan) {
      result.set(account.code, { count: 0, debit: 0, credit: 0 });
    }
    for (const movement of movements) {
      for (const parent of plan) {
        const byPrefix = parent.prefixes.some((prefix) => movement.account.startsWith(prefix));
        const byModule = parent.modules?.some((module) => movement.module.toUpperCase() === module);
        if (!byPrefix && !byModule) continue;
        const total = result.get(parent.code) ?? { count: 0, debit: 0, credit: 0 };
        total.count += 1;
        total.debit += movement.debit;
        total.credit += movement.credit;
        result.set(parent.code, total);
      }
    }
    return result;
  }, [movements]);

  const filtered = useMemo(() => {
    return movements.filter((m) => {
      const account = plan.find((item) => item.code === selectedAccount);
      const byAccount = account
        ? account.prefixes.some((prefix) => m.account.startsWith(prefix))
          || account.modules?.some((module) => m.module.toUpperCase() === module)
        : true;
      const bySearch = `${m.glosa} ${m.account} ${m.accountName} ${m.module} ${m.hash}`
        .toLowerCase()
        .includes(search.toLowerCase());
      return byAccount && bySearch;
    });
  }, [movements, selectedAccount, search]);

  useEffect(() => {
    if (selectedMovementId) {
      setSelectedId(selectedMovementId);
    }
  }, [selectedMovementId]);

  useEffect(() => {
    if (!filtered.length) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !filtered.some((item) => item.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  const selected = filtered.find((item) => item.id === selectedId) ?? filtered[0];
  const debe = filtered.reduce((a, b) => a + b.debit, 0);
  const haber = filtered.reduce((a, b) => a + b.credit, 0);

  return (
    <section className="sap-card" style={{ marginTop: 0, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="sap-card-head">
        <div>
          <h3>Plan Contable Vivo | Libro Diario y Mayor Analítico</h3>
          <p>{statusMessage || 'Datos reales del Libro Diario conectados al Mayor Analítico.'}</p>
        </div>

        <div className="sap-actions">
          <input
            className="sap-search"
            placeholder="Buscar cuenta, glosa, RUC, hash..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="sap-btn" type="button" onClick={onRefresh}>Actualizar</button>
          <button className="sap-btn" type="button" onClick={onExportCsv}>CSV</button>
          <button className="sap-btn blue" type="button" onClick={onRunAudit}>Auditoría IA</button>
        </div>
      </div>

      <div className="sap-live-grid" style={{ flex: 1, minHeight: 0 }}>
        <aside className="sap-plan-list">
          <button
            type="button"
            className={`sap-account ${selectedAccount === '' ? 'active' : ''}`}
            onClick={() => setSelectedAccount('')}
          >
            <span>∑</span>
            <div>
              <strong>Todas las cuentas</strong>
              <small>{movements.length} movimientos</small>
            </div>
          </button>
          {plan.map((account) => (
            (() => {
              const total = accountTotals.get(account.code) ?? { count: 0, debit: 0, credit: 0 };
              return (
            <button
              key={account.code}
              type="button"
              className={`sap-account ${selectedAccount === account.code ? 'active' : ''}`}
              onClick={() => setSelectedAccount(account.code)}
            >
              <span>{account.code}</span>
              <div>
                <strong>{account.name}</strong>
                <small>{account.type} · {total.count} mov. · {money(total.debit - total.credit)}</small>
              </div>
            </button>
              );
            })()
          ))}
        </aside>

        <div className="sap-ledger-wrap">
          <table className="sap-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Periodo</th>
                <th>Glosa</th>
                <th>Cuenta</th>
                <th>CC</th>
                <th>Debe</th>
                <th>Haber</th>
                <th>Estado</th>
                <th>Módulo</th>
                <th>Hash</th>
              </tr>
            </thead>

            <tbody>
              {loading && movements.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: 24 }}>
                    Cargando Libro Diario desde la API...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: 24 }}>
                    Sin movimientos reales para la cuenta o búsqueda seleccionada.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => {
                      setSelectedId(row.id);
                      onSelectMovement?.(row);
                    }}
                    style={selected?.id === row.id ? { outline: '2px solid #2563eb', outlineOffset: '-2px' } : undefined}
                  >
                    <td>{row.date}</td>
                    <td>{row.period}</td>
                    <td>{row.glosa}</td>
                    <td>
                      <strong>{row.account}</strong>
                      <br />
                      <small>{row.accountName}</small>
                    </td>
                    <td>{row.costCenter}</td>
                    <td className="money">{row.debit ? money(row.debit) : '-'}</td>
                    <td className="money">{row.credit ? money(row.credit) : '-'}</td>
                    <td>
                      <span className={`sap-badge ${row.risk.toLowerCase()}`}>{row.status}</span>
                    </td>
                    <td>{row.module}</td>
                    <td className="hash">{row.hash}</td>
                  </tr>
                ))
              )}
            </tbody>

            <tfoot>
              <tr>
                <td colSpan={5}>Totales visibles</td>
                <td className="money">{money(debe)}</td>
                <td className="money">{money(haber)}</td>
                <td colSpan={3}>{Math.abs(debe - haber) < 0.01 ? 'Cuadrado' : 'Diferencia por cuenta seleccionada'}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <aside className="sap-detail">
          <h3>Detalle Analítico</h3>

          {selected ? (
            <>
              <p><b>Asiento:</b> {selected.id}</p>
              <p><b>Cuenta:</b> {selected.account} - {selected.accountName}</p>
              <p><b>Centro costo:</b> {selected.costCenter}</p>
              <p><b>Módulo:</b> {selected.module}</p>
              <p><b>Estado:</b> {selected.status}</p>
              <p><b>Hash:</b> {selected.hash}</p>

              <div className="sap-chart">
                <div style={{ height: 42 }} />
                <div style={{ height: 74 }} />
                <div style={{ height: 28 }} />
                <div style={{ height: 92 }} />
                <div style={{ height: 55 }} />
              </div>

              <h4>Recomendación IA</h4>
              <ul>
                <li>{selected.risk === 'ALTO' ? 'Priorizar revisión del asiento y su cuadre.' : 'Movimiento sin alerta crítica visible.'}</li>
                <li>Validar centro de costo asignado cuando aplique clase 6 o 9.</li>
                <li>Verificar respaldo XML/PDF y trazabilidad del hash.</li>
                <li>{aiMessage || 'Ejecuta Auditoría IA para ampliar recomendaciones.'}</li>
              </ul>
            </>
          ) : (
            <p>Selecciona una cuenta con movimientos reales del Libro Diario.</p>
          )}
        </aside>
      </div>
    </section>
  );
}

