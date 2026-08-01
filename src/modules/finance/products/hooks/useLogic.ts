"use client";
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useQuery }    from '@/hooks/useQuery';
import { useMutation } from '@/hooks/useMutation';
import { ProductsRes } from '@/schemas/finance/response';
import type { TProduct } from '@/schemas/finance/response';
import { ProductReq } from '@/schemas/finance/request';
import { getProducts, postProduct, putProduct, deleteProduct } from '@/services/api/finance';
import { VoidRes } from '@/schemas/template/response';

export const useProductsLogic = () => {
  const { canAccess, user } = useAuthStore();
  const qc = useQueryClient();

  const canCreate = canAccess('FINANCE_PRODUCTS', 'create');
  const canUpdate = canAccess('FINANCE_PRODUCTS', 'update');
  const canDelete = canAccess('FINANCE_PRODUCTS', 'delete');

  const [editing, setEditing] = useState<TProduct | null>(null);
  const [open, setOpen]       = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    apiConfig: getProducts,
    responseSchema: ProductsRes,
  });

    console.log(" data?",  data)

  // ── companyId validation: reject products not belonging to this company ──
  const companyId = user?.companyId ?? null;

  const validateCompany = (product: TProduct): boolean => {
    // If backend returns companyId on product, verify it matches current user's companyId
    const prodCompanyId = (product as any).companyId ?? null;
    if (companyId && prodCompanyId && prodCompanyId !== companyId) {
      toast.error('This product does not belong to your company.');
      return false;
    }
    return true;
  };

  // ── Save (create / update) ──────────────────────────────────
  const { mutate: save, isPending: isSaving } = useMutation({
    apiConfig: editing ? putProduct : postProduct,
    requestSchema: ProductReq,
    responseSchema: ProductsRes,
    parameters: editing ? { id: editing.productId } : undefined,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getProducts.keys });
      toast.success(editing ? 'Product updated successfully' : 'Product created successfully');
      setOpen(false);
      setEditing(null);
    },
    onError: () => toast.error('Failed to save product. Please try again.'),
  });

  // ── Delete ──────────────────────────────────────────────────
  const { mutate: del, isPending: isDeleting } = useMutation({
    apiConfig: deleteProduct,
    requestSchema: VoidRes as any,
    responseSchema: VoidRes,
    parameters: deleteId ? { id: deleteId } : undefined,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getProducts.keys });
      toast.success('Product deleted successfully');
      setDeleteId(null);
    },
    onError: () => toast.error('Failed to delete product.'),
  });

  // ── Handlers ────────────────────────────────────────────────
  const handleNew = () => {
    setEditing(null);
    setOpen(true);
  };

  const handleEdit = (product: TProduct) => {
    if (!validateCompany(product)) return;
    setEditing(product);
    setOpen(true);
  };

  const handleDelete = (product: TProduct) => {
    if (!validateCompany(product)) return;
    if (!confirm(`Delete "${product.productName}"? This cannot be undone.`)) return;
    setDeleteId(product.productId);
    del(null as any);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
  };

  // ── Submit — inject companyId before sending ────────────────
  const handleSave = (formData: any) => {
    const payload = {
      ...formData,
      ...(companyId ? { companyId } : {}),
    };
    save(payload);
  };



  return {
    products:    data?.data?.content ?? [],
    total:       data?.data?.totalElements ?? 0,
    isLoading,
    editing,
    open,
    isSaving,
    isDeleting,
    canCreate,
    canUpdate,
    canDelete,
    companyId,
    handleNew,
    handleEdit,
    handleDelete,
    handleClose,
    handleSave,
  };
};
