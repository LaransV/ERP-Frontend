import { useRef, useEffect } from 'react';
import { INDIAN_STATES } from '@/modules/finance/clients/constants';


// ── State Filter Panel ────────────────────────────────────────────
export default function StateFilterPanel({
  open, onClose,
  value, onChange,
  onApply, onClear,
}: {
  open: boolean; onClose: () => void;
  value: string; onChange: (v: string) => void;
  onApply: () => void; onClear: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      ref={ref}
      className="absolute right-0 z-50 rounded-xl shadow-xl p-4"
      style={{ minWidth: 260, background: 'var(--card)', border: '1px solid var(--border)', top: '100%', marginTop: 4 }}
    >
      <p className="text-sm font-semibold mb-3" style={{ color: 'var(--brand)' }}>Filter By</p>
      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>State Name</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-lg px-3 py-2 text-sm outline-none"
        style={{ border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text-primary)' }}
      >
        <option value="">— All —</option>
        {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <div className="flex gap-2 mt-4">
        <button
          onClick={onClear}
          className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)', cursor: 'pointer' }}
        >
          Clear
        </button>
        <button
          onClick={onApply}
          className="flex-1 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
          style={{ background: 'var(--brand)', border: 'none', cursor: 'pointer' }}
        >
          Apply
        </button>
      </div>
    </div>
  );
}