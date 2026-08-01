'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard, Receipt, Package, UserCheck,
  Clock, DollarSign, Boxes, ArrowLeftRight, ShoppingCart, Target,
  Phone, Activity, Shield, UserCog, ChevronDown, ChevronRight,
  BarChart3, LogOut, Building2, Menu, Users, FileText,
  Layers, BookOpen, Truck,
} from 'lucide-react';

// ── Type definitions ───────────────────────────────────────────
interface NavLeaf {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  screen: string;
}

interface NavDropdown {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: NavLeaf[];
}

type NavItem = NavLeaf | NavDropdown;

interface ModuleGroup {
  group: string;
  module: string;
  items: NavItem[];
}

function isDropdown(item: NavItem): item is NavDropdown {
  return 'children' in item;
}

// ── ALL_MODULES — add new dropdowns here freely ────────────────
const ALL_MODULES: ModuleGroup[] = [
  {
    group: 'FINANCE', module: 'FINANCE',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, href: '/finance/dashboard', screen: 'FINANCE_DASHBOARD' },
      // ── Master dropdown ──
      {
        label: 'Master', icon: BookOpen,
        children: [
          { label: 'Products', icon: Package, href: '/finance/products', screen: 'FINANCE_PRODUCTS' },
        ],
      },
      // ── Sales dropdown ──
      {
        label: 'Sales', icon: Receipt,
        children: [
          { label: 'Clients',  icon: Building2, href: '/finance/clients',  screen: 'FINANCE_CLIENTS'  },
          { label: 'Invoices', icon: FileText,   href: '/finance/invoices', screen: 'FINANCE_INVOICES' },
          // Add more Sales sub-items here as needed
        ],
      },
      // ── Purchase dropdown (add sub-items when ready) ──
      {
        label: 'Purchase', icon: ShoppingCart,
        children: [
          // Add Purchase sub-items here when needed
        ],
      },
    ],
  },
  {
    group: 'HR', module: 'HR',
    items: [
      { label: 'Dashboard',  icon: LayoutDashboard, href: '/hr/dashboard',  screen: 'HR_DASHBOARD'  },
      { label: 'Employees',  icon: UserCheck,        href: '/hr/employees',  screen: 'HR_EMPLOYEES'  },
      { label: 'Attendance', icon: Clock,            href: '/hr/attendance', screen: 'HR_ATTENDANCE' },
      { label: 'Payroll',    icon: DollarSign,       href: '/hr/payroll',    screen: 'HR_PAYROLL'    },
    ],
  },
  {
    group: 'INVENTORY', module: 'INVENTORY',
    items: [
      { label: 'Dashboard',       icon: LayoutDashboard, href: '/inventory/dashboard', screen: 'INV_DASHBOARD'        },
      { label: 'Stock Items',     icon: Boxes,           href: '/inventory/items',     screen: 'INV_STOCK'            },
      { label: 'Stock View',      icon: BarChart3,       href: '/inventory/stock',     screen: 'INV_STOCK'            },
      { label: 'Movements',       icon: ArrowLeftRight,  href: '/inventory/movements', screen: 'INV_MOVEMENTS'        },
      { label: 'Purchase Orders', icon: ShoppingCart,    href: '/inventory/orders',    screen: 'INV_PURCHASE_ORDERS'  },
    ],
  },
  {
    group: 'CRM', module: 'CRM',
    items: [
      { label: 'Dashboard',  icon: LayoutDashboard, href: '/crm/dashboard',  screen: 'CRM_DASHBOARD'  },
      { label: 'Leads',      icon: Target,          href: '/crm/leads',      screen: 'CRM_LEADS'      },
      { label: 'Followups',  icon: Phone,           href: '/crm/followups',  screen: 'CRM_FOLLOWUPS'  },
      { label: 'Activities', icon: Activity,        href: '/crm/activities', screen: 'CRM_ACTIVITIES' },
    ],
  },
];

// ── Leaf nav item (direct link) ────────────────────────────────
function LeafItem({ item, collapsed, indent = false }: { item: NavLeaf; collapsed: boolean; indent?: boolean }) {
  const pathname = usePathname();
  const { canAccess } = useAuthStore();
  if (item.screen && !canAccess(item.screen, 'read')) return null;
  const active = pathname.startsWith(item.href);
  return (
    <div className="">
      <Link
        href={item.href}
        title={collapsed ? item.label : undefined}
        className={cn(
          'sidebar-item',
          active && 'sidebar-item-active',
          collapsed && 'justify-center',
          indent && !collapsed && 'pl-8',
        )}
      >
        {/* Child ICON */}
         <span style={active ? {} : { color: 'var(--text-secondary)' }}>
            <item.icon className={cn('w-[18px] h-[18px] shrink-0', active ? 'text-white' : '')}/>
        </span>
        {!collapsed && <span className="truncate text-sm">{item.label}</span>}
      </Link>
    </div>
  );
}

// ── Dropdown nav item (collapsible group) ──────────────────────
function DropdownItem({ item, collapsed }: { item: NavDropdown; collapsed: boolean }) {
  const pathname = usePathname();
  const { canAccess } = useAuthStore();

  // Filter children by permission
  const visibleChildren = item.children.filter(
    child => !child.screen || canAccess(child.screen, 'read')
  );

  // If no children at all (or none visible), hide the dropdown
  if (visibleChildren.length === 0) return null;

  // Auto-open if any child is active
  const isAnyChildActive = visibleChildren.some(child => pathname.startsWith(child.href));
  const [open, setOpen] = useState(isAnyChildActive);

  if (collapsed) {
    // In collapsed mode, just show child icons stacked (no label)
    return (
      <div className="space-y-[2px]">
        {visibleChildren.map(child => (
          <LeafItem key={child.href} item={child} collapsed={true} />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Dropdown header button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'sidebar-item w-full',
          isAnyChildActive && !open && 'sidebar-item-active',
        )}
        style={{ justifyContent: 'space-between' }}
      >
        <div className="flex items-center gap-[10px]">
          <span style={{ color: isAnyChildActive && !open ? 'white' : 'var(--text-secondary)' }}>
            <item.icon
            className="w-[18px] h-[18px] shrink-0"
          />
          </span>
          <span className="truncate text-sm">{item.label}</span>
        </div>
        {open
          ? <ChevronDown className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
          : <ChevronRight className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
        }
      </button>

      {/* Children */}
      {open && (
        <div className="mt-[2px] space-y-[2px]">
          {visibleChildren.map(child => (
            <LeafItem key={child.href} item={child} collapsed={false} indent />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Single nav item dispatcher ─────────────────────────────────
function NavItemRenderer({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  if (isDropdown(item)) {
    return <DropdownItem item={item} collapsed={collapsed} />;
  }
  return <LeafItem item={item} collapsed={collapsed} />;
}

// ── Module group ───────────────────────────────────────────────
function ModuleGroup({ group, collapsed }: { group: ModuleGroup; collapsed: boolean }) {
  const { canModule } = useAuthStore();
  const [open, setOpen] = useState(true);
  if (group.module && !canModule(group.module)) return null;
  return (
    <div className="mb-1">
      {group.group !== 'OVERVIEW' && !collapsed && (
        <button onClick={() => setOpen(o => !o)} className="sidebar-group-btn">
          <span>{group.group}</span>
          {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>
      )}
      {(open || collapsed || group.group === 'OVERVIEW') && (
        <div className="space-y-[2px] mt-[2px]">
          {group.items.map((item, idx) => (
            <NavItemRenderer key={isDropdown(item) ? item.label : item.href} item={item} collapsed={collapsed} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sidebar root ───────────────────────────────────────────────
export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { user, logout, activeModule, canModule, canAccess } = useAuthStore();

  const visibleModules = ALL_MODULES.filter(g => {
    if (!g.module) return true;
    if (!canModule(g.module)) return false;
    if (activeModule) return g.module === activeModule;
    return true;
  });

  const logoImage = '/images/VRLlogo1.png';

  return (
    <aside
      className="fixed left-0 top-0 h-full flex flex-col z-30 transition-all duration-300 border-r"
      style={{ width: collapsed ? 72 : 240, background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: '2px 0 8px rgba(0,0,0,0.15)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-1 px-2 h-[60px] border-b shrink-0"
        style={{ background: 'var(--brand)', borderColor: 'var(--brand-dark)' }}>
        {!collapsed && (
          <div className="flex items-center justify-center bg-white rounded-2xl p-1 shadow-md">
            <Image src={logoImage} width={60} height={60} className="h-auto w-auto object-contain" alt="VRL Logo" />
          </div>
        )}
        {collapsed && (
          <div className="flex items-center justify-center">
            <div className="w-9 h-8 bg-white rounded-2xl shadow-md flex items-center justify-center shrink-0">
              <Image src={logoImage} width={38} height={38} className="object-contain" alt="VRL Logo" />
            </div>
          </div>
        )}
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm leading-none text-white tracking-wide">ERP Software</div>
            <div className="text-[11px] mt-0.5 text-blue-200">Unified Platform</div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          title="Toggle sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5" style={{ background: 'var(--surface)' }}>
        {visibleModules.map(g => (
          <ModuleGroup key={g.group} group={g} collapsed={collapsed} />
        ))}

      </nav>

      {/* User footer */}
      <div className="px-2 py-3 border-t" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
        <div className={cn('flex items-center gap-2.5 px-2 py-2 rounded-lg', collapsed && 'justify-center')}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
            style={{ background: 'var(--brand)' }}>
            {user?.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user?.fullName}</div>
              <div className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{user?.roleName}</div>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={logout}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#94a3b8] hover:text-[#ef4444] hover:bg-[#fef2f2] transition-colors shrink-0"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
