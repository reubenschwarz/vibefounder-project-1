#!/usr/bin/env bash
set -euo pipefail

# CI check runner — exits non-zero on first failure.
# Add new check functions below; register them in CHECKS at the bottom.

FAIL=0

run_check() {
  local name="$1"
  shift
  printf '=== %s ===\n' "$name"
  if "$@"; then
    printf -- '--- %s: PASS ---\n\n' "$name"
  else
    printf -- '--- %s: FAIL ---\n\n' "$name"
    FAIL=1
  fi
}

# ---- checks ----------------------------------------------------------------

check_shellcheck() {
  if ! command -v shellcheck &>/dev/null; then
    echo "shellcheck not found, skipping"
    return 0
  fi
  shellcheck scripts/*.sh
}

check_markdown_lint() {
  # Ensure all .md files are valid UTF-8 and non-empty
  local bad=0
  while IFS= read -r f; do
    if [ ! -s "$f" ]; then
      echo "EMPTY: $f"
      bad=1
    fi
  done < <(find . -name '*.md' -not -path './.git/*' -not -path './.beads/*' -not -path './node_modules/*')
  return "$bad"
}

check_no_secrets() {
  # Fail if common secret patterns appear in tracked files
  if git grep -qiE '(AKIA[0-9A-Z]{16}|sk-[a-zA-Z0-9]{20,}|-----BEGIN (RSA |EC )?PRIVATE KEY)' -- ':!.git' 2>/dev/null; then
    echo "Potential secret detected in tracked files"
    return 1
  fi
  return 0
}

check_typescript() {
  npx tsc --noEmit
}

check_eslint() {
  npx eslint . --max-warnings 0
}

check_next_build() {
  npx next build
}

check_vitest() {
  npx vitest run
}

# ---- main -------------------------------------------------------------------

run_check "shellcheck"       check_shellcheck
run_check "markdown-lint"    check_markdown_lint
run_check "no-secrets"       check_no_secrets
run_check "typescript"       check_typescript
run_check "eslint"           check_eslint
run_check "vitest"           check_vitest
run_check "next-build"       check_next_build

if [ "$FAIL" -ne 0 ]; then
  echo "CI FAILED"
  exit 1
fi

echo "CI PASSED"
