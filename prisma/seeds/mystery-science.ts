import { PrismaClient, ResourceType, Subject } from '@prisma/client';

type ResourceInput = {
  id: string;
  title: string;
  description: string;
  weekHint: number;
  season: string; // "summer" | "fall" | "spring" | "any"
  termIds: string[];
  tier7Activity: { instructions: string; materials: string[]; minutes: number };
  tier4Activity: { instructions: string; materials: string[]; minutes: number };
  sourceUrl: string;
  videoUrl?: string;
};

async function upsertResource(prisma: PrismaClient, r: ResourceInput) {
  const fixed = {
    framework: 'Mystery Science',
    subject: Subject.SCIENCE,
    type: ResourceType.VIDEO,
    ageRange: '5-8',
    ageRangeMin: 5,
    ageRangeMax: 8,
    tags: ['video-led', 'hands-on', 'indoor', 'monday'],
    bookList: [] as string[],
    active: true,
  };
  await prisma.curriculumResource.upsert({
    where: { id: r.id },
    update: {
      ...fixed,
      title: r.title,
      description: r.description,
      weekHint: r.weekHint,
      season: r.season,
      termIds: r.termIds,
      activities: { tier7: r.tier7Activity, tier4: r.tier4Activity },
      sourceUrl: r.sourceUrl,
      videoUrl: r.videoUrl ?? r.sourceUrl,
      materials: [...new Set([...r.tier7Activity.materials, ...r.tier4Activity.materials])],
    },
    create: {
      id: r.id,
      ...fixed,
      title: r.title,
      description: r.description,
      weekHint: r.weekHint,
      season: r.season,
      termIds: r.termIds,
      activities: { tier7: r.tier7Activity, tier4: r.tier4Activity },
      sourceUrl: r.sourceUrl,
      videoUrl: r.videoUrl ?? r.sourceUrl,
      materials: [...new Set([...r.tier7Activity.materials, ...r.tier4Activity.materials])],
    },
  });
}

export async function seedMysteryScience(prisma: PrismaClient) {
  for (const r of MYSTERY_SCIENCE_LESSONS) {
    await upsertResource(prisma, r);
  }
  console.log(`  • Mystery Science: ${MYSTERY_SCIENCE_LESSONS.length} lessons seeded`);
}

// ============================================================================
// K-2 Mystery Science Lessons (~30)
// Sources:
//   https://mysteryscience.com/animal-secrets/animal-needs
//   https://mysteryscience.com/plant-secrets/plant-needs
//   https://mysteryscience.com/storms/severe-weather
//   https://mysteryscience.com/sunlight/sunlight-warmth
//   https://mysteryscience.com/pushes/pushes-pulls
//   https://mysteryscience.com/sky/sun-moon-stars
//   https://mysteryscience.com/animal-superpowers/animal-traits-survival
//   https://mysteryscience.com/plant-superpowers/plant-traits-survival
//   https://mysteryscience.com/light/light-sound-communication
//   https://mysteryscience.com/biodiversity/animal-biodiversity-habitats
//   https://mysteryscience.com/water/erosion-earth-s-surface
//   https://mysteryscience.com/materials/material-properties
// ============================================================================

const MYSTERY_SCIENCE_LESSONS: ResourceInput[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // LIFE SCIENCE — Animal Needs (K)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'ms-k-animal-needs-1',
    title: 'Animal Needs: Food (Why do woodpeckers peck wood?)',
    description:
      'Students observe animal behaviors to identify a pattern: all animals must seek food to survive. Kids imitate animals like quail, raccoons, and woodpeckers foraging for their specific foods.',
    weekHint: 1,
    season: 'summer',
    termIds: ['summer-2026'],
    tier7Activity: {
      instructions:
        'Watch the Mystery Science video, then do the "Eat Like an Animal" movement activity: act out how quail scratch in dirt, raccoons wade in water, and woodpeckers peck logs to find food. After the activity write 1-2 sentences about what surprised you about how animals find food.',
      materials: ['open floor space'],
      minutes: 40,
    },
    tier4Activity: {
      instructions:
        'Watch the video alongside your older sibling. Join the movement activity by picking one animal to imitate. Draw your chosen animal finding its food and label what the animal is eating.',
      materials: ['crayons', 'blank paper'],
      minutes: 25,
    },
    sourceUrl: 'https://mysteryscience.com/animal-secrets/animal-needs',
  },
  {
    id: 'ms-k-animal-needs-2',
    title: 'Animal Needs: Shelter (Where do animals live?)',
    description:
      "Through a read-along story, Sofia explores animal habitats. Students role-play as squirrels while learning about the different kinds of homes animals need to feel safe.",
    weekHint: 2,
    season: 'summer',
    termIds: ['summer-2026'],
    tier7Activity: {
      instructions:
        "Watch the Mystery Science video and join the read-along story with Sofia. Participate in the squirrel role-play. Afterwards, write 1-2 sentences describing what shelter means for a specific animal of your choice.",
      materials: ['open floor space'],
      minutes: 40,
    },
    tier4Activity: {
      instructions:
        'Watch the video and listen to the story. Act out being a squirrel finding its home. Draw your favorite animal in its shelter and tell your sibling why that animal needs that specific home.',
      materials: ['crayons', 'blank paper'],
      minutes: 25,
    },
    sourceUrl: 'https://mysteryscience.com/animal-secrets/animal-needs',
  },
  {
    id: 'ms-k-animal-needs-3',
    title: 'Animal Needs: Safety (How can you find animals in the woods?)',
    description:
      'Students discover that all animals seek safety to survive by observing behavioral patterns. The movement activity has kids pretend to be snails hiding, praying mantises scaring predators, and gophers popping out of holes.',
    weekHint: 3,
    season: 'summer',
    termIds: ['summer-2026'],
    tier7Activity: {
      instructions:
        'Watch the video, then do the "Gopher in a Hole" movement activity: act out a snail hiding in its shell, a praying mantis scaring a predator, and a gopher popping out of its hole. Write 1-2 sentences about the different ways animals stay safe.',
      materials: ['open floor space'],
      minutes: 40,
    },
    tier4Activity: {
      instructions:
        'Watch with your sibling and join the movement activity. Pick your favorite animal safety behavior and demonstrate it. Draw that animal using its safety trick and explain it to someone.',
      materials: ['crayons', 'blank paper'],
      minutes: 25,
    },
    sourceUrl: 'https://mysteryscience.com/animal-secrets/animal-needs',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // LIFE SCIENCE — Plant Needs (K)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'ms-k-plant-needs-1',
    title: 'Plant Needs: Are Plants Alive?',
    description:
      'Students observe plants to identify their needs and recognize them as living organisms. The "Plant Dance" activity has students model how plants look when their needs are and aren\'t met.',
    weekHint: 4,
    season: 'spring',
    termIds: ['spring-2027'],
    tier7Activity: {
      instructions:
        'Watch the Mystery Science video about living vs. nonliving things. Do the "Plant Dance" by acting out a healthy plant (upright arms, bright face) vs. a wilting plant (drooping, sad). Play the Sun for Sunlight game using the printout. Write 1-2 sentences about what makes a plant alive.',
      materials: ['Sun for Sunlight Game printout (black & white)'],
      minutes: 40,
    },
    tier4Activity: {
      instructions:
        'Watch the video with your sibling and join the Plant Dance movement. Use crayons to draw a happy healthy plant next to a wilting unhealthy plant, labeling what each plant needs.',
      materials: ['crayons', 'blank paper'],
      minutes: 25,
    },
    sourceUrl: 'https://mysteryscience.com/plant-secrets/plant-needs',
  },
  {
    id: 'ms-k-plant-needs-2',
    title: 'Plant Needs: Water & Light (How do plants and trees grow?)',
    description:
      'Students investigate what plants require to grow. In the two-part "Sprout a Seed" activity, kids plant radish seeds and observe how the leaves lean toward light, while a root viewer shows underground growth.',
    weekHint: 5,
    season: 'spring',
    termIds: ['spring-2027'],
    tier7Activity: {
      instructions:
        'Watch the video. Plant radish seeds in a Dixie cup with peat pellets or potting soil. Make a classroom root viewer by placing a damp paper towel and a few seeds in a Ziploc bag taped to the window. Over the next 1-2 weeks observe how roots grow down and leaves lean toward light. Write 1-2 sentences about what the plant is doing and why.',
      materials: [
        'radish seeds',
        'Dixie cups',
        'peat pellets or potting soil',
        'paper towels',
        'Ziploc bags',
        'spray bottle',
        'tape',
      ],
      minutes: 45,
    },
    tier4Activity: {
      instructions:
        'Watch the video with your sibling. Help plant one radish seed in your own cup and water it gently. Check on it daily and draw what you see each time. Tell your sibling when you notice the leaves leaning toward the window.',
      materials: ['radish seeds', 'Dixie cup', 'potting soil', 'crayons', 'blank paper'],
      minutes: 30,
    },
    sourceUrl: 'https://mysteryscience.com/plant-secrets/plant-needs',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // EARTH & SPACE — Severe Weather (K)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'ms-k-severe-weather-1',
    title: 'Severe Weather: Getting Ready (How can you get ready for a big storm?)',
    description:
      "Students listen to a digital storybook about JJ and his grandfather preparing for a thunderstorm, learning how weather forecasts are tools for storm preparedness.",
    weekHint: 11,
    season: 'fall',
    termIds: ['fall-2026'],
    tier7Activity: {
      instructions:
        'Watch the Mystery Science video and listen to the JJ story. Discuss what your family does to prepare when a storm is coming. Write 1-2 sentences about one specific way people stay safe during severe weather.',
      materials: [],
      minutes: 35,
    },
    tier4Activity: {
      instructions:
        'Watch the video with your sibling. Draw a picture of what JJ and his grandfather did to prepare for the storm, and share it with the family at dinner.',
      materials: ['crayons', 'blank paper'],
      minutes: 20,
    },
    sourceUrl: 'https://mysteryscience.com/storms/severe-weather',
  },
  {
    id: 'ms-k-severe-weather-2',
    title: 'Severe Weather: Wind (Have you ever watched a storm?)',
    description:
      'Students observe weather changes during approaching storms and build a simple wind-detection streamer tool to measure wind intensity outside.',
    weekHint: 12,
    season: 'fall',
    termIds: ['fall-2026'],
    tier7Activity: {
      instructions:
        'Watch the video about wind and storms. Build a wind detector: tape 2-foot crepe paper streamers to an index card, then take it outside and observe how the streamers move in different wind conditions. Record your observations by writing 1-2 sentences about how strong or gentle the wind was today and what the streamers showed.',
      materials: [
        'markers',
        'file folder label stickers',
        'index card (3x5)',
        'pipe cleaner',
        'crepe paper streamers (2-foot length)',
        'tape',
      ],
      minutes: 45,
    },
    tier4Activity: {
      instructions:
        'Watch the video and help assemble your wind detector. Go outside with your sibling and hold your streamer tool. Draw what the streamers look like in calm air vs. windy air and describe which you prefer.',
      materials: ['index card', 'crepe paper streamers (1-foot length)', 'tape', 'crayons'],
      minutes: 30,
    },
    sourceUrl: 'https://mysteryscience.com/storms/severe-weather',
  },
  {
    id: 'ms-k-severe-weather-3',
    title: 'Weather Conditions (How many different kinds of weather are there?)',
    description:
      'Students examine and describe weather characteristics — sun visibility, temperature, wind, and precipitation — by going outside and creating detailed weather observation drawings.',
    weekHint: 13,
    season: 'fall',
    termIds: ['fall-2026'],
    tier7Activity: {
      instructions:
        'Watch the video about different weather types. Take your clipboard outside and observe today\'s weather. Fill in the weather drawing printout by illustrating what the sky looks like, what you feel, and whether there is wind or precipitation. Write 1-2 sentences on the back comparing today\'s weather to yesterday\'s.',
      materials: [
        'weather drawing printout',
        'clipboard',
        'crayons (multiple colors)',
      ],
      minutes: 40,
    },
    tier4Activity: {
      instructions:
        'Go outside with your sibling to observe the weather. Use crayons on blank paper to draw the sky, the trees, and yourself dressed for today\'s weather. Share your drawing and say one thing you notice about today\'s weather.',
      materials: ['crayons', 'blank paper', 'clipboard'],
      minutes: 25,
    },
    sourceUrl: 'https://mysteryscience.com/storms/severe-weather',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // EARTH & SPACE — Sunlight & Warmth (K)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'ms-k-sunlight-warmth-1',
    title: 'Sunlight & Warmth: Hot Pavement (How could you walk barefoot across hot pavement?)',
    description:
      'Students explore how sunlight warms the Earth\'s surface through a storybook where Keya must cross hot pavement, then design shade paths for farm animals in the "Cool Cows" activity.',
    weekHint: 6,
    season: 'summer',
    termIds: ['summer-2026'],
    tier7Activity: {
      instructions:
        'Watch the Mystery Science video. Use the "Find A Cool Path For Keya" printout to design a shady route for Keya to walk. Then think about how shade helps farm animals stay cool. Write 1-2 sentences explaining why shade makes pavement cooler and how that helps living things.',
      materials: ['"Find A Cool Path For Keya" printout', 'crayons'],
      minutes: 40,
    },
    tier4Activity: {
      instructions:
        'Watch the video with your sibling. On blank paper draw Keya\'s path from the pool to the ice cream truck, adding shade trees or awnings to keep her feet cool. Share your design and explain it.',
      materials: ['crayons', 'blank paper'],
      minutes: 25,
    },
    sourceUrl: 'https://mysteryscience.com/sunlight/sunlight-warmth',
  },
  {
    id: 'ms-k-sunlight-warmth-2',
    title: 'Sunlight, Warming & Engineering (How could you warm up a frozen playground?)',
    description:
      'Students learn about cities that receive no winter sunlight, then use reflective and transparent materials to redirect light in the "Chill City" experiment.',
    weekHint: 14,
    season: 'fall',
    termIds: ['fall-2026'],
    tier7Activity: {
      instructions:
        'Watch the video about cities without winter sunlight. Set up the "Chill City" experiment: use aluminum foil (reflective), black construction paper (absorbing), and a clear plastic report cover (transparent) to direct lamplight onto a paper town. Test which material warms your paper town fastest. Write 1-2 sentences about what you discovered.',
      materials: [
        'Chill City printout',
        'ruler',
        'aluminum foil',
        'black construction paper',
        'clear plastic report cover',
        'desk lamp or bright window',
        'index cards (3x5)',
        'dot stickers',
      ],
      minutes: 50,
    },
    tier4Activity: {
      instructions:
        'Help your sibling set up the Chill City experiment. Pick one material — aluminum foil or black paper — and hold it to redirect the light. Draw the material you tested and circle whether it warmed or cooled the town.',
      materials: ['aluminum foil', 'crayons', 'blank paper'],
      minutes: 30,
    },
    sourceUrl: 'https://mysteryscience.com/sunlight/sunlight-warmth',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PHYSICAL SCIENCE — Pushes & Pulls (K)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'ms-k-pushes-pulls-1',
    title: 'Pushes & Pulls: Digging Machines (What\'s the biggest excavator?)',
    description:
      'Students discover that pushes and pulls are involved in any kind of work machines do. In "Be a Digging Machine" kids act out using shovels and excavators to dig a swimming pool.',
    weekHint: 7,
    season: 'any',
    termIds: ['summer-2026'],
    tier7Activity: {
      instructions:
        'Watch the Mystery Science video about excavators and construction. Do the "Be a Digging Machine" activity: stand up and act out digging with a shovel (push the shovel down, scoop up dirt, toss it aside), then pretend you\'re controlling a giant excavator arm. Write 1-2 sentences describing the difference between a push and a pull you used while digging.',
      materials: ['open floor space'],
      minutes: 35,
    },
    tier4Activity: {
      instructions:
        'Watch the video with your sibling and join the digging activity. Act out your best excavator arm scooping dirt. Draw a big excavator digging a hole and show the arrows for push and pull.',
      materials: ['crayons', 'blank paper'],
      minutes: 20,
    },
    sourceUrl: 'https://mysteryscience.com/pushes/pushes-pulls',
  },
  {
    id: 'ms-k-pushes-pulls-2',
    title: 'Forces: Wrecking Ball (How can you knock down a wall made of concrete?)',
    description:
      'Students experiment with changing a wrecking ball\'s force and direction. In "Don\'t Crush That House" they knock down cups without toppling paper houses by controlling their pushes.',
    weekHint: 8,
    season: 'any',
    termIds: ['summer-2026'],
    tier7Activity: {
      instructions:
        'Watch the video about wrecking balls and force direction. Set up the "Don\'t Crush That House" game: tape paper house printouts in a row, stack plastic cups as "walls" between them, and swing a ball of tape-balled paper at the cups. Adjust the angle and speed to knock the cup wall without hitting the houses. Write 1-2 sentences about how you changed the direction or strength of your force.',
      materials: [
        'game station printout',
        'blank paper',
        'masking tape',
        'plastic cups (6)',
        'yardstick',
        'binder clips',
        'string',
      ],
      minutes: 45,
    },
    tier4Activity: {
      instructions:
        'Watch the video with your sibling and help set up the cup wall. Take turns swinging the paper wrecking ball. Draw what happened to the cups and houses and explain which push worked best.',
      materials: ['plastic cups (3)', 'blank paper', 'tape', 'crayons'],
      minutes: 30,
    },
    sourceUrl: 'https://mysteryscience.com/pushes/pushes-pulls',
  },
  {
    id: 'ms-k-pushes-pulls-3',
    title: 'Forces & Engineering: Trap Design (How could you invent a trap?)',
    description:
      'A creative engineering lesson where students imagine machines and traps. After exploring how forces work in read-along stories, kids sketch an invention that uses pushes or pulls to do a helpful household task.',
    weekHint: 9,
    season: 'any',
    termIds: ['summer-2026'],
    tier7Activity: {
      instructions:
        'Watch the video and listen to the read-along story about trap design. Brainstorm a machine that helps with a household chore using pushes and/or pulls (e.g., an automatic door-opener, a shoe-tying machine). Sketch your invention and label the pushes and pulls. Write 1-2 sentences explaining what problem your machine solves.',
      materials: ['blank paper', 'crayons or colored pencils'],
      minutes: 40,
    },
    tier4Activity: {
      instructions:
        'Listen to the read-along story with your sibling. Draw your own silly invention — it can be anything! Show where it pushes and where it pulls something. Share your drawing with the family.',
      materials: ['blank paper', 'crayons'],
      minutes: 25,
    },
    sourceUrl: 'https://mysteryscience.com/pushes/pushes-pulls',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // EARTH & SPACE — Sun, Moon & Stars (1st grade)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'ms-1-sun-moon-stars-1',
    title: 'Sun & Shadows (Could a statue\'s shadow move?)',
    description:
      'Students investigate what causes shadows to move throughout the day by exploring how light position affects shadow placement, using paper gnomes and flashlights.',
    weekHint: 15,
    season: 'any',
    termIds: ['fall-2026'],
    tier7Activity: {
      instructions:
        'Watch the Mystery Science video about sun and shadows. Set up a paper gnome on a sheet of paper. Shine a flashlight from different angles — morning (low left), noon (overhead), and afternoon (low right) — and trace each shadow with a pencil. Write 1-2 sentences explaining why the shadow changes position and length throughout the day.',
      materials: [
        'paper gnome printout',
        'flashlight',
        'tape',
        'blank paper',
        'pencil',
        'markers',
      ],
      minutes: 45,
    },
    tier4Activity: {
      instructions:
        'Watch the video with your sibling. Hold the paper gnome on the paper while your sibling shines the flashlight from different angles. Draw one shadow and color it in. Tell your sibling one thing you noticed.',
      materials: ['paper gnome printout', 'flashlight', 'crayons', 'blank paper'],
      minutes: 25,
    },
    sourceUrl: 'https://mysteryscience.com/sky/sun-moon-stars',
  },
  {
    id: 'ms-1-sun-moon-stars-2',
    title: 'Sun\'s Daily Path (How can the Sun help you if you\'re lost?)',
    description:
      'Students create a mobile "Sun Finder" model demonstrating the sun\'s daily path across the sky from east to west, using it to understand cardinal directions.',
    weekHint: 16,
    season: 'any',
    termIds: ['fall-2026'],
    tier7Activity: {
      instructions:
        'Watch the video about the sun\'s daily path. Assemble the Sun Finder model using the printout, scissors, three-hole punch, and a paper fastener so the sun moves along its arc. Step outside at a set time and use your model to figure out which direction is east and which is west. Write 1-2 sentences about what direction the sun was in and what time of day it was.',
      materials: [
        'Sun Finder printout',
        'scissors',
        'three-hole punch',
        'paper fastener (brad)',
      ],
      minutes: 45,
    },
    tier4Activity: {
      instructions:
        'Watch the video with your sibling. Help cut out and assemble the Sun Finder. Go outside and point to where the sun is in the sky. Draw a picture of the sun\'s position and label morning, noon, and afternoon.',
      materials: ['Sun Finder printout', 'scissors', 'crayons'],
      minutes: 30,
    },
    sourceUrl: 'https://mysteryscience.com/sky/sun-moon-stars',
  },
  {
    id: 'ms-1-sun-moon-stars-3',
    title: 'Moon Phases (When can you see the full moon?)',
    description:
      'Students observe moon photos taken over four weeks and identify patterns in how the Moon\'s shape changes, creating a Moon Book to predict future full moons.',
    weekHint: 17,
    season: 'any',
    termIds: ['fall-2026'],
    tier7Activity: {
      instructions:
        'Watch the video about moon phases. Assemble your Moon Book using the printout and pipe cleaner binding. Study the photos of the moon over 28 days — put them in order from new moon to full moon and back. Write 1-2 sentences predicting when the next full moon will occur based on the pattern you found.',
      materials: [
        'Moon Book printout',
        'scissors',
        'pipe cleaners',
        'pencil',
      ],
      minutes: 45,
    },
    tier4Activity: {
      instructions:
        'Watch the video with your sibling and look at the moon photos together. Find the full moon and the new moon (when it\'s dark). Draw your favorite moon phase and write or dictate what it is called.',
      materials: ['Moon Book printout', 'crayons'],
      minutes: 25,
    },
    sourceUrl: 'https://mysteryscience.com/sky/sun-moon-stars',
  },
  {
    id: 'ms-1-sun-moon-stars-4',
    title: 'Stars & Daily Patterns (Why do the stars come out at night?)',
    description:
      'Students use paper cups to model why stars are invisible during the day, investigating how the sun\'s bright light drowns out starlight and how the Big Dipper can be observed.',
    weekHint: 18,
    season: 'any',
    termIds: ['fall-2026'],
    tier7Activity: {
      instructions:
        'Watch the video explaining why stars disappear in daylight. Make a Big Dipper star viewer: use a push pin to poke the Big Dipper pattern into the bottom of a paper cup. Shine a flashlight through the cup in a dark room to see the constellation projected. Write 1-2 sentences about why you cannot see stars during the day even though they\'re always there.',
      materials: [
        'paper cup',
        'push pin',
        'flashlight',
        'Big Dipper printout',
        'dot stickers',
      ],
      minutes: 40,
    },
    tier4Activity: {
      instructions:
        'Watch the video with your sibling. Help poke the star holes in the cup with a push pin (carefully!). Hold the cup up to the flashlight in a dim room and look at the star pattern. Draw the Big Dipper pattern you see and color the background black.',
      materials: ['paper cup', 'push pin (adult-supervised)', 'flashlight', 'crayons', 'blank paper'],
      minutes: 25,
    },
    sourceUrl: 'https://mysteryscience.com/sky/sun-moon-stars',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // LIFE SCIENCE — Animal Traits & Survival (1st grade)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'ms-1-animal-traits-1',
    title: 'Parent & Offspring Traits (How can you help a lost baby animal find its parents?)',
    description:
      'Students observe parent and baby animals to identify shared traits, then use evidence to match lost baby birds with their parents in the "Baby Bird Rescue" activity.',
    weekHint: 19,
    season: 'spring',
    termIds: ['spring-2027'],
    tier7Activity: {
      instructions:
        'Watch the Mystery Science video about inherited traits. Study the Baby Birds printout and try to match each baby bird to its parent based on traits like color, beak shape, and feather pattern. Write 1-2 sentences about the specific traits that helped you identify which babies belong to which parents.',
      materials: [
        'Baby Birds printout (3 copies)',
        'envelopes (for card sorting)',
        'markers',
      ],
      minutes: 45,
    },
    tier4Activity: {
      instructions:
        'Watch the video with your sibling. Look at the Baby Birds printout and point to the babies and parents you think match. Draw a baby bird next to its parent and circle one trait they share.',
      materials: ['Baby Birds printout', 'crayons'],
      minutes: 25,
    },
    sourceUrl: 'https://mysteryscience.com/animal-superpowers/animal-traits-survival',
  },
  {
    id: 'ms-1-animal-traits-2',
    title: 'Offspring Trait Variation (Can you predict what an animal\'s babies will look like?)',
    description:
      'Students explore how offspring resemble but differ from their parents. The "Possible Puppies" game models how puppies inherit traits while showing individual variation.',
    weekHint: 20,
    season: 'spring',
    termIds: ['spring-2027'],
    tier7Activity: {
      instructions:
        'Watch the video about trait inheritance and variation. Play the "Possible Puppies" game: flip a penny to decide which trait (head = mom\'s, tail = dad\'s) each puppy inherits for coat color, eye color, and ear shape. Color your puppy worksheet based on the coin flips. Write 1-2 sentences about why your puppy looks similar to but different from its parents.',
      materials: [
        'Possible Puppy worksheet',
        'Puppy Parents worksheet',
        'crayons (black, brown, yellow, blue, pink)',
        'Dixie cup (3 oz)',
        'penny',
      ],
      minutes: 45,
    },
    tier4Activity: {
      instructions:
        'Watch the video with your sibling. Flip a penny to pick one trait for your puppy (heads = one color, tails = another). Draw and color your puppy with that trait. Compare your puppy to your sibling\'s and see what\'s different.',
      materials: ['blank paper', 'crayons', 'penny'],
      minutes: 30,
    },
    sourceUrl: 'https://mysteryscience.com/animal-superpowers/animal-traits-survival',
  },
  {
    id: 'ms-1-animal-traits-3',
    title: 'Animal Structures & Survival (Why do birds have beaks?)',
    description:
      'Students investigate how different beak shapes match different food types in the "Find the Best Beak" experiment, using household objects as improvised beaks to collect model food.',
    weekHint: 21,
    season: 'spring',
    termIds: ['spring-2027'],
    tier7Activity: {
      instructions:
        'Watch the video about bird beaks and food. Set up the "Find the Best Beak" experiment: use a straw (tubular beak), a clothespin or fingers pinched tight (tweezers beak), and a spoon (scooping beak). Try to pick up dried beans (seeds) and elbow macaroni (worms/insects) with each "beak" and count how many each collects in 30 seconds. Write 1-2 sentences about which beak works best for which food and why.',
      materials: [
        'Bird Beaks worksheet',
        'dried black beans (1/4 cup)',
        'elbow macaroni (1/4 cup)',
        'Dixie cups (4)',
        'plastic straws (2)',
        'masking tape',
        'paper cups (2)',
      ],
      minutes: 50,
    },
    tier4Activity: {
      instructions:
        'Watch the video with your sibling and help set up the beak experiment. Try one "beak" (use your fingers as tweezers) to pick up beans vs. macaroni. Draw the bird with the beak shape you think is the most interesting and label what it eats.',
      materials: ['dried beans (small handful)', 'macaroni (small handful)', 'crayons', 'blank paper'],
      minutes: 30,
    },
    sourceUrl: 'https://mysteryscience.com/animal-superpowers/animal-traits-survival',
  },
  {
    id: 'ms-1-animal-traits-4',
    title: 'Camouflage & Survival (Why are polar bears white?)',
    description:
      'Students identify hidden camouflage moths on patterned backgrounds, then design and hide their own patterned moths in a classroom forest to test how well camouflage works.',
    weekHint: 22,
    season: 'any',
    termIds: ['spring-2027'],
    tier7Activity: {
      instructions:
        'Watch the video about camouflage. Using the "Color A Moth" printout, design a moth with colors and patterns that blend into a specific background in the room (bookshelf, carpet, wood floor). Cut out your moth and hide it. Observe how many moths other people placed you can find. Write 1-2 sentences about what makes a moth hard or easy to spot.',
      materials: [
        'Color A Moth printout',
        'Look For Moths worksheet',
        'crayons (assorted)',
        'scissors',
        'glue dots (3)',
      ],
      minutes: 50,
    },
    tier4Activity: {
      instructions:
        'Watch the video with your sibling. Color a moth using only two colors that match something in the room. Cut it out with help and hide it somewhere. Draw where you hid it and circle the colors you used.',
      materials: ['Color A Moth printout', 'crayons', 'scissors (kid-safe)', 'tape'],
      minutes: 30,
    },
    sourceUrl: 'https://mysteryscience.com/animal-superpowers/animal-traits-survival',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // LIFE SCIENCE — Plant Traits & Survival (1st grade)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'ms-1-plant-traits-1',
    title: 'Plant Traits & Offspring (What will a baby plant look like when it grows up?)',
    description:
      'Students identify patterns showing young plants resemble their parent plants. In the "Mixed-up Plants" activity, learners observe seedlings and adult plants to match each seedling to its mature form.',
    weekHint: 10,
    season: 'spring',
    termIds: ['spring-2027'],
    tier7Activity: {
      instructions:
        'Watch the video about plant offspring. Study the "Look for Clues" printout showing several seedlings and adult plants in mixed order. Use clues like leaf shape, color, and stem thickness to match each seedling to its adult plant. Write 1-2 sentences about which clues were most helpful and why.',
      materials: ['"Look for Clues" printout', 'crayons (green, yellow, orange, brown, pink)'],
      minutes: 40,
    },
    tier4Activity: {
      instructions:
        'Watch the video with your sibling. Look at the seedling and adult plant pictures together. Point to one pair you think match and circle them with your crayon. Draw a seedling and a grown-up version of the same plant.',
      materials: ['"Look for Clues" printout', 'crayons', 'blank paper'],
      minutes: 25,
    },
    sourceUrl: 'https://mysteryscience.com/plant-superpowers/plant-traits-survival',
  },
  {
    id: 'ms-1-plant-traits-2',
    title: 'Plant Survival: Roots (Why don\'t trees blow down in the wind?)',
    description:
      'Students examine plant structures — roots, branches, and leaves — that provide stability in wind. The "Wind-Proof Umbrella" activity challenges kids to build tree-inspired structures that can withstand a strong fan blast.',
    weekHint: 23,
    season: 'spring',
    termIds: ['spring-2027'],
    tier7Activity: {
      instructions:
        'Watch the video about how roots anchor trees. Study the umbrella inspiration worksheet showing how tree root patterns inspire strong structures. Build your wind-proof umbrella: poke pipe cleaners through a Dixie cup base (as roots), attach bendable straws as branches, and connect the umbrella top printout. Test it against a fan or by blowing hard. Write 1-2 sentences about which part of your design kept it most stable.',
      materials: [
        'Umbrella Top printout (2 copies)',
        'scissors',
        'Dixie cup (3 oz)',
        'dot stickers (6)',
        'pipe cleaners (2)',
        'plastic bendable straws (2)',
        'small ball of playdough',
      ],
      minutes: 55,
    },
    tier4Activity: {
      instructions:
        'Watch the video with your sibling and help test the umbrella designs. Take a piece of playdough and stick 2 pipe cleaners in it as "roots." See if you can make the structure stand up on its own. Draw your structure and label the roots and branches.',
      materials: ['playdough (golf-ball sized)', 'pipe cleaners (2)', 'crayons', 'blank paper'],
      minutes: 30,
    },
    sourceUrl: 'https://mysteryscience.com/plant-superpowers/plant-traits-survival',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PHYSICAL SCIENCE — Light, Sound & Communication (1st grade)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'ms-1-light-sound-1',
    title: 'Sounds & Vibrations (How do they make silly sounds in cartoons?)',
    description:
      'Students investigate vibrations as a sound source by creating cartoon movie sound effects. They generate a rainstorm using hands and feet, then use rulers to create a bouncy-ball "boing" sound.',
    weekHint: 24,
    season: 'any',
    termIds: ['spring-2027'],
    tier7Activity: {
      instructions:
        'Watch the video about sound and vibration. Do the "Be a Sound Effects Artist" activity: working together, build a rainstorm sound with just your hands and feet (snapping → soft patting → hard patting → stomping → reverse). Then hold a ruler flat on a table with one end hanging off and pluck it to make a "boing." Change how much ruler hangs off to change the pitch. Write 1-2 sentences about what you notice about how vibrations make different sounds.',
      materials: ['ruler', 'table'],
      minutes: 40,
    },
    tier4Activity: {
      instructions:
        'Watch the video with your sibling and join the rainstorm activity. Snap, pat, and stomp along! Try the ruler boing experiment. Draw a sound wave coming from the ruler and show whether you think it sounds high or low.',
      materials: ['ruler', 'crayons', 'blank paper'],
      minutes: 25,
    },
    sourceUrl: 'https://mysteryscience.com/light/light-sound-communication',
  },
  {
    id: 'ms-1-light-sound-2',
    title: 'Light & Materials (What if there were no windows?)',
    description:
      'Students examine how different materials transmit light — opaque, translucent, and transparent — then create "Paper Stained Glass" artwork using tissue paper and clear materials.',
    weekHint: 25,
    season: 'any',
    termIds: ['spring-2027'],
    tier7Activity: {
      instructions:
        'Watch the video about light and materials. Sort materials into three groups — opaque (blocks light: cardboard, foil), translucent (filters light: wax paper, tissue paper), transparent (lets light through: plastic wrap, clear bottle). Hold each up to a window or lamp. Then create Paper Stained Glass: use Press\'n Seal wrap as your base and layer colored tissue paper pieces in a flower pattern. Write 1-2 sentences about which category of material made your favorite stained glass effect.',
      materials: [
        'flower shape printout',
        'sorting sheet printout',
        'cardboard piece',
        'aluminum foil',
        'wax paper',
        'tissue paper (3 colors)',
        'clear plastic wrap or report cover',
        'Glad Press\'n Seal (1 foot)',
        'scissors',
      ],
      minutes: 50,
    },
    tier4Activity: {
      instructions:
        'Watch the video with your sibling and sort materials by holding them up to a lamp. Then take a square of Press\'n Seal and press on 3-4 pieces of colored tissue paper to make a mini stained glass window. Hold it up to the light and enjoy the colors.',
      materials: ['tissue paper (2-3 colors)', 'Press\'n Seal or tape', 'crayons'],
      minutes: 30,
    },
    sourceUrl: 'https://mysteryscience.com/light/light-sound-communication',
  },
  {
    id: 'ms-1-light-sound-3',
    title: 'Light Communication & Engineering (How could you send a secret message far away?)',
    description:
      'Students build simple light-based communication devices. In "Secret Signals," pairs use flashlights and colored code cards to transmit messages across distances.',
    weekHint: 26,
    season: 'any',
    termIds: ['fall-2026'],
    tier7Activity: {
      instructions:
        'Watch the video about communicating with light signals. Create a color code chart: red = A, blue = B, green = C (make your own code). Practice sending a 3-letter word to your sibling using a flashlight and colored cellophane or marker-covered index cards. Write 1-2 sentences about how this is similar to Morse code and what made sending messages challenging.',
      materials: [
        'color code printout (or hand-draw it)',
        'markers (red, blue, green)',
        'LED flashlight',
        'index cards (3)',
      ],
      minutes: 45,
    },
    tier4Activity: {
      instructions:
        'Watch the video with your sibling. Use the color code to decode a short message your sibling sends you using flashlight flashes and colored cards. Draw the message you received.',
      materials: ['flashlight', 'colored index cards (red, blue, green)', 'crayons', 'blank paper'],
      minutes: 25,
    },
    sourceUrl: 'https://mysteryscience.com/light/light-sound-communication',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // LIFE SCIENCE — Animal Biodiversity & Habitats (2nd grade)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'ms-2-biodiversity-1',
    title: 'Animal Biodiversity: Classification (How many different kinds of animals are there?)',
    description:
      'Students examine how scientists categorize animals based on their characteristics. In the Animals Sorting Game, learners sort card images into mammals, birds, reptiles, and invertebrates.',
    weekHint: 27,
    season: 'any',
    termIds: ['fall-2026'],
    tier7Activity: {
      instructions:
        'Watch the video about animal classification. Cut out the Animal Cards and sort them into four groups: mammals, birds, reptiles, and invertebrates. Use the Challenge Cards to test edge cases — animals that don\'t fit neatly. Write 1-2 sentences about the traits you used to decide which group each animal belongs to.',
      materials: [
        'Animal Cards printout (on card stock)',
        'Challenge Cards printout',
        'scissors',
        'blank paper (for group labels)',
      ],
      minutes: 50,
    },
    tier4Activity: {
      instructions:
        'Watch the video with your sibling and help sort the animal cards. Pick your three favorite animals from the cards. Draw them and label each one with its group name (mammal, bird, reptile, or invertebrate).',
      materials: ['Animal Cards printout', 'scissors', 'crayons', 'blank paper'],
      minutes: 30,
    },
    sourceUrl: 'https://mysteryscience.com/biodiversity/animal-biodiversity-habitats',
  },
  {
    id: 'ms-2-biodiversity-2',
    title: 'Habitat Diversity (Why would a wild animal visit a playground?)',
    description:
      'Students investigate why bighorn sheep leave their desert habitat for a playground, then conduct a Habitat Scavenger Hunt recording living and non-living elements in two locations.',
    weekHint: 28,
    season: 'any',
    termIds: ['spring-2027'],
    tier7Activity: {
      instructions:
        'Watch the video about bighorn sheep and their habitat needs. Take your Habitat Journal outside and observe the backyard or a nearby outdoor space. Record what living things (plants, bugs, birds) and non-living things (rocks, water, soil) you can find. Then compare two different spots (e.g., under a bush vs. open lawn). Write 1-2 sentences about which spot you think would make a better habitat for a small animal and why.',
      materials: ['Habitat Journal printout', 'pencil', 'clipboard'],
      minutes: 50,
    },
    tier4Activity: {
      instructions:
        'Go outside with your sibling for the scavenger hunt. Find and point to 3 living things and 3 non-living things. Draw your favorite living thing you found and say one reason an animal might need it.',
      materials: ['crayons', 'blank paper', 'clipboard'],
      minutes: 30,
    },
    sourceUrl: 'https://mysteryscience.com/biodiversity/animal-biodiversity-habitats',
  },
  {
    id: 'ms-2-biodiversity-3',
    title: 'Bird Feeder Engineering (How could you get more birds to visit a bird feeder?)',
    description:
      'Students investigate bird dietary preferences and then design and build bird feeder prototypes to attract specific bird species in an engineering challenge.',
    weekHint: 29,
    season: 'spring',
    termIds: ['spring-2027'],
    tier7Activity: {
      instructions:
        'Watch the video about birds and their food preferences. Use the Bird Feeder Inspiration worksheet to study different feeder styles. Design your own bird feeder on the "My Bird Feeder" worksheet, choosing which bird species you want to attract and what food you\'ll offer. Build a prototype using a paper cup, pipe cleaners, and skewers. Write 1-2 sentences about which design feature you think will attract the most birds and why.',
      materials: [
        'Bird Feeder Inspiration worksheet',
        'My Bird Feeder worksheet',
        'paper cup',
        'paper plate',
        'pipe cleaners (2)',
        'wooden skewer',
        'aluminum foil',
        'scissors',
        'binder clips (2)',
        'dot stickers',
      ],
      minutes: 55,
    },
    tier4Activity: {
      instructions:
        'Watch the video with your sibling. Help thread pipe cleaners through a paper cup to make a simple feeder perch. Draw what your bird feeder looks like and draw the bird you hope visits it.',
      materials: ['paper cup', 'pipe cleaners (2)', 'crayons', 'blank paper'],
      minutes: 30,
    },
    sourceUrl: 'https://mysteryscience.com/biodiversity/animal-biodiversity-habitats',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // EARTH & SPACE — Erosion & Earth\'s Surface (2nd grade)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'ms-2-erosion-1',
    title: 'Rocks & Erosion (Why is there sand at the beach?)',
    description:
      'Students investigate how rocks tumble and break down in rivers over time. In the "Rocking the River" activity, kids tear construction paper to model how boulders transform into sand as they travel downstream.',
    weekHint: 30,
    season: 'any',
    termIds: ['spring-2027'],
    tier7Activity: {
      instructions:
        'Watch the video about rock erosion and how rivers turn boulders into sand. Do the "Rocking the River" activity: start with a large square of construction paper as your "boulder." Tear it in half — that\'s what happens when a big rock breaks. Tear each piece in half again and again, getting smaller and smaller until you have tiny "sand" pieces. Write 1-2 sentences comparing the original big boulder piece to the tiny sand pieces and explaining what happened over time.',
      materials: [
        'colored construction paper (3 sheets, pre-cut into large squares)',
        'river worksheet printout',
        'pencil',
      ],
      minutes: 40,
    },
    tier4Activity: {
      instructions:
        'Watch the video with your sibling. Take one sheet of construction paper and tear it three times, making it smaller each time. Line up your pieces from biggest to smallest. Draw the sequence from boulder to pebble to sand and label each step.',
      materials: ['construction paper (1 sheet)', 'crayons', 'blank paper'],
      minutes: 25,
    },
    sourceUrl: 'https://mysteryscience.com/water/erosion-earth-s-surface',
  },
  {
    id: 'ms-2-erosion-2',
    title: 'Erosion Engineering (How can you stop a landslide?)',
    description:
      'Students compare and test multiple erosion prevention solutions. Using cornmeal hill models they simulate rainfall and test protective materials to slow or stop landslides.',
    weekHint: 30,
    season: 'fall',
    termIds: ['spring-2027'],
    tier7Activity: {
      instructions:
        'Watch the video about landslides and erosion prevention. Build a cornmeal hill in a foil-lined tray. Slowly pour water over it and observe the "landslide." Then test three protective materials: cotton balls, toothpicks (as tree roots), and a square of aluminum foil. Apply one at a time and repeat the water test. Write 1-2 sentences about which material worked best and why you think it helped.',
      materials: [
        'cornmeal (2 cups)',
        'aluminum foil (sheet for tray liner)',
        'cotton balls (5)',
        'toothpicks (10)',
        'paper towels',
        'cup of water',
        'baking tray or plastic bin',
      ],
      minutes: 55,
    },
    tier4Activity: {
      instructions:
        'Watch the video with your sibling and help build the cornmeal hill. Choose one material to press into the hill before the water is poured. Observe what happens and draw the hill before and after the water test.',
      materials: ['cornmeal (1/2 cup)', 'aluminum foil', 'crayons', 'blank paper', 'cup of water'],
      minutes: 35,
    },
    sourceUrl: 'https://mysteryscience.com/water/erosion-earth-s-surface',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PHYSICAL SCIENCE / ENGINEERING — Material Properties (2nd grade)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'ms-2-materials-1',
    title: 'Material Properties & Engineering (Why do we wear clothes?)',
    description:
      'Students investigate material properties like texture, flexibility, and absorbency, then design and build a sun-protective hat using a variety of household materials in the "Mad Hatter" activity.',
    weekHint: 27,
    season: 'summer',
    termIds: ['summer-2026'],
    tier7Activity: {
      instructions:
        'Watch the video about why we wear clothes and how material properties matter. Gather 4-5 materials and test each one: Is it flexible or stiff? Does it absorb water (drip a few drops) or repel it? Is it rough or smooth? Record results on a simple chart. Then build a sun hat from one or more materials you think would protect someone from the sun. Test your hat by shining a flashlight on it and seeing if any light passes through. Write 1-2 sentences about which material you chose and why.',
      materials: [
        'aluminum foil',
        'paper cup',
        'paper plate',
        'paper towel',
        'plastic bag',
        'string',
        'binder clips (2)',
        'water dropper or spoon',
        'flashlight',
      ],
      minutes: 55,
    },
    tier4Activity: {
      instructions:
        'Watch the video with your sibling. Help test one material by dripping 3 drops of water on it and seeing if it absorbs the water or pushes it away. Draw your sibling\'s hat and label the material it\'s made from. Put the hat on and model it!',
      materials: ['aluminum foil', 'paper towel', 'water dropper', 'crayons', 'blank paper'],
      minutes: 30,
    },
    sourceUrl: 'https://mysteryscience.com/materials/material-properties',
  },
  {
    id: 'ms-2-materials-2',
    title: 'Insulators & Conductors (Can you really fry an egg on a hot sidewalk?)',
    description:
      'Students investigate how materials conduct or insulate heat. In the "Feel the Heat" experiment, kids test which materials would make the best oven mitts by observing heat transfer.',
    weekHint: 28,
    season: 'any',
    termIds: ['spring-2027'],
    tier7Activity: {
      instructions:
        'Watch the video about heat conduction and insulation. Fill one cup with hot water from the tap and one with cold. Wrap different materials around the hot cup: a wool sock, a plastic bag, aluminum foil, a paper towel. After 3 minutes touch each material and feel which lets the most heat through (conductor) vs. blocks it (insulator). Write 1-2 sentences about which material would make the best oven mitt and which science word — conductor or insulator — describes it.',
      materials: [
        'styrofoam or plastic cups (4)',
        'aluminum foil',
        'wool or thick sock',
        'plastic bag',
        'paper towel',
        'hot tap water',
        'cold water',
      ],
      minutes: 45,
    },
    tier4Activity: {
      instructions:
        'Watch the video with your sibling. Touch the outside of a warm (not hot) cup wrapped in foil and then wrapped in a sock. Which feels warmer? Draw the two cups and circle the one that would make a better oven mitt.',
      materials: ['2 cups', 'aluminum foil', 'sock', 'warm (not hot) water', 'crayons', 'blank paper'],
      minutes: 25,
    },
    sourceUrl: 'https://mysteryscience.com/materials/material-properties',
  },
  {
    id: 'ms-2-materials-3',
    title: 'Building Materials & Engineering (Could you build a house out of paper?)',
    description:
      'Students explore how structures are built from smaller components. In the "Paper Towers" challenge, kids build increasingly complex towers using only index cards and paper clips, testing structural stability.',
    weekHint: 29,
    season: 'any',
    termIds: ['spring-2027'],
    tier7Activity: {
      instructions:
        'Watch the video about building materials and structure. Challenge: build the tallest tower you can using only index cards (fold and cut as needed) and paper clips. No tape allowed! Test whether your tower can support a hardcover book on top. Write 1-2 sentences about what shapes or techniques made your tower strongest and why you think those shapes work.',
      materials: [
        'index cards (3x5) — 10 cards',
        'paper clips — 10',
        'ruler',
        'scissors',
        'hardcover book (for strength test)',
      ],
      minutes: 50,
    },
    tier4Activity: {
      instructions:
        'Watch the video with your sibling. Use 3 index cards and 3 paper clips to build the smallest structure that can stand on its own without falling. Draw your structure from the side and from the top.',
      materials: ['index cards (3x5) — 3 cards', 'paper clips (3)', 'crayons', 'blank paper'],
      minutes: 30,
    },
    sourceUrl: 'https://mysteryscience.com/materials/material-properties',
  },
];
