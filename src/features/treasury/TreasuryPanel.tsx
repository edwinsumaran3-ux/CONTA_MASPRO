import React, { useCallback, useEffect, useState } from 'react';

// ─── Paleta ───────────────────────────────────────────────────────────────────
const C = {
  bg:      '#04090f',
  deep:    '#060d1a',
  card:    '#0b1a30',
  cardHi:  '#0f2440',
  border:  '#1a3558',
  borderG: '#2a5080',
  text:    '#ddeeff',
  muted:   '#6a9bbf',
  dim:     '#3a6080',
  accent:  '#3b9eff',
  green:   '#22d47a',
  red:     '#ff5c6b',
  yellow:  '#ffc947',
  orange:  '#ff8a3d',
  purple:  '#9d6fff',
  teal:    '#19d4c8',
};

// ─── 3‑D card style helper ────────────────────────────────────────────────────
const card3d = (extra?: React.CSSProperties): React.CSSProperties => ({
  background: `linear-gradient(145deg, ${C.cardHi}, ${C.card})`,
  border: `1px solid ${C.border}`,
  borderRadius: 12,
  boxShadow: `0 4px 24px #00000066, 0 1px 0 ${C.borderG}44 inset, -1px -1px 0 #00000044 inset`,
  ...extra,
});

const glowBorder = (color: string): React.CSSProperties => ({
  border: `1px solid ${color}55`,
  boxShadow: `0 0 12px ${color}22, 0 4px 20px #00000055, inset 0 1px 0 ${color}22`,
});

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Account   { id: string; bank_code: string; account_number: string; currency: string; ledger_account_code: string; current_balance: string; created_at: string }
interface Movement  { id: string; treasury_account_id: string; movement_date: string; movement_type: string; amount: string; currency: string; reference: string | null; partner_name: string | null; document_ref: string | null; journal_entry_id: string | null; reconciliation_status: string; created_at: string }
interface Summary   { balances: { currency: string; total: string; accounts: number }[]; open_movements: number; ar_pending_count: number; ar_pending_amount: string; ap_pending_count: number; ap_pending_amount: string }
interface Props     { token: string; apiBase: string; tenantId: string }

// ─── Diccionarios ─────────────────────────────────────────────────────────────
const MOVE_META: Record<string, { label: string; color: string; icon: string; sign: 1 | -1 }> = {
  INCOME:       { label: 'Ingreso caja',     color: C.green,  icon: '↑', sign:  1 },
  RECEIPT:      { label: 'Cobranza cliente', color: C.teal,   icon: '↑', sign:  1 },
  TRANSFER_IN:  { label: 'Transferencia +',  color: C.green,  icon: '→', sign:  1 },
  EXPENSE:      { label: 'Egreso',           color: C.red,    icon: '↓', sign: -1 },
  PAYMENT:      { label: 'Pago proveedor',   color: C.orange, icon: '↓', sign: -1 },
  TRANSFER_OUT: { label: 'Transferencia −',  color: C.red,    icon: '→', sign: -1 },
  PETTY_CASH:   { label: 'Caja chica',       color: C.yellow, icon: '◇', sign: -1 },
  STATEMENT:    { label: 'Extracto banco',   color: C.muted,  icon: '≡', sign:  1 },
};

const BANK_ICO: Record<string, string> = {
  BCP: '🔵', BBVA: '🔷', SCOTIABANK: '🔴', INTERBANK: '🟢',
  BANBIF: '🟡', PICHINCHA: '🟠', MIBANCO: '🟣', CAJA: '💵', EFECTIVO: '💵',
};
const BANK_LBL: Record<string, string> = {
  BCP: 'BCP', BBVA: 'BBVA', SCOTIABANK: 'Scotiabank', INTERBANK: 'Interbank',
  BANBIF: 'BanBif', PICHINCHA: 'Pichincha', MIBANCO: 'MiBanco', CAJA: 'Caja Chica', EFECTIVO: 'Efectivo',
};
const RECON: Record<string, { color: string; label: string }> = {
  OPEN:       { color: C.yellow, label: 'Pendiente' },
  MATCHED:    { color: C.accent, label: 'Coincide'  },
  RECONCILED: { color: C.green,  label: 'Conciliado'},
  REVIEW:     { color: C.orange, label: 'Revisar'   },
};

// ─── Utils ────────────────────────────────────────────────────────────────────
const fmt = (n: string | number) =>
  Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const today = () => new Date().toISOString().split('T')[0];
const authH = (tok: string, tid: string) => ({
  Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json', 'X-Tenant-Id': tid,
});

// ─────────────────────────────────────────────────────────────────────────────
export const TreasuryPanel: React.FC<Props> = ({ token, apiBase, tenantId }) => {
  const [accounts,   setAccounts]   = useState<Account[]>([]);
  const [movements,  setMovements]  = useState<Movement[]>([]);
  const [summary,    setSummary]    = useState<Summary | null>(null);
  const [selAcc,     setSelAcc]     = useState<string | null>(null);
  const [tab,        setTab]        = useState<'movimientos' | 'cuentas' | 'flujo'>('movimientos');
  const [loading,    setLoading]    = useState(true);
  const [mvLoading,  setMvLoading]  = useState(false);
  const [modalAcc,   setModalAcc]   = useState(false);
  const [modalMv,    setModalMv]    = useState(false);
  const [flash,      setFlash]      = useState('');

  const [newAcc, setNewAcc] = useState({ bank_code: 'BCP', account_number: '', currency: 'PEN', ledger_account_code: '104' });
  const [newMv,  setNewMv]  = useState({ treasury_account_id: '', movement_date: today(), movement_type: 'INCOME', amount: '', currency: 'PEN', reference: '', partner_ruc: '' });

  const H = authH(token, tenantId);

  const loadSummary  = useCallback(async () => { const r = await fetch(`${apiBase}/finance/treasury/summary`, { headers: H }); if (r.ok) setSummary(await r.json()); }, [token, apiBase, tenantId]);
  const loadAccounts = useCallback(async () => {
    const r = await fetch(`${apiBase}/finance/treasury/accounts`, { headers: H });
    if (r.ok) { const d: Account[] = await r.json(); setAccounts(d); if (d.length > 0 && !selAcc) setSelAcc(d[0].id); }
  }, [token, apiBase, tenantId]);
  const loadMv = useCallback(async (aid: string | null) => {
    setMvLoading(true);
    const url = aid ? `${apiBase}/finance/treasury/movements?account_id=${aid}&limit=150` : `${apiBase}/finance/treasury/movements?limit=150`;
    const r = await fetch(url, { headers: H });
    if (r.ok) setMovements(await r.json());
    setMvLoading(false);
  }, [token, apiBase, tenantId]);

  useEffect(() => {
    (async () => { setLoading(true); await Promise.all([loadSummary(), loadAccounts()]); setLoading(false); })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { if (!loading) loadMv(selAcc); }, [selAcc, loading]);

  const notify = (msg: string) => { setFlash(msg); setTimeout(() => setFlash(''), 4000); };

  const doCreateAcc = async () => {
    if (!newAcc.account_number || !newAcc.ledger_account_code) { notify('Completa número de cuenta y código contable.'); return; }
    const r = await fetch(`${apiBase}/finance/treasury/accounts`, { method: 'POST', headers: H, body: JSON.stringify(newAcc) });
    if (r.ok) { notify('Cuenta creada.'); setModalAcc(false); setNewAcc({ bank_code: 'BCP', account_number: '', currency: 'PEN', ledger_account_code: '104' }); await Promise.all([loadAccounts(), loadSummary()]); }
    else { const e = await r.json().catch(() => ({})); notify(`Error: ${e.detail ?? r.status}`); }
  };

  const doCreateMv = async () => {
    const aid = newMv.treasury_account_id || selAcc;
    if (!aid || !newMv.amount || !newMv.movement_date) { notify('Selecciona cuenta, fecha y monto.'); return; }
    const r = await fetch(`${apiBase}/finance/treasury/movements`, {
      method: 'POST', headers: H,
      body: JSON.stringify({ ...newMv, treasury_account_id: aid, amount: parseFloat(newMv.amount), reference: newMv.reference || null, partner_ruc: newMv.partner_ruc || null }),
    });
    if (r.ok) { const d = await r.json(); notify(`Registrado. Saldo: S/ ${fmt(d.new_balance)}`); setModalMv(false); setNewMv({ treasury_account_id: '', movement_date: today(), movement_type: 'INCOME', amount: '', currency: 'PEN', reference: '', partner_ruc: '' }); await Promise.all([loadMv(selAcc), loadAccounts(), loadSummary()]); }
    else { const e = await r.json().catch(() => ({})); notify(`Error: ${e.detail ?? r.status}`); }
  };

  const doReconcile = async (mvId: string) => {
    const r = await fetch(`${apiBase}/finance/treasury/reconcile`, { method: 'POST', headers: H, body: JSON.stringify({ tenant_id: tenantId, movement_ids: [mvId] }) });
    if (r.ok) { notify('Movimiento conciliado.'); await Promise.all([loadMv(selAcc), loadSummary()]); }
  };

  const selAccObj = accounts.find(a => a.id === selAcc);

  // Métricas de flujo calculadas desde movimientos
  const totalIn  = movements.filter(m => (MOVE_META[m.movement_type]?.sign ?? 1) > 0).reduce((s, m) => s + Number(m.amount), 0);
  const totalOut = movements.filter(m => (MOVE_META[m.movement_type]?.sign ?? 1) < 0).reduce((s, m) => s + Number(m.amount), 0);
  const netFlow  = totalIn - totalOut;

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, fontSize: 13, background: C.bg }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 28, marginBottom: 10 }}>🏦</div>
        <div>Cargando Tesorería...</div>
      </div>
    </div>
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: C.bg, overflow: 'hidden', height: '100%' }}>

      {/* ── Flash ── */}
      {flash && (
        <div style={{ padding: '7px 16px', background: `${C.accent}18`, borderBottom: `1px solid ${C.accent}44`, fontSize: 12, color: C.accent, display: 'flex', justifyContent: 'space-between' }}>
          <span>{flash}</span>
          <button onClick={() => setFlash('')} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* ══════════ KPI ROW ══════════ */}
      <div style={{ display: 'flex', gap: 10, padding: '12px 16px', borderBottom: `1px solid ${C.border}`, flexWrap: 'wrap', flexShrink: 0 }}>

        {/* Saldo total por moneda */}
        {summary?.balances.length === 0 ? (
          <KpiCard icon="🏦" label="Saldo total PEN" value="S/ 0.00" color={C.muted} sub="Sin cuentas registradas" />
        ) : summary?.balances.map(b => (
          <KpiCard key={b.currency}
            icon={b.currency === 'PEN' ? '💳' : '💵'}
            label={`Saldo ${b.currency}`}
            value={`${b.currency === 'PEN' ? 'S/' : '$'} ${fmt(b.total)}`}
            color={Number(b.total) >= 0 ? C.green : C.red}
            sub={`${b.accounts} cuenta${b.accounts !== 1 ? 's' : ''} activa${b.accounts !== 1 ? 's' : ''}`}
          />
        ))}

        <Spacer />

        <KpiCard icon="🔄" label="Sin conciliar"
          value={String(summary?.open_movements ?? 0)}
          color={(summary?.open_movements ?? 0) > 0 ? C.yellow : C.green}
          sub="movimientos pendientes"
        />
        <KpiCard icon="📥" label="Por cobrar (AR)"
          value={`S/ ${fmt(summary?.ar_pending_amount ?? '0')}`}
          color={C.teal}
          sub={`${summary?.ar_pending_count ?? 0} documentos`}
        />
        <KpiCard icon="📤" label="Por pagar (AP)"
          value={`S/ ${fmt(summary?.ap_pending_amount ?? '0')}`}
          color={C.orange}
          sub={`${summary?.ap_pending_count ?? 0} documentos`}
        />

        <Spacer />

        {/* Flujo neto de los movimientos cargados */}
        <KpiCard icon="📊" label="Flujo neto"
          value={`${netFlow >= 0 ? '+' : ''}S/ ${fmt(netFlow)}`}
          color={netFlow >= 0 ? C.green : C.red}
          sub={`${movements.length} movimientos`}
        />
      </div>

      {/* ══════════ CUERPO ══════════ */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', gap: 0 }}>

        {/* ── Sidebar cuentas ── */}
        <div style={{ width: 230, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0, background: C.deep }}>
          <div style={{ padding: '9px 12px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={sectionTitle}>Cuentas</span>
            <button onClick={() => setModalAcc(true)} style={btnSm}>+ Nueva</button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px 0' }}>
            {accounts.length === 0 ? (
              <EmptyState icon="🏦" msg="Sin cuentas registradas" sub="Crea tu primera cuenta bancaria o caja chica." />
            ) : accounts.map(acc => {
              const bal = Number(acc.current_balance);
              const isSelected = selAcc === acc.id;
              return (
                <button key={acc.id} onClick={() => setSelAcc(acc.id)} style={{
                  width: '100%', textAlign: 'left', marginBottom: 6, padding: '10px 12px',
                  background: isSelected ? `linear-gradient(135deg, #0f2d4a, #0a2038)` : `linear-gradient(135deg, ${C.card}, ${C.deep})`,
                  border: `1px solid ${isSelected ? C.accent + '66' : C.border}`,
                  borderRadius: 10, cursor: 'pointer',
                  boxShadow: isSelected
                    ? `0 0 0 1px ${C.accent}33, 0 4px 16px #00000044, inset 0 1px 0 ${C.accent}22`
                    : '0 2px 8px #00000033',
                  transition: 'all 0.15s',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: 13 }}>{BANK_ICO[acc.bank_code] ?? '🏦'} </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: isSelected ? C.accent : C.text }}>{BANK_LBL[acc.bank_code] ?? acc.bank_code}</span>
                    </div>
                    <span style={{ fontSize: 9, color: C.dim, background: C.card, borderRadius: 4, padding: '1px 5px', border: `1px solid ${C.border}` }}>{acc.currency}</span>
                  </div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>···{acc.account_number.slice(-6)}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: bal >= 0 ? C.green : C.red, marginTop: 5 }}>
                    {acc.currency === 'PEN' ? 'S/' : '$'} {fmt(bal)}
                  </div>
                  <div style={{ fontSize: 9, color: C.dim, marginTop: 2 }}>
                    Cta contable: <span style={{ color: C.muted }}>{acc.ledger_account_code}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Ver todos */}
          <button onClick={() => setSelAcc(null)} style={{
            padding: '9px 12px', background: selAcc === null ? `${C.accent}18` : 'transparent',
            border: 'none', borderTop: `1px solid ${C.border}`, cursor: 'pointer',
            fontSize: 11, color: selAcc === null ? C.accent : C.muted, textAlign: 'left', flexShrink: 0,
          }}>
            ≡ Ver todos los movimientos
          </button>
        </div>

        {/* ── Panel principal ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* ── Toolbar ── */}
          <div style={{ padding: '8px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, background: C.deep }}>
            <div style={{ display: 'flex', gap: 0 }}>
              {(['movimientos', 'cuentas', 'flujo'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  padding: '5px 14px', fontSize: 11, border: 'none', cursor: 'pointer',
                  background: tab === t ? `${C.accent}22` : 'transparent',
                  color: tab === t ? C.accent : C.muted,
                  borderBottom: tab === t ? `2px solid ${C.accent}` : '2px solid transparent',
                  fontWeight: tab === t ? 700 : 400,
                  textTransform: 'capitalize',
                }}>
                  {t === 'movimientos' ? '📋 Movimientos' : t === 'cuentas' ? '🏦 Cuentas' : '📊 Flujo de caja'}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: C.dim }}>
                {selAccObj ? `${BANK_LBL[selAccObj.bank_code] ?? selAccObj.bank_code} ···${selAccObj.account_number.slice(-4)}` : 'Todas las cuentas'}
              </span>
              <button onClick={() => loadMv(selAcc)} style={btnSm}>↺</button>
              <button onClick={() => { setNewMv(m => ({ ...m, treasury_account_id: selAcc || '' })); setModalMv(true); }} style={btnPri}>
                + Movimiento
              </button>
            </div>
          </div>

          {/* ── Contenido tab ── */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>

            {/* ══ TAB: Movimientos ══ */}
            {tab === 'movimientos' && (
              mvLoading ? (
                <div style={{ textAlign: 'center', padding: 40, color: C.muted, fontSize: 13 }}>Cargando movimientos...</div>
              ) : movements.length === 0 ? (
                <EmptyState icon="📋" msg="Sin movimientos" sub="Registra ingresos, egresos, cobros o pagos con el botón + Movimiento." />
              ) : (
                <div style={{ ...card3d(), overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: '#030810' }}>
                        {['Fecha', 'Tipo', 'Referencia / Proveedor/Cliente', 'Documento', 'Cuenta contable', 'Monto', 'Estado', ''].map((h, i) => (
                          <th key={i} style={{
                            padding: '8px 10px', textAlign: i >= 5 ? 'right' : 'left',
                            fontSize: 10, fontWeight: 700, color: C.muted,
                            textTransform: 'uppercase', letterSpacing: '0.06em',
                            borderBottom: `1px solid ${C.border}`,
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {movements.map((mv, i) => {
                        const meta = MOVE_META[mv.movement_type] ?? { label: mv.movement_type, color: C.muted, icon: '·', sign: 1 };
                        const recon = RECON[mv.reconciliation_status] ?? { color: C.muted, label: mv.reconciliation_status };
                        const acc = accounts.find(a => a.id === mv.treasury_account_id);
                        return (
                          <tr key={mv.id} style={{ background: i % 2 === 0 ? 'transparent' : '#060f1e33', borderBottom: `1px solid ${C.border}18` }}>
                            <td style={{ padding: '7px 10px', color: C.muted, whiteSpace: 'nowrap' }}>{mv.movement_date}</td>
                            <td style={{ padding: '7px 10px' }}>
                              <span style={{
                                background: meta.color + '1a', color: meta.color,
                                border: `1px solid ${meta.color}44`,
                                borderRadius: 5, padding: '2px 8px', fontSize: 10, fontWeight: 700,
                              }}>
                                {meta.icon} {meta.label}
                              </span>
                            </td>
                            <td style={{ padding: '7px 10px', maxWidth: 220 }}>
                              <div style={{ color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {mv.reference || <span style={{ color: C.dim }}>—</span>}
                              </div>
                              {mv.partner_name && <div style={{ fontSize: 10, color: C.accent, marginTop: 1 }}>👤 {mv.partner_name}</div>}
                            </td>
                            <td style={{ padding: '7px 10px', color: C.muted, fontSize: 11 }}>
                              {mv.document_ref
                                ? <span style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 4, padding: '1px 6px' }}>{mv.document_ref}</span>
                                : mv.journal_entry_id ? <span style={{ color: C.dim }}>Asiento</span> : <span style={{ color: C.dim }}>—</span>}
                            </td>
                            <td style={{ padding: '7px 10px', fontSize: 10, color: C.dim }}>
                              {acc?.ledger_account_code ?? '—'}
                            </td>
                            <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 800, fontSize: 13, whiteSpace: 'nowrap' }}>
                              <span style={{ color: meta.sign > 0 ? C.green : C.red }}>
                                {meta.sign > 0 ? '+' : '−'}{mv.currency === 'PEN' ? 'S/' : '$'} {fmt(mv.amount)}
                              </span>
                            </td>
                            <td style={{ padding: '7px 10px', textAlign: 'right' }}>
                              <span style={{
                                background: recon.color + '1a', color: recon.color,
                                border: `1px solid ${recon.color}44`,
                                borderRadius: 5, padding: '2px 8px', fontSize: 10,
                              }}>
                                {recon.label}
                              </span>
                            </td>
                            <td style={{ padding: '7px 10px', textAlign: 'right' }}>
                              {mv.reconciliation_status === 'OPEN' && (
                                <button onClick={() => doReconcile(mv.id)} title="Conciliar" style={{
                                  ...btnSm, color: C.green, borderColor: C.green + '44', fontSize: 13, lineHeight: 1,
                                }}>✓</button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* ══ TAB: Cuentas ══ */}
            {tab === 'cuentas' && (
              <div>
                {/* Botón nueva cuenta destacado */}
                <div style={{ marginBottom: 16 }}>
                  <button onClick={() => setModalAcc(true)} style={{ ...btnPri, padding: '8px 20px', fontSize: 12, borderRadius: 8 }}>
                    + Crear nueva cuenta bancaria / caja chica
                  </button>
                </div>

                {accounts.length === 0 ? (
                  <EmptyState icon="🏦" msg="Sin cuentas registradas" sub="Agrega cuentas bancarias, caja chica o efectivo para registrar movimientos." />
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                    {accounts.map(acc => {
                      const bal = Number(acc.current_balance);
                      return (
                        <div key={acc.id} style={{
                          ...card3d(),
                          padding: 18,
                          ...glowBorder(bal >= 0 ? C.green : C.red),
                          cursor: 'pointer',
                        }} onClick={() => { setSelAcc(acc.id); setTab('movimientos'); }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                            <span style={{ fontSize: 22 }}>{BANK_ICO[acc.bank_code] ?? '🏦'}</span>
                            <span style={{ fontSize: 10, color: C.dim, background: C.deep, borderRadius: 5, padding: '2px 8px', border: `1px solid ${C.border}` }}>{acc.currency}</span>
                          </div>
                          <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{BANK_LBL[acc.bank_code] ?? acc.bank_code}</div>
                          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Nro: {acc.account_number}</div>
                          <SepBar />
                          <div style={{ fontSize: 11, color: C.dim }}>Cuenta contable</div>
                          <div style={{ fontSize: 13, color: C.accent, fontWeight: 700 }}>{acc.ledger_account_code}</div>
                          <SepBar />
                          <div style={{ fontSize: 11, color: C.muted }}>Saldo actual</div>
                          <div style={{ fontSize: 22, fontWeight: 800, color: bal >= 0 ? C.green : C.red, marginTop: 2 }}>
                            {acc.currency === 'PEN' ? 'S/' : '$'} {fmt(bal)}
                          </div>
                          <div style={{ fontSize: 10, color: C.dim, marginTop: 6 }}>
                            Creada: {new Date(acc.created_at).toLocaleDateString('es-PE')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ══ TAB: Flujo de caja ══ */}
            {tab === 'flujo' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Tarjetas flujo */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  <FlowCard label="Total ingresos" value={`S/ ${fmt(totalIn)}`} color={C.green} icon="↑" sub={`${movements.filter(m => (MOVE_META[m.movement_type]?.sign ?? 1) > 0).length} movimientos`} />
                  <FlowCard label="Total egresos"  value={`S/ ${fmt(totalOut)}`} color={C.red}   icon="↓" sub={`${movements.filter(m => (MOVE_META[m.movement_type]?.sign ?? 1) < 0).length} movimientos`} />
                  <FlowCard label="Flujo neto"     value={`${netFlow >= 0 ? '+' : ''}S/ ${fmt(netFlow)}`} color={netFlow >= 0 ? C.green : C.red} icon="=" sub="Ingresos − Egresos" />
                </div>

                <SepBar wide />

                {/* Tabla por tipo */}
                <div style={{ ...card3d(), overflow: 'hidden' }}>
                  <div style={{ padding: '10px 14px', borderBottom: `1px solid ${C.border}`, fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    📊 Resumen por tipo de movimiento
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: '#030810' }}>
                        {['Tipo', 'Cantidad', 'Total', 'Impacto'].map((h, i) => (
                          <th key={i} style={{ padding: '7px 12px', textAlign: i >= 1 ? 'right' : 'left', fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${C.border}` }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(MOVE_META).map(([key, meta]) => {
                        const group = movements.filter(m => m.movement_type === key);
                        if (group.length === 0) return null;
                        const total = group.reduce((s, m) => s + Number(m.amount), 0);
                        return (
                          <tr key={key} style={{ borderBottom: `1px solid ${C.border}18` }}>
                            <td style={{ padding: '7px 12px' }}>
                              <span style={{ background: meta.color + '1a', color: meta.color, border: `1px solid ${meta.color}44`, borderRadius: 5, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>
                                {meta.icon} {meta.label}
                              </span>
                            </td>
                            <td style={{ padding: '7px 12px', textAlign: 'right', color: C.muted }}>{group.length}</td>
                            <td style={{ padding: '7px 12px', textAlign: 'right', fontWeight: 700, color: meta.sign > 0 ? C.green : C.red }}>
                              {meta.sign > 0 ? '+' : '−'}S/ {fmt(total)}
                            </td>
                            <td style={{ padding: '7px 12px', textAlign: 'right' }}>
                              <div style={{ height: 6, background: C.border, borderRadius: 3, width: 80, marginLeft: 'auto' }}>
                                <div style={{
                                  height: '100%', borderRadius: 3, background: meta.color,
                                  width: `${Math.min(100, (total / Math.max(totalIn, totalOut, 1)) * 100).toFixed(0)}%`,
                                }} />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <SepBar wide />

                {/* Resumen por cuenta */}
                {accounts.length > 0 && (
                  <div style={{ ...card3d(), overflow: 'hidden' }}>
                    <div style={{ padding: '10px 14px', borderBottom: `1px solid ${C.border}`, fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      🏦 Saldo por cuenta bancaria
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                      <thead>
                        <tr style={{ background: '#030810' }}>
                          {['Banco', 'Número', 'Moneda', 'Cuenta PCGE', 'Saldo actual'].map((h, i) => (
                            <th key={i} style={{ padding: '7px 12px', textAlign: i >= 4 ? 'right' : 'left', fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', borderBottom: `1px solid ${C.border}` }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {accounts.map((acc, i) => {
                          const bal = Number(acc.current_balance);
                          return (
                            <tr key={acc.id} style={{ background: i % 2 === 0 ? 'transparent' : '#060f1e33', borderBottom: `1px solid ${C.border}18` }}>
                              <td style={{ padding: '7px 12px', color: C.text, fontWeight: 600 }}>{BANK_ICO[acc.bank_code] ?? '🏦'} {BANK_LBL[acc.bank_code] ?? acc.bank_code}</td>
                              <td style={{ padding: '7px 12px', color: C.muted }}>···{acc.account_number.slice(-6)}</td>
                              <td style={{ padding: '7px 12px', color: C.dim }}>{acc.currency}</td>
                              <td style={{ padding: '7px 12px', color: C.accent }}>{acc.ledger_account_code}</td>
                              <td style={{ padding: '7px 12px', textAlign: 'right', fontWeight: 800, fontSize: 14, color: bal >= 0 ? C.green : C.red }}>
                                {acc.currency === 'PEN' ? 'S/' : '$'} {fmt(bal)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr style={{ background: '#030810', borderTop: `1px solid ${C.border}` }}>
                          <td colSpan={4} style={{ padding: '8px 12px', fontWeight: 700, color: C.muted, fontSize: 11 }}>TOTAL GENERAL (PEN)</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 800, fontSize: 15, color: C.green }}>
                            S/ {fmt(accounts.filter(a => a.currency === 'PEN').reduce((s, a) => s + Number(a.current_balance), 0))}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════ MODAL NUEVA CUENTA ══════════ */}
      {modalAcc && (
        <Overlay onClose={() => setModalAcc(false)} title="Nueva cuenta de tesorería">
          <FormRow label="Banco / Tipo">
            <select value={newAcc.bank_code} onChange={e => setNewAcc(a => ({ ...a, bank_code: e.target.value }))} style={inp}>
              {Object.entries(BANK_LBL).map(([k, v]) => <option key={k} value={k}>{BANK_ICO[k]} {v}</option>)}
            </select>
          </FormRow>
          <FormRow label="Número de cuenta">
            <input value={newAcc.account_number} onChange={e => setNewAcc(a => ({ ...a, account_number: e.target.value }))} placeholder="Ej: 19120012345678" style={inp} />
          </FormRow>
          <FormRow label="Moneda">
            <select value={newAcc.currency} onChange={e => setNewAcc(a => ({ ...a, currency: e.target.value }))} style={inp}>
              <option value="PEN">🇵🇪 PEN — Soles</option>
              <option value="USD">🇺🇸 USD — Dólares</option>
            </select>
          </FormRow>
          <FormRow label="Cuenta contable PCGE">
            <input value={newAcc.ledger_account_code} onChange={e => setNewAcc(a => ({ ...a, ledger_account_code: e.target.value }))} placeholder="101 Caja / 104 Banco / 106 Caja chica" style={inp} />
          </FormRow>
          <div style={{ fontSize: 10, color: C.dim, marginTop: -4, marginBottom: 14, padding: '6px 10px', background: `${C.accent}0a`, border: `1px solid ${C.accent}22`, borderRadius: 6 }}>
            💡 Cuentas PCGE comunes: <b style={{ color: C.muted }}>101</b> Caja · <b style={{ color: C.muted }}>104</b> Cuentas bancarias · <b style={{ color: C.muted }}>106</b> Caja chica
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => setModalAcc(false)} style={btnSm}>Cancelar</button>
            <button onClick={doCreateAcc} style={btnPri}>Crear cuenta</button>
          </div>
        </Overlay>
      )}

      {/* ══════════ MODAL NUEVO MOVIMIENTO ══════════ */}
      {modalMv && (
        <Overlay onClose={() => setModalMv(false)} title="Registrar movimiento de tesorería">
          <FormRow label="Cuenta de tesorería">
            <select value={newMv.treasury_account_id || selAcc || ''} onChange={e => setNewMv(m => ({ ...m, treasury_account_id: e.target.value }))} style={inp}>
              <option value="">— Seleccionar cuenta —</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{BANK_ICO[a.bank_code] ?? '🏦'} {BANK_LBL[a.bank_code] ?? a.bank_code} ···{a.account_number.slice(-4)} ({a.currency}) — Saldo: {fmt(a.current_balance)}</option>)}
            </select>
          </FormRow>
          <FormRow label="Tipo de movimiento">
            <select value={newMv.movement_type} onChange={e => setNewMv(m => ({ ...m, movement_type: e.target.value }))} style={inp}>
              {Object.entries(MOVE_META).map(([k, v]) => <option key={k} value={k}>{v.sign > 0 ? '↑' : '↓'} {v.label}</option>)}
            </select>
          </FormRow>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <FormRow label="Fecha">
              <input type="date" value={newMv.movement_date} onChange={e => setNewMv(m => ({ ...m, movement_date: e.target.value }))} style={inp} />
            </FormRow>
            <FormRow label="Moneda">
              <select value={newMv.currency} onChange={e => setNewMv(m => ({ ...m, currency: e.target.value }))} style={inp}>
                <option value="PEN">PEN</option>
                <option value="USD">USD</option>
              </select>
            </FormRow>
          </div>
          <FormRow label="Monto">
            <input type="number" step="0.01" min="0.01" value={newMv.amount} onChange={e => setNewMv(m => ({ ...m, amount: e.target.value }))} placeholder="0.00" style={{ ...inp, fontSize: 16, fontWeight: 700 }} />
          </FormRow>
          <FormRow label="Referencia (descripción)">
            <input value={newMv.reference} onChange={e => setNewMv(m => ({ ...m, reference: e.target.value }))} placeholder="Ej: Pago factura E001-00123, Depósito cliente..." style={inp} />
          </FormRow>
          <FormRow label="RUC proveedor / cliente (opcional)">
            <input value={newMv.partner_ruc} onChange={e => setNewMv(m => ({ ...m, partner_ruc: e.target.value }))} placeholder="20123456789 — se busca en directorio de socios" maxLength={11} style={inp} />
          </FormRow>
          <div style={{ fontSize: 10, color: C.dim, padding: '6px 10px', background: `${C.orange}0a`, border: `1px solid ${C.orange}22`, borderRadius: 6, marginBottom: 14 }}>
            ⚡ El saldo de la cuenta se actualiza automáticamente al registrar.
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => setModalMv(false)} style={btnSm}>Cancelar</button>
            <button onClick={doCreateMv} style={btnPri}>Registrar movimiento</button>
          </div>
        </Overlay>
      )}
    </div>
  );
};

// ─── Sub-componentes ──────────────────────────────────────────────────────────
const KpiCard: React.FC<{ icon: string; label: string; value: string; color: string; sub: string }> = ({ icon, label, value, color, sub }) => (
  <div style={{
    ...card3d({ padding: '10px 16px', minWidth: 150, flex: '1 1 150px', maxWidth: 240 }),
    ...glowBorder(color),
  }}>
    <div style={{ fontSize: 10, color: C.muted, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
      <span>{icon}</span> <span>{label}</span>
    </div>
    <div style={{ fontSize: 18, fontWeight: 800, color, letterSpacing: '-0.02em' }}>{value}</div>
    <div style={{ fontSize: 10, color: C.dim, marginTop: 3 }}>{sub}</div>
  </div>
);

const FlowCard: React.FC<{ label: string; value: string; color: string; icon: string; sub: string }> = ({ label, value, color, icon, sub }) => (
  <div style={{ ...card3d({ padding: 20 }), ...glowBorder(color) }}>
    <div style={{ fontSize: 28, color, marginBottom: 8 }}>{icon}</div>
    <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
    <div style={{ fontSize: 10, color: C.dim, marginTop: 6 }}>{sub}</div>
  </div>
);

const Spacer = () => <div style={{ width: 1, background: C.border, alignSelf: 'stretch', margin: '0 4px', flexShrink: 0 }} />;
const SepBar: React.FC<{ wide?: boolean }> = ({ wide }) => (
  <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${C.border}, transparent)`, margin: wide ? '14px 0' : '10px 0' }} />
);

const EmptyState: React.FC<{ icon: string; msg: string; sub: string }> = ({ icon, msg, sub }) => (
  <div style={{ textAlign: 'center', padding: 48, color: C.dim }}>
    <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
    <div style={{ fontSize: 14, color: C.muted, marginBottom: 6, fontWeight: 600 }}>{msg}</div>
    <div style={{ fontSize: 12 }}>{sub}</div>
  </div>
);

const Overlay: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div style={{ position: 'fixed', inset: 0, background: '#000c', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{
      ...card3d({ padding: 24, width: 440, maxWidth: '96vw', maxHeight: '90vh', overflowY: 'auto' }),
      boxShadow: `0 0 40px #00000088, 0 0 0 1px ${C.accent}22, 0 20px 60px #00000066`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <span style={{ fontWeight: 800, color: C.text, fontSize: 14 }}>{title}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

const FormRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ marginBottom: 12 }}>
    <label style={{ display: 'block', fontSize: 10, color: C.muted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</label>
    {children}
  </div>
);

// ─── Estilos base ─────────────────────────────────────────────────────────────
const inp: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: '#06121f', border: `1px solid ${C.border}`,
  borderRadius: 7, padding: '8px 11px', color: C.text, fontSize: 12,
  outline: 'none', transition: 'border-color 0.15s',
};
const btnSm: React.CSSProperties = {
  background: `linear-gradient(135deg, #0f2540, #0a1a30)`,
  border: `1px solid ${C.border}`, borderRadius: 6,
  color: C.muted, fontSize: 11, padding: '5px 11px', cursor: 'pointer',
  boxShadow: '0 2px 8px #00000033',
};
const btnPri: React.CSSProperties = {
  background: `linear-gradient(135deg, ${C.accent}33, ${C.accent}18)`,
  border: `1px solid ${C.accent}66`, borderRadius: 6,
  color: C.accent, fontSize: 11, padding: '5px 14px', cursor: 'pointer',
  fontWeight: 700, boxShadow: `0 0 12px ${C.accent}22, 0 2px 8px #00000044`,
};
const sectionTitle: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, color: C.muted,
  textTransform: 'uppercase', letterSpacing: '0.08em',
};
