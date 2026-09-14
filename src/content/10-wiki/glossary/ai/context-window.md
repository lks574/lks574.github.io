---
title: "Context Window (컨텍스트 윈도우 / 문맥 창)"
description: "LLM이 단일 프롬프트 및 대화 턴에서 한 번에 읽고 이해하며 기억할 수 있는 입력 및 출력 토큰의 최대 한계 용량"
category: "ai"
tags: ["ai", "llm", "context-window", "tokens", "rag"]
aliases: ["Context Window", "컨텍스트 윈도우", "문맥 창"]
updatedDate: 2026-09-14
sources: ["tools/agents/orchestration-and-memory-decisions"]
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

## 🧭 내 실무 판단 & 사례
- **매번 읽히는 것과 막힐 때 읽는 것을 나눈다.** 규칙 파일과 스킬은 세션마다 로드되니 짧게 유지하고, 위키와 용어집은 링크와 `llms.txt`로 찾아가는 참조층으로 두었다. 용어집을 모든 에이전트 컨텍스트에 주입하는 안은 버렸다. 대부분은 그 작업과 무관한 토큰이었다.
- **다른 에이전트에게 넘기는 컨텍스트는 자기완결적인 파일 하나다.** 워커는 코디네이터의 대화와 메모리를 모른다. 채팅으로 흘려 넣은 긴 프롬프트는 잘리고 재현이 안 됐지만, 브리프 파일은 diff가 남고 같은 조건으로 다시 돌릴 수 있었다.
- 상세: [[tools/agents/orchestration-and-memory-decisions|에이전트 오케스트레이션과 기억 구조 결정]]

## 🔗 연관 개념
- [[rag]] · [[agentic-rag]] · [[memory-consolidation]]
