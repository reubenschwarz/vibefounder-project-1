Use 'bd' for task tracking.

## Source of truth
All work must be based on: docs/prd-psf-mvp.md

When creating/claiming Beads tasks:
- Read the PRD first.
- In every bead description include: PRD section references + acceptance criteria IDs + definition of done.

## Workflow rules

1. **Check for work**: Always run `bd ready --json` before starting.
2. **Claim before working**: `bd update <id> --status in_progress` — never start work on an unclaimed bead.
3. **Branch naming**: `bd-<id>-<slug>` (e.g. `bd-9ui-boot-ci-harness`).
4. **Open a PR** when done. Use the PR template (`.github/pull_request_template.md`).
5. **Do not merge** unless CI passes and at least 1 reviewer approves.
6. **QA checklist**: Every PR must satisfy `docs/qa-checklist.md`.
7. **CI**: `bash scripts/ci.sh` must exit 0. GitHub Actions runs this automatically on PRs to `main`.
8. **No direct pushes to main** — all changes go through PRs.

## Branch protection (manual setup required)

The repository owner must configure these settings in GitHub:
**Settings > Branches > Add branch protection rule** for `main`:
- [x] Require a pull request before merging
- [x] Require approvals (minimum 1)
- [x] Require status checks to pass before merging — add `ci` as required
- [x] Do not allow bypassing the above settings
