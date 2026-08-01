"use client";
import { useFormHandler } from '@/hooks/useFormHandler';
import { ClientSchema } from '@/schemas/finance/request';
import type { TClientReq } from '@/schemas/finance/request';
export const useClientForm = (defaults?: Partial<TClientReq>) =>
  useFormHandler<TClientReq>({ validationSchema: ClientSchema, defaultValues: defaults as any });
