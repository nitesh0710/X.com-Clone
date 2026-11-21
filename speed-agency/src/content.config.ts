import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** SEO lengths are enforced at build time by scripts/postbuild-checks.mjs. */
const seo = {
  seoTitle: z.string().min(10),
  description: z.string().min(50),
};

const insights = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/insights' }),
  schema: z.object({
    title: z.string(),
    ...seo,
    published: z.coerce.date(),
    updated: z.coerce.date().optional(),
    /** Industry page this article links to, e.g. 'plumbers'. */
    industry: z.enum(['plumbers', 'electricians', 'hvac', 'roofers', 'painters']),
    draft: z.boolean().default(false),
  }),
});

const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        ...seo,
        /** 'concept' = demonstration. 'client' needs verified + permission_note. */
        kind: z.enum(['concept', 'client']).default('concept'),
        verified: z.boolean().default(false),
        permission_note: z.string().default(''),
        trade: z.string(),
        industry: z.enum(['plumbers', 'electricians', 'hvac', 'roofers', 'painters']).optional(),
        summary: z.string(),
        objective: z.string(),
        features: z.array(z.string()).min(1),
        technology: z.string(),
        previewUrl: z.url().optional(),
        screenshotDesktop: image(),
        screenshotMobile: image(),
        screenshotAlt: z.string(),
        /** While true, the page shows the {{DEMO_n}} placeholder and the strict build fails. */
        placeholderKey: z.string().optional(),
        order: z.number().default(99),
        featured: z.boolean().default(false),
      })
      .refine((d) => d.kind === 'concept' || (d.verified && d.permission_note.trim().length > 0), {
        message: 'A "client" project needs verified: true and a permission_note.',
      }),
});

const industries = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/industries' }),
  schema: z.object({
    trade: z.string(), // "Plumbers"
    tradeSingular: z.string(), // "plumbing business"
    h1: z.string(),
    ...seo,
    lede: z.string(),
    concept: z.string(), // work entry id
    faqs: z.array(z.object({ q: z.string(), a: z.string() })).length(3),
    order: z.number(),
  }),
});

export const collections = { insights, work, industries };
