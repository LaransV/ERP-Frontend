"use client";
import { useState } from 'react';
import { useQuery } from '@/hooks/useQuery';
import { getCRMDash, getFollowups, getActivities, getLeads } from '@/services/api/crm';
import { CRMDashRes, FollowupsRes, ActivitiesRes, LeadsRes } from '@/schemas/crm/response';

export const useCrmDashLogic = () => {
  const [calView, setCalView] = useState<'month'|'week'|'day'>('month');

  const { data: dashRes  } = useQuery({ apiConfig: getCRMDash,    responseSchema: CRMDashRes    });
  const { data: followRes } = useQuery({ apiConfig: getFollowups,  responseSchema: FollowupsRes  });
  const { data: actRes    } = useQuery({ apiConfig: getActivities, responseSchema: ActivitiesRes });
  const { data: leadsRes  } = useQuery({ apiConfig: getLeads,      responseSchema: LeadsRes      });

  const today = new Date().toISOString().slice(0, 10);
  const todayFollowups = (followRes?.data?.content ?? []).filter(f => f.scheduledAt?.startsWith(today));
  const activities     = actRes?.data?.content ?? [];
  const leads          = leadsRes?.data?.content ?? [];

  // Calendar days for current month
  const now = new Date();
  const year = now.getFullYear(), month = now.getMonth();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const startDay    = new Date(year, month, 1).getDay();
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  return { 
    dash: dashRes?.data, todayFollowups, activities, leads,
    calView, setCalView, now, year, month, daysInMonth, startDay, MONTHS,
  };
};
