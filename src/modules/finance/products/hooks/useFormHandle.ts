"use client";
import { useFormHandler } from '@/hooks/useFormHandler';
import { ProductReq } from '@/schemas/finance/request';
import type { TProductReq } from '@/schemas/finance/request';

export const useProductForm = (defaults?: Partial<TProductReq>) =>
  useFormHandler<TProductReq>({
    validationSchema: ProductReq,
    defaultValues: {
      productName: '',
      productCode: '',
      hsnCode: '',
      productType: 'GOODS',
      unit: 'PCS',
      taxRate: 0,
      purchasePrice: 0,
      salePrice: 0,
      categoryName: '',
      groupName: '',
      ...defaults,
    } as TProductReq,
  });
