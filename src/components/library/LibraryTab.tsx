'use client';
import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { ResourceCard } from './ResourceCard';
import { ResourceDetailDrawer } from './ResourceDetailDrawer';
import type { ResourceSummary, ResourceFull } from '@/lib/types/library';

const SUBJECTS = ['', 'SCIENCE', 'HISTORY', 'MATH', 'ENGLISH', 'ART', 'MUSIC', 'PE', 'OTHER'];
const FRAMEWORKS = ['', 'Mystery Science', 'OHC', 'SOTW Vol 1', 'BYL Level 0'];
const SEASONS = ['', 'summer', 'fall', 'spring', 'any'];

export function LibraryTab({ termIds }: { termIds: string[] }) {
  const [subject, setSubject] = useState('');
  const [framework, setFramework] = useState('');
  const [season, setSeason] = useState('');
  const [term, setTerm] = useState('');
  const [q, setQ] = useState('');
  const [resources, setResources] = useState<ResourceSummary[]>([]);
  const [detail, setDetail] = useState<ResourceFull | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (subject) params.set('subject', subject);
    if (framework) params.set('framework', framework);
    if (season) params.set('season', season);
    if (term) params.set('term', term);
    if (q) params.set('q', q);
    const t = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(`/api/library?${params.toString()}`);
      const j = await res.json();
      setResources(j.resources ?? []);
      setLoading(false);
    }, 200);
    return () => clearTimeout(t);
  }, [subject, framework, season, term, q]);

  async function openDetail(id: string) {
    const res = await fetch(`/api/library/${id}`);
    if (!res.ok) {
      // Resource may have been soft-deleted between list and detail fetch.
      // Silently drop the click rather than show a half-empty drawer.
      return;
    }
    const j = await res.json();
    if (j?.resource) setDetail(j.resource as ResourceFull);
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="font-display text-2xl font-semibold">Library</h1>
        <p className="text-sm text-ink-muted">Curated experiments, books, videos, and field trips for the family content block.</p>
      </div>

      <div className="bg-paper border border-rule rounded-lg p-3 mb-4 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title or description..."
            className="w-full pl-7 pr-2 py-1.5 text-sm border border-rule rounded bg-cream" />
        </div>
        <select value={subject} onChange={(e) => setSubject(e.target.value)} className="text-sm border border-rule rounded px-2 py-1.5 bg-cream">
          {SUBJECTS.map((s) => <option key={s} value={s}>{s || 'All subjects'}</option>)}
        </select>
        <select value={framework} onChange={(e) => setFramework(e.target.value)} className="text-sm border border-rule rounded px-2 py-1.5 bg-cream">
          {FRAMEWORKS.map((f) => <option key={f} value={f}>{f || 'All frameworks'}</option>)}
        </select>
        <select value={season} onChange={(e) => setSeason(e.target.value)} className="text-sm border border-rule rounded px-2 py-1.5 bg-cream">
          {SEASONS.map((s) => <option key={s} value={s}>{s || 'All seasons'}</option>)}
        </select>
        <select value={term} onChange={(e) => setTerm(e.target.value)} className="text-sm border border-rule rounded px-2 py-1.5 bg-cream">
          <option value="">All terms</option>
          {termIds.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="text-xs text-ink-muted mb-2">{loading ? 'Loading...' : `${resources.length} resources`}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {resources.map((r) => <ResourceCard key={r.id} resource={r} onClick={() => openDetail(r.id)} />)}
      </div>

      <ResourceDetailDrawer resource={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
