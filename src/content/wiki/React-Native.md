---
title: "React Native (RN) 실무 생존 노트"
description: "iOS 네이티브 개발자의 시선에서 정리한 React Native 아키텍처와 빠른 러닝커브 전략"
tags: ["ReactNative", "iOS", "크로스플랫폼", "모바일", "TypeScript"]
updatedDate: 2026-03-11
---

## 1. 개요 (Overview)

수년간 Swift/UIKit/SwiftUI를 다뤄온 iOS 네이티브 개발자가 React Native(RN) 환경으로 확장할 때 겪은 실전 노하우와 핵심 개념 메모입니다.

---

## 2. iOS 네이티브 vs React Native 매핑

| 개념 | iOS (Swift) | React Native (TypeScript) |
| :--- | :--- | :--- |
| **화면 선언** | SwiftUI `View` / UIKit `UIView` | React JSX (`<View>`, `<Text>`) |
| **상태 관리** | `@State`, `@Binding`, TCA | `useState`, Zustand, Jotai |
| **스타일링** | AutoLayout / SwiftUI Modifiers | Flexbox 기반 `StyleSheet` |
| **네이티브 브릿지** | 직접 호출 (Swift/Obj-C) | JSI / TurboModules (신규 아키텍처) |
| **스레딩** | GCD (Main / Background) | JS 스레드 + UI 스레드 분리 |

---

## 3. iOS 개발자로서 느낀 장단점

### 장점
1. **압도적인 피드백 루프:** Fast Refresh를 통한 실시간 UI 확인은 Xcode 빌드 대기 시간을 획기적으로 줄여줌.
2. **크로스플랫폼 생산성:** 하나의 비즈니스 로직으로 iOS와 Android를 동시에 타겟팅.
3. **AI 페어 프로그래밍과의 시너지:** TypeScript 생태계는 AI 모델들의 학습 데이터가 방대하여, 보일러플레이트 작성 및 버그 픽스 속도가 매우 빠름.

### 주의할 점
- 네이티브 모듈(Objective-C/Swift)과의 브릿징 이슈는 결국 네이티브 지식이 있는 엔지니어가 해결해야 함.
- 렌더링 성능 최적화(불필요한 Re-render 방지, FlatList 가상화)에 민감해야 함.

---

## 4. 관련 링크

- [[Multi-Agent-Orchestration]]: RN 프로젝트 학습 및 구현에 AI를 활용한 방법
- 블로그 글: [2026년, '개발자로 살아남기'를 시작하며](/blog/welcome)
