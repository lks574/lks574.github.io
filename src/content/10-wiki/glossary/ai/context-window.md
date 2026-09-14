---
title: "Context Window (컨텍스트 윈도우 / 문맥 창)"
description: "LLM이 단일 프롬프트 및 대화 턴에서 한 번에 읽고 이해하며 기억할 수 있는 입력 및 출력 토큰의 최대 한계 용량"
category: "ai"
tags: ["ai", "llm", "context-window", "tokens", "rag"]
aliases: ["Context Window", "컨텍스트 윈도우", "문맥 창"]
updatedDate: 2026-09-11
---

## 💡 핵심 정의
**"LLM이 문제를 풀 때 책상 위에 한 번에 펼쳐놓을 수 있는 A4 용지의 최대 매수"**

인공지능 모델의 '작업 기억(Working Memory)' 공간입니다. 이전 대화 기록, 시스템 프롬프트, 도구 호출 결과, 첨부 파일 등 모델에게 주입되는 모든 정보는 이 컨텍스트 윈도우 크기(예: 128k, 1M, 2M 토큰) 안에 들어가야만 모델이 인식할 수 있습니다.

## 🎯 왜 알아야 하는가? (실무 가치)
* **비용과 지연시간의 직결:** 컨텍스트 윈도우에 무작정 많은 문서를 밀어넣으면(Context Stuffing), 토큰당 과금되는 API 비용이 급증하고 모델의 First-Token 응답 지연시간(TTFT)이 심각하게 늘어납니다.
* **중간 망각 현상(Lost in the Middle):** 모델의 지원 용량이 1M 토큰으로 늘어났다 하더라도, 방대한 컨텍스트의 '중간'에 위치한 정보를 놓치는 검색 정확도 저하가 발생하므로 효과적인 요약과 청킹 전략이 여전히 필요합니다.
* **에이전트 메모리 관리의 기준:** 자율 에이전트 개발 시 대화가 길어지면 슬라이딩 윈도우(Sliding Window)나 요약 압축(Compaction) 기법을 반드시 적용해야 하는 이유입니다.

## ⚙️ 동작 원리 & 메커니즘
- 트랜스포머(Transformer)의 **어텐션(Self-Attention)** 메커니즘은 토큰 간의 관계를 계산할 때 기본적으로 $O(N^2)$의 연산 복잡도를 가집니다.
- 최근 모델들은 FlashAttention, RoPE(Rotary Position Embedding) 확장, 희소 어텐션(Sparse Attention) 등을 통해 수십만~수백만 토큰까지 컨텍스트 윈도우를 확장하고 있습니다.

## 🔗 연관 개념
- [[rag]] · [[agentic-rag]] · [[memory-consolidation]]
