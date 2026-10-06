---
name: autonomous-implement
description: Execute ready Tickets with a configurable cost-aware team, dependency scheduling, independent proposals and chosen worktree/PR delivery.
disable-model-invocation: true
---

# Autonomous Implement

Act as the single Lead. Read [Lead instructions](references/roles/lead.md) from the installed bundle. Read [TEAM-POLICY.md](TEAM-POLICY.md) and [run contract](references/run-contract.md). Consume GitHub, Azure DevOps or local Tickets using configured project tools. Do not restart Planner's discovery.

## Harness capabilities

Require native multi-agent spawning and isolated candidate contexts. If unavailable, stop with the missing capability; do not silently run a single-agent substitute. Use installed named agents when available. Otherwise read the installed references/roles/<name>.md and pass those instructions to a native general subagent, explicitly identifying the role source. This is a native multi-agent workflow, not a fallback to sequential single-agent execution. Do not require exact tool names or provider IDs from another harness.

## Intake and handover

Read criteria, relevant code/instructions, dependencies, workspace status and checks. Resolve consequential blockers. Propose the smallest team and one run contract: roles, candidates, concurrency, gates, workspace, PR mode, permissions and limits. Reuse explicit user settings; ask only for missing/material choices. Before execution explicitly ask the user to choose local delivery, separate PRs, stacked PRs or one consolidated PR unless they already supplied that choice. Never assume stacking/consolidation from a batch request. Confirmation covers the batch and its dependent Tickets/fix loops.

Recommend lean (Developer + Reviewer), standard (add specialists with concrete value) or critical (explicit extra analysis/verification). Tester off means Developer owns tests/checks; profiles are recommendations, not mandatory bundles.

## Schedule

Maintain one dependency graph/stage table. Dispatch enabled specialists directly with task-local context; Lead-per-Ticket requires explicit selection for a complex subproject.

- Run ready unblocked Tickets up to confirmed concurrency.
- Run Architect/Security/UX concurrently only when inputs are independent. Resolve shared decisions before implementation.
- Use [independent proposals](references/proposals.md) for configured read-only candidates.
- Tester writes meaningful red tests first only when enabled. Developer implements/verifies; Reviewer independently checks the final diff.
- Start dependents when all required usable verified commits exist and permissions allow commits/integration. Never copy uncommitted changes between worktrees.
- Serialize overlapping writable paths or assign distinct ownership.

## Review and delivery

Default to two total Reviewer passes per Ticket; stop early on approval. Route actionable fixes to enabled owners without repeated confirmation. Rereview findings/deltas and invalidated evidence; broaden when shared behavior changes.

Use [worktrees and delivery](references/worktrees.md). Run required assembled-result checks and review integration effects before final delivery. Deployment requires separate authorization. Preserve unfinished/unrelated work.

Record concise results, verified versions, checks/manual gaps, permissions and integration order. Use [usage reporting](references/usage.md) when recording metrics. Unknown cost/token values stay unknown.

This skill orchestrates the current agent session through instructions. It does not provide a scheduler service, tracker API client, hard billing limiter or process sandbox.
