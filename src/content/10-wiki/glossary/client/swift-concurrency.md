---
title: "Swift Concurrency (스위프트 동시성: actor · Sendable · isolation)"
description: "async/await, 구조화된 Task, actor 격리, Sendable 검사로 데이터 레이스를 컴파일 타임에 잡는 Swift의 동시성 모델"
category: "client"
tags: ["swift", "ios", "concurrency", "actor", "sendable", "async-await"]
aliases: ["Swift 동시성", "actor isolation", "Sendable", "Structured Concurrency"]
updatedDate: 2026-09-14
sources: ["tools/ios/background-video-upload-design"]
---

## 💡 핵심 정의
**"공유 상태마다 문지기(actor)를 세우고, 문지방을 넘는 데이터(Sendable)만 통과시키는 규칙을 컴파일러가 강제하는 동시성 모델"**

`async/await`가 비동기 코드를 순차적으로 읽히게 하고, `Task`와 `TaskGroup`이 수명을 구조화하며, `actor`가 가변 상태를 한 번에 한 실행 컨텍스트만 건드리게 격리하고, `Sendable`이 격리 경계를 넘는 값의 안전성을 타입으로 검사합니다. Swift 6의 strict concurrency는 이 규칙 위반을 경고가 아니라 오류로 올립니다.

## 🎯 왜 알아야 하는가? (실무 가치)
* **데이터 레이스를 런타임 크래시가 아니라 컴파일 오류로 만난다.** 재현이 안 되는 간헐적 크래시의 상당수가 여기서 사라집니다.
* **콜백 지옥과 DispatchQueue 수동 관리를 걷어낸다.** 어느 큐에서 실행되는지 대신 어느 actor에 격리되는지로 사고 방식이 바뀝니다.
* **React Native 브릿지, 백그라운드 URLSession 콜백처럼 스레드를 통제할 수 없는 경계**에서 상태를 지키는 표준 도구입니다.

## ⚙️ 동작 원리 & 메커니즘
1. **actor 격리:** actor의 가변 상태는 actor 내부에서만 동기적으로 접근할 수 있고, 밖에서는 `await`로 진입합니다. `@MainActor`는 UI 상태를 위한 전역 actor입니다.
2. **Sendable 검사:** 격리 경계를 넘는 값은 `Sendable`이어야 합니다. 값 타입과 불변 클래스는 자동으로, 내부 락으로 보호하는 클래스는 `@unchecked Sendable`로 개발자가 책임집니다.
3. **구조화된 Task:** 자식 Task는 부모보다 오래 살 수 없고, 취소는 트리를 따라 전파됩니다. `Task.detached`는 이 구조를 벗어나므로 최소화합니다.
4. **재진입(reentrancy):** actor 메서드가 `await`하는 동안 다른 호출이 들어올 수 있습니다. `await` 전후로 상태 가정이 깨질 수 있어, 불변식은 `await` 없는 구간 안에서 완결해야 합니다.

## 🧭 내 실무 판단 & 사례
- **actor는 "공유 가변 상태의 소유자"에게만 준다.** 업로드 상태 머신, 세션 영속 저장소, 사용자 설정, 다국어 리소스처럼 여러 진입점이 동시에 건드리는 것만 actor로 만들었다. 모든 클래스를 actor로 바꾸면 `await`가 코드 전체로 번지고 재진입 버그가 늘어난다.
- **`@unchecked Sendable`은 내부에 락이 있는 분배기·캐시에만 허용하고, 그 이유를 주석으로 남긴다.** 경고를 지우기 위한 `@unchecked`는 데이터 레이스를 컴파일러 눈에서만 숨긴다.
- **`AsyncStream`은 단일 소비자라는 것을 실전에서 배웠다.** RN 브릿지와 네이티브 화면이 스트림 하나를 나눠 쓰다가 진행률이 한쪽에서 멈췄다. 멀티캐스트가 필요하면 구독자마다 스트림을 발급하는 분배기를 처음부터 둔다.
- **백그라운드 깨어남 콜백처럼 "정확히 한 번" 호출돼야 하는 경계에는 가드 객체를 둔다.** actor 격리만으로는 호출 횟수 계약이 보장되지 않는다.
- 상세: [[tools/ios/background-video-upload-design|대용량 영상 백그라운드 업로드 설계 결정]]

## 🔗 연관 개념
- [[concurrency-vs-parallelism]] · [[unidirectional-data-flow]]
