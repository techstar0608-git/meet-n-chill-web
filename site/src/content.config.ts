import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Each post lives in src/content/blog/<slug>/index.md with its images next to it.
// Files are written by the Google Docs pipeline (../pipeline) — edit the Doc, not the .md.
const blog = defineCollection({
  loader: glob({
    base: './src/content/blog',
    pattern: '*/index.md',
    generateId: ({ entry }) => entry.replace(/\/index\.md$/, ''),
  }),
  schema: ({ image }) =>
    z.object({
      postId: z.string().regex(/^(HK|AB|YP|CM)-\d{3,}$/),
      title: z.string().min(3),
      description: z.string().max(200),
      date: z.coerce.date(),
      eventDate: z.coerce.date().optional(),
      category: z.enum(['hope-kids', 'ablaze', 'young-pro', 'community']),
      author: z.string().default('Meet n Chill Team'),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
      sourceDoc: z.string().optional(), // Google Doc the post was generated from
    }),
});

export const collections = { blog };
