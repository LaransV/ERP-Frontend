import { z } from 'zod';
export const ClientSchema = z.object({
  clientName:   z.string().min(1,'Organization Name required'),
  aliasName:    z.string().optional(),
  vendorCode:   z.string().optional(),
  email:        z.string().optional(),
  phone:        z.string().min(1,'Mobile required'),
  website:      z.string().optional(),
  landlinePhone:z.string().optional(),
  panNumber:    z.string().optional(),
  gstnType:     z.string().optional(),
  gstNumber:    z.string().optional(),
  address:      z.string().optional(),
  addressLine2: z.string().optional(),
  pincode:      z.string().optional(),
  city:         z.string().optional(),
  state:        z.string().optional(),
  country:      z.string().optional(),
  currency:     z.string().optional(),
  paymentTerms: z.string().optional(),
});
export const ClientReq = ClientSchema; 
export type TClientReq = z.infer<typeof ClientSchema>;

export const DeleteClientReq = z.object({
  id: z.number(),
});
export type DeleteClientReqType = z.infer<typeof DeleteClientReq>;

export const ProductSchema = z.object({
  productName:z.string().min(1,'Name required'), 
  productCode:z.string().optional(),
  hsnCode:z.string().optional(),
  productType:z.enum(['GOODS','SERVICE']),
  unit:z.string().min(1,'Unit required'), 
  taxRate:z.number().min(0).max(100),
  purchasePrice:z.number().min(0), 
  salePrice:z.number().min(0),
  categoryName:z.string().optional(), 
  groupName:z.string().optional(),
});
export const ProductReq = ProductSchema; export type TProductReq = z.infer<typeof ProductSchema>;

const InvoiceItemSchema = z.object({
  productId:z.number().min(1), productName:z.string().optional(), hsnCode:z.string().optional(),
  quantity:z.number().min(0.001), unit:z.string().optional(), unitPrice:z.number().min(0),
  discountPct:z.number().default(0), discountAmount:z.number().default(0),
  taxableAmount:z.number().default(0),
  cgstRate:z.number().default(0), cgstAmount:z.number().default(0),
  sgstRate:z.number().default(0), sgstAmount:z.number().default(0),
  igstRate:z.number().default(0), igstAmount:z.number().default(0),
  totalAmount:z.number().default(0),
});
export const InvoiceSchema = z.object({
  clientId:z.number().min(1,'Client required'), invoiceDate:z.string().min(1),
  dueDate:z.string().min(1), notes:z.string().optional(), terms:z.string().optional(),
  items:z.array(InvoiceItemSchema).min(1,'Add at least 1 item'),
  subtotal:z.number().optional(), discountAmount:z.number().optional(), taxableAmount:z.number().optional(),
  cgstTotal:z.number().optional(), sgstTotal:z.number().optional(), igstTotal:z.number().optional(),
  taxTotal:z.number().optional(), tdsPct:z.number().optional(), tdsAmount:z.number().optional(),
  roundOff:z.number().optional(), grandTotal:z.number().optional(), interstate:z.boolean().optional(),
  // ── Basic Info tab ──────────────────────────────────────────
  supplierRefNo:z.string().optional(), eWayBillNo:z.string().optional(), generateEWayBill:z.boolean().optional(),
  dcNo:z.string().optional(), dcDate:z.string().optional(), selectDc:z.string().optional(),
  vehicleNo:z.string().optional(), lrNo:z.string().optional(), distance:z.number().optional(),
  transporterId:z.string().optional(), delThrough:z.string().optional(), delDestn:z.string().optional(),
  orderNo:z.string().optional(), orderDate:z.string().optional(), soNo:z.string().optional(),
  currency:z.string().optional(),
  // ── Dispatch From / Ship To tabs ────────────────────────────
  dispatchAddressId:z.number().optional(), shipToAddressId:z.number().optional(),
});
export const InvoiceReq = InvoiceSchema;
export type TInvoiceReq = z.infer<typeof InvoiceSchema>;

export const DispatchAddressSchema = z.object({
  name:z.string().min(1,'Name required'),
  addressLine1:z.string().optional(), addressLine2:z.string().optional(),
  dispatchState:z.string().optional(), pincode:z.string().optional(),
});
export const DispatchAddressReq = DispatchAddressSchema;
export type TDispatchAddressReq = z.infer<typeof DispatchAddressSchema>;

export const ShipToAddressSchema = z.object({
  name:z.string().min(1,'Name required'),
  addressLine1:z.string().optional(), addressLine2:z.string().optional(),
  shippingState:z.string().optional(), pincode:z.string().optional(), gstin:z.string().optional(),
});
export const ShipToAddressReq = ShipToAddressSchema;
export type TShipToAddressReq = z.infer<typeof ShipToAddressSchema>;
