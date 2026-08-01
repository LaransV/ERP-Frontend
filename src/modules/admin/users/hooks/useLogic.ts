"use client";
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useQuery }    from '@/hooks/useQuery';
import { useMutation } from '@/hooks/useMutation';
import { UsersRes, RolesRes } from '@/schemas/admin/response';
import type { TUser } from '@/schemas/admin/response';
import { UserReq } from '@/schemas/admin/request';
import { getUsers, postUser, putUser, deleteUser, patchToggleUser, getRoles } from '@/services/api/admin';
import { VoidRes } from '@/schemas/template/response';
import { USERS_KEY } from '../constants';

export const useUsersLogic = () => {
  const { canAccess } = useAuthStore();
  const qc = useQueryClient();
  const canCreate = canAccess('ADMIN_USERS','create');
  const canUpdate = canAccess('ADMIN_USERS','update');
  const canDelete = canAccess('ADMIN_USERS','delete');
  const [editing, setEditing] = useState<TUser|null>(null);
  const [open, setOpen]       = useState(false);

  const { data, isLoading } = useQuery({ apiConfig:getUsers, responseSchema:UsersRes, loadingKey:USERS_KEY });
  const { data: rolesRes }  = useQuery({ apiConfig:getRoles, responseSchema:RolesRes });

  const { mutate: save, isPending } = useMutation({
    apiConfig: editing ? putUser : postUser,
    requestSchema:UserReq, responseSchema:UsersRes,
    parameters: editing ? { id:editing.userId } : undefined,
    onSuccess:()=>{ qc.invalidateQueries({queryKey:getUsers.keys}); toast.success(editing?'User updated':'User created'); setOpen(false); setEditing(null); },
    onError:()=>toast.error('Failed to save user'),
  });

  const { mutate: toggle } = useMutation({
    apiConfig:patchToggleUser, requestSchema:VoidRes as any, responseSchema:VoidRes,
    onSuccess:()=>{ qc.invalidateQueries({queryKey:getUsers.keys}); toast.success('Status toggled'); },
  });

  const { mutate: del } = useMutation({
    apiConfig:deleteUser, requestSchema:VoidRes as any, responseSchema:VoidRes,
    onSuccess:()=>{ qc.invalidateQueries({queryKey:getUsers.keys}); toast.success('User deleted'); },
  });

  return {
    users: data?.data?.content ?? [], total: data?.data?.totalElements ?? 0,
    roles: rolesRes?.data ?? [],
    isLoading, editing, open, isPending, canCreate, canUpdate, canDelete, save, setOpen,
    handleEdit:   (u:TUser) => { setEditing(u); setOpen(true); },
    handleToggle: (id:number) => toggle(null as any),
    handleDelete: (id:number) => { if(confirm('Delete user?')) del(null as any); },
    handleNew:    ()          => { setEditing(null); setOpen(true); },
  };
};
