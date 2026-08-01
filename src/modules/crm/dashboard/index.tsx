"use client";
import { Phone, Mail, MapPin, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { fmt } from '@/lib/utils';
import { useCrmDashLogic } from './hooks/useLogic';
import { useAuthStore } from '@/store/authStore';
import { AccessDenied } from '@/components/shared';

const TYPE_COLORS: Record<string,string> = { CALL:'#4F8EF7', EMAIL:'#34D399', MEETING:'#A78BFA', NOTE:'#FBBF24', TASK:'#FB7185' };

export default function CrmDashboardModule() {
  const { dash, todayFollowups, activities, leads, calView, setCalView, now, year, month, daysInMonth, startDay, MONTHS } = useCrmDashLogic();

  const { canAccess } = useAuthStore();
  const canRead = canAccess('CRM_DASHBOARD','read');

  if (!canRead) return <AccessDenied />;

  // Build calendar grid
  const cells: (number|null)[] = [];
  for (let i=0; i<startDay; i++) cells.push(null);
  for (let d=1; d<=daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number|null)[][] = [];
  for (let i=0; i<cells.length; i+=7) weeks.push(cells.slice(i,i+7));

  return (
    <div className="space-y-5">
      {/* Today Followups */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor:'var(--border)' }}>
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color:'var(--text-secondary)' }}>TODAY FOLLOWUPS DETAILS</h3>
          <span className="text-xs" style={{ color:'var(--text-muted)' }}>Total Followups: {todayFollowups.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background:'var(--brand)' }}>
                {['Lead Name','Mobile','Type','Assigned To','Scheduled At'].map(h=>(
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-bold text-white">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {todayFollowups.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-xs" style={{ color:'var(--text-muted)' }}>No followups today</td></tr>
              ) : todayFollowups.map((f,i)=>(
                <tr key={f.followupId} className={i%2===0?'':'opacity-80'} style={{ background: i%2===0?'transparent':'var(--hover)' }}>
                  <td className="px-4 py-2.5 text-xs font-medium" style={{ color:'var(--text-primary)' }}>{f.leadName||'—'}</td>
                  <td className="px-4 py-2.5 text-xs font-mono">{f.phone||'—'}</td>
                  <td className="px-4 py-2.5 text-xs">
                    <span className="px-2 py-0.5 rounded-full font-semibold text-white" style={{ background: TYPE_COLORS[f.followupType]||'#888' }}>{f.followupType}</span>
                  </td>
                  <td className="px-4 py-2.5 text-xs" style={{ color:'var(--text-muted)' }}>—</td>
                  <td className="px-4 py-2.5 text-xs" style={{ color:'var(--text-secondary)' }}>{new Date(f.scheduledAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Calendar */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor:'var(--border)' }}>
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color:'var(--text-secondary)' }}>CALENDAR</h3>
          <div className="flex gap-2">
            {['month','week','day'].map(v=>(
              <button key={v} onClick={()=>setCalView(v as any)}
                className="px-3 py-1 rounded-lg text-xs font-semibold transition-all border"
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
              <div key={`${wi}-${di}`}
                className={`min-h-[52px] border-t text-xs p-1 ${day===now.getDate()?'rounded-lg':''}`}
                style={{ borderColor:'var(--border)', background: day===now.getDate()?'var(--brand-dim)':'transparent', color: day?'var(--text-secondary)':'transparent' }}>
                <span className={`w-6 h-6 flex items-center justify-center rounded-full mx-auto mb-1 ${day===now.getDate()?'bg-brand text-white font-bold':''}`}>{day||''}</span>
              </div>
            )))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Feeds */}
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-3 border-b" style={{ borderColor:'var(--border)' }}>
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color:'var(--text-secondary)' }}>FEEDS</h3>
          </div>
          <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
            {activities.length===0 && (
              <p className="text-xs text-center py-6" style={{ color:'var(--text-muted)' }}>No recent activities</p>
            )}
            {activities.slice(0,10).map(a=>(
              <div key={a.activityId} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ background: TYPE_COLORS[a.activityType]||'var(--brand)' }}>
                  {(a.createdBy||'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color:'var(--text-primary)' }}>{a.description || a.title || 'Activity logged'}</p>
                  <p className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>{a.activityDate||'—'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline by status */}
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-3 border-b" style={{ borderColor:'var(--border)' }}>
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color:'var(--text-secondary)' }}>LEAD PIPELINE</h3>
          </div>
          <div className="p-4 space-y-2">
            {(dash?.statusWise ?? []).map((s:any,i:number)=>{
              const pct = dash?.totalLeads ? Math.round(s.count/dash.totalLeads*100) : 0;
              const COLORS = ['#4F8EF7','#34D399','#FBBF24','#A78BFA','#FB7185','#34D399','#6B7280'];
              return (
                <div key={s.status}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color:'var(--text-secondary)' }}>{s.status}</span>
                    <span className="font-semibold" style={{ color:'var(--text-primary)' }}>{s.count}</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background:'var(--hover)' }}>
                    <div className="h-2 rounded-full transition-all" style={{ width:`${pct}%`, background:COLORS[i%COLORS.length] }}/>
                  </div>
                </div>
              );
            })}
            {!dash?.statusWise?.length && (
              <p className="text-xs text-center py-6" style={{ color:'var(--text-muted)' }}>No pipeline data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
