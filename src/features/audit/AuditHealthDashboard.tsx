import React from 'react';
import { CheckmarkCircle24Regular, Info24Regular } from '@fluentui/react-icons';

export const AuditHealthDashboard = () => {
  return (
    <div style={{
      padding: 24, background: '#050d1a', height: '100%', overflowY: 'auto',
      fontFamily: "'Segoe UI', Arial, sans-serif", color: '#e8f0fe',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#e8f0fe' }}>Auditoría Preventiva IA</h2>
          <p style={{ margin: '4px 0 0', fontSize: 11, color: '#7da3c4' }}>Los hallazgos se generan automáticamente al ejecutar el escaneo</p>
        </div>
        <button
          type="button"
          style={{
            padding: '8px 16px', fontSize: 12, fontWeight: 700,
            background: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)',
            color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer',
            boxShadow: '0 3px 10px rgba(59,130,246,0.4)',
          }}
          onClick={() => window.alert('Iniciando escaneo global — conecte el backend para resultados reales.')}
        >
          🛡️ Iniciar Escaneo Global
        </button>
      </div>

      <div style={{
        padding: '32px 20px', textAlign: 'center',
        background: '#0b1a30', border: '1px dashed #1e3a5f',
        borderRadius: 12, color: '#7da3c4',
      }}>
        <Info24Regular style={{ fontSize: 40, color: '#60a5fa', marginBottom: 12 }} />
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#c5d8f0' }}>
          Sin hallazgos activos
        </p>
        <p style={{ margin: '8px 0 0', fontSize: 12, color: '#7da3c4' }}>
          Ejecute el escaneo global para analizar los comprobantes del período actual.<br />
          Los resultados reales provienen del motor IA conectado al backend.
        </p>
      </div>

      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#7da3c4' }}>
        <CheckmarkCircle24Regular style={{ color: '#22c55e' }} />
        <span>Motor IA operativo — sin datos demo</span>
      </div>
    </div>
  );
};
