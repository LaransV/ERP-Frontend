"use client";
import { Plus, Edit, Trash2, ChevronDown, FileSpreadsheet, FileText, SlidersHorizontal, X } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { PageHeader, DataTable, AccessDenied } from '@/components/shared';
import { useAuthStore } from '@/store/authStore';
import type { ColumnDef } from '@tanstack/react-table';
import type { TClient } from '@/schemas/finance/response';
import { useClientsLogic } from '@/modules/finance/clients/hooks/useLogic';
import  ActionDropdown  from '@/modules/finance/clients/components/partials/ActionDropdown'
import  StateFilterPanel  from '@/modules/finance/clients/components/partials/FilterPanel'

interface ActionItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

// ── Main Module ───────────────────────────────────────────────────
export default function ClientsModule() {
  const { canAccess } = useAuthStore();
  const canRead = canAccess('FINANCE_CLIENTS', 'read');
  const {
    clients, total, isLoading,
    canCreate, canUpdate, canDelete,
    handleDelete, handleNew, handleEdit,
    filterState, setFilterState, appliedState,
    filterOpen, setFilterOpen,
    handleFilterApply, handleFilterClear,
    handleExportExcel, handleExportPdf,
  } = useClientsLogic();

  if (!canRead) return <AccessDenied />;

  const cols: ColumnDef<TClient>[] = [
    { accessorKey: 'clientName', header: 'Client Name', cell: ({ getValue }) => <span>{getValue() as string}</span> },
    { accessorKey: 'phone',      header: 'Mobile',      cell: ({ getValue }) => <span>{(getValue() as string) || '—'}</span> },
    { accessorKey: 'gstNumber',  header: 'GST No',      cell: ({ getValue }) => <span>{(getValue() as string) || '—'}</span> },
    { accessorKey: 'panNumber',  header: 'PAN No',      cell: ({ getValue }) => <span>{(getValue() as string) || '—'}</span> },
    { accessorKey: 'state',      header: 'State Name',  cell: ({ getValue }) => <span>{(getValue() as string) || '—'}</span> },
    {
      id: 'actions', header: '',
      cell: ({ row }) => (
        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
          {canUpdate && (
            <button onClick={() => handleEdit(row.original.clientId)} className="btn-ghost btn-icon btn-sm">
              <Edit className="w-3.5 h-3.5" />
            </button>
          )}
          {canDelete && (
            <button onClick={() => handleDelete(row.original.clientId)} className="btn-ghost btn-icon btn-sm text-red-400 hover:bg-red-500/10">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const actionItems: ActionItem[] = [
    {
      label: 'Export PDF',
      icon: <FileText className="w-4 h-4" style={{ color: 'var(--brand)' }} />,
      onClick: handleExportPdf,
    },
    {
      label: 'Export Excel',
      icon: <FileSpreadsheet className="w-4 h-4" style={{ color: '#1a7a4a' }} />,
      onClick: handleExportExcel,
    },
  ];

  const toolbar = (
    <div className="flex items-center gap-2">
      {/* Action Dropdown */}
      <ActionDropdown items={actionItems} />

      {/* Filter Button */}
      <div className="relative">
        <button
          onClick={() => setFilterOpen(o => !o)}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
          style={{
            border: `1px solid ${appliedState ? 'var(--brand)' : 'var(--border)'}`,
            background: appliedState ? 'color-mix(in srgb, var(--brand) 10%, transparent)' : 'var(--surface)',
            color: appliedState ? 'var(--brand)' : 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          {appliedState ? appliedState : 'Filter'}
          {appliedState && (
            <X
              className="w-3 h-3 ml-1"
              onClick={e => { e.stopPropagation(); handleFilterClear(); }}
              style={{ cursor: 'pointer' }}
            />
          )}
        </button>
        <StateFilterPanel
          open={filterOpen}
          onClose={() => setFilterOpen(false)}
          value={filterState}
          onChange={setFilterState}
          onApply={handleFilterApply}
          onClear={handleFilterClear}
        />
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="CLIENT DETAILS"
        subtitle={`${total} clients`}
        crumbs={[{ label: 'Sales' }, { label: 'Clients' }]}
        actions={
          canCreate
            ? <button onClick={handleNew} className="btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" /> New Client
              </button>
            : undefined
        }
      />
      <DataTable
        data={clients}
        columns={cols}
        onRowClick={(row) => handleEdit(row.clientId)}
        loading={isLoading}
        searchPlaceholder="Search by Name"
        emptyMsg="No clients found."
        toolbar={toolbar}
      />
    </div>
  );
}
