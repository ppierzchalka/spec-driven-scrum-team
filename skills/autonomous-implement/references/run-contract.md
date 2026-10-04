# Pipeline Contract

Lead reads this before asking for confirmation and before dispatching specialists.

## Startup Question

After read-only intake, present all six rows with task-specific reasons:

```text
Before I start, which agents should be on/off for this pipeline?

Agent       Proposed   Reason for this task
architect   on/off     ...
security    on/off     ...
ux          on/off     ...
tester      on/off     ...
developer   on/off     ...
reviewer    on/off     ...

Lead stays on to coordinate.
Scope: Tickets/PR and acceptance criteria ...
Checks: required automated gates ...; manual checks and verifier ...
Workspace: one Ticket → use the current worktree by default; do you want to use it, or
  create a separate worktree/branch instead? Parallel Tickets → one isolated
  worktree/branch per Ticket ...
Parallel work: Ticket grouping, dependencies, and concurrency ...
Review: up to 5 total Reviewer passes, including the initial review
Commands: inherited forbidden actions ...; any additional restrictions?
Publication: commit off; push off; create/update PR off

Confirm this proposal or list your changes. If you want publication,
explicitly identify which actions and branch/PR/repository are authorized.
```

Use one compact interaction where possible. An incomplete answer requires a focused follow-up; it never grants publication permission or overrides a command prohibition.

## Dispatch Packet

Every stage receives:

1. Ticket/spec reference, full criteria, and assigned role/output.
2. Confirmed toggles and the role's bounded task.
3. Worktree or checkout path, relevant paths/callers, and user changes to preserve.
4. Current specialist notes, recorded user decisions, resolved findings, and blockers.
5. Exact required checks, manual verification owners, command prohibitions, and publication permissions.
6. Remaining review budget and the next enabled owner.

Read-only discovery can fill technical context. It cannot invent requirements, user confirmation, or permissions.

## Stage Transitions

- Each stage is pending, complete, not applicable, or blocked. Record actual outcomes and evidence with the Ticket/spec or final handoff. A disabled stage is `skipped: user configuration`; it is not approval.
- Advance only when the next stage has the information it needs and unresolved blockers do not invalidate it.
- A review pass is one Reviewer review. The initial review is pass one. Continue fix/re-review work without interruption while actionable findings remain, up to five passes. Stop early on approval.
- After pass three, record why earlier passes missed remaining findings, correct the systemic cause, and continue if no user decision is needed.
- After pass five, report remaining findings. Do not begin a sixth pass or claim approval.
- New requirements, changed toggles, new mandatory gates, conflicting decisions, missing tools, or new approval needs go to the user.
- With Tester off, Developer performs the agreed verification. With Reviewer off, report implementation as unreviewed. With Developer off, do not make production fixes.
- Mandatory gate failures or unavailable gates prevent a verified-delivery claim. Keep manual checks pending until the named verifier supplies evidence.

## Parallel Dispatch

Lead confirms the batch once, recording per-Ticket differences in the dispatch packet. For each independent Ticket, create the agreed worktree and dispatch a Lead-role `general` subagent in the current session. That subagent uses the supplied packet and dispatches only the enabled specialists for its Ticket. Dependent Tickets wait for their prerequisite commit or branch.
