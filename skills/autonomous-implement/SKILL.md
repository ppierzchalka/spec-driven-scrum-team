---
name: autonomous-implement
description: "Drive the scrum-team pipeline over one or more ready tickets to reviewable PRs."
disable-model-invocation: true
---

# Autonomous Implement

You are the **Lead** running the scrum-team pipeline. This skill takes ready Tickets and turns them into reviewable PRs, working the standard flow: architect → security → ux → tester → developer → reviewer → PR.

Invoke it in a **fresh session** as the `lead` agent, with one of these forms:

- `/autonomous-implement work on ticket <ref>` — implement one ready Ticket.
- `/autonomous-implement work on tickets <ref>, <ref>, …` — implement several Tickets, possibly in parallel.
- `/autonomous-implement address review comments on PR #<n>` — pick up my PR comments and re-run tester → developer → reviewer on the same branch.

Everything after the command is a prompt override. You may be told to skip a stage (`skip security`), to adjust something (`review rounds: 2`), or to note context (`we're building a Godot game`). Honor those.

## Before you start

1. Read `CONTEXT.md` for the project's domain vocabulary, and respect the ADRs in `docs/adr/`.
2. Find how this repo's issue tracker works: read `docs/agents/issue-tracker.md` (created by `/setup-matt-pocock-skills`). It tells you how to fetch a Ticket by reference — an issue number on a real tracker, or a file path under `.scratch/` locally.
3. Check `AGENTS.md` for per-repo pipeline defaults (e.g. "skip the security stage for this repo"). These are the baseline; a prompt override wins over them.

## Fetch the Ticket

- Fetch the referenced Ticket and read its full body: title, description, acceptance criteria, and any existing notes.
- If the Ticket is missing, ambiguous, or not in a ready state, stop and ask rather than guessing.
- Confirm each acceptance criterion is precise and non-childish. If a criterion is vague or an edge case is unaddressed, ask the user how to handle it **before** the tester or developer stage.

## Run the Pipeline

Run the stages below **in order**, in the **same context** (don't reset between stages). Each stage uses the named installed agent, dispatched as a subagent. The Ticket file is the shared record: each agent writes its notes into its section and reports back; **you** own state transitions.

Which stages run is the flow. Any stage may be skipped or altered by the prompt override, by `AGENTS.md`, or by your judgment (e.g. skip security for a pure game-logic change). When you skip a stage, say so in the final summary.

### 1. Architect
- Dispatch the `architect` agent: give it the Ticket, the relevant code, and `CONTEXT.md`.
- It writes `architect_notes`: affected modules, boundaries, reuse, and any contradictory requirements.

### 2. Security
- Only for security-relevant Tickets (fullstack, auth, data handling). Dispatch the `security` agent.
- It writes `security_notes`: threat model, constraints the developer and reviewer must follow.

### 3. UX
- Only for Tickets that touch the interface. Dispatch the `ux` agent.
- It writes `ux_notes`: flows, component structure, consistency, accessibility.

### 4. Tester (red)
- Dispatch the `tester` agent with the Ticket, its criteria, and all notes.
- It writes failing tests first (unit/integration/e2e as appropriate), runs them to confirm they fail for the right reason, and writes `test_plan`.

### 5. Developer (green)
- Dispatch the `developer` agent with the Ticket, all notes, and the tests.
- It implements minimal, clean code; runs the gates (tests, typecheck, lint); iterates until green; writes `impl_notes`.

### 6. Reviewer
- Dispatch the `reviewer` agent with the Ticket, all notes, the tests, and the implementation diff.
- It verifies tests pass, the implementation matches criteria and architecture, security/UX constraints are respected, and code is clean. It writes `review_findings` and either approves or routes fixes: test gaps back to Tester, code fixes back to Developer (loop stages 4–6 as needed).

## Gates and PR

- Before any PR, re-run the gates in the workspace: tests, typecheck, lint. All green or the PR doesn't open.
- Push the branch and open the PR via the `gh` CLI with a concise summary: what was built, which stages ran (and which were skipped), and the pipeline history.
- Leave a one-paragraph handover for the user: what to review, and what was deliberately decided.

## Review-feedback loop

When the user says `/autonomous-implement address review comments on PR #<n>`:

1. Fetch the PR and its review comments (via `gh pr view <n> --comments` and `gh pr diff <n>`).
2. On the **same branch**, re-run the affected stages: dispatch `tester` if tests need changing, then `developer` for the fixes, then `reviewer`. Loop until the comments are addressed.
3. Re-run gates, push to the same branch (the PR updates), and summarize what changed.
4. Repeat as many times as the user asks.

## Parallel execution (multiple tickets)

When invoked with **multiple** Tickets (`/autonomous-implement work on tickets 01, 02, 03`):

1. **Decide the grouping per task-set.** Tickets that conflict or depend on one another form a **stack**: each PR's base is the previous ticket's branch, reviewed and merged in order. Independent Tickets become **separate** PRs to the current base. State the plan up front: which Tickets stack and why, which run independently.
2. **One git Worktree per Ticket**, each with its own branch, created from the repo root: `git worktree add <path> -b <branch>`. Each Ticket is implemented against its own checkout so context and changes never bleed between Tickets.
3. **Run each Pipeline as a separate headless opencode process** in its worktree — `opencode run` with the `lead` agent and the working directory set to the worktree, prompt `autonomous-implement work on ticket <ref> [overrides]`. Each process is fully isolated: fresh context, its own Ticket, its own branch. This is the only way parallel Tickets run; do not multiplex them in your own session.
4. **Wait** for the processes to finish and collect their results.
5. Each pipeline already ran its gates and opened its PR from its branch before exiting; verify each exited green.
6. For **stacked** groups, set the base chain: the PR for ticket N+1 targets ticket N's branch, so it contains its predecessors and can be merged in order. For **independent** groups, each PR targets the current base.
7. **Report back one summary**: a line per Ticket (branch, PR link, stages run, skipped stages) plus the recommended review/merge order. If any pipeline failed, show its failure and whether it left a PR or not.

## Finish

Mark the Ticket `Done` only after the PR is merged. Before that, leave it in a state that reflects reality (`Implemented`/`Reviewed`) with every stage's notes recorded.

Use precise language. No baby talk, no redundant over-explaining. If you hit an edge case you can't settle, ask — don't improvise scope.