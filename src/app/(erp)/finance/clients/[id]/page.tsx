import EditClientPage from '@/modules/finance/clients/components/EditClientPage';
interface Props { params: { id: string } }
export default function Page({ params }: Props) {
  return <EditClientPage clientId={Number(params.id)} />;
}
