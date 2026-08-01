import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { TUserInfo, TPermission } from '@/schemas/auth/response';

export interface TCompany {
  id: string;
  name: string;
  currency: string;
  gstin?: string | null;
}

type TAuthState = {
  user:            TUserInfo | null;
  token:           string | null;
  isAuthenticated: boolean;
  activeModule:    string | null;
  companies:       TCompany[];
  activeCompanyId: string | null;
  isLoadedToken:   boolean;
};

const initialState: TAuthState = {
  user:            null,
  token:           null,
  isAuthenticated: false,
  activeModule:    null,
  companies:       [],
  activeCompanyId: null,
  isLoadedToken:   false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ user: TUserInfo; token: string }>) => {
      state.user            = action.payload.user;
      state.token           = action.payload.token;
      state.isAuthenticated = true;
      state.activeModule    = 'FINANCE';
      state.isLoadedToken   = true;
      // Save to localStorage for axios interceptor
      if (typeof window !== 'undefined') {
        localStorage.setItem('nexerp-token', action.payload.token);
        if (action.payload.user.companyId)
          localStorage.setItem('nexerp-company-id', String(action.payload.user.companyId));
      }
    },
    setCompanies: (state, action: PayloadAction<{ list: TCompany[]; defaultId?: string }>) => {
      state.companies = action.payload.list;
      const cur = state.activeCompanyId;
      const valid = cur && action.payload.list.some(c => c.id === cur);
      state.activeCompanyId = valid
        ? cur
        : (action.payload.defaultId ?? action.payload.list[0]?.id ?? null);
    },
    setActiveCompany: (state, action: PayloadAction<string>) => {
      state.activeCompanyId = action.payload;
      if (typeof window !== 'undefined')
        localStorage.setItem('nexerp-company-id', action.payload);
    },
    setActiveModule: (state, action: PayloadAction<string>) => {
      state.activeModule = action.payload;
    },
    logout: (state) => {
      state.user            = null;
      state.token           = null;
      state.isAuthenticated = false;
      state.activeModule    = null;
      state.companies       = [];
      state.activeCompanyId = null;
      state.isLoadedToken   = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('nexerp-token');
        localStorage.removeItem('nexerp-company-id');
        window.location.href = '/login';
      }
    },
    hydrateFromStorage: (state) => {
      // Called on app init to rehydrate from localStorage
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('nexerp-token');
        const auth  = localStorage.getItem('nexerp-auth-v2');
        if (token) state.token = token;
        if (auth) {
          try {
            const parsed = JSON.parse(auth);
            if (parsed.user)  state.user            = parsed.user;
            if (parsed.token) { state.token = parsed.token; state.isAuthenticated = true; }
            if (parsed.activeModule) state.activeModule = parsed.activeModule;
            if (parsed.companies)    state.companies    = parsed.companies;
            if (parsed.activeCompanyId) state.activeCompanyId = parsed.activeCompanyId;
          } catch { /* ignore */ }
        }
        state.isLoadedToken = true;
      }
    },
  },
});

// Helper to persist auth to localStorage
export const persistAuth = (state: TAuthState) => {
  if (typeof window !== 'undefined')
    localStorage.setItem('nexerp-auth-v2', JSON.stringify({
      user: state.user, token: state.token, activeModule: state.activeModule,
      companies: state.companies, activeCompanyId: state.activeCompanyId,
    }));
};

export const authReducer = authSlice.reducer;
export const authAction   = authSlice.actions;

// Selectors
export const selectAuth  = (s: any) => s.auth as TAuthState;
export const selectCan   = (screenCode: string, action: 'create'|'read'|'update'|'delete') => (s: any) => {
  const perms: TPermission[] = (s.auth as TAuthState).user?.permissions ?? [];
  const p = perms.find(x => x.screenCode === screenCode);
  if (!p) return false;
  return action === 'create' ? p.canCreate : action === 'read' ? p.canRead : action === 'update' ? p.canUpdate : p.canDelete;
};
