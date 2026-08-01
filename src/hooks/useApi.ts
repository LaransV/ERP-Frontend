import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  authApi, usersApi, rolesApi, modulesApi, screensApi,
  clientsApi, productsApi, invoicesApi, companiesApi,
  employeesApi, departmentsApi, designationsApi, attendanceApi, payrollApi,
  stockApi, purchaseOrdersApi,
  leadsApi, followupsApi, activitiesApi,
} from '@/lib/api/services';
import type { Invoice, Employee, Lead, Followup, Activity, PurchaseOrder, AttendanceRecord } from '@/types';
import { toast } from 'sonner';

// ─── Auth ─────────────────────────────────────────────────────
export const useMe = () => useQuery({ queryKey: ['me'], queryFn: () => authApi.me().then(r => r.data.data) });

// ─── Admin ────────────────────────────────────────────────────
export const useUsers   = (p?: object) => useQuery({ queryKey: ['users', p],   queryFn: () => usersApi.list(p).then(r => r.data.data) });
export const useRoles   = ()           => useQuery({ queryKey: ['roles'],       queryFn: () => rolesApi.list().then(r => r.data.data) });
export const useRole    = (id: number) => useQuery({ queryKey: ['roles', id],   queryFn: () => rolesApi.get(id).then(r => r.data.data), enabled: !!id });
export const useModules = ()           => useQuery({ queryKey: ['modules'],     queryFn: () => modulesApi.list().then(r => r.data.data) });
export const useScreens = (mId?: number) => useQuery({ queryKey: ['screens', mId], queryFn: () => screensApi.list(mId).then(r => r.data.data) });
export const useRoleEntitlements = (id: number) => useQuery({ queryKey: ['entitlements', id], queryFn: () => rolesApi.getEntitlements(id).then(r => r.data.data), enabled: !!id });

export const useSaveEntitlements = (roleId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: Parameters<typeof rolesApi.saveEntitlements>[1]) => rolesApi.saveEntitlements(roleId, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['entitlements', roleId] }); toast.success('Entitlements saved'); },
  });
};

// ─── Finance ──────────────────────────────────────────────────
export const useClients       = (p?: object) => useQuery({ queryKey: ['clients', p],   queryFn: () => clientsApi.list(p).then(r => r.data.data) });
export const useClient        = (id: number) => useQuery({ queryKey: ['clients', id],  queryFn: () => clientsApi.get(id).then(r => r.data.data), enabled: !!id });
export const useProducts      = (p?: object) => useQuery({ queryKey: ['products', p],  queryFn: () => productsApi.list(p).then(r => r.data.data) });
export const useProduct       = (id: number) => useQuery({ queryKey: ['products', id], queryFn: () => productsApi.get(id).then(r => r.data.data), enabled: !!id });
export const useInvoices      = (p?: object) => useQuery({ queryKey: ['invoices', p],  queryFn: () => invoicesApi.list(p).then(r => r.data.data) });
export const useInvoice       = (id: number) => useQuery({ queryKey: ['invoices', id], queryFn: () => invoicesApi.get(id).then(r => r.data.data), enabled: !!id });
export const useFinanceDash   = ()           => useQuery({ queryKey: ['finance-dash'], queryFn: () => invoicesApi.dashboard().then(r => r.data.data), staleTime: 30000 });

export const useCreateInvoice = () => { const qc = useQueryClient();
  return useMutation({ mutationFn: (d: Partial<Invoice>) => invoicesApi.create(d).then(r => r.data.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['invoices'] }); toast.success('Invoice created'); } }); };

export const useUpdateInvoice = (id: number) => { const qc = useQueryClient();
  return useMutation({ mutationFn: (d: Partial<Invoice>) => invoicesApi.update(id, d).then(r => r.data.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['invoices'] }); toast.success('Invoice updated'); } }); };

export const useDeleteInvoice = () => { const qc = useQueryClient();
  return useMutation({ mutationFn: (id: number) => invoicesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['invoices'] }); toast.success('Invoice deleted'); } }); };

export const useMutateClient  = (id?: number) => { const qc = useQueryClient();
  return useMutation({ mutationFn: (d: Parameters<typeof clientsApi.create>[0]) => id ? clientsApi.update(id, d).then(r => r.data.data) : clientsApi.create(d).then(r => r.data.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); toast.success(id ? 'Client updated' : 'Client created'); } }); };

export const useMutateProduct = (id?: number) => { const qc = useQueryClient();
  return useMutation({ mutationFn: (d: Parameters<typeof productsApi.create>[0]) => id ? productsApi.update(id, d).then(r => r.data.data) : productsApi.create(d).then(r => r.data.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); toast.success(id ? 'Product updated' : 'Product created'); } }); };

// ─── HR ───────────────────────────────────────────────────────
export const useEmployees    = (p?: object) => useQuery({ queryKey: ['employees', p],    queryFn: () => employeesApi.list(p).then(r => r.data.data) });
export const useEmployee     = (id: number) => useQuery({ queryKey: ['employees', id],   queryFn: () => employeesApi.get(id).then(r => r.data.data), enabled: !!id });
export const useDepartments  = ()           => useQuery({ queryKey: ['departments'],      queryFn: () => departmentsApi.list().then(r => r.data.data) });
export const useDesignations = ()           => useQuery({ queryKey: ['designations'],     queryFn: () => designationsApi.list().then(r => r.data.data) });
export const useAttendance   = (p?: object) => useQuery({ queryKey: ['attendance', p],   queryFn: () => attendanceApi.list(p).then(r => r.data.data) });
export const usePayroll      = (p?: object) => useQuery({ queryKey: ['payroll', p],      queryFn: () => payrollApi.list(p).then(r => r.data.data) });
export const useHRDash       = ()           => useQuery({ queryKey: ['hr-dash'],          queryFn: () => employeesApi.dashboard().then(r => r.data.data), staleTime: 30000 });

export const useMutateEmployee = (id?: number) => { const qc = useQueryClient();
  return useMutation({ mutationFn: (d: Partial<Employee>) => id ? employeesApi.update(id, d).then(r => r.data.data) : employeesApi.create(d).then(r => r.data.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['employees'] }); toast.success(id ? 'Employee updated' : 'Employee created'); } }); };

export const useMutateAttendance = (id?: number) => { const qc = useQueryClient();
  return useMutation({ mutationFn: (d: Partial<AttendanceRecord>) => id ? attendanceApi.update(id, d).then(r => r.data.data) : attendanceApi.create(d).then(r => r.data.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['attendance'] }); toast.success('Attendance saved'); } }); };

// ─── Inventory ────────────────────────────────────────────────
export const useStock        = (p?: object) => useQuery({ queryKey: ['stock', p],          queryFn: () => stockApi.list(p).then(r => r.data.data) });
export const useMovements    = (p?: object) => useQuery({ queryKey: ['movements', p],      queryFn: () => stockApi.movements(p).then(r => r.data.data) });
export const usePurchaseOrders = (p?: object) => useQuery({ queryKey: ['purchase-orders', p], queryFn: () => purchaseOrdersApi.list(p).then(r => r.data.data) });
export const useInventoryDash  = ()           => useQuery({ queryKey: ['inv-dash'],          queryFn: () => stockApi.dashboard().then(r => r.data.data), staleTime: 30000 });

export const useMutatePO = (id?: number) => { const qc = useQueryClient();
  return useMutation({ mutationFn: (d: Partial<PurchaseOrder>) => id ? purchaseOrdersApi.update(id, d).then(r => r.data.data) : purchaseOrdersApi.create(d).then(r => r.data.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['purchase-orders'] }); toast.success(id ? 'PO updated' : 'PO created'); } }); };

// ─── CRM ──────────────────────────────────────────────────────
export const useLeads     = (p?: object) => useQuery({ queryKey: ['leads', p],      queryFn: () => leadsApi.list(p).then(r => r.data.data) });
export const useLead      = (id: number) => useQuery({ queryKey: ['leads', id],     queryFn: () => leadsApi.get(id).then(r => r.data.data), enabled: !!id });
export const useFollowups = (p?: object) => useQuery({ queryKey: ['followups', p],  queryFn: () => followupsApi.list(p).then(r => r.data.data) });
export const useActivities= (p?: object) => useQuery({ queryKey: ['activities', p], queryFn: () => activitiesApi.list(p).then(r => r.data.data) });
export const useCRMDash   = ()           => useQuery({ queryKey: ['crm-dash'],       queryFn: () => leadsApi.dashboard().then(r => r.data.data), staleTime: 30000 });

export const useMutateLead = (id?: number) => { const qc = useQueryClient();
  return useMutation({ mutationFn: (d: Partial<Lead>) => id ? leadsApi.update(id, d).then(r => r.data.data) : leadsApi.create(d).then(r => r.data.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['leads'] }); toast.success(id ? 'Lead updated' : 'Lead created'); } }); };

export const useMutateFollowup = (id?: number) => { const qc = useQueryClient();
  return useMutation({ mutationFn: (d: Partial<Followup>) => id ? followupsApi.update(id, d).then(r => r.data.data) : followupsApi.create(d).then(r => r.data.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['followups'] }); toast.success('Followup saved'); } }); };

export const useMutateActivity = (id?: number) => { const qc = useQueryClient();
  return useMutation({ mutationFn: (d: Partial<Activity>) => id ? activitiesApi.update(id, d).then(r => r.data.data) : activitiesApi.create(d).then(r => r.data.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['activities'] }); toast.success('Activity saved'); } }); };


    // ─── User Entitlements (user-specific screen access) ──────────
export const useUserEntitlements = (userId: number) =>
  useQuery({
    queryKey: ['user-entitlements', userId],
    queryFn:  () => usersApi.getUserEntitlements(userId).then(r => r.data.data ?? []),
    enabled:  !!userId,
  });

export const useSaveUserEntitlements = (userId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (screens: Parameters<typeof usersApi.saveUserEntitlements>[1]) =>
      usersApi.saveUserEntitlements(userId, screens),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-entitlements', userId] });
      toast.success('User entitlements saved');
    },
    onError: () => toast.error('Failed to save entitlements'),
  });
};

export const useResetUserEntitlements = (userId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => usersApi.resetUserEntitlements(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-entitlements', userId] });
      toast.success('Reset to role defaults');
    },
    onError: () => toast.error('Failed to reset'),
  });
};

// ─── Companies ────────────────────────────────────────────────
export const useCompanies = () =>
  useQuery({
    queryKey: ['companies'],
    queryFn:  () => companiesApi.list().then(r => r.data.data ?? []),
  });

