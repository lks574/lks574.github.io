---
title: "Idempotency (멱등성)"
description: "동일한 연산이나 API 요청을 여러 번 연속해서 수행하더라도, 시스템의 최종 상태와 결과가 한 번 수행했을 때와 완전히 동일하게 유지되는 성질"
category: "architecture"
tags: ["architecture", "api", "distributed-systems", "backend"]
aliases: ["Idempotency", "Idempotent", "멱등성"]
updatedDate: 2026-09-11
---

## 💡 핵심 정의
**"엘리베이터 닫힘 버튼을 1번 누르든, 조급해서 10번 연속 누르든 문이 닫히는 결과는 똑같은 상태"**

수학에서 $f(f(x)) = f(x)$인 것처럼, 네트워크 불안정이나 타임아웃으로 인해 클라이언트가 동일한 요청을 재시도(Retry)하더라도 부작용(Side Effect)이 누적되지 않도록 보장하는 시스템 설계 원칙입니다.

## 🎯 왜 알아야 하는가? (실무 가치)
* **결제 및 주문 시스템의 필수 요건:** 사용자가 결제 버튼을 더블 클릭하거나 통신 장애로 재요청이 발생했을 때, 계좌에서 돈이 두 번 빠져나가지 않도록 방어하는 핵심입니다.
* **분산 시스템의 신뢰성:** 메시지 큐(Kafka, SQS 등)의 '최소 한 번 전달(At-Least-Once Delivery)' 환경에서 중복 컨슈밍으로 인한 데이터 오염을 막아줍니다.
* **안전한 재시도(Retry):** 멱등성이 보장된 API는 클라이언트가 에러 발생 시 안심하고 백오프(Exponential Backoff) 재시도를 할 수 있습니다.

## ⚙️ 동작 원리 & 메커니즘
- **HTTP 메서드 규격:** `GET`, `PUT`, `DELETE`는 표준상 멱등해야 하며, `POST`는 일반적으로 비멱등합니다.
- **Idempotency Key 기법:** 클라이언트가 각 요청마다 고유한 UUID(`Idempotency-Key` 헤더)를 발급하여 서버로 전달합니다. 서버는 Redis나 RDB에 해당 키의 처리 상태와 응답을 캐싱해 두고, 동일한 키로 요청이 다시 오면 실제 비즈니스 로직을 재실행하지 않고 저장된 결과를 즉시 반환합니다.

## 🔗 연관 개념
- [[concurrency-vs-parallelism]]
