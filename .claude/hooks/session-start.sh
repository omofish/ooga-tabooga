#!/usr/bin/env bash
# SessionStart hook: install deps so verify can run from the first turn.
set -euo pipefail
cd "$CLAUDE_PROJECT_DIR"
[ -x node_modules/.bin/vitest ] || npm ci --silent
