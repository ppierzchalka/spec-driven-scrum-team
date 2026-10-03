# Isolated implementation runs

Read before creating worktrees, launching workers, or managing active implementation runs. Prefer **one task, one branch, one worktree, one worker session**, including single-task invocations. Grilling/planning happens in other skills/session(s); this fresh implementation session consumes existing GitHub or local artifacts.

## Consume prepared artifacts

1. Read the supplied GitHub issue/spec or local file and its linked criteria, non-goals, decisions, code/design references, and verification plan. Respect the previously agreed decisions; planning-chat access is unnecessary. Ask focused questions only for consequential implementation gaps or contradictions.
2. Record canonical source refs and current versions (for example issue update time/revision or local content checksum), dependencies, and readiness. A plain local spec is sufficient; do not require a separate handover document, tracker label, or preparation command.
3. Use the existing artifacts as the dispatch inputs. Materialize snapshots and a confirmed run record only for workspace isolation/reproducibility. Additional independent tasks may be started in separate fresh implementation sessions or as a confirmed batch.

## Confirm and reserve the run

1. Apply [run-contract.md](run-contract.md)'s mandatory confirmation for the task(s) being launched. Display **isolated worktree** as the default workspace mode, with the proposed base ref, branch/path, and background vs interactive execution. Require explicit confirmation; an artifact's ready status does not approve toggles, command exceptions, or publication.
2. Inspect Git status, branches, and `git worktree list --porcelain` read-only. Identify the repository's common Git directory (`git rev-parse --git-common-dir`, resolved to an absolute path). Use `<common-git-dir>/team-runs/` as the default shared control root, or an agreed absolute alternative shared by all controllers for this repo. It holds run records/logs, not credentials, and is not committed.
3. Reserve a unique run ID and a task claim **exclusively** before launching. A new claim directory must fail if it already exists; do not implement a read-then-overwrite claim. Normalize task identity across aliases: GitHub repository/issue plus agreed scope, or canonical local spec path plus agreed scope. Record artifact versions separately so an edit cannot bypass an existing task claim. Include owner/controller, task identity, run ID, and record path. Distinct controllers use the same claim root so they cannot launch duplicate work on one task unknowingly.
4. On an existing claim, inspect and report the run; ask whether to attach, resume, or prepare a different task. A stale claim or PID alone is not permission to delete work or start a second worker. Release a claim only after the run is stopped/collected and the user agrees it is ready for another pass; preserve its history.

Record lifecycle separately from tracker labels: **prepared, launching, running, blocked, failed, local-ready, reviewed, published, collected**. Lead maps these to the project's actual tracker states; a worker exit is not completion or merge.

## Create the task workspace

1. Resolve and record the agreed base commit. Create a new branch and unused worktree path, normally adjacent to the repo rather than nested in its checkout. Confirm the parent directory and current-worktree registrations. Existing branch/path means inspect/reuse only by explicit user choice; never force-create, reset, stash, or clean the source checkout.
2. Use a scoped `git worktree add <new-path> -b <new-branch> <base-ref>` after confirmation. New tasks get independent branches from the agreed base; dependencies may require a tested prerequisite commit/branch. Uncommitted prerequisite code does not magically appear in another worktree: obtain an authorized commit/base choice or return dependency blocked.
3. Materialize snapshots of the supplied spec/decisions, confirmed run record, local task record, and the installed team agent/skill definitions needed by the worker. Copy only identified task/team files if they are absent from the chosen commit; do not copy unrelated dirty production files, `.env`, credentials, or the entire source checkout. Preserve user-customized team instructions and model choices. Treat snapshot artifacts as per-run inputs, not permission overrides.
4. Verify the target cwd/branch/base, task snapshots, applicable project rules, skill references, model choices, and effective runtime permissions. Project-local setup/dependencies and ports belong to this run; inspect installation scripts and service side effects before execution. Use distinct ports/resources or run conflicting service tests sequentially.
5. Record the absolute workspace, branch, base commit, control root, claim, artifact/snapshot input paths, and worker-output directory. Preserve the source checkout and the separate planning session's work.

## Launch once

Launch one separate `opencode run` per confirmed task using the supported CLI flags. Check `opencode run --help` for the installed version. A representative invocation is:

```text
opencode run --agent lead --dir "<task-worktree>" --format json --file "<confirmed-run-record>" \
  "Continue the parent-confirmed run <run-id> as worker. Read the attached run record and installed autonomous-implement instructions. This worktree is already initialized: run only the enabled stages here; do not create another worktree or launch another controller."
```

- Use a real background/durable process facility when available, retaining the process/job handle, session ID when emitted, and per-run stdout/stderr/result paths. Verify launch succeeded before reporting running. Keep logs private and redact secrets in summaries.
- Never add `--auto` to bypass permission prompts, or share sessions externally without explicit authorization. Workers use the confirmed restrictions and effective tool permissions. Missing approval in headless mode returns blocked to the controller/user.
- If durable background execution is unavailable, prepare the workspace and provide an exact launch command for a separate user terminal/session. Report **prepared, not running**; do not claim that a blocking foreground call leaves the controller free.
- The **worker** validates cwd/branch/run ID, parent delegation, and snapshot availability, then executes stages in the already-created worktree. It must not recursively create worktrees or launch another Lead worker. Missing/ambiguous delegation stops; a standalone/new run still asks for toggles.
- Each worker owns only its workspace and per-run output. It writes stage notes/results to its own Ticket snapshot/output, not a global queue, another task's files, or the controller's canonical Ticket. The controller alone synchronizes notes/state to the canonical tracker, with version/conflict checks.

## Status, collection, and recovery

Use `/autonomous-implement status [run-id]`, `collect <run-id>`, `resume <run-id>`, or `stop <run-id>` for management. A fresh implementation session can discover the repo's shared registry and inspect previous runs without planning-chat access. Before mutations, verify run identity and acquire/transfer controller ownership exclusively; an active owner means ask to attach/transfer rather than race to update records. On request, show **task, run ID, branch, worktree, handle/session, current stage, observed lifecycle, verification, blockers, and next action**. Inspect actual handles/results and timestamps; distinguish confirmed running, exited, and unknown. Avoid tight polling loops that consume model capacity.

- **Status:** read per-run records/log excerpts/results and process evidence. Report failures and permission requests without restarting or modifying the workspace. A PID without its matching run identity is insufficient evidence to terminate anything.
- **Collect:** confirm the worker has finished/stopped; inspect its scoped diff, stage outcomes, evidence, and manual checks. Synchronize the canonical Ticket only if it has not changed incompatibly; route conflicting spec edits to the user rather than overwriting. Record local-ready/reviewed/published accurately, never Done solely on exit zero.
- **Resume:** inspect the existing workspace and recorded config; get explicit user confirmation of the resumed scope/toggles/permissions. Continue the identified session/run or start a bounded replacement worker in that workspace, not a duplicate task branch. Preserve progress and findings. Changed source specs need a reconciled contract before continuing.
- **Stop:** require a scoped user request and identify the exact process/session; stop that run gracefully using the supported facility. Preserve files/logs/worktree. Never kill broad process groups or unrelated opencode sessions by name.
- **Integrate/cleanup:** merging, cherry-picking, publication, branch deletion, and worktree removal are separate scoped user actions. Do not auto-merge finished runs into the source checkout or remove worktrees to tidy up. Independent task branches can still conflict at integration time; review that conflict against the current contracts.

For multi-task launch, independent tasks may run concurrently under a user-agreed concurrency limit; default to launching one at a time and letting the user choose additional work. Dependent tasks wait for a verified usable prerequisite ref. The controller keeps one record per run and a read-only aggregated status view; workers never rewrite a shared status table concurrently.
