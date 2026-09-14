# promotion-candidates Tech Spec

> **작성일**: 2026-09-14
> **작성자**: Claude Code (사용자 검토)
> **버전**: v1.2
> **상태**: Approved

## 0. 정의 (Definitions)

### 0.1 도메인 용어
| 용어 | 정의 |
|------|------|
| 일화 노트 | `tools/` 아래 wiki 노트 중 본문에 `## …🧭…` 헤더가 있는 노트 |
| 원칙 섹션 | 일화 노트의 그 `## 🧭` 헤더부터 다음 `## `까지 |
| 용어 | glossary 항목. slug는 파일명 |
| 후보 | 승격이 끝나지 않았음을 뜻하는 관찰 하나. 유형은 0.2 참조 |

### 0.2 정책 수치
| 정책 | 값 | 결정 주체 |
|------|-----|----------|
| 후보 유형 | `missing-source`, `missing-judgement`, `new-term`, `source-without-link` | PRD 5.1 |
| 신규 용어 후보 인식 | 원칙 섹션 안에 "아직 용어집에 없음" 문구가 있는 줄에서, 문구 뒤의 모든 백틱 케밥 토큰. frontmatter 필드명(`sources` 등)과 기존 용어는 제외 | PRD 5.1-3 |
| 종료 코드 | 항상 0 | PRD 5.1-5 |
| 린트 요약 줄 형식 | `promotion: 승격 대기 N건 (npm run glossary:promote)` | AC-PR-008 |

### 0.3 불변식
| Invariant | 설명 |
|-----------|------|
| 읽기 전용 | 어떤 마크다운도 수정하지 않는다 |
| 해소 규칙 재사용 | 링크 해소와 섹션 추출은 `scripts/glossary-lib.mjs`의 기존 함수를 쓴다 |
| 후보 ≠ error | 후보는 린트 error 수에 영향을 주지 않는다 |

## 1. 개요
### 1.1 배경 및 목적
승격 루프(일화 → 용어 🧭/sources)가 사람 기억에 의존하는 상태를, 한 명령과 린트 요약 줄로 관찰 가능하게 만든다.
### 1.2 목표
PRD G1~G3.
### 1.3 비목표
자동 수정, 품질 판단.

## 2. 작업 범위
| 구분 | 항목 | 설명 |
|------|------|------|
| In Scope | `scripts/promotion-candidates.mjs` | 신규. `collectCandidates()`를 export하고 CLI로도 실행 |
| In Scope | `scripts/lint-glossary.mjs` | 마지막에 요약 줄 1개 추가 |
| In Scope | `scripts/test-lint.mjs` | 후보 유형별 픽스처 5건 |
| In Scope | `package.json` | `glossary:promote` 스크립트 |
| In Scope | `.claude/skills/add-glossary-term/SKILL.md` | 6b 단계에서 이 명령을 먼저 실행하도록 한 줄 |
| Out of Scope | 용어집·노트 콘텐츠 | 변경 없음 |

## 3. 기능 명세
### 3.1 후보 수집
**정상 흐름**
| 단계 | 행위자 | 동작 | 결과 |
|------|--------|------|------|
| 1 | 스크립트 | `loadGlossary()`로 용어를, `walk(WIKI_DIR)`로 wiki 노트를 읽는다 | 인덱스 |
| 2 | 스크립트 | id가 `tools/`로 시작하고 `section(body,'🧭')`가 null이 아닌 노트를 일화 노트로 고른다 | 일화 노트 목록 |
| 3 | 스크립트 | 원칙 섹션에서 `wikilinks()`로 이름을 뽑고 bare slug가 용어와 일치하면 대상 용어로 삼는다 | (노트, 용어) 쌍 |
| 4 | 스크립트 | 쌍마다 용어 `sources`에 노트 id가 없으면 `missing-source`, 용어 본문에 `## 🧭`가 없으면 `missing-judgement` | 후보 |
| 5 | 스크립트 | 원칙 섹션 줄 중 "아직 용어집에 없음"을 포함한 줄의 백틱 토큰을 `new-term` 후보로 모은다 | 후보 |
| 6 | 스크립트 | 용어마다 `sources`의 각 노트 본문에 `[[slug]]`가 없으면 `source-without-link` | 후보 |
| 7 | CLI | `--json`이면 JSON, 아니면 표. 후보 0이면 한 줄 | 출력, exit 0 |

**예외 흐름**
| 조건 | 처리 방식 |
|------|----------|
| 원칙 섹션 링크가 용어가 아님(wiki 노트, 없는 이름) | 무시 (AC-PR-011) |
| 코드 안 `[[...]]` | `wikilinks()`가 이미 제외 |
| `sources`에 URL | `source-without-link` 검사에서 건너뜀 |
| `sources`의 노트 파일이 없음 | 린트가 error로 잡으므로 여기서는 건너뜀 |

## 4. 비기능 요구사항
| 항목 | 요구사항 |
|------|----------|
| 성능 | 파일 1회 읽기, 수백 노트에서 1초 미만 |
| 이식성 | Node 표준 모듈만. 의존성 추가 없음 |

## 5. 데이터 모델
```typescript
type CandidateType = 'missing-source' | 'missing-judgement' | 'new-term' | 'source-without-link';
interface Candidate {
  type: CandidateType;
  note: string;          // wiki id, e.g. 'tools/react-native/troubleshooting/metro-cache-reset'
  term?: string;         // glossary slug (new-term 제외)
  slugs?: string[];      // new-term만
  action: string;        // 사람이 다음에 할 일 한 문장
}
interface Report {
  episodicNotes: string[];
  candidates: Candidate[];
  summary: { total: number; byType: Record<CandidateType, number> };
}
export function collectCandidates(): Report;
```

## 6. API 인터페이스
해당 없음

## 7. UI/UX 명세
CLI 표: 열 = 유형 | 노트 | 용어 | 다음 행동. 마지막 줄 `승격 대기 N건`.

## 8. 열린 질문 및 결정 사항
| # | 질문 | 결정 내용 | 결정자 | 결정일 |
|---|------|-----------|--------|--------|
| 1 | 방치 기간에 따른 등급 상향 (PRD Q1) | 미결. 첫 버전은 등급 없음 | - | - |

## 9. 변경 이력
| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| v1.0 | 2026-09-14 | 최초 작성 | Claude Code |
| v1.1 | 2026-09-14 | 신규 용어 후보 토큰 범위를 '후보' 문장으로 한정 | Claude Code |
| v1.2 | 2026-09-14 | 독립 리뷰 반영: 문구 뒤 전체 토큰 + 예약어 제외로 규칙 교체 (후보 단어 의존 제거) | Claude Code |

## 10. 참고 자료
- [PRD](./prd.md) · [인수 조건](./acceptance.md)
- 이전 기능 결정 기록 D-001 (해소 규칙 재사용 원칙): `docs/wiki-backlinks/decisions.md`
