"use client";
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useQuery }    from '@/hooks/useQuery';
import { useMutation } from '@/hooks/useMutation';
import { PayrollRes } from '@/schemas/hr/response';
import { VoidRes } from '@/schemas/template/response';
import { getPayroll, postProcessPayroll, patchPayrollPaid } from '@/services/api/hr';
import { PAYROLL_KEY } from '../constants';

export const usePayrollLogic = () => {
  const { canAccess } = useAuthStore();
  const qc = useQueryClient();
  const canCreate = canAccess('HR_PAYROLL','create');
  const canUpdate = canAccess('HR_PAYROLL','update');
  const now = new Date();
  const [filter, setFilter] = useState({ month:now.getMonth()+1, year:now.getFullYear() });

  const { data, isLoading } = useQuery({
    apiConfig:getPayroll, responseSchema:PayrollRes,
    payload:{ month:filter.month, year:filter.year }, loadingKey:PAYROLL_KEY,
  });

  const { mutate: process, isPending: processing } = useMutation({
    apiConfig:postProcessPayroll, requestSchema:PayrollRes as any, responseSchema:PayrollRes,
    onSuccess:()=>{ qc.invalidateQueries({queryKey:getPayroll.keys}); toast.success('Payroll processed'); },
    onError:()=>toast.error('Failed to process payroll'),
  });

  const { mutate: markPaid } = useMutation({
    apiConfig:patchPayrollPaid, requestSchema:VoidRes as any, responseSchema:VoidRes,
    onSuccess:()=>{ qc.invalidateQueries({queryKey:getPayroll.keys}); toast.success('Marked as paid'); },
  });

  const totalGross = (data?.data?.content ?? []).reduce((s,r)=>s+r.grossSalary,0);
  const totalNet   = (data?.data?.content ?? []).reduce((s,r)=>s+r.netSalary,0);

  return {
    records: data?.data?.content ?? [], total: data?.data?.totalElements ?? 0,
    isLoading, filter, totalGross, totalNet, canCreate, canUpdate, processing,
    setFilter, process, markPaid: (id:number) => markPaid(null as any),
  };
};
