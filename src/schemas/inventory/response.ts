import { z } from 'zod';
import { BaseResponse, PagedSchema } from '@/schemas/template/response';
const StockSchema = z.object({
  stockId:z.number(), productId:z.number().optional(), productCode:z.string().optional(),
  productName:z.string(), categoryName:z.string().nullable().optional(), unit:z.string(),
  currentStock:z.number(), availableStock:z.number().optional(),
  reservedStock:z.number().optional(), reorderLevel:z.number().optional(), stockValue:z.number().optional(),
});
const MovementSchema = z.object({
  movementId:z.number(), movementType:z.string(), productName:z.string(), quantity:z.number(),
  unitPrice:z.number().optional(), totalValue:z.number().optional(),
  warehouseName:z.string().optional(), movementDate:z.string(),
  reference:z.string().optional(), notes:z.string().optional(),
});
const POSchema = z.object({
  poId:z.number(), poNumber:z.string(), vendorId:z.number().optional(),
  vendorName:z.string().optional(), poDate:z.string(),
  expectedDate:z.string().nullable().optional(), status:z.string(),
  totalAmount:z.number(), notes:z.string().optional(),
});
const InvDashSchema = z.object({
  totalItems:z.number(), totalStockValue:z.number(),
  lowStockCount:z.number(), outOfStockCount:z.number(), recentMovements:z.array(z.any()).optional(),
});
export const StockRes    =BaseResponse.extend({data:PagedSchema(StockSchema).nullable().optional()});
export const MovementsRes=BaseResponse.extend({data:PagedSchema(MovementSchema).nullable().optional()});
export const POsRes      =BaseResponse.extend({data:PagedSchema(POSchema).nullable().optional()});
export const InvDashRes  =BaseResponse.extend({data:InvDashSchema.nullable().optional()});
export type TStockItem=z.infer<typeof StockSchema>; export type TMovement=z.infer<typeof MovementSchema>;
export type TPO=z.infer<typeof POSchema>;           export type TInvDash=z.infer<typeof InvDashSchema>;
