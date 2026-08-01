"use client";
import { useAuthStore } from '@/store/authStore';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { PageHeader, DataTable, AccessDenied } from '@/components/shared';
import { fmt } from '@/lib/utils';
import type { ColumnDef } from '@tanstack/react-table';
import type { TProduct } from '@/schemas/finance/response';
import { useProductsLogic } from './hooks/useLogic';
import { ProductModal } from './components/ProductModal';

export default function ProductsModule() {
  const { canAccess } = useAuthStore();
  const canRead = canAccess('FINANCE_PRODUCTS','read');
  const { products, total, isLoading, editing, open, isSaving, canCreate, canUpdate, canDelete,
          handleNew, handleEdit, handleDelete, handleClose, handleSave, } = useProductsLogic();

  if (!canRead) return <AccessDenied />;

  const cols: ColumnDef<TProduct>[] = [
    { accessorKey:'productName',  header:'Product',
      cell:({getValue})=><span>{getValue() as string}</span> },
    { accessorKey:'productCode',  header:'Code',
      cell:({getValue})=><span>{(getValue() as string)||'—'}</span> },
    { accessorKey:'productType',  header:'Type',
      cell:({getValue})=><span>{getValue() as string}</span> },
    { accessorKey:'unit',         header:'Unit',  cell:({getValue})=><span>{getValue() as string}</span> },
    { accessorKey:'taxRate',      header:'GST%',  cell:({getValue})=><span>{getValue() as number}%</span> },
    { accessorKey:'salePrice',    header:'Sale Price',
      cell:({getValue})=><span>{fmt.currency(getValue() as number)}</span> },
    { id:'actions', header:'', size: 20, minSize: 20, maxSize: 20,
      cell:({row})=>(
        <div className="flex gap-1" onClick={e=>e.stopPropagation()}>
          {canUpdate && <button onClick={()=>handleEdit(row.original)} className="btn-ghost btn-icon btn-sm"><Edit className="w-3.5 h-3.5"/></button>}
          {canDelete && <button onClick={()=>handleDelete(row.original)} className="btn-ghost btn-icon btn-sm text-red-400"><Trash2 className="w-3.5 h-3.5"/></button>}
        </div>
      )},
  ];

  return (
    <div>
      <PageHeader title="Products & Services" subtitle={`${total} items`}
        crumbs={[{label:'Finance'},{label:'Products'}]}
        actions={canCreate ? <button onClick={handleNew} className="btn-primary"><Plus className="w-4 h-4"/>New Product</button> : undefined}/>
      <DataTable data={products} columns={cols} loading={isLoading}
        searchPlaceholder="Search products…" emptyMsg="No products found."/>

        {/* ── Product Modal ── */}
      <ProductModal
        open={open}
        editing={editing}
        isSaving={isSaving}
        onClose={handleClose}
        onSave={handleSave}
      />
    </div>
  );
}
