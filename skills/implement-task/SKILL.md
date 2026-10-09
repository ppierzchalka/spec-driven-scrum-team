---
name: implement-task
description: Implement one ready task or a bounded execution packet, preserving criteria, test ownership and final-version verification.
---

# Implement task

Read applicable project instructions and [operating core](../autonomous-implement/TEAM-POLICY.md) once per context; do not reload already present instructions. Use the assigned question/criteria, scope, permissions and version. In standalone consultation return directly to the user; a Ticket or team is unnecessary.

Use the packet as the execution contract; do not reconstruct the batch. Read relevant code/tests and workspace status, preserve user edits and implement the smallest coherent change using existing patterns.

Own production code and checks; own tests unless explicit test-author mode assigns them elsewhere. Before a defect fix, establish the smallest red reproducer and retain discovered interaction failures as lasting behavior regressions. Check action ordering, focus and observable completion rather than increasing sleeps to compensate for incorrect interaction. Use the project's TDD procedure when useful/required, without a mandatory additional agent or skill dependency. Inspect effective script side effects before execution.

Run a baseline only to distinguish existing failures/establish behavior or satisfy an explicit gate. Verify final code with agreed focused checks. Review your diff for unintended changes/secrets and fix introduced scoped defects. Re-run invalidated checks; do not repeat reliable unchanged evidence.

For packets, preserve separate task IDs/criteria and dependencies. Verify prerequisites before dependent edits; an internal plan step is not permission to start a blocked task. Return coverage/outcome for each task and final version/check evidence. Stop for consequential unknowns or ownership conflicts.

A concise handoff is enough; Lead persists result/status once. No publication beyond authorization, no claimed Reviewer approval. Standalone implementation uses the user's scoped request without recruiting a team.
