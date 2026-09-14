# 인수 조건: promotion-candidates

| 항목 | 값 |
|---|---|
| 기준 문서 | [PRD](./prd.md) · [Tech Spec](./spec_review.md) |
| 최종 수정 | 2026-09-14 |

## 요약
| ID | 기능 (PRD 5.1) | 유형 | 상태 |
|---|---|---|---|
| AC-PR-001 | 🧭 섹션이 있는 tools/ 노트만 일화 노트로 인식 | 정상 | 확정 |
| AC-PR-002 | 링크한 용어의 sources에 노트가 없으면 `sources 누락` 후보 | 정상 | 확정 |
| AC-PR-003 | 링크한 용어에 🧭 섹션이 없으면 `🧭 누락` 후보 | 정상 | 확정 |
| AC-PR-004 | "아직 용어집에 없음" + 백틱 slug → `신규 용어` 후보 | 정상 | 확정 |
| AC-PR-005 | sources에 적힌 노트가 용어를 링크하지 않으면 `역참조 없음` 후보 | 예외 | 확정 |
| AC-PR-006 | 사람용 표 출력, 종료 코드 0 | 정상 | 확정 |
| AC-PR-007 | `--json`이 유효한 JSON, 종료 코드 0 | 정상 | 확정 |
| AC-PR-008 | 린트 마지막 줄에 후보 총수, error 아님 | 정상 | 확정 |
| AC-PR-009 | 픽스처 테스트가 4개 후보 유형을 각각 잡음 | 비기능 | 확정 |
| AC-PR-010 | 후보 0건일 때 "승격 대기 0건" 한 줄만 출력 | 예외 | 확정 |
| AC-PR-011 | 🧭 섹션 안의 코드 안 `[[...]]`와 해소 불가 링크는 후보 계산에서 무시 | 예외 | 확정 |

## AC-PR-001 일화 노트 인식
- **Given** `tools/ios/index.md`(🧭 없음)와 `tools/ios/background-video-upload-design.md`(🧭 있음)가 있다
- **When** 보고서를 실행한다
- **Then** 검사 대상 노트 수에 후자는 포함되고 전자는 포함되지 않는다
- 검증 방법: `--json`의 `episodicNotes` 배열
- 관련: PRD 5.1-1

## AC-PR-002 sources 누락
- **Given** 일화 노트 N의 🧭 섹션이 `[[t]]`를 링크하고, 용어 t의 `sources`에 N의 id가 없다
- **When** 보고서를 실행한다
- **Then** `{ type: 'missing-source', note: N, term: t }` 후보가 있다
- 검증 방법: 픽스처 테스트
- 관련: PRD 5.1-2

## AC-PR-003 🧭 누락
- **Given** 일화 노트 N이 용어 t를 링크하고, t에 `## 🧭` 헤더가 없다
- **When** 보고서를 실행한다
- **Then** `{ type: 'missing-judgement', note: N, term: t }` 후보가 있다
- 검증 방법: 픽스처 테스트
- 관련: PRD 5.1-2

## AC-PR-004 신규 용어 후보
- **Given** `metro-cache-reset` 노트의 🧭 섹션에 "아직 용어집에 없음. 후보는 `hermes-bytecode-cache`, `fast-refresh`"가 있다
- **When** 보고서를 실행한다
- **Then** `{ type: 'new-term', note: 'tools/react-native/troubleshooting/metro-cache-reset', slugs: ['hermes-bytecode-cache','fast-refresh'] }` 후보가 있다
- 검증 방법: 실제 저장소 실행 결과
- 관련: PRD 5.1-3

## AC-PR-005 역참조 없음
- **Given** 용어 t의 `sources`에 노트 N이 있는데 N의 본문 어디에도 `[[t]]`가 없다
- **When** 보고서를 실행한다
- **Then** `{ type: 'source-without-link', term: t, note: N }` 후보가 있다
- 검증 방법: 픽스처 테스트
- 관련: PRD 5.1-4

## AC-PR-006 사람용 출력
- **Given** 후보가 1개 이상이다
- **When** `node scripts/promotion-candidates.mjs`를 실행한다
- **Then** 유형·노트·용어·다음 행동 열이 있는 표가 출력되고 종료 코드는 0이다
- 검증 방법: 실행 + `echo $?`
- 관련: PRD 5.1-5

## AC-PR-007 JSON 출력
- **Given** 어떤 상태든
- **When** `--json`으로 실행한다
- **Then** stdout 전체가 `JSON.parse` 가능하고 `candidates`, `episodicNotes`, `summary` 키가 있으며 종료 코드 0이다
- 검증 방법: `node -e "JSON.parse(require('fs').readFileSync(0,'utf8'))"`
- 관련: PRD 5.1-5, G3

## AC-PR-008 린트 요약 줄
- **Given** 후보가 N개다
- **When** `npm run lint:glossary`를 실행한다
- **Then** 마지막 줄에 `promotion: 승격 대기 N건 (npm run glossary:promote)`가 있고 error 수는 변하지 않는다
- 검증 방법: 린트 출력
- 관련: PRD 5.1-6, G2

## AC-PR-009 픽스처 테스트
- **Given** `scripts/test-lint.mjs`
- **When** `npm test`
- **Then** missing-source, missing-judgement, new-term, source-without-link 각각을 잡는 케이스가 통과한다
- 검증 방법: 테스트 출력
- 관련: PRD 5.1-7

## AC-PR-010 후보 0건
- **Given** 모든 원칙이 반영된 픽스처
- **When** 보고서를 실행한다
- **Then** 표 없이 "승격 대기 0건" 한 줄만 출력된다
- 검증 방법: 픽스처 테스트
- 관련: PRD 7 리스크 2

## AC-PR-011 무시 규칙
- **Given** 🧭 섹션에 인라인 코드 `` `[[예시]]` ``와 해소되지 않는 `[[없는용어]]`가 있다
- **When** 보고서를 실행한다
- **Then** 둘 다 후보를 만들지 않는다 (해소 실패는 린트의 error 책임)
- 검증 방법: 픽스처 테스트
- 관련: 린트 규칙과 동일

## 예외 흐름 체크
| 상황 | AC ID 또는 "해당 없음(이유)" |
|---|---|
| 네트워크 실패 / 타임아웃 | 해당 없음 (로컬 파일만 읽음) |
| 권한 없음 / 로그아웃 상태 | 해당 없음 |
| 중복 요청 (연타, 재시도) | 해당 없음 (읽기 전용, 멱등) |
| 중단 후 재진입 (앱 종료, 백그라운드) | 해당 없음 |
| 빈 데이터 / 최대치 | AC-PR-010 (0건) |
| 다국어 / 긴 문자열 | 해당 없음 (slug와 id만 비교) |
