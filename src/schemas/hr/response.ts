import { z } from 'zod';
import { BaseResponse, PagedSchema, coerceBool } from '@/schemas/template/response';

const EmployeeSchema = z.object({
  empId:z.number(), empCode:z.string(), fullName:z.string(),
  firstName:z.string().nullable().optional(), lastName:z.string().nullable().optional(),
  email:z.string().nullable().optional(), phone:z.string().nullable().optional(),
  deptId:z.coerce.number().optional(), deptName:z.string().nullable().optional(),
  desigId:z.coerce.number().optional(), desigName:z.string().nullable().optional(),
  dateOfJoining:z.string().nullable().optional(), basicSalary:z.coerce.number(),
  status:z.string().nullable().optional(), isActive:coerceBool.optional(),
});
const DeptSchema  = z.object({ departmentId:z.number(), departmentName:z.string() });
const DesigSchema = z.object({ designationId:z.number(), designationName:z.string() });
const AttSchema   = z.object({
  attendanceId:z.number(), empId:z.number(), empCode:z.string().nullable().optional(),
  empName:z.string(), attendanceDate:z.string(),
  checkIn:z.string().nullable().optional(), checkOut:z.string().nullable().optional(),
  durationMinutes:z.coerce.number().optional(), status:z.string(),
  notes:z.string().nullable().optional(),
});
const PayrollSchema = z.object({
  payrollId:z.number(), empId:z.number(), empCode:z.string().nullable().optional(),
  empName:z.string(), month:z.number(), year:z.number(),
  daysWorked:z.coerce.number(), grossSalary:z.coerce.number(),
  pfEmployee:z.coerce.number().optional(), totalDeductions:z.coerce.number(),
  netSalary:z.coerce.number(), status:z.string(),
});
const HRDashSchema = z.object({
  totalEmployees:z.coerce.number(), activeEmployees:z.coerce.number().optional(),
  todayPresent:z.coerce.number().optional(), todayAbsent:z.coerce.number().optional(),
  newJoiningThisMonth:z.coerce.number().optional(), payrollProcessed:z.coerce.number().optional(),
  deptWise:z.array(z.any()).optional(),
});

export const EmployeesRes =BaseResponse.extend({data:PagedSchema(EmployeeSchema).nullable().optional()});
export const EmployeeRes  =BaseResponse.extend({data:EmployeeSchema.nullable().optional()});
export const DeptsRes     =BaseResponse.extend({data:z.array(DeptSchema).nullable().optional()});
export const DesigRes     =BaseResponse.extend({data:z.array(DesigSchema).nullable().optional()});
export const AttendanceRes=BaseResponse.extend({data:PagedSchema(AttSchema).nullable().optional()});
export const PayrollRes   =BaseResponse.extend({data:PagedSchema(PayrollSchema).nullable().optional()});
export const HRDashRes    =BaseResponse.extend({data:HRDashSchema.nullable().optional()});
export type TEmployee=z.infer<typeof EmployeeSchema>;   export type TDepartment=z.infer<typeof DeptSchema>;
export type TDesignation=z.infer<typeof DesigSchema>;   export type TAttendance=z.infer<typeof AttSchema>;
export type TPayroll=z.infer<typeof PayrollSchema>;     export type THRDash=z.infer<typeof HRDashSchema>;
