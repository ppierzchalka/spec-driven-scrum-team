# Team Installer + Autonomous-Implement Skill

Status: ready-for-agent

## Problem Statement

I want to run a spec-driven, scrum-like multi-agent team inside opencode across many different project repos (a Godot game, a Next.js SaaS, etc.). Today the team exists only as an idea in `brief.md`: there are no installable agents, no way to pick which model and reasoning effort each agent should use for a given machine, and no pipeline that actually implements a ticket end-to-end. Hand-authoring agents per repo is slow and each machine has different providers/models available. I want to clone one repo, run one command, and have a working, configurable team in any target repo — with models chosen interactively from what that opencode install can actually use right now.

## Solution

This repo becomes a tool that ships:
- The seven canonical Agents (`lead`, `architect`, `security`, `ux`, `tester`, `developer`, `reviewer`) as generated markdown files.
- The `/autonomous-implement` skill that drives the Pipeline over ready Tickets.
- An interactive installer CLI (TypeScript, `@clack/prompts`) that writes all of it into a Target repo.

Run flow: from this repo, run the installer pointing at a Target repo path (`./install /path/to/target`) → a layered TUI lets me pick a model and reasoning effort per Agent from the providers/model actually available in that opencode install (or type my own) → it writes the seven agents, the skill, and `team.config.json` into the Target repo. Re-running reconfigures: persisted choices are shown, I can change any Agent's model/effort, and per-run I choose whether to overwrite an Agent's instructions or keep my edits. Later this graduates to an npm-published command run from inside the Target repo.

Once installed, a session as `lead` with `/autonomous-implement work on ticket 01` reads a ready Ticket and runs the Pipeline: architect → security → ux → tester → developer → reviewer → PR. Everything is overridable in the prompt. For multiple ready Tickets, `lead` creates one Worktree per Ticket and dispatches a Lead-role subagent per Ticket in the current session, deciding stack vs independent PRs per task-set, and supports a review-feedback loop on PR comments.

## User Stories

1. As a user, I want to run a single install command from this repo pointing at a Target repo path, so that the seven Agents, the `/autonomous-implement` skill, and a config file appear in the Target repo's `.opencode/` without manual authoring.
2. As a user, I want the installer to enumerate models live from authed providers in my opencode install (`opencode auth list` + `opencode models`), so that I only choose models I can actually use right now.
3. As a user, I want to type a custom model id when the enumerated list doesn't cover it, so that any provider/model I have configured is reachable.
4. As a user, I want to pick a reasoning effort per Agent from the levels its chosen model actually supports, so that I never select an effort a model ignores.
5. As a user, I want each Agent to preselect no model on first install, so that if I save and exit, every Agent inherits opencode's currently selected model.
6. As a user, I want the installer to persist my per-Agent model and reasoning-effort choices in `team.config.json` in the Target repo, so that re-running the installer shows them back.
7. As a user, I want the installer's TUI to be a layered menu (list Agents → pick one → set model/effort → back), so that I can adjust one Agent without redoing the others.
8. As a user, I want a per-run "overwrite instructions?" toggle per Agent, so that I can edit an Agent's prompt and later change its model without losing my edits.
9. As a user, I want the install to write exactly the seven Agents (`lead`, `architect`, `security`, `ux`, `tester`, `developer`, `reviewer`) with no per-model variants, so that model choice is configuration, not more files.
10. As a user, I want the `/autonomous-implement` skill installed into the Target repo's skills directory, so that I can invoke it in a fresh session.
11. As a user, I want `/autonomous-implement work on ticket 01` (as `lead`) to read a ready Ticket and run the full Pipeline to a PR, so that implementation happens autonomously while I'm away.
12. As a user, I want every Pipeline stage skippable or alterable by writing it in the invocation prompt (e.g. `/autonomous-implement work on ticket 01, skip security`), so that I can tailor runs per ticket.
13. As a user, I want Pipeline defaults overridable per-repo via `AGENTS.md`, so that a whole repo can agree to skip a stage (e.g. security for a Godot game) without repeating it per invocation.
14. As a user, I want `/autonomous-implement address review comments on PR #N` to re-run tester → developer → reviewer on the same branch and update the same PR, so that my PR comments feed back into the loop.
15. As a user, I want `lead` to create a separate Git Worktree with its own branch for each parallel Ticket and dispatch a Lead-role subagent for each Pipeline in the current session, so that no Ticket's context bleeds into another.
16. As a user, I want `lead` to decide per task-set whether PRs are independent or stacked, so that dependent/conflicting tickets stack and independent ones don't.
17. As a user, I want each Pipeline run to run gates (tests, typecheck, lint) before opening a PR, so that PRs are reviewable, not broken.
18. As a user, I want to run the installer from this repo against a destination path (no npm publish needed yet), so that this repo alone is enough to install the team into any Target repo.
19. As a user, I want the install logic testable without a TUI or a live opencode, so that the generation behavior is verifiable in CI.

## Implementation Decisions

- **Runtime**: TypeScript, ESM-only, Node ≥22, built with `bun` for dev and `tsc`-style build; prompts via `@clack/prompts`. Mirrors the skills CLI tooling.
- **Invocation**: the CLI runs from this repo and takes the Target repo as a path argument (prompted interactively if omitted). Future npm-published variant runs from inside the Target repo with no path argument; `installTeam` is unchanged, only the invocation moves.
- **Primary seam (tested)**: a pure `installTeam(definitions, config, targetDir)` module that takes the canonical Agent definitions, a resolved per-Agent config (`{ model?, reasoningEffort? }`), and a Target directory, and writes:
  - `.opencode/agents/<name>.md` for each of the seven Agents
  - `.opencode/skills/autonomous-implement/SKILL.md`
  - `.opencode/team.config.json`
  No TUI, no shell-out, no network inside this module.
- **Model enumeration** lives as a small pure parser: shell out to `opencode auth list` and `opencode models [provider]`, parse stdout into available models; an "all catalog" escape hatch and a free-text custom model entry are allowed.
- **Reasoning-effort derivation** is a pure function from provider/model to supported levels (Google → minimal/low/medium/high via thinkingLevel; OpenAI → none/minimal/low/medium/high/xhigh; DeepSeek → none/low/medium/high; Anthropic → none/high/max), default "don't set" (omits the key).
- **Config semantics**: `team.config.json` stores per-Agent `{ model?, reasoningEffort? }`. When `model` is unset, the Agent file omits the `model` frontmatter key so it inherits opencode's currently selected model.
- **Overwrite semantics**: on re-run, each Agent is offered "overwrite instructions?"; yes writes the canonical prompt, no preserves the local edit. Model/effort from config always applies.
- **Seven Agents, one per role**: no per-model permutation agents and no separate Astra reviewer (ADR-0001). The TUI installs exactly these seven.
- **Pipeline is prose**: which stages run and what they produce is defined in the skill's text; overridden per-invocation in the prompt or per-repo in `AGENTS.md`, not via a structured stage config (ADR-0003).
- **Parallel execution**: `lead` creates a Git Worktree per parallel Ticket and dispatches a Lead-role subagent per Ticket in the current session. Stack vs independent PRs is decided per task-set by `lead`: independent when Tickets do not conflict or depend; stacked otherwise.
- **Review-feedback loop**: the skill has a mode that reads PR comments, re-runs tester → developer → reviewer on the same branch, and updates the same PR.

## Testing Decisions

- The seam to test is `installTeam`: given definitions + config + a temp dir, assert the seven agent files, the skill, and the config are written with correct frontmatter; that an unset model omits the `model` key; that a set model/effort appears correctly; and that "overwrite instructions" vs "preserve" behaves per Agent.
- Unit-test the model-list parser (given canned `opencode models` / `auth list` output) and the reasoning-effort derivation (provider → levels).
- The TUI is intentionally unseamed (thin config-collection layer); covered by an end-to-end non-interactive run or manual verification, not unit tests.
- Prior art: no test suite exists in this repo yet; this establishes the first one. Tests live with the source and run headless in CI-style commands.

## Out of Scope

- Installing Matt Pocock / AI Hero skills — those come separately via `npx skills`.
- Publishing to npm (clone+run only for now; an npm wrapper can come later).
- Writing the full behavioral prompt content of the seven Agents and the skill beyond what's needed to install them correctly (prompt engineering is iterative, not this spec's job).
- CI, GitHub Actions, or any packaging of the Target-repo workflow.
- Ticket storage layout or the issue-tracker rules of Target repos (those come from per-repo setup, e.g. this repo's own `.scratch/` convention).

## Further Notes

- Sources: `brief.md` (the original team artifact), `CONTEXT.md` (domain vocabulary), ADRs 0001–0003 in `docs/adr/`.
- The pipeline order and the seven roles come from the grilled requirements; the skill prose, not the code, owns the flow.
