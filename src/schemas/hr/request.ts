import { z } from 'zod';
export const EmployeeSchema = z.object({
  firstName:z.string().min(1,'First name required'), lastName:z.string().min(1,'Last name required'),
  email:z.string().email('Invalid email'), phone:z.string().optional(),
  departmentId:z.number().min(1,'Department required'), designationId:z.number().min(1,'Designation required'),
  dateOfJoining:z.string().min(1), basicSalary:z.number().min(0),
  gender:z.string().optional(), dateOfBirth:z.string().optional(), address:z.string().optional(),
});
export const EmployeeReq=EmployeeSchema; export type TEmployeeReq=z.infer<typeof EmployeeSchema>;

export const AttendanceSchema = z.object({
  empId:z.number().min(1,'Employee required'), attendanceDate:z.string().min(1),
  checkIn:z.string().optional(), checkOut:z.string().optional(),
  status:z.enum(['PRESENT','ABSENT','LEAVE','HOLIDAY','HALF_DAY']),
  notes:z.string().optional(), source:z.string().optional(),
});
export const AttendanceReq=AttendanceSchema; export type TAttendanceReq=z.infer<typeof AttendanceSchema>;
