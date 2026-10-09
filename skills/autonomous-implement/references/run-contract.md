# Run contract

## One handover per run

Reuse explicit user settings and project conventions. Setup may record execution preferences in the configured docs/agents/execution.md (or an existing equivalent). Defaults are suggestions, not publication authorization; invocation overrides them. Show only material decisions/differences and record the effective contract once. Propose missing/material choices once; no unchanged reconfirmation per Ticket or repair round.

Record once in the existing task execution section (or shared batch record when needed); use compact inline defaults, omit inapplicable fields:
- Task class: small / standard / complex-high-risk with a short reason; honor explicit user roles/gates.
- Scope: references, criterion IDs, dependencies/readiness.
- Team: effective enabled/off roles with per-Ticket exceptions, Tester mode test-design (default) or explicitly test-author; Lead on, Analyst outside execution.
- Proposals: read-only roles, candidates per role (default 1; usually 2 when selected), distinct lenses, evaluator (Lead or available explicitly selected read-only role), criteria and one evaluation round.
- Scheduling: task-to-packet mapping, review units/bounds, writable-worker concurrency, independent analysis stages, shared-file and output-mutating check ownership (including build/pack) and separate proposal concurrency limit.
- Workspace: one task/packet current checkout; concurrent packets isolated worktrees; bases, paths, branches.
- Delivery: ask explicitly before execution: local, separate PRs, stacked PRs or one consolidated PR? Record target/base and integration order. Reuse a choice already given; never infer stacking/consolidation from multiple Tickets.
- Gates: focused/assembled checks, manual owners, two total review passes by default.
- Permissions: scoped commit/push/PR/integration/deployment/cleanup actions and prohibitions.
- Limits: proposal/dispatch/review bounds and optional cost ceiling, stating whether runtime can enforce it.

Example: "Developer + Reviewer; Architect x2/Lead evaluation; 3 Ticket worktrees; consolidate one PR; commit/push/PR authorized; no deployment".

Explicit instructions already authorize those exact choices/actions. Missing material settings get one focused question; silence is never publication permission. Changes to scope/roles/gates/model/provider or destructive actions outside authorization require a focused decision.

## Minimal dispatch

Give assigned criteria/behavior, role/output, Ticket/spec references, relevant paths and dependency contracts, workspace/base/version, constraints, checks/evidence, permission boundaries, remaining limits and next owner. Link shared policy/specs instead of pasting history. Include only relevant prior decisions; agents may inspect necessary source.

Track pending/running/complete/not-applicable/blocked/skipped with evidence. Developer off means no production changes; Reviewer off means unreviewed. Mandatory checks failed/not run prevent verified delivery.

On interruption, distinguish assertion failure, command timeout/abort and native session cancellation. Preserve partial work; reconcile the workspace, owned children/outputs, completed evidence and remaining gates. Inspect stale permission/session state through supported read-only diagnostics; sanitize evidence and report unavailable capabilities. Resume only the smallest unfinished operation after ownership and permissions are confirmed; stop on unresolved state rather than blindly retrying. Permission-reply 404s are a diagnostic lead, not a proven cancellation cause; keep runtime root cause unresolved without direct evidence. Prompts cannot fix runtime permission lifecycle; restart, permission bypass or model changes require separate authorization under existing restrictions.

## Dependency frontier

Check unknown IDs, cycles, missing external prerequisites and overlapping writable paths. Only pending Tickets with every required verified prerequisite may run. Same-checkout prerequisites can use verified local state after required intermediate gates; cross-worktree prerequisites require usable verified commits and integration scope. Block descendants of blocked Tickets, not unrelated work. Recompute after each completion rather than waiting for a full wave. Bound candidate fan-out separately from active Tickets.

## Delivery changes on demand

The user may request stacking/consolidation later. Lead inspects current branches, commits and PR bases, proposes affected integration order/checks, and applies only the authorized change. Revalidate the assembled diff. Do not close existing PRs, delete branches or force-push without that distinct authorization. Preserve original artifacts until cleanup is authorized.

A role dispatch links or includes the compact core policy; do not reread it within the same context. Specialists need their assigned task/constraints, not the entire batch contract. Lead persists their final evidence once. Detailed reports and metrics are opt-in, not automatic.

Group tasks only with compatible scope/permissions/ownership and delivery diffs. Each task retains individual criteria, lifecycle, disposition and remaining gates; a packet verdict never makes partially satisfied tasks done. Changing packet boundaries invalidates affected checks/review and requires a revised material handover choice.
