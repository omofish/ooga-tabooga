#!/usr/bin/env bash
# Stop hook: once per session, and only if the session changed something,
# remind the agent to write reusable findings back to agent-playground.
# Blocks once (exit 2) per session id; fails open if anything is missing.
# Source: omofish/agent-playground templates/general/.claude/hooks/kb-nudge.sh
set -uo pipefail
command -v jq >/dev/null || exit 0
input=$(cat)
sid=$(jq -r '.session_id // empty' <<<"$input")
transcript=$(jq -r '.transcript_path // empty' <<<"$input")
[ -n "$sid" ] || exit 0
dir=${CLAUDE_PROJECT_DIR:-$PWD}
state=$(cd "$dir" && git rev-parse --absolute-git-dir 2>/dev/null)/claude-kb-nudge || exit 0
mkdir -p "$state" 2>/dev/null || exit 0
[ -e "$state/$sid" ] && exit 0
# Only after sessions that edited files or committed.
if [ -n "$transcript" ] && [ -f "$transcript" ]; then
  grep -Eq '"name":"(Edit|Write|MultiEdit|NotebookEdit)"|git commit' "$transcript" || exit 0
fi
touch "$state/$sid"
find "$state" -type f -mtime +30 -delete 2>/dev/null
cat >&2 <<'MSG'
Before you finish: did this session turn up a pattern, gotcha or user's call
that would help another repo (not one about this product only)? If yes, add it
to agent-playground now (CLAUDE.md -> "Shared knowledge"), ship it, and tell
the user what you added. If not, just finish. This reminder shows once per session.
MSG
exit 2
