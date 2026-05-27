'use client';
import { ChevronUp, ExternalLink, GitPullRequest, GitBranch } from 'lucide-react';

type Suggestion = {
  id: string; title: string; body: string; category: string | null;
  status: string; upvotes: number; ghIssueUrl: string | null; ghPrUrl: string | null;
  createdAt: string; author: { email: string; name: string | null };
};

export function SuggestionRow({ suggestion, onUpvote }: { suggestion: Suggestion; onUpvote: () => void }) {
  return (
    <div className="bg-paper border border-rule rounded p-3 flex gap-3">
      <button onClick={onUpvote}
        className="flex flex-col items-center gap-0.5 px-2 py-1 border border-rule rounded hover:border-accent">
        <ChevronUp size={14} /><span className="text-xs font-mono">{suggestion.upvotes}</span>
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="font-semibold text-sm">{suggestion.title}</div>
          {suggestion.category && <span className="text-[10px] px-1.5 py-0.5 rounded bg-cream border border-rule text-ink-soft flex-shrink-0">{suggestion.category}</span>}
        </div>
        <div className="text-xs text-ink-soft mt-1 whitespace-pre-wrap line-clamp-4">{suggestion.body}</div>
        <div className="flex items-center gap-3 mt-2 text-[10px] text-ink-muted">
          <span>{suggestion.author.name ?? suggestion.author.email}</span>
          <span>·</span>
          <span>{new Date(suggestion.createdAt).toLocaleDateString()}</span>
          {suggestion.ghIssueUrl && (
            <a href={suggestion.ghIssueUrl} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-0.5 text-accent hover:underline">
              <GitBranch size={9} /> issue <ExternalLink size={9} />
            </a>
          )}
          {suggestion.ghPrUrl && (
            <a href={suggestion.ghPrUrl} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-0.5 text-accent hover:underline">
              <GitPullRequest size={9} /> PR <ExternalLink size={9} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export type { Suggestion };
