# 90-system: 공용 절차 패키지 (Engineering OS)

사용자의 판단 기준을 **모든 저장소에서 같은 방식으로 실행되게** 만드는 절차층이다. 위키(`10-wiki`)가 "왜"를 쌓는 지식층이라면, 이 폴더는 "매번 어떻게"를 담는다. 방향 헌장(`DIRECTION.md`)의 목표 1(지속 가능·일관성)과 목표 2(회사 전반 적용)를 위한 것이다.

## 구성

| 경로 | 내용 |
|---|---|
| `DIRECTION.md` | 방향 헌장. 목표, 원칙, 비목표, 드리프트 점검, 결정 로그 |
| `skills/*/SKILL.md` | 공용 스킬 (Agent Skills 규격). 홈의 세 스킬 폴더에 심볼릭 링크로 설치 |
| `agents/*.md` | 공용 Claude Code 서브에이전트. `~/.claude/agents`에 심볼릭 링크로 설치 |
| `agents-md/COMMON.md` | 각 저장소 `AGENTS.md`에 포함시키는 공용 조각 |
| `templates/` | 위키·블로그 노트 템플릿 |
| `install.sh` | 이 머신에 스킬·에이전트를 링크. 기존 항목은 `<폴더>-backup-<날짜>/`로 옮긴 뒤 교체 |
| `link-repo.sh <repo>` | 대상 저장소에 공용 조각을 넣고 `CLAUDE.md -> AGENTS.md` 링크를 만든다 |

## 스킬 목록

| 스킬 | 단계 | 산출물 |
|---|---|---|
| `write-prd` | 기획 | `docs/{피쳐명}/prd.md` |
| `acceptance-criteria` | 완료 기준 | `docs/{피쳐명}/acceptance.md` |
| `tech-spec-template`, `spec-checklist` | 기술 명세 (spec-reviewer가 사용) | `docs/{피쳐명}/spec_review.md` |
| `spec-to-ticket` | 작업 분해 | Jira 티켓 |
| `record-decision` | 설계 결정 | `docs/{피쳐명}/decisions.md` |
| `review-checklist` | 리뷰 | `review.md` 또는 PR 코멘트 |
| `commit-message` | 커밋 | 제목 한 줄 |

회사 내부 식별자가 많은 스킬(`create-task`, `fix-qa-issue-report`, `create-langset`, `generate-project-*`, `ui-design-code`)과 iOS 전용 에이전트(`ios-senior-developer`, `internal-qa-engineer`, `meta-doc-updater`)는 아직 홈 폴더에만 있다. 공개 저장소에 올리기 전에 내부 참조를 원칙 수준으로 정리해야 한다.

## 설치

```bash
cd <이 저장소>
bash src/content/90-system/install.sh          # 홈에 스킬·에이전트 링크
bash src/content/90-system/link-repo.sh ~/workspace/flitto/flitto_ios_v2   # 저장소 하나 연결
npm test                                        # 스킬 규격 린트 포함
```

## 규칙
- 원본은 이 폴더 하나다. 홈 폴더와 저장소에는 링크나 포함 문구만 둔다.
- 스킬을 고치면 `npm test`(`scripts/lint-skills.mjs`)가 frontmatter, 이름 규칙, 파일명 정본(`spec_review.md`)을 검사한다.
- 방향이 바뀌면 `DIRECTION.md` 결정 로그에 덧붙인다.
