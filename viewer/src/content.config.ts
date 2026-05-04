import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const notes = defineCollection({
  loader: glob({ base: '../vault', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string().optional(),
    public: z.boolean().optional().default(true),
    tags: z.array(z.string()).optional().default([]),
    aliases: z.array(z.string()).optional().default([]),
    // SRS-managed fields written by awen-sync. Defined here so Astro
    // doesn't strip them from the parsed frontmatter; the graph view
    // colors nodes by `srs_state` when present.
    //
    // Note: Astro's YAML loader auto-converts ISO dates (YYYY-MM-DD)
    // to Date objects, so the date-like fields accept either.
    srs_state: z.enum(['new', 'learning', 'settling', 'settled']).optional(),
    retention: z.number().optional(),
    card_count: z.number().optional(),
    reviewed_count: z.number().optional(),
    last_reviewed: z.union([z.string(), z.date()]).optional(),
    next_due: z.union([z.string(), z.date()]).optional(),
    created_at: z.union([z.string(), z.date()]).optional(),
    updated_at: z.union([z.string(), z.date()]).optional(),
  }),
});

export const collections = { notes };
