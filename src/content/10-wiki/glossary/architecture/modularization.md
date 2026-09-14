---
title: "Modularization (모듈화: Core · Feature · ThirdParty 계층)"
description: "앱을 빌드 단위로 쪼개고 의존 방향을 한쪽으로 고정해 빌드 시간, 소유권, 변경 영향 범위를 통제하는 구조화 기법"
category: "architecture"
tags: ["architecture", "modularization", "tuist", "ios", "dependency-direction"]
aliases: ["모듈화", "Feature Module", "Tuist 모듈"]
updatedDate: 2026-09-14
sources: ["tools/ios/module-and-state-architecture"]
---

## 💡 핵심 정의
**"한 방향으로만 흐르는 배관처럼, 아래 층(Core)은 위 층(Feature)을 모르고 위 층만 아래를 아는 빌드 단위 구조"**

모놀리식 타깃 하나를 도메인, 플랫폼, 디자인 시스템 같은 **Core 모듈**과 화면 묶음 단위의 **Feature 모듈**, 외부 SDK를 감싼 **ThirdParty 모듈**로 나누고, 의존 방향을 Feature → Core, Core → ThirdParty(선택)로 고정합니다. Tuist 같은 프로젝트 생성 도구가 이 규칙을 매니페스트 코드로 강제합니다.

## 🎯 왜 알아야 하는가? (실무 가치)
* **빌드 시간.** 바뀐 모듈과 그 상위만 다시 컴파일됩니다. Feature 하나만 실행하는 프리뷰 앱을 두면 전체 앱을 띄우지 않고 화면을 개발할 수 있습니다.
* **변경 영향 범위가 눈에 보인다.** Core를 고치면 어느 Feature가 영향을 받는지 의존 그래프가 말해 줍니다.
* **팀 소유권과 AI 에이전트 작업 단위가 일치한다.** 모듈 경계는 에이전트에게 "이 폴더 밖은 건드리지 마라"는 자연스러운 울타리가 됩니다.

## ⚙️ 동작 원리 & 메커니즘
1. **계층 정의:** `Core/{Architecture, Domain, Platform, DesignSystem, ...}`, `Feature/{Arcade, Authentication, Dashboard, ...}`, `ThirdParty/{외부 SDK 래퍼}`.
2. **의존 방향 규칙:** Feature는 Core에만 의존하고 다른 Feature를 직접 참조하지 않습니다. Feature 간 이동은 라우터(예: LinkNavigator) 같은 Core의 추상을 통해서만 합니다.
3. **매니페스트 템플릿:** Tuist `Project+Templates`가 모듈마다 같은 규칙(타깃 구성, 프리뷰 앱, 테스트 타깃, 백그라운드 모드 같은 설정)을 함수로 찍어내 매니페스트 드리프트를 막습니다.
4. **인터페이스 분리(선택):** 구현 모듈과 인터페이스 모듈을 나누면 Feature가 구현 대신 프로토콜에만 의존해 빌드 그래프가 더 얕아집니다.

## 🧭 내 실무 판단 & 사례
- **Feature 간 직접 의존을 금지하고 라우터로만 이동한다.** Feature는 Core에만 의존하고, 다른 Feature 화면으로 갈 때는 Core의 라우터 추상(LinkNavigator)에 경로를 요청한다. Feature가 Feature를 import하는 순간 순환 의존이 생기고 어느 모듈도 독립 빌드가 안 된다. 규칙으로 말리는 대신 구조로 불가능하게 만들었다.
- **React Native와 외부 SDK는 ThirdParty에 격리한다.** RN과 Hermes 바이너리, 중국 SNS SDK, 카메라 스캔 SDK를 래퍼 모듈 뒤에 두었다. SDK 교체나 제거가 본체에 번지지 않고, 빌드 실패도 모듈 단위로 갇힌다. 특히 RN처럼 큰 바이너리를 앱 타깃에 직접 링크하면 모든 Feature의 빌드 시간을 끌어올린다.
- 상세: [[tools/ios/module-and-state-architecture|모듈 경계와 상태 관리 아키텍처 결정]]

## 🔗 연관 개념
- [[unidirectional-data-flow]]
