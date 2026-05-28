'use client';

import { useState } from 'react';
import { Check, ChevronRight } from 'lucide-react';

export type SequenceProgressRow = {
  assignmentId: string;
  childId: string;
  childName: string;
  sequenceId: string;
  sequenceName: string;
  subject: string;
  current: {
    id: string;
    unit: string;
    lessonRef: string;
    topic: string;
    estimatedMinutes: number | null;
  } | null;
  next: { id: string; unit: string; lessonRef: string; topic: string } | null;
  progress: { done: number; total: number };
};

type Props = {
  row: SequenceProgressRow;
  onAdvanced: () => void;
};

export function NextLessonCard({ row, onAdvanced }: Props) {
  const [logging, setLogging] = useState(false);
  const pct = row.progress.total === 0 ? 0 : (row.progress.done / row.progress.total) * 100;

  async function logComplete() {
    if (!row.current) return;
    setLogging(true);
    const res = await fetch('/api/sequence-progress', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        assignmentId: row.assignmentId,
        durationMin: row.current.estimatedMinutes ?? null,
      }),
    });
    setLogging(false);
    if (res.ok) onAdvanced();
  }

  return (
    <div className="bg-paper border border-rule rounded-lg p-4">
      <div className="text-[10px] uppercase tracking-wider text-ink-muted font-semibold mb-1">
        {row.sequenceName}
      </div>

      {row.current ? (
        <>
          <div className="text-sm font-semibold leading-tight">
            {row.current.unit} · {row.current.lessonRef}
          </div>
          <div className="text-xs text-ink-soft mt-0.5 line-clamp-2">{row.current.topic}</div>
          {row.current.estimatedMinutes != null && (
            <div className="text-[10px] text-ink-muted mt-1">≈ {row.current.estimatedMinutes} min</div>
          )}

          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-ink-muted mb-0.5">
              <span>
                {row.progress.done}/{row.progress.total} complete
              </span>
              <span>{Math.round(pct)}%</span>
            </div>
            <div className="h-1 bg-cream rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={logComplete}
              disabled={logging}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-accent text-cream rounded disabled:opacity-50"
            >
              <Check size={12} /> {logging ? 'Logging…' : 'Log complete'}
            </button>
            {row.next && (
              <div
                className="text-[10px] text-ink-muted inline-flex items-center gap-0.5"
                title={`Next: ${row.next.unit} · ${row.next.lessonRef}`}
              >
                <ChevronRight size={10} />
                {row.next.lessonRef}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-sm text-forest py-2 flex items-center gap-2">
          <Check size={16} /> Sequence complete 🎉
        </div>
      )}
    </div>
  );
}
