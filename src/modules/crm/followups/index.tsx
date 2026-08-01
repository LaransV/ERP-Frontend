"use client";
import { useAuthStore } from '@/store/authStore';
import { Plus, Phone, Mail, MapPin, CheckCircle, Trash2 } from 'lucide-react';
import { PageHeader, DataTable, StatusBadge, AccessDenied } from '@/components/shared';
import type { ColumnDef } from '@tanstack/react-table';
import type { TFollowup } from '@/schemas/crm/response';
import { useFollowupsLogic } from './hooks/useLogic';

const TYPE_ICONS: Record<string,any> = { CALL:Phone, EMAIL:Mail, VISIT:MapPin };

export default function FollowupsModule() {
  const { canAccess } = useAuthStore();
  const canRead = canAccess('CRM_FOLLOWUPS','read');
  const { followups, total, isLoading, canCreate, canUpdate, canDelete,
          handleNew, handleEdit, handleDelete, handleComplete } = useFollowupsLogic();
  if (!canRead) return <AccessDenied />;

  const cols: ColumnDef<TFollowup>[] = [
    { accessorKey:'leadName',     header:'Lead',    cell:({getValue})=><span className="font-semibold" style={{color:'var(--text-primary)'}}>{(getValue() as string)||'—'}</span> },
    { accessorKey:'followupType', header:'Type',
      cell:({getValue})=>{ const t=getValue() as string; const I=TYPE_ICONS[t]; return <span className="flex items-center gap-1.5 text-xs font-semibold">{I&&<I className="w-3.5 h-3.5"/>}{t}</span>; }},
    { accessorKey:'scheduledAt',  header:'Scheduled',cell:({getValue})=><span style={{color:'var(--text-secondary)'}}>{new Date(getValue() as string).toLocaleString()}</span> },
    { accessorKey:'notes',        header:'Notes',   cell:({getValue})=><span className="text-xs line-clamp-1" style={{color:'var(--text-muted)'}}>{getValue() as string}</span> },
    { accessorKey:'status',       header:'Status',  cell:({getValue})=><StatusBadge status={getValue() as string}/> },
    { id:'actions', header:'',
      cell:({row})=>(
        <div className="flex gap-1" onClick={e=>e.stopPropagation()}>
          {canUpdate && row.original.status==='PENDING' &&
            <button onClick={()=>handleComplete(row.original.followupId)} className="btn-sm btn-primary text-xs gap-1"><CheckCircle className="w-3 h-3"/>Done</button>}
          {canUpdate && <button onClick={()=>handleEdit(row.original)} className="btn-ghost btn-icon btn-sm"><Phone className="w-3.5 h-3.5"/></button>}
          {canDelete && <button onClick={()=>handleDelete(row.original.followupId)} className="btn-ghost btn-icon btn-sm text-red-400"><Trash2 className="w-3.5 h-3.5"/></button>}
        </div>
      )},
  ];

  return (
    <div>
      <PageHeader title="Follow-ups" subtitle={`${total} followups`}
        crumbs={[{label:'CRM'},{label:'Follow-ups'}]}
        actions={canCreate ? <button onClick={handleNew} className="btn-primary"><Plus className="w-4 h-4"/>Schedule</button> : undefined}/>
      <DataTable data={followups} columns={cols} loading={isLoading}
        searchPlaceholder="Search followups…" emptyMsg="No followups scheduled."/>
    </div>
  );
}
