"use client";
import { useQuery } from '@/hooks/useQuery';
import { useAuthStore } from '@/store/authStore';
import { getFinanceDash } from '@/services/api/finance';
import { getHRDash } from '@/services/api/hr';
import { getInvDash } from '@/services/api/inventory';
import { getCRMDash } from '@/services/api/crm';
import { FinDashRes } from '@/schemas/finance/response';
import { HRDashRes } from '@/schemas/hr/response';
import { InvDashRes } from '@/schemas/inventory/response';
import { CRMDashRes } from '@/schemas/crm/response';

export const useDashboardLogic = () => {
  const { user, activeModule } = useAuthStore();

  const { data: finData, isLoading: finL } = useQuery({ apiConfig:getFinanceDash, responseSchema:FinDashRes });
  const { data: hrData,  isLoading: hrL  } = useQuery({ apiConfig:getHRDash,       responseSchema:HRDashRes  });
  const { data: invData, isLoading: invL } = useQuery({ apiConfig:getInvDash,      responseSchema:InvDashRes });
  const { data: crmData, isLoading: crmL } = useQuery({ apiConfig:getCRMDash,      responseSchema:CRMDashRes });

  return {
    user, finDash: finData?.data, hrDash: hrData?.data,
    invDash: invData?.data, crmDash: crmData?.data,
    isLoading: finL || hrL || invL || crmL,
  };
};
