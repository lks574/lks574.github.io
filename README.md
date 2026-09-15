# 개발자로 살아남기 — 세컨드 브레인 & 에이전트 절차 저장소

> iOS 개발자에서 기획부터 개발 완료까지 혼자 해내는 프로덕트 엔지니어(PE)로 전환하면서, 판단 기준을 AI 에이전트가 매번 같은 방식으로 실행하게 만드는 개인 엔지니어링 저장소입니다. 겉은 Astro 정적 사이트(GitHub Pages)이고, 안은 Obsidian 볼트와 에이전트 절차 패키지입니다.

라이브: https://lks574.github.io · 에이전트용 입구: [/llms.txt](https://lks574.github.io/llms.txt) · 용어집 JSON: [/wiki/glossary.json](https://lks574.github.io/wiki/glossary.json)

## 처음 읽을 것

| 대상 | 파일 |
|---|---|
| 사람 | 이 README → `src/content/90-system/DIRECTION.md`(방향 헌장) |
| 에이전트 | `AGENTS.md` (Claude는 `CLAUDE.md` 링크로, Antigravity는 네이티브로 읽음) → 헌장 |

## 구조

```
src/content/
├─ 00-inbox/       날것의 메모. 정리 후 아래로 이동
├─ 10-wiki/        지식층 (사이트 /wiki). 막힐 때 참조
│  ├─ _mocs/       지식 지도
│  ├─ concepts/    개념 노트
│  ├─ tools/       플랫폼별 설계 기록·트러블슈팅 (ios, react-native, agents)
│  └─ glossary/    용어집. 1용어 1파일, {ai|architecture|client|product}/{slug}.md
├─ 20-blog/        블로그 (사이트 /blog)
├─ 30-projects/    비공개 작업 메모 (사이트에 배포되지 않음)
└─ 90-system/      절차층: 방향 헌장, 공용 스킬·에이전트, 설치 스크립트
docs/{피쳐명}/     기능 단위 파이프라인 산출물 (prd, acceptance, spec_review, decisions, qa_result, review)
scripts/           린트·테스트·보고서
```

층 구조의 뜻은 헌장 5절에 있습니다. 요약하면 **절차가 중심이고 지식은 그 뒤**입니다. 매 세션 읽히는 것은 `AGENTS.md`와 스킬이고, 위키와 용어집은 링크로 찾아가는 참조층입니다.

## 용어집 (Glossary)

- 파일 하나가 용어 하나. 목차는 빌드 타임에 자동 집계됩니다. 손으로 유지하는 색인은 없습니다.
- 백과사전과의 차이는 `## 🧭 내 실무 판단 & 사례` 섹션과 `sources`(승격 근거가 된 설계 기록·트러블슈팅 노트)입니다. 경험이 없는 용어는 비워 둡니다. 지어내지 않습니다.
- 규칙은 `AGENTS.md`의 Glossary Protocol, 절차는 `add-glossary-term` 스킬.

## 파이프라인 (기획 → 커밋)

| 단계 | 스킬 / 에이전트 | 산출물 (`docs/{피쳐명}/`) |
|---|---|---|
| PRD | `write-prd` | `prd.md` |
| 인수 조건 | `acceptance-criteria` | `acceptance.md` (AC ID가 이후 모든 문서를 잇는 키) |
| 기술 명세 | `spec-reviewer` + `tech-spec-template`, `spec-checklist` | `spec_review.md` |
| 작업 분해 | `spec-to-ticket` | 티켓 |
| 구현 | 플랫폼 개발 에이전트 | 코드 |
| 결정 기록 | `record-decision` | `decisions.md` (append-only) |
| 리뷰 | `review-checklist`, 구현자와 다른 에이전트 | `review.md` |
| QA | `QA-expert` | `qa_result.md` |
| 커밋 | `commit-message` | 제목 한 줄, 서명 없음 |

스킬과 에이전트의 원본은 `src/content/90-system/`이고, `.claude/skills`·`.claude/agents`(Claude)와 `.agents/skills`(Antigravity)는 그곳을 가리키는 심볼릭 링크입니다. 지금은 이 저장소에서만 적용합니다.

## 명령

```bash
npm install
astro dev --background          # 개발 서버 (astro dev status / logs / stop)
npm run lint:glossary           # 용어집 규칙 검사 + 🧭 보유 비율 + 승격 대기 건수
npm run glossary:find -- "용어"  # 용어 생성 전 중복 검색
npm run glossary:promote        # 일화 노트의 원칙 중 용어집에 미반영된 것 보고
npm test                        # 린트 픽스처 네거티브 테스트 + 스킬 패키지 린트
npm run build                   # lint → astro build → dist 내부 링크 404 검사
```

CI(`.github/workflows/deploy.yml`)는 `npm test`를 먼저 돌리고, 통과하면 빌드해 GitHub Pages에 배포합니다. 린트 error나 깨진 내부 링크가 있으면 배포되지 않습니다.

## 블로그 글 쓰기

`src/content/20-blog/`에 `.md` 파일을 만듭니다. `category`는 `src/consts.ts`의 `CATEGORIES` 키 중 하나여야 하며(스키마가 enum으로 강제), 아니면 빌드가 실패합니다.

```markdown
---
title: "제목"
description: "요약"
pubDate: 2026-09-15
category: "engineering"   # career | ai | market | tips | engineering
tags: ["태그"]
---
```

## 기술 스택

Astro 7, Content Collections(Zod), `remark-wiki-link`(Obsidian `[[링크]]`), GitHub Actions → GitHub Pages. 외부 서비스나 데이터베이스는 없습니다.
