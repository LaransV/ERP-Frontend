import { z } from 'zod';

// ── coerceBool: handles boolean true/false AND 0/1 from SQL Server bit columns ──
export const coerceBool = z.union([z.boolean(), z.number(), z.string()])
  .transform(v => {
    if (typeof v === 'boolean') return v;
    if (typeof v === 'number')  return v !== 0;
    return v === 'true' || v === '1';
  });

export const BaseResponse = z.object({
  success:    z.boolean(),
  message:    z.string().nullable().optional(),
  statusCode: z.number().nullable().optional(),
  errors:     z.array(z.string()).nullable().optional(),
});
export type TResponse = z.infer<typeof BaseResponse> & { data?: unknown };

export const PagedSchema = <T extends z.ZodTypeAny>(item: T) => z.object({
  content:       z.array(item),
  page:          z.coerce.number(),
  size:          z.coerce.number(),
  totalElements: z.coerce.number(),
  totalPages:    z.coerce.number(),
});

export const VoidRes = BaseResponse.extend({ data: z.null().optional() });
