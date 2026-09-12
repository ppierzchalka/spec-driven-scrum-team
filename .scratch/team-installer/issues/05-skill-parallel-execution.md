# 05: Skill — parallel execution

**What to build:** Multi-ticket invocation in the `/autonomous-implement` skill. For several ready Tickets, `lead` spawns a separate git Worktree per Ticket (own branch), runs each Pipeline as its own headless `opencode run` process in that worktree (no context bleed), and decides per task-set whether the resulting PRs are independent (target main) or stacked (each PR's base is the previous ticket's branch) based on whether the tickets conflict or depend on one another.

**Blocked by:** 04 (single-ticket pipeline).

**Status:** ready-for-agent

- [ ] Skill accepts multiple Tickets in one invocation
- [ ] `lead` creates a git Worktree with its own branch per parallel Ticket
- [ ] Each Pipeline runs as a separate headless `opencode run` process in its worktree
- [ ] `lead` decides per task-set: independent PRs when tickets don't conflict/depend, stacked PRs when they do
- [ ] Results collected across worktrees with a summary of all PRs for review