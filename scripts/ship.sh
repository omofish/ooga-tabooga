#!/usr/bin/env bash
# Ship the current branch to main with no PR:
#   merge origin/main -> verify locally -> push branch -> wait for CI `verify`
#   on that exact commit -> fast-forward main to it.
# If main moved meanwhile, the push is rejected and we go round again.
set -euo pipefail
cd "$(dirname "$0")/.."

MAX_ROUNDS=3
POLL_SECONDS=10
TIMEOUT_SECONDS=900
CHECK_NAME=verify

branch=$(git branch --show-current)
if [ -z "$branch" ] || [ "$branch" = main ]; then
  echo "ship: run from a feature branch, not '${branch:-detached HEAD}'" >&2
  exit 1
fi
if [ -n "$(git status --porcelain)" ]; then
  echo "ship: commit or stash your changes first" >&2
  exit 1
fi
repo=$(git remote get-url origin | sed -E 's#(\.git)?/?$##' | awk -F/ '{print $(NF-1)"/"$NF}')

wait_for_ci() {
  local sha=$1 waited=0 run status conclusion url
  echo "ship: waiting for CI '$CHECK_NAME' on ${sha:0:7}"
  while [ "$waited" -lt "$TIMEOUT_SECONDS" ]; do
    run=$(gh api "repos/$repo/commits/$sha/check-runs?check_name=$CHECK_NAME" \
      --jq '.check_runs[0] // empty | [.status, (.conclusion // ""), .html_url] | @tsv' 2>/dev/null || true)
    if [ -n "$run" ]; then
      IFS=$'\t' read -r status conclusion url <<<"$run"
      if [ "$status" = completed ]; then
        if [ "$conclusion" = success ]; then
          echo "ship: CI green"
          return 0
        fi
        echo "ship: CI $conclusion: $url" >&2
        return 1
      fi
    fi
    sleep "$POLL_SECONDS"
    waited=$((waited + POLL_SECONDS))
  done
  echo "ship: timed out after ${TIMEOUT_SECONDS}s waiting for CI" >&2
  return 1
}

for round in $(seq 1 "$MAX_ROUNDS"); do
  echo "ship: round $round/$MAX_ROUNDS"
  git fetch -q origin main
  if ! git merge -q --no-edit origin/main; then
    echo "ship: merge conflict with origin/main; resolve, commit, re-run" >&2
    exit 1
  fi
  bash scripts/verify.sh
  git push -q -u origin "$branch"
  sha=$(git rev-parse HEAD)
  wait_for_ci "$sha"
  # Plain push = fast-forward only. Rejected if main moved since our fetch.
  if git push -q origin "$sha:refs/heads/main"; then
    echo "ship: main is now ${sha:0:7}"
    exit 0
  fi
  echo "ship: main moved during CI; retrying"
done
echo "ship: gave up after $MAX_ROUNDS rounds" >&2
exit 1
