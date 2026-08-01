import type { UseMutationOptions } from '@tanstack/react-query';
import type { input, output, ZodType, ZodTypeAny } from 'zod';
import type { TResponse } from '@/schemas/template/response';
import type { APIConfig } from '@/types/api';
import type { EndPointParameter } from '@/utils/apiEndpointParser';

export type UseMutationProps<Req extends ZodTypeAny, Res extends ZodType<TResponse>> = {
  apiConfig:      APIConfig;
  parameters?:    EndPointParameter | ((variables: input<Req>) => EndPointParameter);
  requestSchema:  Req;
  responseSchema: Res;
  options?:       UseMutationOptions;
  onSuccess?:     (res: output<Res>) => void;
  onError?:       (res: output<Res>) => void;
  loadingKey?:    string;
};
