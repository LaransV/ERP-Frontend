'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ── Theme Store ────────────────────────────────────────────────
interface ThemeState {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (t: 'dark' | 'light') => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setTheme: (t) => set({ theme: t }),
    }),
    { name: 'nexerp-theme', storage: createJSONStorage(() => localStorage) }
  )
);

// ── Company Store ──────────────────────────────────────────────
// Flat list of companies loaded from backend after login.
// activeCompanyId drives X-Company-Id header on every API call.

export interface Company {
  id: string;          // backend CompanyId as string
  name: string;
  currency: string;
  gstin?: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

interface CompanyState {
  companies: Company[];
  activeCompanyId: string | null;

  setCompanies: (list: Company[], defaultActiveId?: string) => void;
  addCompany:       (c: Company) => void;
  removeCompany:    (id: string) => void;
  setActiveCompany: (id: string) => void;
  getActive:        () => Company | null;
}

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set, get) => ({
      companies: [],
      activeCompanyId: null,

      setCompanies: (list, defaultActiveId) => {
        const current = get().activeCompanyId;
        const stillValid = current && list.some(c => c.id === current);
        set({
          companies: list,
          activeCompanyId: stillValid
            ? current
            : (defaultActiveId ?? list[0]?.id ?? null),
        });
      },

      addCompany:       (c) => set((s) => ({ companies: [...s.companies, c] })),
      removeCompany:    (id) => set((s) => ({ companies: s.companies.filter(c => c.id !== id) })),
      setActiveCompany: (id) => set({ activeCompanyId: id }),
      getActive:        () => get().companies.find(c => c.id === get().activeCompanyId) ?? null,
    }),
    {
      name: 'nexerp-company',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ companies: s.companies, activeCompanyId: s.activeCompanyId }),
    }
  )
);
