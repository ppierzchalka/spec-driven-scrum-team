# Spec-Driven Scrum Team

A configurable multi-agent toolkit for product discovery and autonomous implementation. Install per repo for OpenCode, Claude Code, Codex, Antigravity or Copilot; native multi-agent support is required.

```sh
npm install
npm run setup -- ../path/to/target
```

Choose a harness, models/effort and optional Toady in the TUI. Other harnesses inherit models by default; OpenCode retains the configured routing matrix. The installer does not change .gitignore. Existing unmarked skill names require explicit adoption; noninteractive users can choose `--replace-skills` after checking collisions. See [configuration](docs/team-configuration.md).

## Work with Analyst

- project-setup once: documentation paths, tracker/status mappings, done gates, optional execution preferences.
- wayfinder: explore/resume direction across as many sessions as useful; keep current decisions/questions in existing artifacts.
- slice: create manageable vertical tasks ready-for-refinement, with dependencies and source links.
- refine: enrich the same task until behavior, criteria and checks are ready-to-implement.
- plan: optional technical detail, never a mandatory phase.

Enter where your context is already sufficient. A small idea can go directly to Refine; ready tasks go directly to Lead. Every specialist supports separate consultation without a Ticket or pipeline.

## Hand over to Lead

Run autonomous-implement with one or more ready task references. Lead proposes a proportionate team, bounded task packets, dependency scheduling and checks. Choose local/separate/stacked/consolidated delivery before execution unless already specified. Stack/consolidate remain available on demand; merge/deployment/cleanup are separate actions.

Lean execution uses Developer and independent Reviewer. Related bounded tasks can share contexts with individual task criteria/results; independent writable packets use worktrees. Architect, Security, UX and Tester join for concrete value. Tester normally designs cases read-only; explicit test-author mode splits test ownership.

Methods live in skills; thin agents select ownership/model/tools. Required checks and independent review remain. Use current evidence instead of repeated commands; integration/fixes invalidate affected evidence. One concise task/batch result supports resumption.

## Verify and measure

```sh
npm test
npm run typecheck
npm run build
```

See [behavior scenarios](docs/prompt-evaluation.md). Package tests validate installation, not every harness's native behavior. Token/cost data remain unknown when unavailable; optional local usage summaries consume sanitized aggregates. Evaluate cost per correctly delivered result, including repairs and user interventions.

Current concepts: [CONTEXT.md](CONTEXT.md). Design decisions: [ADR 0004](docs/adr/0004-skills-and-execution-packets.md). The original [brief](brief.md) is historical, not execution instructions.
