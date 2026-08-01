import { z } from 'zod';
import { BaseResponse, PagedSchema, coerceBool } from '@/schemas/template/response';

const ClientSchema = z.object({
  clientId:z.number(), clientName:z.string(), email:z.string().nullable().optional(),
  phone:z.string().nullable().optional(), address:z.string().nullable().optional(),
  city:z.string().nullable().optional(), state:z.string().nullable().optional(),
  pincode:z.string().nullable().optional(),
  gstNumber:z.string().nullable().optional(), panNumber:z.string().nullable().optional(),
  paymentTerms:z.string().nullable().optional(),
  isActive:coerceBool, createdAt:z.string().nullable().optional(),
  // ── Audit ──────────────────────────────────────────────────
  createdBy:z.string().nullable().optional(),
  createdDate:z.string().nullable().optional(),
  modifiedBy:z.string().nullable().optional(),
  modifiedDate:z.string().nullable().optional(),
});

const ProductSchema = z.object({
  companyId:z.number().nullable().optional(),
  productId:z.number(), 
  productName:z.string(), 
  productCode:z.string().nullable().optional(),
  productType:z.enum(['GOODS','SERVICE']), 
  unit:z.string(),
  taxRate:z.coerce.number(), 
  purchasePrice:z.coerce.number(), 
  salePrice:z.coerce.number(),
  openingStock:z.coerce.number().optional(), 
  hsnCode:z.string().nullable().optional(),
  categoryName:z.string().nullable().optional(), 
  groupName:z.string().nullable().optional(),
  isActive:coerceBool, 
  createdAt:z.string().nullable().optional(),
});

const InvoiceItemResSchema = z.object({
  itemId:z.number().optional(), productId:z.number().nullable().optional(),
  productName:z.string().nullable().optional(), hsnCode:z.string().nullable().optional(),
  quantity:z.coerce.number(), unit:z.string().nullable().optional(),
  unitPrice:z.coerce.number(), discountPct:z.coerce.number().optional(),
  discountAmount:z.coerce.number().optional(), taxableAmount:z.coerce.number().optional(),
  cgstRate:z.coerce.number().optional(), cgstAmount:z.coerce.number().optional(),
  sgstRate:z.coerce.number().optional(), sgstAmount:z.coerce.number().optional(),
  igstRate:z.coerce.number().optional(), igstAmount:z.coerce.number().optional(),
  totalAmount:z.coerce.number().optional(),
});

const InvoiceSchema = z.object({
  invoiceId:z.number(), invoiceNumber:z.string(), clientId:z.number(), clientName:z.string(),
  invoiceDate:z.string(), dueDate:z.string().nullable().optional(), status:z.string(),
  paymentStatus:z.string().nullable().optional(),
  subtotal:z.coerce.number(), taxTotal:z.coerce.number(), discountAmount:z.coerce.number().optional(),
  cgstTotal:z.coerce.number().optional(), sgstTotal:z.coerce.number().optional(), igstTotal:z.coerce.number().optional(),
  tdsPct:z.coerce.number().optional(), tdsAmount:z.coerce.number().optional(), roundOff:z.coerce.number().optional(),
  grandTotal:z.coerce.number(), paidAmount:z.coerce.number(), balanceAmount:z.coerce.number(),
  isInterstate:coerceBool.optional(),
  notes:z.string().nullable().optional(), terms:z.string().nullable().optional(),
  createdAt:z.string().nullable().optional(),
  items:z.array(InvoiceItemResSchema).optional(),
  // ── Basic Info tab ──────────────────────────────────────────
  supplierRefNo:z.string().nullable().optional(), eWayBillNo:z.string().nullable().optional(),
  generateEWayBill:coerceBool.optional(),
  dcNo:z.string().nullable().optional(), dcDate:z.string().nullable().optional(), selectDc:z.string().nullable().optional(),
  vehicleNo:z.string().nullable().optional(), lrNo:z.string().nullable().optional(),
  distance:z.coerce.number().nullable().optional(), transporterId:z.string().nullable().optional(),
  delThrough:z.string().nullable().optional(), delDestn:z.string().nullable().optional(),
  orderNo:z.string().nullable().optional(), orderDate:z.string().nullable().optional(),
  soNo:z.string().nullable().optional(), currency:z.string().nullable().optional(),
  // ── Dispatch From tab ───────────────────────────────────────
  dispatchAddressId:z.number().nullable().optional(),
  dispatchName:z.string().nullable().optional(), dispatchAddressLine1:z.string().nullable().optional(),
  dispatchAddressLine2:z.string().nullable().optional(), dispatchStateName:z.string().nullable().optional(),
  dispatchPincode:z.string().nullable().optional(),
  // ── Ship To tab ─────────────────────────────────────────────
  shipToAddressId:z.number().nullable().optional(),
  shipToName:z.string().nullable().optional(), shipToAddressLine1:z.string().nullable().optional(),
  shipToAddressLine2:z.string().nullable().optional(), shipToStateName:z.string().nullable().optional(),
  shipToPincode:z.string().nullable().optional(), shipToGstin:z.string().nullable().optional(),
});

const DispatchAddressSchema = z.object({
  dispatchAddressId:z.number(), name:z.string(),
  addressLine1:z.string().nullable().optional(), addressLine2:z.string().nullable().optional(),
  dispatchState:z.string().nullable().optional(), pincode:z.string().nullable().optional(),
});

const ShipToAddressSchema = z.object({
  shipToAddressId:z.number(), name:z.string(),
  addressLine1:z.string().nullable().optional(), addressLine2:z.string().nullable().optional(),
  shippingState:z.string().nullable().optional(), pincode:z.string().nullable().optional(),
  gstin:z.string().nullable().optional(),
});

const FinDashSchema = z.object({
  totalRevenue:z.coerce.number(), dueAmount:z.coerce.number(), dueCount:z.coerce.number(),
  overdueAmount:z.coerce.number(), overdueCount:z.coerce.number(),
  paidAmount:z.coerce.number(), paidCount:z.coerce.number(),
  monthlyData:z.array(z.any()).optional(),
});

export const ClientsRes  = BaseResponse.extend({ data:PagedSchema(ClientSchema).nullable().optional() });
export const ClientRes   = BaseResponse.extend({ data:ClientSchema.nullable().optional() });
export const ProductsRes = BaseResponse.extend({ data:PagedSchema(ProductSchema).nullable().optional() });
export const ProductRes  = BaseResponse.extend({ data:ProductSchema.nullable().optional() });
export const InvoicesRes = BaseResponse.extend({ data:PagedSchema(InvoiceSchema).nullable().optional() });
export const InvoiceRes  = BaseResponse.extend({ data:InvoiceSchema.nullable().optional() });
export const FinDashRes  = BaseResponse.extend({ data:FinDashSchema.nullable().optional() });
export const DispatchAddressesRes = BaseResponse.extend({ data:z.array(DispatchAddressSchema).nullable().optional() });
export const DispatchAddressRes   = BaseResponse.extend({ data:DispatchAddressSchema.nullable().optional() });
export const ShipToAddressesRes   = BaseResponse.extend({ data:z.array(ShipToAddressSchema).nullable().optional() });
export const ShipToAddressRes     = BaseResponse.extend({ data:ShipToAddressSchema.nullable().optional() });
export type TClient=z.infer<typeof ClientSchema>;   export type TProduct=z.infer<typeof ProductSchema>;
export type TInvoice=z.infer<typeof InvoiceSchema>; export type TFinDash=z.infer<typeof FinDashSchema>;
export type TInvoiceItem=z.infer<typeof InvoiceItemResSchema>;
export type TDispatchAddress=z.infer<typeof DispatchAddressSchema>;
export type TShipToAddress=z.infer<typeof ShipToAddressSchema>;
