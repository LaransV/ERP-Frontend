"use client";
import { useAuthStore } from '@/store/authStore';
import { Plus, CheckCircle, Trash2 } from 'lucide-react';
import { PageHeader, DataTable, StatusBadge, AccessDenied } from '@/components/shared';
import { fmt } from '@/lib/utils';
import type { ColumnDef } from '@tanstack/react-table';
import type { TPO } from '@/schemas/inventory/response';
import { useOrdersLogic } from './hooks/useLogic';

export default function OrdersModule() {
  const { canAccess } = useAuthStore();
  const canRead = canAccess('INV_PURCHASE_ORDERS','read');
  const { orders, total, isLoading, canCreate, canUpdate, canDelete,
          handleApprove, handleDelete, setOpen } = useOrdersLogic();
  if (!canRead) return <AccessDenied />;

  const cols: ColumnDef<TPO>[] = [
    { accessorKey:'poNumber',    header:'PO #',     cell:({getValue})=><span className="font-mono text-sm font-semibold" style={{color:'var(--brand)'}}>{getValue() as string}</span> },
    { accessorKey:'vendorName',  header:'Vendor',   cell:({getValue})=><span className="font-semibold" style={{color:'var(--text-primary)'}}>{(getValue() as string)||'—'}</span> },
    { accessorKey:'poDate',      header:'Date',     cell:({getValue})=><span style={{color:'var(--text-secondary)'}}>{fmt.date(getValue() as string)}</span> },
    { accessorKey:'expectedDate',header:'Expected', cell:({getValue})=><span style={{color:'var(--text-muted)'}}>{getValue() as string ? fmt.date(getValue() as string) : '—'}</span> },
    { accessorKey:'totalAmount', header:'Amount',   cell:({getValue})=><span className="font-mono font-semibold">{fmt.currency(getValue() as number)}</span> },
    { accessorKey:'status',      header:'Status',   cell:({getValue})=><StatusBadge status={getValue() as string}/> },
    { id:'actions', header:'',
      cell:({row})=>(
        <div className="flex gap-1" onClick={e=>e.stopPropagation()}>
          {canUpdate && row.original.status==='SENT' &&
            <button onClick={()=>handleApprove(row.original.poId)} className="btn-sm btn-primary text-xs gap-1"><CheckCircle className="w-3 h-3"/>Approve</button>}
          {canDelete && row.original.status==='DRAFT' &&
            <button onClick={()=>handleDelete(row.original.poId)} className="btn-ghost btn-icon btn-sm text-red-400"><Trash2 className="w-3.5 h-3.5"/></button>}
        </div>
      )},
  ];

  return (
    <div>
      <PageHeader title="Purchase Orders" subtitle={`${total} orders`}
        crumbs={[{label:'Inventory'},{label:'Purchase Orders'}]}
        actions={canCreate ? <button onClick={()=>setOpen(true)} className="btn-primary"><Plus className="w-4 h-4"/>New PO</button> : undefined}/>
      <DataTable data={orders} columns={cols} loading={isLoading}
        searchPlaceholder="Search PO…" emptyMsg="No purchase orders found."/>
    </div>
  );
}
