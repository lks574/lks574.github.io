---
title: "Yoga 엔진과 Flexbox 레이아웃"
description: "C++ Yoga 레이아웃 엔진 동작 원리 및 모바일 특화 Flexbox 핵심 속성 정리"
type: "concept"
tags: ["domain/rn", "tech/layout", "yoga", "flexbox"]
updatedDate: 2026-03-11
---

## 1. Yoga 레이아웃 엔진이란?

**Yoga**는 Meta에서 개발한 C++ 기반의 오픈소스 크로스플랫폼 레이아웃 엔진입니다. 

웹 표준인 W3C Flexbox 명세를 충실히 따르면서도, 모바일 플랫폼(iOS/Android)에서 초고속으로 뷰의 좌표를 계산할 수 있도록 최적화되어 있습니다.

```text
[ React JSX (StyleSheet) ] ──> [ Yoga C++ Engine ] ──> [ iOS / Android Native Layout ]
```

---

## 2. 웹 Flexbox와의 결정적 차이점 3가지

### ① 기본 주 축(Main Axis)의 방향
* **웹 (CSS):** 기본값이 `flexDirection: 'row'` (가로 배치)
* **React Native:** 모바일 화면 특성상 기본값이 **`flexDirection: 'column'` (세로 배치)**

### ② 레이아웃 단위
* **웹:** `px`, `rem`, `em`, `%`, `vw/vh` 등 다양한 단위 지원
* **React Native:** 단위 기호 없이 순수 숫자만 사용 (내부적으로 밀도 독립 단위인 **dp/pt**로 렌더링됨)

### ③ 기본 flex-shrink
* **웹:** 기본값이 `flexShrink: 1` (공간이 부족하면 줄어듦)
* **React Native:** 기본값이 **`flexShrink: 0`** (공간이 부족해도 크기를 유지하려 함)

---

## 3. 자주 쓰이는 핵심 Flexbox 속성 치트시트

| 속성 | 기본값 | 주요 옵션 | 설명 |
| :--- | :--- | :--- | :--- |
| `flexDirection` | `'column'` | `'row'`, `'column-reverse'` | 자식 요소들의 배치 주 축 결정 |
| `justifyContent` | `'flex-start'` | `'center'`, `'space-between'`, `'space-around'` | 주 축(Main Axis) 기준 정렬 |
| `alignItems` | `'stretch'` | `'flex-start'`, `'center'`, `'flex-end'` | 교차 축(Cross Axis) 기준 정렬 |
| `flex` | `0` | 양수 숫자 (예: `1`) | 부모 공간 대비 자식의 차지 비율 |

---

## 4. 상위 목차로 돌아가기
* [[index|React Native 실무 생존 가이드로 돌아가기]]
