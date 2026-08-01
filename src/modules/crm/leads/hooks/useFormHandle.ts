"use client";
import { useFormHandler } from '@/hooks/useFormHandler';
import { LeadSchema } from '@/schemas/crm/request';
import type { TLeadReq } from '@/schemas/crm/request';
export const useLeadForm = (d?: Partial<TLeadReq>) =>
  useFormHandler<TLeadReq>({ validationSchema:LeadSchema, defaultValues:d as any });
