import EditInvoicePage from '@/modules/finance/invoices/components/EditInvoicePage';
interface Props { params: { id: string } }
export default function Page({ params }: Props) {
  return <EditInvoicePage invoiceId={Number(params.id)} />;
}
