---
name: implement
description: "Lead a single task or a task graph from a user-pointed brief through implementation, stacked GitHub PR review, feedback fixes, and merge when requested."
disable-model-invocation: true
---

# Implement

You are the lead. The user points you at one task, a task set, or a spec and asks you to decompose it. You own the end-to-end workflow: understand the source of truth, choose the execution shape, coordinate implementation, integrate and verify the result, publish PRs, route review feedback, and merge in dependency order when the user says to merge.

Use the current session as the control plane. Keep one task in the current worktree for a single-task run. For a task graph, give each active task its own branch and worktree, delegate independent tasks concurrently, and queue blocked tasks until their prerequisites are ready. The lead owns the graph, integration, PR stack, and user communication; workers own only their assigned task.

## 1. Load and classify the work

Read the complete user-pointed source of truth: local files, GitHub issues/PRs, comments, links, related research, prototypes, `CONTEXT.md`, and relevant ADRs. If no source was given, ask for its path or URL. Treat that artifact as authoritative and use the configured tracker instructions to fetch it.

Choose the run shape:

- **One task:** implement in the current worktree and publish one PR.
- **Task set:** use the provided tickets as a dependency graph; do not invent extra scope.
- **Decompose:** when asked, split the requested outcome into small, independently verifiable vertical slices, record each slice's blockers, and show the concise plan. Proceed with the plan unless a product or architecture decision is genuinely unresolved. Save the plan beside the pointed artifacts when writable; otherwise keep it in the lead session and PR descriptions.

Summarize the outcome, acceptance criteria, scope boundaries, and execution shape. Ask only questions that block safe implementation. Inspect `git status`, current branch, and remotes before making changes; preserve unrelated user work. Capture the starting `HEAD` as the review baseline. Check GitHub authentication before publishing; if it is unavailable, finish and verify the code, then report the exact publishing blocker.

## 2. Build and schedule the task graph

For each task, identify its deliverable, acceptance criteria, test seam, and blocking tasks. Dependencies must reflect real integration requirements. Tasks at the ready frontier are eligible to start; a task becomes ready when all blockers have a verified implementation to build on. Keep blocked tasks queued. Run as many ready tasks concurrently as the available agent/worktree capacity safely supports; serialize tasks that edit the same seam or require another task's output.

When decomposing, prefer narrow, complete behavior slices that can each be reviewed and verified. A wide mechanical refactor may use staged expand/migrate/contract slices. Order the graph topologically so every PR has a clear prerequisite chain. Explain the planned slices and dependencies to the user while work begins; pause for approval only when the decomposition changes user-visible scope or an unresolved decision affects the design.

## 3. Implement each task

### Single-task run

Work in the current worktree and feature branch. If the current branch is the repository's base branch, create a feature branch in this same worktree before editing. Follow the repo's test commands and conventions. Use the red-green-refactor loop: a meaningful failing behavior test, the smallest implementation that makes it pass, then refactoring. Run focused tests and typechecks as the change develops.

### Task-graph run

Create one dedicated worktree and branch per active task. Dispatch one implementation worker per ready task, in parallel when independent. Give each worker pointers to the spec, its task, blockers, relevant code areas, its worktree/branch, and required checks; require a concise completion report, committed changes on its assigned branch, and no edits outside its task. Workers must not create additional workers or PRs.

The lead monitors the frontier, reviews each completion against that task's criteria, runs or confirms its focused checks, and starts newly unblocked tasks. A dependent task starts from the verified prerequisite branch state it needs. If two completed independent branches will be stacked, integrate them in topological order and rebase/restack the later branch on the earlier one. Resolve conflicts by intent against the source artifacts, then rerun affected tests. Never mark a task complete merely because its worker finished.

## 4. Integrate and verify

Before publishing, verify the complete deliverable against the spec and every task's acceptance criteria. Run focused tests for each task and the relevant full suite/typecheck/build on the integrated result. Review the full diff for standards, scope creep, missing requirements, and incorrect behavior. Fix material findings and rerun affected checks. Record the exact starting commit as the review base.

## 5. Publish the PR or stack

Use the repository's GitHub workflow and `gh` skill. Push only the implementation branches created for this task. Preserve the current worktree and any unrelated changes.

- **One task:** create one PR from the current task branch to the repository's base branch. Include the spec/ticket reference and acceptance/check summary.
- **Task graph:** choose a topological review order and publish one PR per task as a GitHub stack. The first PR targets the repository base branch; each following PR targets the previous PR's branch, so each PR shows its own slice. Ensure dependent changes are based on their prerequisites. Use draft PRs during integration; once the whole stack is verified and coherent, mark them ready for review in stack order. Link prerequisite PRs and relevant issues in each description.

Report the PR URLs in review order, their dependencies, checks, and any known limitations. Keep the stack branches/worktrees available for feedback fixes.

## 6. Handle review feedback as another pipeline pass

When the user provides review comments or asks for revisions, read the complete relevant PR conversation and review threads. Map each comment to the owning task/PR, clarify only genuinely ambiguous intent, then route fixes to the matching task pipeline. For one task, update its branch in the current worktree; for a task graph, dispatch fixes to the matching task workers. Parallelize feedback fixes only when their branches and code seams are independent; queue dependent fixes behind their prerequisites.

Update the existing PR branches rather than opening replacement PRs. Re-run the affected checks, review the fixes against the user's comments and original spec, and restack/rebase descendant PRs when an ancestor changes. Re-run integration checks for the affected stack suffix. Report which comments were addressed, which remain open, and the updated PR URLs. Repeat this loop each time the user adds feedback; do not infer approval from silence.

## 7. Merge when the user gives the go-ahead

Wait for the user's explicit merge instruction after review. Confirm the stack is approved, required checks pass, and the current PR order/dependencies are still valid. Merge in dependency/review order, updating each child PR's base as its parent lands when GitHub does not do so automatically. Verify the resulting base branch and report the merged PRs and any remaining cleanup.

Do not merge, close source issues, delete task branches/worktrees, or remove the review stack before the user approves merging. If the run cannot safely complete in this session, stop at a clean boundary and leave a precise handoff describing task states, branches/worktrees, PR stack, blockers, and next action.
