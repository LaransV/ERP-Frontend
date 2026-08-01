import type { UseQueryOptions } from '@tanstack/react-query';
import type { input, output, ZodType, ZodTypeAny } from 'zod';
import type { TResponse } from '@/schemas/template/response';
import type { APIConfig } from '@/types/api';
import type { EndPointParameter } from '@/utils/apiEndpointParser';

export type UseQueryProps<Req extends ZodTypeAny, Res extends ZodType<TResponse>> = {
  apiConfig:      APIConfig;
  parameters?:    EndPointParameter;
  requestSchema?: Req;
  responseSchema: Res;
  payload?:       input<Req>;
  options?:       Omit<UseQueryOptions,'queryKey'|'queryFn'>;
  onSuccess?:     (res: output<Res>) => void;
  onError?:       (res: output<Res>) => void;
  loadingKey?:    string;
  enabled?:       boolean;
};
