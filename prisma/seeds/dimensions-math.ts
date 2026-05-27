import { PrismaClient, Subject } from '@prisma/client';

type EntryInput = {
  unit: string;
  lessonRef: string;
  topic: string;
  estimatedMinutes?: number;
  isReview?: boolean;
};

type SequenceInput = {
  id: string;
  name: string;
  publisher: string;
  ageRangeMin: number;
  ageRangeMax: number;
  sourceUrl: string;
  entries: EntryInput[];
};

async function upsertSequence(prisma: PrismaClient, seq: SequenceInput) {
  await prisma.curriculumSequence.upsert({
    where: { id: seq.id },
    update: {
      name: seq.name,
      publisher: seq.publisher,
      ageRangeMin: seq.ageRangeMin,
      ageRangeMax: seq.ageRangeMax,
      sourceUrl: seq.sourceUrl,
      subject: Subject.MATH,
    },
    create: {
      id: seq.id,
      name: seq.name,
      publisher: seq.publisher,
      subject: Subject.MATH,
      ageRangeMin: seq.ageRangeMin,
      ageRangeMax: seq.ageRangeMax,
      sourceUrl: seq.sourceUrl,
    },
  });

  for (let i = 0; i < seq.entries.length; i++) {
    const e = seq.entries[i];
    await prisma.sequenceEntry.upsert({
      where: { sequenceId_orderIndex: { sequenceId: seq.id, orderIndex: i + 1 } },
      update: {
        unit: e.unit, lessonRef: e.lessonRef, topic: e.topic,
        estimatedMinutes: e.estimatedMinutes ?? null, isReview: e.isReview ?? false,
      },
      create: {
        sequenceId: seq.id, orderIndex: i + 1,
        unit: e.unit, lessonRef: e.lessonRef, topic: e.topic,
        estimatedMinutes: e.estimatedMinutes ?? null, isReview: e.isReview ?? false,
      },
    });
  }
  console.log(`  • ${seq.id}: ${seq.entries.length} entries`);
}

// ============================================================================
// KA — Kindergarten A (ages 4–5)
// ============================================================================
const DIM_MATH_KA: SequenceInput = {
  id: 'dim-math-ka',
  name: 'Singapore Dimensions Math KA',
  publisher: 'Singapore Math Inc.',
  ageRangeMin: 4,
  ageRangeMax: 5,
  sourceUrl: 'https://www.singaporemath.com/products/dimensions-math-textbook-ka',
  entries: [
    // Chapter 1: Match, Sort, and Classify (7 lessons)
    { unit: 'Chapter 1', lessonRef: '1.1', topic: 'Left and Right', estimatedMinutes: 20 },
    { unit: 'Chapter 1', lessonRef: '1.2', topic: 'Same and Similar', estimatedMinutes: 20 },
    { unit: 'Chapter 1', lessonRef: '1.3', topic: 'Look for One That is Different', estimatedMinutes: 20 },
    { unit: 'Chapter 1', lessonRef: '1.4', topic: 'How Does it Feel?', estimatedMinutes: 20 },
    { unit: 'Chapter 1', lessonRef: '1.5', topic: 'Match the Things That Go Together', estimatedMinutes: 20 },
    { unit: 'Chapter 1', lessonRef: '1.6', topic: 'Sort', estimatedMinutes: 20 },
    { unit: 'Chapter 1', lessonRef: '1.7', topic: 'Practice', estimatedMinutes: 20, isReview: true },

    // Chapter 2: Numbers to 5 (12 lessons)
    { unit: 'Chapter 2', lessonRef: '2.1', topic: 'Count to 5', estimatedMinutes: 20 },
    { unit: 'Chapter 2', lessonRef: '2.2', topic: 'Count Things up to 5', estimatedMinutes: 20 },
    { unit: 'Chapter 2', lessonRef: '2.3', topic: 'Recognize the Numbers 1 to 3', estimatedMinutes: 20 },
    { unit: 'Chapter 2', lessonRef: '2.4', topic: 'Recognize the Numbers 4 and 5', estimatedMinutes: 20 },
    { unit: 'Chapter 2', lessonRef: '2.5', topic: 'Count and Match', estimatedMinutes: 20 },
    { unit: 'Chapter 2', lessonRef: '2.6', topic: 'Write the Numbers 1 and 2', estimatedMinutes: 20 },
    { unit: 'Chapter 2', lessonRef: '2.7', topic: 'Write the Number 3', estimatedMinutes: 20 },
    { unit: 'Chapter 2', lessonRef: '2.8', topic: 'Write the Number 4', estimatedMinutes: 20 },
    { unit: 'Chapter 2', lessonRef: '2.9', topic: 'Trace and Write 1 to 5', estimatedMinutes: 20 },
    { unit: 'Chapter 2', lessonRef: '2.10', topic: 'Zero', estimatedMinutes: 20 },
    { unit: 'Chapter 2', lessonRef: '2.11', topic: 'Picture Graphs', estimatedMinutes: 20 },
    { unit: 'Chapter 2', lessonRef: '2.12', topic: 'Practice', estimatedMinutes: 20, isReview: true },

    // Chapter 3: Numbers to 10 (13 lessons)
    { unit: 'Chapter 3', lessonRef: '3.1', topic: 'Count 1 to 10', estimatedMinutes: 20 },
    { unit: 'Chapter 3', lessonRef: '3.2', topic: 'Count Up to 7 Things', estimatedMinutes: 20 },
    { unit: 'Chapter 3', lessonRef: '3.3', topic: 'Count Up to 9 Things', estimatedMinutes: 20 },
    { unit: 'Chapter 3', lessonRef: '3.4', topic: 'Count Up to 10 Things — Part 1', estimatedMinutes: 20 },
    { unit: 'Chapter 3', lessonRef: '3.5', topic: 'Count Up to 10 Things — Part 2', estimatedMinutes: 20 },
    { unit: 'Chapter 3', lessonRef: '3.6', topic: 'Recognize the Numbers 6 to 10', estimatedMinutes: 20 },
    { unit: 'Chapter 3', lessonRef: '3.7', topic: 'Write the Numbers 6 and 7', estimatedMinutes: 20 },
    { unit: 'Chapter 3', lessonRef: '3.8', topic: 'Write the Numbers 8, 9, and 10', estimatedMinutes: 20 },
    { unit: 'Chapter 3', lessonRef: '3.9', topic: 'Write the Numbers 6 to 10', estimatedMinutes: 20 },
    { unit: 'Chapter 3', lessonRef: '3.10', topic: 'Count and Write the Numbers 1 to 10', estimatedMinutes: 20 },
    { unit: 'Chapter 3', lessonRef: '3.11', topic: 'Ordinal Positions', estimatedMinutes: 20 },
    { unit: 'Chapter 3', lessonRef: '3.12', topic: 'One More Than', estimatedMinutes: 20 },
    { unit: 'Chapter 3', lessonRef: '3.13', topic: 'Practice', estimatedMinutes: 20, isReview: true },

    // Chapter 4: Shapes and Solids (12 lessons)
    { unit: 'Chapter 4', lessonRef: '4.1', topic: 'Curved or Flat', estimatedMinutes: 20 },
    { unit: 'Chapter 4', lessonRef: '4.2', topic: 'Solid Shapes', estimatedMinutes: 20 },
    { unit: 'Chapter 4', lessonRef: '4.3', topic: 'Closed Shapes', estimatedMinutes: 20 },
    { unit: 'Chapter 4', lessonRef: '4.4', topic: 'Rectangles', estimatedMinutes: 20 },
    { unit: 'Chapter 4', lessonRef: '4.5', topic: 'Squares', estimatedMinutes: 20 },
    { unit: 'Chapter 4', lessonRef: '4.6', topic: 'Circles and Triangles', estimatedMinutes: 20 },
    { unit: 'Chapter 4', lessonRef: '4.7', topic: 'Where is It?', estimatedMinutes: 20 },
    { unit: 'Chapter 4', lessonRef: '4.8', topic: 'Hexagons', estimatedMinutes: 20 },
    { unit: 'Chapter 4', lessonRef: '4.9', topic: 'Sizes and Shapes', estimatedMinutes: 20 },
    { unit: 'Chapter 4', lessonRef: '4.10', topic: 'Combine Shapes', estimatedMinutes: 20 },
    { unit: 'Chapter 4', lessonRef: '4.11', topic: 'Graphs', estimatedMinutes: 20 },
    { unit: 'Chapter 4', lessonRef: '4.12', topic: 'Practice', estimatedMinutes: 20, isReview: true },

    // Chapter 5: Compare Height, Length, Weight, and Capacity (10 lessons)
    { unit: 'Chapter 5', lessonRef: '5.1', topic: 'Comparing Height', estimatedMinutes: 20 },
    { unit: 'Chapter 5', lessonRef: '5.2', topic: 'Comparing Length', estimatedMinutes: 20 },
    { unit: 'Chapter 5', lessonRef: '5.3', topic: 'Height and Length — Part 1', estimatedMinutes: 20 },
    { unit: 'Chapter 5', lessonRef: '5.4', topic: 'Height and Length — Part 2', estimatedMinutes: 20 },
    { unit: 'Chapter 5', lessonRef: '5.5', topic: 'Weight — Part 1', estimatedMinutes: 20 },
    { unit: 'Chapter 5', lessonRef: '5.6', topic: 'Weight — Part 2', estimatedMinutes: 20 },
    { unit: 'Chapter 5', lessonRef: '5.7', topic: 'Weight — Part 3', estimatedMinutes: 20 },
    { unit: 'Chapter 5', lessonRef: '5.8', topic: 'Capacity — Part 1', estimatedMinutes: 20 },
    { unit: 'Chapter 5', lessonRef: '5.9', topic: 'Capacity — Part 2', estimatedMinutes: 20 },
    { unit: 'Chapter 5', lessonRef: '5.10', topic: 'Practice', estimatedMinutes: 20, isReview: true },

    // Chapter 6: Comparing Numbers Within 10 (5 lessons)
    { unit: 'Chapter 6', lessonRef: '6.1', topic: 'Same and More', estimatedMinutes: 20 },
    { unit: 'Chapter 6', lessonRef: '6.2', topic: 'More and Fewer', estimatedMinutes: 20 },
    { unit: 'Chapter 6', lessonRef: '6.3', topic: 'More and Less', estimatedMinutes: 20 },
    { unit: 'Chapter 6', lessonRef: '6.4', topic: 'Practice — Part 1', estimatedMinutes: 20, isReview: true },
    { unit: 'Chapter 6', lessonRef: '6.5', topic: 'Practice — Part 2', estimatedMinutes: 20, isReview: true },
  ],
};

// ============================================================================
// KB — Kindergarten B (ages 4–5)
// ============================================================================
const DIM_MATH_KB: SequenceInput = {
  id: 'dim-math-kb',
  name: 'Singapore Dimensions Math KB',
  publisher: 'Singapore Math Inc.',
  ageRangeMin: 4,
  ageRangeMax: 5,
  sourceUrl: 'https://www.singaporemath.com/products/dimensions-math-textbook-kb',
  entries: [
    // Chapter 7: Numbers to 20 (11 lessons)
    { unit: 'Chapter 7', lessonRef: '7.1', topic: 'Ten and Some More', estimatedMinutes: 20 },
    { unit: 'Chapter 7', lessonRef: '7.2', topic: 'Count Ten and Some More', estimatedMinutes: 20 },
    { unit: 'Chapter 7', lessonRef: '7.3', topic: 'Two Ways to Count', estimatedMinutes: 20 },
    { unit: 'Chapter 7', lessonRef: '7.4', topic: 'Numbers 16 to 20', estimatedMinutes: 20 },
    { unit: 'Chapter 7', lessonRef: '7.5', topic: 'Number Words 0 to 10', estimatedMinutes: 20 },
    { unit: 'Chapter 7', lessonRef: '7.6', topic: 'Number Words 11 to 15', estimatedMinutes: 20 },
    { unit: 'Chapter 7', lessonRef: '7.7', topic: 'Number Words 16 to 20', estimatedMinutes: 20 },
    { unit: 'Chapter 7', lessonRef: '7.8', topic: 'Number Order', estimatedMinutes: 20 },
    { unit: 'Chapter 7', lessonRef: '7.9', topic: '1 More Than or Less Than', estimatedMinutes: 20 },
    { unit: 'Chapter 7', lessonRef: '7.10', topic: 'Practice — Part 1', estimatedMinutes: 20, isReview: true },
    { unit: 'Chapter 7', lessonRef: '7.11', topic: 'Practice — Part 2', estimatedMinutes: 20, isReview: true },

    // Chapter 8: Number Bonds (14 lessons)
    { unit: 'Chapter 8', lessonRef: '8.1', topic: 'Putting Numbers Together — Part 1', estimatedMinutes: 20 },
    { unit: 'Chapter 8', lessonRef: '8.2', topic: 'Putting Numbers Together — Part 2', estimatedMinutes: 20 },
    { unit: 'Chapter 8', lessonRef: '8.3', topic: 'Parts Making a Whole', estimatedMinutes: 20 },
    { unit: 'Chapter 8', lessonRef: '8.4', topic: 'Look for a Part', estimatedMinutes: 20 },
    { unit: 'Chapter 8', lessonRef: '8.5', topic: 'Number Bonds for 2, 3, and 4', estimatedMinutes: 20 },
    { unit: 'Chapter 8', lessonRef: '8.6', topic: 'Number Bonds for 5', estimatedMinutes: 20 },
    { unit: 'Chapter 8', lessonRef: '8.7', topic: 'Number Bonds for 6', estimatedMinutes: 20 },
    { unit: 'Chapter 8', lessonRef: '8.8', topic: 'Number Bonds for 7', estimatedMinutes: 20 },
    { unit: 'Chapter 8', lessonRef: '8.9', topic: 'Number Bonds for 8', estimatedMinutes: 20 },
    { unit: 'Chapter 8', lessonRef: '8.10', topic: 'Number Bonds for 9', estimatedMinutes: 20 },
    { unit: 'Chapter 8', lessonRef: '8.11', topic: 'Number Bonds for 10', estimatedMinutes: 20 },
    { unit: 'Chapter 8', lessonRef: '8.12', topic: 'Practice — Part 1', estimatedMinutes: 20, isReview: true },
    { unit: 'Chapter 8', lessonRef: '8.13', topic: 'Practice — Part 2', estimatedMinutes: 20, isReview: true },
    { unit: 'Chapter 8', lessonRef: '8.14', topic: 'Practice — Part 3', estimatedMinutes: 20, isReview: true },

    // Chapter 9: Addition (12 lessons)
    { unit: 'Chapter 9', lessonRef: '9.1', topic: 'Introduction to Addition — Part 1', estimatedMinutes: 20 },
    { unit: 'Chapter 9', lessonRef: '9.2', topic: 'Introduction to Addition — Part 2', estimatedMinutes: 20 },
    { unit: 'Chapter 9', lessonRef: '9.3', topic: 'Introduction to Addition — Part 3', estimatedMinutes: 20 },
    { unit: 'Chapter 9', lessonRef: '9.4', topic: 'Addition', estimatedMinutes: 20 },
    { unit: 'Chapter 9', lessonRef: '9.5', topic: 'Count On — Part 1', estimatedMinutes: 20 },
    { unit: 'Chapter 9', lessonRef: '9.6', topic: 'Count On — Part 2', estimatedMinutes: 20 },
    { unit: 'Chapter 9', lessonRef: '9.7', topic: 'Add Up to 3 and 4', estimatedMinutes: 20 },
    { unit: 'Chapter 9', lessonRef: '9.8', topic: 'Add Up to 5 and 6', estimatedMinutes: 20 },
    { unit: 'Chapter 9', lessonRef: '9.9', topic: 'Add Up to 7 and 8', estimatedMinutes: 20 },
    { unit: 'Chapter 9', lessonRef: '9.10', topic: 'Add Up to 9 and 10', estimatedMinutes: 20 },
    { unit: 'Chapter 9', lessonRef: '9.11', topic: 'Addition Practice', estimatedMinutes: 20 },
    { unit: 'Chapter 9', lessonRef: '9.12', topic: 'Practice', estimatedMinutes: 20, isReview: true },

    // Chapter 10: Subtraction (10 lessons)
    { unit: 'Chapter 10', lessonRef: '10.1', topic: 'Take Away to Subtract — Part 1', estimatedMinutes: 20 },
    { unit: 'Chapter 10', lessonRef: '10.2', topic: 'Take Away to Subtract — Part 2', estimatedMinutes: 20 },
    { unit: 'Chapter 10', lessonRef: '10.3', topic: 'Take Away to Subtract — Part 3', estimatedMinutes: 20 },
    { unit: 'Chapter 10', lessonRef: '10.4', topic: 'Take Apart to Subtract — Part 1', estimatedMinutes: 20 },
    { unit: 'Chapter 10', lessonRef: '10.5', topic: 'Take Apart to Subtract — Part 2', estimatedMinutes: 20 },
    { unit: 'Chapter 10', lessonRef: '10.6', topic: 'Count Back', estimatedMinutes: 20 },
    { unit: 'Chapter 10', lessonRef: '10.7', topic: 'Subtract Within 5', estimatedMinutes: 20 },
    { unit: 'Chapter 10', lessonRef: '10.8', topic: 'Subtract Within 10 — Part 1', estimatedMinutes: 20 },
    { unit: 'Chapter 10', lessonRef: '10.9', topic: 'Subtract Within 10 — Part 2', estimatedMinutes: 20 },
    { unit: 'Chapter 10', lessonRef: '10.10', topic: 'Practice', estimatedMinutes: 20, isReview: true },

    // Chapter 11: Addition and Subtraction (6 lessons)
    { unit: 'Chapter 11', lessonRef: '11.1', topic: 'Add and Subtract', estimatedMinutes: 20 },
    { unit: 'Chapter 11', lessonRef: '11.2', topic: 'Practice Addition and Subtraction', estimatedMinutes: 20 },
    { unit: 'Chapter 11', lessonRef: '11.3', topic: 'Part-Whole Addition and Subtraction', estimatedMinutes: 20 },
    { unit: 'Chapter 11', lessonRef: '11.4', topic: 'Add to or Take Away', estimatedMinutes: 20 },
    { unit: 'Chapter 11', lessonRef: '11.5', topic: 'Put Together or Take Apart', estimatedMinutes: 20 },
    { unit: 'Chapter 11', lessonRef: '11.6', topic: 'Practice', estimatedMinutes: 20, isReview: true },

    // Chapter 12: Numbers to 100 (11 lessons)
    { unit: 'Chapter 12', lessonRef: '12.1', topic: 'Count by Tens — Part 1', estimatedMinutes: 20 },
    { unit: 'Chapter 12', lessonRef: '12.2', topic: 'Count by Tens — Part 2', estimatedMinutes: 20 },
    { unit: 'Chapter 12', lessonRef: '12.3', topic: 'Numbers to 30', estimatedMinutes: 20 },
    { unit: 'Chapter 12', lessonRef: '12.4', topic: 'Numbers to 40', estimatedMinutes: 20 },
    { unit: 'Chapter 12', lessonRef: '12.5', topic: 'Numbers to 50', estimatedMinutes: 20 },
    { unit: 'Chapter 12', lessonRef: '12.6', topic: 'Numbers to 80', estimatedMinutes: 20 },
    { unit: 'Chapter 12', lessonRef: '12.7', topic: 'Numbers to 100 — Part 1', estimatedMinutes: 20 },
    { unit: 'Chapter 12', lessonRef: '12.8', topic: 'Numbers to 100 — Part 2', estimatedMinutes: 20 },
    { unit: 'Chapter 12', lessonRef: '12.9', topic: 'Count by Fives — Part 1', estimatedMinutes: 20 },
    { unit: 'Chapter 12', lessonRef: '12.10', topic: 'Count by Fives — Part 2', estimatedMinutes: 20 },
    { unit: 'Chapter 12', lessonRef: '12.11', topic: 'Practice', estimatedMinutes: 20, isReview: true },

    // Chapter 13: Time (5 lessons)
    { unit: 'Chapter 13', lessonRef: '13.1', topic: 'Day and Night', estimatedMinutes: 20 },
    { unit: 'Chapter 13', lessonRef: '13.2', topic: 'Learning About the Clock', estimatedMinutes: 20 },
    { unit: 'Chapter 13', lessonRef: '13.3', topic: 'Telling Time to the Hour — Part 1', estimatedMinutes: 20 },
    { unit: 'Chapter 13', lessonRef: '13.4', topic: 'Telling Time to the Hour — Part 2', estimatedMinutes: 20 },
    { unit: 'Chapter 13', lessonRef: '13.5', topic: 'Practice', estimatedMinutes: 20, isReview: true },

    // Chapter 14: Money (6 lessons)
    { unit: 'Chapter 14', lessonRef: '14.1', topic: 'Coins', estimatedMinutes: 20 },
    { unit: 'Chapter 14', lessonRef: '14.2', topic: 'Pennies', estimatedMinutes: 20 },
    { unit: 'Chapter 14', lessonRef: '14.3', topic: 'Nickels', estimatedMinutes: 20 },
    { unit: 'Chapter 14', lessonRef: '14.4', topic: 'Dimes', estimatedMinutes: 20 },
    { unit: 'Chapter 14', lessonRef: '14.5', topic: 'Quarters', estimatedMinutes: 20 },
    { unit: 'Chapter 14', lessonRef: '14.6', topic: 'Practice', estimatedMinutes: 20, isReview: true },
  ],
};

// ============================================================================
// 2A — Grade 2A (age 7)
// ============================================================================
const DIM_MATH_2A: SequenceInput = {
  id: 'dim-math-2a',
  name: 'Singapore Dimensions Math 2A',
  publisher: 'Singapore Math Inc.',
  ageRangeMin: 7,
  ageRangeMax: 7,
  sourceUrl: 'https://www.singaporemath.com/products/dimensions-math-textbook-2a',
  entries: [
    // Chapter 1: Numbers to 1,000 (8 lessons)
    { unit: 'Chapter 1', lessonRef: '1.1', topic: 'Tens and Ones', estimatedMinutes: 30 },
    { unit: 'Chapter 1', lessonRef: '1.2', topic: 'Counting by Tens or Ones', estimatedMinutes: 30 },
    { unit: 'Chapter 1', lessonRef: '1.3', topic: 'Comparing Tens and Ones', estimatedMinutes: 30 },
    { unit: 'Chapter 1', lessonRef: '1.4', topic: 'Hundreds, Tens, and Ones', estimatedMinutes: 30 },
    { unit: 'Chapter 1', lessonRef: '1.5', topic: 'Place Value', estimatedMinutes: 30 },
    { unit: 'Chapter 1', lessonRef: '1.6', topic: 'Comparing Hundreds, Tens, and Ones', estimatedMinutes: 30 },
    { unit: 'Chapter 1', lessonRef: '1.7', topic: 'Counting by Hundreds, Tens, or Ones', estimatedMinutes: 30 },
    { unit: 'Chapter 1', lessonRef: '1.8', topic: 'Practice', estimatedMinutes: 30, isReview: true },

    // Chapter 2: Addition and Subtraction — Part 1 (5 lessons)
    { unit: 'Chapter 2', lessonRef: '2.1', topic: 'Strategies for Addition', estimatedMinutes: 30 },
    { unit: 'Chapter 2', lessonRef: '2.2', topic: 'Strategies for Subtraction', estimatedMinutes: 30 },
    { unit: 'Chapter 2', lessonRef: '2.3', topic: 'Parts and Whole', estimatedMinutes: 30 },
    { unit: 'Chapter 2', lessonRef: '2.4', topic: 'Comparison', estimatedMinutes: 30 },
    { unit: 'Chapter 2', lessonRef: '2.5', topic: 'Practice', estimatedMinutes: 30, isReview: true },

    // Chapter 3: Addition and Subtraction — Part 2 (12 lessons)
    { unit: 'Chapter 3', lessonRef: '3.1', topic: 'Addition Without Regrouping', estimatedMinutes: 30 },
    { unit: 'Chapter 3', lessonRef: '3.2', topic: 'Subtraction Without Regrouping', estimatedMinutes: 30 },
    { unit: 'Chapter 3', lessonRef: '3.3', topic: 'Addition with Regrouping Ones', estimatedMinutes: 30 },
    { unit: 'Chapter 3', lessonRef: '3.4', topic: 'Addition with Regrouping Tens', estimatedMinutes: 30 },
    { unit: 'Chapter 3', lessonRef: '3.5', topic: 'Addition with Regrouping Tens and Ones', estimatedMinutes: 30 },
    { unit: 'Chapter 3', lessonRef: '3.6', topic: 'Practice A', estimatedMinutes: 30, isReview: true },
    { unit: 'Chapter 3', lessonRef: '3.7', topic: 'Subtraction with Regrouping from Tens', estimatedMinutes: 30 },
    { unit: 'Chapter 3', lessonRef: '3.8', topic: 'Subtraction with Regrouping from Hundreds', estimatedMinutes: 30 },
    { unit: 'Chapter 3', lessonRef: '3.9', topic: 'Subtraction with Regrouping from Two Places', estimatedMinutes: 30 },
    { unit: 'Chapter 3', lessonRef: '3.10', topic: 'Subtraction with Regrouping across Zeros', estimatedMinutes: 30 },
    { unit: 'Chapter 3', lessonRef: '3.11', topic: 'Practice B', estimatedMinutes: 30, isReview: true },
    { unit: 'Chapter 3', lessonRef: '3.12', topic: 'Practice C', estimatedMinutes: 30, isReview: true },

    // Chapter 4: Length (8 lessons)
    { unit: 'Chapter 4', lessonRef: '4.1', topic: 'Centimeters', estimatedMinutes: 30 },
    { unit: 'Chapter 4', lessonRef: '4.2', topic: 'Estimating Length in Centimeters', estimatedMinutes: 30 },
    { unit: 'Chapter 4', lessonRef: '4.3', topic: 'Meters', estimatedMinutes: 30 },
    { unit: 'Chapter 4', lessonRef: '4.4', topic: 'Estimating Length in Meters', estimatedMinutes: 30 },
    { unit: 'Chapter 4', lessonRef: '4.5', topic: 'Inches', estimatedMinutes: 30 },
    { unit: 'Chapter 4', lessonRef: '4.6', topic: 'Using Rulers', estimatedMinutes: 30 },
    { unit: 'Chapter 4', lessonRef: '4.7', topic: 'Feet', estimatedMinutes: 30 },
    { unit: 'Chapter 4', lessonRef: '4.8', topic: 'Practice', estimatedMinutes: 30, isReview: true },

    // Chapter 5: Weight (4 lessons + Review 1)
    { unit: 'Chapter 5', lessonRef: '5.1', topic: 'Grams', estimatedMinutes: 30 },
    { unit: 'Chapter 5', lessonRef: '5.2', topic: 'Kilograms', estimatedMinutes: 30 },
    { unit: 'Chapter 5', lessonRef: '5.3', topic: 'Pounds', estimatedMinutes: 30 },
    { unit: 'Chapter 5', lessonRef: '5.4', topic: 'Practice', estimatedMinutes: 30, isReview: true },
    { unit: 'Chapter 5', lessonRef: 'Review 1', topic: 'Review 1 — Chapters 1–5', estimatedMinutes: 30, isReview: true },

    // Chapter 6: Multiplication and Division (7 lessons)
    { unit: 'Chapter 6', lessonRef: '6.1', topic: 'Multiplication — Part 1', estimatedMinutes: 30 },
    { unit: 'Chapter 6', lessonRef: '6.2', topic: 'Multiplication — Part 2', estimatedMinutes: 30 },
    { unit: 'Chapter 6', lessonRef: '6.3', topic: 'Practice A', estimatedMinutes: 30, isReview: true },
    { unit: 'Chapter 6', lessonRef: '6.4', topic: 'Division — Part 1', estimatedMinutes: 30 },
    { unit: 'Chapter 6', lessonRef: '6.5', topic: 'Division — Part 2', estimatedMinutes: 30 },
    { unit: 'Chapter 6', lessonRef: '6.6', topic: 'Multiplication and Division', estimatedMinutes: 30 },
    { unit: 'Chapter 6', lessonRef: '6.7', topic: 'Practice B', estimatedMinutes: 30, isReview: true },

    // Chapter 7: Multiplication and Division of 2, 5, and 10 (11 lessons + Review 2)
    { unit: 'Chapter 7', lessonRef: '7.1', topic: 'The Multiplication Table of 5', estimatedMinutes: 30 },
    { unit: 'Chapter 7', lessonRef: '7.2', topic: 'Multiplication Facts of 5', estimatedMinutes: 30 },
    { unit: 'Chapter 7', lessonRef: '7.3', topic: 'Practice A', estimatedMinutes: 30, isReview: true },
    { unit: 'Chapter 7', lessonRef: '7.4', topic: 'The Multiplication Table of 2', estimatedMinutes: 30 },
    { unit: 'Chapter 7', lessonRef: '7.5', topic: 'Multiplication Facts of 2', estimatedMinutes: 30 },
    { unit: 'Chapter 7', lessonRef: '7.6', topic: 'Practice B', estimatedMinutes: 30, isReview: true },
    { unit: 'Chapter 7', lessonRef: '7.7', topic: 'The Multiplication Table of 10', estimatedMinutes: 30 },
    { unit: 'Chapter 7', lessonRef: '7.8', topic: 'Dividing by 2', estimatedMinutes: 30 },
    { unit: 'Chapter 7', lessonRef: '7.9', topic: 'Dividing by 5 and 10', estimatedMinutes: 30 },
    { unit: 'Chapter 7', lessonRef: '7.10', topic: 'Practice C', estimatedMinutes: 30, isReview: true },
    { unit: 'Chapter 7', lessonRef: '7.11', topic: 'Word Problems', estimatedMinutes: 30 },
    { unit: 'Chapter 7', lessonRef: 'Review 2', topic: 'Review 2 — Chapters 6–7', estimatedMinutes: 30, isReview: true },
  ],
};

// ============================================================================
// 2B — Grade 2B (age 7)
// ============================================================================
const DIM_MATH_2B: SequenceInput = {
  id: 'dim-math-2b',
  name: 'Singapore Dimensions Math 2B',
  publisher: 'Singapore Math Inc.',
  ageRangeMin: 7,
  ageRangeMax: 7,
  sourceUrl: 'https://www.singaporemath.com/products/dimensions-math-textbook-2b',
  entries: [
    // Chapter 8: Mental Calculation (10 lessons)
    { unit: 'Chapter 8', lessonRef: '8.1', topic: 'Adding Ones Mentally', estimatedMinutes: 30 },
    { unit: 'Chapter 8', lessonRef: '8.2', topic: 'Adding Tens Mentally', estimatedMinutes: 30 },
    { unit: 'Chapter 8', lessonRef: '8.3', topic: 'Making 100', estimatedMinutes: 30 },
    { unit: 'Chapter 8', lessonRef: '8.4', topic: 'Adding 97, 98, or 99', estimatedMinutes: 30 },
    { unit: 'Chapter 8', lessonRef: '8.5', topic: 'Practice A', estimatedMinutes: 30, isReview: true },
    { unit: 'Chapter 8', lessonRef: '8.6', topic: 'Subtracting Ones Mentally', estimatedMinutes: 30 },
    { unit: 'Chapter 8', lessonRef: '8.7', topic: 'Subtracting Tens Mentally', estimatedMinutes: 30 },
    { unit: 'Chapter 8', lessonRef: '8.8', topic: 'Subtracting 97, 98, or 99', estimatedMinutes: 30 },
    { unit: 'Chapter 8', lessonRef: '8.9', topic: 'Practice B', estimatedMinutes: 30, isReview: true },
    { unit: 'Chapter 8', lessonRef: '8.10', topic: 'Practice C', estimatedMinutes: 30, isReview: true },

    // Chapter 9: Multiplication and Division of 3 and 4 (9 lessons)
    { unit: 'Chapter 9', lessonRef: '9.1', topic: 'The Multiplication Table of 3', estimatedMinutes: 30 },
    { unit: 'Chapter 9', lessonRef: '9.2', topic: 'Multiplication Facts of 3', estimatedMinutes: 30 },
    { unit: 'Chapter 9', lessonRef: '9.3', topic: 'Dividing by 3', estimatedMinutes: 30 },
    { unit: 'Chapter 9', lessonRef: '9.4', topic: 'Practice A', estimatedMinutes: 30, isReview: true },
    { unit: 'Chapter 9', lessonRef: '9.5', topic: 'The Multiplication Table of 4', estimatedMinutes: 30 },
    { unit: 'Chapter 9', lessonRef: '9.6', topic: 'Multiplication Facts of 4', estimatedMinutes: 30 },
    { unit: 'Chapter 9', lessonRef: '9.7', topic: 'Dividing by 4', estimatedMinutes: 30 },
    { unit: 'Chapter 9', lessonRef: '9.8', topic: 'Practice B', estimatedMinutes: 30, isReview: true },
    { unit: 'Chapter 9', lessonRef: '9.9', topic: 'Practice C', estimatedMinutes: 30, isReview: true },

    // Chapter 10: Money (8 lessons)
    { unit: 'Chapter 10', lessonRef: '10.1', topic: 'Making $1', estimatedMinutes: 30 },
    { unit: 'Chapter 10', lessonRef: '10.2', topic: 'Dollars and Cents', estimatedMinutes: 30 },
    { unit: 'Chapter 10', lessonRef: '10.3', topic: 'Making Change', estimatedMinutes: 30 },
    { unit: 'Chapter 10', lessonRef: '10.4', topic: 'Comparing Money', estimatedMinutes: 30 },
    { unit: 'Chapter 10', lessonRef: '10.5', topic: 'Practice A', estimatedMinutes: 30, isReview: true },
    { unit: 'Chapter 10', lessonRef: '10.6', topic: 'Adding Money', estimatedMinutes: 30 },
    { unit: 'Chapter 10', lessonRef: '10.7', topic: 'Subtracting Money', estimatedMinutes: 30 },
    { unit: 'Chapter 10', lessonRef: '10.8', topic: 'Practice B', estimatedMinutes: 30, isReview: true },

    // Chapter 11: Fractions (6 lessons + Review 3)
    { unit: 'Chapter 11', lessonRef: '11.1', topic: 'Halves and Fourths', estimatedMinutes: 30 },
    { unit: 'Chapter 11', lessonRef: '11.2', topic: 'Writing Unit Fractions', estimatedMinutes: 30 },
    { unit: 'Chapter 11', lessonRef: '11.3', topic: 'Writing Fractions', estimatedMinutes: 30 },
    { unit: 'Chapter 11', lessonRef: '11.4', topic: 'Fractions that Make 1 Whole', estimatedMinutes: 30 },
    { unit: 'Chapter 11', lessonRef: '11.5', topic: 'Comparing and Ordering Fractions', estimatedMinutes: 30 },
    { unit: 'Chapter 11', lessonRef: '11.6', topic: 'Practice', estimatedMinutes: 30, isReview: true },
    { unit: 'Chapter 11', lessonRef: 'Review 3', topic: 'Review 3 — Chapters 8–11', estimatedMinutes: 30, isReview: true },

    // Chapter 12: Time (4 lessons)
    { unit: 'Chapter 12', lessonRef: '12.1', topic: 'Telling Time', estimatedMinutes: 30 },
    { unit: 'Chapter 12', lessonRef: '12.2', topic: 'Time Intervals', estimatedMinutes: 30 },
    { unit: 'Chapter 12', lessonRef: '12.3', topic: 'A.M. and P.M.', estimatedMinutes: 30 },
    { unit: 'Chapter 12', lessonRef: '12.4', topic: 'Practice', estimatedMinutes: 30, isReview: true },

    // Chapter 13: Capacity (3 lessons)
    { unit: 'Chapter 13', lessonRef: '13.1', topic: 'Comparing Capacity', estimatedMinutes: 30 },
    { unit: 'Chapter 13', lessonRef: '13.2', topic: 'Units of Capacity', estimatedMinutes: 30 },
    { unit: 'Chapter 13', lessonRef: '13.3', topic: 'Practice', estimatedMinutes: 30, isReview: true },

    // Chapter 14: Graphs (3 lessons)
    { unit: 'Chapter 14', lessonRef: '14.1', topic: 'Picture Graphs', estimatedMinutes: 30 },
    { unit: 'Chapter 14', lessonRef: '14.2', topic: 'Bar Graphs', estimatedMinutes: 30 },
    { unit: 'Chapter 14', lessonRef: '14.3', topic: 'Practice', estimatedMinutes: 30, isReview: true },

    // Chapter 15: Shapes (6 lessons + Review 4 + Review 5)
    { unit: 'Chapter 15', lessonRef: '15.1', topic: 'Straight and Curved Sides', estimatedMinutes: 30 },
    { unit: 'Chapter 15', lessonRef: '15.2', topic: 'Polygons', estimatedMinutes: 30 },
    { unit: 'Chapter 15', lessonRef: '15.3', topic: 'Semicircles and Quarter-circles', estimatedMinutes: 30 },
    { unit: 'Chapter 15', lessonRef: '15.4', topic: 'Patterns', estimatedMinutes: 30 },
    { unit: 'Chapter 15', lessonRef: '15.5', topic: 'Solid Shapes', estimatedMinutes: 30 },
    { unit: 'Chapter 15', lessonRef: '15.6', topic: 'Practice', estimatedMinutes: 30, isReview: true },
    { unit: 'Chapter 15', lessonRef: 'Review 4', topic: 'Review 4 — Chapters 12–15', estimatedMinutes: 30, isReview: true },
    { unit: 'Chapter 15', lessonRef: 'Review 5', topic: 'Review 5 — Cumulative Review', estimatedMinutes: 30, isReview: true },
  ],
};

export async function seedDimensionsMath(prisma: PrismaClient) {
  await upsertSequence(prisma, DIM_MATH_KA);
  await upsertSequence(prisma, DIM_MATH_KB);
  await upsertSequence(prisma, DIM_MATH_2A);
  await upsertSequence(prisma, DIM_MATH_2B);
}
