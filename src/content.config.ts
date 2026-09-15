import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CATEGORIES } from './consts';

export const GLOSSARY_CATEGORIES = ['ai', 'architecture', 'client', 'product'] as const;
export type GlossaryCategory = (typeof GLOSSARY_CATEGORIES)[number];

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/20-blog/` directory.
	loader: glob({ base: './src/content/20-blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Must be a real category: /category/{slug} routes are generated only for these.
			category: z.enum(Object.keys(CATEGORIES) as [string, ...string[]]),
			tags: z.array(z.string()).default([]),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
		}),
});

const wiki = defineCollection({
	// Load Markdown and MDX files in the `src/content/10-wiki/` directory,
	// excluding the glossary which has its own strict collection below.
	loader: glob({ base: './src/content/10-wiki', pattern: ['**/*.{md,mdx}', '!glossary/**'] }),
	schema: z.object({
		title: z.string().optional(),
		description: z.string().default(''),
		tags: z.array(z.string()).default([]),
		aliases: z.array(z.string()).default([]),
		category: z.string().default('wiki'),
		updatedDate: z.coerce.date().optional(),
	}),
});

// Agent-curated glossary: one term per file under
// `src/content/10-wiki/glossary/{category}/{term-slug}.md`.
// Entry ids look like `ai/rag`; the folder is the single source of truth
// for category and `scripts/lint-glossary.mjs` verifies frontmatter matches it.
const glossary = defineCollection({
	loader: glob({ base: './src/content/10-wiki/glossary', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string().min(1),
		description: z.string().min(10),
		category: z.enum(GLOSSARY_CATEGORIES),
		tags: z.array(z.string()).default([]),
		aliases: z.array(z.string()).default([]),
		updatedDate: z.coerce.date(),
		// Episodic sources this term was promoted from (troubleshooting notes,
		// decision logs, external references). Wikilink names or URLs.
		sources: z.array(z.string()).default([]),
		// Slug of a newer term that replaces this one. Kept, not deleted.
		supersededBy: z.string().optional(),
	}),
});

export const collections = { blog, wiki, glossary };
