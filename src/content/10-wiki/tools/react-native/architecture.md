---
title: "React Native 스레드 모델 & 신규 아키텍처"
description: "UI/JS/Shadow 3대 스레드 동작 원리와 JSI/Fabric/TurboModules 신규 아키텍처 정리"
type: "concept"
tags: ["domain/rn", "tech/architecture", "threads", "fabric"]
updatedDate: 2026-03-11
---

## 1. React Native 스레드 모델 (Thread Architecture)

React Native 애플리케이션은 기본적으로 **3개의 독립된 스레드**가 협력하여 구동됩니다.

```text
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   UI Thread     │ <───> │  Shadow Thread  │ <───> │    JS Thread    │
│ (Native / Main) │       │ (Yoga Layout)   │       │ (React Engine)  │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

### ① UI Thread (Native / Main Thread)
* **역할:** 플랫폼(iOS/Android) 네이티브의 메인 스레드로, 실제 네이티브 뷰(UIView/View)를 화면에 픽셀 단위로 그리고 사용자 터치/제스처 이벤트를 직접 수신합니다.
* **특징:** 이 스레드가 멈추면 앱 전체 화면이 얼어붙고(ANR/Hang), 스크롤이 끊깁니다.

### ② JavaScript Thread
* **역할:** 우리가 작성한 React 코드(JSX, Hooks), 비즈니스 로직, 상태(State) 업데이트, 네트워크 API 호출을 실행하는 가상 머신(Hermes/JSC) 스레드입니다.
* **특징:** 싱글 스레드로 동작하므로, 무거운 JSON 파싱이나 복잡한 계산이 돌면 JS 스레드가 지연되어 상태 변경 및 화면 반응이 늦어집니다.

### ③ Shadow Thread (Layout Engine)
* **역할:** C++로 작성된 **Yoga 레이아웃 엔진**이 동작하는 스레드입니다.
* **특징:** React가 계산한 가상 DOM 트리와 Flexbox 스타일을 바탕으로, 각 UI 컴포넌트의 실제 네이티브 좌표(x, y, width, height)를 계산하여 UI 스레드로 넘겨줍니다.

> 💡 **프레임 드랍(Stuttering)의 원인 이해:**  
> 네이티브 애니메이션(`useNativeDriver: true`)은 UI 스레드에서 직접 처리되어 JS 스레드가 바빠도 부드럽게 돌아가지만, 일반 상태 업데이트 애니메이션은 JS 스레드를 거치므로 JS가 바쁘면 프레임이 떨어집니다.

---

## 2. 신규 아키텍처 (New Architecture)

과거의 RN은 JS와 네이티브가 JSON 문자열로 직렬화하여 비동기로 소통하는 **Bridge 방식**이었으나, 신규 아키텍처는 이를 완전히 탈피했습니다.

```text
[ JavaScript (Hermes) ] <────── JSI (C++ 직접 참조) ──────> [ Native (iOS/Android) ]
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
   Fabric (차세대 렌더러)               TurboModules (지연 로딩 모듈)
```

### ① JSI (JavaScript Interface)
* **핵심:** C++ 기반 인터페이스로, JS가 네이티브 메모리 객체를 **직접 참조(Direct Reference)**할 수 있게 해줍니다.
* **효과:** JSON 직렬화/역직렬화 오버헤드가 사라지고, 필요 시 네이티브 함수를 **동기(Synchronous)**로 즉시 호출할 수 있습니다.

### ② Fabric (New Renderer)
* **핵심:** JSI 위에서 동작하는 새로운 렌더링 시스템입니다.
* **효과:** 레이아웃 연산과 렌더링이 더 긴밀하게 통합되어, 화면 깜빡임 없이 부드러운 UI 전환과 우선순위 기반 렌더링(React 18 Concurrent)이 가능해집니다.

### ③ TurboModules
* **핵심:** 이전에는 앱이 켜질 때 모든 네이티브 모듈을 한 번에 메모리에 올렸지만, TurboModules는 **실제 사용할 때만 로드(Lazy Loading)**합니다.
* **효과:** 앱 초기 구동 속도(App Start Time)와 메모리 점유율이 획기적으로 개선됩니다.

### ④ Codegen
* TypeScript 인터페이스나 Flow 타입을 기반으로 C++ 및 네이티브 바인딩 코드를 자동 생성하여, JS와 네이티브 간의 타입 불일치 에러를 컴파일 타임에 차단합니다.

---

## 3. 상위 목차로 돌아가기
* [[index|React Native 실무 생존 가이드로 돌아가기]]
