'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function Page() {
  const router = useRouter();
  const { activeModule } = useAuthStore();

  useEffect(() => {
    const routes: Record<string, string> = {
      FINANCE:   '/finance/dashboard',
      HR:        '/hr/dashboard',
      INVENTORY: '/inventory/dashboard',
      CRM:       '/crm/dashboard',
    };
    const path = routes[activeModule ?? ''] ?? '/finance/dashboard';
    router.replace(path);
  }, [activeModule, router]);

  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }}/>
    </div>
  );
}
