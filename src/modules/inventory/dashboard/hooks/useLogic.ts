"use client";
import { useState } from 'react';
import { useQuery } from '@/hooks/useQuery';
import { getInvDash, getStock, getPurchaseOrders } from '@/services/api/inventory';
import { InvDashRes, StockRes, POsRes } from '@/schemas/inventory/response';

export const useInvDashLogic = () => {
  const [calView, setCalView] = useState<'month'|'week'|'day'>('month');

  const { data: dashRes  } = useQuery({ apiConfig: getInvDash,          responseSchema: InvDashRes });
  const { data: stockRes } = useQuery({ apiConfig: getStock,             responseSchema: StockRes   });
  const { data: poRes    } = useQuery({ apiConfig: getPurchaseOrders,    responseSchema: POsRes     });

  const stock = stockRes?.data?.content ?? [];
  const pos   = poRes?.data?.content ?? [];
  const dash  = dashRes?.data;

  const lowStock = stock.filter(s => s.currentStock <= (s.reorderLevel ?? 0));

  const now = new Date();
  const year = now.getFullYear(), month = now.getMonth();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const startDay    = new Date(year, month, 1).getDay();
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const poStatus = {
    draft:    pos.filter(p=>p.status==='DRAFT').length,
    approved: pos.filter(p=>p.status==='APPROVED').length,
    received: pos.filter(p=>p.status==='RECEIVED').length,
    total:    pos.length,
    totalValue: pos.reduce((s,p)=>s+p.totalAmount,0),
  };

  return { dash, stock, lowStock, poStatus, calView, setCalView, now, year, month, daysInMonth, startDay, MONTHS };
};
