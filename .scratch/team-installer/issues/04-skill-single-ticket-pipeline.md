# 04: Skill — single-ticket pipeline

**What to build:** The real `/autonomous-implement` skill prose, driven by the `lead` agent in a fresh session. Given a ready Ticket, it runs the Pipeline — architect, security, ux, tester (failing tests first), developer (implement to green gates), reviewer, then PR — writing the standard ticket sections (`architect_notes`, `security_notes`, `ux_notes`, `test_plan`, `impl_notes`, `review_findings`) and opening a PR with a summary. Every stage is overridable in the invocation prompt or per-repo via `AGENTS.md`. Includes the review-feedback loop: `address review comments on PR #N` re-runs tester → developer → reviewer on the same branch and updates the same PR.

**Blocked by:** 01 (installTeam engine — establishes the installed agent shape the skill references).

**Status:** ready-for-agent

- [ ] Skill invocable as `/autonomous-implement work on ticket <ref>` in a fresh session as `lead`
- [ ] Reads a ready Ticket (per the repo's configured issue tracker) and runs the full Pipeline to a PR
- [ ] Each stage's output lands in the standard ticket sections
- [ ] Any stage is skippable/alterable via the invocation prompt (e.g. `skip security`)
- [ ] Per-repo overrides via `AGENTS.md` (e.g. skip security for a Godot game)
- [ ] Gates (tests, typecheck, lint) run before a PR opens
- [ ] Review-feedback loop: `address review comments on PR #N` re-runs tester → developer → reviewer and updates the same PR