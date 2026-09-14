#!/usr/bin/env node
// Report which episodic notes (tools/** with a 🧭 lesson section) have principles
// that are not yet promoted into the glossary (term 🧭 section + sources).
// Read-only. Exit code is always 0. Usage: npm run glossary:promote [-- --json]
import { readFileSync } from 'node:fs';
import { GLOSSARY_DIR, WIKI_DIR, entryId, loadGlossary, parseFrontmatter, section, walk, wikilinks } from './glossary-lib.mjs';

const NEW_TERM_MARK = '아직 용어집에 없음';
// frontmatter field names that appear in backticks in prose and are never term slugs
const RESERVED = new Set(['sources', 'aliases', 'tags', 'title', 'description', 'category', 'updateddate', 'supersededby']);

export function collectCandidates() {
	const terms = loadGlossary();
	const bySlug = new Map(terms.map((t) => [t.slug, t]));
	const notes = walk(WIKI_DIR)
		.filter((f) => !f.startsWith(GLOSSARY_DIR))
		.map((file) => {
			const { data, body } = parseFrontmatter(readFileSync(file, 'utf8'));
			return { file, id: entryId(file, WIKI_DIR), data: data ?? {}, body: body ?? '' };
		});
	const noteById = new Map(notes.map((n) => [n.id, n]));

	const episodic = notes.filter((n) => n.id.startsWith('tools/') && section(n.body, '🧭') !== null);
	const candidates = [];

	for (const n of episodic) {
		const lesson = section(n.body, '🧭');
		const linkedTerms = new Set(
			wikilinks(lesson)
				.map((name) => name.replace(/ /g, '-'))
				.filter((name) => !name.includes('/') && bySlug.has(name)),
		);
		for (const slug of linkedTerms) {
			const t = bySlug.get(slug);
			const sources = Array.isArray(t.data.sources) ? t.data.sources : [];
			if (!sources.includes(n.id)) {
				candidates.push({ type: 'missing-source', note: n.id, term: slug, action: `${slug}의 frontmatter sources에 "${n.id}" 추가` });
			}
			if (section(t.body, '🧭') === null) {
				candidates.push({ type: 'missing-judgement', note: n.id, term: slug, action: `${slug}에 '## 🧭 내 실무 판단 & 사례' 섹션을 만들고 이 노트의 원칙을 옮김` });
			}
		}
		for (const line of lesson.split(/\r?\n/)) {
			if (!line.includes(NEW_TERM_MARK)) continue;
			// every backtick kebab token after the marker on this line, minus frontmatter field names
			const after = line.slice(line.indexOf(NEW_TERM_MARK) + NEW_TERM_MARK.length);
			const slugs = [...after.matchAll(/`([a-z0-9]+(?:-[a-z0-9]+)*)`/g)]
				.map((m) => m[1])
				.filter((s) => !RESERVED.has(s) && !bySlug.has(s));
			if (slugs.length) candidates.push({ type: 'new-term', note: n.id, slugs, action: `add-glossary-term 스킬로 ${slugs.join(', ')} 생성 후 sources에 이 노트 등록` });
		}
	}

	for (const t of terms) {
		const sources = Array.isArray(t.data.sources) ? t.data.sources : [];
		for (const src of sources) {
			if (/^https?:\/\//.test(src)) continue;
			const n = noteById.get(src);
			if (!n) continue; // lint reports unresolved sources as an error
			if (!wikilinks(n.body).some((name) => name.replace(/ /g, '-') === t.slug)) {
				candidates.push({ type: 'source-without-link', note: n.id, term: t.slug, action: `${n.id}의 🧭 섹션에 [[${t.slug}]] 링크 추가 (또는 sources에서 제거)` });
			}
		}
	}

	const byType = { 'missing-source': 0, 'missing-judgement': 0, 'new-term': 0, 'source-without-link': 0 };
	for (const c of candidates) byType[c.type]++;
	return { episodicNotes: episodic.map((n) => n.id), candidates, summary: { total: candidates.length, byType } };
}

export function summaryLine(report) {
	return `promotion: 승격 대기 ${report.summary.total}건 (npm run glossary:promote)`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const report = collectCandidates();
	if (process.argv.includes('--json')) {
		process.stdout.write(JSON.stringify(report, null, 2) + '\n');
	} else if (report.summary.total === 0) {
		console.log(`승격 대기 0건 (일화 노트 ${report.episodicNotes.length}개 검사)`);
	} else {
		console.log(`| 유형 | 노트 | 용어 | 다음 행동 |`);
		console.log(`|---|---|---|---|`);
		for (const c of report.candidates) console.log(`| ${c.type} | ${c.note} | ${c.term ?? (c.slugs ?? []).join(', ')} | ${c.action} |`);
		console.log(`\n승격 대기 ${report.summary.total}건 (일화 노트 ${report.episodicNotes.length}개 검사)`);
	}
	process.exit(0);
}
