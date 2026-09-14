# QA 결과: wiki-backlinks — 2026-09-14

빌드 결과물(dist) 검사와 임시 픽스처 노트 2개(zz-temp-a, zz-temp-b, 검증 후 삭제)로 확인했다.

| AC | 결과 | 증거 |
|---|---|---|
| AC-BL-001 | 통과 | `tools/react-native/architecture` 페이지 역링크에 RN 가이드, concurrency-vs-parallelism, fabric, jsi |
| AC-BL-002 | 통과 | `/wiki/glossary/ai/rag/`와 `/wiki/rag/`의 역링크 섹션 HTML 동일 |
| AC-BL-003 | 통과 | idempotency 페이지: 제목 텍스트 + 정식 경로 href, 용어집 항목에 "용어집 · 🏗️ 아키텍처 & 코어" |
| AC-BL-004 | 통과 | 아무도 링크하지 않는 임시 노트 A의 HTML에 섹션 요소 0개 |
| AC-BL-005 | 통과 | A가 B를 2회 링크 + B 자기 참조 → B 페이지에 A 1회, B 자신 없음 |
| AC-BL-006 | 통과 | A의 `[[glossary/ai/rag]]` 전체 경로 링크가 rag 역링크에 집계됨 |
| AC-BL-007 | 통과 | 트러블슈팅 허브의 인라인 코드 `[[slug]]`가 해소 실패 경고를 내지 않음 (경고 0건) |
| AC-BL-008 | 통과 | 임시 노트 추가 → 빌드 → rag 역링크에 반영, 삭제 → 빌드 → 사라짐. 손으로 고친 파일 없음 |
| AC-BL-009 | 통과 | `[[없는노트]]` 포함 빌드 성공, 경고 1줄 `[backlinks] unresolved [[없는노트]] in wiki:concepts/zz-temp-a` |
| AC-BL-010 | 통과 | 3회 빌드 524 / 446 / 452ms, 중앙값 452ms ≤ 1000ms |
| AC-BL-011 | 통과 (제안 상태) | idempotency 페이지: 설계 기록 → 용어집 순. 정렬 기준은 사용자 확정 대기 |

부수 발견: 대문자 파일명 노트 2개가 프로덕션에서 404였음 (D-002). 이번 변경에 포함해 수정.
