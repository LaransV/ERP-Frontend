import { z } from 'zod';
export const UserSchema = z.object({
  username:z.string().min(3), email:z.string().email(), fullName:z.string().min(1),
  phone:z.string().optional(), roleId:z.number().min(1,'Role required'),
  companyId:z.number().optional(), isActive:z.boolean(), password:z.string().optional(),
});
export const UserReq=UserSchema; export type TUserReq=z.infer<typeof UserSchema>;
export const RoleSchema = z.object({ roleName:z.string().min(1), roleDescription:z.string().optional(), isActive:z.boolean() });
export const RoleReq=RoleSchema; export type TRoleReq=z.infer<typeof RoleSchema>;
