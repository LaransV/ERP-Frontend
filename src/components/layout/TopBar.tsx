'use client';
import { Bell, Sun, Moon, ChevronDown, ChevronRight, User, Building2, ArrowLeftRight, LogOut, Check, Plus, Settings } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useCompanyStore } from '@/store/themeStore';
import { toast } from 'sonner';

// Admin module removed — only these 4 appear in Switch To
const MODULE_META = [
  { code: 'FINANCE',   label: 'Finance',   color: '#34D399', href: '/finance/invoices' },
  { code: 'HR',        label: 'HR',         color: '#A78BFA', href: '/hr/employees' },
  { code: 'INVENTORY', label: 'Inventory',  color: '#FBBF24', href: '/inventory/items' },
  { code: 'CRM',       label: 'CRM',        color: '#FB7185', href: '/crm/leads' },
];

export function TopBar({ sidebarW }: { sidebarW: number }) {
  const router = useRouter();
  const { user, logout, getAccessibleModules, setActiveModule, activeModule } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { companies, activeCompanyId, setActiveCompany, getActive } = useCompanyStore();

  const [profileOpen, setProfileOpen] = useState(false);
  const [subMenu, setSubMenu] = useState<'company' | 'module' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeCompany = getActive();
  // Only show Finance/HR/Inventory/CRM — not ADMIN
  const accessibleModules = getAccessibleModules().filter(m => m !== 'ADMIN');

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
        setSubMenu(null);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const closeAll = () => { setProfileOpen(false); setSubMenu(null); };

  const switchModule = (code: string, href: string, label: string) => {
    setActiveModule(code);
    router.push(href);
    toast.success(`Switched to ${label}`);
    closeAll();
  };

  const activeModuleMeta = MODULE_META.find(m => m.code === activeModule);

  return (
    <header
      className="fixed top-0 right-0 z-20 flex items-center justify-between px-4 h-[60px] border-b transition-all duration-300"
      style={{ left: sidebarW, background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
    >
      {/* Left — active company + module badge */}
      <div className="flex items-center gap-2.5">
        <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
          {activeCompany?.name ?? 'NexERP'}
        </span>
        {activeModuleMeta && (
          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
            style={{ background: `${activeModuleMeta.color}18`, color: activeModuleMeta.color, border: `1px solid ${activeModuleMeta.color}30` }}>
            {activeModuleMeta.label}
          </span>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        <button onClick={toggleTheme} className="btn-ghost btn-icon">
          {theme === 'dark'
            ? <Sun className="w-4 h-4" style={{ color: '#FBBF24' }} />
            : <Moon className="w-4 h-4" style={{ color: 'var(--brand)' }} />}
        </button>

        <button className="btn-ghost btn-icon relative">
          <Bell className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--danger)' }} />
        </button>

        {/* Profile */}
        <div className="relative ml-1" ref={dropdownRef}>
          <button
            onClick={() => { setProfileOpen(o => !o); setSubMenu(null); }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-colors"
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}>
              {user?.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
            <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          </button>

          {profileOpen && (
            <div
              className="absolute right-0 top-full mt-1 rounded-2xl border shadow-2xl z-50"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', width: 220 }}
            >
              {/* Hi user */}
              <div className="px-4 py-3 border-b rounded-t-2xl" style={{ borderColor: 'var(--border)', background: 'var(--hover)' }}>
                <div className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Hi! {user?.fullName}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{user?.email}</div>
              </div>

              <MenuItem icon={<User className="w-4 h-4" />} label="User Info" onClick={() => { router.push('/admin/users'); closeAll(); }} />
              <MenuItem icon={<Building2 className="w-4 h-4" />} label="Company Info" onClick={() => { router.push('/admin/companies'); closeAll(); }} />

              {/* Select Company */}
              <div className="relative">
                <MenuItemArrow
                  icon={<Building2 className="w-4 h-4" />}
                  label="Select Company"
                  active={subMenu === 'company'}
                  onClick={() => setSubMenu(s => s === 'company' ? null : 'company')}
                />
                {subMenu === 'company' && (
                  <div className="absolute z-50 rounded-2xl border shadow-2xl overflow-hidden"
                    style={{ left: -224, top: 0, width: 220, background: 'var(--surface)', borderColor: 'var(--border)' }}>
                    {companies.map(co => (
                      <button
                        key={co.id}
                        onClick={() => { setActiveCompany(co.id); toast.success(`Switched to ${co.name}`); closeAll(); }}
                        className="flex items-center justify-between w-full px-4 py-2.5 transition-colors"
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ background: 'var(--brand)' }}>{co.name.charAt(0)}</div>
                          <span className="truncate text-sm" style={{ color: 'var(--text-primary)' }}>{co.name}</span>
                        </div>
                        {activeCompanyId === co.id && <Check className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--brand)' }} />}
                      </button>
                    ))}
                    <div className="border-t p-2" style={{ borderColor: 'var(--border)' }}>
                      <button onClick={() => { router.push('/admin/companies'); closeAll(); }}
                        className="flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{ color: 'var(--brand)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <Plus className="w-3.5 h-3.5" /> Manage Companies
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Switch To — only Finance/HR/Inventory/CRM, NO Admin, NO "All Modules" */}
              {accessibleModules.length > 0 && (
                <div className="relative">
                  <MenuItemArrow
                    icon={<ArrowLeftRight className="w-4 h-4" />}
                    label="Switch To"
                    active={subMenu === 'module'}
                    onClick={() => setSubMenu(s => s === 'module' ? null : 'module')}
                  />
                  {subMenu === 'module' && (
                    <div className="absolute z-50 rounded-2xl border shadow-2xl overflow-hidden py-1"
                      style={{ left: -204, top: 0, width: 200, background: 'var(--surface)', borderColor: 'var(--border)' }}>
                      {MODULE_META.filter(m => accessibleModules.includes(m.code)).map(mod => {
                        const isActive = activeModule === mod.code;
                        return (
                          <button key={mod.code}
                            onClick={() => switchModule(mod.code, mod.href, mod.label)}
                            className="flex items-center justify-between gap-2 w-full px-4 py-2.5 transition-colors"
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ background: mod.color }} />
                              <span className="text-sm font-medium" style={{ color: isActive ? mod.color : 'var(--text-primary)' }}>
                                {mod.label}
                              </span>
                            </div>
                            {isActive && <Check className="w-3.5 h-3.5" style={{ color: mod.color }} />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className="my-1 border-t" style={{ borderColor: 'var(--border)' }} />
              <MenuItem icon={<Settings className="w-4 h-4" />} label="Profile" onClick={() => { router.push('/profile'); closeAll(); }} />
              <button
                onClick={() => { closeAll(); logout(); }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm rounded-b-2xl transition-colors"
                style={{ color: 'var(--danger)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function MenuItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors"
      style={{ color: 'var(--text-secondary)' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
    >
      {icon} {label}
    </button>
  );
}

function MenuItemArrow({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors"
      style={{ color: active ? 'var(--text-primary)' : 'var(--text-secondary)', background: active ? 'var(--hover)' : 'transparent' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
    >
      <div className="flex items-center gap-3">{icon} {label}</div>
      <ChevronRight className="w-3.5 h-3.5" style={{ transform: active ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
    </button>
  );
}
