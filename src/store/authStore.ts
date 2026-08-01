import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthUser, Permission } from '@/types';
import { useCompanyStore, type Company } from '@/store/themeStore';
import api from '@/lib/api/client';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  activeModule: string | null;
  setAuth: (user: AuthUser, token: string) => void;
  logout: () => void;
  setActiveModule: (module: string | null) => void;
  canAccess: (screen: string, action: 'create' | 'read' | 'update' | 'delete') => boolean;
  canModule: (moduleCode: string) => boolean;
  getPermission: (screen: string) => Permission | undefined;
  getAccessibleModules: () => string[];
  // NEW: fetch accessible companies from backend and populate companyStore
  loadCompanies: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      activeModule: null,

      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true, activeModule: 'FINANCE' });

        // After login, load all companies from backend to populate the company switcher.
        setTimeout(() => {
          useAuthStore.getState().loadCompanies().catch(() => {
            // Fallback: if /auth/companies fails, use the user's own companyId
            if (user.companyId) {
              const fallback: Company[] = [{
                id:   String(user.companyId),
                name: user.companyName ?? 'My Company',
                currency: 'INR',
              }];
              useCompanyStore.getState().setCompanies(fallback, String(user.companyId));
            }
          });
        }, 0);
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, activeModule: null });
        // Clear company store on logout so next user starts fresh
        useCompanyStore.setState({ companies: [], activeCompanyId: null });
        if (typeof window !== 'undefined') window.location.href = '/login';
      },

      setActiveModule: (module) => set({ activeModule: module }),

      // Calls GET /auth/companies — backend returns all active companies (flat list).
      loadCompanies: async () => {
        try {
          const res = await api.get('/auth/companies');
          if (res.data?.success && Array.isArray(res.data?.data)) {
            const list: Company[] = res.data.data.map((c: any) => ({
              id:       String(c.companyId),
              name:     c.companyName,
              currency: c.currency ?? 'INR',
              gstin:    c.gstin,
            }));
            const user = get().user;
            const defaultId = user?.companyId ? String(user.companyId) : undefined;
            useCompanyStore.getState().setCompanies(list, defaultId);
          }
        } catch (err) {
          throw err;
        }
      },

      canAccess: (screenCode, action) => {
        const p = get().getPermission(screenCode);
        if (!p) return false;
        switch (action) {
          case 'create': return p.canCreate;
          case 'read':   return p.canRead;
          case 'update': return p.canUpdate;
          case 'delete': return p.canDelete;
        }
      },

      canModule: (moduleCode) => {
        const perms = get().user?.permissions ?? [];
        return perms.some(p => p.moduleCode === moduleCode && p.canRead);
      },

      getPermission: (screenCode) => {
        return get().user?.permissions.find(p => p.screenCode === screenCode);
      },

      getAccessibleModules: () => {
        const perms = get().user?.permissions ?? [];
        const modules = new Set(perms.filter(p => p.canRead).map(p => p.moduleCode));
        return Array.from(modules);
      },
    }),
    {
      name: 'nexerp-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        user:            s.user,
        token:           s.token,
        isAuthenticated: s.isAuthenticated,
        activeModule:    s.activeModule,
      }),
    }
  )
);
