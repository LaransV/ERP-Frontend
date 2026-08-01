import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, isValid } from 'date-fns';

export const cn = (...i: ClassValue[]) => twMerge(clsx(i));

export const fmt = {
  currency: (n: number, cur = '₹') =>
    `${cur}${new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`,
  number: (n: number) => new Intl.NumberFormat('en-IN').format(n),
  date: (d: string | Date | null | undefined, f = 'dd MMM yyyy') => {
    if (!d) return '—';
    try { const dt = typeof d === 'string' ? parseISO(d) : d; return isValid(dt) ? format(dt, f) : '—'; }
    catch { return '—'; }
  },
  dateTime: (d: string | Date | null | undefined) => fmt.date(d, 'dd MMM yyyy, hh:mm a'),
  toISO:    (d: Date) => format(d, 'yyyy-MM-dd'),
};

export function amountToWords(amount: number): string {
  const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine',
    'Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  const toHundreds = (n: number): string => {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n/10)] + (n%10 ? ' ' + ones[n%10] : '');
    return ones[Math.floor(n/100)] + ' Hundred' + (n%100 ? ' ' + toHundreds(n%100) : '');
  };
  const n = Math.round(amount);
  if (n === 0) return 'Zero Rupees Only';
  const crore = Math.floor(n / 10000000);
  const lakh  = Math.floor((n % 10000000) / 100000);
  const thou  = Math.floor((n % 100000) / 1000);
  const rest  = n % 1000;
  let r = '';
  if (crore) r += toHundreds(crore) + ' Crore ';
  if (lakh)  r += toHundreds(lakh)  + ' Lakh ';
  if (thou)  r += toHundreds(thou)  + ' Thousand ';
  if (rest)  r += toHundreds(rest);
  return r.trim() + ' Rupees Only';
}

export const statusColors: Record<string, string> = {
  DRAFT: 'badge-gray', SENT: 'badge-brand', PAID: 'badge-green',
  OVERDUE: 'badge-red', CANCELLED: 'badge-gray', PARTIAL: 'badge-amber',
  ACTIVE: 'badge-green', INACTIVE: 'badge-gray', ON_NOTICE: 'badge-amber',
  NEW: 'badge-cyan', CONTACTED: 'badge-brand', QUALIFIED: 'badge-violet',
  PROPOSAL: 'badge-amber', NEGOTIATION: 'badge-amber', WON: 'badge-green', LOST: 'badge-red',
  PRESENT: 'badge-green', ABSENT: 'badge-red', LEAVE: 'badge-amber',
  HOLIDAY: 'badge-brand', HALF_DAY: 'badge-violet',
  IN: 'badge-green', OUT: 'badge-red', ADJUSTMENT: 'badge-amber', TRANSFER: 'badge-brand',
  APPROVED: 'badge-green', PENDING: 'badge-amber', RECEIVED: 'badge-brand',
  PROCESSED: 'badge-brand', LOW: 'badge-amber', MEDIUM: 'badge-brand', HIGH: 'badge-red',
};

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

export function computeGST(taxable: number, gstRate: number, interstate: boolean) {
  const total = (taxable * gstRate) / 100;
  if (interstate) return { cgstRate: 0, cgstAmt: 0, sgstRate: 0, sgstAmt: 0, igstRate: gstRate, igstAmt: total };
  const half = gstRate / 2;
  return { cgstRate: half, cgstAmt: total / 2, sgstRate: half, sgstAmt: total / 2, igstRate: 0, igstAmt: 0 };
}
