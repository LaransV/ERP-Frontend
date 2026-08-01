"use client";
import { useFormHandler } from '@/hooks/useFormHandler';
import { EmployeeSchema } from '@/schemas/hr/request';
import type { TEmployeeReq } from '@/schemas/hr/request';
export const useEmployeeForm = (d?: Partial<TEmployeeReq>) =>
  useFormHandler<TEmployeeReq>({ validationSchema:EmployeeSchema, defaultValues:d as any });
