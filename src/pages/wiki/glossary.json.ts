import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// Machine-readable export of the glossary for agents, vector indexing, or
// other sites. Built statically at /wiki/glossary.json
export const GET: APIRoute = async ({ site }) => {
	const base = site?.toString().replace(/\/$/, '') ?? '';
	const terms = (await getCollection('glossary'))
		.sort((a, b) => a.id.localeCompare(b.id))
		.map((t) => ({
			id: t.id,
			slug: t.id.split('/').pop(),
			url: `${base}/wiki/glossary/${t.id}/`,
			title: t.data.title,
			description: t.data.description,
			category: t.data.category,
			tags: t.data.tags,
			aliases: t.data.aliases,
			sources: t.data.sources,
			supersededBy: t.data.supersededBy ?? null,
			updatedDate: t.data.updatedDate.toISOString().slice(0, 10),
			body: t.body ?? '',
		}));

	return new Response(JSON.stringify({ generatedAt: new Date().toISOString(), count: terms.length, terms }, null, 2), {
		headers: { 'Content-Type': 'application/json; charset=utf-8' },
	});
};
