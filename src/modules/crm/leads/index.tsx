"use client";
import { useAuthStore } from '@/store/authStore';
import { Plus, Edit, Trash2, TrendingUp, Users, Trophy, Target } from 'lucide-react';
import { PageHeader, DataTable, StatusBadge, AccessDenied } from '@/components/shared';
import { fmt } from '@/lib/utils';
import type { ColumnDef } from '@tanstack/react-table';
import type { TLead } from '@/schemas/crm/response';
import { LEAD_STATUSES, LEAD_STATUS_LABELS, PRIORITY_COLORS } from './constants';
import { useLeadsLogic } from './hooks/useLogic';

export default function LeadsModule() {
  const { canAccess } = useAuthStore();
  const canRead = canAccess('CRM_LEADS','read');
  const { leads, total, dash, isLoading, filter, canCreate, canUpdate, canDelete,
          handleNew, handleEdit, handleDelete, setStatus } = useLeadsLogic();
  if (!canRead) return <AccessDenied />;

  const cols: ColumnDef<TLead>[] = [
    { accessorKey:'leadName',    header:'Name',    cell:({getValue})=><span className="font-semibold" style={{color:'var(--text-primary)'}}>{getValue() as string}</span> },
    { accessorKey:'company',     header:'Company', cell:({getValue})=><span style={{color:'var(--text-secondary)'}}>{(getValue() as string)||'—'}</span> },
    { accessorKey:'phone',       header:'Phone',   cell:({getValue})=><span className="font-mono">{(getValue() as string)||'—'}</span> },
    { accessorKey:'priority',    header:'Priority',
      cell:({getValue})=>{
        const p=getValue() as string;
        return <span className={`text-xs font-semibold ${PRIORITY_COLORS[p]||'text-gray-400'}`}>{p||'—'}</span>;
      }},
    { accessorKey:'expectedValue',header:'Value',  cell:({getValue})=><span className="font-mono">{fmt.currency((getValue() as number)||0)}</span> },
    { accessorKey:'status',      header:'Status',  cell:({getValue})=><StatusBadge status={getValue() as string}/> },
    { accessorKey:'assignedToName',header:'Assigned',cell:({getValue})=><span style={{color:'var(--text-muted)'}}>{(getValue() as string)||'—'}</span> },
    { id:'actions', header:'',
      cell:({row})=>(
        <div className="flex gap-1" onClick={e=>e.stopPropagation()}>
          {canUpdate && <button onClick={()=>handleEdit(row.original)} className="btn-ghost btn-icon btn-sm"><Edit className="w-3.5 h-3.5"/></button>}
          {canDelete && <button onClick={()=>handleDelete(row.original.leadId)} className="btn-ghost btn-icon btn-sm text-red-400"><Trash2 className="w-3.5 h-3.5"/></button>}
        </div>
      )},
  ];

  return (
    <div>
      <PageHeader title="Leads" subtitle={`${total} leads`} crumbs={[{label:'CRM'},{label:'Leads'}]}
        actions={canCreate ? <button onClick={handleNew} className="btn-primary"><Plus className="w-4 h-4"/>New Lead</button> : undefined}/>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          {t:'Total Leads', v:String(dash?.totalLeads??0),              I:Users,     c:'text-brand'},
          {t:'Pipeline',    v:fmt.currency(dash?.totalPipelineValue??0), I:TrendingUp,c:'text-yellow-400'},
          {t:'Won',         v:String(dash?.wonLeads??0),                 I:Trophy,    c:'text-green-400'},
          {t:'Conversion',  v:`${(dash?.conversionRate??0).toFixed(1)}%`,I:Target,    c:'text-purple-400'},
        ].map(({t,v,c,I})=>(
          <div key={t} className="glass-card p-4">
            <div className="flex justify-between mb-2"><span className="text-xs" style={{color:'var(--text-muted)'}}>{t}</span><I className={`w-4 h-4 ${c}`}/></div>
            <div className="text-xl font-bold" style={{color:'var(--text-primary)'}}>{v}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-1 p-1 rounded-xl mb-4 w-fit" style={{background:'var(--hover)'}}>
        {LEAD_STATUSES.map(s=>(
          <button key={s||'all'} onClick={()=>setStatus(s)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{ background: filter.status===s?'var(--brand)':'transparent', color: filter.status===s?'#fff':'var(--text-secondary)' }}>
            {LEAD_STATUS_LABELS[s]}
          </button>
        ))}
      </div>
      <DataTable data={leads} columns={cols} loading={isLoading}
        searchPlaceholder="Search leads…" emptyMsg="No leads found."/>
    </div>
  );
}
