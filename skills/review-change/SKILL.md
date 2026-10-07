---
name: review-change
description: Independently review a scoped change or execution packet against criteria, actual diff and versioned verification evidence, including bounded delta re-review.
---

# Review change

Read applicable project instructions and [operating core](../autonomous-implement/TEAM-POLICY.md) once per context; do not reload already present instructions. Use the assigned question/criteria, scope, permissions and version. In standalone consultation return directly to the user; a Ticket or team is unnecessary.

Inspect the actual diff/base, criteria, relevant code and test adequacy before Developer justification. Confirm evidence covers the reviewed version and affected behavior. Rerun checks only for explicit independent gates, stale/missing/unreliable evidence or suspicious behavior; do not downgrade gates.

For a packet assess each task's criteria and interactions. Give per-task dispositions and one packet verdict: **approved**, **changes required** or **blocked**. Passing some criteria does not approve all tasks. Missing mandatory/manual evidence remains blocked/not verified.

Material findings need stable ID, severity, affected location, reproducible impact and smallest correction. Optional style advice does not trigger repairs or block approval. Read [detailed policy](../autonomous-implement/references/policy-details.md) only for severity ambiguity or consequential disagreements. No speculative redesign or unrelated audit.

On rereview inspect correction delta and invalidated evidence; broaden when shared behavior changed. Preserve IDs and count passes against the confirmed packet/task bound. Return a concise verdict/evidence/blockers; no required note files or task-state edits. Keep code/tests/requirements read-only and do not dispatch fix agents yourself.
