---
name: tech-spec-template
description: >
  구조화된 Tech Spec 문서를 작성할 때 사용하는 표준 10-section 템플릿입니다.
  spec-reviewer 에이전트가 Step 4에서 참조하며,
  구현·테스트 에이전트도 산출된 문서를 맥락으로 활용할 수 있습니다.
user-invocable: false
---

## 사용 방법

1. 아래 템플릿을 복사하여 `docs/[feature-name]/spec_review.md` 파일로 저장합니다.
2. `[대괄호]` 항목을 실제 내용으로 채웁니다.
3. 해당 없는 섹션은 `해당 없음` 으로 표기하거나 삭제합니다.
4. 작성 완료 후 `spec-checklist`의 자기 검증 체크리스트를 반드시 수행합니다.

> SKILL.md는 500줄 이하로 유지합니다.
> 상세 참조 자료는 [reference.md](reference.md)를 참조하세요.

---

## 본문 작성 원칙

본 템플릿으로 만드는 모든 spec 본문은 아래 5가지 원칙을 따릅니다. 위반 시 spec-reviewer agent 의 self-check 단계에서 직접 수정해야 합니다.

### 1. 단정형 (Declarative)

본문은 **현재 시점에 결정된 정책**만 단정형으로 기술합니다.

- ❌ "v2.4 에서 ~~ 로 정정되었다. 이전 v1.1 의 ~~ 표현은 폐기되었다."
- ❌ "여전히 ~~ 정책은 유지된다."
- ✅ "~~ 한다."

### 2. 버전 어노테이션 본문 금지

본문 어디에도 `(vX.X 신설)` `(vX.X 정정)` `(vX.X 확정)` `(vX.X 해소)` 같은 마킹을 두지 않습니다. 모든 변경 이력은 **Section 9 Changelog 한 줄**로만 기록합니다. "주의 사항" 같은 회고 누적용 별도 섹션도 만들지 않습니다.

### 3. 정의는 Section 0 단일 소스

도메인 용어, 정책 수치, invariant 는 **Section 0 정의** 에만 적습니다. 본문(Section 1~7) 에서 동일 용어를 재정의하지 않고 정의 섹션을 참조만 합니다.

### 4. 코드 구현 위임

spec 은 **타입 시그니처와 데이터 계약(input/output) 까지만** 책임집니다. 실제 코드 작성은 `ios-senior-developer` 같은 구현 담당 에이전트의 영역입니다.

- ✅ 허용: `struct NoteRoom { let id: String; var title: String; ... }` 시그니처
- ✅ 허용: API 요청/응답 JSON 예시 (데이터 계약)
- ❌ 금지: `var body: some View { ... }` 본체
- ❌ 금지: Reducer `case .action: ...` 처리 본체
- ❌ 금지: 알고리즘 / 유틸리티 함수 구현

구현 패턴이 필요하면 **참조할 기존 코드의 위치만** 명시합니다:

> 참조 패턴: `Modules/Feature/QuickChat/.../SingleChatBubble.swift` 의 `isDrafting` 분기 패턴.
> 위 위치를 읽고 동일 패턴으로 NoteTaking 모듈 내부에 자체 구현. 직접 import 는 금지.

실제 구현 코드는 spec 이 아닌 **태스크 파일·PR description** 에 작성합니다.

### 5. 결정 과정 ≠ spec 본문

trade-off 비교, 대안 검토, "다음 중 어떤 안을 채택할지" 같은 **결정 과정의 산물**은 본문에 두지 않습니다.

- 본문에는 **결정 결과만** 단정형으로 기록
- 결정 사유가 필요하면 **1~2줄 요약**까지 허용
- 비교표·대안 분석이 필요하면 별도 ADR (`docs/{feature}/decisions.md`) 로 분리

### 본문 크기 상한

spec 본문이 **1000 라인을 초과할 우려**가 있으면 다음과 같이 분리합니다:

| 분리 대상 | 분리 후 위치 |
|----------|--------------|
| API 인터페이스 상세 (Swagger schema 매핑) | `spec_api_mapping.md` |
| Figma 프레임 매핑 / 픽셀 채록 | `spec_figma_mapping.md` |
| ADR / 결정 사유 / 비교 검토 | `decisions.md` |
| 자기 검증 결과 (timestamp 누적) | `self_check_log.md` |
| 구현 패턴 코드 예시 | 태스크 파일 또는 PR description |

---

## 템플릿

```markdown
# [프로젝트/기능명] Tech Spec

> **작성일**: YYYY-MM-DD
> **작성자**: [이름 또는 에이전트명]
> **버전**: v1.0
> **상태**: Draft | In Review | Approved

---

## 0. 정의 (Definitions)

> 본 spec 에서 사용하는 모든 도메인 용어 / 정책 수치 / invariant 는 이 섹션에서 단정형으로 정의합니다. 이후 본문은 정의를 재기술하지 않고 참조만 합니다.

### 0.1 도메인 용어

| 용어 | 정의 |
|------|------|
| [용어 A] | [한 줄 정의] |
| [용어 B] | [한 줄 정의] |

### 0.2 정책 수치

> 사용자 정책·서버 한도·UX 룰 등 본문에서 반복 참조되는 수치를 한곳에 모읍니다.

| 정책 | 값 | 결정 주체 |
|------|-----|----------|
| [정책 A] | [수치 / 조건] | [서버 / 클라 / PRD] |
| [정책 B] | [수치 / 조건] | [서버 / 클라 / PRD] |

### 0.3 불변식 (Invariant)

> 코드 / 아키텍처 / 데이터 흐름에서 절대 어겨선 안 되는 규칙. 구현 담당자가 PR 시 self-check 로 검증합니다.

| Invariant | 설명 |
|-----------|------|
| [예: Feature 간 직접 import 금지] | [예: NoteTaking 은 QuickChat 을 import 하지 않는다. 공통 로직은 Core 레이어로 한정] |

---

## 1. 개요 (Overview)

### 1.1 배경 및 목적
이 기능을 왜 만드는지, 어떤 문제를 해결하는지 서술합니다.

### 1.2 목표 (Goals)
- Goal 1
- Goal 2

### 1.3 비목표 (Non-Goals)
이번 범위에 포함되지 않는 것을 명확히 합니다.
명시적으로 제외함으로써 범위 확장(scope creep)을 방지합니다.
- Non-goal 1

---

## 2. 작업 범위 (Scope)

| 구분 | 항목 | 설명 |
|------|------|------|
| In Scope | 기능 A | 이번 작업에 포함 |
| In Scope | 기능 B | 이번 작업에 포함 |
| Out of Scope | 기능 C | 추후 별도 스펙으로 관리 |

---

## 3. 기능 명세 (Functional Specification)

### 3.1 [기능명]

**개요**
기능에 대한 한 줄 설명

**전제 조건 (Pre-conditions)**
- 사용자가 로그인된 상태여야 한다

**정상 흐름 (Happy Path)**

| 단계 | 행위자 | 동작 | 결과 |
|------|--------|------|------|
| 1 | 사용자 | [동작] | [결과] |
| 2 | 시스템 | [동작] | [결과] |
| 3 | 시스템 | [동작] | [결과] |

**예외 흐름 (Error / Edge Cases)**

| 조건 | 처리 방식 |
|------|----------|
| 입력값이 비어있는 경우 | "필수 항목입니다" 인라인 에러 표시 |
| 네트워크 오류 발생 시 | 재시도 유도 토스트 메시지 노출 |
| 권한 없는 사용자 접근 시 | 403 응답 및 홈으로 리다이렉트 |
| 중복 데이터 제출 시 | 409 응답 및 안내 메시지 노출 |

**입력값 (Inputs)**

| 필드명 | 타입 | 필수 여부 | 유효성 규칙 | 예시 |
|--------|------|-----------|-------------|------|
| email | string | 필수 | RFC 5322 이메일 형식 | user@example.com |
| name | string | 필수 | 1~50자, 특수문자 불가 | 홍길동 |

**출력값 (Outputs)**
\`\`\`json
{
  "status": "success",
  "data": {
    "id": "uuid-v4",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
\`\`\`

> 기능이 여러 개일 경우 ### 3.2, ### 3.3 으로 이어서 작성합니다.

---

## 4. 비기능 요구사항 (Non-Functional Requirements)

| 항목 | 요구사항 | 비고 |
|------|----------|------|
| 성능 | API 응답 시간 200ms 이내 (p95) | 부하 테스트 기준 포함 |
| 보안 | 민감 데이터(PII) 암호화 저장 | AES-256 이상 |
| 가용성 | 월간 99.9% 업타임 | |
| 접근성 | WCAG 2.1 AA 수준 준수 | |
| 로깅 | 주요 액션 이벤트 로그 수집 | 에러 레벨 이상 알림 |

---

## 5. 데이터 모델 (Data Model)

> **타입 시그니처와 필드 의미까지만** 작성합니다. 매핑 함수 본체, decode/encode 알고리즘, validation 구현 등은 spec 의 책임이 아닙니다 — 구현 담당이 결정합니다.

\`\`\`typescript
interface ExampleEntity {
  id: string;           // UUID v4
  name: string;         // 1~50자
  email: string;        // 이메일 형식
  status: 'active' | 'inactive' | 'deleted';
  createdAt: Date;      // ISO 8601
  updatedAt: Date;      // ISO 8601
}
\`\`\`

---

## 6. API 인터페이스 (API Interface)

### POST /api/v1/[resource]

**Request Headers**
\`\`\`
Authorization: Bearer {token}
Content-Type: application/json
\`\`\`

**Request Body**
\`\`\`json
{
  "name": "홍길동",
  "email": "user@example.com"
}
\`\`\`

**Response 201 Created**
\`\`\`json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "홍길동",
  "createdAt": "2024-01-01T00:00:00Z"
}
\`\`\`

**Error Responses**

| HTTP 코드 | 에러 코드 | 의미 | 대응 방법 |
|-----------|-----------|------|----------|
| 400 | INVALID_INPUT | 입력값 유효성 오류 | 에러 필드 명시 |
| 401 | UNAUTHORIZED | 인증 실패 | 로그인 페이지로 이동 |
| 403 | FORBIDDEN | 권한 없음 | 접근 불가 안내 |
| 409 | DUPLICATE | 중복 데이터 | 중복 항목 안내 |
| 500 | SERVER_ERROR | 서버 내부 오류 | 재시도 안내 |

---

## 7. UI/UX 명세 (UI Specification)

Figma 링크: [링크]

| 화면 | 상태 | 설명 | Figma 프레임 |
|------|------|------|-------------|
| 목록 화면 | 정상 | 데이터 목록 표시 | [프레임명] |
| 목록 화면 | 빈 상태 | "데이터가 없습니다" + CTA | [프레임명] |
| 목록 화면 | 로딩 | 스켈레톤 UI 표시 | [프레임명] |
| 등록 화면 | 에러 | 인라인 에러 메시지 표시 | [프레임명] |
| 등록 화면 | 성공 | 완료 토스트 + 목록으로 이동 | [프레임명] |

---

## 8. 열린 질문 및 결정 사항 (Open Questions & Decisions)

> 미결 항목은 개발 착수 전 반드시 해소되어야 합니다.
>
> **수명 관리**: 미결이 해소되면 본문에서 즉시 제거하고, 결정 사항을 해당 절(예: 3.x, 5.x, 0.2 정책)에 단정형으로 반영합니다. 해소된 항목을 ✅ 표시로 본문에 누적 보존하지 마세요. 결정 history 가 필요하면 별도 `decisions.md` 로 분리합니다.

| # | 질문 | 결정 내용 | 결정자 | 결정일 |
|---|------|-----------|--------|--------|
| 1 | [미결 질문] | 미결 | - | - |

---

## 9. 변경 이력 (Changelog)

> **포맷 강제**: 각 행은 **80자 이내 1줄 요약**. 산문 단락 금지. 상세 사유는 PR description / 태스크 파일 / `decisions.md` 에 기록합니다. 본문에 변경 사유 회고를 적지 않습니다.

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| v1.0 | YYYY-MM-DD | 최초 작성 | [작성자] |

---

## 10. 참고 자료 (References)

- 원본 명세 문서: [링크]
- Figma 디자인: [링크]
- 연관 Tech Spec: [링크]
```
