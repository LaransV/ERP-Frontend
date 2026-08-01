"use client";
import { useState } from 'react';
import { useQuery } from '@/hooks/useQuery';
import { getFinanceDash, getInvoices } from '@/services/api/finance';
import { FinDashRes, InvoicesRes } from '@/schemas/finance/response';

const PERIODS = ['Last 1 Month', 'Last 3 Months', 'Last 6 Months', 'This Year'] as const;

export const useFinanceDashLogic = () => {
  const [period, setPeriod] = useState<string>('Last 3 Months');

  const { data: dashRes, isLoading } = useQuery({ apiConfig: getFinanceDash, responseSchema: FinDashRes });
  const { data: invRes } = useQuery({ apiConfig: getInvoices, responseSchema: InvoicesRes });

  const invoices = invRes?.data?.content ?? [];
  const dash = dashRes?.data;

  // Build monthly chart data from invoices
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const now = new Date();
  const last6 = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return { month: months[d.getMonth()], year: d.getFullYear(), key: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}` };
  });

  const invoiceChart = last6.map(m => {
    const monthInvs = invoices.filter(inv => inv.invoiceDate?.startsWith(m.key));
    return {
      month: m.month,
      totalInvoices: monthInvs.length,
      paidInvoices: monthInvs.filter(i => i.status === 'PAID').length,
    };
  });

  const statusCounts = {
    due:      { count: dash?.dueCount ?? 0,      amount: dash?.dueAmount ?? 0 },
    overdue:  { count: dash?.overdueCount ?? 0,  amount: dash?.overdueAmount ?? 0 },
    paid:     { count: dash?.paidCount ?? 0,     amount: dash?.paidAmount ?? 0 },
    total:    { count: invoices.length,           amount: dash?.totalRevenue ?? 0 },
    draft:    { count: invoices.filter(i=>i.status==='DRAFT').length,     amount: 0 },
    sent:     { count: invoices.filter(i=>i.status==='SENT').length,      amount: 0 },
    cancelled:{ count: invoices.filter(i=>i.status==='CANCELLED').length, amount: 0 },
  };

  return { period, setPeriod, PERIODS, invoiceChart, statusCounts, isLoading, dash };
};
