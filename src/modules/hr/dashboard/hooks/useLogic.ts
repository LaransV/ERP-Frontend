"use client";
import { useState } from 'react';
import { useQuery } from '@/hooks/useQuery';
import { useAuthStore } from '@/store/authStore';
import { getHRDash, getEmployees, getDepartments, getAttendance } from '@/services/api/hr';
import { HRDashRes, EmployeesRes, DeptsRes, AttendanceRes } from '@/schemas/hr/response';

export const useHrDashLogic = () => {
  const { canAccess } = useAuthStore();
  const [insightType,  setInsightType]  = useState('Monthly');
  const [insightMonth, setInsightMonth] = useState(new Date().toISOString().slice(0,7));
  const [calView, setCalView] = useState<'month'|'week'|'day'>('month');
  const canCreate = canAccess('FINANCE_CLIENTS','create');
  const canUpdate = canAccess('FINANCE_CLIENTS','update');
  const canDelete = canAccess('FINANCE_CLIENTS','delete');

  const { data: dashRes  } = useQuery({ apiConfig: getHRDash,     responseSchema: HRDashRes     });
  const { data: empRes   } = useQuery({ apiConfig: getEmployees,  responseSchema: EmployeesRes  });
  const { data: deptRes  } = useQuery({ apiConfig: getDepartments,responseSchema: DeptsRes      });
  const { data: attRes   } = useQuery({
    apiConfig: getAttendance, responseSchema: AttendanceRes,
    payload: { date: new Date().toISOString().slice(0,10) },
  });

  const employees = empRes?.data?.content ?? [];
  const depts     = deptRes?.data ?? [];
  const att       = attRes?.data?.content ?? [];
  const dash      = dashRes?.data;

  const totalEmp    = employees.length;
  const activeEmp   = employees.filter(e=>e.isActive!==false).length;
  const inactiveEmp = employees.filter(e=>e.isActive===false).length;

  const todayPresent = att.filter(a=>a.status==='PRESENT').length;
  const todayAbsent  = att.filter(a=>a.status==='ABSENT').length;
  const onLeave      = att.filter(a=>a.status==='LEAVE').length;
  const lateComers   = 0;

  const genderCounts = { total: totalEmp, male: 0, female: 0, other: 0 };

  // Department wise
  const deptWise = depts.map(d=>({
    name: d.departmentName,
    count: employees.filter(e=>e.deptId===d.departmentId).length,
  })).filter(d=>d.count>0);

  const now = new Date();
  const year = now.getFullYear(), month = now.getMonth();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const startDay    = new Date(year, month, 1).getDay();
  const MONTHS_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const MONTHS_OPT  = Array.from({length:12},(_,i)=>{ const d=new Date(now.getFullYear(),now.getMonth()-i,1); return `${MONTHS_FULL[d.getMonth()]}-${d.getFullYear()}`; });

  return {
    totalEmp, activeEmp, inactiveEmp, todayPresent, todayAbsent, onLeave, lateComers,
    genderCounts, deptWise, att, dash,
    insightType, setInsightType, insightMonth, setInsightMonth, MONTHS_OPT,
    calView, setCalView, now, year, month, daysInMonth, startDay, MONTHS_FULL,canCreate, canUpdate, canDelete
  };
};
