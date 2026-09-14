---
title: "Concurrency vs Parallelism (동시성과 병렬성)"
description: "다수의 작업을 다루는 구조적 방식(Concurrency)과 실제로 여러 작업을 물리적으로 동시에 처리하는 실행 방식(Parallelism)의 차이"
category: "architecture"
tags: ["architecture", "concurrency", "parallelism", "threading", "performance"]
aliases: ["Concurrency", "Parallelism", "동시성", "병렬성"]
updatedDate: 2026-09-14
sources: ["tools/ios/background-video-upload-design"]
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

## 🧭 내 실무 판단 & 사례
- **동시성은 actor로, 병렬성은 I/O 개수로 분리했다.** 업로드 상태 머신은 Swift `actor` 하나가 소유해 UI, 백그라운드 깨어남 콜백, 재시도 타이머가 여러 스레드에서 들어와도 상태가 깨지지 않게 했다. 병렬성은 그 밖에서 S3 파트 전송 연결 수(호스트당 8개, 큐 깊이 32)로만 조절했다. 두 질문을 한 곳에서 풀려고 하면 락과 큐가 뒤섞인다.
- **동시 세션은 1개로 직렬화.** 서버의 세션 상한과 취소 중 새 세션 생성 충돌을 겪고 나서, 세션 수준 동시성은 포기하고 세션 안의 파트 병렬성만 남겼다. 사용자 체감 속도는 후자가 결정한다.
- **`AsyncStream`은 단일 소비자다.** RN 브릿지와 네이티브 화면이 스트림 하나를 나눠 소비하다가 RN 진행률이 멈췄다. 구독자마다 독립 스트림을 발급하는 브로드캐스터로 바꿨다. 동시성 프리미티브의 소비자 수 제약은 문서에 있지만 한 번 겪어야 몸에 남는다.
- 상세: [[tools/ios/background-video-upload-design|대용량 영상 백그라운드 업로드 설계 결정]]

## 🔗 연관 개념
- [[idempotency]] · [[swift-concurrency]] · [[jsi]] · [[tools/react-native/architecture|React Native 3스레드 아키텍처]]
