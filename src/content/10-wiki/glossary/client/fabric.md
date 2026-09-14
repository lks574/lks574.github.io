---
title: "Fabric (React Native New Renderer)"
description: "C++ 기반으로 재설계되어 React 18+의 Concurrent 기능과 동기식 렌더링, 통합 섀도우 트리를 지원하는 React Native의 차세대 렌더러"
category: "client"
tags: ["react-native", "fabric", "new-architecture", "renderer", "c++"]
aliases: ["Fabric", "패브릭", "New Renderer"]
updatedDate: 2026-09-11
---

## 💡 핵심 정의
**"기존의 느린 비동기 렌더링 파이프라인을 부수고, C++ 코어로 완전히 통합한 React Native의 차세대 렌더링 엔진"**

과거 레거시 렌더러는 비동기 브릿지로 인해 빠른 스크롤 시 화면에 하얀 빈 공간(Blank White Screen)이 생기는 치명적인 문제가 있었습니다. Fabric은 JSI를 통해 C++ 수준에서 불변(Immutable) 섀도우 트리를 관리하여 네이티브 뷰를 매끄럽게 동기 렌더링합니다.

## 🎯 왜 알아야 하는가? (실무 가치)
* **빈 화면(Blank Screen) 박멸:** 리스트를 아무리 빠르게 스크롤해도 네이티브 스레드와 동기화되어 즉각적인 프레임 렌더링이 보장됩니다.
* **React 18 동시성(Concurrent Features) 지원:** `startTransition`, `Suspense` 같은 모던 React의 우선순위 기반 인터럽터블 렌더링을 네이티브 모바일에서도 완벽하게 활용할 수 있습니다.
* **크로스 플랫폼 일관성:** C++ 코어로 렌더링 로직이 일원화되어 iOS와 Android 간의 미세한 레이아웃/렌더링 불일치가 대폭 해소됩니다.

## ⚙️ 동작 원리 & 메커니즘
1. **Render:** React 요소 트리로부터 C++ 섀도우 노드(Shadow Tree)를 생성합니다.
2. **Commit & Layout:** C++ Yoga 엔진이 불변 트리의 크기와 위치를 계산합니다.
3. **Mount:** 플랫폼 전용 네이티브 뷰(UIView, android.view.View)로 변환하여 메인 UI 스레드에 최종 마운트합니다.

## 🔗 연관 개념
- [[jsi]] · [[tools/react-native/yoga-flexbox|Yoga 레이아웃 엔진]] · [[tools/react-native/architecture|React Native 신 아키텍처]]
