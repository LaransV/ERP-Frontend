'use client';
import { cn, statusColors, fmt } from '@/lib/utils';
import { ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight, Search, TrendingUp, TrendingDown, Minus, AlertCircle, Loader2, X } from 'lucide-react';
import {
  useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel,
  getPaginationRowModel, flexRender, type ColumnDef, type SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';

// ── PageHeader ────────────────────────────────────────────────
interface PHProps {
  title: string | React.ReactNode; subtitle?: string;
  crumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode; className?: string;
}
export function PageHeader({ title, subtitle, crumbs, actions, className }: PHProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-4 animate-fade-up', className)}>
      <div>
        {crumbs && (
          <nav className="flex items-center gap-1 mb-1.5">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1 text-xs text-text-muted">
                {i > 0 && <ChevronRight className="w-3 h-3" />}
                {c.href ? <a href={c.href} className="hover:text-text-primary transition-colors">{c.label}</a> : c.label}
              </span>
            ))}
          </nav>
        )}
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 mt-4 shrink-0">{actions}</div>}
    </div>
  );
}

// ── StatusBadge ───────────────────────────────────────────────
export function StatusBadge({ status }: { status: string }) {
  const cls = statusColors[status] ?? 'badge-gray';
  return <span className={cn('badge', cls)}><span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />{status}</span>;
}

// ── KPICard ───────────────────────────────────────────────────
interface KPIProps {
  title: string; value: string | number; sub?: string;
  icon?: React.ComponentType<{ className?: string }>;
  color?: string; trend?: number; loading?: boolean;
}
export function KPICard({ title, value, sub, icon: Icon, color = 'text-brand', trend, loading }: KPIProps) {
  return (
    <div className="glass-card p-5 animate-fade-up">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted">{title}</p>
          <div className={cn('text-2xl font-bold mt-2', color, loading && 'opacity-40')}>
            {loading ? '—' : value}
          </div>
          {sub && <p className="text-xs text-text-muted mt-0.5">{sub}</p>}
        </div>
        {Icon && (
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', color.replace('text-', 'bg-').replace('finance', 'finance/15').replace('hr', 'hr/15').replace('inv', 'inv/15').replace('crm', 'crm/15').replace('brand', 'brand/15'))}>
            <Icon className={cn('w-5 h-5', color)} />
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-bg-border">
          {trend > 0 ? <TrendingUp className="w-3.5 h-3.5 text-state-success" /> :
           trend < 0 ? <TrendingDown className="w-3.5 h-3.5 text-state-danger" /> :
           <Minus className="w-3.5 h-3.5 text-text-muted" />}
          <span className={cn('text-xs font-medium', trend > 0 ? 'text-state-success' : trend < 0 ? 'text-state-danger' : 'text-text-muted')}>
            {trend > 0 ? '+' : ''}{trend.toFixed(1)}% vs last month
          </span>
        </div>
      )}
    </div>
  );
}

// ── DataTable ─────────────────────────────────────────────────
interface DTProps<T> {
  data: T[]; columns: ColumnDef<T>[]; loading?: boolean;
  onRowClick?: (row: T) => void; searchPlaceholder?: string;
  toolbar?: React.ReactNode; emptyMsg?: string; pageSize?: number;
}
export function DataTable<T>({ data, columns, loading, onRowClick, searchPlaceholder = 'Search…', toolbar, emptyMsg = 'No records found.', pageSize = 50 }: DTProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const table = useReactTable({
    data, columns, state: { sorting, globalFilter },
    onSortingChange: setSorting, onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(), getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: pageSize } },
  });
  return (
    <div
      className="overflow-hidden rounded-xl shadow-sm animate-fade-up light-blue-table h-[calc(100vh-195px)] flex flex-col"
      style={{ border: '1px solid var(--border)', background: 'var(--card)' }}
    >
      {/* Toolbar */}
      <div
          className="flex items-center px-4 py-3 border-b"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          {/* Search */}
          <div className="relative max-w-xs w-full">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
              style={{ color: 'var(--text-muted)' }}
            />
            <input
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg outline-none transition-all"
              style={{
                border: '1px solid var(--border)',
                background: 'var(--input-bg)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Right Side */}
          <div className="ml-auto flex items-center gap-10">
            {toolbar && (
              <div className="flex items-center gap-4">
                {toolbar}
              </div>
            )}

            <span
              className="text-xs shrink-0 font-medium"
              style={{ color: 'var(--text-muted)' }}
            >
              {table.getFilteredRowModel().rows.length} records
            </span>
          </div>
      </div>

      {/* Table */}
      <div className="overflow-auto flex-1" style={{ background: 'var(--card)' }}>
        <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
          <thead>
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id} style={{ background: 'var(--brand)' }}>
                {hg.headers.map(h => (
                  <th
                    key={h.id}
                    onClick={h.column.getToggleSortingHandler()}
                    style={{
                      cursor: h.column.getCanSort() ? 'pointer' : 'default',
                      padding: '12px 16px',
                      color: '#ffffff',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      textAlign: 'left',
                      whiteSpace: 'nowrap',
                      userSelect: 'none',
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {h.column.getIsSorted() === 'asc'
                        ? <span className="opacity-80">↑</span>
                        : h.column.getIsSorted() === 'desc'
                        ? <span className="opacity-80">↓</span>
                        : null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  {columns.map((_, j) => (
                    <td key={j} style={{ padding: '12px 16px' }}>
                      <div className="skeleton h-4 w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
              : table.getRowModel().rows.length === 0
              ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13.5px' }}
                  >
                    {emptyMsg}
                  </td>
                </tr>
              )
              : table.getRowModel().rows.map((row, idx) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    cursor: onRowClick ? 'pointer' : 'default',
                    background: idx % 2 === 0 ? 'var(--card)' : 'var(--surface)',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--hover)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = idx % 2 === 0 ? 'var(--card)' : 'var(--surface)'; }}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} style={{ padding: '11px 16px', fontSize: '13.5px', color: 'var(--text-primary)' }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-t"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Rows per page</span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(+e.target.value)}
            className="text-xs rounded-lg px-2 py-1 outline-none"
            style={{
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--text-primary)',
            }}
          >
            {[10, 20, 50, 100].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs mr-2" style={{ color: 'var(--text-secondary)' }}>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </span>
          <button onClick={() => table.firstPage()} disabled={!table.getCanPreviousPage()} className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-30 transition-colors" style={{ color: 'var(--text-secondary)' }}>
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-30 transition-colors" style={{ color: 'var(--text-secondary)' }}>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-30 transition-colors" style={{ color: 'var(--text-secondary)' }}>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => table.lastPage()} disabled={!table.getCanNextPage()} className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-30 transition-colors" style={{ color: 'var(--text-secondary)' }}>
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────
interface ModalProps { open: boolean; onClose: () => void; title: string; children: React.ReactNode; width?: string; }
export function Modal({ open, onClose, title, children, width = 'max-w-xl' }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={cn('relative w-full glass-card shadow-lift animate-scale-in max-h-[90vh] overflow-y-auto', width)}>
        <div className="flex items-center justify-between p-5 border-b border-bg-border">
          <h2 className="section-hd">{title}</h2>
          <button onClick={onClose} className="btn-ghost btn-icon"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────
export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('w-5 h-5 animate-spin text-brand', className)} />;
}

// ── AccessDenied ──────────────────────────────────────────────
export function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-up">
      <AlertCircle className="w-12 h-12 text-state-danger mb-4" />
      <h2 className="text-lg font-bold text-text-primary mb-2">Access Denied</h2>
      <p className="text-text-muted text-sm">You don&apos;t have permission to view this screen.<br />Contact your administrator.</p>
    </div>
  );
}

// ── FormField ─────────────────────────────────────────────────
interface FFProps { label: string; error?: string; required?: boolean; children: React.ReactNode; }
export function FormField({ label, error, required, children }: FFProps) {
  return (
    <div>
      <label className="field-label">{label}{required && <span className="text-state-danger ml-0.5">*</span>}</label>
      {children}
      {error && <p className="text-xs text-state-danger mt-1">{error}</p>}
    </div>
  );
}


// ── AuditBar ─────────────────────────────────────────────────
// Reusable across ALL screens — pass the record's audit fields
interface AuditBarProps {
  createdBy?:       string | null;
  createdDate?:     string | null;
  modifiedBy?:  string | null;
  modifiedDate?: string | null;
  className?: string;
}
function fmtAuditDate(raw?: string | null): string {
  if (!raw) return '—';
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleString('en-IN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  } catch { return raw; }
}
export function AuditBar({ createdBy, createdDate, modifiedBy, modifiedDate, className }: AuditBarProps) {
  const hasAny = createdBy || createdDate || modifiedBy || modifiedDate;
  
  if (!hasAny) return null;
  return (
    <div
      className={cn('flex flex-wrap items-center gap-x-8 gap-y-1 rounded-lg px-4 py-2.5 text-xs mb-4', className)}
      style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
    >
      {(createdBy || createdDate) && (
        <>
          <span><span className="font-medium" style={{ color: 'var(--text-secondary)' }}>Created By : </span>{createdBy ?? '—'}</span>
          <span><span className="font-medium" style={{ color: 'var(--text-secondary)' }}>Created Date : </span>{fmtAuditDate(createdDate)}</span>
        </>
      )}
      {(modifiedBy || modifiedDate) && (
        <>
          <span><span className="font-medium" style={{ color: 'var(--text-secondary)' }}>Last Modified By : </span>{modifiedBy ?? '—'}</span>
          <span><span className="font-medium" style={{ color: 'var(--text-secondary)' }}>Last Modified Date : </span>{fmtAuditDate(modifiedDate)}</span>
        </>
      )}
    </div>
  );
}
