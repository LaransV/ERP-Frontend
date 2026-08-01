import { z } from 'zod';
import { BaseResponse, PagedSchema } from '@/schemas/template/response';

// ─── Inventory Request Schemas ────────────────────────────────

export const StockAdjustSchema = z.object({
  productId: z.number({ required_error: 'Product is required' }),
  quantity: z.number().min(1, 'Quantity must be positive'),
  type: z.enum(['IN', 'OUT', 'ADJUSTMENT']),
  notes: z.string().min(1, 'Notes are required'),
});

export const StockAdjustReq = StockAdjustSchema;
export type TStockAdjustReq = z.infer<typeof StockAdjustSchema>;

export const PurchaseOrderSchema = z.object({
  supplierId: z.number({ required_error: 'Supplier is required' }),
  orderDate: z.string({ required_error: 'Order date is required' }),
  expectedDate: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
  })).min(1, 'At least one item required'),
});

export const PurchaseOrderReq = PurchaseOrderSchema;
export type TPurchaseOrderReq = z.infer<typeof PurchaseOrderSchema>;

// ─── Inventory Response Schemas ───────────────────────────────

const StockItemSchema = z.object({
  stockId: z.number(),
  productId: z.number(),
  productName: z.string(),
  productCode: z.string(),
  unit: z.string(),
  currentStock: z.number(),
  reorderLevel: z.number().optional(),
  isActive: z.boolean(),
});

const StockMovementSchema = z.object({
  movementId: z.number(),
  productName: z.string(),
  movementType: z.string(),
  quantity: z.number(),
  notes: z.string().nullable().optional(),
  createdAt: z.string(),
});

const PurchaseOrderSchema2 = z.object({
  orderId: z.number(),
  orderNumber: z.string(),
  supplierName: z.string(),
  orderDate: z.string(),
  status: z.string(),
  totalAmount: z.number(),
  createdAt: z.string(),
});

const InventoryDashboardSchema = z.object({
  totalItems: z.number(),
  lowStockItems: z.number(),
  pendingOrders: z.number(),
  totalValue: z.number(),
});

export const StockRes           = BaseResponse.extend({ data: PagedSchema(StockItemSchema).nullable().optional() });
export const MovementsRes       = BaseResponse.extend({ data: PagedSchema(StockMovementSchema).nullable().optional() });
export const PurchaseOrdersRes  = BaseResponse.extend({ data: PagedSchema(PurchaseOrderSchema2).nullable().optional() });
export const InventoryDashRes   = BaseResponse.extend({ data: InventoryDashboardSchema.nullable().optional() });

export type TStockItem      = z.infer<typeof StockItemSchema>;
export type TStockMovement  = z.infer<typeof StockMovementSchema>;
export type TPurchaseOrder  = z.infer<typeof PurchaseOrderSchema2>;
