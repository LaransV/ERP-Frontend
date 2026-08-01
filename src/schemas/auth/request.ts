import { z } from 'zod';
export const LoginSchema = z.object({
  username: z.string().min(1,'Username required'),
  password: z.string().min(1,'Password required'),
});
export const LoginReq = LoginSchema;
export type TLoginReq = z.infer<typeof LoginSchema>;
