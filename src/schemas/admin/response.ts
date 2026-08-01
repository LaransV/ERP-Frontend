import { z } from 'zod';
import { BaseResponse, PagedSchema, coerceBool } from '@/schemas/template/response';

const UserSchema = z.object({
  userId:z.number(), username:z.string(), email:z.string(), fullName:z.string(),
  phone:z.string().nullable().optional(), roleId:z.number(), roleName:z.string().nullable().optional(),
  isActive:coerceBool, lastLogin:z.string().nullable().optional(), createdAt:z.string().nullable().optional(),
});
const RoleSchema = z.object({
  roleId:z.number(), roleName:z.string(), roleDescription:z.string().nullable().optional(),
  isActive:coerceBool, createdAt:z.string().nullable().optional(),
});
const CompanySchema = z.object({
  companyId:z.number(), companyName:z.string(), currency:z.string().nullable().optional(),
  gstin:z.string().nullable().optional(), address:z.string().nullable().optional(),
  phone:z.string().nullable().optional(), email:z.string().nullable().optional(),
  isActive:coerceBool,
});
const ModuleSchema = z.object({ moduleId:z.number(), moduleCode:z.string(), moduleName:z.string() });
const ScreenSchema = z.object({ screenId:z.number(), moduleId:z.number(), screenCode:z.string(), screenName:z.string() });
const EntitlementSchema = z.object({
  entitlementId:z.number().optional(), roleId:z.number(), screenId:z.number(),
  screenCode:z.string(), screenName:z.string(), moduleCode:z.string().nullable().optional(),
  canCreate:coerceBool, canRead:coerceBool, canUpdate:coerceBool, canDelete:coerceBool,
});

export const UsersRes       =BaseResponse.extend({data:PagedSchema(UserSchema).nullable().optional()});
export const UserRes        =BaseResponse.extend({data:UserSchema.nullable().optional()});
export const RolesRes       =BaseResponse.extend({data:z.array(RoleSchema).nullable().optional()});
export const CompaniesRes   =BaseResponse.extend({data:z.array(CompanySchema).nullable().optional()});
export const ModulesRes     =BaseResponse.extend({data:z.array(ModuleSchema).nullable().optional()});
export const ScreensRes     =BaseResponse.extend({data:z.array(ScreenSchema).nullable().optional()});
export const EntitlementsRes=BaseResponse.extend({data:z.array(EntitlementSchema).nullable().optional()});
export type TUser=z.infer<typeof UserSchema>;         export type TRole=z.infer<typeof RoleSchema>;
export type TCompany=z.infer<typeof CompanySchema>;   export type TModule=z.infer<typeof ModuleSchema>;
export type TScreen=z.infer<typeof ScreenSchema>;     export type TEntitlement=z.infer<typeof EntitlementSchema>;
