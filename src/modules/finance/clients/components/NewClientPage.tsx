"use client";
import { useClientFormLogic } from '@/modules/finance/clients/hooks/useLogic';
import { ClientForm } from '@/modules/finance/clients/components/ClientForm';

export default function NewClientPage() {
  const { isSaving, save, goBack } = useClientFormLogic();
  return (
    <ClientForm
      editing={null}
      isSaving={isSaving}
      onBack={goBack}
      onSave={data => save(data as any)}
    />
  );
}
