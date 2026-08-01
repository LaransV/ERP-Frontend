'use client';
import { useState, useEffect, useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Edit, Power, Trash2, Users, Loader2, Key, Shield, ArrowLeft, Save, RotateCcw, Info } from 'lucide-react';
import { useUsers, useRoles, useCompanies, useUserEntitlements, useSaveUserEntitlements, useResetUserEntitlements } from '@/hooks/useApi';
import { usersApi } from '@/lib/api/services';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { PageHeader, DataTable, StatusBadge, FormField, KPICard, AccessDenied, Spinner } from '@/components/shared';
import { fmt } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useCompanyStore } from '@/store/themeStore';
import type { User, UserEntitlementRow } from '@/types';

const schema = z.object({
  username: z.string().min(3).regex(/^[a-zA-Z0-9_]+$/, 'Username: only letters, numbers, underscore allowed (no spaces)'),
  email: z.string().email(),
  fullName: z.string().min(1),
  phone: z.string().optional(),
  roleId: z.number().min(1, 'Select a role'),
  companyId: z.number().min(1, 'Select a company'),
  password: z.string().optional(),
  isActive: z.boolean(),
});
type Form = z.infer<typeof schema>;

const MODULE_COLORS: Record<string, string> = {
  FINANCE: '#34D399', HR: '#A78BFA', INVENTORY: '#FBBF24', CRM: '#FB7185', ADMIN: '#60A5FA',
};

const ACTION_META = [
  { key: 'canRead',   label: 'Read',   color: '#4F8EF7' },
  { key: 'canCreate', label: 'Write',  color: '#22C55E' },
  { key: 'canUpdate', label: 'Update', color: '#EAB308' },
  { key: 'canDelete', label: 'Delete', color: '#EF4444' },
] as const;

// ── Screen Entitlement Tab (USER-LEVEL) ───────────────────────
// Fetches user-specific entitlements from GET /admin/users/{id}/entitlements
// Saves  user-specific entitlements to  POST /admin/users/{id}/entitlements
// isUserOverride=true  → orange row  → this screen is customised for THIS user
// isUserOverride=false → normal row  → showing role default (not yet overridden)
function ScreenEntitlementTab({ userId }: { userId: number }) {
  const { data: rows = [], isLoading } = useUserEntitlements(userId);
  const saveMut  = useSaveUserEntitlements(userId);
  const resetMut = useResetUserEntitlements(userId);

  // Local editable copy: Record<screenId, UserEntitlementRow>
  const [matrix, setMatrix] = useState<Record<number, UserEntitlementRow>>({});
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [search, setSearch] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [isDirty, setIsDirty]             = useState(false);  // true = user made changes, don't override

  // Build matrix from server data — only when NOT dirty (no unsaved changes)
  useEffect(() => {
    if (!rows.length) return;
    if (isDirty) return;                        // ← user has made changes; don't overwrite
    const m: Record<number, UserEntitlementRow> = {};
    rows.forEach(r => { m[r.screenId] = { ...r }; });
    setMatrix(m);
  }, [rows, isDirty]);

  // Unique modules — ADMIN excluded from tabs (shown as Settings section below)
  const modules = useMemo(() => {
    const seen = new Set<string>();
    const list: { moduleCode: string; moduleName: string }[] = [];
    rows.forEach(r => {
      if (r.moduleCode === 'ADMIN') return;
      if (!seen.has(r.moduleCode)) { seen.add(r.moduleCode); list.push({ moduleCode: r.moduleCode, moduleName: r.moduleName }); }
    });
    return list;
  }, [rows]);

  // Auto-select first non-admin module
  useEffect(() => {
    if (modules.length && !selectedModule) setSelectedModule(modules[0].moduleCode);
  }, [modules]);

  // Screens for current module tab (search filtered, ADMIN excluded)
  const visibleScreens = useMemo(() =>
    Object.values(matrix).filter(r =>
      r.moduleCode === selectedModule &&
      (search === '' || r.screenName.toLowerCase().includes(search.toLowerCase()))
    ).sort((a, b) => a.screenSortOrder - b.screenSortOrder),
  [matrix, selectedModule, search]);

  // Settings screens — only User Info + Company Info (not Roles/Entitlements)
  const SETTINGS_SCREENS = ['ADMIN_USERS', 'ADMIN_COMPANY_INFO'];
  const settingsScreens = useMemo(() =>
    Object.values(matrix).filter(r =>
      SETTINGS_SCREENS.includes(r.screenCode) &&
      (search === '' || r.screenName.toLowerCase().includes(search.toLowerCase()))
    ).sort((a, b) => a.screenSortOrder - b.screenSortOrder),
  [matrix, search]);

  // Toggle one CRUD flag for one screen
  const toggle = (screenId: number, field: keyof UserEntitlementRow, val: boolean) => {
    setIsDirty(true);                           // ← mark dirty so rows refetch won't reset
    setMatrix(m => {
      const row = { ...m[screenId], [field]: val, isUserOverride: true };
      return { ...m, [screenId]: row };
    });
  };

  // Toggle entire column (all visible screens in current module tab)
  const toggleCol = (field: keyof UserEntitlementRow, val: boolean) => {
    setIsDirty(true);                           // ← mark dirty
    setMatrix(m => {
      const nm = { ...m };
      visibleScreens.forEach(s => {
        nm[s.screenId] = { ...nm[s.screenId], [field]: val, isUserOverride: true };
      });
      return nm;
    });
  };

  // Save — send ALL screens (BE upserts each row)
  const handleSave = () => {
    const screens = Object.values(matrix).map(r => ({
      screenId:  r.screenId,
      canCreate: r.canCreate,
      canRead:   r.canRead,
      canUpdate: r.canUpdate,
      canDelete: r.canDelete,
    }));
    saveMut.mutate(screens, {
      onSuccess: () => setIsDirty(false),       // ← clear dirty; fresh server data can now load
    });
  };

  // Reset — delete user-level rows → fall back to role defaults
  const handleReset = () => {
    resetMut.mutate(undefined, {
      onSuccess: () => { setConfirmReset(false); setIsDirty(false); },
    });
  };

  const hasAnyOverride = Object.values(matrix).some(r => r.isUserOverride);

  if (!userId) return (
    <div className="flex flex-col items-center justify-center py-20" style={{ color: 'var(--text-muted)' }}>
      <Shield className="w-10 h-10 mb-3 opacity-40" />
      <p className="text-sm">Save the user first to manage screen access.</p>
    </div>
  );

  if (isLoading) return <div className="flex justify-center py-12"><Spinner /></div>;

  return (
    <div className="space-y-4">

      {/* Info banner */}
      <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-xs"
        style={{ background: 'rgba(79,142,247,0.08)', border: '1px solid rgba(79,142,247,0.2)', color: 'var(--text-secondary)' }}>
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: '#4F8EF7' }} />
        <span>
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>User-level access</span>
          {' '}— These permissions apply only to this user and override their role defaults.{' '}
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#F97316' }} />
            Orange rows
          </span>
          {' '}= saved for this user. White rows = showing role defaults (not yet customised).
        </span>
      </div>

      {/* Module tabs */}
      <div className="flex flex-wrap gap-2">
        {modules.map(mod => {
          const color    = MODULE_COLORS[mod.moduleCode] ?? '#8896B3';
          const isActive = selectedModule === mod.moduleCode;
          const overCount = Object.values(matrix).filter(r => r.moduleCode === mod.moduleCode && r.isUserOverride).length;
          return (
            <button key={mod.moduleCode} onClick={() => setSelectedModule(mod.moduleCode)}
              className="flex flex-col items-center gap-1 px-5 py-3 rounded-2xl border-2 transition-all font-medium text-sm relative"
              style={{
                borderColor: isActive ? color : 'var(--border)',
                background:  isActive ? `${color}10` : 'var(--card)',
                color:       isActive ? color : 'var(--text-secondary)',
              }}>
              <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
                <Shield className="w-3.5 h-3.5" style={{ color }} />
              </div>
              <span className="text-xs">{mod.moduleName}</span>
              {overCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                  style={{ background: '#F97316' }}>
                  {overCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search + Action buttons */}
      <div className="flex items-center gap-2">
        <input className="field-input text-sm flex-1" placeholder="Search screen name..."
          value={search} onChange={e => setSearch(e.target.value)} />

        {/* Reset to role defaults */}
        {hasAnyOverride && !confirmReset && (
          <button onClick={() => setConfirmReset(true)}
            className="btn-ghost btn-sm flex items-center gap-1.5 text-orange-400 border border-orange-200 hover:bg-orange-50">
            <RotateCcw className="w-3.5 h-3.5" /> Reset to Role
          </button>
        )}
        {confirmReset && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Reset all overrides?</span>
            <button onClick={handleReset} disabled={resetMut.isPending}
              className="px-2 py-0.5 rounded text-white text-xs font-medium" style={{ background: '#EF4444' }}>
              {resetMut.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Yes, Reset'}
            </button>
            <button onClick={() => setConfirmReset(false)} className="px-2 py-0.5 rounded text-xs" style={{ color: 'var(--text-muted)' }}>
              Cancel
            </button>
          </div>
        )}

        {/* Save */}
        <button onClick={handleSave} disabled={saveMut.isPending} className="btn-primary btn-sm">
          {saveMut.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Save Access
        </button>
      </div>

      {/* Entitlement table */}
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full text-sm">
          <thead style={{ background: 'var(--hover)' }}>
            <tr>
              <th className="tbl-head text-left" style={{ width: '42%' }}>Screen</th>
              {ACTION_META.map(a => (
                <th key={a.key} className="tbl-head text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span style={{ color: a.color }}>{a.label}</span>
                    {/* Column header checkbox: toggle ALL visible screens */}
                    <input type="checkbox" className="w-3.5 h-3.5 cursor-pointer"
                      checked={visibleScreens.length > 0 && visibleScreens.every(s => matrix[s.screenId]?.[a.key as keyof UserEntitlementRow] as boolean)}
                      onChange={e => toggleCol(a.key as keyof UserEntitlementRow, e.target.checked)} />
                  </div>
                </th>
              ))}
              <th className="tbl-head text-center text-xs" style={{ color: 'var(--text-muted)', width: 70 }}>Source</th>
            </tr>
          </thead>
          <tbody>
            {visibleScreens.length === 0 && (
              <tr>
                <td colSpan={6} className="tbl-cell text-center py-8" style={{ color: 'var(--text-muted)' }}>
                  No screens found
                </td>
              </tr>
            )}
            {visibleScreens.map((s, i) => {
              const row = matrix[s.screenId];
              if (!row) return null;
              const isOverride = row.isUserOverride;
              return (
                <tr key={s.screenId}
                  style={{
                    background: isOverride
                      ? 'rgba(249,115,22,0.06)'
                      : i % 2 === 0 ? 'transparent' : 'var(--hover)',
                    borderBottom: isOverride ? '1px solid rgba(249,115,22,0.15)' : undefined,
                  }}>
                  <td className="tbl-cell font-medium" style={{ paddingLeft: isOverride ? 14 : 16, borderLeft: isOverride ? '3px solid #F97316' : '3px solid transparent' }}>
                    {s.screenName}
                    <span className="ml-2 text-[10px] font-normal" style={{ color: 'var(--text-muted)' }}>{s.screenCode}</span>
                  </td>
                  {ACTION_META.map(a => {
                    const checked = row[a.key as keyof UserEntitlementRow] as boolean ?? false;
                    return (
                      <td key={a.key} className="tbl-cell text-center">
                        <input type="checkbox"
                          checked={checked}
                          onChange={e => toggle(s.screenId, a.key as keyof UserEntitlementRow, e.target.checked)}
                          className="w-4 h-4 cursor-pointer"
                          style={{ accentColor: a.color }} />
                      </td>
                    );
                  })}
                  <td className="tbl-cell text-center">
                    {isOverride
                      ? <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(249,115,22,0.15)', color: '#F97316' }}>USER</span>
                      : <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: 'var(--hover)', color: 'var(--text-muted)' }}>ROLE</span>
                    }
                  </td>
                </tr>
              );
            })}

            {/* ── Settings section — Admin screens always shown at bottom ── */}
            {settingsScreens.length > 0 && (
              <>
                <tr>
                  <td colSpan={6} className="px-4 py-2"
                    style={{ background: 'var(--hover)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                      Settings
                    </span>
                  </td>
                </tr>
                {settingsScreens.map((s, i) => {
                  const row = matrix[s.screenId];
                  if (!row) return null;
                  const isOverride = row.isUserOverride;
                  return (
                    <tr key={s.screenId}
                      style={{
                        background: isOverride
                          ? 'rgba(249,115,22,0.06)'
                          : i % 2 === 0 ? 'rgba(96,165,250,0.04)' : 'rgba(96,165,250,0.08)',
                        borderBottom: isOverride ? '1px solid rgba(249,115,22,0.15)' : undefined,
                      }}>
                      <td className="tbl-cell font-medium" style={{ paddingLeft: isOverride ? 26 : 28, borderLeft: isOverride ? '3px solid #F97316' : '3px solid transparent' }}>
                        {s.screenName}
                        <span className="ml-2 text-[10px] font-normal" style={{ color: 'var(--text-muted)' }}>{s.screenCode}</span>
                      </td>
                      {ACTION_META.map(a => {
                        const checked = row[a.key as keyof UserEntitlementRow] as boolean ?? false;
                        return (
                          <td key={a.key} className="tbl-cell text-center">
                            <input type="checkbox"
                              checked={checked}
                              onChange={e => toggle(s.screenId, a.key as keyof UserEntitlementRow, e.target.checked)}
                              className="w-4 h-4 cursor-pointer"
                              style={{ accentColor: a.color }} />
                          </td>
                        );
                      })}
                      <td className="tbl-cell text-center">
                        {isOverride
                          ? <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(249,115,22,0.15)', color: '#F97316' }}>USER</span>
                          : <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: 'var(--hover)', color: 'var(--text-muted)' }}>ROLE</span>
                        }
                      </td>
                    </tr>
                  );
                })}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Override count summary */}
      {hasAnyOverride && (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {Object.values(matrix).filter(r => r.isUserOverride).length} screen(s) customised for this user.
          Others follow role defaults.
        </p>
      )}
    </div>
  );
}

// ── Preference Tab ─────────────────────────────────────────────
function PreferenceTab() {
  return (
    <div className="space-y-4 max-w-lg">
      <div className="glass-card p-5 space-y-4">
        <div className="section-hd mb-2">Display Preferences</div>
        <div><label className="field-label">Date Format</label>
          <select className="field-select"><option>DD-MM-YYYY</option><option>MM-DD-YYYY</option><option>YYYY-MM-DD</option></select></div>
        <div><label className="field-label">Language</label>
          <select className="field-select"><option>English</option><option>Tamil</option><option>Hindi</option></select></div>
        <div><label className="field-label">Timezone</label>
          <select className="field-select"><option>Asia/Kolkata (IST)</option><option>UTC</option></select></div>
      </div>
      <div className="glass-card p-5 space-y-3">
        <div className="section-hd mb-2">Notifications</div>
        {['Email notifications', 'System alerts', 'Report reminders'].map(n => (
          <label key={n} className="flex items-center justify-between cursor-pointer py-1">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{n}</span>
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded" style={{ accentColor: 'var(--brand)' }} />
          </label>
        ))}
      </div>
    </div>
  );
}

// ── User Form (3-tab: Info / Screen Entitlement / Preference) ──
function UserForm({ editing, onBack }: { editing: User | null; onBack: () => void }) {
  const { data: roles }     = useRoles();
  const { data: companies } = useCompanies();
  const [tab, setTab] = useState<'info' | 'entitlement' | 'preference'>('info');
  const qc = useQueryClient();
  const activeCompanyId = useCompanyStore(s => s.activeCompanyId);

  const saveMut = useMutation({
    mutationFn: async (d: Form) => {
      if (editing) {
        return usersApi.update(editing.userId, d).then(r => r.data.data);
      }
      // ── Create user ──────────────────────────────────────────
      const newUser = await usersApi.create({ ...d, password: d.password! }).then(r => r.data.data);

      // ── Req 4: Auto-insert role-based entitlements for new user ─
      if (newUser?.userId) {
        try {
          const entRows = await usersApi.getUserEntitlements(newUser.userId).then(r => r.data.data ?? []);
          if (entRows.length > 0) {
            const screens = entRows.map((e: any) => ({
              screenId:  e.screenId,
              canCreate: e.canCreate,
              canRead:   e.canRead,
              canUpdate: e.canUpdate,
              canDelete: e.canDelete,
            }));
            await usersApi.saveUserEntitlements(newUser.userId, screens);
          }
        } catch {
          // entitlement auto-insert failure shouldn't block user creation success
        }
      }
      return newUser;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success(editing ? 'User updated' : 'User created');
      onBack();
    },
    onError: (e: any) => { toast.error(e?.response?.data?.message ?? 'Failed'); },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: editing
      ? { username: editing.username, email: editing.email, fullName: editing.fullName,
          phone: editing.phone ?? '', roleId: editing.roleId, isActive: editing.isActive,
          companyId: editing.companyId ?? Number(activeCompanyId) ?? 0 }
      : { isActive: true, roleId: 0, companyId: Number(activeCompanyId) ?? 0 },
  });

  const onSubmit = async (d: Form) => {
    if (!editing && (!d.password || d.password.length < 6)) { toast.error('Password min 6 chars'); return; }
    saveMut.mutate(d);
  };

  const TABS = [
    { id: 'info',        label: 'User Info' },
    { id: 'entitlement', label: 'Screen Entitlement' },
    { id: 'preference',  label: 'Preference' },
  ] as const;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="btn-ghost btn-icon"><ArrowLeft className="w-4 h-4" /></button>
          <div>
            <div className="page-title">{editing ? `Edit — ${editing.fullName}` : 'New User'}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Settings › User Management</div>
          </div>
        </div>
        {tab === 'info' && (
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
              <input type="checkbox" className="w-4 h-4 rounded" style={{ accentColor: 'var(--brand)' }} />
              Send Email with Password
            </label>
            <button onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6" style={{ borderColor: 'var(--border)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="px-5 py-3 text-sm font-medium relative"
            style={{ color: tab === t.id ? 'var(--brand)' : 'var(--text-secondary)' }}>
            {t.label}
            {tab === t.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: 'var(--brand)' }} />}
            {/* Orange dot if entitlement tab has user overrides */}
            {t.id === 'entitlement' && editing && (
              <span className="absolute top-2 right-1 w-1.5 h-1.5 rounded-full" style={{ background: '#F97316' }} />
            )}
          </button>
        ))}
      </div>

      {/* User Info Tab */}
      {tab === 'info' && (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl">
          <div className="glass-card p-6 space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <FormField label="Username *" error={errors.username?.message}>
                <input {...register('username')} disabled={!!editing} className="field-input disabled:opacity-50" placeholder="john_doe" />
              </FormField>
              <FormField label="Full Name *" error={errors.fullName?.message}>
                <input {...register('fullName')} className="field-input" placeholder="John Doe" />
              </FormField>
              <FormField label="Email *" error={errors.email?.message}>
                <input {...register('email')} type="email" className="field-input" placeholder="john@company.com" />
              </FormField>
              <FormField label="Phone">
                <input {...register('phone')} className="field-input" placeholder="9876543210" />
              </FormField>
              <FormField label="Company *" error={errors.companyId?.message}>
                <select
                  {...register('companyId', { valueAsNumber: true })}
                  className="field-select">
                  <option value={0}>Select Company</option>
                  {(companies ?? []).map((c: any) => (
                    <option key={c.companyId} value={c.companyId}>{c.companyName ?? c.name}</option>
                  ))}
                </select>
              </FormField>
            </div>
            {/* Role selector */}
            <div>
              <label className="field-label">User Role *</label>
              {errors.roleId && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>Select a role</p>}
              <div className="flex gap-3 mt-2">
                {[
                  { label: 'Super Admin', color: '#EF4444', idx: 0 },
                  { label: 'Admin',       color: '#EAB308', idx: 1 },
                  { label: 'User',        color: '#4F8EF7', idx: 2 },
                ].map(role => {
                  const rId = (roles ?? [])[role.idx]?.roleId ?? (role.idx + 1);
                  const isSelected = watch('roleId') === rId;
                  return (
                    <div key={role.label}
                      onClick={() => setValue('roleId', rId, { shouldValidate: true })}
                      className="flex items-center gap-2.5 px-5 py-3 rounded-xl border-2 cursor-pointer transition-all flex-1 select-none"
                      style={{
                        borderColor: isSelected ? role.color : 'var(--border)',
                        background:  isSelected ? `${role.color}12` : 'var(--hover)',
                      }}>
                      <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                        style={{ borderColor: isSelected ? role.color : 'var(--text-muted)' }}>
                        {isSelected && <div className="w-2 h-2 rounded-full" style={{ background: role.color }} />}
                      </div>
                      <span className="text-sm font-medium" style={{ color: isSelected ? role.color : 'var(--text-secondary)' }}>
                        {role.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            {!editing && (
              <FormField label="Password *">
                <input type="password" {...register('password')} className="field-input" placeholder="Min 6 characters" />
              </FormField>
            )}
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" {...register('isActive')} className="w-4 h-4 rounded" style={{ accentColor: 'var(--brand)' }} />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Active account</span>
            </label>
          </div>
        </form>
      )}

      {/* Screen Entitlement Tab — pass userId (not roleId) */}
      {tab === 'entitlement' && (
        editing
          ? <ScreenEntitlementTab userId={editing.userId} />
          : (
            <div className="flex flex-col items-center justify-center py-20" style={{ color: 'var(--text-muted)' }}>
              <Shield className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm">Save the user first, then configure screen access.</p>
            </div>
          )
      )}

      {tab === 'preference' && <PreferenceTab />}
    </div>
  );
}

// ── Main List Page ─────────────────────────────────────────────
export default function UsersModule() {
  const { canAccess } = useAuthStore();
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editing, setEditing] = useState<User | null>(null);
  const { data, isLoading } = useUsers({ size: 200 });
  const { data: roles } = useRoles();
  const qc = useQueryClient();

  const toggleMut = useMutation({
    mutationFn: (id: number) => usersApi.toggle(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('Status toggled'); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('User deleted'); },
  });

  if (!canAccess('ADMIN_USERS', 'read')) return <AccessDenied />;
  if (view === 'form') return <UserForm editing={editing} onBack={() => { setView('list'); setEditing(null); }} />;

  const users = data?.content ?? [];

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'fullName', header: 'User',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
            style={{ background: 'linear-gradient(135deg, #60A5FA, #3B82F6)' }}>
            {row.original.fullName.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{row.original.fullName}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{row.original.email}</div>
          </div>
        </div>
      ),
    },
    { accessorKey: 'username', header: 'Username',
      cell: ({ getValue }) => <span className="badge badge-gray font-mono text-xs">{getValue() as string}</span> },
    { accessorKey: 'roleName', header: 'Role',
      cell: ({ getValue }) => <span className="badge" style={{ background: 'rgba(96,165,250,0.12)', color: '#60A5FA', border: '1px solid rgba(96,165,250,0.25)' }}>{getValue() as string}</span> },
    { accessorKey: 'lastLogin', header: 'Last Login',
      cell: ({ getValue }) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{fmt.dateTime(getValue() as string)}</span> },
    { accessorKey: 'isActive', header: 'Status',
      cell: ({ getValue }) => <StatusBadge status={getValue() ? 'ACTIVE' : 'INACTIVE'} /> },
    {
      id: 'actions', header: '',
      cell: ({ row }) => (
        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
          {canAccess('ADMIN_USERS', 'update') && (
            <button onClick={() => { setEditing(row.original); setView('form'); }} className="btn-ghost btn-icon btn-sm">
              <Edit className="w-3.5 h-3.5" />
            </button>
          )}
          {canAccess('ADMIN_USERS', 'update') && (
            <button onClick={() => toggleMut.mutate(row.original.userId)}
              className="btn-ghost btn-icon btn-sm"
              style={{ color: row.original.isActive ? 'var(--warning)' : 'var(--success)' }}>
              <Power className="w-3.5 h-3.5" />
            </button>
          )}
          {canAccess('ADMIN_USERS', 'delete') && (
            <button onClick={() => { if (confirm('Delete?')) deleteMut.mutate(row.original.userId); }}
              className="btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }}>
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="User Management" subtitle={`${data?.totalElements ?? 0} users`}
        crumbs={[{ label: 'Settings' }, { label: 'User Management' }]}
        actions={canAccess('ADMIN_USERS', 'create') ? (
          <button onClick={() => { setEditing(null); setView('form'); }} className="btn-primary">
            <Plus className="w-4 h-4" /> New User
          </button>
        ) : undefined}
      />
      <div className="grid grid-cols-3 gap-4 mb-6">
        <KPICard title="Total Users"  value={users.length}                       icon={Users} color="text-brand" />
        <KPICard title="Active"       value={users.filter(u => u.isActive).length} icon={Power} color="text-state-success" />
        <KPICard title="Roles"        value={(roles ?? []).length}                icon={Key}   color="text-brand" />
      </div>
      <DataTable data={users} columns={columns} loading={isLoading}
        onRowClick={u => { setEditing(u); setView('form'); }}
        searchPlaceholder="Search users…" emptyMsg="No users found." />
    </div>
  );
}
