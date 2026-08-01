"use client";
import { ChevronDown } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

// ── Reusable Action Dropdown ──────────────────────────────────────
interface ActionItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}
export default function ActionDropdown({ items }: { items: ActionItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="btn-primary flex items-center gap-1.5"
        style={{ background: 'var(--brand)', color: '#fff', padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}
      >
        Action <ChevronDown className="w-3.5 h-3.5" style={{ opacity: 0.85 }} />
      </button>
      {open && (
        <div
          className="absolute right-0 z-50 mt-1 rounded-xl shadow-xl overflow-hidden"
          style={{ minWidth: 180, background: 'var(--card)', border: '1px solid var(--border)', top: '100%' }}
        >
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => { item.onClick(); setOpen(false); }}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-left transition-colors hover:bg-[var(--surface)]"
              style={{ color: 'var(--text-primary)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}