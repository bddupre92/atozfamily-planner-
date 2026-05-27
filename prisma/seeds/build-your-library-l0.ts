import { PrismaClient, ResourceType, Subject } from '@prisma/client';

type ResourceInput = {
  id: string;
  title: string;
  bookTitle: string;
  description: string;
  weekHint: number;
  termIds: string[];
  tier4Activity: { instructions: string; materials: string[]; minutes: number };
};

const TERM_IDS_ALL = ['summer-2026', 'fall-2026', 'spring-2027', 'summer-2027'];

async function upsertResource(prisma: PrismaClient, r: ResourceInput) {
  const fixed = {
    framework: 'BYL Level 0',
    subject: Subject.HISTORY,
    type: ResourceType.BOOK,
    ageRange: '4-6',
    season: 'any',
    tags: ['picture-book', 'tier-4-supplement', 'multi-age'],
    active: true,
  };
  await prisma.curriculumResource.upsert({
    where: { id: r.id },
    update: {
      ...fixed,
      title: r.title,
      description: r.description,
      weekHint: r.weekHint,
      termIds: r.termIds,
      bookList: [r.bookTitle],
      activities: { tier4: r.tier4Activity },
      materials: r.tier4Activity.materials,
      sourceUrl: 'https://buildyourlibrary.com/purchase-level-0-curriculum/',
    },
    create: {
      id: r.id,
      ...fixed,
      title: r.title,
      description: r.description,
      weekHint: r.weekHint,
      termIds: r.termIds,
      bookList: [r.bookTitle],
      activities: { tier4: r.tier4Activity },
      materials: r.tier4Activity.materials,
      sourceUrl: 'https://buildyourlibrary.com/purchase-level-0-curriculum/',
    },
  });
}

export async function seedBuildYourLibraryL0(prisma: PrismaClient) {
  for (const r of BYL_L0_PICKS) {
    await upsertResource(prisma, r);
  }
  console.log(`  • BYL Level 0: ${BYL_L0_PICKS.length} supplements seeded`);
}

// ============================================================================
// BYL Level 0 — Around the World picture-book supplements (~30)
// All titles verified against the official Goodreads BYL Level 0 list
// (https://www.goodreads.com/list/show/201682.Build_Your_Library_Level_0)
// and cross-checked with Washington County Library BiblioCommons community list.
// Additional titles verified by ISBN via Amazon/BN/Chronicle Books.
//
// Topic groups:
//   Continents intro  (wk 1-5)
//   Africa            (wk 6-9)
//   Asia              (wk 10-14)
//   Europe            (wk 15-18)
//   North America     (wk 19-22)
//   South America     (wk 23-25)
//   Australia         (wk 26-27)
//   Antarctica/Polar  (wk 28-29)
//   Oceans/Animals    (wk 30-33)
// ============================================================================

const BYL_L0_PICKS: ResourceInput[] = [
  // ── CONTINENTS INTRO (wk 1-5) ───────────────────────────────────────────

  {
    id: 'byl-l0-me-on-the-map',
    title: 'Me on the Map — Continents Intro',
    bookTitle: 'Me on the Map by Joan Sweeney',
    description:
      'A child zooms out from her bedroom to her street to her country to the world map, building spatial sense from the personal to the global.',
    weekHint: 1,
    termIds: TERM_IDS_ALL,
    tier4Activity: {
      instructions:
        'Read aloud together. Pause at each page and find the matching scale on a globe or wall map. Draw your own "zoom-out" strip: your room → your house → your street → a world map.',
      materials: ['globe or wall map', 'plain paper', 'crayons'],
      minutes: 20,
    },
  },
  {
    id: 'byl-l0-children-just-like-me',
    title: 'Children Just Like Me — Kids Around the World',
    bookTitle: 'Children Just Like Me: A New Celebration of Children Around the World by Barnabas Kindersley and Anabel Kindersley',
    description:
      'Photo-portraits of real children from 30+ countries show how kids live, eat, play, and learn across every continent.',
    weekHint: 2,
    termIds: TERM_IDS_ALL,
    tier4Activity: {
      instructions:
        'Choose one child from the book who lives on a different continent. Find that country on the globe. Draw what that child eats for breakfast compared to what you eat.',
      materials: ['globe', 'plain paper', 'crayons'],
      minutes: 20,
    },
  },
  {
    id: 'byl-l0-this-is-how-we-do-it',
    title: 'This Is How We Do It — One Day Around the World',
    bookTitle: 'This Is How We Do It: One Day in the Lives of Seven Kids from Around the World by Matt Lamothe',
    description:
      'Seven real children from Italy, Japan, Iran, India, Peru, Uganda, and Russia each narrate a single day — school, food, play, bedtime — in parallel panels.',
    weekHint: 3,
    termIds: TERM_IDS_ALL,
    tier4Activity: {
      instructions:
        'Read a double-page spread, pausing to find each country on the globe. Pick one child and act out their morning routine. Color the flag of one country shown.',
      materials: ['globe', 'plain paper', 'crayons', 'printed flag outline (optional)'],
      minutes: 25,
    },
  },
  {
    id: 'byl-l0-on-the-same-day-in-march',
    title: 'On the Same Day in March — World Weather Tour',
    bookTitle: 'On the Same Day in March: A Tour of the World\'s Weather by Marilyn Singer',
    description:
      'A single date on the calendar reveals wildly different weather happening simultaneously in 17 countries, from blizzards in Canada to monsoons in India.',
    weekHint: 4,
    termIds: TERM_IDS_ALL,
    tier4Activity: {
      instructions:
        'Read two or three pages, then find each location on the globe. Draw a split picture: one side shows your weather today, the other shows a weather scene from the book.',
      materials: ['globe', 'plain paper', 'crayons'],
      minutes: 20,
    },
  },
  {
    id: 'byl-l0-how-to-make-apple-pie',
    title: 'How to Make an Apple Pie and See the World',
    bookTitle: 'How to Make an Apple Pie and See the World by Marjorie Priceman',
    description:
      'A girl travels to Italy, France, England, Sri Lanka, Jamaica, and Vermont to gather ingredients for an apple pie, visiting each continent along the way.',
    weekHint: 5,
    termIds: TERM_IDS_ALL,
    tier4Activity: {
      instructions:
        'Follow the girl on the globe as she visits each country. Help make (or pretend to make) a simple apple pie — talk about where each ingredient might come from. Color a simple world map and mark her route.',
      materials: ['globe', 'plain paper', 'crayons', 'apple pie ingredients (optional)'],
      minutes: 25,
    },
  },

  // ── AFRICA (wk 6-9) ─────────────────────────────────────────────────────

  {
    id: 'byl-l0-africa-is-not-a-country',
    title: 'Africa Is Not a Country — Africa Intro',
    bookTitle: 'Africa Is Not a Country by Margy Burns Knight',
    description:
      'A vibrant introduction to the diversity of Africa, showing children from many different countries, languages, foods, and celebrations across the continent.',
    weekHint: 6,
    termIds: TERM_IDS_ALL,
    tier4Activity: {
      instructions:
        'Find Africa on the globe. Count how many countries the book shows. Point to each one on the globe. Color the African continent on a blank world map.',
      materials: ['globe', 'blank world map outline', 'crayons'],
      minutes: 20,
    },
  },
  {
    id: 'byl-l0-jambo-means-hello',
    title: 'Jambo Means Hello — Swahili Alphabet',
    bookTitle: 'Jambo Means Hello: Swahili Alphabet Book by Muriel Feelings',
    description:
      'Each letter of the Swahili alphabet introduces a word from East African daily life, illustrated with detailed scenes of village and family.',
    weekHint: 7,
    termIds: TERM_IDS_ALL,
    tier4Activity: {
      instructions:
        'Read through the book and practice saying each Swahili word aloud. Find East Africa on the globe. Draw one scene from the book and label it with the Swahili word.',
      materials: ['globe', 'plain paper', 'crayons'],
      minutes: 20,
    },
  },
  {
    id: 'byl-l0-why-mosquitoes-buzz',
    title: 'Why Mosquitoes Buzz in People\'s Ears — West African Folktale',
    bookTitle: 'Why Mosquitoes Buzz in People\'s Ears: A West African Tale by Verna Aardema',
    description:
      'A 1976 Caldecott Medal–winning cumulative folktale from West Africa explains the origin of the mosquito\'s annoying buzz through a chain of jungle misunderstandings.',
    weekHint: 8,
    termIds: TERM_IDS_ALL,
    tier4Activity: {
      instructions:
        'Read the story dramatically, building up the cumulative chain. Act it out with stuffed animals playing each animal. Find West Africa on the globe and point to it.',
      materials: ['globe', 'stuffed animals for each jungle creature'],
      minutes: 25,
    },
  },
  {
    id: 'byl-l0-mufaro-beautiful-daughters',
    title: 'Mufaro\'s Beautiful Daughters — African Folktale',
    bookTitle: 'Mufaro\'s Beautiful Daughters: An African Tale by John Steptoe',
    description:
      'A Caldecott Honor–winning retelling of a Zimbabwean Cinderella story about two sisters — one kind, one selfish — who both seek to marry the king.',
    weekHint: 9,
    termIds: TERM_IDS_ALL,
    tier4Activity: {
      instructions:
        'Read the story aloud. Find Zimbabwe on the globe. Draw Manyara and Nyasha side by side and write or dictate one word that describes each. Talk about why kindness mattered in the story.',
      materials: ['globe', 'plain paper', 'crayons'],
      minutes: 20,
    },
  },

  // ── ASIA (wk 10-14) ─────────────────────────────────────────────────────

  {
    id: 'byl-l0-year-of-the-dog',
    title: 'The Year of the Dog — China/Taiwan',
    bookTitle: 'The Year of the Dog by Grace Lin',
    description:
      'Based on her own childhood, Grace Lin tells the story of a Taiwanese-American girl navigating two cultures during the Chinese Year of the Dog.',
    weekHint: 10,
    termIds: TERM_IDS_ALL,
    tier4Activity: {
      instructions:
        'Read a chapter together. Find Taiwan and China on the globe. Look up what Chinese zodiac year you were born in. Draw your zodiac animal.',
      materials: ['globe', 'plain paper', 'crayons'],
      minutes: 20,
    },
  },
  {
    id: 'byl-l0-grandfathers-journey',
    title: 'Grandfather\'s Journey — Japan and America',
    bookTitle: 'Grandfather\'s Journey by Allen Say',
    description:
      'A 1994 Caldecott Medal–winning memoir picture book about Allen Say\'s grandfather, who loved both Japan and America and spent his life longing for whichever one he was not in.',
    weekHint: 11,
    termIds: TERM_IDS_ALL,
    tier4Activity: {
      instructions:
        'Read the story. Find Japan and the United States on the globe and measure the distance with your hand. Draw a boat traveling across the Pacific Ocean. Talk about a time you missed somewhere or someone.',
      materials: ['globe', 'plain paper', 'crayons'],
      minutes: 25,
    },
  },
  {
    id: 'byl-l0-malala-magic-pencil',
    title: 'Malala\'s Magic Pencil — Pakistan',
    bookTitle: 'Malala\'s Magic Pencil by Malala Yousafzai',
    description:
      'Nobel Peace Prize winner Malala Yousafzai tells her own story of growing up in Pakistan, wishing for a magic pencil to fix the world\'s problems, and finding courage to fight for girls\' education.',
    weekHint: 12,
    termIds: TERM_IDS_ALL,
    tier4Activity: {
      instructions:
        'Read the book together. Find Pakistan on the globe. Draw your own "magic pencil" picture: what would you fix in the world if you had one? Discuss what made Malala brave.',
      materials: ['globe', 'plain paper', 'crayons'],
      minutes: 20,
    },
  },
  {
    id: 'byl-l0-mela-and-the-elephant',
    title: 'Mela and the Elephant — India',
    bookTitle: 'Mela and the Elephant by Dow Phumiruk',
    description:
      'A young Thai girl named Mela develops a compassionate friendship with a working elephant, set against lush Asian jungle scenery.',
    weekHint: 13,
    termIds: TERM_IDS_ALL,
    tier4Activity: {
      instructions:
        'Read the story. Find Thailand on the globe. Draw an elephant and label its trunk, tusks, ears, and tail. Talk about why elephants are important in Asian cultures.',
      materials: ['globe', 'plain paper', 'crayons'],
      minutes: 20,
    },
  },
  {
    id: 'byl-l0-storyteller-morocco',
    title: 'The Storyteller — Morocco',
    bookTitle: 'The Storyteller by Evan Turk',
    description:
      'In a drought-stricken Moroccan city, an old storyteller\'s tales bring water back to the land — a lyrical picture book about the power of stories in North African culture.',
    weekHint: 14,
    termIds: TERM_IDS_ALL,
    tier4Activity: {
      instructions:
        'Read the book. Find Morocco on the globe. Look at the geometric tile patterns in the illustrations and try drawing your own simple tile pattern. Talk about why stories can be like water.',
      materials: ['globe', 'plain paper', 'crayons or colored pencils'],
      minutes: 25,
    },
  },

  // ── EUROPE (wk 15-18) ───────────────────────────────────────────────────

  {
    id: 'byl-l0-linnea-in-monets-garden',
    title: 'Linnea in Monet\'s Garden — France',
    bookTitle: 'Linnea in Monet\'s Garden by Christina Björk',
    description:
      'Swedish girl Linnea visits Claude Monet\'s famous garden at Giverny in France, learning about Impressionist painting through real photographs and illustrations.',
    weekHint: 15,
    termIds: TERM_IDS_ALL,
    tier4Activity: {
      instructions:
        'Read the book. Find France on the globe. Look at a real Monet print together (use a book or search online with a parent). Try painting a simple impressionist flower using a brush and dabbing instead of outlining.',
      materials: ['globe', 'watercolor paint', 'paintbrush', 'paper', 'Monet print for reference (optional)'],
      minutes: 30,
    },
  },
  {
    id: 'byl-l0-children-of-noisy-village',
    title: 'The Children of Noisy Village — Sweden',
    bookTitle: 'The Children of Noisy Village by Astrid Lindgren',
    description:
      'Six children in a cozy Swedish village share the adventures of everyday farm life through the four seasons in this gentle chapter book by the author of Pippi Longstocking.',
    weekHint: 16,
    termIds: TERM_IDS_ALL,
    tier4Activity: {
      instructions:
        'Read one chapter together. Find Sweden on the globe. Draw the six children\'s farm in winter with snow, pine trees, and a red barn. Talk about how a Swedish farm is similar to or different from where you live.',
      materials: ['globe', 'plain paper', 'crayons'],
      minutes: 20,
    },
  },
  {
    id: 'byl-l0-the-mitten',
    title: 'The Mitten — Ukraine',
    bookTitle: 'The Mitten by Jan Brett',
    description:
      'A boy drops his white mitten in the snow and one by one the forest animals of Ukraine squeeze inside it, in Jan Brett\'s signature richly detailed folk-art illustrations.',
    weekHint: 17,
    termIds: TERM_IDS_ALL,
    tier4Activity: {
      instructions:
        'Read the book. Find Ukraine on the globe. Retell the story in order using stuffed animals or finger puppets. Draw the mitten stuffed with all the animals stacked up inside it.',
      materials: ['globe', 'stuffed animals or finger puppets', 'plain paper', 'crayons'],
      minutes: 25,
    },
  },
  {
    id: 'byl-l0-cat-walked-across-france',
    title: 'The Cat Who Walked Across France — France',
    bookTitle: 'The Cat Who Walked Across France by Kate Banks',
    description:
      'After his old owner dies, a cat treks across the beautiful landscapes of southern France searching for his true home, passing lavender fields, vineyards, and medieval villages.',
    weekHint: 18,
    termIds: TERM_IDS_ALL,
    tier4Activity: {
      instructions:
        'Read the story. Find France on the globe and trace the path from southern France north with your finger. Draw the cat walking through one of the landscapes — lavender fields, a vineyard, or a stone village.',
      materials: ['globe', 'plain paper', 'crayons'],
      minutes: 20,
    },
  },

  // ── NORTH AMERICA (wk 19-22) ─────────────────────────────────────────────

  {
    id: 'byl-l0-thirteen-moons-turtles-back',
    title: 'Thirteen Moons on Turtle\'s Back — Native North America',
    bookTitle: 'Thirteen Moons on Turtle\'s Back: A Native American Year of Moons by Joseph Bruchac and Jonathan London',
    description:
      'Thirteen poems — one for each moon — drawn from thirteen different Native nations map the North American year of seasons, animals, and sky through Indigenous voices.',
    weekHint: 19,
    termIds: TERM_IDS_ALL,
    tier4Activity: {
      instructions:
        'Read the poem for the current month\'s moon. Find North America on the globe. Draw a turtle and count 13 segments on its shell — one for each moon poem. Talk about the seasons in each poem.',
      materials: ['globe', 'plain paper', 'crayons'],
      minutes: 20,
    },
  },
  {
    id: 'byl-l0-a-boy-called-slow',
    title: 'A Boy Called Slow — Lakota Nation',
    bookTitle: 'A Boy Called Slow: The True Story of Sitting Bull by Joseph Bruchac',
    description:
      'The true story of the young Lakota boy who was named Slow and grew up to become Sitting Bull, one of the most celebrated leaders of the Plains Nations.',
    weekHint: 20,
    termIds: TERM_IDS_ALL,
    tier4Activity: {
      instructions:
        'Read the book. Find the Great Plains on the globe or map. Draw young Slow on horseback. Talk about how names can tell a story — what would your name mean if it described you as a baby?',
      materials: ['globe or US map', 'plain paper', 'crayons'],
      minutes: 20,
    },
  },
  {
    id: 'byl-l0-carson-crosses-canada',
    title: 'Carson Crosses Canada — Canada',
    bookTitle: 'Carson Crosses Canada by Linda Bailey',
    description:
      'A small dog named Carson travels from coast to coast across Canada on the Trans-Canada Highway, learning the provinces, landscapes, and animals of the country along the way.',
    weekHint: 21,
    termIds: TERM_IDS_ALL,
    tier4Activity: {
      instructions:
        'Read the story. Find Canada on the globe and trace across it from the Atlantic to the Pacific with your finger. Draw Carson in one of the landscapes — mountains, prairies, or Maritime shores.',
      materials: ['globe', 'plain paper', 'crayons'],
      minutes: 20,
    },
  },
  {
    id: 'byl-l0-dear-primo',
    title: 'Dear Primo — Mexico / US',
    bookTitle: 'Dear Primo: A Letter to My Cousin by Duncan Tonatiuh',
    description:
      'Two cousins — one in Mexico, one in New York — exchange letters about their very different but surprisingly similar everyday lives, illustrated in Tonatiuh\'s distinctive Mixtec-inspired style.',
    weekHint: 22,
    termIds: TERM_IDS_ALL,
    tier4Activity: {
      instructions:
        'Read the book. Find Mexico and the United States on the globe. Dictate or write a short letter to an imaginary cousin in another country. Draw one thing about your day to include.',
      materials: ['globe', 'plain paper', 'crayons', 'pencil or pen'],
      minutes: 25,
    },
  },

  // ── SOUTH AMERICA (wk 23-25) ─────────────────────────────────────────────

  {
    id: 'byl-l0-great-kapok-tree',
    title: 'The Great Kapok Tree — Amazon Rainforest',
    bookTitle: 'The Great Kapok Tree: A Tale of the Amazon Rain Forest by Lynne Cherry',
    description:
      'When a man falls asleep while cutting down a kapok tree deep in the Amazon, the rainforest animals each whisper in his ear why the tree — and the forest — must be saved.',
    weekHint: 23,
    termIds: TERM_IDS_ALL,
    tier4Activity: {
      instructions:
        'Read the story. Find the Amazon rainforest on the globe. Draw the kapok tree with animals on each branch. Name each animal and find it in the picture. Talk about why rainforests are important.',
      materials: ['globe', 'plain paper', 'crayons'],
      minutes: 25,
    },
  },
  {
    id: 'byl-l0-biblioburro',
    title: 'Biblioburro — Colombia',
    bookTitle: 'Biblioburro: A True Story from Colombia by Jeanette Winter',
    description:
      'The true story of Luis Soriano, a Colombian teacher who loads books on his two donkeys, Alfa and Beto, and rides into remote mountain villages to bring reading to children who have no library.',
    weekHint: 24,
    termIds: TERM_IDS_ALL,
    tier4Activity: {
      instructions:
        'Read the story. Find Colombia on the globe. Draw Luis on his donkey carrying books through the mountains. Talk about what it would feel like to wait a whole week for the bookmobile donkey.',
      materials: ['globe', 'plain paper', 'crayons'],
      minutes: 20,
    },
  },
  {
    id: 'byl-l0-tales-our-abuelitas-told',
    title: 'Tales Our Abuelitas Told — Latin America',
    bookTitle: 'Tales Our Abuelitas Told: A Hispanic Folktale Collection by F. Isabel Campoy and Alma Flor Ada',
    description:
      'Twelve traditional folktales from across Latin America — from Mexico to Argentina — passed down through grandmothers\' voices, in bilingual English and Spanish.',
    weekHint: 25,
    termIds: TERM_IDS_ALL,
    tier4Activity: {
      instructions:
        'Read one folktale together. Find on the globe where that story comes from. Retell it using stuffed animals or small toys as characters. Practice saying one Spanish phrase from the story.',
      materials: ['globe', 'stuffed animals or small toys', 'plain paper', 'crayons'],
      minutes: 25,
    },
  },

  // ── AUSTRALIA (wk 26-27) ──────────────────────────────────────────────────

  {
    id: 'byl-l0-sophie-scott-goes-south',
    title: 'Sophie Scott Goes South — Antarctica/Australia',
    bookTitle: 'Sophie Scott Goes South by Alison Lester',
    description:
      'Australian girl Sophie sails with her father to Antarctica on a research ship, encountering penguins, icebergs, and the most remote wilderness on Earth in gorgeous painted illustrations.',
    weekHint: 26,
    termIds: TERM_IDS_ALL,
    tier4Activity: {
      instructions:
        'Read the book. Find Australia and Antarctica on the globe and measure the journey south with your finger. Draw Sophie\'s ship surrounded by icebergs and penguins. Count how many penguins you drew.',
      materials: ['globe', 'plain paper', 'crayons'],
      minutes: 20,
    },
  },
  {
    id: 'byl-l0-audrey-of-the-outback',
    title: 'Audrey of the Outback — Australia',
    bookTitle: 'Audrey of the Outback by Christine Harris',
    description:
      'Audrey, a free-spirited girl living on a remote Australian cattle station in the 1930s, has adventures with the animals, land, and Aboriginal neighbors of the Red Centre outback.',
    weekHint: 27,
    termIds: TERM_IDS_ALL,
    tier4Activity: {
      instructions:
        'Read a chapter of the book. Find Australia on the globe and point to the outback in the center. Draw a kangaroo, emu, or other Australian animal. Look at a photo of the red Australian desert together.',
      materials: ['globe', 'plain paper', 'crayons'],
      minutes: 20,
    },
  },

  // ── ANTARCTICA / POLAR (wk 28-29) ────────────────────────────────────────

  {
    id: 'byl-l0-mr-poppers-penguins',
    title: 'Mr. Popper\'s Penguins — Antarctica Intro',
    bookTitle: 'Mr. Popper\'s Penguins by Richard and Florence Atwater',
    description:
      'A house painter dreams of polar expeditions and receives a live penguin from Antarctica, which soon becomes twelve penguins filling his house with chaos and joy in this classic comic novel.',
    weekHint: 28,
    termIds: TERM_IDS_ALL,
    tier4Activity: {
      instructions:
        'Read one or two chapters aloud. Find Antarctica on the globe. Waddle around the room like a penguin. Draw Mr. Popper\'s house with all twelve penguins inside. Count them as you draw.',
      materials: ['globe', 'plain paper', 'crayons'],
      minutes: 25,
    },
  },
  {
    id: 'byl-l0-very-very-far-north',
    title: 'The Very Very Far North — Arctic',
    bookTitle: 'The Very, Very Far North by Dan Bar-el',
    description:
      'A gentle polar bear named Duane gathers a community of Arctic animal friends including a musk ox, a snowy owl, and a walrus in this warmhearted story about unlikely friendships at the top of the world.',
    weekHint: 29,
    termIds: TERM_IDS_ALL,
    tier4Activity: {
      instructions:
        'Read the book. Find the Arctic (North Pole) on the globe. Name each animal in the story and find it in the pictures. Draw Duane the polar bear with at least two of his friends in the snowy Arctic.',
      materials: ['globe', 'plain paper', 'crayons'],
      minutes: 20,
    },
  },

  // ── OCEANS / WORLD ANIMALS (wk 30-33) ────────────────────────────────────

  {
    id: 'byl-l0-drop-around-the-world',
    title: 'A Drop Around the World — Water Cycle',
    bookTitle: 'A Drop Around the World by Barbara McKinney',
    description:
      'Follow one water drop on its complete journey around the globe — as rain, river, ocean, ice cap, and cloud — touching every continent and ecosystem.',
    weekHint: 30,
    termIds: TERM_IDS_ALL,
    tier4Activity: {
      instructions:
        'Read the book. Trace the water drop\'s journey on the globe with your finger. Draw the water cycle as a circle: cloud → rain → river → ocean → evaporation → cloud. Label each stage.',
      materials: ['globe', 'plain paper', 'crayons'],
      minutes: 20,
    },
  },
  {
    id: 'byl-l0-nat-geo-wild-animal-atlas',
    title: 'National Geographic Wild Animal Atlas — World Animals',
    bookTitle: 'National Geographic Wild Animal Atlas: Earth\'s Astonishing Animals and Where They Live by National Geographic Society',
    description:
      'Maps of every continent show the astonishing animals native to each region, from African lions to Arctic polar bears, with photographs and facts for ages 5 and up.',
    weekHint: 31,
    termIds: TERM_IDS_ALL,
    tier4Activity: {
      instructions:
        'Open to any continent. Point to three animals on that continent\'s map. Find those animals\' countries on the globe. Draw your favorite animal from the page and write or dictate one fact about it.',
      materials: ['globe', 'plain paper', 'crayons'],
      minutes: 20,
    },
  },
  {
    id: 'byl-l0-world-full-of-animal-stories',
    title: 'A World Full of Animal Stories — Global Folktales',
    bookTitle: 'A World Full of Animal Stories: 50 Folk Tales and Legends by Angela McAllister',
    description:
      'Fifty traditional animal folktales from every region of the globe, from a Nigerian tortoise trickster to a Japanese fox spirit, collected in a beautifully illustrated anthology.',
    weekHint: 32,
    termIds: TERM_IDS_ALL,
    tier4Activity: {
      instructions:
        'Read one folktale from any continent. Find that continent on the globe. Draw the main animal from the story. Retell the story in your own words using a stuffed animal to play the main character.',
      materials: ['globe', 'plain paper', 'crayons', 'stuffed animal'],
      minutes: 25,
    },
  },
  {
    id: 'byl-l0-african-critters',
    title: 'African Critters — African Wildlife Photography',
    bookTitle: 'African Critters by Robert B. Haas',
    description:
      'Stunning National Geographic–quality wildlife photographs show African animals in their natural habitats — lions, elephants, giraffes, hippos, and hundreds more — with simple text for young readers.',
    weekHint: 33,
    termIds: TERM_IDS_ALL,
    tier4Activity: {
      instructions:
        'Browse the book together and pick your three favorite animals. Find Africa on the globe. Draw each animal and write or dictate its name. Practice making the sound each animal makes.',
      materials: ['globe', 'plain paper', 'crayons'],
      minutes: 20,
    },
  },
];
