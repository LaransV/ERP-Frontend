import axios from 'axios';
import { output, ZodType, ZodTypeAny } from 'zod';
import { parseApiEndpoint } from '@/utils/apiEndpointParser';
import type { FetchProps, TBaseResponse } from './declaration';
 
const AUTH_FAIL = [401, 403];
 
export const axiosClient = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080') + '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});
 
axiosClient.interceptors.request.use((cfg) => {
  if (typeof window !== 'undefined') {
    try {
      const authRaw = localStorage.getItem('nexerp-auth');
      if (authRaw) {
        const token = JSON.parse(authRaw)?.state?.token;
        if (token) cfg.headers.Authorization = `Bearer ${token}`;
      }
      const companyRaw = localStorage.getItem('nexerp-company');
      if (companyRaw) {
        const cid = JSON.parse(companyRaw)?.state?.activeCompanyId;
        if (cid) cfg.headers['X-Company-Id'] = String(cid);
      }
    } catch { /* ignore */ }
  }
  return cfg;
});
 
// ── safe parse helper — never throws, logs Zod issues for debugging ──
function safeParse<Res extends ZodType<TBaseResponse>>(
  schema: Res, raw: unknown
): output<Res> {
  const result = schema.safeParse(raw);
  if (result.success) return result.data;
  // Log Zod issues for debugging but don't crash
  console.warn('[Schema parse warning]', result.error.issues);
  // Return raw data cast — UI still gets data even if extra fields exist
  return raw as output<Res>;
}
 
export async function fetchClientSide<Req extends ZodTypeAny, Res extends ZodType<TBaseResponse>>(
  p: FetchProps<Req, Res>
): Promise<output<Res>> {
  const { apiConfig, payload, parameters, requestSchema, responseSchema, onError, onSuccess, logout } = p;
  const url    = parseApiEndpoint(apiConfig.endPoint, parameters);
  const method = apiConfig.method.toLowerCase();
  const body   = requestSchema && payload ? requestSchema.parse(payload) : payload;
 
  try {
    const res = await axiosClient.request({
      url, method,
      ...(method === 'get' ? { params: parameters  } : { data: body }),
      headers: apiConfig.headers,
    });
 
    const raw = {
      success:    res.data?.success ?? true,
      message:    res.data?.message ?? null,
      statusCode: res.status,
      data:       res.data?.data ?? res.data,
      errors:     res.data?.errors ?? null,
    };
 
    const parsed = safeParse(responseSchema, raw);
    if (parsed.success) { onSuccess?.(parsed); return parsed; }
    onError?.(parsed); return parsed;
 
  } catch (err: any) {
    const status = err?.response?.status ?? 500;
    const d      = err?.response?.data;
    const errRaw = {
      success:    false,
      message:    d?.message || err?.message || 'Request failed',
      statusCode: status,
      data:       null,
      errors:     d?.errors ?? null,
    };
    const errRes = safeParse(responseSchema, errRaw);
    if (AUTH_FAIL.includes(status)) { logout?.(); return errRes; }
    onError?.(errRes); return errRes;
  }
}