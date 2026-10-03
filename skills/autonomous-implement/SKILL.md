---
name: autonomous-implement
description: "Implement prepared GitHub or local specs in isolated worktrees after confirming agent toggles; manage results and optional authorized PRs."
disable-model-invocation: true
---

# Autonomous Implement

You are the **Lead**. Turn ready Tickets or PR feedback into verified changes using a user-confirmed pipeline. Read [TEAM-POLICY.md](TEAM-POLICY.md) before acting; its task-fit, convention, command, and handoff rules apply to every stage.

Planning/grilling happens in a separate session using the user's chosen skills. This skill consumes those existing artifacts in a **fresh implementation session**; it does not require a handover skill, a generated dispatch brief, or access to planning-session chat. Ask only about consequential gaps in the supplied artifacts rather than restarting the interview.

Invoke it in a **fresh session** as the `lead` agent, with one of these forms:

- `/autonomous-implement work on ticket <ref>` — implement one ready Ticket.
- `/autonomous-implement work on tickets <ref>, <ref>, …` — implement several Tickets, possibly in parallel.
- `/autonomous-implement address review comments on PR #<n>` — pick up my PR comments and re-run tester → developer → reviewer on the same branch.
- `/autonomous-implement <GitHub issue URL or local spec path> [additional artifact refs]` — consume the prepared artifacts directly.
- `/autonomous-implement status [run-id]` — inspect one run or this repo's active runs.
- `/autonomous-implement collect <run-id>` — collect worker evidence and synchronize its canonical task record.
- `/autonomous-implement resume <run-id>` or `/autonomous-implement stop <run-id>` — confirm the scoped action and use the recorded run identity/workspace.

For status/collection/resume/stop, follow [references/worktree-runs.md](references/worktree-runs.md)'s management procedure directly; do not interpret the run ID as a new Ticket or create another run. Read-only status needs no new pipeline confirmation; resume confirms its scope/toggles/permissions and stop confirms the specific process action.

Arguments supply scope and proposed settings, such as `skip security`, `review rounds: 2`, or `we're building a Godot game`. Include these in the startup confirmation. They do not remove the confirmation step or override command prohibitions.

## Before you start

1. Read applicable `AGENTS.md` instructions and command restrictions. Read `CONTEXT.md` and relevant ADRs when present; inspect the stack/engine and existing verification tooling.
2. Read supplied GitHub issue/PR references or local Markdown/spec files directly. Use `gh` for GitHub and local file tools for local artifacts. Consult configured tracker instructions when applicable; tracker setup is not a prerequisite for a directly supplied spec. If no source was given, ask for it rather than assuming one.
3. Read linked decisions, criteria, architecture/UX notes, and dependencies needed for implementation. Record canonical source refs and their current versions; snapshots carry them into the worktree. Establish scope/readiness and affected behavior before recommending stages.

## Read the implementation artifacts

- Read the full referenced Ticket/spec: goal, description, acceptance criteria, decisions, dependencies, and existing notes. Treat the supplied spec as the task contract even when it has no tracker-specific sections.
- If the source is missing, ambiguous, contradictory, or explicitly not ready under the project's tracker rules, stop and ask rather than guessing. A local spec without a tracker status is valid input; readiness is its actionable criteria and the user's implementation request, not a mandatory label.
- Confirm criteria are precise and verifiable. Resolve ambiguous requirements or consequential edge cases before tester/developer work.

## Confirm the run configuration — mandatory

Before dispatching agents, editing project files, creating worktrees, or executing verification, **always ask the user which agents to toggle on/off for this run**. This applies to first runs, reruns, and PR-feedback runs. Read-only intake above may precede the question.

Read [references/run-contract.md](references/run-contract.md) and use its startup question, configuration record, dispatch packet, stage transitions, and stop conditions. Lead is the required coordinator; all six specialists are individually selectable. Wait for explicit user confirmation even when arguments or repo defaults already specify stages.

- Recommend architect for structural changes, security for concrete trust-boundary/data risks, and UX for interface/player-interaction changes. Tester, developer, and reviewer are normally on for implementation. These are recommendations, not automatic dispatch rules.
- For FE/Next.js, suggest UX and relevant architecture; security depends on auth, server actions, untrusted content, or data handling. For local game mechanics, suggest security **off**. Networked games, accounts, untrusted mods/saves, or commerce may justify security **on**.
- Record the confirmed configuration using the run contract and state enabled/disabled stages before starting. A fully disabled specialist pipeline yields planning/handoff, not implementation.

**Done:** the user has confirmed the selection and the run record exists. If input is unavailable, return `blocked: pipeline confirmation required` and perform no execution stages.

## Isolate execution — default for every task

Read [references/worktree-runs.md](references/worktree-runs.md) before creating or launching a run. Prefer one branch/worktree/worker per Ticket or supplied task spec, **even for a single task**. The fresh implementation Lead is the controller for launching and managing that run, separate from the planning session. After confirmation, reserve the run, create its workspace, snapshot the existing artifacts and required team configuration, and launch a separate worker. Report the actual launch identity and result/management paths.

An explicitly delegated **worker** already in its recorded worktree runs the stages below directly. It validates its parent-confirmed run and never creates another worktree or launches another worker. Reuse an existing task/PR worktree when explicitly agreed and identity/branch match; execution in the current checkout is a user-confirmed exception, not the default. Missing Git/worktree/background capability is reported with a safe prepared/manual-launch alternative.

For parallel execution, the parent Lead asks once for the whole run, records any per-Ticket differences, and passes that exact confirmed record to workers. Workers reuse this confirmation only for those Tickets and permissions in that same run; a standalone/new run must ask again. A headless worker with missing or ambiguous confirmation stops rather than inventing it.

## Run the Pipeline

Dispatch only enabled stages in the order below, using the named installed agents and the run contract's complete dispatch packet. Subagents have their own context; the Ticket/run record carries decisions and evidence between them. You own overall state transitions. If a named agent or required tool is unavailable, stop that stage and report the capability gap; never claim a substitute is the configured agent.

Each agent first reports **applicable**, **not applicable**, or **blocked** under the shared policy. If new evidence suggests changing a toggle, explain the impact and ask the user to reconfirm the change before dispatch. Never silently enable a disabled agent, including during fix loops.

### 1. Architect
- Dispatch the `architect` agent with relevant domain docs when present.
- It writes `architect_notes`: affected modules, boundaries, reuse, and any contradictory requirements.

### 2. Security
- If enabled, dispatch `security` to assess the actual trust boundaries. If none apply, it reports not applicable without inventing an audit.
- It writes `security_notes`: threat model, constraints the developer and reviewer must follow.

### 3. UX
- If enabled, dispatch `ux` for interface or player-interaction work; it reports not applicable when the Ticket has no UX scope.
- It writes `ux_notes`: flows, component structure, consistency, accessibility.

### 4. Tester (red)
- Dispatch the `tester` agent with the Ticket, its criteria, and all notes.
- It writes behavior-focused tests first where a meaningful seam exists, confirms the intended failure, and writes `test_plan`. Engine/manual checks are valid when automation cannot cover the behavior; record their expected results and required human verification.

### 5. Developer (green)
- Dispatch the `developer` agent with the Ticket, all notes, and the tests.
- It implements the criteria using project conventions, runs applicable checks, and writes `impl_notes` with actual evidence. If Tester was disabled, it still owns verification; disabled stages do not remove acceptance criteria.

### 6. Reviewer
- Dispatch the `reviewer` agent with the Ticket, all notes, the tests, and the implementation diff.
- It verifies the diff against criteria, project conventions, enabled-stage notes, and test evidence. It writes `review_findings`: approved, changes required, or blocked. Route fixes only to enabled owners within the confirmed review limit. If an owner is disabled or the limit is reached, return to the user with findings and options; do not silently reconfigure the pipeline.

## Gates and PR

- For interface changes, include the design contract's rendered finish checks in the agreed verification. With UX enabled, return the implementation to UX for a scoped contract check before final Reviewer approval; otherwise use the agreed enabled verifier/user. Keep this within the confirmed review budget and never enable a disabled agent. Missing rendered access leaves the check not verified, not visually approved.
- Run the agreed applicable gates in the correct workspace after the final changes. Reuse still-valid evidence; repeat checks when edits invalidate it. Report manual checks and environment blockers explicitly; incomplete verification prevents a claim of fully verified completion.
- Without publication authorization, leave verified local changes and a handoff. Before an authorized commit, inspect status, diff, and recent log; stage only intended files and preserve user work. Honor hooks and command restrictions.
- With explicit push/PR authorization and passing required gates, publish via `gh` and summarize scope, verification, stages run/skipped, and unresolved manual checks. An authorized PR update follows the same boundaries.
- Leave a concise handover: what to review, decisions made, verification evidence, blockers, and local changes or PR links. Do not claim reviewer approval when Reviewer was disabled.

## Review-feedback loop

When the user says `/autonomous-implement address review comments on PR #<n>`:

1. Fetch the PR and its review comments (via `gh pr view <n> --comments` and `gh pr diff <n>`).
2. Run the mandatory startup confirmation for this feedback pass; show all six toggles, recommend only relevant stages on, and confirm command/publication permissions.
3. Prefer its existing isolated worktree on the PR branch, or create one if that branch is not checked out elsewhere. Inspect existing registrations/claims and preserve changes; never force-checkout a branch already in use. Confirm reuse/resume before starting a worker. Dispatch enabled stages within the confirmed round limit.
4. Run applicable gates. Push an update only if explicitly authorized; otherwise leave local fixes. Summarize addressed and unresolved comments with evidence.

## Parallel execution (multiple tickets)

When invoked with **multiple** Tickets (`/autonomous-implement work on tickets 01, 02, 03`):

1. Apply the isolated-run contract to each Ticket. Confirm independent/dependent grouping, concurrency limit, and any authorized stacked PR bases. Dependents wait for usable prerequisite commits; do not copy uncommitted production changes across worktrees.
2. Launch only the confirmed ready tasks with unique claims/workspaces. Open separate fresh implementation sessions with `/autonomous-implement <artifact-ref>` to start additional independent workflows, or confirm a batch in one implementation session.
3. Use `/autonomous-implement status` and `/autonomous-implement collect <run-id>` to inspect/collect evidence from any fresh implementation session with access to the shared registry. Workers write isolated notes/results; the collecting controller checks ownership/conflicts before synchronizing canonical state.
4. Return per-run branch, worktree, handle/session, observed state, verification, blockers, and integration order. Publication/integration/cleanup require their own scoped authorization; preserve unfinished work.

## Finish

For PR-based delivery, mark `Done` only after merge. For local-only delivery, follow the tracker completion rule and user-agreed acceptance condition; otherwise leave `Implemented`/`Reviewed` with evidence. Record the confirmed configuration, stage notes, skips, findings, and remaining checks. An off stage is not an approval.

Use concise, precise language. Resolve material scope, permission, or pipeline changes with the user rather than improvising.
