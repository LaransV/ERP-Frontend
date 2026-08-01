"use client";
import { useQuery as useRQ } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { output, ZodType, ZodTypeAny } from 'zod';
import type { TResponse } from '@/schemas/template/response';
import { useAuthStore } from '@/store/authStore';
import { fetchClientSide } from '@/utils/api/fetchClientSide';
import type { UseQueryProps } from './declaration';

export const useQuery = <Req extends ZodTypeAny, Res extends ZodType<TResponse>>(
  props: UseQueryProps<Req, Res>
) => {
  const { apiConfig, requestSchema, responseSchema, options, onError, onSuccess, parameters, payload, enabled } = props;
  const { token, logout } = useAuthStore();

  const result = useRQ<output<Res>>({
    ...(options as any ?? {}),
    enabled: enabled !== false,
    refetchOnWindowFocus: false,
    queryKey: [...apiConfig.keys, ...(parameters ? [parameters] : []), ...(payload ? [payload] : [])],
    queryFn: () => fetchClientSide<Req, Res>({
      apiConfig, responseSchema, requestSchema, parameters,
      payload, onSuccess, onError, logout,
      accessToken: apiConfig.accessToken ? (token ?? undefined) : undefined,
    }),
  });

  useEffect(() => { if (result.error) throw result.error; }, [result.error]);
  return result;
};
