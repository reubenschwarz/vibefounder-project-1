#!/usr/bin/env bash
set -euo pipefail

AGENT="${1:-}"
if [[ -z "$AGENT" ]]; then
  echo "Usage: scripts/claim_next.sh agent1|agent2|qa" >&2
  exit 2
fi

LOCK="/tmp/beads-claim.lock"

# Atomic claim to avoid two agents claiming the same task
(
  flock -x 9

  ID="$(bd ready --json \
    | jq -r '.[] | select(.status=="open") | .id' \
    | head -n 1)"

  if [[ -z "${ID:-}" || "$ID" == "null" ]]; then
    echo "NO_OPEN_READY_TASKS"
    exit 0
  fi

  bd update "$ID" --status in_progress --assignee "$AGENT" >/dev/null
  echo "$ID"
) 9>"$LOCK"
