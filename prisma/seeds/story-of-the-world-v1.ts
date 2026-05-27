import { PrismaClient, ResourceType, Subject } from '@prisma/client';

type ResourceInput = {
  id: string;
  title: string;
  description: string;
  weekHint: number;
  tier7Activity: { instructions: string; materials: string[]; minutes: number };
  tier4Activity: { instructions: string; materials: string[]; minutes: number };
  bookList: string[];
  fieldTripLocation?: string;
  videoUrl?: string;
};

const TERM_IDS_ALL = ['summer-2026', 'fall-2026', 'spring-2027', 'summer-2027'];

async function upsertResource(prisma: PrismaClient, r: ResourceInput) {
  await prisma.curriculumResource.upsert({
    where: { id: r.id },
    update: {
      title: r.title, description: r.description, weekHint: r.weekHint,
      activities: { tier7: r.tier7Activity, tier4: r.tier4Activity },
      bookList: r.bookList, fieldTripLocation: r.fieldTripLocation ?? null,
      videoUrl: r.videoUrl ?? null,
      framework: 'SOTW Vol 1', subject: Subject.HISTORY, type: ResourceType.PROJECT,
      ageRange: '4-8', season: 'any', termIds: TERM_IDS_ALL,
      sourceUrl: 'https://welltrainedmind.com/p/sotw-1-25th-text/',
      tags: ['classical', 'read-aloud', 'multi-age'],
      materials: [...r.tier7Activity.materials, ...r.tier4Activity.materials],
      active: true,
    },
    create: {
      id: r.id, title: r.title, description: r.description, weekHint: r.weekHint,
      activities: { tier7: r.tier7Activity, tier4: r.tier4Activity },
      bookList: r.bookList, fieldTripLocation: r.fieldTripLocation ?? null,
      videoUrl: r.videoUrl ?? null,
      framework: 'SOTW Vol 1', subject: Subject.HISTORY, type: ResourceType.PROJECT,
      ageRange: '4-8', season: 'any', termIds: TERM_IDS_ALL,
      sourceUrl: 'https://welltrainedmind.com/p/sotw-1-25th-text/',
      tags: ['classical', 'read-aloud', 'multi-age'],
      materials: [...r.tier7Activity.materials, ...r.tier4Activity.materials],
      active: true,
    },
  });
}

export async function seedStoryOfTheWorldV1(prisma: PrismaClient) {
  for (const r of SOTW_V1_CHAPTERS) {
    await upsertResource(prisma, r);
  }
  console.log(`  • SOTW Vol 1: ${SOTW_V1_CHAPTERS.length} chapters seeded`);
}

// ============================================================================
// SOTW Vol 1 — The Ancient Times (original 42-chapter edition)
// NOTE: The 25th-Anniversary Expanded Edition chapter list was not verifiable
// from available sources; falling back to the standard original 42 chapters.
// ============================================================================
const SOTW_V1_CHAPTERS: ResourceInput[] = [
  {
    id: 'sotw-v1-ch-01',
    title: 'The Earliest People',
    description: 'Nomadic life before farming — hunting and gathering, fire, and early tools.',
    weekHint: 1,
    tier7Activity: {
      instructions: 'Read the chapter aloud together. Have the child narrate it back in their own words. Color the activity-book map showing early human migration routes. Write 3 sentences describing what a nomad does each day.',
      materials: ['SOTW Vol 1 text', 'SOTW activity book map page', 'colored pencils', 'lined paper'],
      minutes: 30,
    },
    tier4Activity: {
      instructions: 'Listen to the chapter read aloud. Act out being a nomad — walk around the room pretending to search for food and a camping spot. Color the migration map together.',
      materials: ['SOTW Vol 1 text or audiobook', 'SOTW activity book map page', 'crayons'],
      minutes: 20,
    },
    bookList: [
      'The First Drawing by Mordicai Gerstein',
      'Stone Age Boy by Satoshi Kitamura',
      'Picture book about early humans and caves (request from library)',
    ],
    fieldTripLocation: 'Oregon Historical Society, Portland — early peoples and pre-contact Northwest exhibits',
  },
  {
    id: 'sotw-v1-ch-02',
    title: 'Egyptians Lived on the Nile River',
    description: 'How annual floods made Egyptian farmland rich, and the birth of Egyptian civilization.',
    weekHint: 2,
    tier7Activity: {
      instructions: 'Read the chapter aloud. Have the child narrate the story of the Nile floods. Color the map of the Nile River and label Upper and Lower Egypt. Write 2–3 sentences explaining why the Nile floods were a gift to farmers.',
      materials: ['SOTW Vol 1 text', 'SOTW activity book map page', 'colored pencils', 'lined paper'],
      minutes: 30,
    },
    tier4Activity: {
      instructions: 'Listen to the chapter. Together, pour water slowly over a tray of sand or soil to show how a river flood brings new soil. Color the Nile map.',
      materials: ['SOTW Vol 1 text or audiobook', 'shallow tray', 'sand or potting soil', 'water', 'SOTW activity book map page', 'crayons'],
      minutes: 25,
    },
    bookList: [
      'Tut\'s Mummy Lost and Found by Judy Donnelly',
      'The Egypt Game by Zilpha Keatley Snyder (chapter book, older end of age range)',
    ],
    fieldTripLocation: 'OMSI, Portland — ancient Egypt exhibit and mummy display',
  },
  {
    id: 'sotw-v1-ch-03',
    title: 'The First Writing',
    description: 'Cuneiform writing invented by Sumerians in Mesopotamia — clay tablets and pictographs.',
    weekHint: 3,
    tier7Activity: {
      instructions: 'Read the chapter aloud. Have the child narrate back the story of how writing began. Practice making cuneiform-style marks on the activity-book worksheet. Write 3 sentences about why people needed to invent writing.',
      materials: ['SOTW Vol 1 text', 'SOTW activity book worksheet', 'pencil', 'lined paper'],
      minutes: 30,
    },
    tier4Activity: {
      instructions: 'Listen to the chapter. Press a pencil or craft stick into a flattened piece of air-dry clay to make picture symbols. Try to write your name using simple pictographs.',
      materials: ['SOTW Vol 1 text or audiobook', 'air-dry clay', 'craft stick or blunt pencil'],
      minutes: 25,
    },
    bookList: [
      'The Librarian of Basra by Jeanette Winter',
      'How I Learned Geography by Uri Shulevitz',
    ],
  },
  {
    id: 'sotw-v1-ch-04',
    title: 'The First Sumerian Dictator',
    description: 'Sargon the Great unites city-states and builds the first known empire.',
    weekHint: 4,
    tier7Activity: {
      instructions: 'Read the chapter aloud. Have the child narrate who Sargon was and how he came to power. Color the activity-book map of Mesopotamia and mark the city of Akkad. Write 2–3 sentences comparing a city-state king to an empire-builder.',
      materials: ['SOTW Vol 1 text', 'SOTW activity book map page', 'colored pencils', 'lined paper'],
      minutes: 30,
    },
    tier4Activity: {
      instructions: 'Listen to the chapter. Build a small "city" with blocks, then decide who rules it. Act out Sargon traveling to each city to take over. Color the Mesopotamia map.',
      materials: ['SOTW Vol 1 text or audiobook', 'building blocks', 'SOTW activity book map page', 'crayons'],
      minutes: 20,
    },
    bookList: [
      'Sumer Is Icumen In (picture book about Mesopotamia — request from library)',
      'Ancient Civilizations: Mesopotamia (DK Eyewitness style — request from library)',
    ],
  },
  {
    id: 'sotw-v1-ch-05',
    title: 'The First Pharaoh',
    description: 'Menes unites Upper and Lower Egypt and becomes the first pharaoh.',
    weekHint: 5,
    tier7Activity: {
      instructions: 'Read the chapter aloud. Have the child narrate the story of Menes and the unification of Egypt. Color the activity-book page showing the double crown of Egypt. Write 3 sentences explaining what a pharaoh was and why the double crown was important.',
      materials: ['SOTW Vol 1 text', 'SOTW activity book page', 'colored pencils', 'lined paper'],
      minutes: 30,
    },
    tier4Activity: {
      instructions: 'Listen to the chapter. Make a simple paper crown (white cylinder) and a red paper cone crown, then put one inside the other like Menes did. Color the double crown worksheet.',
      materials: ['SOTW Vol 1 text or audiobook', 'white construction paper', 'red construction paper', 'tape', 'SOTW activity book page', 'crayons'],
      minutes: 25,
    },
    bookList: [
      'Mummies Made in Egypt by Aliki',
      'Cleopatra by Diane Stanley and Peter Vennema',
    ],
    fieldTripLocation: 'OMSI, Portland — ancient Egypt exhibit',
  },
  {
    id: 'sotw-v1-ch-06',
    title: 'Gilgamesh the King',
    description: 'The epic of Gilgamesh — the oldest written story in the world, about a king seeking immortality.',
    weekHint: 6,
    tier7Activity: {
      instructions: 'Read the chapter aloud and enjoy the story as a read-aloud. Have the child narrate Gilgamesh\'s quest. Use the activity-book page to draw a scene from the story. Write 3 sentences about what Gilgamesh was searching for and what he learned.',
      materials: ['SOTW Vol 1 text', 'SOTW activity book page', 'crayons or colored pencils', 'lined paper'],
      minutes: 35,
    },
    tier4Activity: {
      instructions: 'Listen to the Gilgamesh story with great dramatic expression. Draw one scene from the adventure. Act out the part where Gilgamesh fights the monster Humbaba.',
      materials: ['SOTW Vol 1 text or audiobook', 'plain paper', 'crayons'],
      minutes: 20,
    },
    bookList: [
      'Gilgamesh the Hero retold by Geraldine McCaughrean',
      'The Gilgamesh Trilogy by Ludmila Zeman (picture book series)',
    ],
  },
  {
    id: 'sotw-v1-ch-07',
    title: 'Hammurabi and the Babylonians',
    description: 'King Hammurabi of Babylon creates one of the world\'s earliest written law codes.',
    weekHint: 7,
    tier7Activity: {
      instructions: 'Read the chapter aloud. Have the child narrate what Hammurabi\'s Code was and why laws matter. Copy 2–3 sample laws from the activity book and write 2 sentences about whether those laws seem fair.',
      materials: ['SOTW Vol 1 text', 'SOTW activity book page', 'pencil', 'lined paper'],
      minutes: 30,
    },
    tier4Activity: {
      instructions: 'Listen to the chapter. Make up 3 simple rules for your household together and write or dictate them on a piece of paper. Decorate it like a stone stele.',
      materials: ['SOTW Vol 1 text or audiobook', 'plain paper', 'markers or crayons'],
      minutes: 20,
    },
    bookList: [
      'The Code of Hammurabi (illustrated children\'s history — request from library)',
      'DK Eyewitness: Ancient Mesopotamia (request from library)',
    ],
  },
  {
    id: 'sotw-v1-ch-08',
    title: 'The Egyptians Lived in Families',
    description: 'Daily life in ancient Egypt — family structure, children\'s games, and household customs.',
    weekHint: 8,
    tier7Activity: {
      instructions: 'Read the chapter aloud. Have the child narrate what family life was like in ancient Egypt. Color the activity-book scene of an Egyptian home. Write 3 sentences comparing an ancient Egyptian child\'s day to the child\'s own day.',
      materials: ['SOTW Vol 1 text', 'SOTW activity book page', 'colored pencils', 'lined paper'],
      minutes: 30,
    },
    tier4Activity: {
      instructions: 'Listen to the chapter. Look at pictures of ancient Egyptian art showing families. Try playing a simple ancient game described in the chapter, like a counting or running game.',
      materials: ['SOTW Vol 1 text or audiobook', 'SOTW activity book page', 'crayons'],
      minutes: 20,
    },
    bookList: [
      'Egyptian Cinderella by Shirley Climo',
      'The Gods and Goddesses of Ancient Egypt by Leonard Everett Fisher',
    ],
    fieldTripLocation: 'Portland Art Museum — ancient world collection including Egyptian artifacts',
  },
  {
    id: 'sotw-v1-ch-09',
    title: 'The Jewish People',
    description: 'Abraham leaves Ur; the beginnings of the Hebrew people and their covenant with God.',
    weekHint: 9,
    tier7Activity: {
      instructions: 'Read the chapter aloud. Have the child narrate the story of Abraham\'s journey. Color the activity-book map tracing Abraham\'s route from Ur to Canaan. Write 3 sentences about what a covenant means and why Abraham\'s decision was brave.',
      materials: ['SOTW Vol 1 text', 'SOTW activity book map page', 'colored pencils', 'lined paper'],
      minutes: 30,
    },
    tier4Activity: {
      instructions: 'Listen to the chapter. Walk around the house or yard with a small bundle pretending to travel like Abraham. Color the journey map together.',
      materials: ['SOTW Vol 1 text or audiobook', 'SOTW activity book map page', 'crayons', 'small cloth bundle prop'],
      minutes: 20,
    },
    bookList: [
      'The Story of Abraham by Patricia A. Pingry',
      'Children of the Longhouse by Joseph Bruchac (not directly related — substitute: picture Bible stories about Abraham from library)',
    ],
  },
  {
    id: 'sotw-v1-ch-10',
    title: 'Joseph Goes to Egypt',
    description: 'Joseph is sold into slavery by his brothers and rises to power in Egypt.',
    weekHint: 10,
    tier7Activity: {
      instructions: 'Read the chapter aloud. Have the child narrate the story of Joseph in their own words. Color the activity-book page. Write 3 sentences about how Joseph responded to difficulty and what happened as a result.',
      materials: ['SOTW Vol 1 text', 'SOTW activity book page', 'colored pencils', 'lined paper'],
      minutes: 30,
    },
    tier4Activity: {
      instructions: 'Listen to the chapter. Use fabric scraps to make a simple multi-colored strip "coat." Retell the story of Joseph using small toy figures or stuffed animals.',
      materials: ['SOTW Vol 1 text or audiobook', 'fabric scraps', 'tape or safety pins', 'small figures or stuffed animals'],
      minutes: 25,
    },
    bookList: [
      'Joseph and His Brothers retold by Warwick Hutton',
      'Joseph Had a Little Overcoat by Simms Taback',
    ],
  },
  {
    id: 'sotw-v1-ch-11',
    title: 'The Egyptian Pyramids',
    description: 'Why Egyptians built pyramids, how they were constructed, and what they reveal about Egyptian beliefs.',
    weekHint: 11,
    tier7Activity: {
      instructions: 'Read the chapter aloud. Have the child narrate how the pyramids were built and why. Use sugar cubes or small wooden blocks to construct a step pyramid. Write 3 sentences about what a pyramid tells us about ancient Egyptian beliefs.',
      materials: ['SOTW Vol 1 text', 'sugar cubes or small blocks', 'plain paper', 'lined paper', 'pencil'],
      minutes: 35,
    },
    tier4Activity: {
      instructions: 'Listen to the chapter. Stack blocks or sugar cubes into a pyramid shape. Count the layers. Color the activity-book pyramid scene.',
      materials: ['SOTW Vol 1 text or audiobook', 'sugar cubes or building blocks', 'SOTW activity book page', 'crayons'],
      minutes: 25,
    },
    bookList: [
      'Pyramid by David Macaulay',
      'The Magic School Bus Explores the Ancient World (request from library)',
    ],
    fieldTripLocation: 'OMSI, Portland — ancient Egypt and mummy exhibits',
  },
  {
    id: 'sotw-v1-ch-12',
    title: 'The Exodus from Egypt',
    description: 'Moses leads the Hebrew people out of slavery in Egypt toward the Promised Land.',
    weekHint: 12,
    tier7Activity: {
      instructions: 'Read the chapter aloud. Have the child narrate the story of Moses and the Exodus. Color the activity-book map tracing the Exodus route. Write 3 sentences explaining why the Exodus story has been important to people throughout history.',
      materials: ['SOTW Vol 1 text', 'SOTW activity book map page', 'colored pencils', 'lined paper'],
      minutes: 30,
    },
    tier4Activity: {
      instructions: 'Listen to the chapter. Act out the parting of the Red Sea using a blue blanket or towels. Walk through the "sea" together.',
      materials: ['SOTW Vol 1 text or audiobook', 'blue blanket or towels', 'SOTW activity book map page', 'crayons'],
      minutes: 20,
    },
    bookList: [
      'Exodus by Brian Wildsmith',
      'Moses by Brian Wildsmith',
    ],
  },
  {
    id: 'sotw-v1-ch-13',
    title: 'The Phoenicians',
    description: 'Phoenician sailors, traders, and the invention of the alphabet.',
    weekHint: 13,
    tier7Activity: {
      instructions: 'Read the chapter aloud. Have the child narrate what the Phoenicians are famous for. Color the Phoenician alphabet chart in the activity book and try to write your name using Phoenician letters. Write 3 sentences about why an alphabet is easier to learn than hieroglyphics.',
      materials: ['SOTW Vol 1 text', 'SOTW activity book alphabet chart', 'colored pencils', 'lined paper'],
      minutes: 30,
    },
    tier4Activity: {
      instructions: 'Listen to the chapter. Look at the Phoenician alphabet together and find the letters that look like our own. "Sail" a toy boat across a map, pretending to be a Phoenician trader.',
      materials: ['SOTW Vol 1 text or audiobook', 'toy boat or paper boat', 'world map', 'SOTW activity book page', 'crayons'],
      minutes: 20,
    },
    bookList: [
      'The Alphabet From A to Y with Bonus Letter Z! by Steve Martin and Roz Chast',
      'Aleph-Bet: A Hebrew Alphabet Book by Michelle Edwards',
    ],
  },
  {
    id: 'sotw-v1-ch-14',
    title: 'The Assyrians',
    description: 'The fierce Assyrian empire — their military power, libraries, and eventual fall.',
    weekHint: 14,
    tier7Activity: {
      instructions: 'Read the chapter aloud. Have the child narrate who the Assyrians were and what made their army powerful. Color the activity-book map showing the Assyrian Empire. Write 3 sentences about what the great library of Nineveh tells us about the Assyrians.',
      materials: ['SOTW Vol 1 text', 'SOTW activity book map page', 'colored pencils', 'lined paper'],
      minutes: 30,
    },
    tier4Activity: {
      instructions: 'Listen to the chapter. Look at pictures of Assyrian lion hunt sculptures. Build a "fort" from couch cushions representing an Assyrian walled city.',
      materials: ['SOTW Vol 1 text or audiobook', 'couch cushions or blocks', 'SOTW activity book page', 'crayons'],
      minutes: 20,
    },
    bookList: [
      'A Picture Book of ancient Mesopotamia (request from library)',
      'Stories from the Silk Road by Cherry Gilchrist (covers later civilizations but useful for context)',
    ],
  },
  {
    id: 'sotw-v1-ch-15',
    title: 'The Persians',
    description: 'Cyrus the Great founds the Persian Empire; Persian tolerance and the Royal Road.',
    weekHint: 15,
    tier7Activity: {
      instructions: 'Read the chapter aloud. Have the child narrate who Cyrus was and how his rule differed from the Assyrians. Color the activity-book map of the Persian Empire. Write 3 sentences about how Cyrus\'s policy toward conquered peoples was unusual for ancient times.',
      materials: ['SOTW Vol 1 text', 'SOTW activity book map page', 'colored pencils', 'lined paper'],
      minutes: 30,
    },
    tier4Activity: {
      instructions: 'Listen to the chapter. Trace the Royal Road on the map with a finger. Pretend to be a Persian messenger running from one end of the road to the other delivering an important message.',
      materials: ['SOTW Vol 1 text or audiobook', 'SOTW activity book map page', 'crayons'],
      minutes: 20,
    },
    bookList: [
      'The Revenge of Ishtar by Ludmila Zeman',
      'Ancient Persia (picture book — request from library)',
    ],
  },
  {
    id: 'sotw-v1-ch-16',
    title: 'Cyrus the Great',
    description: 'Cyrus captures Babylon and frees the Hebrew captives — the Cyrus Cylinder and early human rights.',
    weekHint: 16,
    tier7Activity: {
      instructions: 'Read the chapter aloud. Have the child narrate the story of Cyrus capturing Babylon. Color the activity-book cylinder seal activity. Write 3 sentences explaining what the Cyrus Cylinder says and why historians consider it important.',
      materials: ['SOTW Vol 1 text', 'SOTW activity book page', 'colored pencils', 'lined paper'],
      minutes: 30,
    },
    tier4Activity: {
      instructions: 'Listen to the chapter. Roll a piece of clay or play-dough into a cylinder and press a simple design into it using a pencil eraser — just like a cylinder seal. Roll it across paper to leave the pattern.',
      materials: ['SOTW Vol 1 text or audiobook', 'play-dough or air-dry clay', 'pencil', 'plain paper'],
      minutes: 25,
    },
    bookList: [
      'Esther\'s Story by Diane Wolkstein',
      'The Queen of Persia (picture book about Esther — request from library)',
    ],
  },
  {
    id: 'sotw-v1-ch-17',
    title: 'Greece and the Greek Myths',
    description: 'Introduction to ancient Greece and the Greek pantheon of gods and goddesses.',
    weekHint: 17,
    tier7Activity: {
      instructions: 'Read the chapter aloud. Have the child narrate 2–3 Greek gods and their domains. Color the activity-book page of the Greek pantheon chart. Write 3 sentences describing why you think the Greeks invented stories about the gods.',
      materials: ['SOTW Vol 1 text', 'SOTW activity book page', 'colored pencils', 'lined paper'],
      minutes: 30,
    },
    tier4Activity: {
      instructions: 'Listen to the chapter. Look at pictures of Greek pottery and statues of the gods. Act out a short version of one myth, such as Persephone and the seasons.',
      materials: ['SOTW Vol 1 text or audiobook', 'SOTW activity book page', 'crayons'],
      minutes: 20,
    },
    bookList: [
      'D\'Aulaires\' Book of Greek Myths by Ingri and Edgar Parin d\'Aulaire',
      'Odysseus and the Cyclops retold by Geraldine McCaughrean',
    ],
    fieldTripLocation: 'Portland Art Museum — ancient Greek pottery and sculpture collection',
  },
  {
    id: 'sotw-v1-ch-18',
    title: 'The Trojan War',
    description: 'Helen of Troy, the Trojan Horse, and the legendary ten-year siege of Troy.',
    weekHint: 18,
    tier7Activity: {
      instructions: 'Read the chapter aloud. Have the child narrate the story of the Trojan War and the horse trick. Draw and color the Trojan Horse. Write 3 sentences about why the story of Troy has been retold for thousands of years.',
      materials: ['SOTW Vol 1 text', 'plain paper', 'colored pencils', 'lined paper'],
      minutes: 35,
    },
    tier4Activity: {
      instructions: 'Listen to the chapter. Build a Trojan Horse from blocks or a shoebox. Hide small figures inside and "send" it to the opposing city. Act out the soldiers jumping out.',
      materials: ['SOTW Vol 1 text or audiobook', 'shoebox or building blocks', 'small toy figures'],
      minutes: 25,
    },
    bookList: [
      'The Trojan Horse by Emily Little',
      'Black Ships Before Troy: The Story of the Iliad retold by Rosemary Sutcliff (upper range)',
    ],
  },
  {
    id: 'sotw-v1-ch-19',
    title: 'The Early Greeks',
    description: 'The rise of Greek city-states, the Olympics, and how the Greeks organized their society.',
    weekHint: 19,
    tier7Activity: {
      instructions: 'Read the chapter aloud. Have the child narrate what a city-state is and how the Greek Olympics began. Color the activity-book map of Greece marking major city-states. Write 3 sentences about the original Olympic events and how they compare to today.',
      materials: ['SOTW Vol 1 text', 'SOTW activity book map page', 'colored pencils', 'lined paper'],
      minutes: 30,
    },
    tier4Activity: {
      instructions: 'Listen to the chapter. Hold a mini-Olympics outdoors: running race, long jump (from a standing position), throwing a ball for distance. Award simple paper wreaths.',
      materials: ['SOTW Vol 1 text or audiobook', 'outdoor space', 'paper for wreaths', 'scissors', 'tape'],
      minutes: 30,
    },
    bookList: [
      'Atalanta\'s Race: A Greek Myth retold by Shirley Climo',
      'The God of Mischief: Loki\'s Story (substitute — use a book about Greek athletes, request from library)',
    ],
  },
  {
    id: 'sotw-v1-ch-20',
    title: 'Greece Gets Civilized Again',
    description: 'Greek culture flourishes after the Dark Ages — philosophy, theater, and the democratic experiment in Athens.',
    weekHint: 20,
    tier7Activity: {
      instructions: 'Read the chapter aloud. Have the child narrate what made Athens special compared to other ancient cities. Color the activity-book sketch of the Acropolis. Write 3 sentences about what democracy means and how it started in Athens.',
      materials: ['SOTW Vol 1 text', 'SOTW activity book page', 'colored pencils', 'lined paper'],
      minutes: 30,
    },
    tier4Activity: {
      instructions: 'Listen to the chapter. Put on a simple one-scene play together from a Greek myth. Discuss: who should get to decide the rules in your family — everyone or just one person?',
      materials: ['SOTW Vol 1 text or audiobook', 'simple costumes or scarves', 'SOTW activity book page', 'crayons'],
      minutes: 25,
    },
    bookList: [
      'Theseus and the Minotaur retold by Warwick Hutton',
      'The Marathon Mouse by Jeff Brown (request from library)',
    ],
  },
  {
    id: 'sotw-v1-ch-21',
    title: 'The Medes and Persians',
    description: 'How the Medes and Persians together created one of the largest empires of the ancient world.',
    weekHint: 21,
    tier7Activity: {
      instructions: 'Read the chapter aloud. Have the child narrate the rise of the Persian Empire under Darius. Color the activity-book map showing the empire\'s extent. Write 3 sentences comparing Persian rule to Assyrian rule.',
      materials: ['SOTW Vol 1 text', 'SOTW activity book map page', 'colored pencils', 'lined paper'],
      minutes: 30,
    },
    tier4Activity: {
      instructions: 'Listen to the chapter. Use blocks or toy figures to show two groups (Medes and Persians) joining together to become stronger. Color the empire map.',
      materials: ['SOTW Vol 1 text or audiobook', 'building blocks or toy figures', 'SOTW activity book map page', 'crayons'],
      minutes: 20,
    },
    bookList: [
      'The Persian Empire (history picture book — request from library)',
      'Alexander the Great by Demi (useful for upcoming chapters and broad context)',
    ],
  },
  {
    id: 'sotw-v1-ch-22',
    title: 'Sparta and Athens',
    description: 'Contrasting city-states: warrior Sparta vs. democratic Athens — two very different ways to organize a society.',
    weekHint: 22,
    tier7Activity: {
      instructions: 'Read the chapter aloud. Have the child narrate the key differences between Spartan and Athenian life. Create a T-chart comparing Sparta and Athens on paper. Write 3 sentences about which city-state you would prefer to live in and why.',
      materials: ['SOTW Vol 1 text', 'lined paper', 'pencil'],
      minutes: 30,
    },
    tier4Activity: {
      instructions: 'Listen to the chapter. Do a simple obstacle course outside (Spartan-style training). Then sit quietly and listen to a poem read aloud (Athens-style learning). Talk about which was harder.',
      materials: ['SOTW Vol 1 text or audiobook', 'outdoor space for obstacle course', 'a short poem to read aloud'],
      minutes: 25,
    },
    bookList: [
      'Going to School in Ancient Greece by Linda Honan',
      'Bully of Barkham Street by Mary Stolz (character study parallel — request library alternative about Greek city-states)',
    ],
  },
  {
    id: 'sotw-v1-ch-23',
    title: 'The Greek Gods',
    description: 'A deeper look at Greek religious practices, temples, oracles, and the role of gods in everyday life.',
    weekHint: 23,
    tier7Activity: {
      instructions: 'Read the chapter aloud. Have the child narrate how the Greeks honored their gods. Color the activity-book temple diagram. Write 3 sentences about the Oracle at Delphi and how Greek leaders used it.',
      materials: ['SOTW Vol 1 text', 'SOTW activity book page', 'colored pencils', 'lined paper'],
      minutes: 30,
    },
    tier4Activity: {
      instructions: 'Listen to the chapter. Draw your own simple temple on paper with columns. Retell your favorite Greek myth using toy figures as the gods.',
      materials: ['SOTW Vol 1 text or audiobook', 'plain paper', 'crayons', 'toy figures'],
      minutes: 20,
    },
    bookList: [
      'D\'Aulaires\' Book of Greek Myths by Ingri and Edgar Parin d\'Aulaire',
      'Pegasus retold by Marianna Mayer',
    ],
    fieldTripLocation: 'Portland Art Museum — Greek and Roman antiquities galleries',
  },
  {
    id: 'sotw-v1-ch-24',
    title: 'The Persian Wars',
    description: 'The battles of Marathon, Thermopylae, and Salamis — Greece holds off the Persian Empire.',
    weekHint: 24,
    tier7Activity: {
      instructions: 'Read the chapter aloud. Have the child narrate the sequence of the three major battles. Color the activity-book battle map. Write 3 sentences about why the Battle of Thermopylae has been remembered as heroic.',
      materials: ['SOTW Vol 1 text', 'SOTW activity book map page', 'colored pencils', 'lined paper'],
      minutes: 35,
    },
    tier4Activity: {
      instructions: 'Listen to the chapter. Use toy figures or building blocks to set up a simple battle scene showing a small force defending a narrow pass. Act out the stand at Thermopylae.',
      materials: ['SOTW Vol 1 text or audiobook', 'toy figures or blocks', 'SOTW activity book map page', 'crayons'],
      minutes: 25,
    },
    bookList: [
      'Leonidas: Hero of Thermopylae (picture book — request from library)',
      'Marathon Mouse by Jeff Brown (request from library for the Marathon battle connection)',
    ],
  },
  {
    id: 'sotw-v1-ch-25',
    title: 'Alexander the Great',
    description: 'Alexander of Macedon conquers most of the known world and spreads Greek culture.',
    weekHint: 25,
    tier7Activity: {
      instructions: 'Read the chapter aloud. Have the child narrate Alexander\'s conquests using the activity-book map. Trace the route of Alexander\'s army from Macedonia to India. Write 3 sentences about how Alexander changed the cultures of the places he conquered.',
      materials: ['SOTW Vol 1 text', 'SOTW activity book map page', 'colored pencils', 'lined paper'],
      minutes: 30,
    },
    tier4Activity: {
      instructions: 'Listen to the chapter. March with a toy horse or wooden horse on a stick across the room, "conquering" each piece of furniture as a new land. Color the map of Alexander\'s empire.',
      materials: ['SOTW Vol 1 text or audiobook', 'toy horse', 'SOTW activity book map page', 'crayons'],
      minutes: 20,
    },
    bookList: [
      'Alexander the Great by Demi',
      'The Man Who Was Poe by Avi (substitute — use a picture book biography of Alexander, request from library)',
    ],
  },
  {
    id: 'sotw-v1-ch-26',
    title: 'The Roman Republic',
    description: 'The founding of Rome, the Roman Republic, the Senate, and the story of Romulus and Remus.',
    weekHint: 26,
    tier7Activity: {
      instructions: 'Read the chapter aloud. Have the child narrate the founding myth of Rome and how the Republic was organized. Color the activity-book map of early Italy. Write 3 sentences comparing the Roman Senate to a modern governing body.',
      materials: ['SOTW Vol 1 text', 'SOTW activity book map page', 'colored pencils', 'lined paper'],
      minutes: 30,
    },
    tier4Activity: {
      instructions: 'Listen to the chapter. Act out the story of Romulus and Remus with toy figures. Build a simple "city" with blocks and decide on rules for it together.',
      materials: ['SOTW Vol 1 text or audiobook', 'toy figures', 'building blocks', 'SOTW activity book page', 'crayons'],
      minutes: 25,
    },
    bookList: [
      'The Roman Twins by Roy Gerrard',
      'Romulus and Remus retold by Diane Stortz',
    ],
  },
  {
    id: 'sotw-v1-ch-27',
    title: 'The Punic Wars',
    description: 'Rome vs. Carthage — Hannibal crosses the Alps with elephants, and Rome becomes a Mediterranean power.',
    weekHint: 27,
    tier7Activity: {
      instructions: 'Read the chapter aloud. Have the child narrate who Hannibal was and why crossing the Alps with elephants was so daring. Color the activity-book map of Hannibal\'s route. Write 3 sentences about why Rome ultimately won the Punic Wars.',
      materials: ['SOTW Vol 1 text', 'SOTW activity book map page', 'colored pencils', 'lined paper'],
      minutes: 30,
    },
    tier4Activity: {
      instructions: 'Listen to the chapter. Pretend to march toy elephants across a mountain range made from pillows. Roar like Hannibal\'s war elephants.',
      materials: ['SOTW Vol 1 text or audiobook', 'toy elephant figurines or stuffed animals', 'bed pillows for mountains', 'SOTW activity book page', 'crayons'],
      minutes: 25,
    },
    bookList: [
      'Hannibal by Mike Venezia (Getting to Know the World\'s Greatest series)',
      'Ancient Rome (DK Eyewitness — request from library)',
    ],
  },
  {
    id: 'sotw-v1-ch-28',
    title: 'The Rise of Julius Caesar',
    description: 'Julius Caesar rises to power, conquers Gaul, and begins to change the Roman Republic.',
    weekHint: 28,
    tier7Activity: {
      instructions: 'Read the chapter aloud. Have the child narrate the key events of Caesar\'s rise. Color the activity-book map of Caesar\'s Gallic campaigns. Write 3 sentences about how Caesar\'s ambition changed Rome.',
      materials: ['SOTW Vol 1 text', 'SOTW activity book map page', 'colored pencils', 'lined paper'],
      minutes: 30,
    },
    tier4Activity: {
      instructions: 'Listen to the chapter. Make a simple Roman wreath (paper crown with laurel leaf shapes cut out). Wear it while narrating the chapter back in your own words.',
      materials: ['SOTW Vol 1 text or audiobook', 'green paper', 'scissors', 'tape', 'SOTW activity book page', 'crayons'],
      minutes: 20,
    },
    bookList: [
      'Julius Caesar: Roman General and Statesman by Mike Venezia',
      'Caesar\'s Story by Mary Pope Osborne (Magic Tree House research guide series)',
    ],
  },
  {
    id: 'sotw-v1-ch-29',
    title: 'Caesar the Hero',
    description: 'Caesar crosses the Rubicon, wins a civil war, and becomes dictator of Rome.',
    weekHint: 29,
    tier7Activity: {
      instructions: 'Read the chapter aloud. Have the child narrate what "crossing the Rubicon" meant and what happened to the Roman Republic. Write 3 sentences about why Caesar\'s crossing the Rubicon was a point of no return.',
      materials: ['SOTW Vol 1 text', 'lined paper', 'pencil'],
      minutes: 30,
    },
    tier4Activity: {
      instructions: 'Listen to the chapter. Draw a river on the floor using tape or a blue towel. Have the child stand on one side, pause, then dramatically cross it — just like Caesar\'s famous moment of decision.',
      materials: ['SOTW Vol 1 text or audiobook', 'blue tape or blue towel', 'SOTW activity book page', 'crayons'],
      minutes: 20,
    },
    bookList: [
      'The Ides of March (picture book introduction to Caesar — request from library)',
      'Ancient Rome and Pompeii by Mary Pope Osborne',
    ],
  },
  {
    id: 'sotw-v1-ch-30',
    title: 'The First Roman Emperor',
    description: 'Augustus Caesar becomes Rome\'s first emperor, ending the Republic and beginning the Roman Empire.',
    weekHint: 30,
    tier7Activity: {
      instructions: 'Read the chapter aloud. Have the child narrate how Augustus came to power and how the Empire differed from the Republic. Color the activity-book map of the Roman Empire at its greatest extent. Write 3 sentences about how Augustus kept the appearance of the Republic while actually ruling as an emperor.',
      materials: ['SOTW Vol 1 text', 'SOTW activity book map page', 'colored pencils', 'lined paper'],
      minutes: 30,
    },
    tier4Activity: {
      instructions: 'Listen to the chapter. Look at a coin or image of a coin with a leader\'s face. Draw your own "Roman coin" on paper using a pencil eraser circle as a template, and put a face profile on it.',
      materials: ['SOTW Vol 1 text or audiobook', 'plain paper', 'pencil', 'real coin for reference', 'crayons'],
      minutes: 20,
    },
    bookList: [
      'Augustus Caesar\'s World by Genevieve Foster',
      'Ancient Rome by Simon James (DK Reader)',
    ],
  },
  {
    id: 'sotw-v1-ch-31',
    title: 'The Coming of Christ',
    description: 'The birth of Jesus of Nazareth in Judea during the reign of Augustus Caesar.',
    weekHint: 31,
    tier7Activity: {
      instructions: 'Read the chapter aloud. Have the child narrate the historical context — where and when Jesus was born, and what the Roman Empire was like at the time. Color the activity-book map of Judea. Write 3 sentences connecting the birth of Jesus to events covered in earlier chapters.',
      materials: ['SOTW Vol 1 text', 'SOTW activity book map page', 'colored pencils', 'lined paper'],
      minutes: 30,
    },
    tier4Activity: {
      instructions: 'Listen to the chapter. Color the Judea map and retell the Christmas story in your own words using a nativity set or simple toy figures.',
      materials: ['SOTW Vol 1 text or audiobook', 'SOTW activity book map page', 'crayons', 'nativity set or small figures'],
      minutes: 20,
    },
    bookList: [
      'The Christmas Story retold by Jane Ray',
      'Miriam by Tomie dePaola',
    ],
  },
  {
    id: 'sotw-v1-ch-32',
    title: 'The Roman Empire',
    description: 'Life under Roman rule — Pax Romana, Roman roads, aqueducts, and engineering.',
    weekHint: 32,
    tier7Activity: {
      instructions: 'Read the chapter aloud. Have the child narrate what made the Pax Romana possible and what Roman engineering achievements looked like. Color the activity-book aqueduct diagram. Write 3 sentences about how Roman roads and aqueducts improved life for people in the Empire.',
      materials: ['SOTW Vol 1 text', 'SOTW activity book page', 'colored pencils', 'lined paper'],
      minutes: 30,
    },
    tier4Activity: {
      instructions: 'Listen to the chapter. Build a simple aqueduct model using cardboard tubes or paper towel rolls. Tilt them so water flows from one end to the other into a cup.',
      materials: ['SOTW Vol 1 text or audiobook', 'cardboard tubes or paper towel rolls', 'cup', 'small pitcher of water', 'towels for cleanup'],
      minutes: 30,
    },
    bookList: [
      'The Roman Colosseum by Lesley Sims (Usborne)',
      'City: A Story of Roman Planning and Construction by David Macaulay',
    ],
  },
  {
    id: 'sotw-v1-ch-33',
    title: 'Rome and the Christians',
    description: 'How Christianity spread through the Roman Empire and the persecution of early Christians.',
    weekHint: 33,
    tier7Activity: {
      instructions: 'Read the chapter aloud. Have the child narrate why Roman leaders were suspicious of Christians and how the faith spread anyway. Color the activity-book map of Paul\'s missionary journeys. Write 3 sentences about what made early Christians willing to face persecution.',
      materials: ['SOTW Vol 1 text', 'SOTW activity book map page', 'colored pencils', 'lined paper'],
      minutes: 30,
    },
    tier4Activity: {
      instructions: 'Listen to the chapter. Color the map of Paul\'s travels. Talk about one belief you hold so strongly you would not give it up no matter what.',
      materials: ['SOTW Vol 1 text or audiobook', 'SOTW activity book map page', 'crayons'],
      minutes: 20,
    },
    bookList: [
      'Paul: Apostle of the Heart Set Free (adapted children\'s version — request from library)',
      'The Lion, the Witch and the Wardrobe by C.S. Lewis (read-aloud companion for Christian themes)',
    ],
  },
  {
    id: 'sotw-v1-ch-34',
    title: 'Rome Begins to Weaken',
    description: 'The Roman Empire faces invasions, political corruption, and the division into East and West.',
    weekHint: 34,
    tier7Activity: {
      instructions: 'Read the chapter aloud. Have the child narrate the main reasons Rome began to weaken. Color the activity-book map showing the division of the empire. Write 3 sentences about which cause of Rome\'s decline you think was most serious.',
      materials: ['SOTW Vol 1 text', 'SOTW activity book map page', 'colored pencils', 'lined paper'],
      minutes: 30,
    },
    tier4Activity: {
      instructions: 'Listen to the chapter. Build a block tower together, then add one block at a time to one side until it tips — showing how an empire can be weaker on the edges. Talk about what makes things fall apart.',
      materials: ['SOTW Vol 1 text or audiobook', 'building blocks', 'SOTW activity book page', 'crayons'],
      minutes: 20,
    },
    bookList: [
      'DK Eyewitness: Ancient Rome (request from library)',
      'The Usborne History of Rome by Susan Peach and Anne Millard',
    ],
  },
  {
    id: 'sotw-v1-ch-35',
    title: 'The Attacking Barbarians',
    description: 'Germanic tribes — Goths, Visigoths, and Vandals — press against Roman borders and eventually sack Rome.',
    weekHint: 35,
    tier7Activity: {
      instructions: 'Read the chapter aloud. Have the child narrate who the "barbarians" were and why the Romans called them that. Color the activity-book map showing the migration routes of the Germanic tribes. Write 3 sentences about what the word "barbarian" tells us about how Romans viewed outsiders.',
      materials: ['SOTW Vol 1 text', 'SOTW activity book map page', 'colored pencils', 'lined paper'],
      minutes: 30,
    },
    tier4Activity: {
      instructions: 'Listen to the chapter. Build a block "city of Rome" and use a toy figure army to knock it over. Talk about how it feels when something you built gets knocked down.',
      materials: ['SOTW Vol 1 text or audiobook', 'building blocks', 'toy figures', 'SOTW activity book page', 'crayons'],
      minutes: 20,
    },
    bookList: [
      'The Gothic War by Torsten Cumberland Jacobsen (simplified — request from library an illustrated book about the fall of Rome)',
      'Julius Caesar and the Romans by Demi',
    ],
  },
  {
    id: 'sotw-v1-ch-36',
    title: 'The Celts of Britain',
    description: 'Who the Celts were, their druid traditions, and Roman Britain.',
    weekHint: 36,
    tier7Activity: {
      instructions: 'Read the chapter aloud. Have the child narrate who the Celts were and what the druids did. Color the activity-book Celtic knotwork design. Write 3 sentences about how the Romans changed Britain when they invaded.',
      materials: ['SOTW Vol 1 text', 'SOTW activity book Celtic design page', 'colored pencils', 'lined paper'],
      minutes: 30,
    },
    tier4Activity: {
      instructions: 'Listen to the chapter. Practice drawing a simple Celtic knotwork pattern by weaving over and under lines. Look at images of actual Celtic jewelry or illuminated manuscripts.',
      materials: ['SOTW Vol 1 text or audiobook', 'plain paper', 'pencil', 'crayons or colored pencils'],
      minutes: 25,
    },
    bookList: [
      'Celtic Tales: Fairy Tales and Stories of Enchantment from Ireland, Scotland, Brittany, and Wales edited by Kate Forrester',
      'Finn Mac Cool and the Salmon of Knowledge by Una Leavy',
    ],
  },
  {
    id: 'sotw-v1-ch-37',
    title: 'The Far East: Ancient China',
    description: 'The rise of Chinese civilization, the first dynasties, silk production, and the Great Wall.',
    weekHint: 37,
    tier7Activity: {
      instructions: 'Read the chapter aloud. Have the child narrate what made ancient China distinctive — writing, silk, and the Great Wall. Color the activity-book map of ancient China and label the major rivers. Write 3 sentences about why the Chinese built the Great Wall.',
      materials: ['SOTW Vol 1 text', 'SOTW activity book map page', 'colored pencils', 'lined paper'],
      minutes: 30,
    },
    tier4Activity: {
      instructions: 'Listen to the chapter. Examine a piece of silk fabric together and feel how smooth it is. Trace a simple Chinese character on paper. Color the map of ancient China.',
      materials: ['SOTW Vol 1 text or audiobook', 'piece of silk fabric (or silk-like fabric)', 'SOTW activity book map page', 'crayons', 'plain paper'],
      minutes: 25,
    },
    bookList: [
      'The Silk Princess by Charles Santore',
      'Lon Po Po: A Red-Riding Hood Story from China by Ed Young',
    ],
    fieldTripLocation: 'Portland Art Museum — Asian art collection including Chinese pieces',
  },
  {
    id: 'sotw-v1-ch-38',
    title: 'Confucius',
    description: 'Confucius, his teachings about respect and right relationships, and his lasting influence on Chinese society.',
    weekHint: 38,
    tier7Activity: {
      instructions: 'Read the chapter aloud. Have the child narrate who Confucius was and what he taught. Copy and illustrate one saying of Confucius from the activity book. Write 3 sentences about how Confucius\'s ideas are different from or similar to your family\'s values.',
      materials: ['SOTW Vol 1 text', 'SOTW activity book page', 'pencil', 'colored pencils', 'lined paper'],
      minutes: 30,
    },
    tier4Activity: {
      instructions: 'Listen to the chapter. Choose one saying of Confucius and act out what it would look like to follow that teaching. For example: "What you do not want done to yourself, do not do to others."',
      materials: ['SOTW Vol 1 text or audiobook', 'SOTW activity book page', 'crayons'],
      minutes: 20,
    },
    bookList: [
      'Confucius: The Golden Rule by Russell Freedman',
      'The Empty Pot by Demi',
    ],
  },
  {
    id: 'sotw-v1-ch-39',
    title: 'The Indian Kingdoms',
    description: 'Early Indian civilization along the Indus River, the caste system, Hindu beliefs, and Ashoka.',
    weekHint: 39,
    tier7Activity: {
      instructions: 'Read the chapter aloud. Have the child narrate the Indus Valley civilization and what Ashoka did to change his kingdom. Color the activity-book map of ancient India and the Indus River valley. Write 3 sentences about why Ashoka\'s change of heart after battle was significant.',
      materials: ['SOTW Vol 1 text', 'SOTW activity book map page', 'colored pencils', 'lined paper'],
      minutes: 30,
    },
    tier4Activity: {
      instructions: 'Listen to the chapter. Look at pictures of Indian architecture and art. Use play-dough to make a simple elephant, an important animal in Indian culture.',
      materials: ['SOTW Vol 1 text or audiobook', 'play-dough', 'SOTW activity book map page', 'crayons'],
      minutes: 25,
    },
    bookList: [
      'Ashoka the Great: Grandfather of the Constitution by Subhadra Sen Gupta',
      'Rama and the Demon King: An Ancient Tale from India retold by Jessica Souhami',
    ],
  },
  {
    id: 'sotw-v1-ch-40',
    title: 'Buddhism',
    description: 'Prince Siddhartha becomes the Buddha; Buddhist teaching spreads from India across Asia.',
    weekHint: 40,
    tier7Activity: {
      instructions: 'Read the chapter aloud. Have the child narrate the life of the Buddha and the Four Noble Truths in simple terms. Color the activity-book map of Buddhism\'s spread. Write 3 sentences about what the Buddha taught about suffering and how to end it.',
      materials: ['SOTW Vol 1 text', 'SOTW activity book map page', 'colored pencils', 'lined paper'],
      minutes: 30,
    },
    tier4Activity: {
      instructions: 'Listen to the chapter. Sit quietly together for two minutes — discuss what you notice when you sit still and breathe. Color the lotus flower on the activity-book page.',
      materials: ['SOTW Vol 1 text or audiobook', 'SOTW activity book page', 'crayons', 'timer'],
      minutes: 20,
    },
    bookList: [
      'The Banyan Tree Wish by Varsha Bajaj',
      'Siddhartha by Herman Hesse (parent background reading; illustrated children\'s retelling — request from library)',
    ],
  },
  {
    id: 'sotw-v1-ch-41',
    title: 'The African Continent',
    description: 'Ancient African kingdoms — Kush, Axum, and the diversity of peoples across the continent.',
    weekHint: 41,
    tier7Activity: {
      instructions: 'Read the chapter aloud. Have the child narrate what kingdoms existed in ancient Africa and where they were located. Color the activity-book map marking Kush and Axum. Write 3 sentences about what historians know about ancient African kingdoms and what we are still learning.',
      materials: ['SOTW Vol 1 text', 'SOTW activity book map page', 'colored pencils', 'lined paper'],
      minutes: 30,
    },
    tier4Activity: {
      instructions: 'Listen to the chapter. Look at pictures of ancient African art and architecture from Kush or Axum. Color the African map together and practice saying the names of the kingdoms.',
      materials: ['SOTW Vol 1 text or audiobook', 'SOTW activity book map page', 'crayons'],
      minutes: 20,
    },
    bookList: [
      'Mufaro\'s Beautiful Daughters by John Steptoe',
      'The Cow-Tail Switch and Other West African Stories by Harold Courlander',
    ],
    fieldTripLocation: 'Oregon Historical Society, Portland — world cultures exhibits',
  },
  {
    id: 'sotw-v1-ch-42',
    title: 'The First Americans',
    description: 'The earliest peoples of the Americas — migration across the land bridge, early civilizations in Mesoamerica.',
    weekHint: 42,
    tier7Activity: {
      instructions: 'Read the chapter aloud. Have the child narrate how people came to the Americas and what early settlements looked like. Color the activity-book map tracing the migration route from Asia to America. Write 3 sentences comparing early American peoples to early peoples in other parts of the world covered this year.',
      materials: ['SOTW Vol 1 text', 'SOTW activity book map page', 'colored pencils', 'lined paper'],
      minutes: 35,
    },
    tier4Activity: {
      instructions: 'Listen to the chapter. Walk across a "land bridge" made from a strip of brown paper taped to the floor. Carry a small bundle as if traveling with everything you own. Color the map.',
      materials: ['SOTW Vol 1 text or audiobook', 'brown paper or kraft paper for land bridge', 'tape', 'small cloth bundle', 'SOTW activity book map page', 'crayons'],
      minutes: 25,
    },
    bookList: [
      'The Mud Pony: A Traditional Skidi Pawnee Tale retold by Caron Lee Cohen',
      'Arrow to the Sun: A Pueblo Indian Tale by Gerald McDermott',
    ],
    fieldTripLocation: 'Oregon Historical Society, Portland — Oregon\'s Native peoples and early Americas exhibits',
  },
];
