import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import './frontend/src/styles.css';
import './src/styles/enterprise-theme.css';
import './src/styles/sidebar.css';
import { EnterpriseWorkspace } from './src/features/accounting/EnterpriseWorkspace';
import { LoginScreen } from './src/features/auth/LoginScreen';
import { CompanySelectScreen } from './src/features/auth/CompanySelectScreen';
import PlanComparisonPage from './src/features/billing/PlanComparisonPage';
import { useTenantStore } from './src/hooks/useTenantStore';
import type { Company } from './src/hooks/useTenantStore';

type AuthUser = { rbacRole: string; displayRole: string; plan: string };

// Planes que son de CONTADOR (necesitan seleccionar empresa antes de entrar)
const CONTADOR_PLANS = ['TRIAL_CONTADOR','BASICO_CONTADOR','PLUS_CONTADOR','PRO_CONTADOR','MAESTRO_PLUS'];

const App = () => {
  const [user,    setUser]    = useState<AuthUser | null>(null);
  const [company, setCompany] = useState<Company | null>(null);

  // Sin login → pantalla de login
  if (!user) {
    return (
      <LoginScreen
        onLogin={(rbacRole, displayRole, plan) =>
          setUser({ rbacRole, displayRole, plan })
        }
      />
    );
  }

  // Contador sin empresa seleccionada → pantalla de selección de empresas
  const isContador = CONTADOR_PLANS.includes(user.plan);
  if (isContador && !company) {
    return (
      <CompanySelectScreen
        userPlan={user.plan}
        displayName={user.displayRole}
        onSelectCompany={(c: Company) => {
          useTenantStore.getState().setCompany(c.id);
          setCompany(c);
        }}
      />
    );
  }

  return (
    <FluentProvider theme={webLightTheme}>
      {window.location.pathname === '/planes' ? (
        <PlanComparisonPage />
      ) : (
        <EnterpriseWorkspace userRole={user.rbacRole} userPlan={user.plan} />
      )}
    </FluentProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
