# Documentation grooming — task 10

Date: 2026-10-09 UTC. Branch `follow-up/grooming-and-pipeline`, HEAD `4be1db6bef208bae0087c92c47da693de6fecba6`. Report-only grooming packet: documentation audit and inline correction plus a completion-aware scratch-cleanup eligibility review. No production behavior, canonical agent/skill content, runtime, model or publication changes. "Current" throughout means at this audit date.

## Scope, method and evidence identity

Audited against current-at-audit source/package scripts/behavior: `README.md`, `docs/**`, canonical `agents/**` (8 role files), canonical `skills/**` (12 procedures plus `autonomous-implement/references/**`), repository `AGENTS.md`, and `.github/workflows/release.yml`. Source checked directly includes `package.json`, `vitest.config.ts`, `src/cli/{args,launch,main,freshness}.ts`, `src/installer/{defaults,harness,toady,installTeam}.ts`, and `src/tui` screens/tests (read-only; `src/tui/*` is task13-owned and was not modified).

Working tree at start included pre-existing uncommitted task11–14 work; none of it was touched. Per-file hashes of the three edited files are below; the report's own hash was recorded in the Developer handoff to avoid a self-referential hash.

## Discrepancy inventory

| # | Source / claim | Evidence | Disposition | Remaining uncertainty |
|---|---|---|---|---|
| G1 | `.github/workflows/release.yml` header: "Authored locally; no remote run is authorized by the task handoff." | The branch's verified installer work was committed as `4be1db6` and pushed to `master` (task09 delivery update; `git log` shows the commit on `follow-up/grooming-and-pipeline`). The workflow `on: push: branches: [master]` trigger is therefore live, contradicting "no remote run is authorized." | Fixed inline to master-push-trigger semantics. A push is a trigger, not proof of a successful release. | No hosted release success is claimed or evidenced; publication status remains observable only on GitHub. |
| G2 | `README.md`: "No release is published yet: until the first successful master build ships its `current` release, the command above fails closed." | The first-release status is time-sensitive and not verifiable from this checkout; the claim could already be false after the master push. | Fixed inline to conditional wording: "Until the first successful master build publishes its `current` release, the command above fails closed. Publication status is not verified here." Retains the fails-closed contract and the unverified hosted gate. | Whether the `current` release has already been published is unknown here; the wording no longer asserts either way. |
| G3 | `docs/team-configuration.md`: "fallback lists live in `src/defaults.ts`." | No `src/defaults.ts` exists; the module is `src/installer/defaults.ts`. | Fixed inline path to `src/installer/defaults.ts`. | None. |

Verified-current items (no change required, recorded so Reviewer need not re-derive them):

- **fast/rendered/release selectors** — `package.json` defines `test:fast`/`test:rendered`/`test:release`; `vitest.config.ts` declares matching `fast`/`rendered`/`release` projects with the release project serialized (`fileParallelism: false`). `npm test` = `vitest run` runs all three. README "Details and validation" is accurate.
- **freshness semantics** — README "resolves the newest successfully verified master build … verifies checksum … executes that exact build even when an older npx install is cached … failures abort before anything is written" matches `src/cli/freshness.ts` (fail-closed HTTP/rate-limit/checksum/host checks) and `src/cli/launch.ts` (pin handoff, cache reuse, sha256 re-verification). `--help` goes through freshness first in the shipped bin (no short-circuit before `loadCurrent`).
- **keyboard controls / Toady legend** — shipped docs say "Enter toggles Toady" and Space keeps checkbox semantics; `src/tui/screens/persona.tsx` renders `Enter toggles Toady / activate` and `src/tui/screens/directory.test.tsx`/`targetFlow.test.tsx` assert "Enter toggles Toady" and the absence of "Space toggles Toady". No shipped doc reintroduces the removed Space legend. Consistent.
- **authored vs generated instruction ownership** — `agents/` and `skills/` are the canonical tracked+shipped source (`package.json` `files`); this repo's `.opencode/agents`, `.opencode/skills`, `.opencode/team.config.json` are ignored generated installs (`.gitignore` managed block). `references/roles/*.md` and `runtime.json` are generated at install time (`src/installer/installTeam.ts` lines 122–127, 208–221); the canonical `skills/*/SKILL.md` references to `references/roles/{lead,analyst}.md` intentionally resolve only post-install (documented in `docs/team-configuration.md` "portable role bodies"). Consistent, no edit.
- **permission/done boundaries** — `docs/agents/issue-tracker.md` done definition ("accepted scope, passing applicable checks, independent review and merged delivery") and role ownership in `agents/*.md` (Lead owns lifecycle/one execution record; Developer owns code/tests unless test-author; Reviewer owns the verdict) are consistent with the shipped skill prose.
- **counts/layouts** — eight agents, twelve skills, five-harness `HARNESS_LAYOUTS` table all match source.

## Cleanup manifest — `.scratch/team-installer/issues/01..09`

Eligibility was evaluated against `docs/agents/issue-tracker.md`: done requires accepted scope, passing applicable checks, independent review, and merged delivery, plus applicable hosted/manual gates. No task 01–09 satisfies every applicable gate, so **no record is deleted**. A manifest of removed files would be empty; the per-record disposition is the durable record instead.

| Record | Accepted scope / checks | Independent review | Merged delivery | Hosted/manual gates | Eligible? |
|---|---|---|---|---|---|
| 01 installteam-engine | `ready-for-agent`; unchecked items; original @clack scope superseded by 07 | none in record | scope abandoned, never merged as specified | n/a | No — superseded draft, never reviewed/delivered |
| 02 model-enumeration | `ready-for-agent`; unchecked | none | superseded | n/a | No — superseded draft |
| 03 interactive-cli-tui | `ready-for-agent`; unchecked | none | superseded | n/a | No — superseded draft |
| 04 skill-single-ticket-pipeline | `ready-for-agent`; unchecked | none | superseded | n/a | No — superseded draft |
| 05 skill-parallel-execution | `ready-for-agent`; unchecked | none | superseded | n/a | No — superseded draft |
| 06 opencode2-discovery+gitignore | `done`; tests/typecheck/build `[x]` | not evidenced in its own record | work present in `4be1db6`, but no per-record merged-delivery/independent-review evidence | n/a | No — independent-review gate unevidenced |
| 07 native-ink-installer+distribution | accepted; extensive checks | Reviewer passes 1–7 approved | merged via `4be1db6` | first hosted release/freshness + live VS Code Ctrl+P routing unverified | No — hosted/manual gates pending |
| 08 single-target-picker+toady-legend | accepted; checks | Reviewer pass2 + UX approved | merged via `4be1db6` | same hosted/manual gates | No — hosted/manual gates pending |
| 09 verification+interruption-diagnostics | accepted; checks | Reviewer + UX approved | merged via `4be1db6` | same hosted/manual gates | No — hosted/manual gates pending |

**Declined deletions and reason (honest no-eligible-deletion):** tasks 01–05 are `ready-for-agent` backlog drafts whose original @clack/prompt-based scope was superseded by the native Ink rewrite in 07–08; superseded is not "done". Task 06 is self-marked `done` but its own record carries no independent-review evidence, which the current done definition requires. Tasks 07–09 remain `in-review` solely for the configured delivery gates: the first hosted release/freshness publication and the live VS Code integrated-terminal Ctrl+P routing check are unverified (a master push and local approval close neither). Per the refinement contract, pushed master and local approval do not close hosted/manual gaps, and blanketing cleanup to appear successful is prohibited. The empty manifest is a truthful accepted outcome.

**Durable replacement / migration:** because no record was removed, no still-needed diagnosis/timing/delivery facts required migration, and no surviving reference points at a deleted record. Task11's `.scratch/team-installer/issues/11-cancellation-debugging.md` reference to task09 remains valid (task09 is retained). Its condition "repair the link to this report if task09 is removed" is not triggered. The durable cancellation facts are already preserved in `docs/research/native-session-cancellations.md`, timing in `docs/research/pipeline-time-evaluation.md`, and test value/runtime in `docs/research/test-value-and-runtime.md`, each self-sufficient without ignored scratch or `/tmp/opencode` (provenance hashes remain as local-only references).

## Link and reference validation

- All Markdown links in the three edited files resolve: `README.md` → `docs/team-configuration.md`, `docs/prompt-evaluation.md`, `docs/adr/0004-skills-and-execution-packets.md` (all present) and the external releases URL; `docs/team-configuration.md` → `../README.md#install` (present). `release.yml` contains no Markdown links.
- A full tracked-`.md` link scan found no broken link in canonical `agents/`, `skills/`, or shipped `docs/`. The only unmatched relative references are: (a) four canonical `skills/*/SKILL.md` links to `references/roles/{lead,analyst}.md`, which are install-time-generated portable role bodies (intentional, see above); and (b) illustrative template placeholders inside vendored third-party `.agents/skills/**` (e.g. `[<closed ticket title>](link)`, `./src/ordering/CONTEXT.md` examples), which are out of scope for this repo's authored guidance.
- No durable link points to deleted scratch (nothing was deleted).

## Checks

| Check | Result |
|---|---|
| `git diff --check` | exit 0, no whitespace errors |
| `npx vitest run src/installer/installTeam.test.ts src/installer/harness.test.ts` | 2 files / 22 tests passed (485 ms) — sanity check only; no canonical agent/skill content changed, so these gates were not strictly required |
| Link/reference validation | see above |

## Content identity

Edited file SHA-256 (after edits, before this report):

| File | SHA-256 |
|---|---|
| `README.md` | `cba01fb09034373ed0c2a706a88f41a4dcce7f3ab7ee56a598e8102c7aaab56a` |
| `docs/team-configuration.md` | `01c61c67cfa68cdfe23f4490d31e1ec1f538c4011abd2917d5885a632d882bbf` |
| `.github/workflows/release.yml` | `5fe39e9bed7e7238c27f063c23a66b404d11a100d8fd4295c7e5f115e58658ff` |

## Remaining uncertainty

- Whether a `current` release has already been published by the master push is unverified and intentionally left unasserted in README/release.yml (no authorized hosted evidence). Live VS Code Ctrl+P routing and hosted release/freshness remain unverified pending owner capability/authorization.
- The model-defaults prose in `docs/team-configuration.md` uses shorthand names ("Sol 6.1", "Terra", "Luna 6", "Muse Contributor", "Zen equivalents") that map to the exact provider IDs in `src/installer/defaults.ts`; the shorthand could drift if defaults change. Not a defect at audit time, no edit.
- `.agents/skills/**` vendored third-party skills contain template placeholder links; these are outside this repo's authored guidance and were left untouched.
