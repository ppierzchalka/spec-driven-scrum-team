# Parallel pipelines run as headless `opencode run` per worktree

For parallel tickets, the `lead` agent shells out to a separate headless opencode process (`opencode run`) in each per-ticket git worktree, rather than dispatching subagents within its own session. Each pipeline gets true process and context isolation, matching the "no context bleed" requirement for overnight runs.