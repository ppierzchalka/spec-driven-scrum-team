# Pipeline configurability lives in skill prose and prompt input

Status: accepted; no policy change in this grooming.

The `/autonomous-implement` flow (which stages run, what they produce) is defined in the skill's text, and skipped or altered by writing it in the invocation prompt (`/autonomous-implement work on ticket 01, skip security`) or per-repo via `AGENTS.md`. No structured stage list or config-driven pipeline. Prose keeps every override expressible without extending a schema, at the cost of being less machine-checkable.

## Amendments (historical, then current)

Earlier prose allowed per-repo execution preferences to persist in prose. That remains true and is now located: setup can persist optional prose execution preferences in `docs/agents/execution.md` or an existing equivalent — see [execution choices](../team-configuration.md#execution-choices). Invocation and session choices override them.

What prose preferences never grant, then and now: publication, deployment, merge, or force-push permission; ownership and authorization safeguards are fixed. Lead owns task lifecycle and the single execution record; Developer owns code and tests unless Tester explicitly owns tests in test-author mode; Reviewer independently owns the verdict. No executable stage schema or scheduler service is introduced by this decision.
