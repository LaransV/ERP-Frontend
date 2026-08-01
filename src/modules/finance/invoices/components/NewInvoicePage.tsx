"use client";
import { useInvoiceFormLogic } from '@/modules/finance/invoices/hooks/useLogic';
import { InvoiceForm } from '@/modules/finance/invoices/components/InvoiceForm';

export default function NewInvoicePage() {
  const {
    isSaving, save, goBack,
    clients, products, dispatchAddresses, shipToAddresses,
    addDispatchAddress, isSavingDispatch,
    addShipToAddress, isSavingShipTo,
  } = useInvoiceFormLogic();

  return (
    <InvoiceForm
      editing={null}
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
