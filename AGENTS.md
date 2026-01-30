Use 'bd' for task tracking.

Rules:
- Always run: bd ready --json
- Claim a task before doing work: bd update <id> --status in_progress
- Work on a branch named: bd-<id>-<slug>
- Open a PR when done.
- Do not merge unless CI passes and the QA agent approves.
