'use client';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { authReducer }    from './reducers/auth';
import { loadingReducer } from './reducers/loading';
import { layoutReducer }  from './reducers/layout';

const rootReducer = combineReducers({
  auth:    authReducer,
  loading: loadingReducer,
  layout:  layoutReducer,
});

const setupStore = () => configureStore({
  reducer:  rootReducer,
  devTools: process.env.NODE_ENV !== 'production',
});

export const globalStore = setupStore();

export type RootState   = ReturnType<typeof rootReducer>;
export type AppStore    = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
