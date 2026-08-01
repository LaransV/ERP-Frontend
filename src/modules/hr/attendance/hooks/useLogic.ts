"use client";
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useQuery }    from '@/hooks/useQuery';
import { useMutation } from '@/hooks/useMutation';
import { AttendanceRes, EmployeesRes } from '@/schemas/hr/response';
import type { TAttendance } from '@/schemas/hr/response';
import { AttendanceReq } from '@/schemas/hr/request';
import { getAttendance, postAttendance, putAttendance, deleteAttendance, getEmployees } from '@/services/api/hr';
import { VoidRes } from '@/schemas/template/response';
import { ATT_KEY } from '../constants';

export const useAttendanceLogic = () => {
  const { canAccess } = useAuthStore();
  const qc = useQueryClient();
  const canCreate = canAccess('HR_ATTENDANCE','create');
  const canUpdate = canAccess('HR_ATTENDANCE','update');
  const [editing, setEditing] = useState<TAttendance|null>(null);
  const [open, setOpen]       = useState(false);
  const [dateFilter, setDate] = useState(new Date().toISOString().slice(0,10));

  const { data, isLoading } = useQuery({
    apiConfig:getAttendance, responseSchema:AttendanceRes,
    payload:{ date:dateFilter }, loadingKey:ATT_KEY,
  });
  const { data: empRes } = useQuery({ apiConfig:getEmployees, responseSchema:EmployeesRes });

  const { mutate: save, isPending } = useMutation({
    apiConfig: editing ? putAttendance : postAttendance,
    requestSchema:AttendanceReq, responseSchema:AttendanceRes,
    parameters: editing ? { id:editing.attendanceId } : undefined,
    onSuccess:()=>{ qc.invalidateQueries({queryKey:getAttendance.keys}); toast.success('Attendance saved'); setOpen(false); setEditing(null); },
    onError:()=>toast.error('Failed to save attendance'),
  });

  const { mutate: del } = useMutation({
    apiConfig:deleteAttendance, requestSchema:VoidRes as any, responseSchema:VoidRes,
    onSuccess:()=>{ qc.invalidateQueries({queryKey:getAttendance.keys}); toast.success('Record deleted'); },
  });

  return {
    records: data?.data?.content ?? [], total: data?.data?.totalElements ?? 0,
    employees: empRes?.data?.content ?? [],
    isLoading, editing, open, isPending, dateFilter, canCreate, canUpdate,
    save, setOpen, setDate,
    handleEdit:   (r:TAttendance) => { setEditing(r); setOpen(true); },
    handleDelete: (id:number)     => { if(confirm('Delete record?')) del(null as any); },
    handleNew:    ()              => { setEditing(null); setOpen(true); },
  };
};
