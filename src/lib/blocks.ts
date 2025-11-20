import React, { type ComponentType, type ReactElement } from 'react';
import { type ZodSchema } from 'zod';

// Import blocks
import ContactCTA, { type ContactCTAProps,contactCTASchema } from '@/components/blocks/ContactCTA';
import Features, { type FeaturesProps,featuresSchema } from '@/components/blocks/Features';
import FeesTable, { type FeesTableProps,feesTableSchema } from '@/components/blocks/FeesTable';
import Gallery, { type GalleryProps,gallerySchema } from '@/components/blocks/Gallery';
import Hero, { type HeroProps,heroSchema } from '@/components/blocks/Hero';
import ProgramGrid, {
  type ProgramGridProps,
  programGridSchema,
} from '@/components/blocks/ProgramGrid';
import RichText, { type RichTextProps,richTextSchema } from '@/components/blocks/RichText';
import StaffCards, { type StaffCardsProps,staffCardsSchema } from '@/components/blocks/StaffCards';
import Stats, { type StatsProps,statsSchema } from '@/components/blocks/Stats';
import Testimonials, {
  type TestimonialsProps,
  testimonialsSchema,
} from '@/components/blocks/Testimonials';

export interface BlockDefinition {
  key: string;
  displayName: string;
  category: 'header' | 'content' | 'contact' | 'feature' | 'media' | 'footer' | 'team' | 'pricing';
  component: ComponentType<any>;
  schema: ZodSchema;
  description?: string;
  thumbnail?: string;
}

// Block registry
export const BLOCKS: Record<string, BlockDefinition> = {
  hero: {
    key: 'hero',
    displayName: 'Hero',
    category: 'header',
    component: Hero,
    schema: heroSchema,
    description: 'Full-width hero section with title, subtitle, background image, and CTA',
  },
  richText: {
    key: 'richText',
    displayName: 'Rich Text',
    category: 'content',
    component: RichText,
    schema: richTextSchema,
    description: 'WYSIWYG text content block with formatting options',
  },
  contactCTA: {
    key: 'contactCTA',
    displayName: 'Contact CTA',
    category: 'contact',
    component: ContactCTA,
    schema: contactCTASchema,
    description: 'Contact section with form, contact info, and optional map',
  },
  programGrid: {
    key: 'programGrid',
    displayName: 'Program Grid',
    category: 'content',
    component: ProgramGrid,
    schema: programGridSchema,
    description: 'Grid layout showcasing educational programs with NCF alignment',
  },
  staffCards: {
    key: 'staffCards',
    displayName: 'Staff Cards',
    category: 'team',
    component: StaffCards,
    schema: staffCardsSchema,
    description: 'Team member profiles with photos, roles, bios, and qualifications',
  },
  testimonials: {
    key: 'testimonials',
    displayName: 'Testimonials',
    category: 'content',
    component: Testimonials,
    schema: testimonialsSchema,
    description: 'Parent and organization testimonials with ratings and photos',
  },
  gallery: {
    key: 'gallery',
    displayName: 'Gallery',
    category: 'media',
    component: Gallery,
    schema: gallerySchema,
    description: 'Photo and video gallery with captions and lightbox support',
  },
  stats: {
    key: 'stats',
    displayName: 'Stats',
    category: 'content',
    component: Stats,
    schema: statsSchema,
    description: 'Key metrics and statistics display with multiple layout variants',
  },
  features: {
    key: 'features',
    displayName: 'Features',
    category: 'feature',
    component: Features,
    schema: featuresSchema,
    description: 'Highlight key features or benefits with icons and descriptions',
  },
  feesTable: {
    key: 'feesTable',
    displayName: 'Fees Table',
    category: 'pricing',
    component: FeesTable,
    schema: feesTableSchema,
    description: 'Structured pricing and fees table with categories and notes',
  },
};

// Type exports
export type BlockKey = keyof typeof BLOCKS;
export type BlockProps<K extends BlockKey> = K extends 'hero'
  ? HeroProps
  : K extends 'richText'
    ? RichTextProps
    : K extends 'contactCTA'
      ? ContactCTAProps
      : K extends 'programGrid'
        ? ProgramGridProps
        : K extends 'staffCards'
          ? StaffCardsProps
          : K extends 'testimonials'
            ? TestimonialsProps
            : K extends 'gallery'
              ? GalleryProps
              : K extends 'stats'
                ? StatsProps
                : K extends 'features'
                  ? FeaturesProps
                  : K extends 'feesTable'
                    ? FeesTableProps
                    : never;

/**
 * Get block definition by key
 */
export function getBlock(key: BlockKey): BlockDefinition | undefined {
  return BLOCKS[key];
}

/**
 * Get all blocks
 */
export function getAllBlocks(): BlockDefinition[] {
  return Object.values(BLOCKS);
}

/**
 * Get blocks by category
 */
export function getBlocksByCategory(category: BlockDefinition['category']): BlockDefinition[] {
  return Object.values(BLOCKS).filter((block) => block.category === category);
}

/**
 * Validate block props against schema
 */
export function validateBlockProps<K extends BlockKey>(
  key: K,
  props: unknown,
): { success: true; data: BlockProps<K> } | { success: false; errors: any } {
  const block = getBlock(key);
  if (!block) {
    return { success: false, errors: { _error: `Block "${key}" not found` } };
  }

  const result = block.schema.safeParse(props);

  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  return { success: true, data: result.data as BlockProps<K> };
}

/**
 * Render a block component with props
 */
export function renderBlock(key: BlockKey, props: any): ReactElement | null {
  const block = getBlock(key);
  if (!block) {
    console.error(`Block "${key}" not found`);
    return null;
  }

  const Component = block.component;
  return React.createElement(Component, props);
}
