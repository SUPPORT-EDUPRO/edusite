// Template Registry
// Centralized registry for all NCF-aligned templates

export interface TemplateFrontmatter {
  title: string;
  slug: string;
  description: string;
  pillar: string;
  ncfPillars: string[];
  ageRange: string;
  duration: string;
  groupSize: string;
  locale: string;
  author: string;
  difficulty: string;
  cover: string;
  objectives: string[];
  materials: string[];
  keywords: string[];
}

export interface TemplateMetadata {
  slug: string;
  frontmatter: TemplateFrontmatter;
  mdxPath: string;
}

// Static metadata for all templates
export const templatesMetadata: TemplateMetadata[] = [
  {
    slug: 'welcome-play',
    mdxPath: '../../../content/templates/welcome-play.mdx',
    frontmatter: {
      title: 'Welcome Play',
      slug: 'welcome-play',
      description:
        'A holistic activity promoting physical activity, well-being, and creative expression through outdoor play and imaginative games.',
      pillar: 'Well-Being',
      ncfPillars: ['Well-Being', 'Creativity and Imagination'],
      ageRange: '3-5 years',
      duration: '45 minutes',
      groupSize: 'Small to medium groups (6-12 children)',
      locale: 'en-ZA',
      author: 'EduSitePro Team',
      difficulty: 'Beginner',
      cover: '/templates/welcome-play.jpg',
      objectives: [
        'Develop gross motor skills',
        'Encourage creative expression',
        'Build social interaction',
      ],
      materials: [
        'Outdoor play area',
        'Balls',
        'Cones',
        'Hula hoops',
        'Music player',
        'Art supplies',
      ],
      keywords: [
        'outdoor play',
        'physical activity',
        'creativity',
        'motor skills',
        'NCF',
        'early childhood',
      ],
    },
  },
  {
    slug: 'bright-start',
    mdxPath: '../../../content/templates/bright-start.mdx',
    frontmatter: {
      title: 'Bright Start',
      slug: 'bright-start',
      description:
        'An engaging morning activity that builds identity, belonging, and communication skills through storytelling, circle time, and self-expression.',
      pillar: 'Identity and Belonging',
      ncfPillars: ['Identity and Belonging', 'Communication'],
      ageRange: '3-6 years',
      duration: '30 minutes',
      groupSize: 'Small to medium groups (8-15 children)',
      locale: 'en-ZA',
      author: 'EduSitePro Team',
      difficulty: 'Beginner',
      cover: '/templates/bright-start.jpg',
      objectives: [
        'Build self-awareness and confidence',
        'Develop listening and speaking skills',
        'Foster a sense of belonging',
      ],
      materials: [
        'Circle time mat or rug',
        'Name tags',
        'Picture books',
        'Musical instruments',
        'Mirrors',
      ],
      keywords: ['circle time', 'identity', 'belonging', 'communication', 'NCF', 'morning routine'],
    },
  },
  {
    slug: 'storytime',
    mdxPath: '../../../content/templates/storytime.mdx',
    frontmatter: {
      title: 'Story Time Adventures',
      slug: 'storytime',
      description:
        'A literacy-focused activity that uses storytelling, role-play, and creative expression to develop communication and language skills.',
      pillar: 'Communication',
      ncfPillars: ['Communication', 'Creativity and Imagination', 'Literacy'],
      ageRange: '2-5 years',
      duration: '40 minutes',
      groupSize: 'Small groups (5-10 children)',
      locale: 'en-ZA',
      author: 'EduSitePro Team',
      difficulty: 'Beginner',
      cover: '/templates/storytime.jpg',
      objectives: [
        'Develop listening comprehension',
        'Enhance vocabulary and language skills',
        'Encourage creative storytelling',
      ],
      materials: [
        'Picture books',
        'Story props',
        'Puppets',
        'Drawing materials',
        'Comfortable seating area',
      ],
      keywords: [
        'storytelling',
        'literacy',
        'language development',
        'communication',
        'NCF',
        'reading',
      ],
    },
  },
  {
    slug: 'coding-blocks',
    mdxPath: '../../../content/templates/coding-blocks.mdx',
    frontmatter: {
      title: 'Coding Blocks & Logic Play',
      slug: 'coding-blocks',
      description:
        'Introduce computational thinking and problem-solving through hands-on block-based activities, patterns, and simple sequencing games for early learners.',
      pillar: 'Thinking and Reasoning',
      ncfPillars: ['Thinking and Reasoning', 'Numeracy and Mathematics', 'Problem-Solving'],
      ageRange: '4-6 years',
      duration: '40 minutes',
      groupSize: 'Small groups (4-8 children)',
      locale: 'en-ZA',
      author: 'EduSitePro Team',
      difficulty: 'Beginner',
      cover: '/templates/coding-blocks.jpg',
      objectives: [
        'Develop computational thinking skills',
        'Understand sequencing and patterns',
        'Build problem-solving abilities',
        'Foster collaboration and logical reasoning',
      ],
      materials: [
        'Large colorful building blocks (20-30 pieces)',
        'Pattern cards or sequence images',
        'Floor grid/mat (optional)',
        'Simple coding toys (Bee-Bot, Cubetto, or alternatives)',
        'Step-by-step instruction cards',
        'Stickers or markers for labeling',
        'Timer or bell',
      ],
      keywords: [
        'coding basics',
        'computational thinking',
        'STEM',
        'problem-solving',
        'NCF',
        'early childhood',
        'logic',
        'sequencing',
      ],
    },
  },
  {
    slug: 'little-engineers',
    mdxPath: '../../../content/templates/little-engineers.mdx',
    frontmatter: {
      title: 'Little Engineers & Robots',
      slug: 'little-engineers',
      description:
        'Hands-on engineering and robotics exploration where children design, build, and problem-solve using simple machines, construction materials, and age-appropriate robots.',
      pillar: 'Thinking and Reasoning',
      ncfPillars: [
        'Thinking and Reasoning',
        'Problem-Solving',
        'Creativity and Imagination',
        'Numeracy and Mathematics',
      ],
      ageRange: '4-6 years',
      duration: '50 minutes',
      groupSize: 'Small groups (4-6 children)',
      locale: 'en-ZA',
      author: 'EduSitePro Team',
      difficulty: 'Intermediate',
      cover: '/templates/little-engineers.jpg',
      objectives: [
        'Introduce basic engineering concepts',
        'Develop spatial reasoning and problem-solving',
        'Explore cause and effect through building',
        'Foster creativity and perseverance',
        'Understand how things work',
      ],
      materials: [
        "Building materials (blocks, LEGO, K'NEX, recycled materials)",
        'Simple robots or motorized toys (optional)',
        'Ramps, wheels, gears',
        'Engineering challenge cards',
        'Tools (child-safe screwdrivers, wrenches)',
        'Measuring tapes/rulers',
        'Design journals/paper and crayons',
      ],
      keywords: [
        'engineering',
        'robotics',
        'STEM',
        'building',
        'problem-solving',
        'NCF',
        'early childhood',
        'construction',
      ],
    },
  },
  {
    slug: 'digital-storytellers',
    mdxPath: '../../../content/templates/digital-storytellers.mdx',
    frontmatter: {
      title: 'Digital Storytellers',
      slug: 'digital-storytellers',
      description:
        'Combine traditional storytelling with age-appropriate technology to create digital stories, recordings, and simple multimedia projects that develop literacy and digital citizenship skills.',
      pillar: 'Communication',
      ncfPillars: ['Communication', 'Literacy', 'Creativity and Imagination', 'Digital Literacy'],
      ageRange: '4-6 years',
      duration: '45 minutes',
      groupSize: 'Small groups (4-6 children)',
      locale: 'en-ZA',
      author: 'EduSitePro Team',
      difficulty: 'Intermediate',
      cover: '/templates/digital-storytellers.jpg',
      objectives: [
        'Develop digital storytelling skills',
        'Build digital citizenship and safety awareness',
        'Create multimedia content (voice, images, simple videos)',
        'Enhance communication and presentation skills',
        'Integrate technology with traditional literacy',
      ],
      materials: [
        'Tablets or smartphones (1 per 2-3 children)',
        'Story creation apps (Book Creator, Story Creator, etc.)',
        'Voice recording app (built-in or kid-safe app)',
        'Simple drawing/photo apps',
        'Picture books for inspiration',
        'Story planning worksheets',
        'Dress-up props for acting out stories',
      ],
      keywords: [
        'digital storytelling',
        'technology',
        'literacy',
        'media creation',
        'digital citizenship',
        'NCF',
        'early childhood',
        'communication',
      ],
    },
  },
];

export function getTemplateMetadataBySlug(slug: string): TemplateMetadata | undefined {
  return templatesMetadata.find((t) => t.slug === slug);
}

export function getAllTemplatesMetadata(): TemplateMetadata[] {
  return templatesMetadata;
}

export function getTemplatesByPillar(pillar: string): TemplateMetadata[] {
  return templatesMetadata.filter((t) =>
    t.frontmatter.ncfPillars.some((p) => p.toLowerCase().includes(pillar.toLowerCase())),
  );
}

// Dynamic import function for MDX components
export async function getTemplateComponent(slug: string): Promise<React.ComponentType | null> {
  try {
    const mdxModule = await import(`../../../content/templates/${slug}.mdx`);
    return mdxModule.default;
  } catch (error) {
    console.error(`Failed to load template component for slug: ${slug}`, error);
    return null;
  }
}
