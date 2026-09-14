# QA 결과: promotion-candidates — 2026-09-14

| AC | 결과 | 증거 |
|---|---|---|
| AC-PR-001 | 통과 | 픽스처 "episodic detection": tools/ios 제외, background-video-upload-design 포함. 실제 저장소 일화 노트 3개 |
| AC-PR-002 | 통과 | 픽스처 missing-source |
| AC-PR-003 | 통과 | 픽스처 missing-judgement |
| AC-PR-004 | 통과 | 실제 저장소: new-term, metro-cache-reset, [hermes-bytecode-cache, fast-refresh]. 픽스처 'new-term': '후보' 단어 없음·두 문장·예약어 `sources` 제외 모두 처리 (Spec v1.2) |
| AC-PR-005 | 통과 | 픽스처 source-without-link |
| AC-PR-006 | 통과 | 표 출력 + exit 0 |
| AC-PR-007 | 통과 | `--json` → JSON.parse 성공, 키 episodicNotes/candidates/summary |
| AC-PR-008 | 통과 | 린트 마지막 줄 `promotion: 승격 대기 1건 (npm run glossary:promote)`, error 0 유지 |
| AC-PR-009 | 통과 | `npm test` 19/19 (기존 12 + 신규 7). 독립 리뷰 후 픽스처를 실제 저장소 파일과 분리 |
| AC-PR-010 | 통과 | 픽스처 'zero candidates prints one line': 깨끗한 볼트 사본에서 stdout이 `승격 대기 0건`으로 시작하고 표 없음 |
| AC-PR-011 | 통과 | 픽스처 "ignores code and unresolved" |

독립 리뷰(Antigravity) 지적 6건 반영 후 재검증. 상세는 `review.md`.
