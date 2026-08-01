"use client";
import { Plus, Download, Edit, Trash2, DollarSign, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { PageHeader, DataTable, StatusBadge, AccessDenied } from '@/components/shared';
import { fmt } from '@/lib/utils';
import type { ColumnDef } from '@tanstack/react-table';
import type { TInvoice } from '@/schemas/finance/response';
import { STATUS_OPTS, STATUS_LABELS } from './constants';
import { useInvoicesLogic } from './hooks/useLogic';

export default function InvoicesModule() {
  const { invoices, total, dash, isLoading, filters, canRead, canCreate, canDelete,
          setStatus, goNew, goEdit, handleDelete, handlePdf } = useInvoicesLogic();

  if (!canRead) return <AccessDenied />;

  const cols: ColumnDef<TInvoice>[] = [
    { accessorKey:'invoiceNumber', header:'Invoice No',
      cell:({getValue})=><span>{getValue() as string}</span> },
    { accessorKey:'clientName', header:'Client',
      cell:({getValue})=><span>{getValue() as string}</span> },
    { accessorKey:'invoiceDate', header:'Date',
      cell:({getValue})=><span>{fmt.date(getValue() as string)}</span> },
    { accessorKey:'grandTotal', header:'Amount',
      cell:({getValue})=><span>{fmt.currency(getValue() as number)}</span> },
    { accessorKey:'balanceAmount', header:'Balance',
      cell:({getValue})=>{ const v=getValue() as number; return <span >{fmt.currency(v)}</span>; } },
    { accessorKey:'status', header:'Status', cell:({getValue})=><StatusBadge status={getValue() as string}/> },
    { id:'actions', header:'',
      cell:({row})=>(
        <div className="flex gap-1" onClick={e=>e.stopPropagation()}>
          <button onClick={()=>handlePdf(row.original.invoiceId,row.original.invoiceNumber)} className="btn-ghost btn-icon btn-sm" title="PDF"><Download className="w-3.5 h-3.5"/></button>
          <button onClick={()=>goEdit(row.original.invoiceId)} className="btn-ghost btn-icon btn-sm" title="Edit"><Edit className="w-3.5 h-3.5"/></button>
          {canDelete && row.original.status!=='PAID' &&
            <button onClick={()=>handleDelete(row.original.invoiceId)} className="btn-ghost btn-icon btn-sm text-red-400 hover:bg-red-500/10"><Trash2 className="w-3.5 h-3.5"/></button>}
        </div>
      )},
  ];

  return (
    <div>
      <PageHeader title="Invoices" subtitle={`${total} total`} crumbs={[{label:'Finance'},{label:'Invoices'}]}
        actions={canCreate ? <button onClick={goNew} className="btn-primary"><Plus className="w-4 h-4"/>New Invoice</button> : undefined}/>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          {t:'Due',    v:fmt.currency(dash?.dueAmount??0),     s:`${dash?.dueCount??0} inv`,    I:Clock,        c:'text-yellow-400'},
          {t:'Overdue',v:fmt.currency(dash?.overdueAmount??0), s:`${dash?.overdueCount??0} inv`, I:AlertCircle,  c:'text-red-400'},
          {t:'Paid',   v:fmt.currency(dash?.paidAmount??0),    s:`${dash?.paidCount??0} inv`,   I:CheckCircle,  c:'text-green-400'},
          {t:'Revenue',v:fmt.currency(dash?.totalRevenue??0),  s:'All time',                    I:DollarSign,   c:'text-brand'},
        ].map(({t,v,s,I,c})=>(
          <div key={t} className="glass-card p-4">
            <div className="flex justify-between mb-2"><span className="text-xs" style={{color:'var(--text-muted)'}}>{t}</span><I className={`w-4 h-4 ${c}`}/></div>
            <div className="text-lg font-bold" style={{color:'var(--text-primary)'}}>{v}</div>
            <div className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>{s}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-1 p-1 rounded-xl mb-4 w-fit" style={{background:'var(--hover)'}}>
        {STATUS_OPTS.map(s=>(
          <button key={s||'all'} onClick={()=>setStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filters.status===s?'bg-brand text-white shadow-sm':'text-muted hover:text-primary'}`}
            style={{color: filters.status===s ? '#fff' : 'var(--text-secondary)'}}>
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>
      <DataTable data={invoices} columns={cols} loading={isLoading}
        onRowClick={inv=>goEdit(inv.invoiceId)} searchPlaceholder="Search invoices…"
        emptyMsg="No invoices found. Create your first invoice!"/>
    </div>
  );
}
