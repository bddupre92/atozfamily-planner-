import { PrismaClient } from '@prisma/client';

// Initial sequence assignments. Each kid gets pointed at the first entry of
// their current sequence — parents can override via the Progress tab.
//
// Eldest (age 7, 2nd grade): LOE Foundations C, Singapore Math 2A
// Middle  (age 4-5, Pre-K/K): LOE Foundations A, Singapore Math KA
// Youngest (age 2, Tot): no formal sequences — plays alongside

const ASSIGNMENTS: Array<{ childId: string; sequenceId: string }> = [
  { childId: 'child-eldest', sequenceId: 'loe-foundations-c' },
  { childId: 'child-eldest', sequenceId: 'dim-math-2a' },
  { childId: 'child-middle', sequenceId: 'loe-foundations-a' },
  { childId: 'child-middle', sequenceId: 'dim-math-ka' },
];

export async function seedSequenceAssignments(prisma: PrismaClient) {
  let added = 0;
  let skipped = 0;
  for (const a of ASSIGNMENTS) {
    const child = await prisma.child.findUnique({ where: { id: a.childId } });
    const seq = await prisma.curriculumSequence.findUnique({ where: { id: a.sequenceId } });
    if (!child || !seq) {
      skipped++;
      continue;
    }
    // Existing assignment? Don't disturb its currentEntryId — parents may
    // have advanced it past the first entry already.
    const existing = await prisma.sequenceAssignment.findUnique({
      where: { childId_sequenceId: { childId: a.childId, sequenceId: a.sequenceId } },
    });
    if (existing) {
      skipped++;
      continue;
    }
    const first = await prisma.sequenceEntry.findFirst({
      where: { sequenceId: a.sequenceId },
      orderBy: { orderIndex: 'asc' },
    });
    await prisma.sequenceAssignment.create({
      data: {
        childId: a.childId,
        sequenceId: a.sequenceId,
        currentEntryId: first?.id ?? null,
      },
    });
    added++;
  }
  console.log(`  • Sequence assignments: ${added} added, ${skipped} skipped (existing)`);
}
