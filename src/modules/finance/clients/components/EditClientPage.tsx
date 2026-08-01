"use client";
import { useEffect } from 'react';
import { useClientFormLogic } from '@/modules/finance/clients/hooks/useLogic';
import { ClientForm } from '@/modules/finance/clients/components/ClientForm';
import { useQuery } from '@/hooks/useQuery';
import { getClientById } from '@/services/api/finance';
import { ClientRes } from '@/schemas/finance/response';

interface Props { clientId: number; }

export default function EditClientPage({ clientId }: Props) {
  const { isSaving, save, goBack, setEditing, editing } = useClientFormLogic(clientId);

  const { data, isLoading } = useQuery({
    apiConfig: getClientById,
    responseSchema: ClientRes,
    parameters: { id: clientId },
  });

  console.log("data", data);
  

  useEffect(() => {
    if (data?.data) setEditing(data.data as any);
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading…</span>
      </div>
    );
  }

  return (
    <ClientForm
      editing={editing}
      isSaving={isSaving}
      onBack={goBack}
      onSave={data => save(data as any)}
    />
  );
}
