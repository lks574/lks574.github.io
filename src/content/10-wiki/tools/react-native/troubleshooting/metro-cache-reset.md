---
title: "Metro 번들러 캐시 꼬임 및 강제 리셋"
description: "새로운 패키지 설치나 코드 변경 후 화면에 반영되지 않을 때 Metro 캐시 클리어 방법"
type: "troubleshooting"
tags: ["domain/rn", "metro", "cache", "troubleshooting"]
updatedDate: 2026-03-11
---

## 1. 증상 (Symptom)

- 분명 코드를 수정했거나 `npm install`로 새 패키지를 추가했는데, Fast Refresh가 동작하지 않거나 이전 코드가 계속 실행됨.
- `Unable to resolve module ...` 에러가 발생함.

---

## 2. 원인 (Cause)

Metro 번들러가 이전 번들 트리를 메모리/임시 디렉토리에 캐싱하고 있어, 새로 변경된 의존성 트리를 인식하지 못하는 현상.

---

## 3. 해결 방법 (Solution)

### 방법 1. Metro 캐시 리셋 실행 (가장 추천)
```bash
npx react-native start --reset-cache
# 또는 npm script
npm start -- --reset-cache
```

### 방법 2. Watchman 및 임시 폴더까지 완전 삭제 (강력 초기화)
```bash
# 1. watchman 캐시 삭제
watchman watch-del-all

# 2. metro 임시 파일 삭제
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-map-*

# 3. 재실행
npx react-native start --reset-cache
```

---

## 🔗 목록으로 돌아가기
* [[index|트러블슈팅 목차로 돌아가기]]
