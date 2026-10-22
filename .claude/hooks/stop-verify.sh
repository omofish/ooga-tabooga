#!/usr/bin/env bash
# Stop hook: the agent can't end its turn while scripts/verify.sh is red.
# Skips re-running when nothing changed since the last green run, and lets the
# agent stop after 3 blocked attempts in a row so it can't loop forever.
set -uo pipefail
cd "$CLAUDE_PROJECT_DIR"

input=$(cat)
state_dir=$(git rev-parse --git-path claude-verify)
mkdir -p "$state_dir"

fingerprint=$( { git rev-parse HEAD; git diff HEAD; git ls-files --others --exclude-standard | xargs -r sha1sum; } | sha1sum | cut -d' ' -f1)
if [ "$(cat "$state_dir/last-green" 2>/dev/null)" = "$fingerprint" ]; then
  exit 0
fi

if out=$(bash scripts/verify.sh 2>&1); then
  echo "$fingerprint" >"$state_dir/last-green"
  rm -f "$state_dir/blocks"
  exit 0
fi

blocks=0
if [ "$(jq -r '.stop_hook_active // false' <<<"$input")" = true ]; then
  blocks=$(cat "$state_dir/blocks" 2>/dev/null || echo 0)
fi
blocks=$((blocks + 1))
echo "$blocks" >"$state_dir/blocks"
if [ "$blocks" -gt 3 ]; then
  rm -f "$state_dir/blocks"
  echo "verify still red after 3 tries; tell the user what is failing." >&2
  exit 0
fi

echo "$out" >&2
echo "Fix the failure above before stopping (attempt $blocks/3)." >&2
exit 2
