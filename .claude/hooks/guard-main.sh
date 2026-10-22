#!/usr/bin/env bash
# PreToolUse(Bash) hook: main only moves through scripts/ship.sh, which waits
# for green CI first. Block any direct git push that targets main.
set -uo pipefail
cmd=$(jq -r '.tool_input.command // ""')
if grep -Eq 'git[[:space:]].*push' <<<"$cmd" && grep -Eq '(^|[[:space:]:+])(refs/heads/)?main([[:space:]]|$)' <<<"$cmd"; then
  echo "Don't push to main directly. Commit on your branch and run: npm run ship" >&2
  exit 2
fi
exit 0
