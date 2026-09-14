---
title: "JSI (JavaScript Interface)"
description: "React Native의 JavaScript 런타임이 C++ 네이티브 객체 및 함수에 JSON 직렬화 없이 직접 접근하고 상호 호출할 수 있도록 해주는 범용 C++ 바인딩 계층"
category: "client"
tags: ["react-native", "jsi", "c++", "new-architecture", "hermes"]
aliases: ["JSI", "JavaScript Interface", "자바스크립트 인터페이스"]
updatedDate: 2026-09-11
---

## 💡 핵심 정의
**"JS와 C++ 사이에 통역관(JSON 브릿지)을 거치지 않고, 두 언어가 같은 방(메모리)에서 직접 대화할 수 있게 뚫어준 직통 통로"**

과거 React Native는 JS 스레드와 Native 스레드가 통신할 때 모든 데이터를 JSON 문자열로 직렬화(Serialize)하여 비동기 큐로 전송해야 했습니다. JSI는 JS 객체가 C++ HostObject를 직접 참조할 수 있도록 만들어 이 병목을 완전히 제거한 뉴 아키텍처의 핵심 기반입니다.

## 🎯 왜 알아야 하는가? (실무 가치)
* **동기적 호출(Synchronous Call) 가능:** 과거 브릿지에서는 불가능했던 블루투스, 카메라 프레임, 암호화 등의 동기식 고속 네이티브 API 호출이 가능해졌습니다.
* **압도적인 성능 개선:** 대용량 데이터 전달 시 JSON 인코딩/디코딩 오버헤드가 사라져 네이티브 앱 수준의 60fps 애니메이션 및 제스처 처리가 가능합니다.
* **JS 엔진 독립성:** 특정 JS 엔진(V8, JSC, Hermes 등)에 종속되지 않는 범용 추상화 계층이므로, 엔진 교체가 자유롭습니다.

## ⚙️ 동작 원리 & 메커니즘
- C++로 작성된 클래스가 `jsi::HostObject`를 상속받아 메서드를 구현합니다.
- JS 런타임의 글로벌 객체(`global`)에 이 C++ 객체의 포인터를 직접 주입(Host Function Injection)합니다.
- JavaScript 엔진은 메모리 힙(Heap)에 올라와 있는 C++ 네이티브 함수를 일반 JS 함수처럼 즉시 호출할 수 있습니다.

## 🔗 연관 개념
- [[fabric]] · [[concurrency-vs-parallelism]] · [[tools/react-native/yoga-flexbox|Yoga 레이아웃 엔진]] · [[tools/react-native/architecture|React Native 신 아키텍처]]
