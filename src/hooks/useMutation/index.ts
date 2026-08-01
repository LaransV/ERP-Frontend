"use client";
import { DefaultError, useMutation as useRM } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { input, output, ZodType, ZodTypeAny } from 'zod';
import type { TResponse } from '@/schemas/template/response';
import { useAuthStore } from '@/store/authStore';
import { fetchClientSide } from '@/utils/api/fetchClientSide';
import type { UseMutationProps } from './declaration';

export const useMutation = <Req extends ZodTypeAny, Res extends ZodType<TResponse>>(
  props: UseMutationProps<Req, Res>
) => {
  const { apiConfig, requestSchema, responseSchema, options, onError, onSuccess, parameters } = props;
  const { token, logout } = useAuthStore();

  const mut = useRM<output<Res>, DefaultError, input<Req>>({
    ...(options as any ?? {}),
    mutationKey: [...apiConfig.keys],
    mutationFn: (variables) => fetchClientSide<Req, Res>({
      apiConfig, responseSchema, requestSchema, 
      parameters: typeof parameters === 'function' ? parameters(variables) : parameters,
      payload: variables, onSuccess, onError, logout,
      accessToken: apiConfig.accessToken ? (token ?? undefined) : undefined,
    }),
  });

  useEffect(() => { if (mut.error) throw mut.error; }, [mut.error]);
  return mut;
};
