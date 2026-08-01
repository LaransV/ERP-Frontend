'use client';
import { useState, useEffect } from 'react';
import { Plus, Building2, Edit, Trash2, Check, X } from 'lucide-react';
import { useCompanyStore } from '@/store/themeStore';
import { companiesApi } from '@/lib/api/services';
import { PageHeader, AccessDenied } from '@/components/shared';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD'];

type CompanyForm = {
  companyName: string;
  currency: string;
  gstin: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
};

const emptyForm: CompanyForm = {
  companyName: '', currency: 'INR', gstin: '',
  address: '', phone: '', email: '', isActive: true,
};

export default function CompaniesModule() {
  const { canAccess } = useAuthStore();
  const { activeCompanyId, setActiveCompany, setCompanies } = useCompanyStore();
  const [companies, setLocalCompanies] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]     = useState<number | null>(null);
  const [form, setForm]         = useState<CompanyForm>(emptyForm);
  const [saving, setSaving]     = useState(false);

  if (!canAccess('ADMIN_COMPANY_INFO', 'read')) return <AccessDenied />;

  const load = async () => {
    try {
      setLoading(true);
      const res = await companiesApi.list();
      const list = res.data?.data ?? [];
      setLocalCompanies(list);
      // sync to companyStore so TopBar switcher stays fresh
      setCompanies(list.map((c: any) => ({
        id: String(c.companyId), name: c.companyName,
        currency: c.currency, gstin: c.gstin,
      })));
    } catch {
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };
  const openEdit = (c: any) => {
    setForm({
      companyName: c.companyName, currency: c.currency ?? 'INR',
      gstin: c.gstin ?? '', address: c.address ?? '',
      phone: c.phone ?? '', email: c.email ?? '', isActive: c.isActive,
    });
    setEditId(c.companyId);
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditId(null); setForm(emptyForm); };

  const save = async () => {
    if (!form.companyName.trim()) { toast.error('Company name required'); return; }
    try {
      setSaving(true);
      if (editId) {
        await companiesApi.update(editId, form);
        toast.success('Company updated');
      } else {
        await companiesApi.create(form);
        toast.success('Company added');
      }
      closeForm();
      await load();
    } catch {
      toast.error('Failed to save company');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number, name: string) => {
    if (!confirm(`Remove "${name}"?`)) return;
    try {
      await companiesApi.delete(id);
      toast.success('Company removed');
      await load();
    } catch {
      toast.error('Cannot delete company');
    }
  };

  return (
    <div>
      <PageHeader
        title="Companies"
        subtitle="Add and manage companies"
        crumbs={[{ label: 'Admin' }, { label: 'Companies' }]}
        actions={
          <button onClick={openAdd} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Company
          </button>
        }
      />

      {/* Add / Edit Form */}
      {showForm && (
        <div className="glass-card p-5 mb-6 space-y-4">
          <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}>
            {editId ? 'Edit Company' : 'New Company'}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="field-label">Company Name *</label>
              <input className="field-input" value={form.companyName}
                onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
                placeholder="ABC Pvt Ltd" />
            </div>
            <div>
              <label className="field-label">Currency</label>
              <select className="field-select" value={form.currency}
                onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">GSTIN</label>
              <input className="field-input" value={form.gstin}
                onChange={e => setForm(f => ({ ...f, gstin: e.target.value }))}
                placeholder="29AABCN1234A1Z5" />
            </div>
            <div>
              <label className="field-label">Phone</label>
              <input className="field-input" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <label className="field-label">Email</label>
              <input className="field-input" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="field-label">Address</label>
              <input className="field-input" value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={closeForm} className="btn-secondary btn-sm">
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
            <button onClick={save} disabled={saving} className="btn-primary btn-sm">
              <Check className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="glass-card py-20 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</div>
      ) : companies.length === 0 ? (
        <div className="glass-card flex flex-col items-center py-20 text-center">
          <Building2 className="w-12 h-12 mb-3" style={{ color: 'var(--text-muted)' }} />
          <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No companies yet</div>
          <button onClick={openAdd} className="btn-primary btn-sm mt-3">
            <Plus className="w-3.5 h-3.5" /> Add Company
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {companies.map((c: any) => {
            const isActive = activeCompanyId === String(c.companyId);
            return (
              <div key={c.companyId}
                className="glass-card p-4 flex items-center gap-3"
                style={{ borderColor: isActive ? 'var(--brand)' : undefined }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}>
                  {c.companyName?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{c.companyName}</span>
                    {isActive && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: 'rgba(79,142,247,0.12)', color: 'var(--brand)' }}>Active</span>
                    )}
                    {!c.isActive && (
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: 'var(--hover)', color: 'var(--text-muted)' }}>Inactive</span>
                    )}
                  </div>
                  <div className="text-xs mt-0.5 flex gap-3" style={{ color: 'var(--text-muted)' }}>
                    <span>{c.currency}</span>
                    {c.gstin && <span>{c.gstin}</span>}
                    {c.phone && <span>{c.phone}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!isActive && (
                    <button
                      onClick={() => { setActiveCompany(String(c.companyId)); toast.success(`Switched to ${c.companyName}`); }}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                      style={{ background: 'rgba(79,142,247,0.1)', color: 'var(--brand)', border: '1px solid rgba(79,142,247,0.25)' }}>
                      Switch
                    </button>
                  )}
                  <button onClick={() => openEdit(c)} className="btn-ghost btn-icon btn-sm">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  {!isActive && (
                    <button onClick={() => remove(c.companyId, c.companyName)}
                      className="btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
