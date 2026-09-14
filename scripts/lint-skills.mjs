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
// canonical names and forbidden signatures across the package
const walk = (d, out = []) => { for (const n of readdirSync(d)) { const p = join(d, n); statSync(p).isDirectory() ? walk(p, out) : /\.(md|sh)$/.test(n) && out.push(p); } return out; };
for (const f of walk(SYS)) {
	const t = readFileSync(f, 'utf8');
	if (/spec-review\.md/.test(t)) err(f, 'use the canonical file name spec_review.md');
	if (/Co-Authored-By: (Claude|Anthropic)/i.test(t) && !/넣지 않는다|금지/.test(t)) err(f, 'contains an automatic signature');
}
// required files
for (const req of ['DIRECTION.md', 'README.md', 'agents-md/COMMON.md', 'install.sh', 'link-repo.sh']) if (!existsSync(join(SYS, req))) err(join(SYS, req), 'required file missing');

for (const e of errors) console.error(`error ${e}`);
console.log(`skills lint: ${errors.length} error(s)`);
process.exit(errors.length ? 1 : 0);
