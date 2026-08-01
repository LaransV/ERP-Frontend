"use client";
import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@/hooks/useQuery';
import { StockRes, InvDashRes } from '@/schemas/inventory/response';
import { getStock, getInvDash } from '@/services/api/inventory';
import { STOCK_KEY } from '../constants';

export const useStockLogic = () => {
  const { canAccess } = useAuthStore();
  const canRead = canAccess('INV_STOCK','read');
  const { data, isLoading } = useQuery({ apiConfig:getStock, responseSchema:StockRes, loadingKey:STOCK_KEY });
  const { data: dashRes }   = useQuery({ apiConfig:getInvDash, responseSchema:InvDashRes });
  return { stock: data?.data?.content ?? [], total: data?.data?.totalElements ?? 0,
           dash: dashRes?.data, isLoading, canRead };
};
