import React, { useMemo, useState } from 'react';

type LedgerMovement = {
  id: string;
  date: string;
  period: string;
  glosa: string;
  account: string;
  accountName: string;
  cc: string;
  debit: number;
  credit: number;
  module: string;
  status: string;
  hash: string;
  risk: 'BAJO' | 'MEDIO' | 'ALTO';
};

const movements: LedgerMovement[] = [
  {
    id: 'JE-2026-000184',
    date: '2026-05-01',
    period: '2026-05',
    glosa: 'Compra S106-24119152-49 SEDALIB S.A.',
    account: '636101',
    accountName: 'Servicios básicos',
    cc: 'LIM-ADM',
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
    cc: '-',
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
    cc: '-',
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
    cc: 'LIM-COM',
    debit: 18880,
    credit: 0,
    module: 'VENTAS',
    status: 'SUNAT',
    hash: '8b2c3f6e4412a',
    risk: 'BAJO',
  },
];

const accounts = [
  { code: '10', name: 'Efectivo y equivalentes', type: 'ACTIVO' },
  { code: '12', name: 'Cuentas por cobrar comerciales', type: 'ACTIVO' },
  { code: '40', name: 'Tributos por pagar / crédito fiscal', type: 'PASIVO/TRIBUTO' },
  { code: '42', name: 'Cuentas por pagar comerciales', type: 'PASIVO' },
  { code: '60', name: 'Compras', type: 'GASTO/COSTO' },
  { code: '63', name: 'Gastos de servicios prestados por terceros', type: 'GASTO' },
  { code: '70', name: 'Ventas', type: 'INGRESO' },
];

const money = (n: number) =>
  `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function DashboardEnterprisePremium() {
  const [selectedAccount, setSelectedAccount] = useState('636101');
  const [search, setSearch] = useState('');

  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      const matchesAccount = selectedAccount ? m.account.startsWith(selectedAccount.slice(0, 2)) || m.account === selectedAccount : true;
      const matchesSearch = `${m.glosa} ${m.account} ${m.accountName} ${m.module}`
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchesAccount && matchesSearch;
    });
  }, [selectedAccount, search]);

  const totalDebit = filteredMovements.reduce((a, b) => a + b.debit, 0);
  const totalCredit = filteredMovements.reduce((a, b) => a + b.credit, 0);

  const selectedDetail = filteredMovements[0];

  return (
    <div className="sap-shell">
      <div className="sap-topbar">
        <strong>CONTA_PRO Enterprise</strong>
        <span className="sap-pill">SPA Enterprise</span>
        <span className="sap-pill green">Auditoría activa</span>
        <input
          className="sap-search"
          placeholder="Buscar RUC, cuenta, asiento, hash, XML..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="sap-btn">Actualizar</button>
      </div>

      <div className="sap-kpi-grid">
        <div className="sap-kpi"><span>Caja</span><strong>{money(482900)}</strong><small>+2.4% vs mes anterior</small></div>
        <div className="sap-kpi"><span>CXC</span><strong>{money(1284320.1)}</strong><small>96 documentos abiertos</small></div>
        <div className="sap-kpi"><span>CXP</span><strong>{money(712008.44)}</strong><small>32 obligaciones pendientes</small></div>
        <div className="sap-kpi"><span>IGV</span><strong>{money(86240)}</strong><small>Crédito fiscal controlado</small></div>
        <div className="sap-kpi"><span>Resultado</span><strong>{money(392600.18)}</strong><small>Margen estable</small></div>
      </div>

      <div className="sap-layout">
        <aside className="sap-card sap-plan">
          <h3>Plan Contable Vivo</h3>
          {accounts.map((a) => (
            <button
              key={a.code}
              className={`sap-account ${selectedAccount.startsWith(a.code) ? 'active' : ''}`}
              onClick={() => setSelectedAccount(a.code)}
            >
              <span>{a.code}</span>
              <div>
                <strong>{a.name}</strong>
                <small>{a.type}</small>
              </div>
            </button>
          ))}
        </aside>

        <main className="sap-card">
          <div className="sap-card-head">
            <div>
              <h3>Libro Diario / Mayor Analítico</h3>
              <p>Click en una cuenta para ver movimientos, riesgo, hash y recomendaciones.</p>
            </div>
            <div className="sap-actions">
              <button className="sap-btn">Exportar Excel</button>
              <button className="sap-btn">PDF</button>
              <button className="sap-btn blue">Auditoría IA</button>
            </div>
          </div>

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
              {filteredMovements.map((m) => (
                <tr key={m.id} onClick={() => setSelectedAccount(m.account)}>
                  <td>{m.date}</td>
                  <td>{m.period}</td>
                  <td>{m.glosa}</td>
                  <td><strong>{m.account}</strong><br /><small>{m.accountName}</small></td>
                  <td>{m.cc}</td>
                  <td className="money">{m.debit ? money(m.debit) : '-'}</td>
                  <td className="money">{m.credit ? money(m.credit) : '-'}</td>
                  <td><span className={`sap-badge ${m.risk.toLowerCase()}`}>{m.status}</span></td>
                  <td>{m.module}</td>
                  <td className="hash">{m.hash}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5}>Totales visibles</td>
                <td>{money(totalDebit)}</td>
                <td>{money(totalCredit)}</td>
                <td colSpan={3}>{Math.abs(totalDebit - totalCredit) < 0.01 ? 'Asiento cuadrado' : 'Diferencia detectada'}</td>
              </tr>
            </tfoot>
          </table>
        </main>

        <aside className="sap-card sap-detail">
          <h3>Detalle Analítico</h3>
          {selectedDetail ? (
            <>
              <p><b>Asiento:</b> {selectedDetail.id}</p>
              <p><b>Cuenta:</b> {selectedDetail.account} - {selectedDetail.accountName}</p>
              <p><b>Centro costo:</b> {selectedDetail.cc}</p>
              <p><b>Módulo:</b> {selectedDetail.module}</p>
              <p><b>Estado:</b> {selectedDetail.status}</p>
              <p><b>Hash:</b> {selectedDetail.hash}</p>

              <div className="sap-chart">
                <div style={{ height: 38 }} />
                <div style={{ height: 62 }} />
                <div style={{ height: 24 }} />
                <div style={{ height: 76 }} />
                <div style={{ height: 45 }} />
              </div>

              <h4>Recomendación IA</h4>
              <ul>
                <li>Validar causalidad del gasto.</li>
                <li>Confirmar centro de costo asignado.</li>
                <li>Revisar detracción si el servicio aplica.</li>
                <li>Verificar que el asiento esté cuadrado y con hash vigente.</li>
              </ul>
            </>
          ) : (
            <p>Selecciona una cuenta o movimiento.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
