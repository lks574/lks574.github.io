#!/usr/bin/env node
// Duplicate check before creating a glossary term.
// Usage: node scripts/find-term.mjs "retrieval augmented" [more words]
// Exit code is 0 whenever the search ran; read the RESULT= line (MATCH | MAYBE | NONE).
// Matches slug, title, aliases, tags and description, case-insensitively.
import { relative } from 'node:path';
import { ROOT, loadGlossary } from './glossary-lib.mjs';

const normalize = (s) => String(s).toLowerCase().replace(/[-_/]+/g, ' ').replace(/\s+/g, ' ').trim();
const query = normalize(process.argv.slice(2).join(' '));
if (!query) {
	console.error('usage: node scripts/find-term.mjs <term or keywords>');
	process.exit(2);
}
const words = query.split(/\s+/);
const hits = [];
for (const t of loadGlossary()) {
	const d = t.data;
	const fields = {
		slug: t.slug,
		title: d.title ?? '',
		aliases: (d.aliases ?? []).join(' '),
		tags: (d.tags ?? []).join(' '),
		description: d.description ?? '',
	};
	const hay = normalize(Object.values(fields).join(' '));
	const score = words.filter((w) => hay.includes(w)).length;
	if (score === 0) continue;
	const strong = [fields.slug, fields.title, fields.aliases].some((f) => normalize(f).includes(query));
	hits.push({ t, score: strong ? score + 10 : score, strong });
}
hits.sort((a, b) => b.score - a.score);
if (!hits.length) {
	console.log(`no existing term matches "${query}" — safe to create.`);
	console.log('RESULT=NONE');
	process.exit(0);
}
for (const { t, strong } of hits.slice(0, 10)) {
	console.log(`${strong ? 'MATCH ' : 'maybe '} ${t.data.category}/${t.slug}  —  ${t.data.title}  ${relative(ROOT, t.file)}`);
	if (t.data.aliases?.length) console.log(`        aliases: ${t.data.aliases.join(', ')}`);
}
if (hits.some((h) => h.strong)) {
	console.log('\nStrong match found: update the existing file instead of creating a new one.');
	console.log('RESULT=MATCH');
} else {
	console.log('\nRESULT=MAYBE — decide whether these are the same concept before creating a file.');
}
