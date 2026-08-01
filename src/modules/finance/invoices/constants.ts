export const INV_KEY = 'invoices-loading';
export const STATUS_OPTS = ['','DRAFT','SENT','PAID','OVERDUE','CANCELLED'] as const;
export const STATUS_LABELS: Record<string,string> = {
  '':'All', DRAFT:'Draft', SENT:'Sent', PAID:'Paid', OVERDUE:'Overdue', CANCELLED:'Cancelled',
};
export const STATUS_COLORS: Record<string,string> = {
  DRAFT:'text-gray-400', SENT:'text-blue-400', PAID:'text-green-400',
  OVERDUE:'text-red-400', CANCELLED:'text-gray-500',
};
