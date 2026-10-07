---
name: autonomous-implement
description: Execute ready Tickets with a configurable cost-aware team, dependency scheduling, independent proposals and chosen worktree/PR delivery.
disable-model-invocation: true
---

# Autonomous Implement

Act as the single Lead. Read [Lead instructions](references/roles/lead.md) from the installed bundle. Read [TEAM-POLICY.md](TEAM-POLICY.md) and [run contract](references/run-contract.md) once per context. Consume GitHub, Azure DevOps or local Tickets using configured project tools. Do not restart Analyst's discovery.

## Harness capabilities

Require native multi-agent spawning and isolated candidate contexts. If unavailable, stop with the missing capability; do not silently run a single-agent substitute. Use installed named agents when available. Otherwise read the installed references/roles/<name>.md and pass those instructions to a native general subagent, explicitly identifying the role source. This is a native multi-agent workflow, not a fallback to sequential single-agent execution. Do not require exact tool names or provider IDs from another harness.

## Intake and handover

Read one or more refined tasks with mapped ready-to-implement status (or an equivalent explicit user-supplied ready contract), criteria, relevant code/instructions, dependencies, workspace status and checks. Preserve task identities. No separate Plan session is required: prepare proportionate technical execution details during intake, consulting Architect when enabled. Return consequential requirement gaps to Analyst/user instead of implementing guesses. Resolve consequential blockers. Propose the smallest team and one run contract: roles, candidates, concurrency, gates, workspace, PR mode, permissions and limits. Reuse explicit user settings; ask only for missing/material choices. Before execution explicitly ask the user to choose local delivery, separate PRs, stacked PRs or one consolidated PR unless they already supplied that choice. Never assume stacking/consolidation from a batch request. Confirmation covers the batch and its dependent Tickets/fix loops.

Classify at intake: small (bounded, settled behavior, local surface), standard (multiple boundaries/dependencies), or complex/high-risk (uncertain design, migrations/security or broad integration). Classification chooses context depth and recommended roles, not permission to bypass requirements or gates. Reassess on new evidence; do not expand team/candidates without agreed configuration. Small still uses Developer + independent Reviewer by default.

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

Read [worktrees and delivery](references/worktrees.md) only for isolation, dependency integration or PR delivery; a single local task needs no delivery reference. Run required assembled-result checks and review integration effects before final delivery. Deployment requires separate authorization. Preserve unfinished/unrelated work.

Record concise results, verified versions, checks/manual gaps, permissions and integration order. Read [usage reporting](references/usage.md) only when metrics/budgets are requested or available runtime usage is relevant. Do not create empty usage reports. Unknown cost/token values stay unknown.

This skill orchestrates the current agent session through instructions. It does not provide a scheduler service, tracker API client, hard billing limiter or process sandbox.

Update the same task records using configured lifecycle mappings: in-progress on dispatch, in-review at review, done only after the configured definition of done. Track blocked separately and never dispatch unresolved prerequisites. Preserve unrelated labels and distinguish local completion, PR delivery and merge. See [artifact contract](../project-setup/references/artifacts.md).

## Compact default protocol

One task packet contains criteria, relevant paths/base, role, checks and permission boundaries. Specialists return short chat results; Lead owns one task execution/result section including agreed configuration, class, checks/version, review verdict and remaining gates. Reuse existing task/spec text. No mandatory separate run record, stage-note files, empty fit headers or duplicated handoffs. For batches maintain only the needed dependency/stage table and shared run settings. Detailed artifacts remain available when useful or required. Preserve resumability and lifecycle statuses.
