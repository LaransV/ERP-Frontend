"use client";
import { useEffect, useState } from 'react';
import { useFieldArray, Controller } from 'react-hook-form';
import { Loader2, Save, ChevronLeft, Plus, Trash2 } from 'lucide-react';
import { FormField, PageHeader, AuditBar, Modal } from '@/components/shared';
import { INDIAN_STATES, CURRENCIES } from '@/modules/finance/clients/constants';
import { useInvoiceForm } from '@/modules/finance/invoices/hooks/useFormHandle';
import { useDispatchAddressForm, useShipToAddressForm } from '@/modules/finance/invoices/hooks/useFormHandle';
import type { TInvoice } from '@/schemas/finance/response';
import type { TInvoiceReq, TDispatchAddressReq, TShipToAddressReq } from '@/schemas/finance/request';

type Tab = 'basic' | 'dispatch' | 'shipto';

interface Client { clientId:number; clientName:string; }
interface Product { productId:number; productName:string; unit:string; salePrice:number; taxRate:number; hsnCode?:string|null; }
interface AddressOpt { [key:string]: any; }

interface InvoiceFormProps {
  editing:  TInvoice | null;
  isSaving: boolean;
  onBack:   () => void;
  onSave:   (data: TInvoiceReq) => void;
  clients:  Client[];
  products: Product[];
  dispatchAddresses: AddressOpt[];
  shipToAddresses:   AddressOpt[];
  onAddDispatchAddress: (data: TDispatchAddressReq) => void;
  isSavingDispatch: boolean;
  onAddShipToAddress: (data: TShipToAddressReq) => void;
  isSavingShipTo: boolean;
}

export function InvoiceForm({
  editing, isSaving, onBack, onSave,
  clients, products, dispatchAddresses, shipToAddresses,
  onAddDispatchAddress, isSavingDispatch,
  onAddShipToAddress, isSavingShipTo,
}: InvoiceFormProps) {
  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useInvoiceForm();
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const [tab, setTab] = useState<Tab>('basic');
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showShipToModal, setShowShipToModal] = useState(false);

  const items = watch('items') || [];
  const isInterstate = watch('interstate') || false;

  useEffect(() => {
    if (editing) {
      reset({
        clientId: editing.clientId, invoiceDate: editing.invoiceDate?.slice(0,10) ?? '',
        dueDate: editing.dueDate?.slice(0,10) ?? '', notes: editing.notes ?? '', terms: editing.terms ?? '',
        items: (editing.items ?? []).map(i => ({
          productId: i.productId ?? 0, productName: i.productName ?? '', hsnCode: i.hsnCode ?? '',
          quantity: i.quantity, unit: i.unit ?? '', unitPrice: i.unitPrice,
          discountPct: i.discountPct ?? 0, discountAmount: i.discountAmount ?? 0,
          taxableAmount: i.taxableAmount ?? 0,
          cgstRate: i.cgstRate ?? 0, cgstAmount: i.cgstAmount ?? 0,
          sgstRate: i.sgstRate ?? 0, sgstAmount: i.sgstAmount ?? 0,
          igstRate: i.igstRate ?? 0, igstAmount: i.igstAmount ?? 0,
          totalAmount: i.totalAmount ?? 0,
        })),
        interstate: editing.isInterstate ?? false,
        supplierRefNo: editing.supplierRefNo ?? '', eWayBillNo: editing.eWayBillNo ?? '',
        generateEWayBill: editing.generateEWayBill ?? false,
        dcNo: editing.dcNo ?? '', dcDate: editing.dcDate?.slice(0,10) ?? '', selectDc: editing.selectDc ?? 'MANUAL',
        vehicleNo: editing.vehicleNo ?? '', lrNo: editing.lrNo ?? '', distance: editing.distance ?? undefined,
        transporterId: editing.transporterId ?? '', delThrough: editing.delThrough ?? '', delDestn: editing.delDestn ?? '',
        orderNo: editing.orderNo ?? '', orderDate: editing.orderDate?.slice(0,10) ?? '', soNo: editing.soNo ?? '',
        currency: editing.currency ?? 'INR',
        dispatchAddressId: editing.dispatchAddressId ?? undefined,
        shipToAddressId: editing.shipToAddressId ?? undefined,
      } as any);
    } else {
      reset({
        clientId: 0, invoiceDate: new Date().toISOString().slice(0,10), dueDate: '', notes: '', terms: '',
        items: [], interstate: false, currency: 'INR', selectDc: 'MANUAL',
      } as any);
    }
  }, [editing, reset]);

  // ── Per-item tax calculation ───────────────────────────────
  const recalcItem = (idx: number) => {
    const it = items[idx]; if (!it) return;
    const qty = Number(it.quantity) || 0, price = Number(it.unitPrice) || 0;
    const gross = qty * price;
    const discAmt = gross * (Number(it.discountPct) || 0) / 100;
    const taxable = gross - discAmt;
    const product = products.find(p => p.productId === Number(it.productId));
    const rate = product?.taxRate ?? 0;
    let cgstAmt = 0, sgstAmt = 0, igstAmt = 0;
    if (isInterstate) igstAmt = taxable * rate / 100;
    else { cgstAmt = taxable * (rate/2) / 100; sgstAmt = taxable * (rate/2) / 100; }
    const total = taxable + cgstAmt + sgstAmt + igstAmt;
    setValue(`items.${idx}.discountAmount` as any, Number(discAmt.toFixed(2)));
    setValue(`items.${idx}.taxableAmount` as any, Number(taxable.toFixed(2)));
    setValue(`items.${idx}.cgstRate` as any, isInterstate ? 0 : rate/2);
    setValue(`items.${idx}.cgstAmount` as any, Number(cgstAmt.toFixed(2)));
    setValue(`items.${idx}.sgstRate` as any, isInterstate ? 0 : rate/2);
    setValue(`items.${idx}.sgstAmount` as any, Number(sgstAmt.toFixed(2)));
    setValue(`items.${idx}.igstRate` as any, isInterstate ? rate : 0);
    setValue(`items.${idx}.igstAmount` as any, Number(igstAmt.toFixed(2)));
    setValue(`items.${idx}.totalAmount` as any, Number(total.toFixed(2)));
  };

  const onProductChange = (idx: number, productId: number) => {
    const p = products.find(pp => pp.productId === productId);
    setValue(`items.${idx}.productId` as any, productId);
    setValue(`items.${idx}.productName` as any, p?.productName ?? '');
    setValue(`items.${idx}.hsnCode` as any, p?.hsnCode ?? '');
    setValue(`items.${idx}.unit` as any, p?.unit ?? '');
    setValue(`items.${idx}.unitPrice` as any, p?.salePrice ?? 0);
    setTimeout(() => recalcItem(idx), 0);
  };

  const totals = items.reduce((acc:any, it:any) => ({
    subtotal: acc.subtotal + (Number(it.quantity)||0)*(Number(it.unitPrice)||0),
    discount: acc.discount + (Number(it.discountAmount)||0),
    cgst: acc.cgst + (Number(it.cgstAmount)||0),
    sgst: acc.sgst + (Number(it.sgstAmount)||0),
    igst: acc.igst + (Number(it.igstAmount)||0),
    grand: acc.grand + (Number(it.totalAmount)||0),
  }), { subtotal:0, discount:0, cgst:0, sgst:0, igst:0, grand:0 });

  const onSubmit = (data: TInvoiceReq) => onSave({
    ...data,
    subtotal: totals.subtotal, discountAmount: totals.discount,
    taxableAmount: totals.subtotal - totals.discount,
    cgstTotal: totals.cgst, sgstTotal: totals.sgst, igstTotal: totals.igst,
    taxTotal: totals.cgst + totals.sgst + totals.igst,
    grandTotal: totals.grand,
  });

  const crumbs = [
    { label: 'Sales' }, { label: 'Invoices', href: '/finance/invoices' },
    { label: editing ? 'Edit Invoice' : 'New Invoice' },
  ];

  const tabBtn = (t: Tab, label: string) => (
    <button type="button" onClick={() => setTab(t)}
      className={`px-4 py-2 text-sm font-medium border-b-2 ${tab===t ? 'border-brand text-brand' : 'border-transparent text-text-muted'}`}>
      {label}
    </button>
  );

  return (
    <div>
      <PageHeader
        title={<div className="flex items-center gap-1 cursor-pointer" onClick={onBack}><ChevronLeft className="w-6 h-6" />Invoice Details</div>}
        crumbs={crumbs}
        actions={
          <button form="invoice-form" type="submit" disabled={isSaving} className="btn-primary flex items-center gap-2">
            {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> {editing ? 'Update' : 'Save'}</>}
          </button>
        }
      />

      {editing && (
        <AuditBar createdBy={(editing as any).createdBy} createdDate={editing.createdAt} />
      )}

      <form id="invoice-form" onSubmit={handleSubmit(onSubmit)} noValidate>

        {/* ── Tabs ── */}
        <div className="flex gap-2 border-b border-bg-border mb-5">
          {tabBtn('basic','Basic Info')}
          {tabBtn('dispatch','Dispatch From')}
          {tabBtn('shipto','Ship To')}
        </div>

        {/* ── Basic Info tab ── */}
        {tab === 'basic' && (
          <div className="glass-card p-6 mb-5">
            <div className="grid grid-cols-4 gap-4 mb-4">
              <FormField label="Client Name" error={errors.clientId?.message} required>
                <Controller name="clientId" control={control} render={({ field }) => (
                  <select {...field} onChange={e=>field.onChange(Number(e.target.value))} className="field-input w-full">
                    <option value={0}>Select Client</option>
                    {clients.map(c => <option key={c.clientId} value={c.clientId}>{c.clientName}</option>)}
                  </select>
                )} />
              </FormField>
              <FormField label="Invoice Date" error={errors.invoiceDate?.message} required>
                <input {...register('invoiceDate')} type="date" className="field-input w-full" />
              </FormField>
              <FormField label="Due Date" error={errors.dueDate?.message} required>
                <input {...register('dueDate')} type="date" className="field-input w-full" />
              </FormField>
              <FormField label="Currency" error={(errors as any).currency?.message}>
                <Controller name="currency" control={control} render={({ field }) => (
                  <select {...field} className="field-input w-full">
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                )} />
              </FormField>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <FormField label="Supplier Ref. No." error={(errors as any).supplierRefNo?.message}>
                <input {...register('supplierRefNo')} className="field-input w-full" />
              </FormField>
              <FormField label="E Way Bill No." error={(errors as any).eWayBillNo?.message}>
                <input {...register('eWayBillNo')} className="field-input w-full" />
              </FormField>
              <FormField label="DC No." error={(errors as any).dcNo?.message}>
                <input {...register('dcNo')} className="field-input w-full" />
              </FormField>
              <FormField label="DC Date" error={(errors as any).dcDate?.message}>
                <input {...register('dcDate')} type="date" className="field-input w-full" />
              </FormField>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <FormField label="Vehicle No." error={(errors as any).vehicleNo?.message}>
                <input {...register('vehicleNo')} className="field-input w-full" />
              </FormField>
              <FormField label="LR No." error={(errors as any).lrNo?.message}>
                <input {...register('lrNo')} className="field-input w-full" />
              </FormField>
              <FormField label="Distance" error={(errors as any).distance?.message}>
                <input {...register('distance', { valueAsNumber: true })} type="number" className="field-input w-full" />
              </FormField>
              <FormField label="Transporter ID" error={(errors as any).transporterId?.message}>
                <input {...register('transporterId')} className="field-input w-full" />
              </FormField>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <FormField label="Del. Through" error={(errors as any).delThrough?.message}>
                <input {...register('delThrough')} className="field-input w-full" />
              </FormField>
              <FormField label="Del. Destn." error={(errors as any).delDestn?.message}>
                <input {...register('delDestn')} className="field-input w-full" />
              </FormField>
              <FormField label="Order No." error={(errors as any).orderNo?.message}>
                <input {...register('orderNo')} className="field-input w-full" />
              </FormField>
              <FormField label="Order Date" error={(errors as any).orderDate?.message}>
                <input {...register('orderDate')} type="date" className="field-input w-full" />
              </FormField>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <FormField label="SO No." error={(errors as any).soNo?.message}>
                <input {...register('soNo')} className="field-input w-full" />
              </FormField>
              <FormField label="Interstate?" error={(errors as any).interstate?.message}>
                <label className="flex items-center gap-2 h-10">
                  <input type="checkbox" {...register('interstate')} /> Yes
                </label>
              </FormField>
              <FormField label="Generate e-way bill?" error={(errors as any).generateEWayBill?.message}>
                <label className="flex items-center gap-2 h-10">
                  <input type="checkbox" {...register('generateEWayBill')} /> Yes
                </label>
              </FormField>
            </div>
          </div>
        )}

        {/* ── Dispatch From tab ── */}
        {tab === 'dispatch' && (
          <div className="glass-card p-6 mb-5">
            <div className="grid grid-cols-4 gap-4 mb-4">
              <FormField label="Dispatch From" error={(errors as any).dispatchAddressId?.message}>
                <div className="flex gap-2">
                  <Controller name="dispatchAddressId" control={control} render={({ field }) => (
                    <select {...field} value={field.value ?? 0}
                      onChange={e=>field.onChange(Number(e.target.value) || undefined)}
                      className="field-input w-full">
                      <option value={0}>Select Dispatch Address</option>
                      {dispatchAddresses.map((a:any) => <option key={a.dispatchAddressId} value={a.dispatchAddressId}>{a.name}</option>)}
                    </select>
                  )} />
                  <button type="button" onClick={()=>setShowDispatchModal(true)} className="btn-secondary shrink-0">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </FormField>
            </div>
            {(() => {
              const selId = watch('dispatchAddressId' as any);
              const a = dispatchAddresses.find((x:any)=>x.dispatchAddressId === selId);
              if (!a) return null;
              return (
                <div className="grid grid-cols-3 gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <div><strong>Address:</strong> {a.addressLine1} {a.addressLine2}</div>
                  <div><strong>State:</strong> {a.dispatchState}</div>
                  <div><strong>Pincode:</strong> {a.pincode}</div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ── Ship To tab ── */}
        {tab === 'shipto' && (
          <div className="glass-card p-6 mb-5">
            <div className="grid grid-cols-4 gap-4 mb-4">
              <FormField label="Ship To" error={(errors as any).shipToAddressId?.message}>
                <div className="flex gap-2">
                  <Controller name="shipToAddressId" control={control} render={({ field }) => (
                    <select {...field} value={field.value ?? 0}
                      onChange={e=>field.onChange(Number(e.target.value) || undefined)}
                      className="field-input w-full">
                      <option value={0}>Select Ship-To Address</option>
                      {shipToAddresses.map((a:any) => <option key={a.shipToAddressId} value={a.shipToAddressId}>{a.name}</option>)}
                    </select>
                  )} />
                  <button type="button" onClick={()=>setShowShipToModal(true)} className="btn-secondary shrink-0">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </FormField>
            </div>
            {(() => {
              const selId = watch('shipToAddressId' as any);
              const a = shipToAddresses.find((x:any)=>x.shipToAddressId === selId);
              if (!a) return null;
              return (
                <div className="grid grid-cols-4 gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <div><strong>Address:</strong> {a.addressLine1} {a.addressLine2}</div>
                  <div><strong>State:</strong> {a.shippingState}</div>
                  <div><strong>Pincode:</strong> {a.pincode}</div>
                  <div><strong>GSTIN:</strong> {a.gstin}</div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ── Product line items (always visible, shared across tabs) ── */}
        <div className="glass-card p-6 mb-5">
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Items</h2>
          {errors.items?.message && <p className="text-xs text-state-danger mb-2">{errors.items.message as string}</p>}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left" style={{ color: 'var(--text-muted)' }}>
                  <th className="pb-2 pr-2">Product</th><th className="pb-2 pr-2">HSN</th>
                  <th className="pb-2 pr-2">Qty</th><th className="pb-2 pr-2">Unit</th>
                  <th className="pb-2 pr-2">Unit Price</th><th className="pb-2 pr-2">Disc %</th>
                  <th className="pb-2 pr-2">Taxable</th><th className="pb-2 pr-2">CGST</th>
                  <th className="pb-2 pr-2">SGST</th><th className="pb-2 pr-2">IGST</th>
                  <th className="pb-2 pr-2">Total</th><th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {fields.map((f, idx) => (
                  <tr key={f.id} className="border-t border-bg-border">
                    <td className="py-1 pr-2 min-w-[160px]">
                      <select className="field-input w-full" value={items[idx]?.productId || 0}
                        onChange={e=>onProductChange(idx, Number(e.target.value))}>
                        <option value={0}>Select Product</option>
                        {products.map(p => <option key={p.productId} value={p.productId}>{p.productName}</option>)}
                      </select>
                    </td>
                    <td className="py-1 pr-2 min-w-[90px]">
                      <input className="field-input w-full" {...register(`items.${idx}.hsnCode` as any)} readOnly />
                    </td>
                    <td className="py-1 pr-2 min-w-[70px]">
                      <input type="number" step="0.001" className="field-input w-full"
                        {...register(`items.${idx}.quantity` as any, { valueAsNumber: true, onChange: ()=>recalcItem(idx) })} />
                    </td>
                    <td className="py-1 pr-2 min-w-[70px]">
                      <input className="field-input w-full" {...register(`items.${idx}.unit` as any)} readOnly />
                    </td>
                    <td className="py-1 pr-2 min-w-[90px]">
                      <input type="number" step="0.01" className="field-input w-full"
                        {...register(`items.${idx}.unitPrice` as any, { valueAsNumber: true, onChange: ()=>recalcItem(idx) })} />
                    </td>
                    <td className="py-1 pr-2 min-w-[70px]">
                      <input type="number" step="0.01" className="field-input w-full"
                        {...register(`items.${idx}.discountPct` as any, { valueAsNumber: true, onChange: ()=>recalcItem(idx) })} />
                    </td>
                    <td className="py-1 pr-2 min-w-[90px] text-right">{(items[idx]?.taxableAmount || 0).toFixed(2)}</td>
                    <td className="py-1 pr-2 min-w-[80px] text-right">{(items[idx]?.cgstAmount || 0).toFixed(2)}</td>
                    <td className="py-1 pr-2 min-w-[80px] text-right">{(items[idx]?.sgstAmount || 0).toFixed(2)}</td>
                    <td className="py-1 pr-2 min-w-[80px] text-right">{(items[idx]?.igstAmount || 0).toFixed(2)}</td>
                    <td className="py-1 pr-2 min-w-[90px] text-right font-medium">{(items[idx]?.totalAmount || 0).toFixed(2)}</td>
                    <td className="py-1">
                      <button type="button" onClick={()=>remove(idx)} className="btn-ghost btn-icon text-state-danger">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button"
            onClick={()=>append({ productId:0, productName:'', hsnCode:'', quantity:1, unit:'', unitPrice:0,
              discountPct:0, discountAmount:0, taxableAmount:0, cgstRate:0, cgstAmount:0,
              sgstRate:0, sgstAmount:0, igstRate:0, igstAmount:0, totalAmount:0 } as any)}
            className="btn-primary mt-4 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Item
          </button>

          <div className="grid grid-cols-2 gap-6 mt-6">
            <div>
              <FormField label="Notes" error={errors.notes?.message}>
                <textarea {...register('notes')} rows={3} className="field-input w-full" />
              </FormField>
              <div className="mt-4">
                <FormField label="Terms & Conditions" error={(errors as any).terms?.message}>
                  <textarea {...register('terms')} rows={3} className="field-input w-full" />
                </FormField>
              </div>
            </div>
            <div className="text-sm space-y-2">
              <div className="flex justify-between"><span>Sub Total</span><span>₹{totals.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Discount</span><span>₹{totals.discount.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>CGST</span><span>₹{totals.cgst.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>SGST</span><span>₹{totals.sgst.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>IGST</span><span>₹{totals.igst.toFixed(2)}</span></div>
              <div className="flex justify-between font-semibold text-base border-t border-bg-border pt-2">
                <span>Total</span><span>₹{totals.grand.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* ── Quick-add Dispatch Address modal ── */}
      <Modal open={showDispatchModal} onClose={()=>setShowDispatchModal(false)} title="New Dispatch Address">
        <DispatchAddressQuickForm
          isSaving={isSavingDispatch}
          onCancel={()=>setShowDispatchModal(false)}
          onSave={(data)=>{ onAddDispatchAddress(data); setShowDispatchModal(false); }}
        />
      </Modal>

      {/* ── Quick-add Ship-To Address modal ── */}
      <Modal open={showShipToModal} onClose={()=>setShowShipToModal(false)} title="New Ship-To Address">
        <ShipToAddressQuickForm
          isSaving={isSavingShipTo}
          onCancel={()=>setShowShipToModal(false)}
          onSave={(data)=>{ onAddShipToAddress(data); setShowShipToModal(false); }}
        />
      </Modal>
    </div>
  );
}

function DispatchAddressQuickForm({ isSaving, onCancel, onSave }:{
  isSaving:boolean; onCancel:()=>void; onSave:(d:TDispatchAddressReq)=>void;
}) {
  const { register, handleSubmit, control, formState:{ errors } } = useDispatchAddressForm();
  return (
    <form onSubmit={handleSubmit(onSave)} noValidate className="space-y-4">
      <FormField label="Name" error={errors.name?.message} required>
        <input {...register('name')} className="field-input w-full" />
      </FormField>
      <FormField label="Address Line 1" error={errors.addressLine1?.message}>
        <input {...register('addressLine1')} className="field-input w-full" />
      </FormField>
      <FormField label="Address Line 2" error={errors.addressLine2?.message}>
        <input {...register('addressLine2')} className="field-input w-full" />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="State" error={errors.dispatchState?.message}>
          <Controller name="dispatchState" control={control} render={({ field }) => (
            <select {...field} className="field-input w-full">
              <option value="">Select State</option>
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )} />
        </FormField>
        <FormField label="PIN Code" error={errors.pincode?.message}>
          <input {...register('pincode')} className="field-input w-full" />
        </FormField>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={isSaving} className="btn-primary flex items-center gap-2">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
        </button>
      </div>
    </form>
  );
}

function ShipToAddressQuickForm({ isSaving, onCancel, onSave }:{
  isSaving:boolean; onCancel:()=>void; onSave:(d:TShipToAddressReq)=>void;
}) {
  const { register, handleSubmit, control, formState:{ errors } } = useShipToAddressForm();
  return (
    <form onSubmit={handleSubmit(onSave)} noValidate className="space-y-4">
      <FormField label="Name" error={errors.name?.message} required>
        <input {...register('name')} className="field-input w-full" />
      </FormField>
      <FormField label="Address Line 1" error={errors.addressLine1?.message}>
        <input {...register('addressLine1')} className="field-input w-full" />
      </FormField>
      <FormField label="Address Line 2" error={errors.addressLine2?.message}>
        <input {...register('addressLine2')} className="field-input w-full" />
      </FormField>
      <div className="grid grid-cols-3 gap-4">
        <FormField label="State" error={errors.shippingState?.message}>
          <Controller name="shippingState" control={control} render={({ field }) => (
            <select {...field} className="field-input w-full">
              <option value="">Select State</option>
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )} />
        </FormField>
        <FormField label="PIN Code" error={errors.pincode?.message}>
          <input {...register('pincode')} className="field-input w-full" />
        </FormField>
        <FormField label="GSTIN" error={errors.gstin?.message}>
          <input {...register('gstin')} className="field-input w-full" />
        </FormField>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={isSaving} className="btn-primary flex items-center gap-2">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
        </button>
      </div>
    </form>
  );
}
