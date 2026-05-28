'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { ResourceCard } from './ResourceCard';
import type { ResourceSummary } from '@/lib/types/library';

type Props = {
  open: boolean;
  termId: string;
  weekNumber: number;
  subject: 'SCIENCE' | 'HISTORY';
  age: number;
  onClose: () => void;
  onPicked: () => void;
};

export function WeeklyTopicPicker({ open, termId, weekNumber, subject, age, onClose, onPicked }: Props) {
  const [resources, setResources] = useState<ResourceSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [picking, setPicking] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Fetch resources when opened
  useEffect(() => {
    if (!open) return;
    const params = new URLSearchParams({ subject, age: String(age), term: termId });
    setLoading(true);
    fetch(`/api/library?${params.toString()}`)
      .then((r) => r.json())
      .then((j) => setResources(j.resources ?? []))
      .finally(() => setLoading(false));
  }, [open, subject, age, termId]);

  // Esc key closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  async function pick(resourceId: string) {
    setPicking(resourceId);
    await fetch('/api/weekly-topic', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ termId, weekNumber, subject, resourceId }),
    });
    onPicked();
    onClose();
    setPicking(null);
  }

  async function clearPick() {
    setClearing(true);
    await fetch(`/api/weekly-topic?termId=${encodeURIComponent(termId)}&weekNumber=${weekNumber}&subject=${subject}`, {
      method: 'DELETE',
    });
    onPicked();
    onClose();
    setClearing(false);
  }

  if (!open) return null;

  const subjectLabel = subject === 'SCIENCE' ? 'Science (Mon/Wed)' : 'History (Tue/Thu)';

  return (
    <div className="fixed inset-0 z-40 bg-black/30 flex justify-end" onClick={onClose}>
      <div
        ref={drawerRef}
        onClick={(e) => e.stopPropagation()}
        className="bg-cream w-full max-w-lg h-full overflow-y-auto p-6 shadow-xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-[10px] text-ink-muted uppercase tracking-widest font-semibold mb-0.5">
              Week {weekNumber} · {subjectLabel}
            </div>
            <h2 className="font-display text-xl font-semibold leading-tight">Pick a topic</h2>
            <p className="text-xs text-ink-muted mt-1">
              {loading ? 'Loading resources…' : `${resources.length} resources for age ${age}`}
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-ink-muted hover:text-ink mt-0.5">
            <X size={18} />
          </button>
        </div>

        {/* Resource list */}
        <div className="flex-1 space-y-3 pb-4">
          {loading && (
            <div className="text-center py-12 text-ink-muted text-sm">Loading…</div>
          )}
          {!loading && resources.length === 0 && (
            <div className="text-center py-12 text-ink-muted text-sm">
              No resources found for these filters.
            </div>
          )}
          {!loading &&
            resources.map((r) => (
              <ResourceCard
                key={r.id}
                resource={r}
                onClick={() => pick(r.id)}
              />
            ))}
          {picking && (
            <div className="text-center py-2 text-xs text-ink-muted">Saving pick…</div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-rule pt-4 mt-auto">
          <button
            onClick={clearPick}
            disabled={clearing}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-rule rounded text-sm text-ink-soft hover:bg-paper disabled:opacity-50 transition"
          >
            <Trash2 size={14} />
            {clearing ? 'Clearing…' : 'Clear pick for this week'}
          </button>
        </div>
      </div>
    </div>
  );
}
