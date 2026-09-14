---
title: "Unidirectional Data Flow (단방향 데이터 흐름: TCA · reducer)"
description: "상태 변경을 Action → Reducer → State → View 한 방향으로만 흐르게 해서 UI 상태의 예측 가능성과 테스트 가능성을 확보하는 아키텍처 패턴"
category: "client"
tags: ["client", "architecture", "tca", "reducer", "state-management", "swiftui"]
aliases: ["단방향 데이터 흐름", "TCA", "The Composable Architecture", "Redux 패턴", "UDF"]
updatedDate: 2026-09-14
sources: ["tools/ios/module-and-state-architecture"]
---

## 💡 핵심 정의
**"모든 변경은 접수창구(Action) 하나로 들어와 한 명의 담당자(Reducer)가 장부(State)를 고치고, 화면은 장부를 읽기만 하는 구조"**

View는 State를 렌더링하고 사용자 입력을 Action으로 보냅니다. Reducer는 `(State, Action) → State`의 순수 함수로 상태를 바꾸고, 네트워크나 타이머 같은 부수 효과는 Effect로 분리해 그 결과를 다시 Action으로 돌려보냅니다. iOS에서는 The Composable Architecture(TCA), 웹에서는 Redux와 XState가 대표적입니다.

## 🎯 왜 알아야 하는가? (실무 가치)
* **버그 재현이 쉬워진다.** 상태가 어떻게 그 값이 됐는지 Action 로그만 재생하면 됩니다.
* **테스트가 순수 함수 검증으로 줄어든다.** Reducer에 Action을 넣고 State를 비교하면 끝입니다. Effect는 의존성 주입으로 가짜로 바꿉니다.
* **화면 묶음 단위로 합성된다.** 자식 Reducer를 부모에 끼워 넣는 방식이 모듈화 경계와 자연스럽게 맞습니다.

## ⚙️ 동작 원리 & 메커니즘
1. **State:** 화면이 필요로 하는 모든 값의 단일 구조체. 파생 값은 저장하지 않고 계산합니다.
2. **Action:** 사용자 입력, Effect 결과, 자식 Feature의 Action을 모두 포함하는 열거형.
3. **Reducer:** 상태 전이 함수. 부수 효과는 실행하지 않고 Effect를 반환만 합니다.
4. **Effect와 의존성:** async 작업을 Effect로 감싸고, 그 안에서 쓰는 API 클라이언트 등은 주입해 테스트에서 교체합니다. Effect 취소는 구조화된 Task로 전파됩니다.
5. **Store:** State를 들고 Action을 Reducer에 보내는 런타임. SwiftUI View는 Store를 관찰합니다.

## 🧭 내 실무 판단 & 사례
- **iOS에서는 TCA를 전담 패턴으로 쓰고, 보일러플레이트와 러닝 커브 비용은 감수했다.** 작은 화면에도 State, Action, Reducer를 전부 쓰는 것이 과하다는 것을 알면서도, 팀 전체가 하나의 패턴을 쓰는 일관성이 리뷰와 온보딩에서 그 비용을 넘어선다고 판단했다.
- **React Native에서는 화면 수준 복잡도에 따라 다르게 판단했다.** 세션 상태 전이가 복잡한 스크립트 읽기 미션은 XState 상태 머신으로 옮기고, 상태가 단순한 스피킹 플레이 화면은 reducer를 걷어내고 custom hook으로 정교화했다. 같은 질문에 iOS와 다른 답을 낸 이유는 팀 크기와 화면 수가 다르기 때문이다.
- **판단 기준은 도구가 아니라 상태 복잡도다.** 상태 전이 표를 그려야 이해되는 화면이면 reducer나 상태 머신, 한 줄로 설명되는 화면이면 hook으로 충분하다.
- 상세: [[tools/ios/module-and-state-architecture|모듈 경계와 상태 관리 아키텍처 결정]]

## 🔗 연관 개념
- [[swift-concurrency]] · [[modularization]]
