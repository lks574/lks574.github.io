# wiki-backlinks Tech Spec

> **작성일**: 2026-09-14
> **작성자**: Claude Code (사용자 검토)
> **버전**: v1.1
> **상태**: Approved

---

## 0. 정의 (Definitions)

### 0.1 도메인 용어

| 용어 | 정의 |
|------|------|
| 노트 | `wiki` 컬렉션 항목 또는 `glossary` 컬렉션 항목 하나 |
| 노트 키 | 노트를 유일하게 가리키는 문자열. wiki는 `wiki:{id}`, glossary는 `glossary:{id}` |
| 정식 경로 | 노트의 canonical URL 경로. wiki `/wiki/{id}/`, glossary `/wiki/glossary/{id}/` |
| 역링크 | 노트 B의 본문에 노트 A로 해소되는 `[[...]]`가 있을 때, A의 역링크 목록에 들어가는 B |
| 해소 규칙 | `[[이름]]`을 노트 키로 바꾸는 규칙. `src/pages/wiki/[...slug].astro`의 경로 생성 규칙과 동일해야 한다 |
| 종류 | 역링크 항목의 분류. `decision`(wiki id가 `tools/`로 시작), `concept`(`concepts/`), `glossary`, `other` |

### 0.2 정책 수치

| 정책 | 값 | 결정 주체 |
|------|-----|----------|
| 역링크 섹션 표시 조건 | 역링크 1개 이상 | PRD 5.1 |
| 정렬 | 종류 순서 decision → concept → glossary → other, 같은 종류 안에서 제목 `localeCompare('ko')` | PRD Q1 (기본값, 사용자 변경 가능) |
| 빌드 시간 상한 | `astro build` 보고 시간 1.0초 (61페이지 기준) | PRD G3 |
| 코드 제외 규칙 | 펜스 코드 블록과 인라인 코드 안의 `[[...]]`는 링크가 아님 | 린트와 동일 |

### 0.3 불변식 (Invariant)

| Invariant | 설명 |
|-----------|------|
| 해소 규칙 단일 소스 | 역링크 계산과 라우트 경로 생성은 같은 함수(`src/lib/wiki-links.ts`)를 사용한다. 두 곳에 규칙을 따로 쓰지 않는다 |
| 빌드당 1회 계산 | 역링크 맵은 프로세스 안에서 한 번만 계산하고 모든 페이지가 공유한다 |
| 콘텐츠 무수정 | 이 기능은 마크다운 파일을 읽기만 한다. 어떤 노트도 생성·수정하지 않는다 |
| 해소 실패는 무시 | 해소되지 않는 링크는 역링크 계산에서 건너뛰고 빌드를 막지 않는다. 검출은 린트의 책임이다 |

---

## 1. 개요 (Overview)

### 1.1 배경 및 목적
위키 노트는 나가는 링크만 보여 준다. 들어오는 링크를 빌드 타임에 계산해 노트 하단에 표시하여, 용어에서 실무 기록으로, 기록에서 용어로 양방향 탐색을 가능하게 한다. 사람이 관리하는 목록은 만들지 않는다.

### 1.2 목표 (Goals)
- 들어오는 링크가 있는 모든 노트에 역링크 섹션이 렌더링된다 (PRD G1, AC-BL-001~003)
- 수동 관리 파일 0개 (PRD G2, AC-BL-008)
- 빌드 시간 1.0초 이하 (PRD G3, AC-BL-010)

### 1.3 비목표 (Non-Goals)
- 옵시디언 내 표시, 그래프 시각화, 링크 문맥 표시, 블로그 역링크 (PRD 4)

---

## 2. 작업 범위 (Scope)

| 구분 | 항목 | 설명 |
|------|------|------|
| In Scope | `src/lib/wiki-links.ts` | 해소 규칙과 역링크 계산 모듈 (신규) |
| In Scope | `src/pages/wiki/[...slug].astro` | 경로 생성이 위 모듈의 해소 규칙을 사용하도록 변경, 역링크를 레이아웃에 전달 |
| In Scope | `src/layouts/WikiNote.astro` | 역링크 섹션 렌더링 |
| In Scope | 검증 | 빌드 결과물 검사 스크립트로 AC 확인 |
| In Scope | `scripts/lint-glossary.mjs`, `scripts/glossary-lib.mjs` | 해소 규칙의 JS 사본을 유지한다. id는 Astro와 같게 소문자화하고 대문자 파일명을 error로 검사한다. TS 모듈과의 불일치는 AC-BL-006 빌드 검사로 잡는다 |

---

## 3. 기능 명세 (Functional Specification)

### 3.1 역링크 계산

**개요**
두 컬렉션의 모든 노트 본문에서 `[[...]]`를 뽑아 해소 규칙으로 노트 키로 바꾸고, 대상 키 → 출처 키 집합 맵을 만든다.

**전제 조건**
- `getCollection('wiki')`, `getCollection('glossary')`가 body를 포함해 반환한다 (Astro 5+ `entry.body`)

**정상 흐름**

| 단계 | 행위자 | 동작 | 결과 |
|------|--------|------|------|
| 1 | 빌드 | 두 컬렉션을 로드하고 노트마다 키, 정식 경로, 제목, 종류를 만든다 | 노트 인덱스 |
| 2 | 빌드 | 각 노트 본문에서 코드 제외 후 `[[이름]]`, `[[이름\|라벨]]`, `[[이름#앵커]]`의 이름을 뽑는다 | 이름 목록 |
| 3 | 빌드 | 이름을 해소 규칙으로 키로 바꾼다. 실패는 건너뛰고 경고 1줄 | 대상 키 |
| 4 | 빌드 | 대상 키가 출처 키와 같으면 제외. 맵에 출처 키를 집합으로 추가 | 역링크 맵 |
| 5 | 페이지 | 자기 키로 맵을 조회해 정렬된 목록을 레이아웃에 넘긴다 | 섹션 렌더링 |

**해소 규칙 (라우트와 동일)**

| 입력 형태 | 해소 |
|---|---|
| `glossary/{cat}/{slug}` | glossary 키 |
| `{wiki id}` (슬래시 포함, 예 `tools/react-native/architecture`) | wiki 키 |
| bare 이름 (슬래시 없음) | glossary slug 우선, 없으면 wiki id의 마지막 세그먼트가 일치하는 노트 |
| 공백 포함 이름 | 공백을 `-`로 바꾼 뒤 위 규칙 (remark-wiki-link pageResolver와 동일) |

**예외 흐름**

| 조건 | 처리 방식 |
|------|----------|
| 해소 실패 | 건너뛴다. 빌드 로그에 `[backlinks] unresolved [[이름]] in {출처}` 1줄 |
| 자기 참조 | 제외 (AC-BL-005) |
| 같은 출처가 여러 번 참조 | 집합이므로 1회 (AC-BL-005) |
| 코드 안의 `[[...]]` | 추출 단계에서 제거 (AC-BL-007) |
| 역링크 0개 | 섹션을 렌더링하지 않음 (AC-BL-004) |

### 3.2 역링크 섹션 렌더링

**개요**
WikiNote 레이아웃이 `backlinks` prop을 받아 출처 섹션 아래에 목록을 그린다.

**정상 흐름**

| 단계 | 행위자 | 동작 | 결과 |
|------|--------|------|------|
| 1 | 레이아웃 | `backlinks.length > 0`이면 `<section class="wiki-backlinks">` 렌더링 | 제목 "🔁 이 노트를 참조하는 노트" |
| 2 | 레이아웃 | 항목마다 `<a href={정식 경로}>{제목}</a>`와 종류 배지. glossary는 카테고리 이름 표시 | 목록 |

---

## 4. 비기능 요구사항

| 항목 | 요구사항 | 비고 |
|------|----------|------|
| 성능 | 역링크 맵 계산 1회, 페이지당 조회 O(1). 빌드 총 시간 1.0초 이하 | AC-BL-010 |
| 안정성 | 해소 실패가 빌드를 실패시키지 않음 | AC-BL-009 |
| 접근성 | 섹션은 `<section>` + `<h2>`, 목록은 `<ul>` | 스크린리더 구조 |

---

## 5. 데이터 모델

```typescript
type NoteKind = 'decision' | 'concept' | 'glossary' | 'other';

interface NoteRef {
  key: string;        // 'wiki:tools/ios/index' | 'glossary:ai/rag'
  title: string;      // frontmatter title, 없으면 id
  href: string;       // 정식 경로, 예 '/wiki/glossary/ai/rag/'
  kind: NoteKind;
  category?: string;  // glossary만. 'ai' | 'architecture' | 'client' | 'product'
}

// src/lib/wiki-links.ts 공개 계약
function resolveWikilink(name: string, index: NoteIndex): NoteRef | undefined;
function getBacklinks(): Promise<Map<string /* target key */, NoteRef[] /* 정렬됨 */>>;
function noteKey(kind: 'wiki' | 'glossary', id: string): string;
```

---

## 6. API 인터페이스
해당 없음 (정적 빌드, 런타임 API 없음)

---

## 7. UI/UX 명세
Figma 없음. 기존 `wiki-sources` 섹션과 같은 시각 규칙(상단 구분선, 0.9rem, 제목 1rem)을 따른다.

| 화면 | 상태 | 설명 |
|------|------|------|
| 위키/용어 노트 | 역링크 있음 | 본문 → 출처(있으면) → 역링크 섹션 순서 |
| 위키/용어 노트 | 역링크 없음 | 섹션 없음 |

---

## 8. 열린 질문 및 결정 사항

| # | 질문 | 결정 내용 | 결정자 | 결정일 |
|---|------|-----------|--------|--------|
| 1 | 정렬 기준 (PRD Q1) | 종류 → 제목순을 기본값으로 채택. 사용자가 다르게 원하면 0.2 정책 수치만 바꾼다 | Claude (사용자 확인 대기) | 2026-09-14 |

---

## 9. 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| v1.0 | 2026-09-14 | 최초 작성 | Claude Code |
| v1.1 | 2026-09-14 | 린트 id 소문자화·대문자 파일명 검사를 범위에 포함 (D-002) | Claude Code |

---

## 10. 참고 자료
- [PRD](./prd.md) · [인수 조건](./acceptance.md)
- 해소 규칙 원본: `src/pages/wiki/[...slug].astro`, `scripts/lint-glossary.mjs` (섹션 1)
