#!/usr/bin/env bash
# Link the shared skills and agents from this package into the home folders that
# Claude Code, the Agent Skills standard, and Codex read. Idempotent. Existing
# non-link directories with the same name are moved to <name>.bak-<date>, never deleted.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STAMP="$(date +%F)"
SKILL_HOMES=("$HOME/.claude/skills" "$HOME/.agents/skills" "$HOME/.codex/skills")
AGENT_HOME="$HOME/.claude/agents"

link() { # link <target> <linkpath>
  local target="$1" link="$2"
  if [ -L "$link" ]; then
    [ "$(readlink "$link")" = "$target" ] && { echo "ok      $link"; return; }
    rm "$link"
  elif [ -e "$link" ]; then
    # keep backups outside the scanned folder: a *.bak dir with SKILL.md would load as a duplicate skill
    local bdir="$(dirname "$link")-backup-$STAMP"
    mkdir -p "$bdir"; mv "$link" "$bdir/$(basename "$link")"; echo "backup  $link -> $bdir/"
  fi
  ln -s "$target" "$link"; echo "linked  $link"
}

for home in "${SKILL_HOMES[@]}"; do
  mkdir -p "$home"
  for dir in "$HERE"/skills/*/; do
    name="$(basename "$dir")"
    link "$dir" "$home/$name"
  done
done

mkdir -p "$AGENT_HOME"
for file in "$HERE"/agents/*.md; do
  link "$file" "$AGENT_HOME/$(basename "$file")"
done
echo "done. skills: $(ls "$HERE/skills" | wc -l | tr -d ' '), agents: $(ls "$HERE/agents" | wc -l | tr -d ' ')"
