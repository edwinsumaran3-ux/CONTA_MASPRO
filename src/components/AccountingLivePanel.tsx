import React, { useMemo, useState } from 'react';

type Movement = {
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

const movements: Movement[] = [
  {
    id: 'JE-2026-000184',
    date: '2026-05-01',
    period: '2026-05',
    glosa: 'Compra S106-24119152-49 SEDALIB S.A.',
    account: '636101',
    accountName: 'Servicios básicos',
    costCenter: 'LIM-ADM',
    debit: 54.96,
    credit: 0,
    module: 'COMPRAS',
    status: 'POSTEADO',
    hash: '9b8a25ff6a4142a',
    risk: 'BAJO',
  },
  {
    id: 'JE-2026-000184-2',
    date: '2026-05-01',
    period: '2026-05',
    glosa: 'IGV crédito fiscal compra SEDALIB',
    account: '40111',
    accountName: 'IGV crédito fiscal',
    costCenter: '-',
    debit: 9.89,
    credit: 0,
    module: 'COMPRAS',
    status: 'SUNAT',
    hash: '9b8a25ff6a4142a',
    risk: 'BAJO',
  },
  {
    id: 'JE-2026-000184-3',
    date: '2026-05-01',
    period: '2026-05',
    glosa: 'Cuenta por pagar SEDALIB S.A.',
    account: '4212',
    accountName: 'Cuentas por pagar comerciales',
    costCenter: '-',
    debit: 0,
    credit: 64.85,
    module: 'COMPRAS',
    status: 'POSTEADO',
    hash: '9b8a25ff6a4142a',
    risk: 'BAJO',
  },
  {
    id: 'JE-2026-000185',
    date: '2026-05-10',
    period: '2026-05',
    glosa: 'Venta F001-8422 cliente corporativo',
    account: '1212',
    accountName: 'Cuentas por cobrar comerciales',
    costCenter: 'LIM-COM',
    debit: 18880,
    credit: 0,
    module: 'VENTAS',
    status: 'SUNAT',
    hash: '8b2c3f6e4412a',
    risk: 'BAJO',
  },
];

const plan = [
  { code: '10', name: 'Efectivo y equivalentes', type: 'Activo' },
  { code: '12', name: 'Cuentas por cobrar comerciales', type: 'Activo' },
  { code: '40', name: 'Tributos, contraprestaciones y aportes', type: 'Tributario' },
  { code: '42', name: 'Cuentas por pagar comerciales', type: 'Pasivo' },
  { code: '60', name: 'Compras', type: 'Costo' },
  { code: '63', name: 'Servicios prestados por terceros', type: 'Gasto' },
  { code: '70', name: 'Ventas', type: 'Ingreso' },
];

const money = (value: number) =>
  `S/ ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function AccountingLivePanel() {
  const [selectedAccount, setSelectedAccount] = useState('63');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return movements.filter((m) => {
      const byAccount = selectedAccount ? m.account.startsWith(selectedAccount) : true;
      const bySearch = `${m.glosa} ${m.account} ${m.accountName} ${m.module} ${m.hash}`
        .toLowerCase()
        .includes(search.toLowerCase());
      return byAccount && bySearch;
    });
  }, [selectedAccount, search]);

  const selected = filtered[0];
  const debe = filtered.reduce((a, b) => a + b.debit, 0);
  const haber = filtered.reduce((a, b) => a + b.credit, 0);

  return (
    <section className="sap-card" style={{ marginTop: 18 }}>
      <div className="sap-card-head">
        <div>
          <h3>Plan Contable Vivo | Libro Diario y Mayor Analítico</h3>
          <p>Click en una cuenta para ver movimientos, comportamiento, riesgo, hash y recomendación IA.</p>
        </div>

        <div className="sap-actions">
          <input
            className="sap-search"
            placeholder="Buscar cuenta, glosa, RUC, hash..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="sap-btn">Excel</button>
          <button className="sap-btn">PDF</button>
          <button className="sap-btn blue">Auditoría IA</button>
        </div>
      </div>

      <div className="sap-live-grid">
        <aside className="sap-plan-list">
          {plan.map((account) => (
            <button
              key={account.code}
              type="button"
              className={`sap-account ${selectedAccount === account.code ? 'active' : ''}`}
              onClick={() => setSelectedAccount(account.code)}
            >
              <span>{account.code}</span>
              <div>
                <strong>{account.name}</strong>
                <small>{account.type}</small>
              </div>
            </button>
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: 24 }}>
                    Sin movimientos para la cuenta seleccionada.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id}>
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
                <li>Confirmar causalidad del gasto.</li>
                <li>Validar centro de costo asignado.</li>
                <li>Revisar detracción si aplica al servicio.</li>
                <li>Verificar que el asiento esté respaldado por XML/PDF.</li>
              </ul>
            </>
          ) : (
            <p>Selecciona una cuenta con movimientos.</p>
          )}
        </aside>
      </div>
    </section>
  );
}
