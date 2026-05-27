'use client';
import { X, ExternalLink, MapPin, BookOpen } from 'lucide-react';
import type { Resource } from './ResourceCard';

type ResourceFull = Resource & {
  url: string | null;
  sourceUrl: string | null;
  videoUrl: string | null;
  activities: { tier7?: any; tier4?: any } | null;
  notes: string | null;
  tags: string[];
};

export function ResourceDetailDrawer({ resource, onClose }: { resource: ResourceFull | null; onClose: () => void }) {
  if (!resource) return null;
  const tier7 = resource.activities?.tier7;
  const tier4 = resource.activities?.tier4;

  return (
    <div className="fixed inset-0 z-40 bg-black/30 flex justify-end" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        className="bg-cream w-full max-w-lg h-full overflow-y-auto p-6 shadow-xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-xs text-ink-muted uppercase tracking-wider">{resource.framework} · {resource.subject}</div>
            <h2 className="font-display text-xl font-semibold leading-tight mt-1">{resource.title}</h2>
          </div>
          <button onClick={onClose} className="p-1 text-ink-muted hover:text-ink"><X size={18} /></button>
        </div>

        {resource.description && <p className="text-sm text-ink-soft mb-4">{resource.description}</p>}

        {tier7 && (
          <section className="mb-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">Tier 7 (Eldest)</div>
            <div className="bg-paper border border-rule rounded p-3 text-sm">
              <div>{tier7.instructions}</div>
              {tier7.materials?.length > 0 && <div className="text-xs text-ink-muted mt-2">Materials: {tier7.materials.join(', ')}</div>}
              {tier7.minutes && <div className="text-xs text-ink-muted mt-1">≈ {tier7.minutes} min</div>}
            </div>
          </section>
        )}

        {tier4 && (
          <section className="mb-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">Tier 4 (Middle)</div>
            <div className="bg-paper border border-rule rounded p-3 text-sm">
              <div>{tier4.instructions}</div>
              {tier4.materials?.length > 0 && <div className="text-xs text-ink-muted mt-2">Materials: {tier4.materials.join(', ')}</div>}
              {tier4.minutes && <div className="text-xs text-ink-muted mt-1">≈ {tier4.minutes} min</div>}
            </div>
          </section>
        )}

        {resource.bookList?.length > 0 && (
          <section className="mb-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">Books</div>
            <ul className="text-sm space-y-1">
              {resource.bookList.map((b, i) => (
                <li key={i} className="flex items-start gap-2"><BookOpen size={12} className="mt-1 flex-shrink-0 text-ink-muted" />{b}</li>
              ))}
            </ul>
          </section>
        )}

        {resource.fieldTripLocation && (
          <section className="mb-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">Field trip</div>
            <div className="text-sm flex items-center gap-2"><MapPin size={14} className="text-ink-muted" />{resource.fieldTripLocation}</div>
          </section>
        )}

        {(resource.sourceUrl || resource.videoUrl) && (
          <section className="mb-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">Source</div>
            {resource.sourceUrl && (
              <a href={resource.sourceUrl} target="_blank" rel="noreferrer"
                 className="text-sm text-accent flex items-center gap-1 hover:underline">
                <ExternalLink size={12} /> {resource.sourceUrl}
              </a>
            )}
            {resource.videoUrl && resource.videoUrl !== resource.sourceUrl && (
              <a href={resource.videoUrl} target="_blank" rel="noreferrer"
                 className="text-sm text-accent flex items-center gap-1 hover:underline mt-1">
                <ExternalLink size={12} /> Video: {resource.videoUrl}
              </a>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
