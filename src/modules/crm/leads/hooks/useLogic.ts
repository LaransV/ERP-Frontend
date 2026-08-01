"use client";
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useQuery }    from '@/hooks/useQuery';
import { useMutation } from '@/hooks/useMutation';
import { LeadsRes, CRMDashRes } from '@/schemas/crm/response';
import type { TLead } from '@/schemas/crm/response';
import { LeadReq } from '@/schemas/crm/request';
import { getLeads, postLead, putLead, deleteLead, patchLeadStatus, getCRMDash } from '@/services/api/crm';
import { VoidRes } from '@/schemas/template/response';
import { LEADS_KEY } from '../constants';
import type { TLeadFilter } from '../declaration';

export const useLeadsLogic = () => {
  const { canAccess } = useAuthStore();
  const qc = useQueryClient();
  const canCreate = canAccess('CRM_LEADS','create');
  const canUpdate = canAccess('CRM_LEADS','update');
  const canDelete = canAccess('CRM_LEADS','delete');
  const [editing, setEditing] = useState<TLead|null>(null);
  const [open, setOpen]       = useState(false);
  const [filter, setFilter]   = useState<TLeadFilter>({ status:'' });

  const { data, isLoading } = useQuery({
    apiConfig:getLeads, responseSchema:LeadsRes,
    payload:{ status:filter.status||undefined }, loadingKey:LEADS_KEY,
  });
  const { data: dashRes } = useQuery({ apiConfig:getCRMDash, responseSchema:CRMDashRes });

  const { mutate: save, isPending } = useMutation({
    apiConfig: editing ? putLead : postLead,
    requestSchema:LeadReq, responseSchema:LeadsRes,
    parameters: editing ? { id:editing.leadId } : undefined,
    onSuccess:()=>{ qc.invalidateQueries({queryKey:getLeads.keys}); toast.success(editing?'Lead updated':'Lead created'); setOpen(false); setEditing(null); },
    onError:()=>toast.error('Failed to save lead'),
  });

  const { mutate: del } = useMutation({
    apiConfig:deleteLead, requestSchema:VoidRes as any, responseSchema:VoidRes,
    onSuccess:()=>{ qc.invalidateQueries({queryKey:getLeads.keys}); toast.success('Lead deleted'); },
  });

  return {
    leads: data?.data?.content ?? [], total: data?.data?.totalElements ?? 0,
    dash: dashRes?.data, isLoading, editing, open, isPending, filter,
    canCreate, canUpdate, canDelete, save, setOpen,
    setStatus: (s:string) => setFilter(f=>({...f,status:s})),
    handleEdit:   (l:TLead) => { setEditing(l); setOpen(true); },
    handleDelete: (id:number) => { if(confirm('Delete lead?')) del(null as any); },
    handleNew:    () => { setEditing(null); setOpen(true); },
  };
};
