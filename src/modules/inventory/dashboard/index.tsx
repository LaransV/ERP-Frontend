"use client";
import { ChevronLeft, ChevronRight, RefreshCw, AlertTriangle } from 'lucide-react';
import { fmt } from '@/lib/utils';
import { useInvDashLogic } from './hooks/useLogic';
import { useAuthStore } from '@/store/authStore';
import { AccessDenied } from '@/components/shared';

const StatusCard = ({ label, value, currency, color, icon }: any) => (
  <div className="p-5 rounded-xl text-white relative overflow-hidden" style={{ background: color }}>
    <div className="text-xs font-bold uppercase tracking-wider opacity-80 mb-2">{label}</div>
    <div className="text-2xl font-bold">{currency ? fmt.currency(value) : value}</div>
    <div className="text-xs opacity-60 mt-1">0%</div>
    {icon && <div className="absolute right-4 top-4 opacity-20 text-4xl">{icon}</div>}
  </div>
);

export default function InventoryDashboardModule() {
  const { dash, lowStock, poStatus, calView, setCalView, now, year, month, daysInMonth, startDay, MONTHS } = useInvDashLogic();
  const { canAccess } = useAuthStore();
  const canRead = canAccess('INV_DASHBOARD','read');

  if (!canRead) return <AccessDenied />;

  // Calendar cells
  const cells: (number|null)[] = [];
  for (let i=0; i<startDay; i++) cells.push(null);
  for (let d=1; d<=daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number|null)[][] = [];
  for (let i=0; i<cells.length; i+=7) weeks.push(cells.slice(i,i+7));

  return (
    <div className="space-y-5">
      {/* Month Wise Status — Image 4 top row colored cards */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color:'var(--text-secondary)' }}>MONTH WISE STATUS REPORT</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatusCard label="Purchase Orders" value={poStatus.total}    color="#1E3A8A" icon="🛒"/>
          <StatusCard label="Total Value"     value={poStatus.totalValue} currency color="#D97706" icon="💰"/>
          <StatusCard label="Approved POs"    value={poStatus.approved} color="#15803D" icon="✅"/>
          <StatusCard label="Received POs"    value={poStatus.received} color="#B91C1C" icon="📦"/>
        </div>
      </div>

      {/* Sales / PO Status */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color:'var(--text-secondary)' }}>PURCHASE ORDER STATUS</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-5 rounded-xl text-white" style={{ background:'#7C3AED' }}>
            <div className="text-xs font-bold uppercase opacity-80 mb-2">DRAFT</div>
            <div className="text-2xl font-bold">{poStatus.draft}</div>
          </div>
          <div className="p-5 rounded-xl text-white" style={{ background:'#0284C7' }}>
            <div className="text-xs font-bold uppercase opacity-80 mb-2">APPROVED</div>
            <div className="text-2xl font-bold">{poStatus.approved}</div>
          </div>
          <div className="p-5 rounded-xl text-white" style={{ background:'#7C3AED' }}>
            <div className="text-xs font-bold uppercase opacity-80 mb-2">RECEIVED</div>
            <div className="text-2xl font-bold">{poStatus.received}</div>
          </div>
        </div>
      </div>

      {/* Low Stock Report */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor:'var(--border)' }}>
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color:'var(--text-secondary)' }}>LOW STOCK REPORT</h3>
          <button className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg" style={{ background:'var(--hover)', color:'var(--text-secondary)' }}>
            <RefreshCw className="w-3 h-3"/>Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background:'var(--brand)' }}>
                {['Product Name','Current Stock','Reorder Level','Unit','Value'].map(h=>(
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-bold text-white">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lowStock.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-xs" style={{ color:'var(--text-muted)' }}>No low stock items</td></tr>
              ) : lowStock.map((s,i)=>(
                <tr key={s.stockId} style={{ background: i%2===0?'transparent':'var(--hover)' }}>
                  <td className="px-4 py-2.5 text-xs">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-yellow-400"/>
                      <span className="font-medium" style={{ color:'var(--text-primary)' }}>{s.productName}</span>
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs font-mono font-bold text-red-400">{s.currentStock}</td>
                  <td className="px-4 py-2.5 text-xs font-mono" style={{ color:'var(--text-muted)' }}>{s.reorderLevel??'—'}</td>
                  <td className="px-4 py-2.5 text-xs" style={{ color:'var(--text-muted)' }}>{s.unit}</td>
                  <td className="px-4 py-2.5 text-xs font-mono">{fmt.currency(s.stockValue??0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination bar */}
        <div className="flex items-center justify-between px-5 py-3 border-t text-xs" style={{ borderColor:'var(--border)', color:'var(--text-muted)' }}>
          <span>{lowStock.length} items</span>
          <div className="flex items-center gap-1">
            <span>Rows per page</span>
            <select className="field-input py-0.5 w-16 text-xs">
              {[15,25,50].map(n=><option key={n}>{n}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Production Calendar */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor:'var(--border)' }}>
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color:'var(--text-secondary)' }}>PRODUCTION CALENDAR</h3>
          <div className="flex gap-2">
            {['month','week','day'].map(v=>(
              <button key={v} onClick={()=>setCalView(v as any)}
                className="px-3 py-1 rounded-lg text-xs font-semibold border transition-all"
                style={{ background: calView===v?'var(--brand)':'transparent', color: calView===v?'#fff':'var(--text-secondary)', borderColor:'var(--border)' }}>
                {v}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold" style={{ color:'var(--text-primary)' }}>{MONTHS[month]} {year}</h4>
            <div className="flex gap-1">
              <button className="btn-ghost btn-icon btn-sm"><ChevronLeft className="w-4 h-4"/></button>
              <button className="btn-ghost btn-icon btn-sm"><ChevronRight className="w-4 h-4"/></button>
            </div>
          </div>
          <div className="grid grid-cols-7 text-center">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>(
              <div key={d} className="py-1 text-xs font-semibold" style={{ color:'var(--text-muted)' }}>{d}</div>
            ))}
            {weeks.map((week,wi)=>week.map((day,di)=>(
              <div key={`${wi}-${di}`} className="min-h-[52px] border-t text-xs p-1"
                style={{ borderColor:'var(--border)', background: day===now.getDate()?'rgba(79,142,247,0.08)':'transparent' }}>
                <span className={`w-6 h-6 flex items-center justify-center rounded-full mx-auto font-medium ${day===now.getDate()?'bg-brand text-white':''}`}
                  style={{ color: day&&day!==now.getDate()?'var(--text-secondary)':'', opacity: day?1:0 }}>{day||''}</span>
              </div>
            )))}
          </div>
        </div>
      </div>
    </div>
  );
}
