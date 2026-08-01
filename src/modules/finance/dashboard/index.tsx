"use client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fmt } from '@/lib/utils';
import { useFinanceDashLogic } from './hooks/useLogic';
import { useAuthStore } from '@/store/authStore';
import { AccessDenied } from '@/components/shared';

const CircleKPI = ({ label, count, amount, color }: { label: string; count: number; amount: number; color: string }) => {
  const total = 100;
  const pct = Math.min(100, count > 0 ? 100 : 0);
  const r = 18; const circ = 2 * Math.PI * r;
  return (
    <div className="glass-card p-4 flex items-center gap-4">
      <div className="relative w-14 h-14 shrink-0">
        <svg width="56" height="56" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r={r} fill="none" stroke="var(--hover)" strokeWidth="5"/>
          <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={`${pct/100*circ} ${circ}`} strokeLinecap="round"
            transform="rotate(-90 28 28)" opacity={count>0?1:0.25}/>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold"
          style={{ color }}>{count>0?`${Math.round(pct)}%`:'0%'}</div>
      </div>
      <div>
        <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{count}</div>
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
        <div className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-secondary)' }}>{fmt.currency(amount)}</div>
      </div>
    </div>
  );
};

export default function FinanceDashboardModule() {
  const { period, setPeriod, PERIODS, invoiceChart, statusCounts, isLoading } = useFinanceDashLogic();
  const { canAccess } = useAuthStore();
  const canRead = canAccess('FINANCE_DASHBOARD','read');

  if (!canRead) return <AccessDenied />;  

  return (
    <div className="space-y-5">
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Invoice Chart */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>INVOICE</h3>
            <select value={period} onChange={e=>setPeriod(e.target.value)} className="field-input w-36 text-xs py-1">
              {PERIODS.map(p=><option key={p}>{p}</option>)}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={invoiceChart} margin={{ top:5, right:10, bottom:5, left:-20 }}>
              <defs>
                <linearGradient id="totalInv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#4F8EF7" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4F8EF7" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="paidInv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#34D399" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#34D399" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5}/>
              <XAxis dataKey="month" tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, fontSize:12 }}/>
              <Legend iconType="square" wrapperStyle={{ fontSize:11 }}/>
              <Area type="monotone" dataKey="totalInvoices" name="Total Invoices" stroke="#4F8EF7" fill="url(#totalInv)" strokeWidth={2}/>
              <Area type="monotone" dataKey="paidInvoices"  name="Paid Invoices"  stroke="#34D399" fill="url(#paidInv)"  strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quotes Chart — placeholder same style */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>QUOTES</h3>
            <select className="field-input w-36 text-xs py-1">
              {PERIODS.map(p=><option key={p}>{p}</option>)}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={invoiceChart} margin={{ top:5, right:10, bottom:5, left:-20 }}>
              <defs>
                <linearGradient id="totalQ" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#A78BFA" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#A78BFA" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="accQ" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#FBBF24" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#FBBF24" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5}/>
              <XAxis dataKey="month" tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, fontSize:12 }}/>
              <Legend iconType="square" wrapperStyle={{ fontSize:11 }}/>
              <Area type="monotone" dataKey="totalInvoices" name="Total Quotes"    stroke="#A78BFA" fill="url(#totalQ)" strokeWidth={2}/>
              <Area type="monotone" dataKey="paidInvoices"  name="Accepted Quotes" stroke="#FBBF24" fill="url(#accQ)"   strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Invoice KPI Cards */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>INVOICE STATUS</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <CircleKPI label="Due"      count={statusCounts.due.count}     amount={statusCounts.due.amount}     color="#FBBF24"/>
          <CircleKPI label="OverDue"  count={statusCounts.overdue.count} amount={statusCounts.overdue.amount} color="#EF4444"/>
          <CircleKPI label="Paid"     count={statusCounts.paid.count}    amount={statusCounts.paid.amount}    color="#34D399"/>
          <CircleKPI label="Total"    count={statusCounts.total.count}   amount={statusCounts.total.amount}   color="#4F8EF7"/>
        </div>
      </div>

      {/* Quotes KPI Cards */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>QUOTE STATUS</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <CircleKPI label="Accepted"  count={0} amount={0} color="#34D399"/>
          <CircleKPI label="Declined"  count={0} amount={0} color="#EF4444"/>
          <CircleKPI label="Draft"     count={statusCounts.draft.count} amount={0} color="#A78BFA"/>
          <CircleKPI label="Sent"      count={statusCounts.sent.count}  amount={0} color="#FBBF24"/>
        </div>
      </div>
    </div>
  );
}
