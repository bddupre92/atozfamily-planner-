import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─────────────────────────────────────────────────────────────────────────
  // CHILDREN — edit these to match your family
  // ─────────────────────────────────────────────────────────────────────────
  const children = [
    {
      id: 'child-eldest',
      name: 'Eldest',
      age: '7',
      grade: '2nd',
      colorKey: 'terracotta',
      sortOrder: 0,
    },
    {
      id: 'child-middle',
      name: 'Middle',
      age: '4-5',
      grade: 'Pre-K / K',
      colorKey: 'sage',
      sortOrder: 1,
    },
    {
      id: 'child-youngest',
      name: 'Youngest',
      age: '2',
      grade: 'Tot',
      colorKey: 'lavender',
      sortOrder: 2,
    },
  ];

  for (const child of children) {
    await prisma.child.upsert({
      where: { id: child.id },
      update: child,
      create: child,
    });
  }
  console.log(`  ✓ ${children.length} children seeded`);

  // ─────────────────────────────────────────────────────────────────────────
  // TERMS — year-round operation from June 2026
  // ─────────────────────────────────────────────────────────────────────────
  const terms = [
    {
      id: 'summer-2026',
      name: 'Summer Term',
      season: 'summer',
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-08-14'),
      weeks: 10,
      theme: 'Establish rhythm. Transition from TGTB. Build LOE foundation.',
    },
    {
      id: 'fall-2026',
      name: 'Fall Semester',
      season: 'fall',
      startDate: new Date('2026-08-24'),
      endDate: new Date('2026-12-18'),
      weeks: 17,
      theme: 'Full instruction load. Build endurance. Watch for transitions.',
    },
    {
      id: 'spring-2027',
      name: 'Spring Semester',
      season: 'spring',
      startDate: new Date('2027-01-05'),
      endDate: new Date('2027-05-28'),
      weeks: 21,
      theme: 'Consolidation and acceleration. Essentials placement decision.',
    },
    {
      id: 'summer-2027',
      name: 'Summer 2027',
      season: 'summer',
      startDate: new Date('2027-06-01'),
      endDate: new Date('2027-08-13'),
      weeks: 10,
      theme: 'Essentials launch window for Eldest. Foundations cycle continues.',
    },
  ];

  for (const term of terms) {
    await prisma.term.upsert({
      where: { id: term.id },
      update: term,
      create: term,
    });
  }
  console.log(`  ✓ ${terms.length} terms seeded`);

  // ─────────────────────────────────────────────────────────────────────────
  // PLANNER STATE — initial UI state (weekly schedule template, etc.)
  // Editable from within the app.
  // ─────────────────────────────────────────────────────────────────────────
  const initialState = {
    weekState: { weekOf: '2026-06-01', prep: {}, daily: {} },
    selectedTermId: 'summer-2026',
  };

  await prisma.plannerState.upsert({
    where: { id: 'default' },
    update: {},
    create: { id: 'default', state: initialState },
  });
  console.log('  ✓ Initial planner state seeded');

  console.log('✅ Seeding complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
