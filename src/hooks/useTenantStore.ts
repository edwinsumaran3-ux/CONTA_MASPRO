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
  currentCompany: Company | null;
  companies: Company[];
  setCompany: (id: string) => void;
  addCompany: (company: Company) => void;
  removeCompany: (id: string) => void;
  setRubro: (rubro: Rubro) => void;
  setRubros: (rubros: Rubro[]) => void;
};

const STORAGE_KEY = 'conta_pro_companies';

const loadCompanies = (): Company[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Company[];
  } catch { /* ignore */ }
  return [];
};

const saveCompanies = (companies: Company[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
};

const initialCompanies = loadCompanies();

export const useTenantStore = create<TenantState>((set, get) => ({
  currentCompany: initialCompanies[0] ?? null,
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
      currentCompany: current?.id === id ? (updated[0] ?? null) : current,
    });
  },

  setRubro: (rubro: Rubro) => {
    const current = get().currentCompany;
    if (!current) return;
    const updated = { ...current, rubro };
    const companies = get().companies.map(c => c.id === current.id ? updated : c);
    saveCompanies(companies);
    set({ currentCompany: updated, companies });
  },

  setRubros: (rubros: Rubro[]) => {
    const current = get().currentCompany;
    if (!current) return;
    const updated = { ...current, rubros, rubro: rubros[0] ?? current.rubro };
    const companies = get().companies.map(c => c.id === current.id ? updated : c);
    saveCompanies(companies);
    set({ currentCompany: updated, companies });
  },
}));
