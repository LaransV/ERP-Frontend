"use client";
import { useAuthStore } from '@/store/authStore';
export const useCompaniesLogic = () => {
  const { canAccess } = useAuthStore();
  const canRead = canAccess('ADMIN_COMPANIES','read');
  const canCreate = canAccess('ADMIN_COMPANIES','create');
  const canUpdate = canAccess('ADMIN_COMPANIES','update');
  const canDelete = canAccess('ADMIN_COMPANIES','delete');
  return { canRead, canCreate, canUpdate, canDelete };
};
