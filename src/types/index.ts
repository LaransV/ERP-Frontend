// ─── API ──────────────────────────────────────────────────────
export interface ApiResponse<T> { success: boolean; message: string; data: T; errors?: string[]; }
export interface PagedData<T> { content: T[]; page: number; size: number; totalElements: number; totalPages: number; }

// ─── Auth & Entitlement ───────────────────────────────────────
export interface LoginRequest { username: string; password: string; }

export interface Permission {
  moduleCode: string; moduleName: string;
  screenCode: string; screenName: string;
  canCreate: boolean; canRead: boolean; canUpdate: boolean; canDelete: boolean;
}

export interface AuthUser {
  userId:      number;
  username:    string;
  email:       string;
  fullName:    string;
  roleId:      number;
  roleName:    string;
  isActive:    boolean;
  companyId:   number | null;   // active company at login time
  companyName: string | null;
  permissions: Permission[];
}

export interface LoginResponse { accessToken: string; tokenType: string; user: AuthUser; }

// Role & Entitlement
export interface Module { moduleId: number; moduleCode: string; moduleName: string; icon: string; sortOrder: number; }
export interface Screen { screenId: number; screenCode: string; screenName: string; moduleId: number; moduleName: string; route: string; sortOrder: number; }

export interface RoleEntitlement {
  entitlementId: number; roleId: number; screenId: number; screenCode: string; screenName: string;
  moduleCode: string; moduleName: string;
  canCreate: boolean; canRead: boolean; canUpdate: boolean; canDelete: boolean;
}

// User-level entitlement row — returned by GET /admin/users/{id}/entitlements
export interface UserEntitlementRow {
  moduleId: number; moduleCode: string; moduleName: string; moduleSortOrder: number;
  screenId: number; screenCode: string; screenName: string; screenSortOrder: number;
  userEntitlementId: number | null;
  isUserOverride: boolean;   // true → saved specifically for this user; false → showing role default
  canCreate: boolean; canRead: boolean; canUpdate: boolean; canDelete: boolean;
}

export interface Role {
  roleId: number; roleName: string; roleDescription: string; isActive: boolean;
  createdAt: string; entitlements?: RoleEntitlement[];
}

export interface Company {
  companyId: number;
  companyName: string;
  currency: string;
  gstin?: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface User {
  userId: number; username: string; email: string; fullName: string; phone?: string; companyId: number;
  roleId: number; roleName: string; isActive: boolean; createdAt: string; lastLogin?: string;
}

// ─── Finance Module ───────────────────────────────────────────
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type PaymentMode = 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'UPI' | 'CARD';

export interface Client {
  clientId: number; clientName: string; email: string; phone: string;
  gstNumber?: string; panNumber?: string; address: string; city: string;
  state: string; pincode: string; paymentTerms: string;
  isActive: boolean; createdAt: string;
}

export interface Product {
  productId: number; productName: string; productCode: string; hsnCode?: string;
  productType: 'GOODS' | 'SERVICE'; unit: string; taxRate: number;
  purchasePrice: number; salePrice: number; openingStock: number;
  categoryName?: string; groupName?: string; isActive: boolean; createdAt: string;
}

export interface InvoiceItem {
  itemId?: number; productId: number; productName: string; hsnCode?: string;
  quantity: number; unit: string; unitPrice: number;
  discountPct: number; discountAmount: number; taxableAmount: number;
  cgstRate: number; cgstAmount: number; sgstRate: number; sgstAmount: number;
  igstRate: number; igstAmount: number; totalAmount: number;
}

export interface Invoice {
  invoiceId: number; invoiceNumber: string;
  clientId: number; clientName: string;
  invoiceDate: string; dueDate: string;
  status: InvoiceStatus; paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID';
  items: InvoiceItem[];
  subtotal: number; discountAmount: number; taxableAmount: number;
  cgstTotal: number; sgstTotal: number; igstTotal: number; taxTotal: number;
  tdsPct: number; tdsAmount: number; roundOff: number; grandTotal: number;
  paidAmount: number; balanceAmount: number;
  notes?: string; terms?: string; isInterstate: boolean; createdAt: string;
}

export interface FinanceDashboard {
  totalInvoices: number; totalRevenue: number;
  dueCount: number; dueAmount: number; overdueCount: number; overdueAmount: number;
  paidCount: number; paidAmount: number;
  monthlyData: { month: string; invoiced: number; collected: number }[];
}

// ─── HR Module ────────────────────────────────────────────────
export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'ON_NOTICE' | 'RESIGNED';

export interface Department { deptId: number; deptName: string; headName?: string; employeeCount: number; }
export interface Designation { desigId: number; desigName: string; level: number; }

export interface Employee {
  empId: number; empCode: string; firstName: string; lastName: string;
  fullName: string; email: string; phone: string;
  deptId: number; deptName: string; desigId: number; desigName: string;
  dateOfJoining: string; dateOfBirth?: string; gender: 'MALE' | 'FEMALE' | 'OTHER';
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT';
  status: EmployeeStatus; basicSalary: number;
  pfNumber?: string; esiNumber?: string; panNumber?: string;
  reportingManagerId?: number; reportingManagerName?: string;
  address?: string; city?: string; state?: string; createdAt: string;
}

export interface AttendanceRecord {
  attendanceId: number; empId: number; empName: string; empCode: string;
  attendanceDate: string; checkIn?: string; checkOut?: string;
  durationMinutes: number; status: 'PRESENT' | 'ABSENT' | 'LEAVE' | 'HOLIDAY' | 'HALF_DAY';
  source: 'MANUAL' | 'BIOMETRIC'; notes?: string;
}

export interface Payroll {
  payrollId: number; empId: number; empName: string; empCode: string;
  month: number; year: number; daysWorked: number; lopDays: number;
  grossSalary: number; totalDeductions: number; netSalary: number;
  pfEmployee: number; pfEmployer: number; esiEmployee: number; esiEmployer: number;
  tdsAmount: number; professionalTax: number;
  status: 'DRAFT' | 'PROCESSED' | 'PAID'; processedAt?: string; paidAt?: string;
}

export interface HRDashboard {
  totalEmployees: number; activeEmployees: number; onNotice: number;
  todayPresent: number; todayAbsent: number; newJoiningThisMonth: number;
  separationsThisMonth: number; departmentWise: { deptName: string; count: number }[];
}

// ─── Inventory Module ─────────────────────────────────────────
export interface StockItem {
  stockId: number; productId: number; productName: string; productCode: string;
  hsnCode?: string; unit: string; categoryName?: string;
  openingStock: number; currentStock: number; reservedStock: number; availableStock: number;
  reorderLevel: number; purchasePrice: number; stockValue: number; lastUpdated: string;
}

export interface StockMovement {
  movementId: number; productId: number; productName: string;
  movementType: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER';
  quantity: number; referenceType: string; referenceNumber: string;
  warehouseFrom?: string; warehouseTo?: string;
  notes?: string; createdBy: string; createdAt: string;
}

export interface PurchaseOrder {
  poId: number; poNumber: string; vendorId: number; vendorName: string;
  poDate: string; expectedDate?: string;
  status: 'DRAFT' | 'APPROVED' | 'RECEIVED' | 'CANCELLED';
  items: { productId: number; productName: string; quantity: number; unitPrice: number; totalAmount: number }[];
  totalAmount: number; notes?: string; createdAt: string;
}

export interface InventoryDashboard {
  totalItems: number; totalStockValue: number; lowStockCount: number; outOfStockCount: number;
  recentMovements: StockMovement[]; lowStockItems: StockItem[];
}

// ─── CRM Module ───────────────────────────────────────────────
export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';

export interface Lead {
  leadId: number; leadName: string; company?: string; email?: string; phone: string;
  source: string; status: LeadStatus; priority: 'LOW' | 'MEDIUM' | 'HIGH';
  assignedToId?: number; assignedToName?: string;
  expectedValue?: number; expectedCloseDate?: string;
  notes?: string; rejectedReason?: string;
  nextFollowupDate?: string; lastActivityAt?: string;
  convertedToClientId?: number; createdAt: string;
}

export interface Followup {
  followupId: number; leadId: number; leadName: string;
  scheduledAt: string; completedAt?: string; notes: string;
  followupType: 'CALL' | 'EMAIL' | 'VISIT' | 'DEMO' | 'OTHER';
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
  createdBy: string;
}

export interface Activity {
  activityId: number; leadId?: number; clientId?: number; entityName: string;
  activityType: 'CALL' | 'EMAIL' | 'MEETING' | 'NOTE' | 'TASK';
  title: string; description?: string;
  scheduledAt?: string; completedAt?: string;
  status: 'OPEN' | 'DONE' | 'CANCELLED';
  createdBy: string; createdAt: string;
}

export interface CRMDashboard {
  totalLeads: number; newLeads: number; wonLeads: number; lostLeads: number;
  conversionRate: number; totalPipelineValue: number;
  statusWise: { status: string; count: number; value: number }[];
  recentFollowups: Followup[];
}
