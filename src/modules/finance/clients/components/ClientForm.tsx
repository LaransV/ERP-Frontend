"use client";
import { useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { Loader2, Save, ChevronLeft } from 'lucide-react';
import { FormField, PageHeader, AuditBar } from '@/components/shared';
import { GST_TYPES, INDIAN_STATES, CURRENCIES } from '@/modules/finance/clients/constants';
import { useClientForm } from '@/modules/finance/clients/hooks/useFormHandle';
import type { TClient } from '@/schemas/finance/response';
import type { TClientReq } from '@/schemas/finance/request';

interface ClientFormProps {
  editing:  TClient | null;
  isSaving: boolean;
  onBack:   () => void;
  onSave:   (data: TClientReq) => void;
}

export function ClientForm({ editing, isSaving, onBack, onSave }: ClientFormProps) {
  const { register, handleSubmit, control, reset, formState: { errors } } = useClientForm();

  useEffect(() => {
    if (editing) {
      reset({
        clientName:    editing.clientName,
        aliasName:     (editing as any).aliasName    ?? '',
        vendorCode:    (editing as any).vendorCode   ?? '',
        email:         editing.email                 ?? '',
        phone:         editing.phone                 ?? '',
        website:       (editing as any).website      ?? '',
        landlinePhone: (editing as any).landlinePhone ?? '',
        panNumber:     editing.panNumber             ?? '',
        gstnType:      (editing as any).gstnType     ?? 'GST_REGISTERED_REGULAR',
        gstNumber:     editing.gstNumber             ?? '',
        address:       editing.address               ?? '',
        addressLine2:  (editing as any).addressLine2 ?? '',
        pincode:       editing.pincode               ?? '',
        city:          editing.city                  ?? '',
        state:         editing.state                 ?? '',
        country:       (editing as any).country      ?? 'India',
        currency:      (editing as any).currency     ?? 'INR',
        paymentTerms:  editing.paymentTerms          ?? '',
      });
    } else {
      reset({
        clientName: '', aliasName: '', vendorCode: '',
        email: '', phone: '', website: '', landlinePhone: '',
        panNumber: '', gstnType: 'GST_REGISTERED_REGULAR', gstNumber: '',
        address: '', addressLine2: '', pincode: '', city: '',
        state: 'Tamil Nadu', country: 'India', currency: 'INR', paymentTerms: '',
      });
    }
  }, [editing, reset]);

  const onSubmit = (data: TClientReq) => onSave(data);

  const crumbs = [
    { label: 'Finance' },
    { label: 'Clients', href: '/finance/clients' },
    { label: editing ? 'Edit Client' : 'New Client' },
  ];

  return (
    <div>
      <PageHeader
        title={
          <div className="flex items-center gap-1 cursor-pointer" onClick={onBack}>
            <ChevronLeft className="w-6 h-6" />
            Client Details
          </div>
        }
        crumbs={crumbs}
        actions={
          <button form="client-form" type="submit" disabled={isSaving}
            className="btn-primary flex items-center gap-2">
            {isSaving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              : <><Save className="w-4 h-4" /> {editing ? 'Update' : 'Save'}</>
            }
          </button>
        }
      />

      {/* ── AUDIT BAR — only shown in edit mode ── */}
      {editing && (
        <AuditBar
          createdBy={       (editing as any).createdBy}
          createdDate={     (editing as any).createdDate}
          modifiedBy={  (editing as any).modifiedBy}
          modifiedDate={  (editing as any).modifiedDate}
        />
      )}

      <form id="client-form" onSubmit={handleSubmit(onSubmit)} noValidate>

        {/* ── ORGANIZATION INFO ── */}
        <div className="glass-card p-6 mb-5">
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-5"
            style={{ color: 'var(--text-muted)' }}>
            Organization Info
          </h2>

          {/* Row 1 */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <FormField label="Organization Name" error={errors.clientName?.message} required>
              <input {...register('clientName')} placeholder="Name of the Organization" className="field-input w-full" />
            </FormField>
            <FormField label="Alias Name" error={(errors as any).aliasName?.message}>
              <input {...register('aliasName')} placeholder="Alias Name" className="field-input w-full" />
            </FormField>
            <FormField label="Vendor Code" error={(errors as any).vendorCode?.message}>
              <input {...register('vendorCode')} placeholder="Vendor Code" className="field-input w-full" />
            </FormField>
            <FormField label="Official Email Id" error={errors.email?.message}>
              <input {...register('email')} type="email" placeholder="Official Email Id" className="field-input w-full" />
            </FormField>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <FormField label="Website" error={(errors as any).website?.message}>
              <input {...register('website')} placeholder="Website" className="field-input w-full" />
            </FormField>
            <FormField label="Landline Phone" error={(errors as any).landlinePhone?.message}>
              <input {...register('landlinePhone')} placeholder="Landline Phone" className="field-input w-full" />
            </FormField>
            <FormField label="Mobile" error={errors.phone?.message} required>
              <input {...register('phone')} placeholder="Mobile" className="field-input w-full" />
            </FormField>
            <FormField label="PAN" error={errors.panNumber?.message}>
              <input {...register('panNumber')} placeholder="PAN" className="field-input w-full" />
            </FormField>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <FormField label="GSTN Type" error={(errors as any).gstnType?.message} required>
              <Controller name="gstnType" control={control} render={({ field }) => (
                <select {...field} className="field-input w-full">
                  {GST_TYPES.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              )} />
            </FormField>
            <FormField label="GST No." error={errors.gstNumber?.message}>
              <input {...register('gstNumber')} placeholder="GST No." className="field-input w-full" />
            </FormField>
            <FormField label="Address Line 1" error={errors.address?.message}>
              <input {...register('address')} placeholder="AddressLine1" className="field-input w-full" />
            </FormField>
            <FormField label="Address Line 2" error={(errors as any).addressLine2?.message}>
              <input {...register('addressLine2')} placeholder="AddressLine2" className="field-input w-full" />
            </FormField>
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <FormField label="PIN Code" error={errors.pincode?.message}>
              <input {...register('pincode')} placeholder="PIN Code" className="field-input w-full" />
            </FormField>
            <FormField label="State" error={errors.state?.message} required>
              <Controller name="state" control={control} render={({ field }) => (
                <select {...field} className="field-input w-full">
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              )} />
            </FormField>
            <FormField label="Country" error={(errors as any).country?.message}>
              <input {...register('country')} placeholder="Country" className="field-input w-full" />
            </FormField>
            <FormField label="Currency" error={(errors as any).currency?.message}>
              <Controller name="currency" control={control} render={({ field }) => (
                <select {...field} className="field-input w-full">
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )} />
            </FormField>
          </div>

          {/* Row 5 */}
          <div className="grid grid-cols-4 gap-4">
            <FormField label="Payment Terms" error={errors.paymentTerms?.message}>
              <input {...register('paymentTerms')} placeholder="e.g. Net 30" className="field-input w-full" />
            </FormField>
          </div>
        </div>

      </form>
    </div>
  );
}
