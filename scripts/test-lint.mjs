#!/usr/bin/env node
// Negative tests for scripts/lint-glossary.mjs.
// Copies the real vault into a temp dir, injects known-bad fixtures, and asserts
// that the linter reports each one. Run: npm test
import { cpSync, mkdtempSync, rmSync, writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = new URL('..', import.meta.url).pathname;
const SRC = join(ROOT, 'src/content/10-wiki');
const today = new Date().toISOString().slice(0, 10);

const good = (slug, extra = '') => `---
title: "${slug} (테스트)"
description: "테스트용 설명 문장입니다. 열 글자 이상."
category: "ai"
tags: ["test"]
aliases: []
updatedDate: ${today}
${extra}---

## 💡 핵심 정의
- x

## 🎯 왜 알아야 하는가? (실무 가치)
- x

## ⚙️ 동작 원리 & 메커니즘
- x

## 🔗 연관 개념
- 
`;

const cases = [
	{ name: 'baseline passes', files: {}, expectErrors: [] },
	{ name: 'category mismatch', files: { 'glossary/ai/wrong-cat.md': good('wrong-cat').replace('category: "ai"', 'category: "client"') }, expectErrors: ['must equal folder'] },
	{ name: 'future date', files: { 'glossary/ai/future.md': good('future').replace(today, '2999-01-01') }, expectErrors: ['is in the future'] },
	{ name: 'hallucinated old date', files: { 'glossary/ai/old.md': good('old').replace(today, '2025-01-01') }, expectErrors: ['predates the project'] },
	{ name: 'missing section', files: { 'glossary/ai/nosec.md': good('nosec').replace('## ⚙️ 동작 원리 & 메커니즘\n- x\n', '') }, expectErrors: ['missing section "## ⚙️'] },
	{ name: 'bad slug', files: { 'glossary/ai/Bad_Slug.md': good('Bad_Slug') }, expectErrors: ['must be lowercase kebab-case'] },
	{ name: 'unresolved wikilink', files: { 'glossary/ai/dangling.md': good('dangling').replace('## 🔗 연관 개념\n- ', '## 🔗 연관 개념\n- [[does-not-exist]]') }, expectErrors: ['does not resolve'] },
	{ name: 'one-way related link', files: { 'glossary/ai/oneway.md': good('oneway').replace('## 🔗 연관 개념\n- ', '## 🔗 연관 개념\n- [[rag]]') }, expectErrors: ['missing backlink: oneway lists [[rag]]'] },
	{ name: 'duplicate alias', files: { 'glossary/ai/dup.md': good('dup').replace('aliases: []', 'aliases: ["RAG"]') }, expectErrors: ['duplicates'] },
	{ name: 'slug collision with wiki note', files: { 'glossary/ai/yoga-flexbox.md': good('yoga-flexbox') }, expectErrors: ['collides with'] },
	{ name: 'uppercase file name', files: { 'concepts/Upper-Case.md': '---\ntitle: "x"\n---\n\nbody\n' }, expectErrors: ['file name must be lowercase'] },
	{ name: 'block list frontmatter parses', files: { 'glossary/ai/blocklist.md': good('blocklist').replace('tags: ["test"]', 'tags:\n  - test\n  - two') }, expectErrors: [] },
];

let failed = 0;
for (const c of cases) {
	const dir = mkdtempSync(join(tmpdir(), 'glossary-lint-'));
	cpSync(SRC, dir, { recursive: true });
	for (const [rel, content] of Object.entries(c.files)) {
		mkdirSync(join(dir, rel, '..'), { recursive: true });
		writeFileSync(join(dir, rel), content);
	}
	const r = spawnSync(process.execPath, [join(ROOT, 'scripts/lint-glossary.mjs')], { env: { ...process.env, WIKI_ROOT: dir }, encoding: 'utf8' });
	const out = r.stdout + r.stderr;
	rmSync(dir, { recursive: true, force: true });
	const missing = c.expectErrors.filter((e) => !out.includes(e));
	const shouldFail = c.expectErrors.length > 0;
	const ok = missing.length === 0 && (shouldFail ? r.status === 1 : r.status === 0);
	if (!ok) {
		failed++;
		console.error(`FAIL ${c.name}\n  exit=${r.status} missing=${JSON.stringify(missing)}\n  --- output ---\n${out}`);
	} else console.log(`ok   ${c.name}`);
}
console.log(`\n${cases.length - failed}/${cases.length} lint fixture tests passed`);
process.exit(failed ? 1 : 0);
