"use client";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useHrDashLogic } from './hooks/useLogic';
import { useAuthStore } from '@/store/authStore';
import { AccessDenied } from '@/components/shared';

const EmpCard = ({ label, value, color, icon }: { label:string; value:string|number; color:string; icon:string }) => (
  <div className="p-4 rounded-xl text-white" style={{ background: color }}>
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs font-semibold opacity-80">{label}</span>
      <span className="text-lg opacity-30">{icon}</span>
    </div>
    <div className="text-2xl font-bold">{value}</div>
  </div>
);

const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex items-center justify-between px-5 py-2.5 border-b" style={{ borderColor:'var(--border)' }}>
    <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color:'var(--text-secondary)' }}>{title}</h3>
  </div>
);

export default function HrDashboardModule() {
  const { canAccess } = useAuthStore();
  const canRead = canAccess('HR_DASHBOARD','read');
  const {
    totalEmp, activeEmp, inactiveEmp, todayPresent, todayAbsent, onLeave, lateComers,
    genderCounts, deptWise, insightType, setInsightType, insightMonth, setInsightMonth, MONTHS_OPT,
    calView, setCalView, now, year, month, daysInMonth, startDay, MONTHS_FULL,
  } = useHrDashLogic();

  if (!canRead) return <AccessDenied />;

  const cells: (number|null)[] = [];
  for (let i=0; i<startDay; i++) cells.push(null);
  for (let d=1; d<=daysInMonth; d++) cells.push(d);
  while (cells.length%7!==0) cells.push(null);
  const weeks: (number|null)[][] = [];
  for (let i=0; i<cells.length; i+=7) weeks.push(cells.slice(i,i+7));

  return (
    <div className="space-y-5">
      {/* EMPLOYEES */}
      <div className="glass-card overflow-hidden">
        <SectionHeader title="EMPLOYEES"/>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
            <EmpCard label="Total"                   value={totalEmp}    color="#7C3AED" icon="👥"/>
            <EmpCard label="Active"                  value={activeEmp}   color="#2563EB" icon="✅"/>
            <EmpCard label="In Active"               value={inactiveEmp} color="#EA580C" icon="⏸"/>
            <EmpCard label="Today's Absent"          value={todayAbsent} color="#16A34A" icon="📅"/>
            <EmpCard label="On Notice"               value={0}           color="#BE185D" icon="📋"/>
            <EmpCard label="Confirmations Due"       value={0}           color="#0F766E" icon="🎯"/>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <EmpCard label="This Month Addition"    value={0} color="#7C3AED" icon="➕"/>
            <EmpCard label="This Month Separation"  value={0} color="#2563EB" icon="➖"/>
            <EmpCard label="This Month Retiring"    value={0} color="#EA580C" icon="🏖"/>
          </div>
        </div>
      </div>

      {/* DEPARTMENT WISE */}
      <div className="glass-card overflow-hidden">
        <SectionHeader title="DEPARTMENT WISE"/>
        <div className="p-4">
          {deptWise.length === 0 ? (
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl text-white" style={{ background:'#2563EB' }}>
                <div className="text-xs font-semibold opacity-80 mb-1">Total</div>
                <div className="text-2xl font-bold">{totalEmp}</div>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {deptWise.map((d,i)=>{
                const COLORS=['#2563EB','#7C3AED','#EA580C','#16A34A','#BE185D'];
                return (
                  <div key={d.name} className="p-4 rounded-xl text-white min-w-[100px]" style={{ background: COLORS[i%COLORS.length] }}>
                    <div className="text-xs font-semibold opacity-80 mb-1">{d.name}</div>
                    <div className="text-2xl font-bold">{d.count}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* GENDER WISE + MIGRANT WISE side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass-card overflow-hidden">
          <SectionHeader title="GENDER WISE"/>
          <div className="p-4 flex flex-wrap gap-3">
            {[
              {l:'Total',v:genderCounts.total,c:'#2563EB'},
              {l:'Male',v:genderCounts.male,c:'#7C3AED'},
              {l:'Female',v:genderCounts.female,c:'#DB2777'},
              {l:'Transgender',v:genderCounts.other,c:'#059669'},
            ].map(({l,v,c})=>(
              <div key={l} className="p-3 rounded-xl text-white flex-1 min-w-[80px]" style={{ background: c }}>
                <div className="text-xs font-semibold opacity-80 mb-1">{l}</div>
                <div className="text-xl font-bold">{v}</div>
                {l!=='Total' && <div className="text-xs opacity-60">{genderCounts.total>0?Math.round(v/genderCounts.total*100):0}.00%</div>}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <SectionHeader title="MIGRANT WISE"/>
          <div className="p-4 flex flex-wrap gap-3">
            {[
              {l:'Total',v:totalEmp,c:'#D97706'},
              {l:'Migrants',v:0,c:'#16A34A'},
              {l:'Non-Migrants',v:totalEmp,c:'#2563EB'},
            ].map(({l,v,c})=>(
              <div key={l} className="p-3 rounded-xl text-white flex-1 min-w-[80px]" style={{ background: c }}>
                <div className="text-xs font-semibold opacity-80 mb-1">{l}</div>
                <div className="text-xl font-bold">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* WORKFORCE INSIGHTS */}
      <div className="glass-card overflow-hidden">
        <SectionHeader title="WORKFORCE INSIGHTS"/>
        <div className="p-4 space-y-4">
          <div className="flex gap-3 flex-wrap">
            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color:'var(--text-secondary)' }}>Type *</label>
              <select value={insightType} onChange={e=>setInsightType(e.target.value)} className="field-input w-36 text-sm">
                {['Monthly','Quarterly','Yearly'].map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color:'var(--text-secondary)' }}>Month *</label>
              <select value={insightMonth} onChange={e=>setInsightMonth(e.target.value)} className="field-input w-40 text-sm">
                {MONTHS_OPT.map(m=><option key={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              {l:'Attrition Rate',v:'0 %',c:'#D97706'},
              {l:'Retention Rate',v:'100 %',c:'#2563EB'},
              {l:'Absenteeism Rate',v:`${totalEmp>0?Math.round(todayAbsent/totalEmp*100):0} %`,c:'#7C3AED'},
              {l:'Female-to-Male',v:'0.00:100',c:'#DB2777'},
              {l:'Headcount Growth',v:'0 %',c:'#16A34A'},
            ].map(({l,v,c})=>(
              <div key={l} className="p-3 rounded-xl text-white" style={{ background: c }}>
                <div className="text-xs font-semibold opacity-80 mb-1">{l}</div>
                <div className="text-lg font-bold">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ATTENDANCE */}
      <div className="glass-card overflow-hidden">
        <SectionHeader title="ATTENDANCE"/>
        <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {l:'Total',v:totalEmp,c:'#7C3AED'},
            {l:'Present',v:todayPresent,c:'#16A34A'},
            {l:'On Time',v:todayPresent,c:'#EA580C'},
            {l:'Late Comers',v:lateComers,c:'#DB2777'},
          ].map(({l,v,c})=>(
            <div key={l} className="p-4 rounded-xl text-white" style={{ background: c }}>
              <div className="text-xs font-semibold opacity-80 mb-1">{l}</div>
              <div className="text-2xl font-bold">{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CALENDAR */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-2.5 border-b" style={{ borderColor:'var(--border)' }}>
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color:'var(--text-secondary)' }}>CALENDAR</h3>
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
            <h4 className="font-semibold" style={{ color:'var(--text-primary)' }}>{MONTHS_FULL[month]} {year}</h4>
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
