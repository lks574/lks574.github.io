#!/usr/bin/env node
// Lint the shared procedure package in src/content/90-system.
// Checks: skill folder == frontmatter name, kebab-case, description present,
// agents have name+description, canonical file names (spec_review.md), no auto signatures.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parseFrontmatter } from './glossary-lib.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const SYS = join(ROOT, 'src/content/90-system');
const errors = [];
const err = (f, m) => errors.push(`${relative(ROOT, f)}: ${m}`);
const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// skills
for (const name of readdirSync(join(SYS, 'skills'))) {
	const dir = join(SYS, 'skills', name);
	if (!statSync(dir).isDirectory()) continue;
	const file = join(dir, 'SKILL.md');
	if (!existsSync(file)) { err(dir, 'missing SKILL.md'); continue; }
	if (!KEBAB.test(name)) err(file, `folder "${name}" must be kebab-case`);
	const { data } = parseFrontmatter(readFileSync(file, 'utf8'));
	if (!data) { err(file, 'missing frontmatter'); continue; }
	if (data.name !== name) err(file, `frontmatter name "${data.name}" must equal folder "${name}"`);
	if (!data.description || String(data.description).length < 20) err(file, 'description missing or too short');
}
// agents
for (const f of readdirSync(join(SYS, 'agents')).filter((n) => n.endsWith('.md'))) {
	const file = join(SYS, 'agents', f);
	const { data } = parseFrontmatter(readFileSync(file, 'utf8'));
	if (!data) { err(file, 'missing frontmatter'); continue; }
	if (!data.name) err(file, 'name missing');
	if (data.name && `${data.name}.md` !== f) err(file, `name "${data.name}" must equal file name`);
	if (!data.description) err(file, 'description missing');
}
// agents must only reference skills that exist in this package (self-contained)
const skillNames = new Set(readdirSync(join(SYS, 'skills')).filter((n) => statSync(join(SYS, 'skills', n)).isDirectory()));
for (const f of readdirSync(join(SYS, 'agents')).filter((n) => n.endsWith('.md'))) {
	const file = join(SYS, 'agents', f);
	const fm = readFileSync(file, 'utf8').split('---')[1] ?? '';
	const m = fm.match(/^skills:\s*\n((?:\s*-\s*.*\n)+)/m);
	if (!m) continue;
	for (const ref of m[1].split('\n').map((l) => l.replace(/^\s*-\s*/, '').trim()).filter(Boolean)) {
		if (!skillNames.has(ref)) err(file, `references skill "${ref}" that is not in 90-system/skills (package must be self-contained)`);
	}
}
// canonical names and forbidden signatures across the package
const walk = (d, out = []) => { for (const n of readdirSync(d)) { const p = join(d, n); statSync(p).isDirectory() ? walk(p, out) : /\.(md|sh)$/.test(n) && out.push(p); } return out; };
for (const f of walk(SYS)) {
	const t = readFileSync(f, 'utf8');
	if (/spec-review\.md/.test(t)) err(f, 'use the canonical file name spec_review.md');
	if (/Co-Authored-By: (Claude|Anthropic)/i.test(t) && !/넣지 않는다|금지/.test(t)) err(f, 'contains an automatic signature');
	if (/\/Users\/[a-z]/.test(t) && !f.endsWith('README.md')) err(f, 'contains a machine-specific absolute path (/Users/...)');
}
// required files
for (const req of ['DIRECTION.md', 'README.md', 'agents-md/COMMON.md', 'install.sh', 'link-repo.sh']) if (!existsSync(join(SYS, req))) err(join(SYS, req), 'required file missing');

for (const e of errors) console.error(`error ${e}`);
console.log(`skills lint: ${errors.length} error(s)`);
process.exit(errors.length ? 1 : 0);
