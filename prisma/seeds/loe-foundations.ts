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
      name: seq.name, publisher: seq.publisher, subject: Subject.ENGLISH,
      ageRangeMin: seq.ageRangeMin, ageRangeMax: seq.ageRangeMax, sourceUrl: seq.sourceUrl,
    },
    create: {
      id: seq.id, name: seq.name, publisher: seq.publisher, subject: Subject.ENGLISH,
      ageRangeMin: seq.ageRangeMin, ageRangeMax: seq.ageRangeMax, sourceUrl: seq.sourceUrl,
    },
  });
  for (let i = 0; i < seq.entries.length; i++) {
    const e = seq.entries[i];
    await prisma.sequenceEntry.upsert({
      where: { sequenceId_orderIndex: { sequenceId: seq.id, orderIndex: i + 1 } },
      update: { unit: e.unit, lessonRef: e.lessonRef, topic: e.topic, estimatedMinutes: e.estimatedMinutes ?? null, isReview: e.isReview ?? false },
      create: { sequenceId: seq.id, orderIndex: i + 1, unit: e.unit, lessonRef: e.lessonRef, topic: e.topic, estimatedMinutes: e.estimatedMinutes ?? null, isReview: e.isReview ?? false },
    });
  }
  console.log(`  • ${seq.id}: ${seq.entries.length} entries`);
}

// ============================================================================
// FOUNDATIONS A — ages 4–5, lessons 1–40 + 8 reviews = 48 entries
// Source: Logic of English Foundations A–D Scope & Sequence PDF
// ============================================================================
const LOE_A: SequenceInput = {
  id: 'loe-foundations-a',
  name: 'Logic of English Foundations A',
  publisher: 'Logic of English',
  ageRangeMin: 4,
  ageRangeMax: 5,
  sourceUrl: 'https://loe-assets.logicofenglish.com/downloads/foundations-a-b-c-d-ss.pdf',
  entries: [
    // Unit 1 — Lessons 1–5 + Review
    { unit: 'Unit 1', lessonRef: 'Lesson 1', topic: 'Phonemic awareness: voiced vs. unvoiced sounds; blending compound words; handwriting baseline, top line, midline, swing stroke', estimatedMinutes: 25 },
    { unit: 'Unit 1', lessonRef: 'Lesson 2', topic: 'Phonemic awareness: voiced/unvoiced sounds; nasal sounds; blending compound words; handwriting down stroke', estimatedMinutes: 25 },
    { unit: 'Unit 1', lessonRef: 'Lesson 3', topic: 'Phonemic awareness: voiced/unvoiced and nasal sounds; distinguishing consonant sounds; blending CVC and consonant-blend words; handwriting roll stroke', estimatedMinutes: 25 },
    { unit: 'Unit 1', lessonRef: 'Lesson 4', topic: 'Distinguishing consonant sounds; voiced/unvoiced; blending CVC and consonant-blend words; handwriting curve/straight stroke', estimatedMinutes: 25 },
    { unit: 'Unit 1', lessonRef: 'Lesson 5', topic: 'Phonogram A: all sounds of single-letter phonogram a; blending CVC and consonant-blend words; handwriting lowercase a', estimatedMinutes: 25 },
    { unit: 'Unit 1', lessonRef: 'Assessment 1', topic: 'Review of Lessons 1–5: phonemic awareness, phonogram a, handwriting strokes', estimatedMinutes: 25, isReview: true },

    // Unit 2 — Lessons 6–10 + Review
    { unit: 'Unit 2', lessonRef: 'Lesson 6', topic: 'Phonogram D: single-letter phonogram d; blending CVC and consonant-blend words; handwriting lowercase d', estimatedMinutes: 25 },
    { unit: 'Unit 2', lessonRef: 'Lesson 7', topic: 'Review single-letter phonograms; identifying initial sounds; blending CVC and consonant-blend words; handwriting drop-swoop stroke', estimatedMinutes: 25 },
    { unit: 'Unit 2', lessonRef: 'Lesson 8', topic: 'Phonogram G: single-letter phonogram g; blending CVC and two-syllable words; matching bookface to handwritten forms; handwriting lowercase g', estimatedMinutes: 25 },
    { unit: 'Unit 2', lessonRef: 'Lesson 9', topic: 'Phonogram C: single-letter phonogram c; blending CVC and two-syllable words; matching bookface to handwritten forms; handwriting lowercase c', estimatedMinutes: 25 },
    { unit: 'Unit 2', lessonRef: 'Lesson 10', topic: 'Phonogram O: single-letter phonogram o; blending and segmenting one-syllable words; matching bookface to handwritten forms; handwriting lowercase o', estimatedMinutes: 25 },
    { unit: 'Unit 2', lessonRef: 'Assessment 2', topic: 'Review of Lessons 6–10: phonograms a, d, g, c, o; handwriting', estimatedMinutes: 25, isReview: true },

    // Unit 3 — Lessons 11–15 + Review
    { unit: 'Unit 3', lessonRef: 'Lesson 11', topic: 'Review single-letter phonograms; identifying initial sounds; blending CVC words; handwriting practice', estimatedMinutes: 25 },
    { unit: 'Unit 3', lessonRef: 'Lesson 12', topic: 'Phonogram QU: multi-letter phonogram qu; segmenting one-syllable words; handwriting lowercase qu', estimatedMinutes: 25 },
    { unit: 'Unit 3', lessonRef: 'Lesson 13', topic: 'Consonants vs. vowels: understanding blocked/unblocked sounds; identifying consonant or vowel; handwriting drop-hook and cross strokes', estimatedMinutes: 25 },
    { unit: 'Unit 3', lessonRef: 'Lesson 14', topic: 'Phonogram S: single-letter phonogram s; distinguishing vowel sounds; consonants vs. vowels; matching bookface to handwritten forms; handwriting lowercase s', estimatedMinutes: 25 },
    { unit: 'Unit 3', lessonRef: 'Lesson 15', topic: 'Review single-letter phonograms; identifying initial sounds; distinguishing vowel sounds; identifying consonant or vowel; handwriting cross stroke', estimatedMinutes: 25 },
    { unit: 'Unit 3', lessonRef: 'Assessment 3', topic: 'Review of Lessons 11–15: phonograms qu, s; consonants vs. vowels; handwriting', estimatedMinutes: 25, isReview: true },

    // Unit 4 — Lessons 16–20 + Review
    { unit: 'Unit 4', lessonRef: 'Lesson 16', topic: 'Phonogram T: single-letter phonogram t; distinguishing vowel sounds; blending CVC words; segmenting one-syllable words; handwriting practice', estimatedMinutes: 25 },
    { unit: 'Unit 4', lessonRef: 'Lesson 17', topic: 'Phonogram I: single-letter phonogram i; identifying initial sounds; blending CVC and consonant-blend words; identifying consonant or vowel; handwriting lowercase i', estimatedMinutes: 25 },
    { unit: 'Unit 4', lessonRef: 'Lesson 18', topic: 'Phonogram P: single-letter phonogram p; identifying initial sounds; blending CVC and consonant-blend words; identifying consonant or vowel; handwriting lowercase p', estimatedMinutes: 25 },
    { unit: 'Unit 4', lessonRef: 'Lesson 19', topic: 'Phonogram U: single-letter phonogram u; identifying initial sounds; blending CVC and consonant-blend words; identifying consonant or vowel; handwriting lowercase u', estimatedMinutes: 25 },
    { unit: 'Unit 4', lessonRef: 'Lesson 20', topic: 'Review phonograms a–u; handwriting lowercase single-letter phonograms; writing phonograms from auditory prompt', estimatedMinutes: 25 },
    { unit: 'Unit 4', lessonRef: 'Assessment 4', topic: 'Review of Lessons 16–20: phonograms t, i, p, u; handwriting practice', estimatedMinutes: 25, isReview: true },

    // Unit 5 — Lessons 21–25 + Review
    { unit: 'Unit 5', lessonRef: 'Lesson 21', topic: 'Phonogram J: single-letter phonogram j; blending CVC words; matching bookface to handwritten forms; handwriting lowercase j', estimatedMinutes: 25 },
    { unit: 'Unit 5', lessonRef: 'Lesson 22', topic: 'Phonogram W: single-letter phonogram w; blending CVC and consonant-blend words; identifying consonant or vowel; handwriting lowercase w', estimatedMinutes: 25 },
    { unit: 'Unit 5', lessonRef: 'Lesson 23', topic: 'Review all single-letter phonograms; writing phonograms from auditory prompt of sound(s); handwriting practice', estimatedMinutes: 25 },
    { unit: 'Unit 5', lessonRef: 'Lesson 24', topic: 'Identifying final sounds in words; review single-letter phonograms; handwriting bump stroke', estimatedMinutes: 25 },
    { unit: 'Unit 5', lessonRef: 'Lesson 25', topic: 'Phonogram R: single-letter phonogram r; identifying final sounds; blending two consonants; handwriting lowercase r', estimatedMinutes: 25 },
    { unit: 'Unit 5', lessonRef: 'Assessment 5', topic: 'Review of Lessons 21–25: phonograms j, w, r; identifying final sounds; handwriting', estimatedMinutes: 25, isReview: true },

    // Unit 6 — Lessons 26–30 + Review
    { unit: 'Unit 6', lessonRef: 'Lesson 26', topic: 'Phonogram N: single-letter phonogram n; identifying medial vowel sounds; blending two-three consonants; QU rule; handwriting lowercase n', estimatedMinutes: 25 },
    { unit: 'Unit 6', lessonRef: 'Lesson 27', topic: 'Phonogram M: single-letter phonogram m; identifying medial vowel sounds; blending two-three consonants; handwriting lowercase m, spacing between words', estimatedMinutes: 25 },
    { unit: 'Unit 6', lessonRef: 'Lesson 28', topic: 'Review single-letter phonograms; identifying medial vowel sounds; blending two-three consonants; handwriting loop/slant stroke', estimatedMinutes: 25 },
    { unit: 'Unit 6', lessonRef: 'Lesson 29', topic: 'Phonogram E: single-letter phonogram e; identifying medial vowel sounds; blending two-three consonants; handwriting lowercase e', estimatedMinutes: 25 },
    { unit: 'Unit 6', lessonRef: 'Lesson 30', topic: 'Phonogram L: single-letter phonogram l; identifying medial vowel sounds; blending two-three consonants; identifying consonant or vowel; handwriting lowercase l', estimatedMinutes: 25 },
    { unit: 'Unit 6', lessonRef: 'Assessment 6', topic: 'Review of Lessons 26–30: phonograms n, m, e, l; medial vowel sounds; handwriting', estimatedMinutes: 25, isReview: true },

    // Unit 7 — Lessons 31–35 + Review
    { unit: 'Unit 7', lessonRef: 'Lesson 31', topic: 'Phonogram B: single-letter phonogram b; identifying and decoding CVC words; handwriting lowercase b', estimatedMinutes: 25 },
    { unit: 'Unit 7', lessonRef: 'Lesson 32', topic: 'Phonogram H: single-letter phonogram h; matching bookface to handwritten forms; handwriting lowercase h', estimatedMinutes: 25 },
    { unit: 'Unit 7', lessonRef: 'Lesson 33', topic: 'Phonogram K: single-letter phonogram k; identifying consonant or vowel; handwriting lowercase k', estimatedMinutes: 25 },
    { unit: 'Unit 7', lessonRef: 'Lesson 34', topic: 'Phonogram F: single-letter phonogram f; identifying consonant or vowel; handwriting lowercase f', estimatedMinutes: 25 },
    { unit: 'Unit 7', lessonRef: 'Lesson 35', topic: 'Phonogram V: single-letter phonogram v; matching bookface to handwritten forms; handwriting lowercase v', estimatedMinutes: 25 },
    { unit: 'Unit 7', lessonRef: 'Assessment 7', topic: 'Review of Lessons 31–35: phonograms b, h, k, f, v; identifying consonant or vowel; handwriting', estimatedMinutes: 25, isReview: true },

    // Unit 8 — Lessons 36–40 + Review
    { unit: 'Unit 8', lessonRef: 'Lesson 36', topic: 'Short vowel sounds: identifying all six single-letter vowels; reading short vowel sounds marked with a breve; handwriting practice', estimatedMinutes: 25 },
    { unit: 'Unit 8', lessonRef: 'Lesson 37', topic: 'Phonogram Y: single-letter phonogram y; identifying consonant or vowel; handwriting lowercase y', estimatedMinutes: 25 },
    { unit: 'Unit 8', lessonRef: 'Lesson 38', topic: 'Phonogram Z: single-letter phonogram z; short vowel sounds; identifying consonant or vowel; handwriting lowercase z', estimatedMinutes: 25 },
    { unit: 'Unit 8', lessonRef: 'Lesson 39', topic: 'Long vowel sounds: short and long sounds of six single-letter vowels; reading vowels marked with breve and macron; handwriting practice', estimatedMinutes: 25 },
    { unit: 'Unit 8', lessonRef: 'Lesson 40', topic: 'Phonogram X: single-letter phonogram x; decoding CVC words with all learned phonograms; writing phonograms from auditory prompt; handwriting lowercase x', estimatedMinutes: 25 },
    { unit: 'Unit 8', lessonRef: 'Assessment 8', topic: 'Review of Lessons 36–40: phonograms y, z, x; short and long vowel sounds; full phonogram review', estimatedMinutes: 25, isReview: true },
  ],
};

// ============================================================================
// FOUNDATIONS B — ages 5–6, lessons 41–80 + 8 reviews = 48 entries
// ============================================================================
const LOE_B: SequenceInput = {
  id: 'loe-foundations-b',
  name: 'Logic of English Foundations B',
  publisher: 'Logic of English',
  ageRangeMin: 5,
  ageRangeMax: 6,
  sourceUrl: 'https://loe-assets.logicofenglish.com/downloads/foundations-a-b-c-d-ss.pdf',
  entries: [
    // Unit 1 — Lessons 41–45 + Review
    { unit: 'Unit 1', lessonRef: 'Lesson 41', topic: 'Short and long vowel review; breve and macron markings; identifying letter names; blending two-syllable words; Reader: Fred the Frog', estimatedMinutes: 35 },
    { unit: 'Unit 1', lessonRef: 'Lesson 42', topic: 'Syllable counting (mouth-drop method); letter names; matching lowercase/uppercase; blending two-syllable words; fluency practice', estimatedMinutes: 35 },
    { unit: 'Unit 1', lessonRef: 'Lesson 43', topic: 'Syllable counting; blending two-syllable words; letter names; word bingo game; decoding practice', estimatedMinutes: 35 },
    { unit: 'Unit 1', lessonRef: 'Lesson 44', topic: 'Syllable counting; blending two-syllable words; letter names; decoding one-syllable words with learned phonograms', estimatedMinutes: 35 },
    { unit: 'Unit 1', lessonRef: 'Lesson 45', topic: 'Letter names; understanding that English has two main alphabets; word bingo; Reader 1: Fred the Frog', estimatedMinutes: 35 },
    { unit: 'Unit 1', lessonRef: 'Assessment 1', topic: 'Review of Lessons 41–45: syllable counting, letter names, short/long vowels', estimatedMinutes: 35, isReview: true },

    // Unit 2 — Lessons 46–50 + Review
    { unit: 'Unit 2', lessonRef: 'Lesson 46', topic: 'Decoding CVC words; high-frequency words; comprehension and fluency practice; The Clock (workbook story)', estimatedMinutes: 35 },
    { unit: 'Unit 2', lessonRef: 'Lesson 47', topic: 'Decoding CVC words; blending two-syllable words; Young Artist Series 1; Stan and His… (workbook story)', estimatedMinutes: 35 },
    { unit: 'Unit 2', lessonRef: 'Lesson 48', topic: 'High-frequency word game; Young Artist Series 1; decoding practice; word matching', estimatedMinutes: 35 },
    { unit: 'Unit 2', lessonRef: 'Lesson 49', topic: 'Phonogram CH: multi-letter phonogram ch; blending two-three consonants; letter names; The Duck\'s Snack (workbook story)', estimatedMinutes: 35 },
    { unit: 'Unit 2', lessonRef: 'Lesson 50', topic: 'Phonogram EE: multi-letter phonogram ee; marking short/long vowels; identifying letter names; Reader 2: Max', estimatedMinutes: 35 },
    { unit: 'Unit 2', lessonRef: 'Assessment 2', topic: 'Review of Lessons 46–50: phonograms ch, ee; high-frequency words; blending', estimatedMinutes: 35, isReview: true },

    // Unit 3 — Lessons 51–55 + Review
    { unit: 'Unit 3', lessonRef: 'Lesson 51', topic: 'Reading practice with ch and ee; comprehension questions; Basketball reading game', estimatedMinutes: 35 },
    { unit: 'Unit 3', lessonRef: 'Lesson 52', topic: 'Review phonograms; Young Artist Series 2; matching questions; decoding practice', estimatedMinutes: 35 },
    { unit: 'Unit 3', lessonRef: 'Lesson 53', topic: 'Phonogram IGH: multi-letter phonogram igh; blending two-three syllable words; Young Artist Series 2; Ben Has a Fright', estimatedMinutes: 35 },
    { unit: 'Unit 3', lessonRef: 'Lesson 54', topic: 'Decoding words with igh; matching phonograms; comprehension practice', estimatedMinutes: 35 },
    { unit: 'Unit 3', lessonRef: 'Lesson 55', topic: 'Phonogram ER: multi-letter phonogram er; syllable counting; uppercase letter names; phonogram WH; Reader 3: Toys Play', estimatedMinutes: 35 },
    { unit: 'Unit 3', lessonRef: 'Assessment 3', topic: 'Review of Lessons 51–55: phonograms igh, er, wh; syllable counting; decoding', estimatedMinutes: 35, isReview: true },

    // Unit 4 — Lessons 56–60 + Review
    { unit: 'Unit 4', lessonRef: 'Lesson 56', topic: 'Silent final E rule: vowel says its long sound because of the E; short vs. long vowel identification; decoding silent-E words', estimatedMinutes: 35 },
    { unit: 'Unit 4', lessonRef: 'Lesson 57', topic: 'Phonograms OI/OY: multi-letter phonograms oi and oy; Young Artist Series 3; The Sail Box (workbook story)', estimatedMinutes: 35 },
    { unit: 'Unit 4', lessonRef: 'Lesson 58', topic: 'Phonograms AI/AY: multi-letter phonograms ai and ay; rule — English words do not end in I, U, V, or J; Silent E game', estimatedMinutes: 35 },
    { unit: 'Unit 4', lessonRef: 'Lesson 59', topic: 'Silent final E rule: vowel says its long sound; identifying reason vowel says long sound in a given word; decoding practice', estimatedMinutes: 35 },
    { unit: 'Unit 4', lessonRef: 'Lesson 60', topic: 'Phonogram NG: multi-letter phonogram ng; writing uppercase letters; Reader 4: Can Pete Pick a Pet?', estimatedMinutes: 35 },
    { unit: 'Unit 4', lessonRef: 'Assessment 4', topic: 'Review of Lessons 56–60: silent final E, phonograms oi/oy, ai/ay, ng; decoding', estimatedMinutes: 35, isReview: true },

    // Unit 5 — Lessons 61–65 + Review
    { unit: 'Unit 5', lessonRef: 'Lesson 61', topic: 'Silent E Store game; rule — English words do not end in V or U; why silent final E is needed; matching uppercase/lowercase; Kate Needs a… (workbook)', estimatedMinutes: 35 },
    { unit: 'Unit 5', lessonRef: 'Lesson 62', topic: 'Decoding words with silent final E; Young Artist Series 4; Kate Needs a… Part 2; comprehension questions', estimatedMinutes: 35 },
    { unit: 'Unit 5', lessonRef: 'Lesson 63', topic: 'Charades game; decoding review; Young Artist Series 4; comprehension practice', estimatedMinutes: 35 },
    { unit: 'Unit 5', lessonRef: 'Lesson 64', topic: 'Phonogram AR: multi-letter phonogram ar; rhyming one-syllable words; Ben\'s Fun Day (workbook story)', estimatedMinutes: 35 },
    { unit: 'Unit 5', lessonRef: 'Lesson 65', topic: 'Phonogram OR: multi-letter phonogram or; rhyming one-syllable words; Reader 5: Quite a Farm!', estimatedMinutes: 35 },
    { unit: 'Unit 5', lessonRef: 'Assessment 5', topic: 'Review of Lessons 61–65: phonograms ar, or; silent final E rules; rhyming', estimatedMinutes: 35, isReview: true },

    // Unit 6 — Lessons 66–70 + Review
    { unit: 'Unit 6', lessonRef: 'Lesson 66', topic: 'Broad vowel sounds for A, O, U; marking broad sounds with two dots; decoding one-syllable words with broad vowels; Fox in the Hen House (workbook)', estimatedMinutes: 35 },
    { unit: 'Unit 6', lessonRef: 'Lesson 67', topic: 'Young Artist Series 5; Fox in the Hen House Part 2; decoding broad vowel words; handwriting practice', estimatedMinutes: 35 },
    { unit: 'Unit 6', lessonRef: 'Lesson 68', topic: 'Young Artist Series 5; Fox in the Hen House Part 3; continued broad vowel practice', estimatedMinutes: 35 },
    { unit: 'Unit 6', lessonRef: 'Lesson 69', topic: 'Review phonograms; The Ball Game (workbook story); decoding and fluency practice', estimatedMinutes: 35 },
    { unit: 'Unit 6', lessonRef: 'Lesson 70', topic: 'Rhyming one-syllable words; Reader 6: Kids Just Want to Have Fun!; fluency practice', estimatedMinutes: 35 },
    { unit: 'Unit 6', lessonRef: 'Assessment 6', topic: 'Review of Lessons 66–70: broad vowels A/O/U; phonogram review; rhyming', estimatedMinutes: 35, isReview: true },

    // Unit 7 — Lessons 71–75 + Review
    { unit: 'Unit 7', lessonRef: 'Lesson 71', topic: 'Phonogram TCH: multi-letter phonogram tch; TCH rule — used only after a short/broad single vowel; decoding tch words; reading game', estimatedMinutes: 35 },
    { unit: 'Unit 7', lessonRef: 'Lesson 72', topic: 'Decoding review; Young Artist Series 6; Gwen Gives a Gift (workbook story); Sheep (workbook story)', estimatedMinutes: 35 },
    { unit: 'Unit 7', lessonRef: 'Lesson 73', topic: 'Matching and bingo games; Young Artist Series 6; decoding practice with all learned phonograms', estimatedMinutes: 35 },
    { unit: 'Unit 7', lessonRef: 'Lesson 74', topic: 'Phonogram OUGH: multi-letter phonogram ough; multiple sounds of ough; recognizing possibilities and selecting correct sound; What Am I? (workbook)', estimatedMinutes: 35 },
    { unit: 'Unit 7', lessonRef: 'Lesson 75', topic: 'Phonograms OW/OU: multi-letter phonograms ow and ou; reading phonograms that say more than one sound; fluency practice', estimatedMinutes: 35 },
    { unit: 'Unit 7', lessonRef: 'Assessment 7', topic: 'Review of Lessons 71–75: phonograms tch, ough, ow, ou; decoding multi-sound phonograms', estimatedMinutes: 35, isReview: true },

    // Unit 8 — Lessons 76–80 + Review
    { unit: 'Unit 8', lessonRef: 'Lesson 76', topic: 'Reading quotes and dialogue; comprehension and fluency; reading practice with all learned phonograms', estimatedMinutes: 35 },
    { unit: 'Unit 8', lessonRef: 'Lesson 77', topic: 'High-frequency words; Who Said What? (workbook); reading dialogue; fluency practice', estimatedMinutes: 35 },
    { unit: 'Unit 8', lessonRef: 'Lesson 78', topic: 'Young Artist Series 8; reading basketball game; fluency review with all phonograms from Book B', estimatedMinutes: 35 },
    { unit: 'Unit 8', lessonRef: 'Lesson 79', topic: 'High-frequency word game; review all Book B phonograms; decoding and spelling practice', estimatedMinutes: 35 },
    { unit: 'Unit 8', lessonRef: 'Lesson 80', topic: 'High-frequency words review; Reader 8: My Best Game; fluency and comprehension', estimatedMinutes: 35 },
    { unit: 'Unit 8', lessonRef: 'Assessment 8', topic: 'Review of Lessons 76–80: high-frequency words; all Book B phonograms; comprehension', estimatedMinutes: 35, isReview: true },
  ],
};

// ============================================================================
// FOUNDATIONS C — ages 6–7, lessons 81–120 + 8 reviews = 48 entries
// ============================================================================
const LOE_C: SequenceInput = {
  id: 'loe-foundations-c',
  name: 'Logic of English Foundations C',
  publisher: 'Logic of English',
  ageRangeMin: 6,
  ageRangeMax: 7,
  sourceUrl: 'https://loe-assets.logicofenglish.com/downloads/foundations-a-b-c-d-ss.pdf',
  entries: [
    // Unit 1 — Lessons 81–85 + Review
    { unit: 'Unit 1', lessonRef: 'Lesson 81', topic: 'Blending compound words; phonogram IR: multi-letter phonogram ir; decoding words with ir; Reader 1: Trains – A Blast of Fast (intro)', estimatedMinutes: 40 },
    { unit: 'Unit 1', lessonRef: 'Lesson 82', topic: 'Phonogram UR: multi-letter phonogram ur; decoding compound words with ur; Reader 1: Trains – A Blast of Fast Part 1', estimatedMinutes: 40 },
    { unit: 'Unit 1', lessonRef: 'Lesson 83', topic: 'Phonogram EAR: multi-letter phonogram ear; decoding compound words with ear; Reader 1: Trains Part 2', estimatedMinutes: 40 },
    { unit: 'Unit 1', lessonRef: 'Lesson 84', topic: 'Phonogram A (ending): when word ends in phonogram A it says /ä/; decoding words; phonogram WOR: multi-letter phonogram wor', estimatedMinutes: 40 },
    { unit: 'Unit 1', lessonRef: 'Lesson 85', topic: 'Miles and Jax A: spelling game with previously taught words; phonogram WR: multi-letter phonogram wr; decoding compound words', estimatedMinutes: 40 },
    { unit: 'Unit 1', lessonRef: 'Assessment 1', topic: 'Review of Lessons 81–85: phonograms ir, ur, ear, wr, wor; compound words', estimatedMinutes: 40, isReview: true },

    // Unit 2 — Lessons 86–90 + Review
    { unit: 'Unit 2', lessonRef: 'Lesson 86', topic: 'Phonogram OO: multi-letter phonogram oo; decoding words with teeth/tooth vowel sounds; Reader 2: Firefly (intro)', estimatedMinutes: 40 },
    { unit: 'Unit 2', lessonRef: 'Lesson 87', topic: 'Animal Card Game; Reader 2: Firefly; decoding review; comprehension practice', estimatedMinutes: 40 },
    { unit: 'Unit 2', lessonRef: 'Lesson 88', topic: 'Review phonograms; blending two-syllable words; comprehension questions; Assessment B review', estimatedMinutes: 40 },
    { unit: 'Unit 2', lessonRef: 'Lesson 89', topic: 'Doubling rule: double last consonant when adding vowel suffix to CVC words; marking vowels; The Farm (workbook story)', estimatedMinutes: 40 },
    { unit: 'Unit 2', lessonRef: 'Lesson 90', topic: 'Phonogram OO (continued): decoding oo words; spelling game from Miles and Jax (lessons 1–90); What Am I? (workbook)', estimatedMinutes: 40 },
    { unit: 'Unit 2', lessonRef: 'Assessment 2', topic: 'Review of Lessons 86–90: phonogram oo; doubling rule; vocabulary', estimatedMinutes: 40, isReview: true },

    // Unit 3 — Lessons 91–95 + Review
    { unit: 'Unit 3', lessonRef: 'Lesson 91', topic: 'Changing initial sounds to create new words; blending two-three syllable words; Read and Do (workbook); decoding practice', estimatedMinutes: 40 },
    { unit: 'Unit 3', lessonRef: 'Lesson 92', topic: 'Changing initial sounds; Reader 3: Kids Can Do Great Things!; comprehension and fluency', estimatedMinutes: 40 },
    { unit: 'Unit 3', lessonRef: 'Lesson 93', topic: 'Blending two- and three-syllable words from auditory prompt; Reader 3 continued; decoding multisyllabic words', estimatedMinutes: 40 },
    { unit: 'Unit 3', lessonRef: 'Lesson 94', topic: 'Phonogram KN: multi-letter phonogram kn; phonogram ES: multi-letter phonogram es; decoding and encoding words; Find It! (workbook)', estimatedMinutes: 40 },
    { unit: 'Unit 3', lessonRef: 'Lesson 95', topic: 'Miles and Jax C: spelling game (lessons 1–95); phonogram GN: multi-letter phonogram gn; syllable counting; Miles and Jax: Clean Up', estimatedMinutes: 40 },
    { unit: 'Unit 3', lessonRef: 'Assessment 3', topic: 'Review of Lessons 91–95: phonograms kn, es, gn; syllable counting; multisyllabic decoding', estimatedMinutes: 40, isReview: true },

    // Unit 4 — Lessons 96–100 + Review
    { unit: 'Unit 4', lessonRef: 'Lesson 96', topic: 'Segmenting three- and four-syllable words; phonogram BU: multi-letter phonogram bu; buy/open exceptions; Reader: Birds', estimatedMinutes: 40 },
    { unit: 'Unit 4', lessonRef: 'Lesson 97', topic: 'Changing initial sounds; making inferences using textual clues; decoding multisyllabic words with all learned phonograms', estimatedMinutes: 40 },
    { unit: 'Unit 4', lessonRef: 'Lesson 98', topic: 'Phonogram GU: multi-letter phonogram gu; identifying reason vowel says long sound; Reader 4: Ostriches', estimatedMinutes: 40 },
    { unit: 'Unit 4', lessonRef: 'Lesson 99', topic: 'Phonogram DGE: multi-letter phonogram dge; reason vowel says long sound in given word; Barn Activity (workbook)', estimatedMinutes: 40 },
    { unit: 'Unit 4', lessonRef: 'Lesson 100', topic: 'Miles and Jax D: phonemic awareness; spelling game (lessons 1–100); Miles and Jax: Master Planners', estimatedMinutes: 40 },
    { unit: 'Unit 4', lessonRef: 'Assessment 4', topic: 'Review of Lessons 96–100: phonograms bu, gu, dge; syllable segmenting', estimatedMinutes: 40, isReview: true },

    // Unit 5 — Lessons 101–105 + Review
    { unit: 'Unit 5', lessonRef: 'Lesson 101', topic: 'Phonogram PH: multi-letter phonogram ph; decoding ph words; spelling game (lessons 1–100); Put it There! (workbook composition)', estimatedMinutes: 40 },
    { unit: 'Unit 5', lessonRef: 'Lesson 102', topic: 'Phonogram EI: multi-letter phonogram ei; silent final E rule; Reader 5: Robots Part 1', estimatedMinutes: 40 },
    { unit: 'Unit 5', lessonRef: 'Lesson 103', topic: 'Phonogram EY: multi-letter phonogram ey; decoding ei and ey words; Reader 5: Robots Part 2; vocabulary: face, they, reuse', estimatedMinutes: 40 },
    { unit: 'Unit 5', lessonRef: 'Lesson 104', topic: 'Grammar, composition, and handwriting practice; review phonograms from Book C; Put it There! composition continued', estimatedMinutes: 40 },
    { unit: 'Unit 5', lessonRef: 'Lesson 105', topic: 'Miles and Jax E: Miles and Jax Master Planners / Solve a Crime; spelling game (lessons 1–105)', estimatedMinutes: 40 },
    { unit: 'Unit 5', lessonRef: 'Assessment 5', topic: 'Review of Lessons 101–105: phonograms ph, ei, ey; silent final E; grammar', estimatedMinutes: 40, isReview: true },

    // Unit 6 — Lessons 106–110 + Review
    { unit: 'Unit 6', lessonRef: 'Lesson 106', topic: 'Phonogram EIGH: multi-letter phonogram eigh; G may say /j/ before E, I, or Y; Reader 6: Dolphins Part 1', estimatedMinutes: 40 },
    { unit: 'Unit 6', lessonRef: 'Lesson 107', topic: 'Phonogram CEI: multi-letter phonogram cei; decoding cei words; spelling game (lessons 1–105); Reader 6: Dolphins Part 2', estimatedMinutes: 40 },
    { unit: 'Unit 6', lessonRef: 'Lesson 108', topic: 'Phonogram EW: multi-letter phonogram ew; decoding ew words; Fred (workbook story); Reader 6 continued', estimatedMinutes: 40 },
    { unit: 'Unit 6', lessonRef: 'Lesson 109', topic: 'Phonogram UI: multi-letter phonogram ui; silent final E rule — add E to keep singular -S words from looking plural; Star (workbook story)', estimatedMinutes: 40 },
    { unit: 'Unit 6', lessonRef: 'Lesson 110', topic: 'Phonogram OE: multi-letter phonogram oe; decoding oe words; vocabulary: come; Mice (workbook story)', estimatedMinutes: 40 },
    { unit: 'Unit 6', lessonRef: 'Assessment 6', topic: 'Review of Lessons 106–110: phonograms eigh, cei, ew, ui, oe; spelling rules', estimatedMinutes: 40, isReview: true },

    // Unit 7 — Lessons 111–115 + Review
    { unit: 'Unit 7', lessonRef: 'Lesson 111', topic: 'Phonogram ED: multi-letter phonogram ed (three sounds); decoding ed-suffix words; vocabulary: done, planted; Reading Practice (workbook)', estimatedMinutes: 40 },
    { unit: 'Unit 7', lessonRef: 'Lesson 112', topic: 'Phonogram AW: multi-letter phonogram aw; Reader 7: Ha Long Bay Part 1; phonemic awareness practice', estimatedMinutes: 40 },
    { unit: 'Unit 7', lessonRef: 'Lesson 113', topic: 'Rule: Y says /ē/ only at end of multi-syllable word; syllable counting; vocabulary: city; Reader 7: Ha Long Bay Part 2', estimatedMinutes: 40 },
    { unit: 'Unit 7', lessonRef: 'Lesson 114', topic: 'Phonogram AU: multi-letter phonogram au; The Myth of Ha Long Bay (workbook)', estimatedMinutes: 40 },
    { unit: 'Unit 7', lessonRef: 'Lesson 115', topic: 'Phonogram AUGH: multi-letter phonogram augh; Y says /ē/ rule continued; spelling game (lessons 1–115); Ball Game (workbook)', estimatedMinutes: 40 },
    { unit: 'Unit 7', lessonRef: 'Assessment 7', topic: 'Review of Lessons 111–115: phonograms ed, aw, au, augh; Y=/ē/ rule; spelling', estimatedMinutes: 40, isReview: true },

    // Unit 8 — Lessons 116–120 + Review
    { unit: 'Unit 8', lessonRef: 'Lesson 116', topic: 'Phonogram IE: multi-letter phonogram ie; decoding ie words; Gondola (workbook story)', estimatedMinutes: 40 },
    { unit: 'Unit 8', lessonRef: 'Lesson 117', topic: 'Silent L: decoding words with a silent L; vocabulary: would, could, should; Reader 8: Rickshaws Part 1', estimatedMinutes: 40 },
    { unit: 'Unit 8', lessonRef: 'Lesson 118', topic: 'Phonogram TI: multi-letter phonogram ti; decoding ti words; vocabulary: better; Reader 8: Rickshaws Part 2', estimatedMinutes: 40 },
    { unit: 'Unit 8', lessonRef: 'Lesson 119', topic: 'Phonogram SI: multi-letter phonogram si; decoding si words; The History of Bikes (workbook); spelling review', estimatedMinutes: 40 },
    { unit: 'Unit 8', lessonRef: 'Lesson 120', topic: 'Phonogram CI: multi-letter phonogram ci; spelling game (lessons 1–120); Miles and Jax H: Master Planners / Not a Mere Cat; matching review', estimatedMinutes: 40 },
    { unit: 'Unit 8', lessonRef: 'Assessment 8', topic: 'Review of Lessons 116–120: phonograms ie, ti, si, ci; silent L; all Book C phonograms', estimatedMinutes: 40, isReview: true },
  ],
};

// ============================================================================
// FOUNDATIONS D — ages 7–8, lessons 121–160 + 8 reviews = 48 entries
// ============================================================================
const LOE_D: SequenceInput = {
  id: 'loe-foundations-d',
  name: 'Logic of English Foundations D',
  publisher: 'Logic of English',
  ageRangeMin: 7,
  ageRangeMax: 8,
  sourceUrl: 'https://loe-assets.logicofenglish.com/downloads/foundations-a-b-c-d-ss.pdf',
  entries: [
    // Unit 1 — Lessons 121–125 + Review
    { unit: 'Unit 1', lessonRef: 'Lesson 121', topic: 'Advanced phonograms review; decoding multi-syllable words; Polar Opposites by Erik Brooks (read-aloud intro)', estimatedMinutes: 50 },
    { unit: 'Unit 1', lessonRef: 'Lesson 122', topic: 'Reader 1: The Arctic and the Antarctic — Polar Opposites; decoding and comprehension; advanced phonogram review', estimatedMinutes: 50 },
    { unit: 'Unit 1', lessonRef: 'Lesson 123', topic: 'Are You My Mother? by P.D. Eastman (read-aloud Part 1); spelling rules review; advanced phonogram practice', estimatedMinutes: 50 },
    { unit: 'Unit 1', lessonRef: 'Lesson 124', topic: 'Are You My Mother? by P.D. Eastman (read-aloud Part 2); advanced phonogram practice; vocabulary building', estimatedMinutes: 50 },
    { unit: 'Unit 1', lessonRef: 'Lesson 125', topic: 'Reader 2: Baby Birds; spelling rules; grammar introduction; vocabulary expansion', estimatedMinutes: 50 },
    { unit: 'Unit 1', lessonRef: 'Assessment 1', topic: 'Review of Lessons 121–125: advanced phonograms; spelling rules; vocabulary', estimatedMinutes: 50, isReview: true },

    // Unit 2 — Lessons 126–130 + Review
    { unit: 'Unit 2', lessonRef: 'Lesson 126', topic: 'Advanced phonogram CE; I and Y may say /ĭ/ or /ī/ at end of syllable; nouns; "What Will Little Bear Wear?" (read-aloud)', estimatedMinutes: 50 },
    { unit: 'Unit 2', lessonRef: 'Lesson 127', topic: 'Advanced phonogram MB: learn phonogram mb; irregular plurals of words ending in O; "Birthday Soup," Little Bear (read-aloud)', estimatedMinutes: 50 },
    { unit: 'Unit 2', lessonRef: 'Lesson 128', topic: 'Vocabulary: giant, quiet, go, goes, do, does, compare, asleep; "Little Bear Goes to the Moon" (read-aloud); spelling practice', estimatedMinutes: 50 },
    { unit: 'Unit 2', lessonRef: 'Lesson 129', topic: 'Spelling rules review; adding suffixes to words ending in silent final E; decoding and encoding practice; comprehension', estimatedMinutes: 50 },
    { unit: 'Unit 2', lessonRef: 'Lesson 130', topic: 'Review adding suffix to silent-final-E words; Reader 3: Bears, Bears, and More Bears; spelling rules continued', estimatedMinutes: 50 },
    { unit: 'Unit 2', lessonRef: 'Assessment 2', topic: 'Review of Lessons 126–130: advanced phonograms ce, mb; suffixing rules; irregular plurals', estimatedMinutes: 50, isReview: true },

    // Unit 3 — Lessons 131–135 + Review
    { unit: 'Unit 3', lessonRef: 'Lesson 131', topic: 'Unstressed -OR; dropping silent final E when adding vowel suffix (advanced); decoding multi-syllable words; spelling practice', estimatedMinutes: 50 },
    { unit: 'Unit 3', lessonRef: 'Lesson 132', topic: 'Unstressed -OR; dropping silent E rules; Should I Share My Ice Cream? (read-aloud); Go, Dog. Go! (read-aloud)', estimatedMinutes: 50 },
    { unit: 'Unit 3', lessonRef: 'Lesson 133', topic: 'Drop silent final E when adding vowel suffix only if allowed by other spelling rules; review common and proper nouns', estimatedMinutes: 50 },
    { unit: 'Unit 3', lessonRef: 'Lesson 134', topic: 'Silent final E drop rule continued; A Fish Out of Water by Helen Palmer (read-aloud Part 1); advanced decoding', estimatedMinutes: 50 },
    { unit: 'Unit 3', lessonRef: 'Lesson 135', topic: 'A Fish Out of Water (read-aloud Part 2); How to Train a Goldfish by Denise Eide (workbook); spelling and grammar review', estimatedMinutes: 50 },
    { unit: 'Unit 3', lessonRef: 'Assessment 3', topic: 'Review of Lessons 131–135: dropping silent E; unstressed -OR; nouns; suffixing rules', estimatedMinutes: 50, isReview: true },

    // Unit 4 — Lessons 136–140 + Review
    { unit: 'Unit 4', lessonRef: 'Lesson 136', topic: 'Advanced phonograms review; Reader 4 (workbook); decoding and encoding multi-syllable words with advanced phonograms', estimatedMinutes: 50 },
    { unit: 'Unit 4', lessonRef: 'Lesson 137', topic: 'Spelling rules: suffixes and word endings; grammar practice; vocabulary development; decoding review', estimatedMinutes: 50 },
    { unit: 'Unit 4', lessonRef: 'Lesson 138', topic: 'Advanced phonogram practice; spelling rules continued; composition and handwriting; Reader 4 continued', estimatedMinutes: 50 },
    { unit: 'Unit 4', lessonRef: 'Lesson 139', topic: 'Review spelling rules; grammar and vocabulary; decoding practice with all learned phonograms', estimatedMinutes: 50 },
    { unit: 'Unit 4', lessonRef: 'Lesson 140', topic: 'Single-vowel Y changes to I rule; Reader 5: My Nest is Best! by Miriam Eide; spelling rules review', estimatedMinutes: 50 },
    { unit: 'Unit 4', lessonRef: 'Assessment 4', topic: 'Review of Lessons 136–140: Y-to-I rule; advanced phonograms; spelling rules; grammar', estimatedMinutes: 50, isReview: true },

    // Unit 5 — Lessons 141–145 + Review
    { unit: 'Unit 5', lessonRef: 'Lesson 141', topic: 'Advanced phonograms GH and AIGH; Henry and Mudge: The First Book pp. 5–17 (read-aloud); Y-to-I changes', estimatedMinutes: 50 },
    { unit: 'Unit 5', lessonRef: 'Lesson 142', topic: 'Change Y to I and add -ES; identifying subject and predicate; Henry and Mudge pp. 18–40 (read-aloud)', estimatedMinutes: 50 },
    { unit: 'Unit 5', lessonRef: 'Lesson 143', topic: 'Change Y to I and add -ES continued; "Mr. Putter and Tabby," Mr. Putter & Tabby Pour the Tea (read-aloud)', estimatedMinutes: 50 },
    { unit: 'Unit 5', lessonRef: 'Lesson 144', topic: 'Suffixing rules review; advanced phonogram practice; grammar — subject and predicate; vocabulary development', estimatedMinutes: 50 },
    { unit: 'Unit 5', lessonRef: 'Lesson 145', topic: 'Spelling rules: adding suffixes; "Mr. Putter and Tabby" continued; grammar and composition practice', estimatedMinutes: 50 },
    { unit: 'Unit 5', lessonRef: 'Assessment 5', topic: 'Review of Lessons 141–145: phonograms gh, aigh; Y-to-I/-ES; subject and predicate', estimatedMinutes: 50, isReview: true },

    // Unit 6 — Lessons 146–150 + Review
    { unit: 'Unit 6', lessonRef: 'Lesson 146', topic: 'Advanced phonogram review; spelling rules consolidation; grammar practice; composition and handwriting', estimatedMinutes: 50 },
    { unit: 'Unit 6', lessonRef: 'Lesson 147', topic: 'Spelling and grammar practice; decoding multi-syllable words; vocabulary expansion; fluency practice', estimatedMinutes: 50 },
    { unit: 'Unit 6', lessonRef: 'Lesson 148', topic: 'Advanced phonogram practice; suffixing rules; grammar — nouns, verbs, adjectives; composition practice', estimatedMinutes: 50 },
    { unit: 'Unit 6', lessonRef: 'Lesson 149', topic: 'Spelling rules review; grammar and vocabulary; decoding and encoding practice; comprehension activities', estimatedMinutes: 50 },
    { unit: 'Unit 6', lessonRef: 'Lesson 150', topic: 'Stressed and unstressed syllables; "A List" and "The Garden," Frog and Toad Together by Arnold Lobel (read-aloud)', estimatedMinutes: 50 },
    { unit: 'Unit 6', lessonRef: 'Assessment 6', topic: 'Review of Lessons 146–150: stressed/unstressed syllables; suffixing rules; grammar review', estimatedMinutes: 50, isReview: true },

    // Unit 7 — Lessons 151–155 + Review
    { unit: 'Unit 7', lessonRef: 'Lesson 151', topic: 'Advanced phonogram E says /ā/; subject-verb agreement; suffixing rules practice; decoding multi-syllable words', estimatedMinutes: 50 },
    { unit: 'Unit 7', lessonRef: 'Lesson 152', topic: 'Advanced phonogram E says /ā/; subject-verb agreement; Chapter 1, Dodsworth in New York by Tim Egan (read-aloud)', estimatedMinutes: 50 },
    { unit: 'Unit 7', lessonRef: 'Lesson 153', topic: 'Doubling rule — double last consonant when adding vowel suffix to CVC words; Chapter 2, Dodsworth in New York (read-aloud)', estimatedMinutes: 50 },
    { unit: 'Unit 7', lessonRef: 'Lesson 154', topic: 'Doubling rule continued; Chapter 3, Dodsworth in New York (read-aloud); grammar review', estimatedMinutes: 50 },
    { unit: 'Unit 7', lessonRef: 'Lesson 155', topic: 'Chapter 4, Dodsworth in New York (read-aloud); editing practice; copywork; Review Lesson G', estimatedMinutes: 50 },
    { unit: 'Unit 7', lessonRef: 'Assessment 7', topic: 'Review of Lessons 151–155: phonogram E=/ā/; doubling rule; subject-verb agreement; editing', estimatedMinutes: 50, isReview: true },

    // Unit 8 — Lessons 156–160 + Review
    { unit: 'Unit 8', lessonRef: 'Lesson 156', topic: 'Adding any suffix to any word; adjectives; Reader 8: Mouse and Mole by Miriam Eide; spelling rules culmination', estimatedMinutes: 50 },
    { unit: 'Unit 8', lessonRef: 'Lesson 157', topic: 'Spellings of /sh/ (sh, ti, si, ci, ssi, ce, ch); adjectives; "Clean and Tidy," Upstairs Mouse, Downstairs Mole (read-aloud)', estimatedMinutes: 50 },
    { unit: 'Unit 8', lessonRef: 'Lesson 158', topic: 'Spellings of /sh/ continued; nouns and adjectives; "The Invitations," Upstairs Mouse, Downstairs Mole (read-aloud)', estimatedMinutes: 50 },
    { unit: 'Unit 8', lessonRef: 'Lesson 159', topic: 'Spellings of /sh/ review; adjectives and nouns; "Kind, Good Neighbors," Upstairs Mouse, Downstairs Mole (read-aloud)', estimatedMinutes: 50 },
    { unit: 'Unit 8', lessonRef: 'Lesson 160', topic: 'Editing practice; adjectives and nouns review; "The Boat," Upstairs Mouse, Downstairs Mole (read-aloud); course culmination', estimatedMinutes: 50 },
    { unit: 'Unit 8', lessonRef: 'Assessment 8', topic: 'Review of Lessons 156–160: spellings of /sh/; adjectives and nouns; all suffixing rules; full course review', estimatedMinutes: 50, isReview: true },
  ],
};

export async function seedLogicOfEnglish(prisma: PrismaClient) {
  await upsertSequence(prisma, LOE_A);
  await upsertSequence(prisma, LOE_B);
  await upsertSequence(prisma, LOE_C);
  await upsertSequence(prisma, LOE_D);
}
