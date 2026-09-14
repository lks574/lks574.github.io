---
title: "Concurrency vs Parallelism (동시성과 병렬성)"
description: "다수의 작업을 다루는 구조적 방식(Concurrency)과 실제로 여러 작업을 물리적으로 동시에 처리하는 실행 방식(Parallelism)의 차이"
category: "architecture"
tags: ["architecture", "concurrency", "parallelism", "threading", "performance"]
aliases: ["Concurrency", "Parallelism", "동시성", "병렬성"]
updatedDate: 2026-09-11
---

## 💡 핵심 정의
**"한 명의 요리사가 찌개 끓이면서 틈틈이 야채 써는 것(동시성) vs 두 명의 요리사가 각자 화구에서 요리하는 것(병렬성)"**

- **동시성 (Concurrency):** 여러 작업을 '동시에 다루는(Dealing with)' 아키텍처적 구조. 단일 코어에서도 컨텍스트 스위칭(시분할)을 통해 사용자는 동시에 돌아가는 것처럼 느낍니다.
- **병렬성 (Parallelism):** 멀티 코어 하드웨어에서 여러 작업이 '물리적으로 동일한 시점에(Doing simultaneously)' 실행되는 것.

## 🎯 왜 알아야 하는가? (실무 가치)
* **모바일 UI 스레드 보호:** React Native나 모바일 앱에서 무거운 연산이나 I/O 작업을 동시성 제어 없이 메인 스레드에 올리면 60fps 프레임 드랍(Jank)과 앱 멈춤이 발생합니다.
* **하드웨어 효율 극대화:** 서버 환경에서 멀티코어를 활용하지 못하고 단일 스레드 이벤트 루프(Node.js 등)에 CPU 집약적 연산을 물리면 전체 시스템 응답이 마비됩니다.
* **동기화 문제 예방:** Race Condition(경쟁 상태), Deadlock(교착 상태) 등 동시성 버그를 해결하기 위한 올바른 락(Lock) 및 불변성(Immutability) 전략 수립의 기본입니다.

## ⚙️ 동작 원리 & 메커니즘
- **I/O Bound 작업:** 대기 시간이 대부분이므로 비동기 논블로킹(Async/Await, 이벤트 루프)을 통한 **동시성** 확보가 최적의 처리량을 냅니다.
- **CPU Bound 작업:** 대규모 데이터 가공, 이미지/비디오 인코딩 등은 멀티 프로세싱이나 워커 스레드 풀을 통한 **병렬성** 확보가 필수적입니다.

## 🔗 연관 개념
- [[idempotency]] · [[jsi]] · [[tools/react-native/architecture|React Native 3스레드 아키텍처]]
