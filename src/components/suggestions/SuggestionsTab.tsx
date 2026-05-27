'use client';
import { useEffect, useState } from 'react';
import { SuggestionForm } from './SuggestionForm';
import { SuggestionRow, type Suggestion } from './SuggestionRow';

const STATUS_ORDER = ['PROPOSED', 'TRIAGED', 'IN_PROGRESS', 'DONE', 'WONT_DO'];
const STATUS_LABEL: Record<string, string> = {
  PROPOSED: 'Proposed', TRIAGED: 'Triaged', IN_PROGRESS: 'In progress', DONE: 'Done', WONT_DO: "Won't do",
};

export function SuggestionsTab() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  async function load() {
    const res = await fetch('/api/suggestions');
    const j = await res.json();
    setSuggestions(j.suggestions ?? []);
  }
  useEffect(() => { load(); }, []);

  async function upvote(id: string) {
    await fetch(`/api/suggestions/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ upvote: true }),
    });
    load();
  }

  const grouped: Record<string, Suggestion[]> = {};
  for (const s of suggestions) {
    (grouped[s.status] ??= []).push(s);
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="font-display text-2xl font-semibold">Suggestions</h1>
        <p className="text-sm text-ink-muted">Capture wishes here. Sync to GitHub via <code className="text-xs">npx tsx scripts/sync-suggestions.ts</code>.</p>
      </div>
      <SuggestionForm onCreated={load} />
      {STATUS_ORDER.map((status) => {
        const items = grouped[status] ?? [];
        if (items.length === 0) return null;
        return (
          <section key={status} className="mb-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
              {STATUS_LABEL[status]} ({items.length})
            </div>
            <div className="space-y-2">
              {items.map((s) => <SuggestionRow key={s.id} suggestion={s} onUpvote={() => upvote(s.id)} />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}
