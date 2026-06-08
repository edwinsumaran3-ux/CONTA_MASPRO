import React from 'react';

const C = {
  bgCard: '#0b1a30', header: '#030810',
  border: '#1e3a5f', text: '#e8f0fe', textMut: '#7da3c4', textDim: '#4d7a9e',
  accent: '#60a5fa',
};

export const AssetTablePremium = () => (
  <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
    <div style={{
      padding: '10px 16px', borderBottom: `1px solid ${C.border}`,
      background: `linear-gradient(90deg, ${C.accent}0d, transparent)`,
    }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>🏭 Registro de Activos Fijos</span>
    </div>

    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
      <thead>
        <tr style={{ background: C.header }}>
          {['CÓDIGO', 'DESCRIPCIÓN', 'VALOR LIBROS', 'DEP. ACUM.', 'VALOR NETO', 'ESTADO'].map((h, i) => (
            <th key={i} style={{
              padding: '8px 12px', textAlign: i >= 2 && i <= 4 ? 'right' : 'left',
              fontSize: 10, fontWeight: 700, color: C.textMut,
              textTransform: 'uppercase', letterSpacing: '0.06em',
              borderBottom: `1px solid ${C.border}`,
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colSpan={6} style={{ padding: '28px', textAlign: 'center', color: C.textDim, fontSize: 12 }}>
            Sin activos registrados. Registre activos fijos en el módulo Activos para verlos aquí.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);
