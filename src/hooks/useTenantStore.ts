import { create } from 'zustand';
import type { Rubro } from '../config/itemCatalog';

export type Company = {
  id: string;
  ruc: string;
  businessName: string;
  rubro: Rubro;
  rubros: Rubro[];
};

type TenantState = {
  currentCompany: Company;          // nunca null — sistema depende de esto
  companies: Company[];
  setCompany: (id: string) => void;
  addCompany: (company: Company) => void;
  removeCompany: (id: string) => void;
  setRubro: (rubro: Rubro) => void;
  setRubros: (rubros: Rubro[]) => void;
};

const STORAGE_KEY = 'conta_pro_companies';

const PLACEHOLDER: Company = {
  id: 'tenant-placeholder',
  ruc: '',
  businessName: 'Sin empresa activa',
  rubro: 'GE',
  rubros: ['GE'],
};

const loadCompanies = (): Company[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Company[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return [];
};

const saveCompanies = (companies: Company[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
};

const initialCompanies = loadCompanies();

export const useTenantStore = create<TenantState>((set, get) => ({
  currentCompany: initialCompanies[0] ?? PLACEHOLDER,
  companies: initialCompanies,

  setCompany: (id: string) => {
    const company = get().companies.find(c => c.id === id);
    if (company) set({ currentCompany: company });
  },

  addCompany: (company: Company) => {
    const updated = [...get().companies, company];
    saveCompanies(updated);
    set({ companies: updated, currentCompany: company });
  },

  removeCompany: (id: string) => {
    const updated = get().companies.filter(c => c.id !== id);
    saveCompanies(updated);
    const current = get().currentCompany;
    set({
      companies: updated,
      currentCompany: current.id === id ? (updated[0] ?? PLACEHOLDER) : current,
    });
  },

  setRubro: (rubro: Rubro) => {
    const current = get().currentCompany;
    const updated = { ...current, rubro };
    const companies = get().companies.map(c => c.id === current.id ? updated : c);
    saveCompanies(companies);
    set({ currentCompany: updated, companies });
  },

  setRubros: (rubros: Rubro[]) => {
    const current = get().currentCompany;
    const updated = { ...current, rubros, rubro: rubros[0] ?? current.rubro };
    const companies = get().companies.map(c => c.id === current.id ? updated : c);
    saveCompanies(companies);
    set({ currentCompany: updated, companies });
  },
}));
