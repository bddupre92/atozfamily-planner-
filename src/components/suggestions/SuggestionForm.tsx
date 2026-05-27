'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';

const CATEGORIES = ['', 'library', 'ui', 'tracking', 'bug', 'other'];

export function SuggestionForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSubmitting(true);
    const res = await fetch('/api/suggestions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), body: body.trim(), category: category || null }),
    });
    setSubmitting(false);
    if (res.ok) {
      setTitle(''); setBody(''); setCategory('');
      onCreated();
    }
  }

  return (
    <form onSubmit={submit} className="bg-paper border border-rule rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Plus size={16} /> <span className="font-semibold text-sm">New suggestion</span>
      </div>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short title (required)"
        className="w-full px-2 py-1.5 text-sm border border-rule rounded bg-cream mb-2" maxLength={200} />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="What do you want? Why? (markdown OK) (required)"
        className="w-full px-2 py-1.5 text-sm border border-rule rounded bg-cream mb-2 h-24 font-body" />
      <div className="flex items-center gap-2">
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="text-sm border border-rule rounded px-2 py-1.5 bg-cream">
          {CATEGORIES.map((c) => <option key={c} value={c}>{c || 'category...'}</option>)}
        </select>
        <button type="submit" disabled={submitting || !title.trim() || !body.trim()}
          className="px-3 py-1.5 text-sm bg-accent text-cream rounded disabled:opacity-50">
          {submitting ? 'Saving...' : 'Add'}
        </button>
      </div>
    </form>
  );
}
