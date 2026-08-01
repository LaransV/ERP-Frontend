"use client";
import { PageHeader, DataTable, AccessDenied } from '@/components/shared';
import { fmt } from '@/lib/utils';
import type { ColumnDef } from '@tanstack/react-table';
import type { TMovement } from '@/schemas/inventory/response';
import { useMovementsLogic } from './hooks/useLogic';

export default function MovementsModule() {
  const { movements, total, isLoading, canRead } = useMovementsLogic();
  if (!canRead) return <AccessDenied />;

  const cols: ColumnDef<TMovement>[] = [
    { accessorKey:'movementType', header:'Type',
      cell:({getValue})=>{
        const t=getValue() as string;
        const c=t==='PURCHASE'?'text-green-400':t==='SALE'?'text-blue-400':t==='ADJUSTMENT'?'text-yellow-400':'text-gray-400';
        return <span className={`text-xs font-semibold ${c}`}>{t}</span>;
      }},
    { accessorKey:'productName',  header:'Product',  cell:({getValue})=><span className="font-semibold" style={{color:'var(--text-primary)'}}>{getValue() as string}</span> },
    { accessorKey:'quantity',     header:'Qty',      cell:({getValue})=><span className="font-mono">{getValue() as number}</span> },
    { accessorKey:'totalValue',   header:'Value',    cell:({getValue})=><span className="font-mono">{fmt.currency((getValue() as number)??0)}</span> },
    { accessorKey:'movementDate', header:'Date',     cell:({getValue})=><span style={{color:'var(--text-secondary)'}}>{fmt.date(getValue() as string)}</span> },
    { accessorKey:'reference',    header:'Reference',cell:({getValue})=><span className="font-mono text-xs">{(getValue() as string)||'—'}</span> },
  ];

  return (
    <div>
      <PageHeader title="Stock Movements" subtitle={`${total} movements`} crumbs={[{label:'Inventory'},{label:'Movements'}]}/>
      <DataTable data={movements} columns={cols} loading={isLoading}
        searchPlaceholder="Search movements…" emptyMsg="No movements found."/>
    </div>
  );
}
