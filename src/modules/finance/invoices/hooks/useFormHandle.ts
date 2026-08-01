"use client";
import { useFormHandler } from '@/hooks/useFormHandler';
import { InvoiceSchema, DispatchAddressSchema, ShipToAddressSchema } from '@/schemas/finance/request';
import type { TInvoiceReq, TDispatchAddressReq, TShipToAddressReq } from '@/schemas/finance/request';

export const useInvoiceForm = (defaults?: Partial<TInvoiceReq>) =>
  useFormHandler<TInvoiceReq>({ validationSchema: InvoiceSchema, defaultValues: defaults as any });

export const useDispatchAddressForm = (defaults?: Partial<TDispatchAddressReq>) =>
  useFormHandler<TDispatchAddressReq>({ validationSchema: DispatchAddressSchema, defaultValues: defaults as any });

export const useShipToAddressForm = (defaults?: Partial<TShipToAddressReq>) =>
  useFormHandler<TShipToAddressReq>({ validationSchema: ShipToAddressSchema, defaultValues: defaults as any });
