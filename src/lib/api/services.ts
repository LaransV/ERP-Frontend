import api from './client';
import type {
  ApiResponse, PagedData,
  LoginRequest, LoginResponse,
  User, Role, RoleEntitlement, UserEntitlementRow, Module, Screen,
  Client, Product, Invoice, InvoiceItem, FinanceDashboard,
  Employee, AttendanceRecord, Payroll, HRDashboard, Department, Designation,
  StockItem, StockMovement, PurchaseOrder, InventoryDashboard,
  Lead, Followup, Activity, CRMDashboard,
} from '@/types';

// ─── Auth ─────────────────────────────────────────────────────
export const authApi = {
  login:   (d: LoginRequest) => api.post<ApiResponse<LoginResponse>>('/auth/login', d),
  logout:  ()                => api.post<ApiResponse<void>>('/auth/logout'),
  me:      ()                => api.get<ApiResponse<LoginResponse['user']>>('/auth/me'),
};

// ─── Admin — Users ────────────────────────────────────────────
export const usersApi = {
  list:   (p?: object)              => api.get<ApiResponse<PagedData<User>>>('/admin/users', { params: p }),
  get:    (id: number)              => api.get<ApiResponse<User>>(`/admin/users/${id}`),
  create: (d: Partial<User> & { password: string }) => api.post<ApiResponse<User>>('/admin/users', d),
  update: (id: number, d: Partial<User>)            => api.put<ApiResponse<User>>(`/admin/users/${id}`, d),
  toggle: (id: number)              => api.patch<ApiResponse<void>>(`/admin/users/${id}/toggle`),
  delete: (id: number)              => api.delete<ApiResponse<void>>(`/admin/users/${id}`),
  // ── User-level screen entitlements ────────────────────────
  getUserEntitlements:  (id: number) =>
    api.get<ApiResponse<UserEntitlementRow[]>>(`/admin/users/${id}/entitlements`),
  saveUserEntitlements: (id: number, screens: { screenId: number; canCreate: boolean; canRead: boolean; canUpdate: boolean; canDelete: boolean }[]) =>
    api.post<ApiResponse<void>>(`/admin/users/${id}/entitlements`, { screens }),
  resetUserEntitlements: (id: number) =>
    api.delete<ApiResponse<void>>(`/admin/users/${id}/entitlements`),

};

// ─── Admin — Roles ────────────────────────────────────────────
export const rolesApi = {
  list:             ()                     => api.get<ApiResponse<Role[]>>('/admin/roles'),
  get:              (id: number)           => api.get<ApiResponse<Role>>(`/admin/roles/${id}`),
  create:           (d: Partial<Role>)     => api.post<ApiResponse<Role>>('/admin/roles', d),
  update:           (id: number, d: Partial<Role>) => api.put<ApiResponse<Role>>(`/admin/roles/${id}`, d),
  delete:           (id: number)           => api.delete<ApiResponse<void>>(`/admin/roles/${id}`),
  getEntitlements:  (id: number)           => api.get<ApiResponse<RoleEntitlement[]>>(`/admin/roles/${id}/entitlements`),
  saveEntitlements: (id: number, d: RoleEntitlement[]) => api.post<ApiResponse<void>>(`/admin/roles/${id}/entitlements`, d),
};

export const modulesApi = {
  list: () => api.get<ApiResponse<Module[]>>('/admin/modules'),
};
export const screensApi = {
  list: (moduleId?: number) => api.get<ApiResponse<Screen[]>>('/admin/screens', { params: { moduleId } }),
};

// ─── Admin — Companies ────────────────────────────────────────
export const companiesApi = {
  list:   ()                            => api.get<ApiResponse<any[]>>('/admin/companies'),
  create: (d: any)                      => api.post<ApiResponse<any>>('/admin/companies', d),
  update: (id: number, d: any)          => api.put<ApiResponse<any>>(`/admin/companies/${id}`, d),
  delete: (id: number)                  => api.delete<ApiResponse<void>>(`/admin/companies/${id}`),
};

// ─── Finance — Clients ────────────────────────────────────────
export const clientsApi = {
  list:   (p?: object)           => api.get<ApiResponse<PagedData<Client>>>('/finance/clients', { params: p }),
  search: (q: string)            => api.get<ApiResponse<Client[]>>('/finance/clients/search', { params: { q } }),
  get:    (id: number)           => api.get<ApiResponse<Client>>(`/finance/clients/${id}`),
  create: (d: Partial<Client>)   => api.post<ApiResponse<Client>>('/finance/clients', d),
  update: (id: number, d: Partial<Client>) => api.put<ApiResponse<Client>>(`/finance/clients/${id}`, d),
  delete: (id: number)           => api.delete<ApiResponse<void>>(`/finance/clients/${id}`),
};

// ─── Finance — Products ───────────────────────────────────────
export const productsApi = {
  list:   (p?: object)           => api.get<ApiResponse<PagedData<Product>>>('/finance/products', { params: p }),
  search: (q: string)            => api.get<ApiResponse<Product[]>>('/finance/products/search', { params: { q } }),
  get:    (id: number)           => api.get<ApiResponse<Product>>(`/finance/products/${id}`),
  create: (d: Partial<Product>)  => api.post<ApiResponse<Product>>('/finance/products', d),
  update: (id: number, d: Partial<Product>) => api.put<ApiResponse<Product>>(`/finance/products/${id}`, d),
  delete: (id: number)           => api.delete<ApiResponse<void>>(`/finance/products/${id}`),
};

// ─── Finance — Invoices ───────────────────────────────────────
export const invoicesApi = {
  list:         (p?: object)                      => api.get<ApiResponse<PagedData<Invoice>>>('/finance/invoices', { params: p }),
  get:          (id: number)                      => api.get<ApiResponse<Invoice>>(`/finance/invoices/${id}`),
  create:       (d: Partial<Invoice>)             => api.post<ApiResponse<Invoice>>('/finance/invoices', d),
  update:       (id: number, d: Partial<Invoice>) => api.put<ApiResponse<Invoice>>(`/finance/invoices/${id}`, d),
  updateStatus: (id: number, status: string)      => api.patch<ApiResponse<void>>(`/finance/invoices/${id}/status`, { status }),
  delete:       (id: number)                      => api.delete<ApiResponse<void>>(`/finance/invoices/${id}`),
  dashboard:    ()                                => api.get<ApiResponse<FinanceDashboard>>('/finance/dashboard'),
  pdf:          (id: number)                      => api.get(`/finance/invoices/${id}/pdf`, { responseType: 'blob' }),
};

// ─── HR — Employees ───────────────────────────────────────────
export const employeesApi = {
  list:   (p?: object)              => api.get<ApiResponse<PagedData<Employee>>>('/hr/employees', { params: p }),
  get:    (id: number)              => api.get<ApiResponse<Employee>>(`/hr/employees/${id}`),
  create: (d: Partial<Employee>)    => api.post<ApiResponse<Employee>>('/hr/employees', d),
  update: (id: number, d: Partial<Employee>) => api.put<ApiResponse<Employee>>(`/hr/employees/${id}`, d),
  delete: (id: number)              => api.delete<ApiResponse<void>>(`/hr/employees/${id}`),
  dashboard: ()                     => api.get<ApiResponse<HRDashboard>>('/hr/dashboard'),
};
export const departmentsApi = {
  list: () => api.get<ApiResponse<Department[]>>('/hr/departments'),
  create: (d: Partial<Department>) => api.post<ApiResponse<Department>>('/hr/departments', d),
  delete: (id: number) => api.delete<ApiResponse<void>>(`/hr/departments/${id}`),
};
export const designationsApi = {
  list: () => api.get<ApiResponse<Designation[]>>('/hr/designations'),
};

// ─── HR — Attendance ──────────────────────────────────────────
export const attendanceApi = {
  list:   (p?: object)                    => api.get<ApiResponse<PagedData<AttendanceRecord>>>('/hr/attendance', { params: p }),
  create: (d: Partial<AttendanceRecord>)  => api.post<ApiResponse<AttendanceRecord>>('/hr/attendance', d),
  update: (id: number, d: Partial<AttendanceRecord>) => api.put<ApiResponse<AttendanceRecord>>(`/hr/attendance/${id}`, d),
  delete: (id: number)                    => api.delete<ApiResponse<void>>(`/hr/attendance/${id}`),
  bulkImport: (d: Partial<AttendanceRecord>[]) => api.post<ApiResponse<void>>('/hr/attendance/bulk', d),
};

// ─── HR — Payroll ─────────────────────────────────────────────
export const payrollApi = {
  list:    (p?: object)          => api.get<ApiResponse<PagedData<Payroll>>>('/hr/payroll', { params: p }),
  get:     (id: number)          => api.get<ApiResponse<Payroll>>(`/hr/payroll/${id}`),
  process: (month: number, year: number) => api.post<ApiResponse<void>>('/hr/payroll/process', { month, year }),
  markPaid:(id: number)          => api.patch<ApiResponse<void>>(`/hr/payroll/${id}/paid`),
};

// ─── Inventory — Stock ────────────────────────────────────────
export const stockApi = {
  list:      (p?: object)           => api.get<ApiResponse<PagedData<StockItem>>>('/inventory/stock', { params: p }),
  get:       (id: number)           => api.get<ApiResponse<StockItem>>(`/inventory/stock/${id}`),
  movements: (p?: object)           => api.get<ApiResponse<PagedData<StockMovement>>>('/inventory/movements', { params: p }),
  adjust:    (d: { productId: number; quantity: number; type: string; notes: string }) =>
             api.post<ApiResponse<void>>('/inventory/stock/adjust', d),
  dashboard: ()                     => api.get<ApiResponse<InventoryDashboard>>('/inventory/dashboard'),
};

// ─── Inventory — Purchase Orders ──────────────────────────────
export const purchaseOrdersApi = {
  list:   (p?: object)             => api.get<ApiResponse<PagedData<PurchaseOrder>>>('/inventory/purchase-orders', { params: p }),
  get:    (id: number)             => api.get<ApiResponse<PurchaseOrder>>(`/inventory/purchase-orders/${id}`),
  create: (d: Partial<PurchaseOrder>) => api.post<ApiResponse<PurchaseOrder>>('/inventory/purchase-orders', d),
  update: (id: number, d: Partial<PurchaseOrder>) => api.put<ApiResponse<PurchaseOrder>>(`/inventory/purchase-orders/${id}`, d),
  approve:(id: number)             => api.patch<ApiResponse<void>>(`/inventory/purchase-orders/${id}/approve`),
  delete: (id: number)             => api.delete<ApiResponse<void>>(`/inventory/purchase-orders/${id}`),
};

// ─── CRM — Leads ──────────────────────────────────────────────
export const leadsApi = {
  list:   (p?: object)         => api.get<ApiResponse<PagedData<Lead>>>('/crm/leads', { params: p }),
  get:    (id: number)         => api.get<ApiResponse<Lead>>(`/crm/leads/${id}`),
  create: (d: Partial<Lead>)   => api.post<ApiResponse<Lead>>('/crm/leads', d),
  update: (id: number, d: Partial<Lead>) => api.put<ApiResponse<Lead>>(`/crm/leads/${id}`, d),
  updateStatus: (id: number, status: string) => api.patch<ApiResponse<void>>(`/crm/leads/${id}/status`, { status }),
  delete: (id: number)         => api.delete<ApiResponse<void>>(`/crm/leads/${id}`),
  convert:(id: number)         => api.post<ApiResponse<{ clientId: number }>>(`/crm/leads/${id}/convert`),
  dashboard: ()                => api.get<ApiResponse<CRMDashboard>>('/crm/dashboard'),
};

// ─── CRM — Followups ──────────────────────────────────────────
export const followupsApi = {
  list:   (p?: object)             => api.get<ApiResponse<PagedData<Followup>>>('/crm/followups', { params: p }),
  create: (d: Partial<Followup>)   => api.post<ApiResponse<Followup>>('/crm/followups', d),
  update: (id: number, d: Partial<Followup>) => api.put<ApiResponse<Followup>>(`/crm/followups/${id}`, d),
  complete:(id: number, notes: string) => api.patch<ApiResponse<void>>(`/crm/followups/${id}/complete`, { notes }),
  delete: (id: number)             => api.delete<ApiResponse<void>>(`/crm/followups/${id}`),
};

// ─── CRM — Activities ─────────────────────────────────────────
export const activitiesApi = {
  list:   (p?: object)             => api.get<ApiResponse<PagedData<Activity>>>('/crm/activities', { params: p }),
  create: (d: Partial<Activity>)   => api.post<ApiResponse<Activity>>('/crm/activities', d),
  update: (id: number, d: Partial<Activity>) => api.put<ApiResponse<Activity>>(`/crm/activities/${id}`, d),
  delete: (id: number)             => api.delete<ApiResponse<void>>(`/crm/activities/${id}`),
};
