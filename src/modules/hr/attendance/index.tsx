"use client";
import { useAuthStore } from '@/store/authStore';
import { Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { PageHeader, DataTable, StatusBadge, AccessDenied } from '@/components/shared';
import type { ColumnDef } from '@tanstack/react-table';
import type { TAttendance } from '@/schemas/hr/response';
import { useAttendanceLogic } from './hooks/useLogic';

export default function AttendanceModule() {
  const { canAccess } = useAuthStore();
  const canRead = canAccess('HR_ATTENDANCE','read');
  const { records, total, isLoading, dateFilter, canCreate, canUpdate,
          handleNew, handleEdit, handleDelete, setDate } = useAttendanceLogic();

  if (!canRead) return <AccessDenied />;

  const cols: ColumnDef<TAttendance>[] = [
    { accessorKey:'empCode',   header:'Code',   cell:({getValue})=><span className="font-mono text-xs" style={{color:'var(--brand)'}}>{(getValue() as string)||'—'}</span> },
    { accessorKey:'empName',   header:'Employee', cell:({getValue})=><span className="font-semibold" style={{color:'var(--text-primary)'}}>{getValue() as string}</span> },
    { accessorKey:'attendanceDate', header:'Date', cell:({getValue})=><span style={{color:'var(--text-secondary)'}}>{getValue() as string}</span> },
    { accessorKey:'checkIn',   header:'In',  cell:({getValue})=><span className="font-mono">{(getValue() as string)?.slice(11,16)||'—'}</span> },
    { accessorKey:'checkOut',  header:'Out', cell:({getValue})=><span className="font-mono">{(getValue() as string)?.slice(11,16)||'—'}</span> },
    { accessorKey:'status',    header:'Status', cell:({getValue})=><StatusBadge status={getValue() as string}/> },
    { id:'actions', header:'',
      cell:({row})=>(
        <div className="flex gap-1" onClick={e=>e.stopPropagation()}>
          {canUpdate && <button onClick={()=>handleEdit(row.original)} className="btn-ghost btn-icon btn-sm"><Edit className="w-3.5 h-3.5"/></button>}
          <button onClick={()=>handleDelete(row.original.attendanceId)} className="btn-ghost btn-icon btn-sm text-red-400"><Trash2 className="w-3.5 h-3.5"/></button>
        </div>
      )},
  ];

  return (
    <div>
      <PageHeader title="Attendance" subtitle={`${total} records`}
        crumbs={[{label:'HR'},{label:'Attendance'}]}
        actions={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{color:'var(--text-muted)'}}/>
              <input type="date" value={dateFilter} onChange={e=>setDate(e.target.value)}
                className="field-input pl-9 w-44 text-sm"/>
            </div>
            {canCreate && <button onClick={handleNew} className="btn-primary"><Plus className="w-4 h-4"/>Add Record</button>}
          </div>}/>
      <DataTable data={records} columns={cols} loading={isLoading}
        searchPlaceholder="Search employee…" emptyMsg="No attendance records for this date."/>
    </div>
  );
}
