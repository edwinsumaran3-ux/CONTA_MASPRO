import React, { useMemo, useState } from 'react';

// ─── Tipos ────────────────────────────────────────────────────────────────────
type JournalRow = {
  id: string;
  entryId?: string;
  date: string;
  period: string;
  description: string;
  account: string;
  accountName?: string;
  costCenter: string;
  debit: string;
  credit: string;
  status: string;
  sourceModule: string;
  partnerRuc?: string;
  documentSeries?: string;
  documentNumber?: string;
};

type Props = {
  rows: JournalRow[];
  companyName?: string;
  companyRuc?: string;
  period?: string;
};

// ─── Colores ──────────────────────────────────────────────────────────────────
const C = {
  bg: '#0b1120', bgCard: '#111827', bgRow: '#0f172a', bgHover: '#1e293b',
  border: '#1e3a5f', text: '#e2e8f0', textMut: '#94a3b8', textDim: '#64748b',
  accent: '#38bdf8', green: '#22c55e', red: '#ef4444', yellow: '#f59e0b',
  purple: '#a855f7', header: '#0f172a',
};

const fmt = (v: number) => v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const toNum = (s: string | undefined) => parseFloat(s || '0') || 0;

// ─── Estilos de impresión ─────────────────────────────────────────────────────
const PRINT_STYLE = `
@media print {
  body * { visibility: hidden !important; }
  #libro-print-area, #libro-print-area * { visibility: visible !important; }
  #libro-print-area { position: absolute; left: 0; top: 0; width: 100%; }
  table { border-collapse: collapse; width: 100%; font-size: 10pt; }
  th, td { border: 1px solid #000; padding: 3px 6px; }
  th { background: #eee !important; -webkit-print-color-adjust: exact; }
  .no-print { display: none !important; }
  @page { margin: 1.5cm; size: A4 landscape; }
}
`;

// ─── Helper: agrupar líneas por entryId ───────────────────────────────────────
function groupByEntry(rows: JournalRow[]) {
  const map = new Map<string, JournalRow[]>();
  rows.forEach(r => {
    const key = r.entryId || r.id;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(r);
  });
  return Array.from(map.entries()).map(([eid, lines]) => ({ eid, lines }));
}

// ─── Botón imprimir ───────────────────────────────────────────────────────────
const PrintBtn = ({ label }: { label: string }) => (
  <button
    className="no-print"
    onClick={() => window.print()}
    style={{
      padding: '6px 16px', borderRadius: 6, border: 'none',
      background: C.accent, color: '#000', fontWeight: 700, fontSize: 12,
      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
    }}
  >
    🖨 {label}
  </button>
);

// ─── Cabecera de libro ────────────────────────────────────────────────────────
const BookHeader = ({ title, subtitle, companyName, ruc, period }: {
  title: string; subtitle: string; companyName?: string; ruc?: string; period?: string;
}) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ fontSize: 10, color: C.textDim, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
      {companyName} {ruc ? `· RUC ${ruc}` : ''}
    </div>
    <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginTop: 2 }}>{title}</div>
    <div style={{ fontSize: 11, color: C.textMut }}>{subtitle} {period ? `· Período ${period}` : ''}</div>
  </div>
);

// ─── Th helper ────────────────────────────────────────────────────────────────
const Th = ({ children, right }: { children: React.ReactNode; right?: boolean }) => (
  <th style={{
    padding: '7px 10px', background: C.header, color: C.textMut,
    fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
    textAlign: right ? 'right' : 'left', borderBottom: `1px solid ${C.border}`,
    whiteSpace: 'nowrap',
  }}>{children}</th>
);

const Td = ({ children, right, mono, bold }: { children: React.ReactNode; right?: boolean; mono?: boolean; bold?: boolean }) => (
  <td style={{
    padding: '7px 10px', fontSize: 12, color: bold ? C.text : C.textMut,
    textAlign: right ? 'right' : 'left',
    fontFamily: mono ? 'Consolas, monospace' : undefined,
    fontWeight: bold ? 600 : undefined,
    borderBottom: `1px solid ${C.border}22`,
  }}>{children}</td>
);

// ═══════════════════════════════════════════════════════════════════════════════
// LIBRO DIARIO
// ═══════════════════════════════════════════════════════════════════════════════
const LibroDiario = ({ rows, companyName, ruc, period }: Props) => {
  const entries = useMemo(() => groupByEntry(rows).sort((a, b) =>
    a.lines[0].date.localeCompare(b.lines[0].date)
  ), [rows]);

  const totalDebe = rows.reduce((s, r) => s + toNum(r.debit), 0);
  const totalHaber = rows.reduce((s, r) => s + toNum(r.credit), 0);

  return (
    <div>
      <style>{PRINT_STYLE}</style>
      <div id="libro-print-area">
        <BookHeader title="LIBRO DIARIO" subtitle="Registro cronológico de asientos contables" companyName={companyName} ruc={ruc} period={period} />
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              <Th>N°</Th><Th>Fecha</Th><Th>Descripción</Th>
              <Th>Cuenta</Th><Th>Nombre cuenta</Th><Th>C. Costo</Th>
              <Th right>Debe</Th><Th right>Haber</Th>
            </tr>
          </thead>
          <tbody>
            {entries.map(({ eid, lines }, ei) => (
              lines.map((r, li) => (
                <tr key={`${eid}-${li}`} style={{ background: li === 0 ? `${C.accent}08` : 'transparent' }}>
                  <Td mono>{li === 0 ? String(ei + 1).padStart(4, '0') : ''}</Td>
                  <Td>{li === 0 ? r.date : ''}</Td>
                  <Td bold={li === 0}>{li === 0 ? r.description : ''}</Td>
                  <Td mono bold>{r.account}</Td>
                  <Td>{r.accountName || '—'}</Td>
                  <Td>{r.costCenter || '—'}</Td>
                  <Td right mono>{toNum(r.debit) > 0 ? fmt(toNum(r.debit)) : ''}</Td>
                  <Td right mono>{toNum(r.credit) > 0 ? fmt(toNum(r.credit)) : ''}</Td>
                </tr>
              ))
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: C.header }}>
              <td colSpan={6} style={{ padding: '8px 10px', fontWeight: 800, color: C.text, fontSize: 12 }}>TOTALES</td>
              <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: C.green, fontFamily: 'Consolas,monospace', fontSize: 12 }}>S/ {fmt(totalDebe)}</td>
              <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: C.green, fontFamily: 'Consolas,monospace', fontSize: 12 }}>S/ {fmt(totalHaber)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// REGISTRO DE COMPRAS
// ═══════════════════════════════════════════════════════════════════════════════
const RegistroCompras = ({ rows, companyName, ruc, period }: Props) => {
  const entries = useMemo(() => {
    const compras = rows.filter(r => ['PURCHASING', 'COMPRAS'].includes((r.sourceModule || '').toUpperCase()));
    const groups = groupByEntry(compras);
    return groups.map(({ eid, lines }) => {
      const first = lines[0];
      const igvLine = lines.find(l => l.account?.startsWith('401'));
      const igv = igvLine ? (toNum(igvLine.debit) || toNum(igvLine.credit)) : 0;
      const total = lines.reduce((s, l) => s + toNum(l.debit), 0);
      const base = total - igv;
      const doc = first.documentSeries && first.documentNumber
        ? `${first.documentSeries}-${first.documentNumber}` : eid.slice(-8).toUpperCase();
      return { eid, first, lines, igv, base, total: Math.max(total, base + igv) };
    }).sort((a, b) => a.first.date.localeCompare(b.first.date));
  }, [rows]);

  const totalBase  = entries.reduce((s, e) => s + e.base, 0);
  const totalIgv   = entries.reduce((s, e) => s + e.igv, 0);
  const totalTotal = entries.reduce((s, e) => s + e.total, 0);

  return (
    <div>
      <style>{PRINT_STYLE}</style>
      <div id="libro-print-area">
        <BookHeader title="REGISTRO DE COMPRAS" subtitle="Formato SUNAT 8.1 — Registro de Compras" companyName={companyName} ruc={ruc} period={period} />
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              <Th>N°</Th><Th>Fecha</Th><Th>T.Doc</Th><Th>Serie-Número</Th>
              <Th>RUC Proveedor</Th><Th>Proveedor</Th>
              <Th right>Base Imponible</Th><Th right>IGV (18%)</Th><Th right>Total</Th>
            </tr>
          </thead>
          <tbody>
            {entries.map(({ eid, first, base, igv, total }, i) => {
              const doc = first.documentSeries && first.documentNumber
                ? `${first.documentSeries}-${first.documentNumber}` : eid.slice(-8).toUpperCase();
              return (
                <tr key={eid} style={{ background: i % 2 === 1 ? C.bgRow : C.bgCard }}>
                  <Td mono>{String(i + 1).padStart(2, '0')}</Td>
                  <Td>{first.date}</Td>
                  <Td mono>{first.documentType || '01'}</Td>
                  <Td mono bold>{doc}</Td>
                  <Td mono>{first.partnerRuc || '—'}</Td>
                  <Td bold>{first.description || '—'}</Td>
                  <Td right mono>S/ {fmt(base)}</Td>
                  <Td right mono>S/ {fmt(igv)}</Td>
                  <Td right mono bold>S/ {fmt(total)}</Td>
                </tr>
              );
            })}
            {entries.length === 0 && (
              <tr><td colSpan={9} style={{ padding: 18, textAlign: 'center', color: C.textDim }}>Sin compras registradas en el período.</td></tr>
            )}
          </tbody>
          <tfoot>
            <tr style={{ background: C.header }}>
              <td colSpan={6} style={{ padding: '8px 10px', fontWeight: 800, color: C.text, fontSize: 12 }}>TOTALES DEL PERÍODO</td>
              <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: C.green, fontFamily: 'Consolas,monospace' }}>S/ {fmt(totalBase)}</td>
              <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: C.yellow, fontFamily: 'Consolas,monospace' }}>S/ {fmt(totalIgv)}</td>
              <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: C.accent, fontFamily: 'Consolas,monospace' }}>S/ {fmt(totalTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// REGISTRO DE VENTAS
// ═══════════════════════════════════════════════════════════════════════════════
const RegistroVentas = ({ rows, companyName, ruc, period }: Props) => {
  const entries = useMemo(() => {
    const ventas = rows.filter(r => ['SALES', 'VENTAS', 'BILLING', 'FACTURACION'].includes((r.sourceModule || '').toUpperCase()));
    const groups = groupByEntry(ventas);
    return groups.map(({ eid, lines }) => {
      const first = lines[0];
      const igvLine = lines.find(l => l.account?.startsWith('401'));
      const igv = igvLine ? (toNum(igvLine.debit) || toNum(igvLine.credit)) : 0;
      const total = lines.reduce((s, l) => s + toNum(l.credit), 0);
      const base = total - igv;
      return { eid, first, igv, base, total: Math.max(total, base + igv) };
    }).sort((a, b) => a.first.date.localeCompare(b.first.date));
  }, [rows]);

  const totalBase  = entries.reduce((s, e) => s + e.base, 0);
  const totalIgv   = entries.reduce((s, e) => s + e.igv, 0);
  const totalTotal = entries.reduce((s, e) => s + e.total, 0);

  return (
    <div>
      <style>{PRINT_STYLE}</style>
      <div id="libro-print-area">
        <BookHeader title="REGISTRO DE VENTAS E INGRESOS" subtitle="Formato SUNAT 14.1 — Registro de Ventas" companyName={companyName} ruc={ruc} period={period} />
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              <Th>N°</Th><Th>Fecha</Th><Th>T.Doc</Th><Th>Serie-Número</Th>
              <Th>RUC Cliente</Th><Th>Cliente</Th>
              <Th right>Base Imponible</Th><Th right>IGV (18%)</Th><Th right>Total</Th>
            </tr>
          </thead>
          <tbody>
            {entries.map(({ eid, first, base, igv, total }, i) => {
              const doc = first.documentSeries && first.documentNumber
                ? `${first.documentSeries}-${first.documentNumber}` : eid.slice(-8).toUpperCase();
              return (
                <tr key={eid} style={{ background: i % 2 === 1 ? C.bgRow : C.bgCard }}>
                  <Td mono>{String(i + 1).padStart(2, '0')}</Td>
                  <Td>{first.date}</Td>
                  <Td mono>{first.documentType || '01'}</Td>
                  <Td mono bold>{doc}</Td>
                  <Td mono>{first.partnerRuc || '—'}</Td>
                  <Td bold>{first.description || '—'}</Td>
                  <Td right mono>S/ {fmt(base)}</Td>
                  <Td right mono>S/ {fmt(igv)}</Td>
                  <Td right mono bold>S/ {fmt(total)}</Td>
                </tr>
              );
            })}
            {entries.length === 0 && (
              <tr><td colSpan={9} style={{ padding: 18, textAlign: 'center', color: C.textDim }}>Sin ventas registradas en el período.</td></tr>
            )}
          </tbody>
          <tfoot>
            <tr style={{ background: C.header }}>
              <td colSpan={6} style={{ padding: '8px 10px', fontWeight: 800, color: C.text, fontSize: 12 }}>TOTALES DEL PERÍODO</td>
              <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: C.green, fontFamily: 'Consolas,monospace' }}>S/ {fmt(totalBase)}</td>
              <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: C.yellow, fontFamily: 'Consolas,monospace' }}>S/ {fmt(totalIgv)}</td>
              <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: C.accent, fontFamily: 'Consolas,monospace' }}>S/ {fmt(totalTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// LIBRO MAYOR
// ═══════════════════════════════════════════════════════════════════════════════
const LibroMayor = ({ rows, companyName, ruc, period }: Props) => {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const accounts = useMemo(() => {
    const map = new Map<string, { code: string; name: string; rows: JournalRow[]; debe: number; haber: number }>();
    rows.forEach(r => {
      const code = r.account || '';
      if (!map.has(code)) map.set(code, { code, name: r.accountName || code, rows: [], debe: 0, haber: 0 });
      const acc = map.get(code)!;
      acc.rows.push(r);
      acc.debe  += toNum(r.debit);
      acc.haber += toNum(r.credit);
    });
    return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code));
  }, [rows]);

  const selected = selectedAccount ? accounts.find(a => a.code === selectedAccount) : null;

  return (
    <div style={{ display: 'flex', gap: 14, height: '100%' }}>
      <style>{PRINT_STYLE}</style>
      {/* Lista de cuentas */}
      <div style={{ width: 240, flexShrink: 0, borderRight: `1px solid ${C.border}`, paddingRight: 10, overflowY: 'auto' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.textMut, marginBottom: 8, textTransform: 'uppercase' }}>Cuentas</div>
        {accounts.map(a => (
          <div
            key={a.code}
            onClick={() => setSelectedAccount(a.code)}
            style={{
              padding: '7px 10px', borderRadius: 6, cursor: 'pointer', marginBottom: 2,
              background: selectedAccount === a.code ? `${C.accent}22` : 'transparent',
              border: `1px solid ${selectedAccount === a.code ? C.accent : 'transparent'}`,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: selectedAccount === a.code ? C.accent : C.text, fontFamily: 'Consolas,monospace' }}>{a.code}</div>
            <div style={{ fontSize: 10, color: C.textMut, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</div>
            <div style={{ fontSize: 10, color: C.green, fontFamily: 'Consolas,monospace', marginTop: 2 }}>
              D: {fmt(a.debe)} / H: {fmt(a.haber)}
            </div>
          </div>
        ))}
      </div>

      {/* Detalle de cuenta seleccionada */}
      <div style={{ flex: 1, overflowY: 'auto' }} id="libro-print-area">
        {selected ? (
          <>
            <BookHeader
              title={`LIBRO MAYOR — ${selected.code}`}
              subtitle={selected.name}
              companyName={companyName} ruc={ruc} period={period}
            />
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr>
                  <Th>Fecha</Th><Th>Descripción</Th><Th>Módulo</Th>
                  <Th right>Debe</Th><Th right>Haber</Th><Th right>Saldo</Th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  let saldo = 0;
                  return selected.rows
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map((r, i) => {
                      saldo += toNum(r.debit) - toNum(r.credit);
                      return (
                        <tr key={i} style={{ background: i % 2 === 1 ? C.bgRow : C.bgCard }}>
                          <Td>{r.date}</Td>
                          <Td bold>{r.description}</Td>
                          <Td>{r.sourceModule || '—'}</Td>
                          <Td right mono>{toNum(r.debit) > 0 ? fmt(toNum(r.debit)) : ''}</Td>
                          <Td right mono>{toNum(r.credit) > 0 ? fmt(toNum(r.credit)) : ''}</Td>
                          <Td right mono bold>{fmt(Math.abs(saldo))} {saldo >= 0 ? 'D' : 'H'}</Td>
                        </tr>
                      );
                    });
                })()}
              </tbody>
              <tfoot>
                <tr style={{ background: C.header }}>
                  <td colSpan={3} style={{ padding: '8px 10px', fontWeight: 800, color: C.text, fontSize: 12 }}>TOTALES</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: C.green, fontFamily: 'Consolas,monospace' }}>S/ {fmt(selected.debe)}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: C.red, fontFamily: 'Consolas,monospace' }}>S/ {fmt(selected.haber)}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: C.accent, fontFamily: 'Consolas,monospace' }}>
                    S/ {fmt(Math.abs(selected.debe - selected.haber))} {selected.debe >= selected.haber ? 'D' : 'H'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: C.textDim, fontSize: 13 }}>
            ← Selecciona una cuenta para ver su movimiento
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// BALANCE DE COMPROBACIÓN
// ═══════════════════════════════════════════════════════════════════════════════
const BalanceComprobacion = ({ rows, companyName, ruc, period }: Props) => {
  const accounts = useMemo(() => {
    const map = new Map<string, { code: string; name: string; debe: number; haber: number }>();
    rows.forEach(r => {
      const code = r.account || '';
      if (!map.has(code)) map.set(code, { code, name: r.accountName || code, debe: 0, haber: 0 });
      const acc = map.get(code)!;
      acc.debe  += toNum(r.debit);
      acc.haber += toNum(r.credit);
    });
    return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code));
  }, [rows]);

  const totDebe  = accounts.reduce((s, a) => s + a.debe, 0);
  const totHaber = accounts.reduce((s, a) => s + a.haber, 0);
  const balanced = Math.abs(totDebe - totHaber) < 0.01;

  return (
    <div>
      <style>{PRINT_STYLE}</style>
      <div id="libro-print-area">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <BookHeader title="BALANCE DE COMPROBACIÓN" subtitle="Sumas y saldos por cuenta" companyName={companyName} ruc={ruc} period={period} />
          <div style={{
            padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
            background: balanced ? `${C.green}22` : `${C.red}22`,
            color: balanced ? C.green : C.red,
            border: `1px solid ${balanced ? C.green : C.red}44`,
          }}>
            {balanced ? '✓ CUADRADO' : '⚠ DESCUADRADO'}
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              <Th>Código</Th><Th>Nombre de cuenta</Th>
              <Th right>Debe acumulado</Th><Th right>Haber acumulado</Th>
              <Th right>Saldo Deudor</Th><Th right>Saldo Acreedor</Th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a, i) => {
              const saldoD = a.debe > a.haber ? a.debe - a.haber : 0;
              const saldoH = a.haber > a.debe ? a.haber - a.debe : 0;
              return (
                <tr key={a.code} style={{ background: i % 2 === 1 ? C.bgRow : C.bgCard }}>
                  <Td mono bold>{a.code}</Td>
                  <Td>{a.name}</Td>
                  <Td right mono>S/ {fmt(a.debe)}</Td>
                  <Td right mono>S/ {fmt(a.haber)}</Td>
                  <Td right mono>{saldoD > 0 ? `S/ ${fmt(saldoD)}` : ''}</Td>
                  <Td right mono>{saldoH > 0 ? `S/ ${fmt(saldoH)}` : ''}</Td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: C.header }}>
              <td colSpan={2} style={{ padding: '8px 10px', fontWeight: 800, color: C.text, fontSize: 12 }}>TOTALES</td>
              <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: C.green, fontFamily: 'Consolas,monospace' }}>S/ {fmt(totDebe)}</td>
              <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: C.red, fontFamily: 'Consolas,monospace' }}>S/ {fmt(totHaber)}</td>
              <td colSpan={2} style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: balanced ? C.green : C.red, fontFamily: 'Consolas,monospace' }}>
                {balanced ? '✓ Cuadrado' : `⚠ Dif. S/ ${fmt(Math.abs(totDebe - totHaber))}`}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL — LibrosContables
// ═══════════════════════════════════════════════════════════════════════════════
type TabId = 'diario' | 'compras' | 'ventas' | 'mayor' | 'balance';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'diario',  label: 'Libro Diario',             icon: '📒' },
  { id: 'compras', label: 'Registro de Compras',       icon: '🛒' },
  { id: 'ventas',  label: 'Registro de Ventas',        icon: '🧾' },
  { id: 'mayor',   label: 'Libro Mayor',               icon: '📊' },
  { id: 'balance', label: 'Balance de Comprobación',   icon: '⚖️' },
];

export const LibrosContables: React.FC<Props> = ({ rows, companyName, companyRuc, period }) => {
  const [activeTab, setActiveTab] = useState<TabId>('diario');

  const tabProps = { rows, companyName, companyRuc, period };

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: C.bg, color: C.text, fontFamily: "'Segoe UI', Arial, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 18px', borderBottom: `1px solid ${C.border}`,
        background: C.bgCard, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
      }}>
        <div>
          <span style={{ fontWeight: 800, fontSize: 15, color: C.text }}>📚 Libros Contables</span>
          <span style={{ marginLeft: 10, fontSize: 11, color: C.textDim }}>
            {rows.length} líneas · Auto-actualizado con cada asiento registrado
          </span>
        </div>
        <PrintBtn label={`Imprimir ${TABS.find(t => t.id === activeTab)?.label}`} />
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 2, padding: '8px 16px 0',
        background: C.bgCard, borderBottom: `1px solid ${C.border}`, flexWrap: 'wrap',
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 14px', borderRadius: '6px 6px 0 0', border: 'none',
              background: activeTab === tab.id ? C.bg : 'transparent',
              color: activeTab === tab.id ? C.accent : C.textMut,
              fontWeight: activeTab === tab.id ? 700 : 400,
              fontSize: 12, cursor: 'pointer',
              borderBottom: activeTab === tab.id ? `2px solid ${C.accent}` : '2px solid transparent',
              transition: 'all 0.15s',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 18 }}>
        {activeTab === 'diario'  && <LibroDiario {...tabProps} />}
        {activeTab === 'compras' && <RegistroCompras {...tabProps} />}
        {activeTab === 'ventas'  && <RegistroVentas {...tabProps} />}
        {activeTab === 'mayor'   && <LibroMayor {...tabProps} />}
        {activeTab === 'balance' && <BalanceComprobacion {...tabProps} />}
      </div>
    </div>
  );
};
