# Worktrees

Use this reference only when the confirmed work benefits from a separate Git branch and checkout. A worktree is Git isolation, not an execution environment.

## Prepare a worktree

1. Inspect Git status, branches, and `git worktree list --porcelain` before changing anything.
2. Agree the base ref, branch name, and unused path with the user. Never reset, stash, clean, force-checkout, or remove an existing worktree.
3. Create the worktree with `git worktree add <path> -b <branch> <base-ref>` only after confirmation.
4. Give the worktree path, branch, Ticket/spec, confirmed agent toggles, applicable instructions, and required checks to every subagent working on that Ticket.
5. Keep parallel Tickets in separate worktrees. Dependent Tickets wait for an agreed prerequisite commit or branch; do not copy uncommitted changes between worktrees.

## Dispatch

All work happens through subagents in the current interactive session. For one Ticket, Lead dispatches the enabled specialist stages directly. For parallel Tickets, Lead dispatches one `general` subagent per Ticket with the Lead role and its complete Ticket context; each Lead subagent dispatches its enabled specialist stages.

The user opens another terminal when they want an independent session.

## Finish

After the subagents finish, inspect the scoped diff and required verification in the applicable worktree. Commit, publish, integrate, and remove worktrees only with the user's explicit authorization.
