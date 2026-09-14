---
title: "RAG (Retrieval-Augmented Generation / 검색 증강 생성)"
description: "LLM이 사전 학습된 데이터의 한계를 넘어, 질문과 관련된 외부 문서를 실시간으로 검색하여 답변 컨텍스트로 주입하는 아키텍처"
category: "ai"
tags: ["ai", "llm", "rag", "vector-db", "retrieval"]
aliases: ["RAG", "검색 증강 생성", "Retrieval-Augmented Generation"]
updatedDate: 2026-09-14
sources: ["tools/agents/orchestration-and-memory-decisions"]
---

## 💡 핵심 정의
**"시험장에 오픈북(Open Book) 참고서를 들고 들어가는 LLM"**

LLM이 모든 지식을 파라미터(기억) 안에 암기하고 있는 대신, 사용자의 질문이 들어왔을 때 가장 관련도 높은 최신 사내 문서나 데이터베이스를 검색(Retrieve)하여 그 내용을 프롬프트에 첨부(Augment)한 뒤 답변을 생성(Generate)하도록 만드는 아키텍처 패턴입니다.

## 🎯 왜 알아야 하는가? (실무 가치)
* **할루시네이션(환각) 억제:** 근거 자료(Ground Truth)를 기반으로 답변을 강제하므로 모델의 거짓말을 획기적으로 줄입니다.
* **비용 절감:** 수억~수십억 원이 드는 모델 재학습이나 파인튜닝(Fine-Tuning) 없이도, 실시간으로 최신 데이터나 비공개 사내 지식을 주입할 수 있습니다.
* **출처 명시(Citation):** 답변 생성 시 어떤 문서 몇 페이지를 참고했는지 링크와 출처를 사용자에게 투명하게 제공할 수 있어 엔터프라이즈 프로덕션 도입의 필수 요건입니다.

## ⚙️ 동작 원리 & 메커니즘
1. **인덱싱(Indexing):** 방대한 문서를 청크(Chunk) 단위로 쪼개고, 임베딩 모델을 통해 고차원 벡터로 변환하여 Vector DB에 저장합니다.
2. **검색(Retrieval):** 사용자의 자연어 질문이 들어오면 동일한 임베딩 벡터로 변환한 뒤, 코사인 유사도(Cosine Similarity) 등을 통해 가장 유사한 상위 K개의 문서를 발췌합니다.
3. **증강(Augmentation):** 검색된 문서 조각들을 시스템 프롬프트의 컨텍스트 블록에 주입합니다.
4. **생성(Generation):** LLM이 프롬프트에 담긴 참고 문서를 바탕으로 최종 답변을 합성합니다.

## 🧭 내 실무 판단 & 사례
- **개인 위키에는 RAG를 붙이지 않았다.** 노트 수십 개 규모에서 임베딩 파이프라인, 인덱스 갱신, 청킹 규칙을 유지하는 비용이 얻는 것보다 컸다. 대신 원자 노트, 양방향 링크, 빌드 타임 자동 색인, `glossary.json`과 `llms.txt`를 두어 에이전트가 grep과 파일 읽기로 찾아가게 했다. 좋은 파일명과 링크가 이미 인덱스였다.
- **다시 볼 시점을 정해 두었다.** 노트가 수백 개를 넘어 grep이 실패하기 시작하면 그때 검색 계층을 붙인다. 그 전에 붙이는 것은 콘텐츠보다 인프라에 시간을 쓰는 일이다.
- 상세: [[tools/agents/orchestration-and-memory-decisions|에이전트 오케스트레이션과 기억 구조 결정]]

## 🔗 연관 개념
- [[agentic-rag]] · [[context-window]]
