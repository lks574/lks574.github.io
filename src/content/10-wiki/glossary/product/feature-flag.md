---
title: "Feature Flag (피처 플래그 / 피처 토글)"
description: "새로운 코드를 배포한 후에도, 코드를 다시 수정하거나 재배포하지 않고 런타임에 특정 기능의 활성화 여부를 동적으로 켜고 끌 수 있게 하는 소프트웨어 엔지니어링 기법"
category: "product"
tags: ["product-engineering", "devops", "feature-flag", "deployment", "ab-testing"]
aliases: ["Feature Flag", "Feature Toggle", "피처 플래그", "피처 토글"]
updatedDate: 2026-09-11
---

## 💡 핵심 정의
**"새로 만든 기능에 장착해두는 원격 조종 두꺼비집 스위치"**

기능을 릴리즈(Release)하는 시점과 프로덕션 환경에 코드를 배포(Deploy)하는 시점을 물리적으로 완벽하게 분리(Decoupling)해 주는 도구입니다.

## 🎯 왜 알아야 하는가? (실무 가치)
* **배포와 출시의 분리:** 코드가 완성되는 즉시 `main` 브랜치에 안전하게 머지하고 배포할 수 있어 Trunk-Based Development가 가능해집니다.
* **리스크 0에 수렴하는 카나리(Canary) 배포:** 새 기능을 1%의 사내 유저에게만 먼저 열어보고 크래시나 성능 저하가 없음을 확인한 뒤 점진적으로 100%까지 롤아웃할 수 있습니다.
* **긴급 킬 스위치(Kill Switch):** 프로덕션 장애 발생 시 롤백 배포(30분~수 시간 소요)를 기다릴 필요 없이, 관리자 콘솔에서 스위치를 0.1초 만에 끄면 장애가 즉시 격리됩니다.

## ⚙️ 동작 원리 & 메커니즘
- 코드 내부에서는 단순한 조건문 형태로 작동합니다:
  ```ts
  if (featureFlags.isEnabled('new-checkout-flow', userContext)) {
    renderNewCheckout();
  } else {
    renderLegacyCheckout();
  }
  ```
- 클라이언트는 앱 시작 시 또는 실시간 웹소켓/SSE를 통해 플래그 평가 규칙(Ruleset)을 동기화하여 지연 시간 없이 로컬에서 즉시 분기 처리합니다.

## 🔗 연관 개념
- [[lead-time]]
