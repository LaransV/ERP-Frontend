"use client";
import { useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { Loader2, Save, X } from 'lucide-react';
import { Modal, FormField } from '@/components/shared';
import { PRODUCT_TYPES, UNITS, GST_RATES } from '../constants';
import { useProductForm } from '../hooks/useFormHandle';
import type { TProduct } from '@/schemas/finance/response';
import type { TProductReq } from '@/schemas/finance/request';


interface ProductModalProps {
  open:      boolean;
  editing:   TProduct | null;
  isSaving:  boolean;
  onClose:   () => void;
  onSave:    (data: TProductReq) => void;
}

export function ProductModal({ open, editing, isSaving, onClose, onSave }: ProductModalProps) {

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useProductForm();

  // ── Populate form when editing ───────────────────────────────
  useEffect(() => {
    if (open) {
      if (editing) {
        reset({
          productName:    editing.productName,
          productCode:    editing.productCode   ?? '',
          hsnCode:        editing.hsnCode       ?? '',
          productType:    editing.productType,
          unit:           editing.unit,
          taxRate:        editing.taxRate,
          purchasePrice:  editing.purchasePrice,
          salePrice:      editing.salePrice,
          categoryName:   editing.categoryName  ?? '',
          groupName:      (editing as any).groupName ?? '',
        });
      } else {
        reset({
          productName: '', productCode: '', hsnCode: '',
          productType: 'GOODS', unit: 'PCS',
          taxRate: 0, purchasePrice: 0, salePrice: 0,
          categoryName: '', groupName: '',
        });
      }
    }
  }, [open, editing, reset]);

  const productType = watch('productType');

  const onSubmit = (data: TProductReq) => onSave(data);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit Product' : 'Add Product'}
      width="max-w-3xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

        {/* ── Row 1: Product Name ───────────────────────────── */}
        <FormField label="Product Name" error={errors.productName?.message} required>
          <input
            {...register('productName')}
            placeholder="Product Name"
            className="field-input w-full"
          />
        </FormField>

        {/* ── Row 2: Product Code + HSN Code ───────────────── */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Product Code" error={errors.productCode?.message}>
            <input
              {...register('productCode')}
              placeholder="Product Code"
              className="field-input w-full"
            />
          </FormField>
          <FormField label="HSN Code" error={errors.hsnCode?.message}>
            <input
              {...register('hsnCode')}
              placeholder="HSN Code"
              className="field-input w-full"
            />
          </FormField>
        </div>

        {/* ── Row 3: Product Type + Unit ────────────────────── */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Product Type" error={errors.productType?.message} required>
            <Controller
              name="productType"
              control={control}
              render={({ field }) => (
                <select {...field} className="field-input w-full">
                  {PRODUCT_TYPES.map(t => (
                    <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
                  ))}
                </select>
              )}
            />
          </FormField>
          <FormField label="Unit" error={errors.unit?.message} required>
            <Controller
              name="unit"
              control={control}
              render={({ field }) => (
                <select {...field} className="field-input w-full">
                  {UNITS.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              )}
            />
          </FormField>
        </div>

        {/* ── Row 4: Group + Category ──────────────────────── */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Product Group" error={(errors as any).groupName?.message}>
            <input
              {...register('groupName')}
              placeholder="Product Group"
              className="field-input w-full"
            />
          </FormField>
          <FormField label="Product Category" error={errors.categoryName?.message}>
            <input
              {...register('categoryName')}
              placeholder="Product Category"
              className="field-input w-full"
            />
          </FormField>
        </div>

        {/* ── Row 5: GST + Purchase Rate + Sale Rate ────────── */}
        <div className="grid grid-cols-3 gap-4">
          <FormField label="GST (%)" error={errors.taxRate?.message} required>
            <Controller
              name="taxRate"
              control={control}
              render={({ field }) => (
                <select
                  value={field.value}
                  onChange={e => field.onChange(Number(e.target.value))}
                  className="field-input w-full"
                >
                  {GST_RATES.map(r => (
                    <option key={r} value={r}>{r}%</option>
                  ))}
                  {/* Allow custom value if not in slab */}
                  {!GST_RATES.includes(field.value) && (
                    <option value={field.value}>{field.value}%</option>
                  )}
                </select>
              )}
            />
          </FormField>

          <FormField label="Purchase Rate (₹)" error={errors.purchasePrice?.message} required>
            <Controller
              name="purchasePrice"
              control={control}
              render={({ field }) => (
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={field.value}
                  onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="field-input w-full"
                />
              )}
            />
          </FormField>

          <FormField label="Sale Rate (₹)" error={errors.salePrice?.message} required>
            <Controller
              name="salePrice"
              control={control}
              render={({ field }) => (
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={field.value}
                  onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="field-input w-full"
                />
              )}
            />
          </FormField>
        </div>

        {/* ── Info banner: companyId locked ─────────────────── */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
          style={{ background: 'rgba(0,177,222,0.08)', color: 'var(--brand)', border: '1px solid rgba(0,177,222,0.2)' }}
        >
          <span className="font-semibold">Company-locked:</span>
          <span>This product will be saved under your company only and cannot be accessed by other companies.</span>
        </div>

        {/* ── Actions ───────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
          <button type="button" onClick={onClose} className="btn-secondary flex items-center gap-2">
            <X className="w-4 h-4" /> Cancel
          </button>
          <button type="submit" disabled={isSaving} className="btn-primary flex items-center gap-2">
            {isSaving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              : <><Save className="w-4 h-4" /> {editing ? 'Update' : 'Add'} Product</>
            }
          </button>
        </div>

      </form>
    </Modal>
  );
}
