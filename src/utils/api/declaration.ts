import { input, output, ZodType, ZodTypeAny } from 'zod';
import type { APIConfig } from '@/types/api';
import type { EndPointParameter } from '@/utils/apiEndpointParser';

export type TBaseResponse = {
  success: boolean; message?: string; statusCode?: number;
  data?: unknown; errors?: string[];
};

export type FetchProps<Req extends ZodTypeAny, Res extends ZodType<TBaseResponse>> = {
  apiConfig:      APIConfig;
  requestSchema?: Req;
  responseSchema: Res;
  payload?:       input<Req>;
  parameters?:    EndPointParameter;
  accessToken?:   string;
  onSuccess?:     (res: output<Res>) => void;
  onError?:       (res: output<Res>) => void;
  logout?:        () => void;
};
