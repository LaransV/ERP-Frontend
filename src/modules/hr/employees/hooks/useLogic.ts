"use client";
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useQuery }    from '@/hooks/useQuery';
import { useMutation } from '@/hooks/useMutation';
import { EmployeesRes, DeptsRes, DesigRes, HRDashRes } from '@/schemas/hr/response';
import type { TEmployee } from '@/schemas/hr/response';
import { EmployeeReq } from '@/schemas/hr/request';
import { getEmployees, postEmployee, putEmployee, deleteEmployee, getDepartments, getDesignations, getHRDash } from '@/services/api/hr';
import { VoidRes } from '@/schemas/template/response';
import { EMP_KEY } from '../constants';

export const useEmployeesLogic = () => {
  const { canAccess } = useAuthStore();
  const qc = useQueryClient();
  const canCreate = canAccess('HR_EMPLOYEES','create');
  const canUpdate = canAccess('HR_EMPLOYEES','update');
  const canDelete = canAccess('HR_EMPLOYEES','delete');
  const [editing, setEditing] = useState<TEmployee|null>(null);
  const [open, setOpen]       = useState(false);

  const { data, isLoading }    = useQuery({ apiConfig:getEmployees,   responseSchema:EmployeesRes, loadingKey:EMP_KEY });
  const { data: depts }        = useQuery({ apiConfig:getDepartments,  responseSchema:DeptsRes });
  const { data: desigs }       = useQuery({ apiConfig:getDesignations, responseSchema:DesigRes  });
  const { data: dashRes }      = useQuery({ apiConfig:getHRDash,       responseSchema:HRDashRes });

  const { mutate: save, isPending } = useMutation({
    apiConfig: editing ? putEmployee : postEmployee,
    requestSchema:EmployeeReq, responseSchema:EmployeesRes,
    parameters: editing ? { id:editing.empId } : undefined,
    onSuccess:()=>{ qc.invalidateQueries({queryKey:getEmployees.keys}); toast.success(editing?'Employee updated':'Employee added'); setOpen(false); setEditing(null); },
    onError:()=>toast.error('Failed to save employee'),
  });

  const { mutate: del } = useMutation({
    apiConfig:deleteEmployee, requestSchema:VoidRes as any, responseSchema:VoidRes,
    onSuccess:()=>{ qc.invalidateQueries({queryKey:getEmployees.keys}); toast.success('Employee removed'); },
  });

  return {
    employees: data?.data?.content ?? [], total: data?.data?.totalElements ?? 0,
    depts: depts?.data ?? [], desigs: desigs?.data ?? [],
    dash: dashRes?.data, isLoading, editing, open, isPending,
    canCreate, canUpdate, canDelete, save, setOpen,
    handleEdit:   (e:TEmployee) => { setEditing(e); setOpen(true); },
    handleDelete: (id:number)   => { if(confirm('Remove employee?')) del(null as any); },
    handleNew:    ()            => { setEditing(null); setOpen(true); },
  };
};
