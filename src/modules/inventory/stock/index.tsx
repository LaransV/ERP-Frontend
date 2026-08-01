"use client";
import { Package, AlertTriangle, TrendingDown, DollarSign } from 'lucide-react';
import { PageHeader, DataTable, AccessDenied } from '@/components/shared';
import { fmt } from '@/lib/utils';
import type { ColumnDef } from '@tanstack/react-table';
import type { TStockItem } from '@/schemas/inventory/response';
import { useStockLogic } from './hooks/useLogic';

export default function StockModule() {
  const { stock, total, dash, isLoading, canRead } = useStockLogic();
  if (!canRead) return <AccessDenied />;

  const cols: ColumnDef<TStockItem>[] = [
    { accessorKey:'productCode',   header:'Code',    cell:({getValue})=><span className="font-mono text-xs" style={{color:'var(--brand)'}}>{(getValue() as string)||'—'}</span> },
    { accessorKey:'productName',   header:'Product', cell:({getValue})=><span className="font-semibold" style={{color:'var(--text-primary)'}}>{getValue() as string}</span> },
    { accessorKey:'categoryName',  header:'Category',cell:({getValue})=><span style={{color:'var(--text-muted)'}}>{(getValue() as string)||'—'}</span> },
    { accessorKey:'unit',          header:'Unit',    cell:({getValue})=><span style={{color:'var(--text-muted)'}}>{getValue() as string}</span> },
    { accessorKey:'currentStock',  header:'Stock',
      cell:({getValue,row})=>{
        const v=getValue() as number, r=row.original.reorderLevel??0;
        return <span className={`font-mono font-semibold ${v<=r?'text-red-400':''}`}>{v}{v<=r&&<AlertTriangle className="inline w-3 h-3 ml-1 text-red-400"/>}</span>;
      }},
    { accessorKey:'reorderLevel',  header:'Reorder', cell:({getValue})=><span className="font-mono text-xs" style={{color:'var(--text-muted)'}}>{(getValue() as number)??'—'}</span> },
    { accessorKey:'stockValue',    header:'Value',   cell:({getValue})=><span className="font-mono">{fmt.currency((getValue() as number)??0)}</span> },
  ];

  return (
    <div>
      <PageHeader title="Stock" subtitle={`${total} items`} crumbs={[{label:'Inventory'},{label:'Stock'}]}/>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          {t:'Total Items',  v:String(dash?.totalItems??0),           c:'text-brand',     I:Package},
          {t:'Total Value',  v:fmt.currency(dash?.totalStockValue??0), c:'text-green-400', I:DollarSign},
          {t:'Low Stock',    v:String(dash?.lowStockCount??0),         c:'text-yellow-400',I:AlertTriangle},
          {t:'Out of Stock', v:String(dash?.outOfStockCount??0),       c:'text-red-400',   I:TrendingDown},
        ].map(({t,v,c,I})=>(
          <div key={t} className="glass-card p-4">
            <div className="flex justify-between mb-2"><span className="text-xs" style={{color:'var(--text-muted)'}}>{t}</span><I className={`w-4 h-4 ${c}`}/></div>
            <div className="text-xl font-bold" style={{color:'var(--text-primary)'}}>{v}</div>
          </div>
        ))}
      </div>
      <DataTable data={stock} columns={cols} loading={isLoading}
        searchPlaceholder="Search products…" emptyMsg="No stock found."/>
    </div>
  );
}
