# Worktrees and delivery

Worktrees isolate Git checkouts/branches, not processes or model context. One Ticket or coherent execution packet defaults to current checkout; concurrent writable packets use separate worktrees. Selected sequential work may reuse current checkout.

## Preparation

Inspect status, branches and git worktree list --porcelain. Preserve existing work; record unused paths, branches and known bases in the run contract. Never reset/stash/clean/force-checkout user work. Create only authorized worktrees.

One Lead dispatches specialists directly. Serialize shared-file writes; check tooling/dependencies/environment per worktree.

Cross-worktree dependents start from usable verified prerequisite commits; same-checkout sequential packet tasks may use verified local state after required intermediate gates. Multiple parents need an agreed integration base containing all prerequisites. If required local commits are unauthorized, report that blocker. Do not copy uncommitted changes.

## Delivery

Ask for the mode before execution unless already supplied. Stack/consolidate only on explicit selection, including later on-demand changes. A batch alone chooses neither.

- Local: leave scoped changes/integration plan; no implicit commit/push.
- Separate: independent PRs target selected base; dependent PR bases must contain prerequisites.
- Stacked: dependent PR targets predecessor branch, with only its incremental diff relative to that base. Multiple parents need an integration base or consolidation. Record merge order; update descendants after parent merge without unapproved force pushes.
- Consolidated: integrate selected commits in topological order onto agreed delivery branch, resolve scoped conflicts, run assembled-result gates and integration review, then open one PR. Preserve source branches/worktrees until cleanup authorization; do not auto-close existing PRs.

Inspect status/diff/base before publication and stage only intended files. Per-branch checks do not verify the assembled result. Integration, cleanup, existing PR closure and deployment require corresponding permission. Requesting a PR authorizes necessary scoped commit/push, not deployment/deletion.
