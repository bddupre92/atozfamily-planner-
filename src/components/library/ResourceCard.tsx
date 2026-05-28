'use client';
import { BookOpen, Video, Compass, Wrench, MapPin, FileText, Sparkles, type LucideIcon } from 'lucide-react';
import type { ResourceSummary } from '@/lib/types/library';

const TYPE_ICON: Record<string, LucideIcon> = {
  EXPERIMENT: Sparkles, BOOK: BookOpen, ARTICLE: FileText, VIDEO: Video,
  PROJECT: Wrench, WORKSHEET: FileText, FIELD_TRIP: MapPin, OTHER: Compass,
};

export function ResourceCard({ resource, onClick }: { resource: ResourceSummary; onClick: () => void }) {
  const Icon: LucideIcon = TYPE_ICON[resource.type] ?? Compass;
  return (
    <button onClick={onClick}
      className="text-left bg-paper border border-rule rounded-lg p-4 hover:border-accent transition w-full">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-accent"><Icon size={18} /></div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm leading-tight">{resource.title}</div>
          <div className="text-xs text-ink-muted mt-0.5 line-clamp-2">{resource.description}</div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {resource.framework && <span className="text-[10px] px-1.5 py-0.5 rounded bg-cream border border-rule text-ink-soft">{resource.framework}</span>}
            {resource.ageRange && <span className="text-[10px] px-1.5 py-0.5 rounded bg-cream border border-rule text-ink-soft">ages {resource.ageRange}</span>}
            {resource.season && resource.season !== 'any' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-cream border border-rule text-ink-soft">{resource.season}</span>}
            {resource.fieldTripLocation && <span className="text-[10px] px-1.5 py-0.5 rounded bg-cream border border-rule text-ink-soft inline-flex items-center gap-0.5"><MapPin size={9} /> trip</span>}
          </div>
        </div>
      </div>
    </button>
  );
}

