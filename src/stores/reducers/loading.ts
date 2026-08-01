import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState { loading: string[]; }
const initialState: AppState = { loading: [] };

const loadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    setLoading:     (state, action: PayloadAction<string>) => { if (!state.loading.includes(action.payload)) state.loading.push(action.payload); },
    destroyLoading: (state, action: PayloadAction<string>) => { state.loading = state.loading.filter(k => k !== action.payload); },
    clearLoading:   (state) => { state.loading = []; },
  },
});

export const loadingReducer = loadingSlice.reducer;
export const loadingAction  = loadingSlice.actions;
export const selectIsLoading = (key: string) => (s: any): boolean => s.loading.loading.includes(key);
export const selectAnyLoading = (s: any): boolean => s.loading.loading.length > 0;
