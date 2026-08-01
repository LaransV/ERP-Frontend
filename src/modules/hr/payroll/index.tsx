"use client";
import { useAuthStore } from '@/store/authStore';
import { Play, CheckCircle, DollarSign } from 'lucide-react';
import { PageHeader, DataTable, StatusBadge, AccessDenied } from '@/components/shared';
import { fmt } from '@/lib/utils';
import type { ColumnDef } from '@tanstack/react-table';
import type { TPayroll } from '@/schemas/hr/response';
import { usePayrollLogic } from './hooks/useLogic';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function PayrollModule() {
  const { canAccess } = useAuthStore();
  const canRead = canAccess('HR_PAYROLL','read');
  const { records, total, isLoading, filter, totalGross, totalNet,
          canCreate, canUpdate, processing, setFilter, process, markPaid } = usePayrollLogic();

  if (!canRead) return <AccessDenied />;

  const cols: ColumnDef<TPayroll>[] = [
    { accessorKey:'empCode',      header:'Code',  cell:({getValue})=><span className="font-mono text-xs" style={{color:'var(--brand)'}}>{(getValue() as string)||'—'}</span> },
    { accessorKey:'empName',      header:'Employee', cell:({getValue})=><span className="font-semibold" style={{color:'var(--text-primary)'}}>{getValue() as string}</span> },
    { accessorKey:'daysWorked',   header:'Days',  cell:({getValue})=><span className="font-mono">{getValue() as number}</span> },
    { accessorKey:'grossSalary',  header:'Gross', cell:({getValue})=><span className="font-mono">{fmt.currency(getValue() as number)}</span> },
    { accessorKey:'totalDeductions',header:'Deductions',cell:({getValue})=><span className="font-mono text-red-400">{fmt.currency(getValue() as number)}</span> },
    { accessorKey:'netSalary',    header:'Net',   cell:({getValue})=><span className="font-mono font-bold text-green-400">{fmt.currency(getValue() as number)}</span> },
    { accessorKey:'status',       header:'Status',cell:({getValue})=><StatusBadge status={getValue() as string}/> },
    { id:'actions', header:'',
      cell:({row})=>(
        canUpdate && row.original.status==='PROCESSED'
          ? <button onClick={()=>markPaid(row.original.payrollId)} className="btn-sm btn-primary text-xs gap-1"><CheckCircle className="w-3 h-3"/>Mark Paid</button>
          : null
      )},
  ];

  return (
    <div>
      <PageHeader title="Payroll" subtitle={`${total} records — ${MONTHS[filter.month-1]} ${filter.year}`}
        crumbs={[{label:'HR'},{label:'Payroll'}]}
        actions={
          <div className="flex items-center gap-2">
            <select value={filter.month} onChange={e=>setFilter(f=>({...f,month:+e.target.value}))} className="field-input w-28 text-sm">
              {MONTHS.map((m,i)=><option key={m} value={i+1}>{m}</option>)}
            </select>
            <select value={filter.year} onChange={e=>setFilter(f=>({...f,year:+e.target.value}))} className="field-input w-24 text-sm">
              {[2024,2025,2026].map(y=><option key={y}>{y}</option>)}
            </select>
            {canCreate && <button onClick={()=>process(null as any)} disabled={processing} className="btn-primary gap-2"><Play className="w-4 h-4"/>Process Payroll</button>}
          </div>}/>
      <div className="grid grid-cols-2 gap-4 mb-5">
        {[
          {t:'Total Gross',v:fmt.currency(totalGross),c:'text-yellow-400',I:DollarSign},
          {t:'Total Net',  v:fmt.currency(totalNet),  c:'text-green-400', I:CheckCircle},
        ].map(({t,v,c,I})=>(
          <div key={t} className="glass-card p-4">
            <div className="flex justify-between mb-2"><span className="text-xs" style={{color:'var(--text-muted)'}}>{t}</span><I className={`w-4 h-4 ${c}`}/></div>
            <div className="text-xl font-bold" style={{color:'var(--text-primary)'}}>{v}</div>
          </div>
        ))}
      </div>
      <DataTable data={records} columns={cols} loading={isLoading}
        searchPlaceholder="Search employee…" emptyMsg="No payroll records. Run Process Payroll."/>
    </div>
  );
}
