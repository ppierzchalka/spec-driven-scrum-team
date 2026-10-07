# Run contract

## One handover per run

Reuse explicit user settings and project conventions. Propose missing/material choices once; no unchanged reconfirmation per Ticket or repair round.

Record:
- Scope: references, criterion IDs, dependencies/readiness.
- Team: all six execution roles on/off with per-Ticket exceptions; Lead on, Analyst outside execution.
- Proposals: read-only roles, candidates per role (default 1; usually 2 when selected), distinct lenses, evaluator (Lead or available explicitly selected read-only role), criteria and one evaluation round.
- Scheduling: Ticket concurrency, independent analysis stages, shared-file ownership and separate proposal concurrency limit.
- Workspace: one Ticket/current checkout; concurrent Tickets/isolated worktrees; bases, paths, branches.
- Delivery: ask explicitly before execution: local, separate PRs, stacked PRs or one consolidated PR? Record target/base and integration order. Reuse a choice already given; never infer stacking/consolidation from multiple Tickets.
- Gates: focused/assembled checks, manual owners, two total review passes by default.
- Permissions: scoped commit/push/PR/integration/deployment/cleanup actions and prohibitions.
- Limits: proposal/dispatch/review bounds and optional cost ceiling, stating whether runtime can enforce it.

Example: "Developer + Reviewer; Architect x2/Lead evaluation; 3 Ticket worktrees; consolidate one PR; commit/push/PR authorized; no deployment".

Explicit instructions already authorize those exact choices/actions. Missing material settings get one focused question; silence is never publication permission. Changes to scope/roles/gates/model/provider or destructive actions outside authorization require a focused decision.

## Minimal dispatch

Give assigned criteria/behavior, role/output, Ticket/spec references, relevant paths and dependency contracts, workspace/base/version, constraints, checks/evidence, permission boundaries, remaining limits and next owner. Link shared policy/specs instead of pasting history. Include only relevant prior decisions; agents may inspect necessary source.

Track pending/running/complete/not-applicable/blocked/skipped with evidence. Developer off means no production changes; Reviewer off means unreviewed. Mandatory checks failed/not run prevent verified delivery.

## Dependency frontier

Check unknown IDs, cycles, missing external prerequisites and overlapping writable paths. Only pending Tickets with every required usable verified prerequisite commit may run. Block descendants of blocked Tickets, not unrelated work. Recompute after each completion rather than waiting for a full wave. Bound candidate fan-out separately from active Tickets.

## Delivery changes on demand

The user may request stacking/consolidation later. Lead inspects current branches, commits and PR bases, proposes affected integration order/checks, and applies only the authorized change. Revalidate the assembled diff. Do not close existing PRs, delete branches or force-push without that distinct authorization. Preserve original artifacts until cleanup is authorized.
