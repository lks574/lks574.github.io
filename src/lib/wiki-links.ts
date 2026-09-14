import { getCollection, type CollectionEntry } from 'astro:content';

/**
 * Single source of truth for how `[[wikilinks]]` resolve to notes.
 * Used by the /wiki/[...slug] route (path generation) and by backlink
 * computation, so the two can never disagree. scripts/lint-glossary.mjs
 * mirrors the same rule in plain JS for CI.
 */

export type NoteKind = 'decision' | 'concept' | 'glossary' | 'other';

export interface NoteRef {
	key: string; // 'wiki:tools/ios/index' | 'glossary:ai/rag'
	title: string;
	href: string; // canonical path
	kind: NoteKind;
	category?: string; // glossary only
}

export type WikiEntry = CollectionEntry<'wiki'>;
export type GlossaryEntry = CollectionEntry<'glossary'>;
export type AnyEntry = { kind: 'wiki'; entry: WikiEntry } | { kind: 'glossary'; entry: GlossaryEntry };

export interface NoteIndex {
	byKey: Map<string, NoteRef>;
	/** every path a wikilink name may take, in priority order: glossary first */
	byName: Map<string, NoteRef>;
	entries: AnyEntry[];
}

export const noteKey = (kind: 'wiki' | 'glossary', id: string) => `${kind}:${id}`;

const kindOf = (kind: 'wiki' | 'glossary', id: string): NoteKind => {
	if (kind === 'glossary') return 'glossary';
	if (id.startsWith('tools/')) return 'decision';
	if (id.startsWith('concepts/')) return 'concept';
	return 'other';
};

let indexPromise: Promise<NoteIndex> | undefined;

/** Build (once per process) the index of every note and the names that resolve to it. */
export function getNoteIndex(): Promise<NoteIndex> {
	indexPromise ??= (async () => {
		const [wiki, glossary] = await Promise.all([getCollection('wiki'), getCollection('glossary')]);
		const byKey = new Map<string, NoteRef>();
		const byName = new Map<string, NoteRef>();
		const entries: AnyEntry[] = [];
		const claim = (name: string, ref: NoteRef) => {
			if (!byName.has(name)) byName.set(name, ref);
		};

		// glossary first so a bare `[[rag]]` prefers the term over a wiki note with the same file name
		for (const entry of glossary) {
			const ref: NoteRef = {
				key: noteKey('glossary', entry.id),
				title: entry.data.title,
				href: `/wiki/glossary/${entry.id}/`,
				kind: 'glossary',
				category: entry.data.category,
			};
			byKey.set(ref.key, ref);
			entries.push({ kind: 'glossary', entry });
			claim(`glossary/${entry.id}`, ref);
			claim(entry.id.split('/').pop()!, ref);
		}
		for (const entry of wiki) {
			const ref: NoteRef = {
				key: noteKey('wiki', entry.id),
				title: entry.data.title || entry.id,
				href: `/wiki/${entry.id}/`,
				kind: kindOf('wiki', entry.id),
			};
			byKey.set(ref.key, ref);
			entries.push({ kind: 'wiki', entry });
			claim(entry.id, ref);
			const tail = entry.id.split('/').pop();
			if (tail && tail !== entry.id) claim(tail, ref);
		}
		return { byKey, byName, entries };
	})();
	return indexPromise;
}

/** Same normalisation as remark-wiki-link's pageResolver in astro.config.mjs */
export const normalizeName = (name: string) => name.trim().replace(/ /g, '-');

export function resolveWikilink(name: string, index: NoteIndex): NoteRef | undefined {
	return index.byName.get(normalizeName(name));
}

/** `[[target]]`, `[[target|label]]`, `[[target#anchor]]` names, skipping fenced and inline code. */
export function extractWikilinks(markdown: string): string[] {
	const prose = markdown.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
	const out: string[] = [];
	for (const m of prose.matchAll(/\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]/g)) out.push(m[1].trim());
	return out;
}

const KIND_ORDER: Record<NoteKind, number> = { decision: 0, concept: 1, glossary: 2, other: 3 };

let backlinksPromise: Promise<Map<string, NoteRef[]>> | undefined;

/** target key -> sources, sorted by kind then title. Computed once per build. */
export function getBacklinks(): Promise<Map<string, NoteRef[]>> {
	backlinksPromise ??= (async () => {
		const index = await getNoteIndex();
		const sets = new Map<string, Set<string>>();
		for (const { kind, entry } of index.entries) {
			const sourceKey = noteKey(kind, entry.id);
			for (const name of extractWikilinks(entry.body ?? '')) {
				const target = resolveWikilink(name, index);
				if (!target) {
					console.warn(`[backlinks] unresolved [[${name}]] in ${sourceKey}`);
					continue;
				}
				if (target.key === sourceKey) continue;
				(sets.get(target.key) ?? sets.set(target.key, new Set()).get(target.key)!).add(sourceKey);
			}
		}
		const result = new Map<string, NoteRef[]>();
		for (const [target, sources] of sets) {
			const refs = [...sources].map((k) => index.byKey.get(k)!).filter(Boolean);
			refs.sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind] || a.title.localeCompare(b.title, 'ko'));
			result.set(target, refs);
		}
		return result;
	})();
	return backlinksPromise;
}
