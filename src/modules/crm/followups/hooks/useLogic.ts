"use client";
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useQuery }    from '@/hooks/useQuery';
import { useMutation } from '@/hooks/useMutation';
import { FollowupsRes, LeadsRes } from '@/schemas/crm/response';
import type { TFollowup } from '@/schemas/crm/response';
import { FollowupReq } from '@/schemas/crm/request';
import { getFollowups, postFollowup, putFollowup, deleteFollowup, patchCompleteFollowup, getLeads } from '@/services/api/crm';
import { VoidRes } from '@/schemas/template/response';
import { FOLLOWUP_KEY } from '../constants';

export const useFollowupsLogic = () => {
  const { canAccess } = useAuthStore();
  const qc = useQueryClient();
  const canCreate = canAccess('CRM_FOLLOWUPS','create');
  const canUpdate = canAccess('CRM_FOLLOWUPS','update');
  const canDelete = canAccess('CRM_FOLLOWUPS','delete');
  const [editing, setEditing] = useState<TFollowup|null>(null);
  const [open, setOpen]       = useState(false);

  const { data, isLoading } = useQuery({ apiConfig:getFollowups, responseSchema:FollowupsRes, loadingKey:FOLLOWUP_KEY });
  const { data: leadsRes }  = useQuery({ apiConfig:getLeads,     responseSchema:LeadsRes });

  const { mutate: save, isPending } = useMutation({
    apiConfig: editing ? putFollowup : postFollowup,
    requestSchema:FollowupReq, responseSchema:FollowupsRes,
    parameters: editing ? { id:editing.followupId } : undefined,
    onSuccess:()=>{ qc.invalidateQueries({queryKey:getFollowups.keys}); toast.success(editing?'Updated':'Scheduled'); setOpen(false); setEditing(null); },
    onError:()=>toast.error('Failed to save followup'),
  });

  const { mutate: complete } = useMutation({
    apiConfig:patchCompleteFollowup, requestSchema:VoidRes as any, responseSchema:VoidRes,
    onSuccess:()=>{ qc.invalidateQueries({queryKey:getFollowups.keys}); toast.success('Marked complete'); },
  });

  const { mutate: del } = useMutation({
    apiConfig:deleteFollowup, requestSchema:VoidRes as any, responseSchema:VoidRes,
    onSuccess:()=>{ qc.invalidateQueries({queryKey:getFollowups.keys}); toast.success('Deleted'); },
  });

  return {
    followups: data?.data?.content ?? [], total: data?.data?.totalElements ?? 0,
    leads: leadsRes?.data?.content ?? [],
    isLoading, editing, open, isPending, canCreate, canUpdate, canDelete, save, setOpen,
    handleEdit:     (f:TFollowup) => { setEditing(f); setOpen(true); },
    handleDelete:   (id:number)   => { if(confirm('Delete followup?')) del(null as any); },
    handleNew:      ()            => { setEditing(null); setOpen(true); },
    handleComplete: (id:number)   => complete(null as any),
  };
};
