"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Layers } from 'lucide-react';

const MODULE_ROUTES: Record<string,string> = {
  FINANCE:   '/finance/dashboard',
  HR:        '/hr/dashboard',
  INVENTORY: '/inventory/dashboard',
  CRM:       '/crm/dashboard',
};

export default function DashboardModule() {
  const router = useRouter();
  const { activeModule } = useAuthStore();

  useEffect(() => {
    const path = MODULE_ROUTES[activeModule ?? ''] ?? '/finance/dashboard';
    router.replace(path);
  }, [activeModule, router]);

  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ background:'var(--brand)' }}>
        <Layers className="w-6 h-6 text-white"/>
      </div>
      <div className="text-sm" style={{ color:'var(--text-muted)' }}>Loading dashboard…</div>
      <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
        style={{ borderColor:'var(--brand)', borderTopColor:'transparent' }}/>
    </div>
  );
}
