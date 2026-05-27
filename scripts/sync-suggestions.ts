#!/usr/bin/env tsx
/**
 * Sync PROPOSED suggestions to GitHub issues via `gh` CLI.
 *
 * Usage:
 *   npx tsx scripts/sync-suggestions.ts [--dry-run]
 *
 * Requires `gh` CLI installed and authenticated against the planner repo.
 * Reads PROPOSED rows, creates one issue per row, writes issue URL back,
 * and flips status to TRIAGED. Already-synced rows (ghIssueUrl != null) are
 * skipped — safe to re-run.
 */
import { PrismaClient, SuggestionStatus } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();
const dryRun = process.argv.includes('--dry-run');

function shellEscape(s: string): string {
  return `'${s.replace(/'/g, `'\\''`)}'`;
}

async function main() {
  const proposed = await prisma.suggestion.findMany({
    where: { status: SuggestionStatus.PROPOSED, ghIssueUrl: null },
    include: { author: { select: { email: true, name: true } } },
    orderBy: { createdAt: 'asc' },
  });
  console.log(`Found ${proposed.length} unsynced PROPOSED suggestions.`);
  if (proposed.length === 0) return;

  for (const s of proposed) {
    const title = `[suggestion] ${s.title}`;
    const body = [
      s.body,
      '',
      '---',
      `**From:** ${s.author.name ?? s.author.email}`,
      `**Category:** ${s.category ?? '(none)'}`,
      `**Created:** ${s.createdAt.toISOString()}`,
      `**Suggestion ID:** ${s.id}`,
      `**Upvotes at sync:** ${s.upvotes}`,
    ].join('\n');

    if (dryRun) {
      console.log(`\n[DRY] Would create issue:\n  title: ${title}\n  body length: ${body.length}`);
      continue;
    }

    const cmd = `gh issue create --title ${shellEscape(title)} --body ${shellEscape(body)} --label from-planner-app`;
    let url: string;
    try {
      url = execSync(cmd, { encoding: 'utf-8' }).trim();
    } catch (err) {
      console.error(`Failed to create issue for ${s.id}:`, err);
      continue;
    }
    console.log(`Created ${url} for "${s.title}"`);

    await prisma.suggestion.update({
      where: { id: s.id },
      data: { ghIssueUrl: url, status: SuggestionStatus.TRIAGED },
    });
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
