# Pipeline configurability lives in skill prose and prompt input

The `/autonomous-implement` flow (which stages run, what they produce) is defined in the skill's text, and skipped or altered by writing it in the invocation prompt (`/autonomous-implement work on ticket 01, skip security`) or per-repo via `AGENTS.md`. No structured stage list or config-driven pipeline. Prose keeps every override expressible without extending a schema, at the cost of being less machine-checkable.


## Current amendment

Setup can persist optional prose execution preferences in docs/agents/execution.md or an existing equivalent. Invocation/session choices override them. Preferences do not grant publication permission. No executable stage schema or scheduler service is introduced.
