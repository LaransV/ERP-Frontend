import { z } from 'zod';
import { BaseResponse } from '@/schemas/template/response';
const PermissionSchema = z.object({
  moduleCode:z.string(), moduleName:z.string(), screenCode:z.string(), screenName:z.string(),
  canCreate:z.boolean(), canRead:z.boolean(), canUpdate:z.boolean(), canDelete:z.boolean(),
});
const UserInfoSchema = z.object({
  userId:z.number(), username:z.string(), email:z.string(), fullName:z.string(),
  roleId:z.number(), roleName:z.string(), isActive:z.boolean().optional(),
  companyId:z.number().nullable().optional(), companyName:z.string().nullable().optional(),
  permissions:z.array(PermissionSchema),
});
export const LoginRes = BaseResponse.extend({
  data: z.object({ accessToken:z.string(), tokenType:z.string().optional(), user:UserInfoSchema }).nullable().optional(),
});
export type TLoginRes  = z.infer<typeof LoginRes>;
export type TUserInfo  = z.infer<typeof UserInfoSchema>;
export type TPermission= z.infer<typeof PermissionSchema>;
