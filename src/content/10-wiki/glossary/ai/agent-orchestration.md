---
title: "Agent Orchestration (에이전트 오케스트레이션)"
description: "서로 다른 역할과 도구를 가진 다수의 AI 서브에이전트들을 지휘하여 복잡한 엔지니어링 문제를 분할 정복하는 시스템 아키텍처"
category: "ai"
tags: ["ai", "agents", "multi-agent", "orchestration"]
aliases: ["Agent Orchestration", "Multi-Agent", "에이전트 오케스트레이션"]
updatedDate: 2026-09-11
---

## 💡 핵심 정의
**"하나의 만능 비서 대신, 기획자·프론트엔드·QA·DB 엔지니어로 구성된 가상 개발팀을 지휘하는 PM 시스템"**

단일 LLM에게 모든 복잡한 작업을 일임하는 한계(환각, 컨텍스트 초과, 도구 혼란)를 극복하기 위해, 역할을 잘게 쪼갠 여러 전문 서브에이전트(Subagents)를 배치하고 이들의 작업 순서, 데이터 전달, 의사결정 파이프라인을 통제하는 기법입니다.

## 🎯 왜 알아야 하는가? (실무 가치)
* **컨텍스트 오염 방지:** 코드베이스 전체 탐색 에이전트와 코드 작성 에이전트를 분리하여, 불필요한 검색 로그가 최종 작성자의 컨텍스트를 더럽히지 않도록 격리합니다.
* **병렬 실행(Concurrency):** 독립적인 리서치나 단위 테스트 작성을 여러 에이전트가 동시에 수행하므로 작업 처리 속도가 획기적으로 단축됩니다.
* **자기 치유(Self-Healing Loop):** 구현 에이전트가 코드를 짜고, 테스트 에이전트가 컴파일 에러를 발견하면 스스로 디버깅하여 수정하는 피드백 루프 구축이 가능합니다.

## ⚙️ 동작 원리 & 메커니즘
1. **Supervisor / Planner 패턴:** 메인 에이전트가 사용자의 요구사항을 분석하여 세부 태스크 그래프(DAG)를 생성합니다.
2. **Specialized Workers:** 각 태스크에 맞는 도구 세트(Tool Groups)를 장착한 워커 에이전트를 격리된 컨텍스트로 호출(`invoke_subagent`)합니다.
3. **Synthesis & Handoff:** 서브에이전트의 실행 결과를 취합하여 검증한 후 다음 단계 에이전트에게 인계하거나 사용자에게 최종 리포트를 전달합니다.

## 🔗 연관 개념
- [[agentic-rag]] · [[memory-consolidation]] · [[concepts/Multi-Agent-Orchestration|멀티 에이전트 오케스트레이션 (Orca 실전)]]
