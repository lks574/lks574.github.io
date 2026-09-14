// Shared helpers for glossary tooling. No external dependencies.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

export const ROOT = new URL('..', import.meta.url).pathname;
// WIKI_ROOT lets the fixture tests point the linter at a copy of the vault.
export const WIKI_DIR = process.env.WIKI_ROOT ? process.env.WIKI_ROOT : join(ROOT, 'src/content/10-wiki');
export const GLOSSARY_DIR = join(WIKI_DIR, 'glossary');
export const CATEGORIES = ['ai', 'architecture', 'client', 'product'];

export function walk(dir, out = []) {
	for (const name of readdirSync(dir)) {
		const full = join(dir, name);
		if (statSync(full).isDirectory()) walk(full, out);
		else if (/\.(md|mdx)$/.test(name)) out.push(full);
	}
	return out;
}

/**
 * Minimal YAML frontmatter parser for lint purposes: scalars, inline arrays,
 * block lists (`- item`), quoted strings, ISO dates. Comments are stripped only
 * outside quotes. Anything more exotic should be avoided in glossary files.
 */
export function parseFrontmatter(text) {
	const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
	if (!m) return { data: null, body: text };
	const data = {};
	const lines = m[1].split(/\r?\n/);
	let i = 0;
	while (i < lines.length) {
		const line = stripComment(lines[i]).trimEnd();
		i++;
		if (!line.trim()) continue;
		const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
		if (!kv) continue;
		const [, key, raw] = kv;
		if (raw.trim() === '>' || raw.trim() === '|' || raw.trim() === '>-' || raw.trim() === '|-') {
			// folded / literal block scalar: collect indented lines
			const parts = [];
			while (i < lines.length && (/^\s+\S/.test(lines[i]) || lines[i].trim() === '')) {
				if (lines[i].trim() === '' && !(i + 1 < lines.length && /^\s+\S/.test(lines[i + 1]))) break;
				parts.push(lines[i].trim());
				i++;
			}
			data[key] = parts.join(raw.trim().startsWith('>') ? ' ' : '\n').trim();
			continue;
		}
		if (raw.trim() === '') {
			// block list?
			const items = [];
			while (i < lines.length && /^\s+-\s*/.test(lines[i])) {
				items.push(unquote(stripComment(lines[i]).replace(/^\s+-\s*/, '').trim()));
				i++;
			}
			data[key] = items.length ? items : '';
			continue;
		}
		data[key] = parseScalar(raw);
	}
	return { data, body: m[2] };
}

function stripComment(line) {
	let inS = false;
	let inD = false;
	for (let k = 0; k < line.length; k++) {
		const c = line[k];
		if (c === "'" && !inD) inS = !inS;
		else if (c === '"' && !inS) inD = !inD;
		else if (c === '#' && !inS && !inD && (k === 0 || /\s/.test(line[k - 1]))) return line.slice(0, k);
	}
	return line;
}

function parseScalar(raw) {
	const v = raw.trim();
	if (v === '') return '';
	if (v.startsWith('[') && v.endsWith(']')) {
		const inner = v.slice(1, -1).trim();
		if (!inner) return [];
		return inner.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map((x) => unquote(x.trim()));
	}
	return unquote(v);
}

function unquote(v) {
	if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) return v.slice(1, -1);
	return v;
}

/** Content id the Astro glob loader would assign, relative to `base`. */
export function entryId(file, base) {
	// Astro's glob loader slugifies ids to lowercase; URLs on GitHub Pages (Linux) are case-sensitive.
	let id = relative(base, file).split(sep).join('/').replace(/\.(md|mdx)$/, '').toLowerCase();
	if (id.endsWith('/index')) id = id.slice(0, -'/index'.length);
	if (id === 'index') id = '';
	return id;
}

export function loadGlossary() {
	return walk(GLOSSARY_DIR).map((file) => {
		const text = readFileSync(file, 'utf8');
		const { data, body } = parseFrontmatter(text);
		const id = entryId(file, GLOSSARY_DIR); // e.g. ai/rag
		const [folderCategory, ...rest] = id.split('/');
		return { file, id, slug: rest.join('/'), folderCategory, data: data ?? {}, body, hasFrontmatter: data !== null };
	});
}

/**
 * Extract `[[target]]` and `[[target|label]]` names from markdown.
 * Fenced code blocks and inline code are skipped: remark does not turn
 * `[[example]]` inside code into a link, so neither should the linter.
 */
export function wikilinks(text) {
	const prose = text.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
	const out = [];
	for (const m of prose.matchAll(/\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]/g)) out.push(m[1].trim());
	return out;
}

/** Return the text of one `## <emoji> ...` section (up to the next `## `). */
export function section(body, emojiPrefix) {
	// header may carry a number before the emoji: `## 4. 🧭 얻은 원칙`
	const re = new RegExp(`^## [^\\n]*?${emojiPrefix}[^\\n]*\\n([\\s\\S]*?)(?=^## |$(?![\\r\\n]))`, 'm');
	const m = body.match(re);
	return m ? m[1] : null;
}
