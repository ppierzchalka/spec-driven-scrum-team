# Pipeline run contract

Lead reads this before startup confirmation and before launching workers. This is the authoritative configuration/dispatch contract; role prompts and the main skill refer here.

## Startup question

After read-only intake, present all six rows with task-specific reasons. Defaults/arguments supply the proposal; none count as the user's answer.

```text
Before I start, which agents should be on/off for this run?

Agent       Proposed   Reason for this task
architect   on/off     ...
security    on/off     ...
ux          on/off     ...
tester      on/off     ...
developer   on/off     ...
reviewer    on/off     ...

Lead stays on to coordinate.
Scope: Tickets/PR and acceptance criteria ...
Models: current per-agent selections/inherited defaults; any suitability gaps ...
Checks: required automated gates ...; manual checks and verifier ...
Execution: isolated task worktree; proposed base/branch/path; background or separate-terminal worker; concurrency/dependencies ...
Review: up to 2 fix rounds unless you choose another limit
Commands: inherited forbidden actions ...; any additional restrictions?
Publication: commit off; push off; create/update PR off

Confirm this proposal or list your changes. If you want publication,
explicitly identify which actions and branch/PR/repository are authorized.
```

Use the available question tool or a plain conversational question. Ask in a single compact interaction where possible; do not make the user reapprove routine scoped edits/checks. An answer such as "confirm" accepts the fully displayed proposal. An incomplete or ambiguous answer needs a focused follow-up; it never implies permission to publish or run a prohibited action.

## Recorded configuration

Store a readable equivalent of this structure in `pipeline_config` or an agreed run record. It is separate from the installer's per-agent model settings in `team.config.json`. Values shown here are examples, not a confirmed run:

For a directly supplied local spec without tracker sections, keep the source requirements intact and store configuration/stage outcomes in a separate per-run record. No extra source-artifact format or preparation step is required. At collection, report/link the results rather than rewriting the planning spec unless the user requested annotations.

```yaml
run_id: ticket-42-pass-1
scope:
  tickets: [42]
  criteria: [AC1, AC2]
workspace: /absolute/target/path
base_ref: recorded-base-commit
agents:
  architect: true
  security: false
  ux: false
  tester: true
  developer: true
  reviewer: true
models: {} # actual installed choices per enabled agent; flag inherited/unknown selections
checks:
  required: ["exact project command/check agreed for this run"]
  manual: [] # check, expected result, verifier, current status
review_fix_round_limit: 2
execution: single # or explicit dependency/parallel groups
workspace_mode: isolated-worktree # current-checkout only by explicit user exception
execution_role: controller # delegated worker reuses the prepared workspace, never respawns
control_root: /absolute/shared/run-records
artifact_sources: ["GitHub issue/spec URL or absolute local path, with version"]
artifact_snapshots: ["absolute worker-accessible input paths"]
worker_output: /absolute/task-worktree/run-output
command_policy:
  sources: [AGENTS.md]
  forbidden: ["effective inherited and user-specified prohibitions"]
  approval_required: ["effective project/shared-policy requirements"]
publication:
  commit: false
  push: false
  create_or_update_pr: false
  target: null # specific branch/repository/PR if authorized
confirmation:
  source: current-user-conversation # or delegated-parent-run
  decision: "actual user decision and any changes to the proposal"
```

Record per-Ticket differences for multi-Ticket runs, review counters, stage status, finding IDs, and scope/gate changes alongside this configuration. Read actual model assignments from installed agent definitions/project configuration rather than assuming installer recommendations have been applied. An unset agent inherits the current model; record inherited/unknown when it cannot be resolved. Confirm suitability for design/reasoning-heavy work and request explicit reconfiguration if needed. Resolve commands from the project and preserve their exact arguments/cwd. Approval for one target/action does not authorize another. Disabled agents remain installed and can retain model settings; their toggle controls dispatch for this run only.

## Dispatch packet

Every stage receives:

1. Run/Ticket ID, full criteria, readiness, and assigned role/output section.
2. Confirmed toggles and that role's bounded task; applicable project instructions and policy references.
3. Workspace/base/diff reference, relevant paths/callers, and existing user changes to preserve.
4. Current enabled-stage notes, recorded user decisions, resolved/superseded findings, and known blockers. Do not require nonexistent notes from disabled stages.
5. Exact required checks, manual verification owners, available tools, command prohibitions, approvals, and publication targets.
6. Remaining review budget, expected shared stage-result format, and the next enabled owner.

If the packet is missing information essential to the stage, the stage returns blocked. Read-only discovery can fill routine technical context; it cannot invent requirements, user confirmation, or permissions.

## Stage transitions and stop conditions

- **Pending → running → complete/not applicable/blocked.** Record actual outcomes, artifact paths, and evidence. Reviewer additionally gives its verdict. Off stages are `skipped: user configuration`, not not-applicable assessments or approvals. A not-applicable assessment of an enabled stage is recorded as such; obtain user confirmation before changing its toggle for later dispatches.
- Advance only when dependencies have usable outputs and unresolved blockers do not invalidate the next stage. Explain unrelated blockers and their owners rather than unnecessarily halting safe independent work.
- A fix round is one pass over outstanding review findings through enabled fix owners and, if enabled, Reviewer. Initial implementation/review is not a fix round. Count rounds per Ticket, preserve finding IDs, and stop when the limit is reached (zero means return initial findings without automatic fixes).
- New requirements, toggles, mandatory gates, conflicting decisions, missing required tools, or approval-required actions go to the user. Reconfirmation applies to the changed configuration; routine corrections within the approved scope do not restart startup questioning.
- If Developer is off, production fixes wait for user reconfiguration. With Tester off, Developer still performs agreed verification; with Reviewer off, report unreviewed. No optional specialist may be silently reintroduced during a loop.
- Mandatory gate failures/unavailability prevent a claim of verified delivery. Record introduced/pre-existing/unknown and ask before changing delivery conditions. Keep manual checks pending until the named verifier supplies evidence.

## Headless continuation

Follow [worktree-runs.md](worktree-runs.md) for unique task claims, workspace creation, launch evidence, and management. Isolation is the default for single-task launches as well as multiple Tickets. The controller can prepare/dispatch another independent task without waiting for existing runs; a worker must not recursively apply the controller's launch steps.

The parent asks once for the multi-Ticket run and sends the actual confirmed record with each worker's bounded Ticket, workspace, permissions, and dependency state. Copy/link the record into the worktree as needed; a worker must be able to read it. The parent dispatch explicitly identifies this as a continuation of that confirmed run.

A record claiming confirmation on its own is insufficient. A worker proceeds only with an explicit delegated parent confirmation for this Ticket and run; a fresh standalone invocation asks the user again. Missing/ambiguous confirmation or new permission needs returns blocked to the parent, with local work preserved. Workers cannot broaden publication scope or approve each other.
