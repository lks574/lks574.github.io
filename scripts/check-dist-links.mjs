#!/usr/bin/env node
// After `astro build`: every internal href/src in dist must resolve to a built file.
// Catches silent 404s (wrong category slug, capitalised note name, moved page). Exit 1 on any miss.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
if (!existsSync(DIST)) { console.error('dist/ not found; run astro build first'); process.exit(2); }
const walk = (d, out = []) => { for (const n of readdirSync(d)) { const p = join(d, n); statSync(p).isDirectory() ? walk(p, out) : n.endsWith('.html') && out.push(p); } return out; };
const misses = new Map();
for (const f of walk(DIST)) {
	const html = readFileSync(f, 'utf8');
	for (const m of html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
		const path = decodeURIComponent(m[1]);
		if (path.startsWith('//')) continue;
		const clean = path.replace(/\/$/, '');
		const ok = existsSync(join(DIST, clean)) || existsSync(join(DIST, clean, 'index.html')) || existsSync(join(DIST, clean + '.html'));
		if (!ok) misses.set(path, [...(misses.get(path) ?? []), relative(DIST, f)]);
	}
}
for (const [path, pages] of misses) console.error(`error 404 ${path}  <- ${pages.slice(0, 3).join(', ')}${pages.length > 3 ? ` (+${pages.length - 3})` : ''}`);
console.log(`dist links: ${misses.size} broken path(s)`);
process.exit(misses.size ? 1 : 0);
