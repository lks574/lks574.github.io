#!/usr/bin/env bash
# Connect one repository to the shared procedures:
#  - append the COMMON.md section to AGENTS.md if it is not there yet
#  - make CLAUDE.md a symlink to AGENTS.md (existing distinct CLAUDE.md is merged as a section first)
set -euo pipefail
REPO="${1:?usage: link-repo.sh <repo-path>}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMMON="$HERE/agents-md/COMMON.md"
MARK="## 공용 절차 (Engineering OS)"
cd "$REPO"

[ -f AGENTS.md ] || { echo "# 저장소 가이드라인" > AGENTS.md; echo "created AGENTS.md"; }

if [ -f CLAUDE.md ] && [ ! -L CLAUDE.md ]; then
  if ! diff -q CLAUDE.md AGENTS.md >/dev/null; then
    { echo; echo "## (이전 CLAUDE.md에서 병합)"; echo; cat CLAUDE.md; } >> AGENTS.md
    echo "merged CLAUDE.md into AGENTS.md"
  fi
  mv CLAUDE.md "CLAUDE.md.bak-$(date +%F)"
fi
[ -L CLAUDE.md ] || { ln -s AGENTS.md CLAUDE.md; echo "linked CLAUDE.md -> AGENTS.md"; }

if grep -qF "$MARK" AGENTS.md; then
  echo "AGENTS.md already contains the common section"
else
  { echo; cat "$COMMON"; } >> AGENTS.md
  echo "appended common section to AGENTS.md"
fi
