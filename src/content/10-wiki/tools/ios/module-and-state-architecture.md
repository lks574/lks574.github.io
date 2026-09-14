---
title: "모듈 경계와 상태 관리 아키텍처 결정"
description: "iOS 앱을 Core · Feature · ThirdParty로 나누고 TCA를 전담 패턴으로 택하면서 내린 결정, 그리고 React Native 쪽에서 같은 질문에 다르게 답한 이유"
type: "decision"
tags: ["domain/ios", "modularization", "tca", "tuist", "react-native", "decision-log"]
updatedDate: 2026-09-14
---

## 1. 맥락과 제약 (Context)

- 인증, 대시보드, 아케이드, 이벤트, 마이 등 화면 묶음이 여럿이고 각각 다른 속도로 바뀐다.
- React Native 브라운필드 화면, 중국 SNS SDK, 카메라 스캔 같은 외부 바이너리를 앱에 들여와야 한다.
- 화면 수가 많아 팀 전체가 같은 상태 관리 패턴을 써야 리뷰와 온보딩이 가능하다.
- 같은 시기에 React Native 쪽에서도 화면 상태 관리 방식을 정해야 했다.

## 2. 선택한 구조 (Decision)

### 모듈 경계
1. **세 계층으로 나눈다.** `Core`(Architecture, Domain, Platform, DesignSystem 등), `Feature`(화면 묶음), `ThirdParty`(외부 SDK 래퍼). Tuist 매니페스트 템플릿이 모듈마다 같은 타깃 구성을 찍어낸다.
2. **Feature 간 직접 의존을 금지한다.** Feature는 Core에만 의존한다. 다른 Feature의 화면으로 가야 하면 Core에 있는 라우터 추상(LinkNavigator)에 경로를 요청한다. Feature가 Feature를 import하기 시작하면 순환 의존과 빌드 그래프 붕괴가 반드시 따라온다.
3. **외부 바이너리는 ThirdParty에 격리한다.** React Native와 Hermes, 중국 SNS, 카메라 스캔 SDK는 래퍼 모듈 뒤에 둔다. SDK 버전 교체나 제거가 본체 코드에 번지지 않고, 빌드 실패 원인도 모듈 단위로 격리된다.

### 상태 관리
4. **iOS는 TCA(The Composable Architecture)를 전담 패턴으로 쓴다.** 작은 화면에도 State, Action, Reducer를 다 쓰는 보일러플레이트와 러닝 커브 비용은 알고 감수했다. 팀 전체가 하나의 패턴을 쓰는 일관성이 그 비용보다 크다고 판단했다.
5. **React Native에서는 화면 수준 복잡도에 따라 다르게 판단한다.** 스크립트 읽기 미션처럼 세션 상태 전이가 복잡한 화면은 XState 상태 머신으로, 스피킹 플레이처럼 상태가 단순한 화면은 reducer를 걷어내고 custom hook으로 정교화했다. 도구를 먼저 정하지 않고 상태 복잡도를 먼저 본다.

## 3. 버린 대안과 이유 (Alternatives)

- **Feature가 필요한 Feature를 직접 import:** 처음에는 빠르지만 두 Feature가 서로를 알게 되는 순간 순환이 생기고, 그 뒤로는 어느 하나도 독립 빌드가 안 된다.
- **외부 SDK를 앱 타깃에 직접 링크:** SDK 하나의 빌드 문제가 전체 빌드를 막고, RN처럼 큰 바이너리는 모든 Feature의 빌드 시간을 끌어올린다.
- **iOS에서 화면마다 패턴 선택:** 개인 생산성은 오르지만 리뷰 기준이 사라지고 새 팀원이 화면마다 다른 규칙을 배워야 한다.
- **RN에서도 단일 패턴 강제:** 단순 화면에 reducer를 강제하면 코드가 늘고 읽기 어려워졌다. 팀 규모와 화면 수가 iOS와 달라 같은 답이 맞지 않았다.

## 4. 🧭 얻은 원칙 & 관련 용어 (Lesson)

- **의존 방향은 규칙이 아니라 구조로 막는다.** Feature 간 이동을 라우터 추상으로만 허용하면 순환 의존이 컴파일 단계에서 불가능해진다. → [[modularization]]
- **바깥에서 온 것은 울타리 안에 둔다.** 외부 SDK와 다른 런타임(RN)은 래퍼 모듈에 격리해야 교체와 실패가 국소화된다. → [[modularization]]
- **패턴 일관성의 가치는 팀 크기와 화면 수에 비례한다.** iOS처럼 크면 하나의 패턴을 비용을 감수하고 전담시키고, RN처럼 작고 화면 성격이 갈리면 상태 복잡도에 따라 도구를 고른다. → [[unidirectional-data-flow]]
- **"어떤 도구를 쓰나"보다 "상태 전이가 얼마나 복잡한가"가 먼저다.** 복잡하면 상태 머신이나 reducer, 단순하면 hook.

## 🔗 상위 목차
* [[tools/ios|iOS 실무 설계 기록으로 돌아가기]]
