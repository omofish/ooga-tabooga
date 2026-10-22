#!/usr/bin/env bash
# The one quality gate. Run locally by the Stop hook and ship.sh, and in CI.
# Prints only the failing step's output so an agent can read it quickly.
set -uo pipefail
cd "$(dirname "$0")/.."

bin=./node_modules/.bin
steps=(
  "typecheck|$bin/tsc --noEmit"
  "lint|$bin/eslint . --max-warnings 0"
  "word-sets|$bin/tsx scripts/audit-word-sets.mts"
)

log=$(mktemp)
trap 'rm -f "$log"' EXIT
for step in "${steps[@]}"; do
  name=${step%%|*}
  cmd=${step#*|}
  if ! $cmd >"$log" 2>&1; then
    echo "verify: FAIL at $name ($cmd)"
    tail -n 40 "$log"
    exit 1
  fi
  echo "verify: $name ok"
done
echo "verify: all green"
