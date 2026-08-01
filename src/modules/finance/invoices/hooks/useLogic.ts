"use client";
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useQuery }    from '@/hooks/useQuery';
import { useMutation } from '@/hooks/useMutation';
import { InvoicesRes, FinDashRes} from '@/schemas/finance/response';
import { VoidRes } from '@/schemas/template/response';
import { getInvoices, getFinanceDash, deleteInvoice } from '@/services/api/finance';
import { axiosClient } from '@/utils/api/fetchClientSide';
import { INV_KEY } from '../constants';
import type { TInvoiceFilter } from '../declaration';
import { z } from 'zod';
import { BaseResponse } from '@/schemas/template/response';
import {
  postInvoice, putInvoice,
  getClients, getProducts,
  getDispatchAddresses, postDispatchAddress,
  getShipToAddresses, postShipToAddress,
} from '@/services/api/finance';
import { InvoiceReq, DispatchAddressReq, ShipToAddressReq } from '@/schemas/finance/request';
import {
  ClientsRes, ProductsRes,
  DispatchAddressesRes, DispatchAddressRes,
  ShipToAddressesRes, ShipToAddressRes,
  type TInvoice,
} from '@/schemas/finance/response';
const DelRes = BaseResponse.extend({ data: z.null().optional() });

export const useInvoicesLogic = () => {
  const { canAccess } = useAuthStore();
  const router = useRouter();
  const qc     = useQueryClient();
  const canRead   = canAccess('FINANCE_INVOICES','read');
  const canCreate = canAccess('FINANCE_INVOICES','create');
  const canDelete = canAccess('FINANCE_INVOICES','delete');
  const [filters, setFilters] = useState<TInvoiceFilter>({ status:'', page:0, size:100 });

  const { data: invRes, isLoading } = useQuery({
    apiConfig:getInvoices, responseSchema:InvoicesRes,
    payload:{ status:filters.status||undefined, size:filters.size },
    loadingKey:INV_KEY,
  });
  const { data: dashRes } = useQuery({ apiConfig:getFinanceDash, responseSchema:FinDashRes });

  const { mutate: del } = useMutation({
    apiConfig:deleteInvoice, requestSchema:DelRes as any, responseSchema:DelRes,
    parameters:(id:number)=>({ id }),
    onSuccess:()=>{ qc.invalidateQueries({queryKey:getInvoices.keys}); toast.success('Invoice deleted'); },
    onError:()=>toast.error('Failed to delete invoice'),
  });

  const handleDelete = (id:number) => {
    if (!confirm('Delete this invoice?')) return;
    del(id as any);
  };

  const handlePdf = async (id:number, num:string) => {
    try {
      const res = await axiosClient.get(`/finance/invoices/${id}/pdf`,{responseType:'blob'});
      const url = URL.createObjectURL(res.data);
      Object.assign(document.createElement('a'),{href:url,download:`Invoice_${num}.pdf`}).click();
      URL.revokeObjectURL(url);
    } catch { toast.error('PDF generation failed'); }
  };

  return {
    invoices: invRes?.data?.content ?? [], total: invRes?.data?.totalElements ?? 0,
    dash: dashRes?.data, isLoading, filters, canRead, canCreate, canDelete,
    setStatus: (s:string) => setFilters(f=>({...f,status:s})),
    goNew:  ()=>router.push('/finance/invoices/new'),
    goEdit: (id:number)=>router.push(`/finance/invoices/${id}`),
    handleDelete, handlePdf,
  };
};

export const useInvoiceFormLogic = (invoiceId?: number) => {
  const { canAccess } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<TInvoice|null>(null);

  const canCreate = canAccess('FINANCE_INVOICES','create');
  const canUpdate = canAccess('FINANCE_INVOICES','update');

  // ── Dropdown data sources ──────────────────────────────────
  const { data: clientsRes } = useQuery({
    apiConfig: getClients, responseSchema: ClientsRes, payload: { size: 1000 },
  });
  const { data: productsRes } = useQuery({
    apiConfig: getProducts, responseSchema: ProductsRes, payload: { size: 1000 },
  });
  const { data: dispatchRes, refetch: refetchDispatch } = useQuery({
    apiConfig: getDispatchAddresses, responseSchema: DispatchAddressesRes,
  });
  const { data: shipToRes, refetch: refetchShipTo } = useQuery({
    apiConfig: getShipToAddresses, responseSchema: ShipToAddressesRes,
  });

  // ── Quick-add a new Dispatch From / Ship To address ────────
  const { mutate: addDispatchAddress, isPending: isSavingDispatch } = useMutation({
    apiConfig: postDispatchAddress, requestSchema: DispatchAddressReq, responseSchema: DispatchAddressRes,
    onSuccess: () => { refetchDispatch(); toast.success('Dispatch address saved'); },
    onError: () => toast.error('Failed to save dispatch address'),
  });
  const { mutate: addShipToAddress, isPending: isSavingShipTo } = useMutation({
    apiConfig: postShipToAddress, requestSchema: ShipToAddressReq, responseSchema: ShipToAddressRes,
    onSuccess: () => { refetchShipTo(); toast.success('Ship-to address saved'); },
    onError: () => toast.error('Failed to save ship-to address'),
  });

  // ── Save the invoice itself ────────────────────────────────
  const { mutate: save, isPending: isSaving } = useMutation({
    apiConfig: invoiceId ? putInvoice : postInvoice,
    requestSchema: InvoiceReq,
    responseSchema: InvoicesRes,
    parameters: invoiceId ? { id: invoiceId } : undefined,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getInvoices.keys });
      toast.success(invoiceId ? 'Invoice updated' : 'Invoice created');
      router.push('/finance/invoices');
    },
    onError: () => toast.error('Failed to save invoice'),
  });

  const goBack = () => router.push('/finance/invoices');

  return {
    editing, setEditing, isSaving, canCreate, canUpdate, save, goBack,
    clients: clientsRes?.data?.content ?? [],
    products: productsRes?.data?.content ?? [],
    dispatchAddresses: dispatchRes?.data ?? [],
    shipToAddresses: shipToRes?.data ?? [],
    addDispatchAddress, isSavingDispatch,
    addShipToAddress, isSavingShipTo,
  };
};
