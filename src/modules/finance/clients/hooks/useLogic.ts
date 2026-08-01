"use client";
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useQuery }    from '@/hooks/useQuery';
import { useMutation } from '@/hooks/useMutation';
import { ClientsRes } from '@/schemas/finance/response';
import type { TClient } from '@/schemas/finance/response';
import { ClientReq , DeleteClientReq} from '@/schemas/finance/request';
import { getClients, postClient, putClient, deleteClient } from '@/services/api/finance';
import { VoidRes } from '@/schemas/template/response';
import { CLIENTS_KEY } from '../constants';
import { axiosClient } from '@/utils/api/fetchClientSide';

export const useClientsLogic = () => {
  const { canAccess } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();
  const canCreate = canAccess('FINANCE_CLIENTS','create');
  const canUpdate = canAccess('FINANCE_CLIENTS','update');
  const canDelete = canAccess('FINANCE_CLIENTS','delete');
  const [editing, setEditing] = useState<TClient|null>(null);
  const [open,    setOpen]    = useState(false);

  // ── Filter state (State only) ──────────────────────────────
  const [filterState, setFilterState] = useState('');
  const [appliedState, setAppliedState] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  console.log("appliedState", appliedState);
  

  const { data, isLoading } = useQuery({
    apiConfig: getClients,
    responseSchema: ClientsRes,
    loadingKey: CLIENTS_KEY,
    parameters: appliedState ? { stateName: appliedState } : undefined,
  });

  const { mutate: save, isPending } = useMutation({
    apiConfig: editing ? putClient : postClient,
    requestSchema: ClientReq,
    responseSchema: ClientsRes,
    parameters: editing ? { id: editing.clientId } : undefined,
    onSuccess:()=>{ qc.invalidateQueries({queryKey:getClients.keys}); toast.success(editing?'Client updated':'Client created'); setOpen(false); setEditing(null); },
    onError:()=>toast.error('Failed to save client'),
  });

  const { mutate: del } = useMutation({
    apiConfig: deleteClient,
    requestSchema: DeleteClientReq,
    responseSchema: VoidRes,
    parameters: (vars) => ({ id: vars.id }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: getClients.keys }); toast.success('Client deleted'); },
  });

  const handleDelete = (id: number) => {
    if (confirm('Delete client?')) del({ id });
  };
  const handleNew    = ()           => router.push('/finance/clients/new');
  const handleEdit   = (id: number) => router.push(`/finance/clients/${id}`);

  // ── Filter apply / clear ───────────────────────────────────
  const handleFilterApply = () => {
    console.log("filterState =", filterState);
    setAppliedState(filterState);
    setFilterOpen(false);
  };
  const handleFilterClear = () => {
    setFilterState('');
    setAppliedState('');
    setFilterOpen(false);
  };

  // ── Export helpers ─────────────────────────────────────────
  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href    = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = async () => {
    try {
      toast.loading('Preparing Excel…', { id: 'exp-xl' });
      const params: Record<string, string> = {};
      if (appliedState) params.stateName = appliedState;
      const res = await axiosClient.get('/finance/clients/export/excel', {
        params,
        responseType: 'blob',
      });
      const suffix = appliedState ? `_${appliedState.replace(/\s+/g, '_')}` : '';
      downloadBlob(res.data, `clients${suffix}.xlsx`);
      toast.success('Excel downloaded!', { id: 'exp-xl' });
    } catch {
      toast.error('Excel export failed', { id: 'exp-xl' });
    }
  };

  const handleExportPdf = async () => {
    try {
      toast.loading('Preparing PDF…', { id: 'exp-pdf' });
      const params: Record<string, string> = {};
      if (appliedState) params.stateName = appliedState;
      const res = await axiosClient.get('/finance/clients/export/pdf', {
        params,
        responseType: 'blob',
      });
      const suffix = appliedState ? `_${appliedState.replace(/\s+/g, '_')}` : '';
      downloadBlob(res.data, `clients${suffix}.pdf`);
      toast.success('PDF downloaded!', { id: 'exp-pdf' });
    } catch {
      toast.error('PDF export failed', { id: 'exp-pdf' });
    }
  };

  return {
    clients: [...(data?.data?.content ?? [])].sort((a,b) => (b.clientId ?? 0) - (a.clientId ?? 0)),
    total: data?.data?.totalElements ?? 0,
    isLoading, editing, open, isPending, canCreate, canUpdate, canDelete,
    save, setOpen, handleEdit, handleDelete, handleNew,
    // filter
    filterState, setFilterState, appliedState,
    filterOpen, setFilterOpen,
    handleFilterApply, handleFilterClear,
    // export
    handleExportExcel, handleExportPdf,
  };
};

// ── For New/Edit page ────────────────────────────────────────────
export const useClientFormLogic = (clientId?: number) => {
  const { canAccess } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<TClient|null>(null);

  const canUpdate = canAccess('FINANCE_CLIENTS','update');
  const canCreate = canAccess('FINANCE_CLIENTS','create');

  const { mutate: save, isPending: isSaving } = useMutation({
    apiConfig: clientId ? putClient : postClient,
    requestSchema: ClientReq,
    responseSchema: ClientsRes,
    parameters: clientId ? { id: clientId } : undefined,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getClients.keys });
      toast.success(clientId ? 'Client updated' : 'Client created');
      router.push('/finance/clients');
    },
    onError: () => toast.error('Failed to save client'),
  });

  const goBack = () => router.push('/finance/clients');

  return { editing, isSaving, canCreate, canUpdate, save, goBack, setEditing };
};
