## Direction (방향 헌장 우선 읽기)

작업을 시작하기 전에 `src/content/90-system/DIRECTION.md`를 읽습니다. 목표 3단계, 세 기둥, 원칙, 비목표, 드리프트 점검 방법이 있습니다.
구조나 방향에 영향을 주는 작업은 "목표 1·2·3 중 무엇을 위한 것인가"를 한 문장으로 말할 수 있어야 하며, 말할 수 없으면 사용자에게 먼저 묻습니다.
방향이 바뀌면 그 문서를 고치지 않고 맨 아래 결정 로그에 날짜와 함께 덧붙입니다. 사용자와의 방향 합의는 에이전트 사적 메모리가 아니라 이 문서에 남깁니다.
헌장과 에이전트 메모리, 또는 헌장과 지금 하려는 작업의 방향이 다르면 **어느 쪽도 자동으로 우선하지 않습니다.** 멈추고 두 내용을 나란히 보여준 뒤 사용자와 함께 정하고, 틀린 쪽 하나를 고친 다음에만 진행합니다.

## 공용 절차 패키지 (90-system)

이 저장소의 `src/content/90-system/`이 공용 스킬, 에이전트, AGENTS.md 공용 조각, 설치 스크립트의 **유일한 원본**입니다.
홈 폴더(`~/.claude/skills`, `~/.agents/skills`, `~/.codex/skills`, `~/.claude/agents`)에는 심볼릭 링크만 있습니다. 스킬을 고칠 때는 이 폴더의 파일을 고치고 `npm test`를 통과시킵니다.
커밋 메시지는 `commit-message` 스킬을 따릅니다. 제목 한 줄이 기본이고, 변경 내역을 bullet로 나열하는 본문과 자동 서명은 금지입니다.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Glossary Protocol (기술 용어집 관리 규칙)

용어(Glossary) 추가, 수정, 질의 요청을 받았을 때 모든 AI 에이전트는 다음 규칙을 엄격히 준수합니다.
전용 스킬 `.claude/skills/add-glossary-term/SKILL.md`가 이 절차를 실행 가능한 형태로 담고 있으니, 용어 작업은 스킬을 통해 수행합니다.

1. **파일 경로 규칙:**
   - 반드시 `src/content/10-wiki/glossary/{category}/{term-slug}.md` 단일 파일로 생성합니다. 하위 폴더 금지.
   - 지원 카테고리 (`category`, `src/content.config.ts`의 `z.enum`과 동일):
     - `ai`: AI, LLM, 에이전트 오케스트레이션, 프롬프트, 모델 추론, RAG, 임베딩 등
     - `architecture`: 소프트웨어 아키텍처, 디자인 패턴, 동시성, 분산 시스템, 백엔드/인프라 등
     - `client`: 모바일(iOS/RN), 웹 프론트엔드, 렌더링 엔진, JS 런타임, 상태 관리 등
     - `product`: 프로덕트 엔지니어링, CI/CD, 데브옵스, 측정 메트릭, 관측성(Observability) 등
   - slug 규칙: 영문 소문자 케밥 케이스 (예: `rag.md`, `context-window.md`, `jsi.md`). 폴더명과 frontmatter `category`는 반드시 일치해야 합니다.

2. **사전 중복 검사 (필수, 스크립트 사용):**
   - 파일을 생성하기 전 반드시 `npm run glossary:find -- "<용어 또는 키워드>"`를 실행합니다.
   - slug뿐 아니라 title, aliases, tags, description까지 검색합니다. `MATCH`가 나오면 새 파일을 만들지 말고 기존 파일을 보강합니다.

3. **Frontmatter 표준 규격:**
   ```yaml
   ---
   title: "용어 영문명 (한글명)"
   description: "1~2문장의 명확하고 직관적인 핵심 정의"
   category: "ai" # ai | architecture | client | product 중 택1, 폴더명과 동일
   tags: ["태그1", "태그2"]
   aliases: ["약어", "대체표기"]
   updatedDate: YYYY-MM-DD # 반드시 `date +%F` 실행 결과를 사용. 추측 금지
   sources: [] # 선택. 이 용어가 승격된 근거: 위키 노트 이름 또는 URL (예: ["tools/react-native/troubleshooting/metro-cache-reset", "https://arxiv.org/abs/2502.12110"])
   ---
   ```
   - `supersededBy: "new-slug"`를 붙이면 대시보드에서 숨겨지고 노트 상단에 대체 안내가 표시됩니다. 낡은 용어는 삭제하지 말고 이 필드로 이력을 남깁니다.

4. **본문 표준 규격 (4단 필수 + 1단 선택):**
   ```markdown
   ## 💡 핵심 정의
   - 누구나 직관적으로 10초 만에 이해할 수 있는 비유 또는 명확한 요약

   ## 🎯 왜 알아야 하는가? (실무 가치)
   - 실무 개발, 시스템 설계, 아키텍처 의사결정에서 이 개념이 왜 중요한지 설명

   ## ⚙️ 동작 원리 & 메커니즘
   - 기술적 구현 원리, 아키텍처적 흐름 또는 핵심 구성 요소

   ## 🧭 내 실무 판단 & 사례 (선택)
   - 이 개념을 실제로 어디에 적용했고, 어떤 제약에서 어떤 결정을 내렸는지. 백과사전과 이 용어집을 구분하는 암묵지 영역. 관련 트러블슈팅/결정 노트를 [[...]]로 링크

   ## 🔗 연관 개념
   - [[연관용어1]] · [[연관용어2]]
   ```

5. **링크 규칙:**
   - 용어집 → 용어집: 파일명(slug)만 사용합니다. 예: `[[rag]]`, `[[context-window]]`
   - 용어집 → 일반 위키 노트: 전체 경로를 사용합니다. 예: `[[tools/react-native/architecture|RN 신 아키텍처]]`, `[[concepts/Multi-Agent-Orchestration]]`
   - `index`, `../index`, `troubleshooting/index` 같은 옵시디언식 상대 링크는 사이트에서 404가 나므로 금지합니다. 폴더 허브는 폴더 경로로 링크합니다 (`[[tools/react-native]]`).
   - 아직 존재하지 않는 용어를 링크하지 않습니다. 필요하면 먼저 그 용어를 만듭니다.
   - 연관 개념은 **실제로 함께 이해해야 하는 개념만** 넣습니다. 고아(orphan) 경고를 없애기 위한 억지 링크는 그래프 품질을 조용히 떨어뜨리므로 금지합니다. 정말 연관된 용어가 없으면 고아로 두어도 됩니다.

6. **역링크 갱신 (허용되는 유일한 기존 파일 수정):**
   - 용어집 안의 연관 관계는 **양방향**이어야 합니다. 새 용어를 만든 뒤, 🔗 연관 개념에 적은 각 용어 파일의 `## 🔗 연관 개념` 섹션 마지막 줄에 새 용어 링크를 ` · [[new-slug]]` 형태로 덧붙입니다. 린트가 단방향 링크를 error로 잡습니다.
   - 링크 한 줄만 추가하는 경우 그 파일의 `updatedDate`는 바꾸지 않습니다. `updatedDate`는 본문 내용이 바뀐 날을 뜻합니다.
   - 그 외 기존 용어의 본문은 수정하지 않습니다. 정보 보강이 필요하면 해당 파일 전체를 읽고 섹션 단위로만 고칩니다.

7. **검증 (필수):**
   - 작업 후 반드시 `npm run lint:glossary`를 실행하고 error가 0이 될 때까지 수정합니다. `npm run build`도 이 린트를 먼저 실행합니다.
   - 린트는 스키마, 폴더/카테고리 일치, 4단 섹션, 날짜 범위, title/alias 중복, 전체 위키의 wikilink 해소 여부, 용어 간 역링크 양방향성, bare slug 충돌을 error로, 고아 용어를 warning으로 검사하고, 마지막 줄에 🧭 섹션과 sources 보유 비율을 출력합니다. 이 비율이 이 용어집의 핵심 성공 지표입니다.
   - 린트 스크립트를 고쳤다면 `npm test`(픽스처 네거티브 테스트)도 통과해야 합니다.

8. **목차 파일 편집 금지 (Zero-Maintenance Auto-Indexing):**
   - `Index-MOC.md`나 다른 MOC 파일에 개별 용어 링크를 추가하지 않습니다. `/wiki/glossary/` 페이지, `/wiki/glossary.json`, `/llms.txt`가 빌드 타임에 전체 용어를 자동으로 집계합니다.

9. **일화 → 의미 승격 (트러블슈팅 노트와의 연결):**
   - 트러블슈팅 노트(`tools/**/troubleshooting/*.md`)를 쓰거나 읽다가 관련 용어를 발견하면, 그 용어의 `## 🧭 내 실무 판단 & 사례`에 한두 줄을 추가하고 `sources`에 노트 경로를 등록합니다. 이것이 유일하게 허용되는 "기존 용어 본문 추가"이며, 새 섹션이 없으면 `## 🔗 연관 개념` 바로 위에 만듭니다.
   - 🧭 내용은 사용자의 실제 경험만 적습니다. 에이전트가 사례를 지어내지 않습니다. 경험이 무엇인지 모르면 사용자에게 묻습니다.
