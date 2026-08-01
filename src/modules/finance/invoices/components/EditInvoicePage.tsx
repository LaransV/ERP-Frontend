"use client";
import { useEffect } from 'react';
import { useInvoiceFormLogic } from '@/modules/finance/invoices/hooks/useLogic';
import { InvoiceForm } from '@/modules/finance/invoices/components/InvoiceForm';
import { useQuery } from '@/hooks/useQuery';
import { getInvoiceById } from '@/services/api/finance';
import { InvoiceRes } from '@/schemas/finance/response';

interface Props { invoiceId: number; }

export default function EditInvoicePage({ invoiceId }: Props) {
  const {
    isSaving, save, goBack, setEditing, editing,
    clients, products, dispatchAddresses, shipToAddresses,
    addDispatchAddress, isSavingDispatch,
    addShipToAddress, isSavingShipTo,
  } = useInvoiceFormLogic(invoiceId);

  const { data, isLoading } = useQuery({
    apiConfig: getInvoiceById,
    responseSchema: InvoiceRes,
    parameters: { id: invoiceId },
  });

  useEffect(() => {
    if (data?.data) setEditing(data.data as any);
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading…</span>
      </div>
    );
  }

  return (
    <InvoiceForm
      editing={editing}
      isSaving={isSaving}
      onBack={goBack}
      onSave={data => save(data as any)}
      clients={clients as any}
      products={products as any}
      dispatchAddresses={dispatchAddresses as any}
      shipToAddresses={shipToAddresses as any}
      onAddDispatchAddress={data => addDispatchAddress(data as any)}
      isSavingDispatch={isSavingDispatch}
      onAddShipToAddress={data => addShipToAddress(data as any)}
      isSavingShipTo={isSavingShipTo}
    />
  );
}
