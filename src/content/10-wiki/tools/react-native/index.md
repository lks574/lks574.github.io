---
title: "React Native (RN) 실무 생존 가이드"
description: "React Native 아키텍처, 레이아웃 엔진, 실전 트러블슈팅을 집대성한 지식 허브"
type: "hub"
tags: ["domain/rn", "hub"]
updatedDate: 2026-09-11
---

## 1. 개요 (Overview)

React Native(RN)는 JavaScript/TypeScript와 React 멘탈 모델을 바탕으로 iOS와 Android 네이티브 앱을 구축하는 크로스플랫폼 프레임워크입니다.

이곳은 실무 프로젝트를 진행하며 체득한 핵심 아키텍처, 레이아웃 메커니즘, 그리고 1이슈 1파일로 기록한 트러블슈팅 로그를 모아둔 **지식 허브**입니다.

---

## 2. 핵심 지식 목차 (Topics)

### 🏛️ 아키텍처 & 런타임
* [[architecture|React Native 스레드 모델 & 신규 아키텍처]]  
  UI Thread, JS Thread, Shadow Thread의 3대 스레드 동작 원리와 JSI, Fabric, TurboModules 등 신규 아키텍처 심층 정리

### 📐 화면 & 레이아웃
* [[yoga-flexbox|Yoga 엔진과 Flexbox 레이아웃]]  
  C++ 기반 Yoga 레이아웃 엔진의 동작 방식과 모바일 환경에 특화된 Flexbox 실무 가이드

### ⚡ 실전 트러블슈팅 (1 이슈 1 파일)
* [[tools/react-native/troubleshooting|React Native 트러블슈팅 색인 허브]]  
  빌드 에러, 번들러 캐시 꼬임, 런타임 크래시 해결 로그 모음

---

## 3. 관련 링크
- [[Multi-Agent-Orchestration]]: RN 프로젝트 학습 및 구현에 활용한 멀티 에이전트 워크플로우
- [[Index-MOC]]: 전체 지식 지도
