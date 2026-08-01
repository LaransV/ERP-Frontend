"use client";
import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@/hooks/useQuery';
import { MovementsRes } from '@/schemas/inventory/response';
import { getMovements } from '@/services/api/inventory';
import { MOV_KEY } from '../constants';
export const useMovementsLogic = () => {
  const { canAccess } = useAuthStore();
  const canRead = canAccess('INV_STOCK','read');
  const { data, isLoading } = useQuery({ apiConfig:getMovements, responseSchema:MovementsRes, loadingKey:MOV_KEY });
  return { movements: data?.data?.content ?? [], total: data?.data?.totalElements ?? 0, isLoading, canRead };
};
