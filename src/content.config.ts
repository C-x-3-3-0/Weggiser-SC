import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    image: z.string().optional(),
  }),
});

const teams = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/teams' }),
  schema: z.object({
    name: z.string(),
    category: z.enum(['Aktive', 'Senioren', 'Junioren', 'Maedchen']),
    coaches: z.array(z.string()).default([]),
    ifvTeamId: z.string().optional(),
    order: z.number().default(0),
  }),
});

const vorstand = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/vorstand' }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    order: z.number().default(0),
  }),
});

export const collections = { news, teams, vorstand };
