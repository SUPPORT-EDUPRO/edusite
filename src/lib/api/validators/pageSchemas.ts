import { z } from 'zod';

/**
 * Schema for page creation/update
 */
export const PageUpsertSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100, 'Slug must be 100 characters or less')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  centre_id: z.string().uuid('Invalid centre ID'),
  meta_description: z.string().max(160).optional(),
  is_published: z.boolean().optional().default(false),
});

export type PageUpsert = z.infer<typeof PageUpsertSchema>;

/**
 * Schema for block data in a page
 */
export const BlockDataSchema = z.object({
  blockKey: z.string().min(1, 'Block key is required'),
  props: z.record(z.string(), z.unknown()), // Will be validated against specific block schema
  order: z.number().int().nonnegative(),
});

export type BlockData = z.infer<typeof BlockDataSchema>;

/**
 * Schema for page save with blocks
 */
export const PageSaveSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  meta_description: z.string().max(160).optional(),
  blocks: z.array(BlockDataSchema).optional(),
});

export type PageSave = z.infer<typeof PageSaveSchema>;

/**
 * Schema for publish/unpublish action
 */
export const PublishSchema = z.object({
  is_published: z.boolean(),
});

export type Publish = z.infer<typeof PublishSchema>;
