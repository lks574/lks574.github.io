#!/usr/bin/env node
// Lint the agent-curated glossary and wiki links.
// Exit 1 on errors. Run: npm run lint:glossary
import { readFileSync } from 'node:fs';
import { relative } from 'node:path';
import { CATEGORIES, GLOSSARY_DIR, ROOT, WIKI_DIR, entryId, loadGlossary, parseFrontmatter, section, walk, wikilinks } from './glossary-lib.mjs';

const REQUIRED_SECTIONS = [
	{ label: '## 💡 핵심 정의', test: /^## 💡/m },
	{ label: '## 🎯 왜 알아야 하는가?', test: /^## 🎯/m },
	{ label: '## ⚙️ 동작 원리 & 메커니즘', test: /^## ⚙️?/m },
	{ label: '## 🔗 연관 개념', test: /^## 🔗/m },
];
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MIN_DATE = new Date('2026-01-01');
const today = new Date();
today.setHours(23, 59, 59, 999);

const errors = [];
const warnings = [];
const rel = (f) => relative(ROOT, f);
const err = (file, msg) => errors.push(`${rel(file)}: ${msg}`);
const warn = (file, msg) => warnings.push(`${rel(file)}: ${msg}`);

const terms = loadGlossary();

// ---- 1. Build the set of names a wikilink can resolve to (mirrors src/pages/wiki/[...slug].astro)
const resolvable = new Map(); // name -> owner
const claim = (name, owner) => {
	if (!resolvable.has(name)) resolvable.set(name, owner);
	else if (resolvable.get(name) !== owner) err(owner, `bare name "${name}" collides with ${rel(resolvable.get(name))}; the second note would be silently dropped from /wiki/${name}`);
};
for (const t of terms) {
	claim(`glossary/${t.id}`, t.file);
	claim(t.slug, t.file);
}
const wikiFiles = walk(WIKI_DIR).filter((f) => !f.startsWith(GLOSSARY_DIR));
for (const f of wikiFiles) {
	const id = entryId(f, WIKI_DIR);
	if (!id) continue;
	const rawId = relative(WIKI_DIR, f).replace(/\.(md|mdx)$/, '');
	if (rawId !== rawId.toLowerCase()) err(f, `file name must be lowercase: Astro serves it at /wiki/${id}/ so [[${rawId.split('/').pop()}]] 404s on GitHub Pages`);
	claim(id, f);
	const tail = id.split('/').pop();
	if (tail !== id) claim(tail, f);
}

// ---- 2. Per-term checks
const seenTitles = new Map(); // normalized title/alias -> file
const norm = (s) => String(s).toLowerCase().replace(/\s+/g, ' ').trim();

for (const t of terms) {
	const { file, data, body } = t;

	if (!t.hasFrontmatter) {
		err(file, 'missing frontmatter');
		continue;
	}
	if (!CATEGORIES.includes(t.folderCategory)) err(file, `folder "${t.folderCategory}" is not one of ${CATEGORIES.join('|')}`);
	if (t.slug.includes('/')) err(file, 'nested folders are not allowed: use glossary/{category}/{slug}.md');
	if (!SLUG_RE.test(t.slug)) err(file, `filename "${t.slug}" must be lowercase kebab-case`);

	if (!data.title) err(file, 'title is required');
	if (!data.description || data.description.length < 10) err(file, 'description is required (>= 10 chars)');
	if (data.category !== t.folderCategory) err(file, `frontmatter category "${data.category}" must equal folder "${t.folderCategory}"`);
	if (data.tags !== undefined && !Array.isArray(data.tags)) err(file, 'tags must be an inline array');
	if (data.aliases !== undefined && !Array.isArray(data.aliases)) err(file, 'aliases must be an inline array');
	if (data.sources !== undefined && !Array.isArray(data.sources)) err(file, 'sources must be an inline array');

	if (!data.updatedDate) err(file, 'updatedDate is required (YYYY-MM-DD, use `date +%F`)');
	else if (!/^\d{4}-\d{2}-\d{2}$/.test(String(data.updatedDate))) err(file, `updatedDate "${data.updatedDate}" must be YYYY-MM-DD`);
	else {
		const d = new Date(String(data.updatedDate));
		if (Number.isNaN(d.valueOf())) err(file, `updatedDate "${data.updatedDate}" is not a valid date`);
		else if (d > today) err(file, `updatedDate ${data.updatedDate} is in the future`);
		else if (d < MIN_DATE) err(file, `updatedDate ${data.updatedDate} predates the project; agents must use the real current date`);
	}

	if (data.supersededBy && !resolvable.has(String(data.supersededBy))) err(file, `supersededBy "${data.supersededBy}" does not resolve to any note`);

	for (const s of REQUIRED_SECTIONS) if (!s.test.test(body)) err(file, `missing section "${s.label}"`);
	const order = REQUIRED_SECTIONS.map((s) => body.search(s.test)).filter((i) => i >= 0);
	if (order.length === REQUIRED_SECTIONS.length && order.some((i, k) => k > 0 && i < order[k - 1])) warn(file, 'sections are out of the standard order');

	// Title / alias duplicates across the glossary
	for (const name of [data.title, ...(Array.isArray(data.aliases) ? data.aliases : [])]) {
		if (!name) continue;
		const key = norm(name);
		if (seenTitles.has(key) && seenTitles.get(key) !== file) err(file, `title/alias "${name}" duplicates ${rel(seenTitles.get(key))}`);
		else seenTitles.set(key, file);
	}

	// Sources should resolve (wikilink names) or be URLs
	for (const src of Array.isArray(data.sources) ? data.sources : []) {
		if (/^https?:\/\//.test(src)) continue;
		if (!resolvable.has(src)) err(file, `source "${src}" does not resolve to any note or URL`);
	}
}


// ---- 2b. Related-concept graph: glossary→glossary links must be mutual, glossary→wiki links must use full paths
const bySlugMap = new Map(terms.map((t) => [t.slug, t]));
const related = new Map(); // slug -> Set(slug)
for (const t of terms) {
	const sec = section(t.body, '🔗');
	const names = sec ? wikilinks(sec) : [];
	const set = new Set();
	for (const raw of names) {
		const name = raw.replace(/ /g, '-');
		if (bySlugMap.has(name)) set.add(name);
		else if (name.startsWith('glossary/')) err(t.file, `link glossary terms by bare slug, not "${raw}"`);
		else if (!name.includes('/') && resolvable.has(name)) err(t.file, `wikilink [[${raw}]] to a non-glossary note must use its full path (e.g. [[tools/react-native/${name}]])`);
	}
	related.set(t.slug, set);
}
for (const [a, set] of related) {
	for (const b of set) {
		if (!related.get(b)?.has(a)) err(bySlugMap.get(b).file, `missing backlink: ${a} lists [[${b}]] as related but this file does not list [[${a}]] (AGENTS.md rule 6)`);
	}
}

// ---- 2c. Tacit-knowledge coverage (the part that separates this glossary from an encyclopedia)
const withJudgement = terms.filter((t) => /^## 🧭/m.test(t.body)).length;
const withSources = terms.filter((t) => Array.isArray(t.data.sources) && t.data.sources.length > 0).length;

// Same slug in two categories
const bySlug = new Map();
for (const t of terms) {
	if (bySlug.has(t.slug)) err(t.file, `slug "${t.slug}" also exists at ${rel(bySlug.get(t.slug))}`);
	else bySlug.set(t.slug, t.file);
}

// ---- 3. Wikilink resolution across the whole wiki + glossary
const linkFiles = [...wikiFiles, ...terms.map((t) => t.file)];
for (const f of linkFiles) {
	const text = readFileSync(f, 'utf8');
	const { body } = parseFrontmatter(text);
	for (const name of wikilinks(body ?? text)) {
		const target = name.replace(/ /g, '-'); // remark-wiki-link pageResolver
		if (!resolvable.has(target)) err(f, `wikilink [[${name}]] does not resolve (would 404 at /wiki/${target})`);
	}
}

// Glossary terms nobody links to (orphans) — warning only
const inbound = new Set();
for (const f of linkFiles) {
	const text = readFileSync(f, 'utf8');
	for (const name of wikilinks(text)) inbound.add(name.replace(/ /g, '-'));
}
for (const t of terms) {
	if (!inbound.has(t.slug) && !inbound.has(`glossary/${t.id}`)) warn(t.file, 'orphan: no other note links to this term (acceptable if nothing is genuinely related; do not add forced links)');
}

// ---- Report
for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`error ${e}`);
const pct = (n) => (terms.length ? Math.round((n / terms.length) * 100) : 0);
console.log(`\nglossary lint: ${terms.length} terms, ${errors.length} error(s), ${warnings.length} warning(s)`);
console.log(`tacit knowledge: 🧭 section ${withJudgement}/${terms.length} (${pct(withJudgement)}%), sources ${withSources}/${terms.length} (${pct(withSources)}%)`);
process.exit(errors.length ? 1 : 0);
