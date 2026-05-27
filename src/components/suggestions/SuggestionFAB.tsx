'use client';
import { useEffect, useState } from 'react';
import { Lightbulb, X, Check } from 'lucide-react';

const CATEGORIES = ['', 'library', 'ui', 'tracking', 'bug', 'other'];

export function SuggestionFAB() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

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
      setSuccess(true);
      setTimeout(() => { setSuccess(false); setOpen(false); }, 1200);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Suggest a feature or change"
        title="Suggest a feature or change"
        className="no-print fixed bottom-5 right-5 z-30 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full shadow-lg bg-accent text-cream hover:opacity-90 transition text-sm font-semibold"
      >
        <Lightbulb size={16} /> Suggest
      </button>

      {open && (
        <div
          className="no-print fixed inset-0 z-40 bg-black/30 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-cream w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 shadow-xl"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Lightbulb size={18} className="text-accent" />
                <h2 className="font-display text-lg font-semibold">New suggestion</h2>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 text-ink-muted hover:text-ink" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            {success ? (
              <div className="flex items-center gap-2 py-6 text-sm text-forest">
                <Check size={18} /> Saved. Find it on the Suggestions tab.
              </div>
            ) : (
              <form onSubmit={submit}>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Short title (required)"
                  autoFocus
                  className="w-full px-2 py-1.5 text-sm border border-rule rounded bg-paper mb-2"
                  maxLength={200}
                />
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="What do you want? Why? (markdown OK) (required)"
                  className="w-full px-2 py-1.5 text-sm border border-rule rounded bg-paper mb-2 h-28 font-body"
                />
                <div className="flex items-center justify-between gap-2">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="text-sm border border-rule rounded px-2 py-1.5 bg-paper"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c || 'category...'}</option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={submitting || !title.trim() || !body.trim()}
                    className="px-3 py-1.5 text-sm bg-accent text-cream rounded disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Add'}
                  </button>
                </div>
                <div className="mt-2 text-[10px] text-ink-muted">
                  Press <kbd className="px-1 py-0.5 bg-paper border border-rule rounded text-[10px]">Esc</kbd> to dismiss.
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
