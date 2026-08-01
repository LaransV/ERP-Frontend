"use client";
import { useAuthStore } from '@/store/authStore';
import { Plus, Trash2 } from 'lucide-react';
import { PageHeader, DataTable, StatusBadge, AccessDenied } from '@/components/shared';
import type { ColumnDef } from '@tanstack/react-table';
import type { TActivity } from '@/schemas/crm/response';
import { ACT_COLORS } from './constants';
import { useActivitiesLogic } from './hooks/useLogic';

export default function ActivitiesModule() {
  const { canAccess } = useAuthStore();
  const canRead = canAccess('CRM_ACTIVITIES','read');
  const { activities, total, isLoading, canCreate, canDelete,
          handleNew, handleDelete } = useActivitiesLogic();
  if (!canRead) return <AccessDenied />;

  const cols: ColumnDef<TActivity>[] = [
    { accessorKey:'activityType', header:'Type',
      cell:({getValue})=>{ const t=getValue() as string; return <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{background:`${ACT_COLORS[t]}20`,color:ACT_COLORS[t]}}>{t}</span>; }},
    { accessorKey:'title',        header:'Title',    cell:({getValue})=><span className="font-semibold" style={{color:'var(--text-primary)'}}>{(getValue() as string)||'—'}</span> },
    { accessorKey:'leadName',     header:'Lead',     cell:({getValue})=><span style={{color:'var(--text-secondary)'}}>{(getValue() as string)||'—'}</span> },
    { accessorKey:'description',  header:'Notes',    cell:({getValue})=><span className="text-xs line-clamp-1" style={{color:'var(--text-muted)'}}>{(getValue() as string)||'—'}</span> },
    { accessorKey:'activityDate', header:'Date',     cell:({getValue})=><span style={{color:'var(--text-secondary)'}}>{(getValue() as string)||'—'}</span> },
    { accessorKey:'status',       header:'Status',   cell:({getValue})=><StatusBadge status={(getValue() as string)||'OPEN'}/> },
    { id:'actions', header:'',
      cell:({row})=>(
        <div className="flex gap-1" onClick={e=>e.stopPropagation()}>
          {canDelete && <button onClick={()=>handleDelete(row.original.activityId)} className="btn-ghost btn-icon btn-sm text-red-400"><Trash2 className="w-3.5 h-3.5"/></button>}
        </div>
      )},
  ];

  return (
    <div>
      <PageHeader title="Activities" subtitle={`${total} activities`}
        crumbs={[{label:'CRM'},{label:'Activities'}]}
        actions={canCreate ? <button onClick={handleNew} className="btn-primary"><Plus className="w-4 h-4"/>Log Activity</button> : undefined}/>
      <DataTable data={activities} columns={cols} loading={isLoading}
        searchPlaceholder="Search activities…" emptyMsg="No activities logged yet."/>
    </div>
  );
}
