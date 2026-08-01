import type { APIConfig } from '@/types/api';
export const postLogin:    APIConfig = { endPoint:'/auth/login',     keys:['auth-login'],    method:'POST', accessToken:false };
export const getMe:        APIConfig = { endPoint:'/auth/me',        keys:['auth-me'],       method:'GET',  accessToken:true  };
export const getCompanies: APIConfig = { endPoint:'/auth/companies', keys:['auth-companies'],method:'GET',  accessToken:true  };
export const postLogout:   APIConfig = { endPoint:'/auth/logout',    keys:['auth-logout'],   method:'POST', accessToken:true  };
