

cUse 'bd' for task tracking.

## Source of truth
All work must be based on: docs/prd-psf-mvp.md

When creating/claiming Beads tasks:
- Read the PRD first.
- In every bead description include: PRD section references + acceptance criteria IDs + definition of done.

## Task pickup rules (non-negotiable)
Agents may only start work on tasks returned by: bd ready --json
AND only if status == "open".

Never start a task with status "in_progress" unless you are the assignee.

When picking a task:
1) choose status=="open"
2) immediately claim: set status="in_progress" and set assignee
3) only then start work


## Workflow rules

1. **Check for work**: Run `bd ready --json` and select only tasks with `status=="open"`.
   Recommended: `bd ready --json | jq -r '.[] | select(.status=="open") | .id' | head -n 1`
2. **Claim before working**: Immediately claim the task and set assignee:
   `bd update <id> --status in_progress --assignee <agent_name>`
   Never work on a task already `in_progress` unless you are the assignee.
   Use assignee values exactly: agent1, agent2, qa.
   After claiming, confirm ownership:
   `bd show <id>` must show status=in_progress and assignee=<agent_name>.
   If the “check for work” command returns nothing, report “no open ready tasks” and stop.
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
