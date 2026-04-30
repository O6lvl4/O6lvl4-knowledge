import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const notes = defineCollection({
  loader: glob({ base: '../vault', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string().optional(),
    public: z.boolean().optional().default(true),
    tags: z.array(z.string()).optional().default([]),
    aliases: z.array(z.string()).optional().default([]),
  }),
});

export const collections = { notes };
