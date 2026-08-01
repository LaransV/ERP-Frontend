"use client";
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useQuery }    from '@/hooks/useQuery';
import { useMutation } from '@/hooks/useMutation';
import { POsRes } from '@/schemas/inventory/response';
import type { TPO } from '@/schemas/inventory/response';
import { VoidRes } from '@/schemas/template/response';
import { getPurchaseOrders, patchApprovePO, deletePO } from '@/services/api/inventory';
import { PO_KEY } from '../constants';

export const useOrdersLogic = () => {
  const { canAccess } = useAuthStore();
  const qc = useQueryClient();
  const canCreate = canAccess('INV_PURCHASE_ORDERS','create');
  const canUpdate = canAccess('INV_PURCHASE_ORDERS','update');
  const canDelete = canAccess('INV_PURCHASE_ORDERS','delete');
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({ apiConfig:getPurchaseOrders, responseSchema:POsRes, loadingKey:PO_KEY });

  const { mutate: approve } = useMutation({
    apiConfig:patchApprovePO, requestSchema:VoidRes as any, responseSchema:VoidRes,
    onSuccess:()=>{ qc.invalidateQueries({queryKey:getPurchaseOrders.keys}); toast.success('PO approved'); },
  });

  const { mutate: del } = useMutation({
    apiConfig:deletePO, requestSchema:VoidRes as any, responseSchema:VoidRes,
    onSuccess:()=>{ qc.invalidateQueries({queryKey:getPurchaseOrders.keys}); toast.success('PO deleted'); },
  });

  return {
    orders: data?.data?.content ?? [], total: data?.data?.totalElements ?? 0,
    isLoading, open, canCreate, canUpdate, canDelete, setOpen,
    handleApprove: (id:number) => approve(null as any),
    handleDelete:  (id:number) => { if(confirm('Delete PO?')) del(null as any); },
  };
};
