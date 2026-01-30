# QA Checklist

Every PR must satisfy these checks before merge.

## Automated (CI)
- [ ] `scripts/ci.sh` exits 0
- [ ] No secrets detected in tracked files
- [ ] Shell scripts pass shellcheck
- [ ] Markdown files are non-empty and valid UTF-8

## Manual
- [ ] Bead was claimed (`in_progress`) before any work started
- [ ] Branch follows naming convention: `bd-<id>-<slug>`
- [ ] Bead description includes PRD section references and acceptance criteria IDs
- [ ] Changes match bead scope — no unrelated work included
- [ ] At least 1 reviewer has approved the PR
- [ ] CI status check passed on the PR
