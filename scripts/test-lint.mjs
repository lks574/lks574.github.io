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

// promotion-candidates fixtures: run the report (not the lint) against a vault copy
import { spawnSync as spawnReport } from 'node:child_process';
const episodic = (id, lesson) => `---
title: "${id}"
description: "fixture"
updatedDate: ${today}
---

## 1. 증상
- x

## 4. 🧭 얻은 원칙 & 관련 용어 (Lesson)
${lesson}

## 🔗 목록
- [[tools/react-native]]
`;
const term = (slug, extra = '') => good(slug, extra); // glossary fixture without a 🧭 section
const termWithJudgement = (slug, extra = '') => good(slug, extra).replace('## 🔗 연관 개념', '## 🧭 내 실무 판단 & 사례\n- x\n\n## 🔗 연관 개념');
const metroClean = readFileSync(join(SRC, 'tools/react-native/troubleshooting/metro-cache-reset.md'), 'utf8').replace(/^- 관련 용어: 아직 용어집에 없음.*$/m, '- 관련 용어: 없음');
const promoCases = [
	{ name: 'promo: missing-source', files: { 'glossary/ai/fx-term.md': termWithJudgement('fx-term'), 'tools/fixture/a.md': episodic('a', '- 원칙 → [[fx-term]]') }, expect: (r) => r.candidates.some((c) => c.type === 'missing-source' && c.note === 'tools/fixture/a' && c.term === 'fx-term') && !r.candidates.some((c) => c.type === 'missing-judgement' && c.term === 'fx-term') },
	{ name: 'promo: missing-judgement', files: { 'glossary/ai/fx-nojudge.md': term('fx-nojudge', 'sources: ["tools/fixture/b"]\n'), 'tools/fixture/b.md': episodic('b', '- 원칙 → [[fx-nojudge]]') }, expect: (r) => r.candidates.some((c) => c.type === 'missing-judgement' && c.term === 'fx-nojudge') && !r.candidates.some((c) => c.type === 'missing-source' && c.term === 'fx-nojudge') },
	{ name: 'promo: new-term (no 후보 word, two sentences, reserved name excluded)', files: { 'tools/fixture/n.md': episodic('n', '- 관련 용어: 아직 용어집에 없음: `alpha-one`. 그리고 `beta-two`도 검토. 이 노트를 `sources`에 등록한다.') }, expect: (r) => { const c = r.candidates.find((x) => x.type === 'new-term' && x.note === 'tools/fixture/n'); return !!c && c.slugs.join(',') === 'alpha-one,beta-two'; } },
	{ name: 'promo: source-without-link', files: { 'glossary/ai/fx-orphan.md': termWithJudgement('fx-orphan', 'sources: ["tools/fixture/z"]\n'), 'tools/fixture/z.md': episodic('z', '- 원칙만 있고 링크 없음') }, expect: (r) => r.candidates.some((c) => c.type === 'source-without-link' && c.term === 'fx-orphan' && c.note === 'tools/fixture/z') },
	{ name: 'promo: ignores code and unresolved', files: { 'tools/fixture/c.md': episodic('c', '- 코드 `[[rag]]` 와 [[없는용어]] 만 있음') }, expect: (r) => r.episodicNotes.includes('tools/fixture/c') && !r.candidates.some((c) => c.note === 'tools/fixture/c') },
	{ name: 'promo: episodic detection requires 🧭 section', files: { 'tools/fixture/with.md': episodic('with', '- x'), 'tools/fixture/without.md': '---\ntitle: "without"\ndescription: "fixture"\nupdatedDate: ' + today + '\n---\n\n## 1. 증상\n- x\n' }, expect: (r) => r.episodicNotes.includes('tools/fixture/with') && !r.episodicNotes.includes('tools/fixture/without') },
	{ name: 'promo: zero candidates prints one line (AC-PR-010)', files: { 'tools/react-native/troubleshooting/metro-cache-reset.md': metroClean }, args: [], expectText: (out) => out.trim().startsWith('승격 대기 0건') && !out.includes('|') },
];
let failed = 0;
for (const c of promoCases) {
	const dir = mkdtempSync(join(tmpdir(), 'glossary-promo-'));
	cpSync(SRC, dir, { recursive: true });
	for (const [rel, content] of Object.entries(c.files)) { mkdirSync(join(dir, rel, '..'), { recursive: true }); writeFileSync(join(dir, rel), content); }
	const args = c.args ?? ['--json'];
	const r = spawnReport(process.execPath, [join(ROOT, 'scripts/promotion-candidates.mjs'), ...args], { env: { ...process.env, WIKI_ROOT: dir }, encoding: 'utf8' });
	rmSync(dir, { recursive: true, force: true });
	let ok = r.status === 0;
	if (ok && c.expectText) ok = c.expectText(r.stdout);
	else if (ok) {
		let report = null;
		try { report = JSON.parse(r.stdout); } catch { ok = false; }
		if (ok) ok = c.expect(report);
	}
	if (!ok) { failed++; console.error(`FAIL ${c.name}\n  exit=${r.status}\n${r.stdout.slice(0, 1500)}\n${r.stderr}`); } else console.log(`ok   ${c.name}`);
}
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
console.log(`\n${cases.length + promoCases.length - failed}/${cases.length + promoCases.length} lint fixture tests passed`);
process.exit(failed ? 1 : 0);
