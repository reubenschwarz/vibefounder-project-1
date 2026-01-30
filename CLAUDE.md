# Claude Code instructions for this repo

Source of truth: docs/prd-psf-mvp.md

## Task system (Beads)
- Use `bd` for tracking, but do NOT pick tasks directly from `bd ready`.
- The only allowed way to take work is:

  scripts/claim_next.sh <agent_name>

Where <agent_name> is one of: agent1, agent2, qa.

If it prints `NO_OPEN_READY_TASKS`, stop and report that there is no available work.

After claiming a task, run:
- `bd show <id>` to confirm status=in_progress and assignee matches you.

## Git workflow
- Branch name: `bd-<id>-<slug>`
- Open a PR for every task.
- Never merge unless CI passes and QA approves.
- No direct pushes to main.
