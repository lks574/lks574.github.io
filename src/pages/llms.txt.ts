import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';

// https://llmstxt.org — a markdown map of this site for LLM agents.
export const GET: APIRoute = async ({ site }) => {
	const base = site?.toString().replace(/\/$/, '') ?? '';
	const [wiki, glossary, blog] = await Promise.all([
		getCollection('wiki'),
		getCollection('glossary'),
		getCollection('blog'),
	]);

	const line = (title: string, url: string, desc?: string) => `- [${title}](${base}${url})${desc ? `: ${desc}` : ''}`;

	const sections = [
		`# ${SITE_TITLE}`,
		'',
		`> ${SITE_DESCRIPTION}`,
		'',
		'개인 엔지니어링 세컨드 브레인입니다. 위키 노트와 용어집은 AI 에이전트가 원자적 마크다운 파일로 유지합니다.',
		`용어집 전체는 JSON으로도 제공됩니다: ${base}/wiki/glossary.json`,
		'',
		'## Glossary',
		...glossary
			.filter((t) => !t.data.supersededBy)
			.sort((a, b) => a.id.localeCompare(b.id))
			.map((t) => line(t.data.title, `/wiki/glossary/${t.id}/`, t.data.description)),
		'',
		'## Wiki',
		...wiki
			.filter((n) => !n.id.startsWith('_'))
			.sort((a, b) => a.id.localeCompare(b.id))
			.map((n) => line(n.data.title ?? n.id, `/wiki/${n.id}/`, n.data.description || undefined)),
		'',
		'## Blog',
		...blog
			.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
			.map((p) => line(p.data.title, `/blog/${p.id}/`, p.data.description)),
		'',
	];

	return new Response(sections.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
