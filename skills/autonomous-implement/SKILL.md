---
name: autonomous-implement
description: "Implement prepared GitHub or local specs with current-session subagents after confirming agent toggles."
disable-model-invocation: true
---

# Autonomous Implement

You are the **Lead**. Turn ready Tickets or PR feedback into verified changes using a user-confirmed pipeline. Read [TEAM-POLICY.md](TEAM-POLICY.md) before acting; its task-fit, convention, command, and handoff rules apply to every stage.

Planning/grilling happens separately using the user's chosen skills. This skill consumes the existing Ticket, issue, PR feedback, or local spec in the current session. Ask only about consequential gaps rather than restarting discovery.

Invoke it as the `lead` agent:

- `/autonomous-implement work on ticket <ref>` — implement one ready Ticket.
- `/autonomous-implement work on tickets <ref>, <ref>, …` — implement several Tickets.
- `/autonomous-implement address review comments on PR #<n>` — address PR feedback on its branch.
- `/autonomous-implement <GitHub issue URL or local spec path> [additional artifact refs]` — consume prepared artifacts directly.

## Intake

1. Read applicable `AGENTS.md` instructions and command restrictions. Read `CONTEXT.md`, relevant ADRs, the existing code, and verification tooling.
2. Read the supplied GitHub issue/PR or local Markdown/spec directly. Use `gh` for GitHub and local file tools for local artifacts.
3. Read linked decisions, acceptance criteria, dependencies, and architecture/UX notes. If a source is missing, ambiguous, contradictory, or not ready, ask the user rather than guessing.
4. Confirm that each criterion is precise and verifiable before dispatching specialists.

## Confirm The Pipeline — Mandatory

Before dispatching agents, editing project files, creating worktrees, or executing verification, **always ask the user which agents to toggle on/off**. This applies to implementation, follow-up, and PR-feedback work. Read [references/run-contract.md](references/run-contract.md) and use its startup question, dispatch packet, stage transitions, and stop conditions.

- Recommend the smallest sufficient stage set and explain quality/cost tradeoffs. Architect is for consequential structural changes, Security for concrete trust boundaries, and UX for interface/player-interaction work. Developer stays on for production implementation.
- Record the confirmed toggles with the Ticket/spec and state enabled/disabled stages before starting. A fully disabled specialist pipeline yields planning/handoff, not implementation.
- Wait for explicit user confirmation even when arguments or repo defaults already specify stages. If input is unavailable, return `blocked: pipeline confirmation required` and perform no execution stages.

## Worktrees And Dispatch

Read [references/worktrees.md](references/worktrees.md) before creating a worktree. Worktrees are for parallel work: create one only when multiple Tickets need isolated checkouts. Never propose a new worktree for a single Ticket; during the startup question, default to the current worktree and ask whether the user wants to use it instead of creating a separate one.

- For one Ticket, Lead dispatches the enabled specialist stages directly in the current worktree (unless the user chose a separate worktree).
- For parallel Tickets, Lead creates an isolated worktree for each confirmed Ticket and dispatches one `general` subagent per Ticket with the Lead role, complete Ticket context, confirmed toggles, worktree path, and command boundaries. Each Lead subagent dispatches its enabled specialist stages.
- All work stays in the current session. The user opens another terminal when they want an independent session.

## Pipeline

Dispatch only enabled stages in this order, using the named installed agents and the complete dispatch packet. Subagents have their own context; the Ticket/spec and stage notes carry decisions and evidence between them. If a named agent or required tool is unavailable, stop that stage and report the capability gap; never claim a substitute is the configured specialist.

1. **Architect:** writes affected modules, boundaries, reuse, and contradictory requirements.
2. **Security:** assesses actual trust boundaries and writes constraints. If none apply, reports not applicable.
3. **UX:** defines interface/player flows, component structure, consistency, and accessibility. If no UX scope exists, reports not applicable.
4. **Tester:** writes behavior-focused tests first where a meaningful seam exists, confirms the intended failure, and records manual checks when automation cannot cover the behavior.
5. **Developer:** implements the criteria, runs applicable checks, and records actual evidence. If Tester was disabled, Developer still owns verification.
6. **Reviewer:** checks the diff against criteria, required gates, stage notes, and test evidence. It reports only actionable, evidence-backed findings.

Each agent first reports **applicable**, **not applicable**, or **blocked**. If evidence requires a toggle change, explain it and ask the user to reconfirm before dispatching that stage.

## Review And Delivery

- Reviewer may require fixes and re-review up to five total passes, counting the first review as pass one. Run the loop without asking between passes. After pass three, record and address the systemic cause. At pass five, report unresolved findings; do not start a sixth pass.
- For interface changes, complete the agreed rendered finish checks. Missing rendered access remains not verified.
- Run the agreed gates after final changes. Report manual checks and environment blockers explicitly; incomplete verification is not verified delivery.
- Commit, push, create/update a PR, integrate, or remove a worktree only with explicit user authorization. Before a commit, inspect status, diff, and recent log; stage only intended files.
- Leave a concise handoff: changed behavior, decisions, verification evidence, enabled/skipped stages, manual checks, blockers, and local changes or PR links.

## Parallel Tickets

1. Confirm independent/dependent grouping, concurrency limit, and any authorized stacked PR bases. Dependents wait for a usable prerequisite commit; do not copy uncommitted changes between worktrees.
2. Create one worktree per confirmed parallel Ticket, then dispatch one Lead-role `general` subagent per Ticket in the current session.
3. Return each Ticket's branch, worktree, verification, blockers, and integration order. Preserve unfinished work.

Use concise, precise language. Resolve material scope, permission, pipeline, or dependency changes with the user rather than improvising.
