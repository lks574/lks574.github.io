import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/20-blog/` directory.
	loader: glob({ base: './src/content/20-blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			category: z.string().default('General'),
			tags: z.array(z.string()).default([]),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
		}),
});

const wiki = defineCollection({
	// Load Markdown and MDX files in the `src/content/10-wiki/` directory.
	loader: glob({ base: './src/content/10-wiki', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string().optional(),
		description: z.string().default(''),
		tags: z.array(z.string()).default([]),
		category: z.string().default('wiki'),
		updatedDate: z.coerce.date().optional(),
	}),
});

export const collections = { blog, wiki };
