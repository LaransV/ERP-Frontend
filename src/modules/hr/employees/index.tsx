"use client";
import { useAuthStore } from '@/store/authStore';
import { Plus, Edit, Trash2, Users, UserCheck, UserX, TrendingUp } from 'lucide-react';
import { PageHeader, DataTable, AccessDenied } from '@/components/shared';
import { fmt } from '@/lib/utils';
import type { ColumnDef } from '@tanstack/react-table';
import type { TEmployee } from '@/schemas/hr/response';
import { useEmployeesLogic } from './hooks/useLogic';

export default function EmployeesModule() {
  const { canAccess } = useAuthStore();
  const canRead = canAccess('HR_EMPLOYEES','read');
  const { employees, total, dash, isLoading, canCreate, canUpdate, canDelete,
          handleNew, handleEdit, handleDelete } = useEmployeesLogic();

  if (!canRead) return <AccessDenied />;

  const cols: ColumnDef<TEmployee>[] = [
    { accessorKey:'empCode',   header:'Code',
      cell:({getValue})=><span className="font-mono text-xs px-2 py-1 rounded-md" style={{background:'var(--hover)',color:'var(--brand)'}}>{getValue() as string}</span> },
    { accessorKey:'fullName',  header:'Name',
      cell:({getValue})=><span className="font-semibold" style={{color:'var(--text-primary)'}}>{getValue() as string}</span> },
    { accessorKey:'email',     header:'Email', cell:({getValue})=><span style={{color:'var(--text-secondary)'}}>{getValue() as string}</span> },
    { accessorKey:'deptName',  header:'Dept',  cell:({getValue})=><span style={{color:'var(--text-muted)'}}>{(getValue() as string)||'—'}</span> },
    { accessorKey:'desigName', header:'Designation', cell:({getValue})=><span style={{color:'var(--text-muted)'}}>{(getValue() as string)||'—'}</span> },
    { accessorKey:'basicSalary', header:'Salary',
      cell:({getValue})=><span className="font-mono">{fmt.currency(getValue() as number)}</span> },
    { accessorKey:'dateOfJoining', header:'Joined',
      cell:({getValue})=><span style={{color:'var(--text-muted)'}}>{fmt.date(getValue() as string)}</span> },
    { id:'actions', header:'',
      cell:({row})=>(
        <div className="flex gap-1" onClick={e=>e.stopPropagation()}>
          {canUpdate && <button onClick={()=>handleEdit(row.original)} className="btn-ghost btn-icon btn-sm"><Edit className="w-3.5 h-3.5"/></button>}
          {canDelete && <button onClick={()=>handleDelete(row.original.empId)} className="btn-ghost btn-icon btn-sm text-red-400"><Trash2 className="w-3.5 h-3.5"/></button>}
        </div>
      )},
  ];

  return (
    <div>
      <PageHeader title="Employees" subtitle={`${total} employees`}
        crumbs={[{label:'HR'},{label:'Employees'}]}
        actions={canCreate ? <button onClick={handleNew} className="btn-primary"><Plus className="w-4 h-4"/>Add Employee</button> : undefined}/>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          {t:'Total',    v:dash?.totalEmployees??0,      I:Users,     c:'text-brand'},
          {t:'Present',  v:dash?.todayPresent??0,        I:UserCheck, c:'text-green-400'},
          {t:'Absent',   v:dash?.todayAbsent??0,         I:UserX,     c:'text-red-400'},
          {t:'New/Month',v:dash?.newJoiningThisMonth??0, I:TrendingUp,c:'text-purple-400'},
        ].map(({t,v,I,c})=>(
          <div key={t} className="glass-card p-4">
            <div className="flex justify-between mb-2"><span className="text-xs" style={{color:'var(--text-muted)'}}>{t}</span><I className={`w-4 h-4 ${c}`}/></div>
            <div className="text-2xl font-bold" style={{color:'var(--text-primary)'}}>{v}</div>
          </div>
        ))}
      </div>
      <DataTable data={employees} columns={cols} loading={isLoading}
        searchPlaceholder="Search employees…" emptyMsg="No employees found."/>
    </div>
  );
}
