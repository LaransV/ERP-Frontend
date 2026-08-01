"use client";
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useQuery }    from '@/hooks/useQuery';
import { useMutation } from '@/hooks/useMutation';
import { ActivitiesRes } from '@/schemas/crm/response';
import type { TActivity } from '@/schemas/crm/response';
import { ActivityReq } from '@/schemas/crm/request';
import { getActivities, postActivity, putActivity, deleteActivity } from '@/services/api/crm';
import { VoidRes } from '@/schemas/template/response';
import { ACT_KEY } from '../constants';

export const useActivitiesLogic = () => {
  const { canAccess } = useAuthStore();
  const qc = useQueryClient();
  const canCreate = canAccess('CRM_ACTIVITIES','create');
  const canUpdate = canAccess('CRM_ACTIVITIES','update');
  const canDelete = canAccess('CRM_ACTIVITIES','delete');
  const [editing, setEditing] = useState<TActivity|null>(null);
  const [open, setOpen]       = useState(false);

  const { data, isLoading } = useQuery({ apiConfig:getActivities, responseSchema:ActivitiesRes, loadingKey:ACT_KEY });

  const { mutate: save, isPending } = useMutation({
    apiConfig: editing ? putActivity : postActivity,
    requestSchema:ActivityReq, responseSchema:ActivitiesRes,
    parameters: editing ? { id:editing.activityId } : undefined,
    onSuccess:()=>{ qc.invalidateQueries({queryKey:getActivities.keys}); toast.success(editing?'Updated':'Created'); setOpen(false); setEditing(null); },
    onError:()=>toast.error('Failed to save activity'),
  });

  const { mutate: del } = useMutation({
    apiConfig:deleteActivity, requestSchema:VoidRes as any, responseSchema:VoidRes,
    onSuccess:()=>{ qc.invalidateQueries({queryKey:getActivities.keys}); toast.success('Deleted'); },
  });

  return {
    activities: data?.data?.content ?? [], total: data?.data?.totalElements ?? 0,
    isLoading, editing, open, isPending, canCreate, canUpdate, canDelete, save, setOpen,
    handleEdit:   (a:TActivity) => { setEditing(a); setOpen(true); },
    handleDelete: (id:number)   => { if(confirm('Delete activity?')) del(null as any); },
    handleNew:    ()            => { setEditing(null); setOpen(true); },
  };
};
