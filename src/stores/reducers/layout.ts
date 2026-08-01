import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type TLayout = { sidebarOpen: boolean; theme: 'dark' | 'light'; };
const initialState: TLayout = { sidebarOpen: true, theme: 'dark' };

const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    toggleSidebar: (state)                         => { state.sidebarOpen = !state.sidebarOpen; },
    setSidebar:    (state, a: PayloadAction<boolean>) => { state.sidebarOpen = a.payload; },
    setTheme:      (state, a: PayloadAction<'dark'|'light'>) => {
      state.theme = a.payload;
      if (typeof document !== 'undefined') document.documentElement.setAttribute('data-theme', a.payload);
      if (typeof window   !== 'undefined') localStorage.setItem('nexerp-theme', a.payload);
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      if (typeof document !== 'undefined') document.documentElement.setAttribute('data-theme', state.theme);
      if (typeof window   !== 'undefined') localStorage.setItem('nexerp-theme', state.theme);
    },
  },
});

export const layoutReducer = layoutSlice.reducer;
export const layoutAction   = layoutSlice.actions;
export const selectTheme    = (s: any) => s.layout.theme as 'dark'|'light';
export const selectSidebar  = (s: any) => s.layout.sidebarOpen as boolean;
