## 공용 절차 (Engineering OS)

이 저장소는 개인 공용 절차 패키지를 따른다. 원본: `https://github.com/lks574/lks574.github.io` 의 `src/content/90-system/`.
방향과 원칙은 같은 저장소의 `src/content/90-system/DIRECTION.md`(방향 헌장)에 있다. 이 절과 헌장이 다르면 멈추고 사용자와 정한 뒤 하나를 고친다.

### 파일 규칙
- `AGENTS.md`가 정본이고 `CLAUDE.md`는 심볼릭 링크다. 두 파일을 따로 편집하지 않는다.
- 공용 스킬은 원본 폴더를 가리키는 심볼릭 링크로만 쓴다(저장소의 `.claude/skills/` 또는, 전역 적용이 결정된 뒤에는 홈 스킬 폴더). 저장소별 사본을 만들지 않는다.
- 스킬 이름은 소문자 케밥 케이스, 폴더명과 frontmatter `name`이 같다.

### 기획 → 개발 완료 파이프라인
| 단계 | 스킬 / 에이전트 | 산출물 (docs/{피쳐명}/) |
|---|---|---|
| 1. 문제와 범위 | `write-prd` | `prd.md` |
| 2. 완료 기준 | `acceptance-criteria` | `acceptance.md` (AC-ID) |
| 3. 기술 명세 | `spec-reviewer` (+ `spec-checklist`, `tech-spec-template`) | `spec_review.md` |
| 4. 작업 분해 | `spec-to-ticket`, `create-task` | 티켓, `{티켓}_task.md` |
| 5. 구현 | 플랫폼 개발 에이전트 | 코드, 테스트 |
| 6. 결정 기록 | `record-decision` | `decisions.md` (append-only) |
| 7. 리뷰 | `review-checklist`, `code-reviewer` | `review.md` 또는 PR 코멘트 |
| 8. QA | QA 에이전트, `fix-qa-issue-report` | `qa_result.md`, `qa/` |
| 9. 커밋 | `commit-message` | 제목 한 줄, Conventional Commits |

- 파일명은 위 표가 정본이다. `spec_review.md`처럼 밑줄 표기를 쓰고, 하이픈 표기는 쓰지 않는다.
- Tech Spec 본문에 구현 결과를 사후 동기화(sync)하지 않는다. 결정 과정은 `decisions.md`, 구현 결과는 PR과 태스크 파일에 남긴다.
- 인수 조건 ID는 PRD, Spec, QA 결과를 잇는 단일 키다.

### 커밋
- 제목 한 줄이 기본. 본문은 diff로 알 수 없는 이유가 있을 때만 1~3줄.
- `Co-Authored-By: Claude ...`, `🤖 Generated with ...` 같은 자동 서명은 어떤 형태로도 넣지 않는다.
- 커밋과 푸시는 사용자가 요청할 때만 한다.

### 판단이 갈릴 때
- 구조나 방향에 영향을 주는 작업은 "헌장 목표 1·2·3 중 무엇을 위한 것인가"를 한 문장으로 말할 수 있어야 한다. 못 하면 묻는다.
- 날짜와 사실은 추측하지 않는다. `date +%F`, `git log`, 실제 파일로 확인한다.
- 조용한 실패(경고만 내고 진행, 빈 catch, 후행 항목 드롭)를 만들지 않는다.
