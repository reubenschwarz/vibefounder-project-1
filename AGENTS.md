Use 'bd' for task tracking.
## Source of truth
All work must be based on: docs/prd-psf-mvp.md

When creating/claiming Beads tasks:
- Read the PRD first.
- In every bead description include: PRD section references + acceptance criteria IDs + definition of done.


Rules:
- Always run: bd ready --json
- Claim a task before doing work: bd update <id> --status in_progress
- Work on a branch named: bd-<id>-<slug>
- Open a PR when done.
- Do not merge unless CI passes and the QA agent approves.
