import { PrismaClient, ResourceType, Subject } from '@prisma/client';

type ResourceInput = {
  id: string;
  title: string;
  description: string;
  weekHint: number;
  season: string;
  termIds: string[];
  type: ResourceType; // FIELD_TRIP if specific location, else PROJECT
  tier7Activity: { instructions: string; materials: string[]; minutes: number };
  tier4Activity: { instructions: string; materials: string[]; minutes: number };
  fieldTripLocation?: string;
  sourceUrl?: string;
  bookList?: string[];
};

async function upsertResource(prisma: PrismaClient, r: ResourceInput) {
  const fixed = {
    framework: 'OHC',
    subject: Subject.SCIENCE,
    ageRange: '4-8',
    ageRangeMin: 4,
    ageRangeMax: 8,
    tags: ['outdoor', 'wednesday', 'charlotte-mason', 'pnw'],
    active: true,
  };
  await prisma.curriculumResource.upsert({
    where: { id: r.id },
    update: {
      ...fixed,
      type: r.type,
      title: r.title,
      description: r.description,
      weekHint: r.weekHint,
      season: r.season,
      termIds: r.termIds,
      activities: { tier7: r.tier7Activity, tier4: r.tier4Activity },
      fieldTripLocation: r.fieldTripLocation ?? null,
      sourceUrl: r.sourceUrl ?? null,
      bookList: r.bookList ?? [],
      materials: [...r.tier7Activity.materials, ...r.tier4Activity.materials],
    },
    create: {
      id: r.id,
      ...fixed,
      type: r.type,
      title: r.title,
      description: r.description,
      weekHint: r.weekHint,
      season: r.season,
      termIds: r.termIds,
      activities: { tier7: r.tier7Activity, tier4: r.tier4Activity },
      fieldTripLocation: r.fieldTripLocation ?? null,
      sourceUrl: r.sourceUrl ?? null,
      bookList: r.bookList ?? [],
      materials: [...r.tier7Activity.materials, ...r.tier4Activity.materials],
    },
  });
}

export async function seedOutdoorHourChallenge(prisma: PrismaClient) {
  for (const r of OHC_PNW_TOPICS) {
    await upsertResource(prisma, r);
  }
  console.log(`  • OHC (PNW): ${OHC_PNW_TOPICS.length} topics seeded`);
}

// ============================================================================
// OHC PNW NATURE TOPICS (~35)
// Distributed across seasons: summer (9), fall (9), spring (9), any/winter (8)
// Sources:
//   Handbook of Nature Study (Anna Botsford Comstock)
//   https://www.handbookofnaturestudy.com/outdoor-hour-challenges
//   https://www.fs.usda.gov/pnw/ (USDA Forest Service Pacific Northwest)
//   https://oregonwildlife.org/ (Oregon Wildlife Foundation)
//   https://www.oregonmetro.gov/parks (Metro Parks — Forest Park, Hagg Lake, etc.)
//   https://www.fws.gov/refuge/tualatin-river (Tualatin River NWR)
// ============================================================================

const OHC_PNW_TOPICS: ResourceInput[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // SUMMER (weekHint 1-10, termIds: summer-2026)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'ohc-pnw-tide-pools-cape-perpetua',
    title: 'Tide Pool Exploration at Cape Perpetua',
    description:
      'Rocky intertidal zones on the Oregon coast host sea stars, hermit crabs, anemones, chitons, and barnacles adapted to alternating wet and dry conditions. Cape Perpetua\'s Cook\'s Chasm and Spouting Horn tide pools are among the richest in the PNW.',
    weekHint: 1,
    season: 'summer',
    termIds: ['summer-2026'],
    type: ResourceType.FIELD_TRIP,
    fieldTripLocation: 'Cape Perpetua, OR (Siuslaw National Forest)',
    tier7Activity: {
      instructions:
        'At low tide, walk the rocky intertidal zone carefully (stay on rocks, never step in pools). Sketch at least 3 different organisms in your nature journal — include as much detail as you can observe: color, texture, how it moves or stays still, what zone it inhabits (high, mid, or low tide zone). Write 3 labeled observations about how each creature is adapted to life between tides.',
      materials: [
        'nature journal',
        'pencil',
        'watercolor set or colored pencils',
        'hand lens (10x)',
        'tide chart (printed)',
        'rubber-soled shoes',
      ],
      minutes: 60,
    },
    tier4Activity: {
      instructions:
        'Look into 3 tide pools and collect 3 interesting objects you find on the rocks (empty shells, dried seaweed — leave live creatures in place). Dictate to a parent: what did it look like? What did it feel like? Was anything moving? Place your objects in a row and draw them when you get home.',
      materials: [
        'small collecting bag',
        'hand lens',
        'crayons',
        'blank paper',
      ],
      minutes: 35,
    },
    sourceUrl: 'https://www.fs.usda.gov/recarea/siuslaw/recarea/?recid=42605',
    bookList: ['A Field Guide to Pacific Coast Fishes by William N. Eschmeyer'],
  },
  {
    id: 'ohc-pnw-tide-pools-cannon-beach',
    title: 'Tide Pools at Cannon Beach (Haystack Rock)',
    description:
      'Haystack Rock Marine Garden at Cannon Beach is a protected marine reserve with some of the most accessible tide pools in Oregon. Tufted puffins nest on the rock seasonally, and ochre sea stars, purple urchins, and ochre anemones are common.',
    weekHint: 2,
    season: 'summer',
    termIds: ['summer-2026'],
    type: ResourceType.FIELD_TRIP,
    fieldTripLocation: 'Haystack Rock, Cannon Beach, OR',
    tier7Activity: {
      instructions:
        'Arrive 1 hour before listed low tide. Sketch Haystack Rock from the beach, then focus your journal entry on one specific organism you observe up close. Write 3 observations: what it is doing, what it is near, and one thing you wonder about it. If puffins are visible on the rock, add a second sketch.',
      materials: [
        'nature journal',
        'pencil',
        'colored pencils',
        'hand lens',
        'tide chart',
        'binoculars (optional)',
      ],
      minutes: 55,
    },
    tier4Activity: {
      instructions:
        'Find one sea anemone and watch it for 2 minutes without touching. Then find one hermit crab. Dictate to a parent: "The anemone looked like ___ and the hermit crab was ___." Draw both creatures on the same page when you get home.',
      materials: [
        'hand lens',
        'crayons',
        'blank paper',
      ],
      minutes: 30,
    },
    sourceUrl: 'https://www.oregonmetro.gov/parks-and-nature/oregon-coast',
    bookList: ['Between Pacific Tides by Edward F. Ricketts'],
  },
  {
    id: 'ohc-pnw-wildflower-walk',
    title: 'Wildflower Walk: Meadow Identification',
    description:
      'PNW summer meadows bloom with lupine, camas, yarrow, Oregon sunshine, and Indian paintbrush. Learning to identify wildflowers by their petal count, leaf shape, and bloom color builds plant observation skills central to Charlotte Mason nature study.',
    weekHint: 3,
    season: 'summer',
    termIds: ['summer-2026'],
    type: ResourceType.FIELD_TRIP,
    fieldTripLocation: 'Hoyt Arboretum, Portland, OR',
    tier7Activity: {
      instructions:
        'Walk a meadow or forest-edge trail. Choose 3 wildflowers to sketch. For each: draw the whole plant (leaves, stem, flower), note the petal count, leaf arrangement, and approximate height. Use a field guide to attempt identification. Write one sentence per plant describing where you found it (in sun, shade, rocky soil, moist area) — this is its habitat clue.',
      materials: [
        'nature journal',
        'pencil',
        'colored pencils',
        'wildflower field guide or iNaturalist app',
        'hand lens',
        'ruler',
      ],
      minutes: 50,
    },
    tier4Activity: {
      instructions:
        'Pick 3 wildflowers (only where picking is allowed — ask first). Press them between two pages of a heavy book when you get home. While pressing, dictate to a parent: what color was each flower? How many petals did it have? Was it taller or shorter than your knee?',
      materials: [
        'heavy book for pressing',
        'paper towels (for pressing)',
        'crayons',
        'blank paper',
      ],
      minutes: 30,
    },
    sourceUrl: 'https://www.hoytarboretum.org',
    bookList: ['Plants of the Pacific Northwest Coast by Jim Pojar & Andy MacKinnon'],
  },
  {
    id: 'ohc-pnw-blackberry-identification',
    title: 'Blackberry Identification & Bramble Ecology',
    description:
      'Three blackberry species grow in the PNW: native trailing blackberry (Rubus ursinus), Himalayan blackberry (invasive), and evergreen blackberry (invasive). Learning to distinguish them by leaf shape, cane characteristics, and fruit teaches both ecology and invasive species awareness.',
    weekHint: 4,
    season: 'summer',
    termIds: ['summer-2026'],
    type: ResourceType.PROJECT,
    tier7Activity: {
      instructions:
        'Find a blackberry thicket (common along trails, roadsides, and forest edges). From a safe distance, observe and sketch: the leaf shape (how many leaflets? are edges toothed?), the cane (flat or rounded? color? how thick are the thorns?), and the fruit stage (green, red, or ripe black). Write 3 observations in your journal and try to identify which species you found. Note what animals might benefit from these berries.',
      materials: [
        'nature journal',
        'pencil',
        'colored pencils',
        'plant field guide or iNaturalist app',
        'hand lens',
        'nitrile gloves (optional, for handling canes)',
      ],
      minutes: 45,
    },
    tier4Activity: {
      instructions:
        'With an adult, taste one ripe blackberry from a known-safe patch. Collect 3 leaves from different blackberry plants (wearing gloves or using a stick). Dictate to a parent: what did the leaf feel like? What did the berry taste like? How many thorns did you count on one cane?',
      materials: [
        'paper bag',
        'nitrile gloves',
        'crayons',
        'blank paper',
      ],
      minutes: 25,
    },
    sourceUrl: 'https://www.fs.usda.gov/wildflowers/plant-of-the-week/rubus_ursinus.shtml',
  },
  {
    id: 'ohc-pnw-garter-snake-banana-slug',
    title: 'Garter Snake & Banana Slug Observation',
    description:
      'The Pacific banana slug (Ariolimax columbianus) is Oregon\'s signature forest invertebrate; the common garter snake (Thamnophis sirtalis) is the most abundant reptile in the PNW. Studying both teaches habitat preferences, moisture dependence, and predator-prey relationships.',
    weekHint: 5,
    season: 'summer',
    termIds: ['summer-2026'],
    type: ResourceType.FIELD_TRIP,
    fieldTripLocation: 'Tryon Creek State Natural Area, Portland, OR',
    tier7Activity: {
      instructions:
        'Walk a damp, shaded forest trail in early morning when slugs and snakes are most active. When you find a banana slug, observe without touching: measure its approximate length against your finger or a stick, note its color, and watch how it moves. If you spot a garter snake, sketch it from a respectful distance noting color pattern and head shape. Write 3 observations for each animal you find.',
      materials: [
        'nature journal',
        'pencil',
        'colored pencils',
        'hand lens',
        'small ruler or measuring stick',
      ],
      minutes: 55,
    },
    tier4Activity: {
      instructions:
        'Find a banana slug and squat down to watch it for 1 full minute without touching. Collect 3 things from the slug\'s habitat: a damp leaf, a piece of bark, a small pebble. Dictate to a parent: what color was the slug? Was it moving fast or slow? Was the ground wet or dry where you found it?',
      materials: [
        'small collecting bag',
        'crayons',
        'blank paper',
      ],
      minutes: 30,
    },
    sourceUrl: 'https://oregonwildlife.org/wildlife/banana-slug/',
  },
  {
    id: 'ohc-pnw-lake-ecology-hagg-lake',
    title: 'Lake Ecology at Hagg Lake',
    description:
      'Henry Hagg Lake (Scoggins Valley Park) is a reservoir in the Tualatin Valley surrounded by mixed forest. Its shoreline, emergent wetland margins, and open water support osprey, great blue heron, painted turtles, and diverse aquatic invertebrates — a complete freshwater ecosystem in one accessible setting.',
    weekHint: 6,
    season: 'summer',
    termIds: ['summer-2026'],
    type: ResourceType.FIELD_TRIP,
    fieldTripLocation: 'Henry Hagg Lake (Scoggins Valley Park), Gaston, OR',
    tier7Activity: {
      instructions:
        'Walk the shoreline trail for 20 minutes. Divide your journal page into three zones: water surface, water\'s edge (emergent vegetation), and upland bank. In each zone record every living thing you observe (birds, insects, plants, fish if visible, frogs). Sketch at least one organism per zone with 3 labeled details. Write 1-2 sentences about what connects the three zones — how do animals move between them?',
      materials: [
        'nature journal',
        'pencil',
        'colored pencils',
        'binoculars',
        'hand lens',
      ],
      minutes: 60,
    },
    tier4Activity: {
      instructions:
        'Stand at the water\'s edge and collect 3 objects: one from the water (a pebble, a pinecone floating at the shore), one from the bank (a leaf, a feather), and one you cannot pick up but can describe (a cloud reflection, a fish ripple). Dictate to a parent: what was each thing? Where exactly did you find it?',
      materials: [
        'small collecting bag',
        'crayons',
        'blank paper',
      ],
      minutes: 30,
    },
    sourceUrl: 'https://www.oregonmetro.gov/parks-and-nature/hagg-lake',
  },
  {
    id: 'ohc-pnw-forest-canopy',
    title: 'Forest Canopy Study: Looking Up',
    description:
      'The vertical structure of a PNW temperate rainforest — floor, shrub layer, understory, sub-canopy, and canopy — creates distinct microhabitats. Lying on your back and looking straight up (the "worm\'s eye view") reveals canopy architecture invisible from normal standing height.',
    weekHint: 7,
    season: 'summer',
    termIds: ['summer-2026'],
    type: ResourceType.FIELD_TRIP,
    fieldTripLocation: 'Forest Park, Portland, OR',
    tier7Activity: {
      instructions:
        'Find a spot on the forest floor, spread a sit pad or jacket, and lie on your back looking straight up for at least 5 minutes. In your journal, draw the "sky window" you see — the canopy silhouette, patches of sky, and the shapes light makes coming through. Identify as many distinct layers as you can see (canopy, sub-canopy, shrub). Write 3 observations: one about light, one about sound, one about movement.',
      materials: [
        'nature journal',
        'pencil',
        'colored pencils',
        'sit pad or old jacket',
      ],
      minutes: 50,
    },
    tier4Activity: {
      instructions:
        'Lie on your back next to a parent or sibling and look up for 2 minutes. Collect 3 things that have fallen from the canopy (a leaf, a twig, a cone or seed). Dictate to a parent: what did you see above you? Did anything move? Was it quiet or noisy?',
      materials: [
        'small bag',
        'crayons',
        'blank paper',
      ],
      minutes: 25,
    },
    sourceUrl: 'https://www.fs.usda.gov/pnw/',
    bookList: ['The Hidden Life of Trees by Peter Wohlleben'],
  },
  {
    id: 'ohc-pnw-dragonflies',
    title: 'Dragonfly & Damselfly Observation at a Pond',
    description:
      'Oregon hosts over 60 dragonfly and damselfly species (order Odonata). Common summer species include the twelve-spotted skimmer, blue dasher, and Pacific forktail. Their aerial hunting, perching behavior, and aquatic larval stage make them a rich subject for Charlotte Mason observation.',
    weekHint: 8,
    season: 'summer',
    termIds: ['summer-2026'],
    type: ResourceType.FIELD_TRIP,
    fieldTripLocation: 'Tualatin Hills Nature Park, Beaverton, OR',
    tier7Activity: {
      instructions:
        'Sit quietly near the edge of a pond or slow stream for 10 minutes and watch for dragonflies. In your journal note: how many different color patterns do you see? Do they hover, dart, or glide? Do they perch? Sketch at least 2 individuals with wing venation detail and body color noted. Write 3 observations about their behavior — are they hunting, patrolling a territory, or mating?',
      materials: [
        'nature journal',
        'pencil',
        'colored pencils',
        'hand lens',
        'binoculars (optional)',
      ],
      minutes: 55,
    },
    tier4Activity: {
      instructions:
        'Sit still at the pond\'s edge and count how many dragonflies you see flying at the same time. Collect 3 objects from the pondside habitat (a stone, a reed, dried mud). Dictate to a parent: what colors did the dragonflies have? Did they land anywhere? What was the biggest one you saw?',
      materials: [
        'small bag',
        'crayons',
        'blank paper',
      ],
      minutes: 30,
    },
    sourceUrl: 'https://www.oregonmetro.gov/parks-and-nature/tualatin-hills-nature-park',
    bookList: ['Dragonflies and Damselflies of the West by Dennis Paulson'],
  },
  {
    id: 'ohc-pnw-butterflies',
    title: 'Butterfly Observation & Host Plant Hunt',
    description:
      'PNW summer butterflies include the western tiger swallowtail, painted lady, Lorquin\'s admiral, and cabbage white. Each species depends on specific larval host plants — identifying butterflies and their plants together teaches ecological connections.',
    weekHint: 9,
    season: 'summer',
    termIds: ['summer-2026'],
    type: ResourceType.PROJECT,
    tier7Activity: {
      instructions:
        'Walk a sunny garden, meadow edge, or brushy trail and observe butterflies for 20 minutes. For each butterfly species you see: sketch the wing pattern (top and/or underside), note what flower it is visiting, and estimate its wingspan compared to your hand. Write 3 observations and try to identify at least 2 species using a field guide or iNaturalist. Note whether you see any caterpillars on nearby plants.',
      materials: [
        'nature journal',
        'pencil',
        'colored pencils',
        'butterfly field guide or iNaturalist app',
        'hand lens',
      ],
      minutes: 50,
    },
    tier4Activity: {
      instructions:
        'Find a flower that butterflies are visiting and watch it for 5 minutes. Count how many times a butterfly lands on it. Collect 3 flowers (where allowed). Dictate to a parent: what colors were the butterflies? How many did you count? Which flower seemed most popular?',
      materials: [
        'small bag',
        'crayons',
        'blank paper',
      ],
      minutes: 28,
    },
    sourceUrl: 'https://oregonwildlife.org/wildlife/western-tiger-swallowtail/',
    bookList: ['Butterflies of the Pacific Northwest by William Neill'],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // FALL (weekHint 11-19, termIds: fall-2026)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'ohc-pnw-salmon-spawning-tualatin',
    title: 'Salmon Spawning Watch on the Tualatin River',
    description:
      'Coho and Chinook salmon return to tributaries of the Tualatin watershed each fall after years at sea. Watching salmon spawn — digging redds (nests) in gravel, spawning, and dying — is one of the most dramatic wildlife events accessible in the Portland metro area.',
    weekHint: 11,
    season: 'fall',
    termIds: ['fall-2026'],
    type: ResourceType.FIELD_TRIP,
    fieldTripLocation: 'Tualatin River National Wildlife Refuge, Sherwood, OR',
    tier7Activity: {
      instructions:
        'Walk the refuge trail to the river observation area. Look for salmon holding in clear, shallow riffles. In your journal sketch the scene: mark the current direction, the gravel bar, and any fish you see. Note their size, color (spawning salmon change color dramatically), and behavior. Write 3 observations: one about the fish\'s movement, one about the gravel, one about what other animals you see benefitting from the salmon (herons, ravens, raccoon tracks).',
      materials: [
        'nature journal',
        'pencil',
        'colored pencils',
        'binoculars',
        'rubber boots (for wet trails)',
      ],
      minutes: 60,
    },
    tier4Activity: {
      instructions:
        'Stand on a bridge or bank and watch the water for 5 minutes. See if you can spot a fish. Collect 3 stones from the riverbank. Dictate to a parent: did you see any fish? What color were they? What sounds did the river make?',
      materials: [
        'small bag',
        'crayons',
        'blank paper',
        'rubber boots',
      ],
      minutes: 35,
    },
    sourceUrl: 'https://www.fws.gov/refuge/tualatin-river',
    bookList: ['Salmon Without Rivers by Jim Lichatowich'],
  },
  {
    id: 'ohc-pnw-salmon-spawning-sandy-river',
    title: 'Salmon & Steelhead Watch at Sandy River Delta',
    description:
      'The Sandy River Delta (Oxbow Regional Park area) is one of the best urban salmon-viewing sites in the PNW. The Columbia River confluence and the Sandy\'s lower miles host Chinook, Coho, and winter steelhead in fall and early winter. The delta\'s forests are also critical bird habitat.',
    weekHint: 12,
    season: 'fall',
    termIds: ['fall-2026'],
    type: ResourceType.FIELD_TRIP,
    fieldTripLocation: 'Sandy River Delta, Troutdale, OR',
    tier7Activity: {
      instructions:
        'Walk down to the river and find a clear gravel reach. Observe the water for at least 10 minutes. In your journal: sketch the river channel (wide or narrow? fast or slow?), draw any fish you see holding in the current, and note any evidence of past salmon (carcasses, bird activity, bear diggings). Write 3 observations and one question you still have about the salmon\'s life cycle.',
      materials: [
        'nature journal',
        'pencil',
        'colored pencils',
        'binoculars',
        'rubber boots',
      ],
      minutes: 55,
    },
    tier4Activity: {
      instructions:
        'Collect 3 stones from the sandy river bank — try to find 3 different shapes or colors. Watch the water from a safe spot for 3 minutes and count any ripples you see. Dictate to a parent: what was the water doing? Did you see any birds near the river?',
      materials: [
        'small bag',
        'crayons',
        'blank paper',
        'rubber boots',
      ],
      minutes: 30,
    },
    sourceUrl: 'https://www.oregonmetro.gov/parks-and-nature/sandy-river-delta',
  },
  {
    id: 'ohc-pnw-mushroom-hunting',
    title: 'Mushroom Hunting (Safety-First Identification)',
    description:
      'PNW fall forests produce chanterelles, hedgehog mushrooms, lion\'s mane, and the deadly Amanita phalloides (death cap). This challenge focuses on safe observation skills: learn to identify 2-3 edible species confidently and always recognize look-alikes. Never eat anything you cannot identify with 100% certainty.',
    weekHint: 13,
    season: 'fall',
    termIds: ['fall-2026'],
    type: ResourceType.FIELD_TRIP,
    fieldTripLocation: 'Tillamook State Forest (Tillamook, OR) or Forest Park, Portland, OR',
    tier7Activity: {
      instructions:
        'SAFETY RULE: Observe only — do not eat anything found in the field unless an expert adult confirms identification. Walk a damp forest trail after recent rain. When you find a mushroom, observe and sketch: cap shape (flat, convex, umbonate?), color, gills (do they run down the stem, are they attached, or are they free?), stem color and texture, and smell if safe to sniff. Write 3 observations and note the substrate (on wood, soil, or buried roots?). Try to identify using a mushroom guide.',
      materials: [
        'nature journal',
        'pencil',
        'colored pencils',
        'mushroom field guide (Pacific NW Mushrooms by Steve Trudell)',
        'hand lens',
        'paper bag (for safe transport if foraging with adult expert)',
      ],
      minutes: 55,
    },
    tier4Activity: {
      instructions:
        'Find 3 mushrooms on the forest floor (do not pick). Look at each one carefully and collect one leaf near each mushroom. Dictate to a parent: what shape was the cap? What color? Was it growing on wood or dirt? Draw each mushroom when you get home.',
      materials: [
        'small bag (for leaf samples only)',
        'crayons',
        'blank paper',
      ],
      minutes: 30,
    },
    sourceUrl: 'https://www.fs.usda.gov/pnw/',
    bookList: ['Pacific Northwest Mushrooms by Steve Trudell & Joe Ammirati'],
  },
  {
    id: 'ohc-pnw-leaf-id-conifers',
    title: 'Conifer Identification: Doug Fir vs. Hemlock vs. Cedar',
    description:
      'Oregon\'s three dominant conifers — Douglas-fir (Pseudotsuga menziesii), western hemlock (Tsuga heterophylla), and western red cedar (Thuja plicata) — can be distinguished by needle arrangement, cone shape, bark texture, and silhouette. This is essential PNW tree literacy.',
    weekHint: 14,
    season: 'fall',
    termIds: ['fall-2026'],
    type: ResourceType.FIELD_TRIP,
    fieldTripLocation: 'Hoyt Arboretum, Portland, OR',
    tier7Activity: {
      instructions:
        'At the arboretum, find one Douglas-fir, one western hemlock, and one western red cedar. For each tree: sketch a branch showing the needles (single or in bundles? flat or rounded? how long?), sketch or collect a cone (if present), note the bark pattern, and measure the trunk circumference with a string if possible. Write 3 observations for each species that would help you identify it again from a distance.',
      materials: [
        'nature journal',
        'pencil',
        'colored pencils',
        'string for measuring',
        'hand lens',
        'tree field guide or Seek app',
      ],
      minutes: 60,
    },
    tier4Activity: {
      instructions:
        'Collect one fallen branch tip from each of the 3 tree types (Douglas-fir, hemlock, cedar — look for labeled trees in the arboretum). Lay them next to each other at home. Dictate to a parent: which had the prickliest needles? Which smelled the strongest? Which had the most interesting bark?',
      materials: [
        'paper bag',
        'crayons',
        'blank paper',
      ],
      minutes: 30,
    },
    sourceUrl: 'https://www.hoytarboretum.org/visit/self-guided-tours/',
    bookList: ['Trees to Know in Oregon by Edward C. Jensen'],
  },
  {
    id: 'ohc-pnw-nut-cone-collection',
    title: 'Nut & Cone Collection: Fall Seed Dispersal',
    description:
      'Fall is the season when trees disperse seeds. PNW species produce diverse seed packages: Doug-fir cones with mouse-tail bracts, big-leaf maple samaras, Oregon white oak acorns, and red alder catkins. Collecting and comparing them teaches seed dispersal strategies.',
    weekHint: 15,
    season: 'fall',
    termIds: ['fall-2026'],
    type: ResourceType.FIELD_TRIP,
    fieldTripLocation: 'Sauvie Island, OR (Columbia River bottomlands)',
    tier7Activity: {
      instructions:
        'Collect at least 5 different seed types from the ground (do not pull from living trees). For each: sketch it carefully, estimate its size in centimeters, describe how you think it travels (wind, animal, water, falling?), and identify the parent tree if possible. Write 3 observations comparing two of your seeds and explain which dispersal method you think is most effective.',
      materials: [
        'nature journal',
        'pencil',
        'colored pencils',
        'ruler or small tape measure',
        'paper bag for collecting',
        'tree/seed field guide',
      ],
      minutes: 55,
    },
    tier4Activity: {
      instructions:
        'Collect 3 seeds or cones from the ground. Hold each one and feel it carefully. Dictate to a parent: which was heaviest? Which had wings or a tail? Which do you think a squirrel would like? Sort them from smallest to largest.',
      materials: [
        'small bag',
        'crayons',
        'blank paper',
      ],
      minutes: 28,
    },
    sourceUrl: 'https://oregonwildlife.org/habitat/forests/',
    bookList: ['Plants of the Pacific Northwest Coast by Jim Pojar & Andy MacKinnon'],
  },
  {
    id: 'ohc-pnw-migrating-birds-sauvie',
    title: 'Migrating Waterfowl at Sauvie Island',
    description:
      'Sauvie Island is one of the Pacific Flyway\'s most important stopover habitats. Each fall, tens of thousands of ducks, geese, sandhill cranes, and tundra swans stage on its wetlands. The Pittock Marsh and Rentenaar Road areas are accessible wildlife-viewing spots.',
    weekHint: 16,
    season: 'fall',
    termIds: ['fall-2026'],
    type: ResourceType.FIELD_TRIP,
    fieldTripLocation: 'Sauvie Island Wildlife Area, OR',
    tier7Activity: {
      instructions:
        'Arrive early (before 9am) when bird activity peaks. Find a spot overlooking open water or flooded fields. Count and sketch all bird species you can identify or describe: note size (sparrow, crow, or goose sized?), overall color, bill shape, and behavior (diving, dabbling, flying in V-formation?). Write 3 observations: one about flock behavior, one about how different species seem to coexist, one about what the birds are eating.',
      materials: [
        'nature journal',
        'pencil',
        'colored pencils',
        'binoculars',
        'bird field guide (Sibley\'s Pacific Northwest)',
        'rubber boots',
      ],
      minutes: 60,
    },
    tier4Activity: {
      instructions:
        'Stand at the water\'s edge and count all the birds you can see at once. Watch for 5 minutes and see if any fly away or land. Collect 3 feathers from the ground (from common species only). Dictate to a parent: what was the biggest bird you saw? What sounds did the birds make?',
      materials: [
        'small bag',
        'crayons',
        'blank paper',
        'rubber boots',
      ],
      minutes: 30,
    },
    sourceUrl: 'https://www.oregonmetro.gov/parks-and-nature/sauvie-island',
    bookList: ['Birds of Oregon: A General Reference by David B. Marshall'],
  },
  {
    id: 'ohc-pnw-first-frost',
    title: 'First Frost: Ice Crystal & Plant Response Study',
    description:
      'The first hard frost of the season transforms the outdoor classroom overnight. Ice crystals form differently on different surfaces; some plants wilt while others harden off. Morning frost observation teaches water phase changes, plant adaptations, and the arrival of winter.',
    weekHint: 17,
    season: 'fall',
    termIds: ['fall-2026'],
    type: ResourceType.PROJECT,
    tier7Activity: {
      instructions:
        'Go outside within 30 minutes of sunrise on the first frost morning. Sketch frost crystal patterns on 3 different surfaces: a car windshield, a leaf, and a spiderweb or piece of grass. Note the crystal size, direction, and texture with your hand lens. Record the temperature if you have a thermometer. Write 3 observations: one about the crystals themselves, one about which plants show damage, and one about which plants look unaffected.',
      materials: [
        'nature journal',
        'pencil',
        'colored pencils',
        'hand lens',
        'outdoor thermometer (optional)',
      ],
      minutes: 45,
    },
    tier4Activity: {
      instructions:
        'Touch the frost on a leaf gently and watch it melt. Collect 3 frost-covered objects (bring them inside quickly). Dictate to a parent: what did the frost feel like? What did it look like up close? What happened to it when you touched it?',
      materials: [
        'small bag',
        'crayons',
        'blank paper',
      ],
      minutes: 25,
    },
    sourceUrl: 'https://www.handbookofnaturestudy.com/outdoor-hour-challenges',
  },
  {
    id: 'ohc-pnw-fall-leaf-color',
    title: 'Fall Leaf Color Change: Why Leaves Turn',
    description:
      'PNW broadleaf trees — bigleaf maple, red alder, vine maple, black cottonwood — put on a vivid fall show. Understanding chlorophyll breakdown, underlying carotenoids, and anthocyanin production explains the color sequence: green → yellow/orange → red → brown.',
    weekHint: 18,
    season: 'fall',
    termIds: ['fall-2026'],
    type: ResourceType.FIELD_TRIP,
    fieldTripLocation: 'Tryon Creek State Natural Area, Portland, OR',
    tier7Activity: {
      instructions:
        'Collect one leaf each from at least 4 different broadleaf trees. For each leaf: sketch its shape and color, do a rubbing (place leaf under paper and rub a crayon over it), and note whether it is still attached or has fallen. Write 3 observations comparing two leaves: shape differences, color differences, and which tree you found each on. Try to explain in 1-2 sentences why you think the colors change.',
      materials: [
        'nature journal',
        'pencil',
        'crayons (multiple colors, including gold, orange, red, brown)',
        'blank paper for rubbings',
        'tree field guide',
      ],
      minutes: 50,
    },
    tier4Activity: {
      instructions:
        'Collect 3 fallen leaves in 3 different colors. Do a leaf rubbing for each one by placing it under blank paper and rubbing a crayon over it. Dictate to a parent: which color is your favorite? Which leaf was the biggest? Which was the smoothest?',
      materials: [
        'small bag',
        'blank paper',
        'crayons',
      ],
      minutes: 28,
    },
    sourceUrl: 'https://www.handbookofnaturestudy.com/outdoor-hour-challenges',
    bookList: ['Autumn: An Alphabet Acrostic by Steven Schnur'],
  },
  {
    id: 'ohc-pnw-fall-spiders',
    title: 'Orb-Weaver Spiders & Web Architecture',
    description:
      'Fall is the peak season for large orb-weaving spiders in the PNW — the cross spider (Araneus diadematus) and the banded garden spider (Argiope trifasciata) build large, prominent webs in garden edges and shrubs. Studying web architecture teaches both geometry and animal behavior.',
    weekHint: 19,
    season: 'fall',
    termIds: ['fall-2026'],
    type: ResourceType.PROJECT,
    tier7Activity: {
      instructions:
        'Find an intact orb web (best in early morning when dew makes them visible). Observe without disturbing: count the radial spokes and the number of spiral rings. Note where the spider is sitting (hub, retreat nearby?). Sketch the full web with as much structural accuracy as you can — this is a real geometry challenge. Write 3 observations: one about the web structure, one about the spider\'s body, one about what you find caught in the web.',
      materials: [
        'nature journal',
        'pencil',
        'colored pencils',
        'hand lens',
        'spray bottle with water (to reveal web if no dew)',
      ],
      minutes: 50,
    },
    tier4Activity: {
      instructions:
        'Find a spider web and look at it for 2 minutes without touching. Collect 3 objects near the web: a leaf, a twig, a pebble. Dictate to a parent: how big was the web? What shape was it? Could you see the spider? What color was the spider?',
      materials: [
        'small bag',
        'crayons',
        'blank paper',
      ],
      minutes: 28,
    },
    sourceUrl: 'https://www.handbookofnaturestudy.com/outdoor-hour-challenges',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // SPRING (weekHint 28-36, termIds: spring-2027)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'ohc-pnw-nest-watching',
    title: 'Bird Nest Watching & Nest Architecture',
    description:
      'Spring in the PNW brings nest-building activity from American robins, black-capped chickadees, Bewick\'s wrens, and Steller\'s jays. Observing nest construction teaches material selection, structural engineering, and parental behavior without disturbing the nest.',
    weekHint: 28,
    season: 'spring',
    termIds: ['spring-2027'],
    type: ResourceType.PROJECT,
    tier7Activity: {
      instructions:
        'Find a nest being built or recently used (look in shrubs, tree crooks, fence posts). Observe from at least 3 meters away for 10 minutes. In your journal: sketch the nest location and its surroundings, draw the nest shape and note visible materials (mud, grass, bark, moss, feathers, hair). Write 3 observations about nest construction — what materials did you see the bird bring? How did it weave them in? If the nest is empty after the season, you may examine it closely.',
      materials: [
        'nature journal',
        'pencil',
        'colored pencils',
        'binoculars',
      ],
      minutes: 50,
    },
    tier4Activity: {
      instructions:
        'Find a bird nest (old, empty ones are perfect). Touch it gently and feel how it is made. Collect 3 materials you think a bird might use to build a nest: grass, a twig, a bit of fluff. Try to weave them together with your fingers. Dictate to a parent: was the nest scratchy or soft? What did you find inside? Could you build a nest?',
      materials: [
        'small bag',
        'crayons',
        'blank paper',
      ],
      minutes: 28,
    },
    sourceUrl: 'https://www.handbookofnaturestudy.com/outdoor-hour-challenges',
    bookList: ['A Nest Is Noisy by Dianna Hutts Aston'],
  },
  {
    id: 'ohc-pnw-trillium-spring-ephemerals',
    title: 'Spring Ephemerals: Trillium & Skunk Cabbage',
    description:
      'Western trillium (Trillium ovatum) and skunk cabbage (Lysichiton americanus) are iconic PNW spring ephemerals that bloom before the forest canopy leafs out. Both are indicators of old-growth forest health and cool, moist habitats.',
    weekHint: 29,
    season: 'spring',
    termIds: ['spring-2027'],
    type: ResourceType.FIELD_TRIP,
    fieldTripLocation: 'Tryon Creek State Natural Area, Portland, OR',
    tier7Activity: {
      instructions:
        'Walk a moist forest trail in March or April looking for trillium and skunk cabbage in wet seeps. Observe without picking — trillium takes 7+ years to grow from seed and is protected in many parks. Sketch each plant: note the number of petals/leaves (trillium always has 3), the color at the time of your visit (trillium changes from white to pink to maroon as it ages), and the habitat. Write 3 observations, including one about the trillium\'s color change and one about the smell of skunk cabbage.',
      materials: [
        'nature journal',
        'pencil',
        'colored pencils',
        'hand lens',
        'rubber boots',
      ],
      minutes: 55,
    },
    tier4Activity: {
      instructions:
        'Find a trillium and crouch down to look at it carefully without touching. Count its petals. Find a skunk cabbage and smell it from a safe distance. Collect 3 things from the forest floor near the flowers: a moss clump, a leaf, a twig. Dictate to a parent: what color was the trillium? What did the skunk cabbage smell like? Was the ground wet or dry?',
      materials: [
        'small bag',
        'crayons',
        'blank paper',
        'rubber boots',
      ],
      minutes: 30,
    },
    sourceUrl: 'https://www.oregonmetro.gov/parks-and-nature/tryon-creek-state-natural-area',
    bookList: ['Wildflowers of the Pacific Northwest by Mark Turner & Phyllis Gustafson'],
  },
  {
    id: 'ohc-pnw-tadpole-observation',
    title: 'Tadpole Observation in Vernal Pools',
    description:
      'Pacific tree frogs (Pseudacris regilla) and red-legged frogs (Rana aurora) breed in early spring in temporary ponds and slow-moving ditches. Watching tadpoles develop — gill absorption, leg emergence — illustrates metamorphosis in real time.',
    weekHint: 30,
    season: 'spring',
    termIds: ['spring-2027'],
    type: ResourceType.FIELD_TRIP,
    fieldTripLocation: 'Tualatin River National Wildlife Refuge, Sherwood, OR',
    tier7Activity: {
      instructions:
        'Find a shallow pond or slow ditch with tadpoles. Observe from the edge without entering the water. In your journal: estimate the number of tadpoles you can see, sketch 2-3 individuals noting their size, tail shape, and any visible leg buds. Write 3 observations including one about how they move, one about what they are doing (resting, feeding, schooling?), and one about the water quality (clear, murky, weedy?).',
      materials: [
        'nature journal',
        'pencil',
        'colored pencils',
        'hand lens',
        'rubber boots',
      ],
      minutes: 50,
    },
    tier4Activity: {
      instructions:
        'Crouch at the pond edge and watch tadpoles for 3 minutes. Count how many you can see at once. Collect 3 objects from the water\'s edge: a stone, a leaf, mud on a stick. Dictate to a parent: how big were the tadpoles? Did they have any legs yet? Were they moving fast or slow?',
      materials: [
        'small bag',
        'crayons',
        'blank paper',
        'rubber boots',
      ],
      minutes: 28,
    },
    sourceUrl: 'https://www.fws.gov/refuge/tualatin-river',
    bookList: ['From Tadpole to Frog by Wendy Pfeffer'],
  },
  {
    id: 'ohc-pnw-songbird-id-by-ear',
    title: 'Songbird Identification by Ear',
    description:
      'Spring mornings in PNW forests and parks produce a complex symphony: Swainson\'s thrush, American robin, black-capped chickadee, dark-eyed junco, Pacific wren, and orange-crowned warbler are commonly heard before they are seen. Learning songs is fundamental birding skill.',
    weekHint: 31,
    season: 'spring',
    termIds: ['spring-2027'],
    type: ResourceType.PROJECT,
    tier7Activity: {
      instructions:
        'Go outside at least 30 minutes after sunrise (or before 9am) and sit quietly for 10 minutes with eyes closed. Listen carefully to every bird sound you hear. In your journal: write down each distinct sound you heard (use your own words: "high whistle, then trill" or "two-note song, lower second note"). Try to match at least 2 sounds to a species using the Merlin Bird ID app (Sound ID) or a recording. Write 3 observations: one about pitch, one about rhythm, one about where the sound seemed to come from.',
      materials: [
        'nature journal',
        'pencil',
        'Merlin Bird ID app (free from Cornell Lab)',
        'binoculars (for visual confirmation)',
      ],
      minutes: 50,
    },
    tier4Activity: {
      instructions:
        'Sit outside with a parent and close your eyes for 2 minutes. Listen for birds. Collect 3 things you can hold: a feather, a leaf, a stone. Dictate to a parent: how many different bird sounds did you hear? Which was your favorite? Can you whistle or hum one of the sounds you heard?',
      materials: [
        'small bag',
        'crayons',
        'blank paper',
      ],
      minutes: 28,
    },
    sourceUrl: 'https://www.allaboutbirds.org/guide/browse/region/Oregon',
    bookList: ['A Field Guide to the Birds of Western North America by Roger Tory Peterson'],
  },
  {
    id: 'ohc-pnw-pollinators-awakening',
    title: 'Spring Pollinators: First Bees & Flies of the Season',
    description:
      'Mason bees (Osmia lignaria), bumblebee queens, and hover flies are among the first pollinators active in PNW spring — sometimes before temperatures reach 10°C. They depend on early-blooming plants like Oregon grape, salmonberry, and willow catkins.',
    weekHint: 32,
    season: 'spring',
    termIds: ['spring-2027'],
    type: ResourceType.PROJECT,
    tier7Activity: {
      instructions:
        'On a warm spring day (above 12°C), walk slowly through a garden, orchard, or park and spend 15 minutes specifically watching flowers for insect visitors. For each visitor you observe: sketch the insect with as much detail as possible (body segments, wing shape, leg color, any pollen baskets?), note which flower it is on, and estimate how long it spends on each flower. Write 3 observations comparing two different pollinator species you saw.',
      materials: [
        'nature journal',
        'pencil',
        'colored pencils',
        'hand lens',
        'thermometer (optional)',
      ],
      minutes: 50,
    },
    tier4Activity: {
      instructions:
        'Find a flower with a bee or butterfly visiting it. Watch it for 1 full minute without touching. Collect 3 different flowers (where allowed). Dictate to a parent: what did the insect look like? Was it fuzzy or smooth? Did it carry any yellow pollen? Which flower had the most visitors?',
      materials: [
        'small bag',
        'crayons',
        'blank paper',
      ],
      minutes: 28,
    },
    sourceUrl: 'https://www.oregonmetro.gov/pollinators',
    bookList: ['The Bees in Your Backyard by Joseph S. Wilson & Olivia Messinger Carril'],
  },
  {
    id: 'ohc-pnw-budbreak-trees',
    title: 'Budbreak: Watching Trees Wake Up',
    description:
      'Budbreak is the moment when dormant tree buds swell and burst open — a reliable indicator of spring phenology. Bigleaf maple, red alder, and cottonwood show dramatic budbreak in the PNW from late February to April depending on elevation.',
    weekHint: 33,
    season: 'spring',
    termIds: ['spring-2027'],
    type: ResourceType.PROJECT,
    tier7Activity: {
      instructions:
        'Choose 3 trees of different species near your home and observe them weekly from late February to April. Each visit: sketch the same branch showing the bud stage (dormant, swelling, cracking, leaves emerging, leaves expanded). Note the date and temperature. Write 3 observations across your weekly visits about which tree broke bud first and what the weather was like each time.',
      materials: [
        'nature journal',
        'pencil',
        'colored pencils',
        'ruler',
        'thermometer (optional)',
      ],
      minutes: 45,
    },
    tier4Activity: {
      instructions:
        'Find a branch with new tiny leaves just coming out. Collect 3 new leaves — they should be sticky or fuzzy and fresh. Dictate to a parent: what color were the new leaves? Did they smell like anything? Were the buds sticky or dry?',
      materials: [
        'small bag',
        'crayons',
        'blank paper',
      ],
      minutes: 25,
    },
    sourceUrl: 'https://www.handbookofnaturestudy.com/outdoor-hour-challenges',
    bookList: ['Trees to Know in Oregon by Edward C. Jensen'],
  },
  {
    id: 'ohc-pnw-spring-pond-life',
    title: 'Spring Pond Dipping & Aquatic Invertebrates',
    description:
      'PNW ponds in spring are teeming with aquatic invertebrates: water striders, backswimmers, diving beetles, caddisfly larvae in cases, and dragonfly nymphs. A white tray and a fine-mesh net reveal an entire underwater community invisible to casual observation.',
    weekHint: 34,
    season: 'spring',
    termIds: ['spring-2027'],
    type: ResourceType.FIELD_TRIP,
    fieldTripLocation: 'Tualatin Hills Nature Park, Beaverton, OR',
    tier7Activity: {
      instructions:
        'At a shallow pond edge, use the dip net to sweep through submerged vegetation and empty the catch into a white tray filled with pond water. Observe each creature for 30 seconds before returning it to the pond. Sketch at least 3 different invertebrates with labeled body parts (head, legs, tail, gills if visible). Write 3 observations: one about locomotion (how each creature moves), one about the most surprising thing you found, one about what you think each creature eats.',
      materials: [
        'nature journal',
        'pencil',
        'colored pencils',
        'fine-mesh dip net',
        'white plastic tray or light-colored bowl',
        'hand lens',
        'rubber boots',
      ],
      minutes: 60,
    },
    tier4Activity: {
      instructions:
        'Watch your sibling use the dip net, then look into the white tray together. Find the biggest creature and the smallest. Collect 3 objects from the pond edge (pebbles, a bit of algae, mud). Dictate to a parent: what was the weirdest creature you saw? How many legs did it have? Did anything pinch?',
      materials: [
        'small bag',
        'crayons',
        'blank paper',
        'rubber boots',
      ],
      minutes: 30,
    },
    sourceUrl: 'https://www.oregonmetro.gov/parks-and-nature/tualatin-hills-nature-park',
    bookList: ['Pond & Stream Safari by Robyn Jasko'],
  },
  {
    id: 'ohc-pnw-osprey-watch',
    title: 'Osprey Return: Nest Platform Watching',
    description:
      'Osprey (Pandion haliaetus) arrive in the Willamette Valley from South America in late March and April. Many nest on utility poles and dedicated platforms over water. Watching osprey fish — hovering, diving feet-first, and emerging with a fish — is one of the most dramatic wildlife spectacles in the PNW.',
    weekHint: 35,
    season: 'spring',
    termIds: ['spring-2027'],
    type: ResourceType.FIELD_TRIP,
    fieldTripLocation: 'Hagg Lake (Scoggins Valley Park), Gaston, OR',
    tier7Activity: {
      instructions:
        'Find an osprey nest platform or shoreline perch at the lake. Observe from a distance using binoculars for at least 15 minutes. In your journal sketch the osprey\'s silhouette in flight (distinctive M-shape) and at rest. Note: does it have fish? Is it incubating eggs? Are there chicks visible? Write 3 observations: one about the nest structure, one about the bird\'s hunting behavior if you witness it, one about which direction it flies when leaving the nest.',
      materials: [
        'nature journal',
        'pencil',
        'colored pencils',
        'binoculars',
      ],
      minutes: 55,
    },
    tier4Activity: {
      instructions:
        'Watch the osprey nest from the lake shore. Count how many osprey you can see. Collect 3 objects from the lakeshore: a pebble, a feather (if found), a leaf. Dictate to a parent: did the osprey bring any fish? Were there baby birds? What sound did the osprey make?',
      materials: [
        'small bag',
        'crayons',
        'blank paper',
      ],
      minutes: 30,
    },
    sourceUrl: 'https://www.oregonmetro.gov/parks-and-nature/hagg-lake',
    bookList: ['The Sibley Guide to Birds by David Allen Sibley'],
  },
  {
    id: 'ohc-pnw-spring-wildflower-trillium-sauvie',
    title: 'Spring Wildflowers on Sauvie Island Bottomlands',
    description:
      'Sauvie Island\'s lowland prairies and forest edges bloom in spring with camas (Camassia quamash), blue-eyed Mary (Collinsia grandiflora), and Oregon white oak woodland wildflowers. This is also prime shorebird migration season on the island.',
    weekHint: 36,
    season: 'spring',
    termIds: ['spring-2027'],
    type: ResourceType.FIELD_TRIP,
    fieldTripLocation: 'Sauvie Island, OR',
    tier7Activity: {
      instructions:
        'Walk a prairie or forest-edge trail during the bloom window (late March to May). Identify and sketch at least 4 wildflower species. For each: draw the flower from above (to show petal arrangement) and from the side (to show the floral tube or spur), note leaf shape and arrangement, and describe the habitat. Write 3 observations comparing two species and hypothesize which pollinators visit each one.',
      materials: [
        'nature journal',
        'pencil',
        'colored pencils',
        'wildflower field guide',
        'hand lens',
        'ruler',
      ],
      minutes: 55,
    },
    tier4Activity: {
      instructions:
        'Find 3 different wildflowers and pick one each (where allowed). At home press them between paper towels in a heavy book. Dictate to a parent: what color was each one? How many petals? Was it taller or shorter than your knee? Which was your favorite?',
      materials: [
        'small bag',
        'heavy book for pressing',
        'paper towels',
        'crayons',
        'blank paper',
      ],
      minutes: 30,
    },
    sourceUrl: 'https://www.oregonmetro.gov/parks-and-nature/sauvie-island',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // WINTER / ANY-SEASON (weekHint 20-27, termIds: fall-2026 or spring-2027)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'ohc-pnw-cloud-watching',
    title: 'Cloud Watching: PNW Cloud Types & Weather Prediction',
    description:
      'The PNW\'s maritime climate produces a rich parade of cloud formations: marine stratus in summer, lenticular caps on Mount Hood, dramatic cumulonimbus in fall storms, and luminous altocumulus in winter. Learning to name and read clouds connects weather science to daily life.',
    weekHint: 20,
    season: 'any',
    termIds: ['fall-2026'],
    type: ResourceType.PROJECT,
    tier7Activity: {
      instructions:
        'Lie on your back in an open area for 10 minutes and observe the sky. In your journal sketch the clouds you see and label each type (cumulus, stratus, cirrus, cumulonimbus, altocumulus — use a cloud chart or app to help). Note the direction they are moving, their approximate height (low, middle, high), and whether the sky is clearing or clouding over. Write 3 observations and predict tomorrow\'s weather based on what you see.',
      materials: [
        'nature journal',
        'pencil',
        'colored pencils (grey, white, blue)',
        'cloud identification chart (printed or app)',
        'compass (optional)',
      ],
      minutes: 45,
    },
    tier4Activity: {
      instructions:
        'Lie on your back outside and look at the clouds for 5 minutes. Find one cloud that looks like an animal or object. Collect 3 things from the ground while you are outside. Dictate to a parent: what did your cloud look like? Was the sky mostly blue or mostly grey? Were the clouds moving fast or slow?',
      materials: [
        'small bag',
        'crayons',
        'blank paper',
      ],
      minutes: 25,
    },
    sourceUrl: 'https://cloudappreciationsociety.org/cloud-types/',
  },
  {
    id: 'ohc-pnw-moss-lichen-study',
    title: 'Moss & Lichen Study: Winter\'s Green Carpet',
    description:
      'Winter rain transforms PNW forests into a world of brilliant green mosses and crusty lichen. Oregon\'s old-growth forests host over 500 lichen species; mosses form the sponge-like understory layer that retains moisture and creates habitat for springtails, mites, and tardigrades.',
    weekHint: 21,
    season: 'any',
    termIds: ['fall-2026'],
    type: ResourceType.FIELD_TRIP,
    fieldTripLocation: 'Forest Park, Portland, OR',
    tier7Activity: {
      instructions:
        'Find a mossy log, rock, and tree trunk within a small area. For each substrate: sketch the moss or lichen growing there, describe the texture (smooth, bumpy, leafy, crusty?), note the color (grey, yellow-green, bright green, orange?), and use a hand lens to look for tiny creatures living in the moss. Write 3 observations: one about the difference between moss and lichen (moss is a plant; lichen is fungi + algae), one about where each grows, and one about what you found living inside the moss.',
      materials: [
        'nature journal',
        'pencil',
        'colored pencils',
        'hand lens (10x)',
        'small watercolor brush (for moving moss gently)',
      ],
      minutes: 50,
    },
    tier4Activity: {
      instructions:
        'Collect 3 small pieces of moss from the ground (not from living trees — look for fallen wood). Bring them home and look at them under a hand lens. Dictate to a parent: what did the moss feel like — wet or dry? Did you see any tiny bugs? What color was each piece?',
      materials: [
        'small bag',
        'hand lens',
        'crayons',
        'blank paper',
      ],
      minutes: 28,
    },
    sourceUrl: 'https://www.fs.usda.gov/pnw/',
    bookList: ['Gathering Moss by Robin Wall Kimmerer'],
  },
  {
    id: 'ohc-pnw-bird-feeder-count',
    title: 'Bird Feeder Count: Christmas Bird Count for Kids',
    description:
      'Winter bird feeder counts — like the Cornell Lab\'s Project FeederWatch — connect home observation to citizen science. Common PNW backyard winter birds include dark-eyed juncos, house finches, bushtits, song sparrows, spotted towhees, and varied thrushes.',
    weekHint: 22,
    season: 'any',
    termIds: ['fall-2026'],
    type: ResourceType.PROJECT,
    tier7Activity: {
      instructions:
        'Set up at a window with a view of your bird feeder. Count birds for 15 minutes (note the highest number of each species present at the same time — not cumulative). For each species: sketch the bird with field marks labeled (eye ring, wing bars, breast spots), note its behavior at the feeder (dominant, shy, stays long or grabs and goes?). Write 3 observations: one about the most common species, one about any species you did not expect, one about the time of day relative to bird activity.',
      materials: [
        'nature journal',
        'pencil',
        'colored pencils',
        'binoculars',
        'bird field guide or Merlin app',
        'bird feeder with seed (set up before the session)',
      ],
      minutes: 45,
    },
    tier4Activity: {
      instructions:
        'Sit at the window with a parent and count birds at the feeder. Find your favorite bird — the prettiest or funniest one. Collect 3 objects from the yard. Dictate to a parent: what was the name of your favorite bird? How many birds came while you were watching? Did any bird chase another bird away?',
      materials: [
        'small bag',
        'crayons',
        'blank paper',
      ],
      minutes: 25,
    },
    sourceUrl: 'https://feederwatch.org',
    bookList: ['The Sibley Guide to Birds by David Allen Sibley'],
  },
  {
    id: 'ohc-pnw-animal-tracks-mud',
    title: 'Animal Track Identification in Mud & Snow',
    description:
      'PNW trails reveal a surprising variety of tracks in winter mud: raccoon, beaver, coyote, mink, great blue heron, river otter, and black-tailed deer are all trackable in lowland parks. Reading tracks teaches deductive reasoning and animal behavior from indirect evidence.',
    weekHint: 23,
    season: 'any',
    termIds: ['fall-2026'],
    type: ResourceType.FIELD_TRIP,
    fieldTripLocation: 'Tualatin River National Wildlife Refuge, Sherwood, OR',
    tier7Activity: {
      instructions:
        'Walk a muddy trail or streambank after wet weather. When you find tracks: measure their length and width with a ruler, count the toes, sketch the print with straddle (distance between left and right tracks) and stride (distance between steps) noted. Attempt to identify the animal using a track guide. Write 3 observations: one about what the track pattern suggests (walking, running, hopping?), one about the habitat where you found it, one about what the animal might have been doing there.',
      materials: [
        'nature journal',
        'pencil',
        'colored pencils',
        'ruler or small tape measure',
        'animal track field guide',
        'rubber boots',
      ],
      minutes: 55,
    },
    tier4Activity: {
      instructions:
        'Find 3 animal tracks in the mud. Press your own hand into the mud next to one track to compare sizes. Collect 3 small mud-encrusted pebbles. Dictate to a parent: how many toes did the track have? Was it bigger or smaller than your hand? What animal do you think made it?',
      materials: [
        'small bag',
        'crayons',
        'blank paper',
        'rubber boots',
      ],
      minutes: 30,
    },
    sourceUrl: 'https://www.fws.gov/refuge/tualatin-river',
    bookList: ['Animal Tracks of the Pacific Northwest by Ian Sheldon & Tamara Hartson'],
  },
  {
    id: 'ohc-pnw-weather-journaling',
    title: 'Weather Journaling: A Month of PNW Skies',
    description:
      'Keeping a daily weather log over 4 weeks builds phenological awareness and shows the PNW\'s climate patterns: frequent marine air inversions, atmospheric rivers, and the rain shadow east of the Coast Range. Consistent observation is the cornerstone of both science and Charlotte Mason nature study.',
    weekHint: 24,
    season: 'any',
    termIds: ['fall-2026'],
    type: ResourceType.PROJECT,
    tier7Activity: {
      instructions:
        'Each morning for 4 weeks, spend 5 minutes outside observing the weather before school. In your journal: record the date, temperature (if you have a thermometer), sky condition (clear, partly cloudy, overcast, foggy), precipitation (none, drizzle, rain, heavy rain), wind (still, light, moderate, strong), and one surprising or interesting observation. At the end of 4 weeks, count the rainy days vs. clear days and write 3 observations about patterns you noticed.',
      materials: [
        'nature journal (dedicated weather section)',
        'pencil',
        'outdoor thermometer (optional)',
        'rain gauge (optional)',
      ],
      minutes: 45,
    },
    tier4Activity: {
      instructions:
        'Each morning, go outside with a parent and say three words to describe the weather: one for sky color, one for how cold or warm it is, one for whether it is wet or dry. On Fridays, collect 3 outdoor objects that show the week\'s weather (a wet leaf, a dried pine needle, a frosty twig). Dictate your favorite weather day from the week.',
      materials: [
        'small bag',
        'crayons',
        'blank paper',
      ],
      minutes: 25,
    },
    sourceUrl: 'https://www.noaa.gov/education/resource-collections/weather-atmosphere/weather-observations',
  },
  {
    id: 'ohc-pnw-evergreen-id-home',
    title: 'Evergreen Identification Walk: Home Neighborhood',
    description:
      'PNW neighborhoods and parks contain a rich mix of native and introduced conifers: Douglas-fir, western hemlock, Sitka spruce, incense cedar, Port Orford cedar, and shore pine are all common. Learning to identify them by branching pattern, needle arrangement, cone shape, and bark makes every neighborhood walk a botany lesson.',
    weekHint: 25,
    season: 'any',
    termIds: ['fall-2026'],
    type: ResourceType.PROJECT,
    tier7Activity: {
      instructions:
        'Walk your neighborhood for 20 minutes with the goal of identifying 5 different conifer species. For each: sketch a branch section showing how needles attach (single vs. bundles, spiral vs. two-ranked), collect a fallen cone or seed if present, note bark color and texture, and write the address or location where you found it. Write 3 observations about which species are most common in your neighborhood and speculate why.',
      materials: [
        'nature journal',
        'pencil',
        'colored pencils',
        'small bag for samples',
        'tree field guide or Seek app',
      ],
      minutes: 50,
    },
    tier4Activity: {
      instructions:
        'Walk with a parent and collect one fallen branch tip or cone from 3 different trees. Lay them on the kitchen table and sort them: which has long needles, which has short needles, which has flat sprays? Dictate to a parent: which tree was tallest? Which smelled strongest when you rubbed a needle?',
      materials: [
        'small bag',
        'crayons',
        'blank paper',
      ],
      minutes: 28,
    },
    sourceUrl: 'https://www.handbookofnaturestudy.com/outdoor-hour-challenges',
    bookList: ['Trees to Know in Oregon by Edward C. Jensen'],
  },
  {
    id: 'ohc-pnw-owl-calls-dusk',
    title: 'Owl Calls at Dusk: Listening Walk',
    description:
      'The Pacific Northwest hosts barred owl, great horned owl, northern spotted owl, western screech-owl, and barn owl. Great horned owls begin hooting in January; barred owls are audible year-round. A dusk listening walk teaches silent observation, spatial sound tracking, and the ethics of wildlife disturbance.',
    weekHint: 26,
    season: 'any',
    termIds: ['fall-2026'],
    type: ResourceType.PROJECT,
    tier7Activity: {
      instructions:
        'Begin your listening walk 30 minutes before sunset. Walk slowly with no talking for at least 10 minutes. In your journal: use a simple compass-rose diagram to mark the direction each sound comes from. Write down every sound you hear (bird, frog, traffic, wind) using your own descriptive words. Note the light level when you first hear an owl. Write 3 observations: one about the owl call itself (rhythm, number of notes, low or high?), one about how the forest soundscape changes as it gets darker, and one about how you felt during the silence.',
      materials: [
        'nature journal',
        'pencil',
        'headlamp (red-light mode)',
        'Merlin Bird ID app (for confirmation)',
      ],
      minutes: 50,
    },
    tier4Activity: {
      instructions:
        'Stand outside at dusk and be completely quiet for 2 minutes. Collect 3 dark-colored objects that are hard to see at dusk: a dark pebble, a twig, a leaf. Dictate to a parent: did you hear any owls? What other sounds did you hear? Was it scary or exciting to be outside when it was getting dark?',
      materials: [
        'small bag',
        'crayons',
        'blank paper',
        'headlamp',
      ],
      minutes: 25,
    },
    sourceUrl: 'https://www.allaboutbirds.org/guide/browse/region/Oregon',
    bookList: ['Owls of the World: A Photographic Guide by Heimo Mikkola'],
  },
  {
    id: 'ohc-pnw-rain-garden-observation',
    title: 'Rain Garden & Stormwater Ecology in Urban Parks',
    description:
      'Metro Portland\'s parks feature engineered rain gardens and bioswales that filter stormwater while creating wetland habitat. Observing them after a storm reveals how urban water management mimics natural processes — and creates surprising wildlife habitat in the middle of the city.',
    weekHint: 27,
    season: 'any',
    termIds: ['fall-2026'],
    type: ResourceType.FIELD_TRIP,
    fieldTripLocation: 'Tualatin Hills Nature Park, Beaverton, OR',
    tier7Activity: {
      instructions:
        'Visit a rain garden or bioswale after a significant rain event (within 24 hours). Observe the water flow: where does water enter, how does it slow down, what plants are growing in it? Sketch the rain garden from above (bird\'s eye view) and from the side, showing the water level and plant zones. Write 3 observations: one about the plants adapted to wet-dry cycles, one about any wildlife you see using the garden, one about how this is different from a natural wetland.',
      materials: [
        'nature journal',
        'pencil',
        'colored pencils',
        'rubber boots',
      ],
      minutes: 45,
    },
    tier4Activity: {
      instructions:
        'Find a puddle or small pool in the rain garden and look for any creatures in or near it. Collect 3 wet objects: a pebble, a soggy leaf, a twig. Dictate to a parent: how deep was the water? Could you see the bottom? Did anything swim or walk through the water?',
      materials: [
        'small bag',
        'crayons',
        'blank paper',
        'rubber boots',
      ],
      minutes: 28,
    },
    sourceUrl: 'https://www.oregonmetro.gov/parks-and-nature/tualatin-hills-nature-park',
  },
];
