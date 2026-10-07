# Configure the installed team

## Models and updated prompts

Run `npm run setup -- /path/to/target-repo` from this tool repo. First select one harness: OpenCode, Claude Code, Codex, Antigravity or Copilot. Then select an agent and **Model**. OpenCode enumerates its authenticated model catalog with search. Claude Code, Codex and Copilot accept native model IDs manually; Antigravity offers inherit/flash/pro tiers. All default to inheritance; no OpenCode provider IDs are copied across. Reasoning effort is emitted only for OpenCode/Codex. Other adapters omit unsupported effort fields.

To apply updated canonical prompts to an existing install, keep **Overwrite instructions** set to **yes** for each agent you want updated. Choose **no** to preserve a locally edited prompt. The six skills and shared policy are copied on each install. Open a fresh session in the selected harness after reinstalling.

## Selected harness installation

One setup invocation installs only the selected harness. Re-run to add another explicitly; existing installations are not removed or changed. Shared source agent instructions are rendered into native definitions:

| Harness | Native agents | Skills | Saved installer choices |
| --- | --- | --- | --- |
| OpenCode | .opencode/agents/*.md | .opencode/skills/ | .opencode/team.config.json |
| Claude Code | .claude/agents/*.md | .claude/skills/ | .claude/team.config.json |
| Codex | .codex/agents/*.toml | .agents/skills/ | .codex/team.config.json |
| Antigravity | .agents/agents/*.md | .agents/skills/ | .agents/team.config.json |
| Copilot | .github/agents/*.agent.md | .github/skills/ | .github/team.config.json |

The JSON file stores installer choices, not a runtime configuration. Native definitions contain the supported model settings. Antigravity uses an explicit native tool allowlist. Its TUI permits additional runtime tool names; configure required MCP servers in its native agent frontmatter. Existing Antigravity tools/mcpServers survive instruction refresh. Remote tracker and rendered browser checks require their tools to be configured and available; the default list provides local shell/file operations, not those integrations.

The installer never edits .gitignore, removes tracked files, enables runtime features, or changes permissions globally.

For noninteractive installation use `npm run setup -- /path/to/repo --harness=codex --defaults` (replace codex as needed). Without --harness, interactive setup asks; legacy --defaults retains OpenCode for compatibility. Non-OpenCode defaults inherit the parent model.

Skills include portable role instructions in autonomous-implement/references/roles/. Native custom agents are preferred; where the harness exposes general subagents instead of named roles, Lead supplies these instructions to native subagents. Multi-agent capability remains required: no silent single-agent substitute. Analyst/Lead availability in primary-agent menus varies; invoking their planning/execution skills loads the appropriate instructions regardless of menu support.

Discovery depends on the installed harness version, workspace trust and native multi-agent access. CLI and GUI clients must open the same repository. The adapters are format/install integrations, not implementations of each harness's runtime.

Sources checked for this layout:
- [OpenCode agents](https://opencode.ai/docs/agents/) and [skills](https://opencode.ai/docs/skills/)
- [Claude Code subagents](https://code.claude.com/docs/en/sub-agents) and [skills](https://code.claude.com/docs/en/skills)
- [Codex subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)
- [Antigravity subagents](https://antigravity.google/docs/subagents/) and [skills](https://antigravity.google/docs/skills/)
- [Copilot custom agents](https://code.visualstudio.com/docs/agent-customization/custom-agents) and [skills](https://code.visualstudio.com/docs/agent-customization/agent-skills)

## Planning and execution

Use **Analyst** for /project-setup (docs/tracker conventions), /wayfinder (direction), /slice (backlog tasks), and /refine (one task). /plan provides optional technical planning. Use **Lead** with /autonomous-implement for ready Tickets. You can enter at any stage; existing mature specs do not require repeated discovery. Both agents have independent model/effort settings in the installer.

Wayfinder and Refine ask at most three consequential questions per turn and support unlimited rounds across resumable sessions. Unknown blockers remain explicit; a paused conversation does not imply readiness. Analyst saves stable criteria, dependencies and readiness; Lead consumes references rather than the planning conversation.

At handover, Lead proposes one batch contract explicitly asking for local/separate/stacked/consolidated delivery and covering all six execution roles, independent proposal candidates/evaluator, concurrency, worktrees, checks, limits, PR mode and scoped permissions. Explicit user selections already apply; only missing/material choices need confirmation. Do not repeat configuration per Ticket or unchanged fix loop.

Recommend Developer + Reviewer for routine work. Enable Tester for independent behavior/test design, Architect for structural decisions, Security for actual trust boundaries, UX for consequential interaction/design work. Independent read-only analysis can run concurrently when inputs permit. Selected roles may produce two isolated proposals with distinct lenses, evaluated once before implementation. Code/test writing stays single-owner.

One Lead manages the dependency frontier; no Lead-per-Ticket by default. One Ticket uses the current checkout; concurrent Tickets use isolated worktrees. Lead asks you to choose local, separate PRs, stacked PRs or one consolidated PR before execution unless already specified. Stack/consolidate only on explicit selection; later on-demand changes are also supported without auto-closing PRs or deleting branches. Consolidation requires assembled-result verification and integration review. Deployment/cleanup are separate choices.

These are prompt-driven protocols, not a new scheduling daemon or tracker API client. Trackers use the project's available authorized tools. Usage reporting records actual data where available and unknown otherwise; monetary ceilings need runtime metering to be hard limits.

## OpenCode provider-balanced model defaults

The default allocation puts OpenAI capacity into planning, architecture, and UX; OpenCode Go handles implementation/tests, and OpenCode Go/Zen handles review/security. Effort is selected per role rather than raised uniformly. It is a routing policy, not a benchmark or a guarantee about a model's capabilities, usage limits, or billing.

| Agent | Preferred model | Effort | Workload rationale |
| --- | --- | --- | --- |
| Analyst | `openai/gpt-6.1-sol` | medium | Direction, bounded refinement, specs, Tickets and tracker conventions |
| Lead | `openai/gpt-6.1-sol` | medium | Execution scheduling, run configuration and coordination |
| Architect | `openai/gpt-6-luna` | xhigh | Architecture, invariants, and consequential tradeoffs |
| Security | `opencode-go/deepseek-v4-pro` | high | Scoped trust-boundary assessment when enabled |
| UX | `openai/gpt-6.1-sol` | medium | Product-specific visual/interaction decisions and rendered contract review |
| Tester | `opencode-go/muse-spark-1.3-contributor` | medium | Tests against defined criteria/design notes |
| Developer | `opencode-go/muse-spark-1.3-contributor` | medium | Implement the defined architecture, behavior, and visual contract |
| Reviewer | `opencode-go/deepseek-v4-flash` | medium | Independent correctness/contract review and follow-ups |

Only models found in the installer's available list can be selected automatically. The ordered, exact-ID fallback lists live in `src/defaults.ts`:

- Lead prefers Sol 6.1, then Sol 6, then Terra at medium effort. Architect prefers Luna 6/xhigh, then Luna 5.6/xhigh; neither falls back to Astra. The Luna variants were verified through `opencode models openai --verbose`.
- UX falls back only to `openai/gpt-6-sol`; no cheap thinking/execution model is silently selected for design. If neither Sol candidate is available, no UX default is set and the installer explains that unset means inheritance. Select a suitable model manually before enabling UX work.
- OpenCode Go reasoning models have Zen equivalents as fallbacks. Implementation/tests prefer the flat-rate OpenCode Go Muse Contributor, then the OpenCode free Muse Contributor, then appropriate OpenCode reasoning models. The metered Meta API Muse Contributor is intentionally not a default.
- Reviewer prefers plain DeepSeek V4 Flash through Go or Zen, then V4 Pro/medium if Flash is unavailable. Security prefers V4 Pro/high. Neither role nor Developer/Tester automatically falls back to OpenAI.
- Astra and unlisted fast/premium variants are manual choices, never automatic matches. Exact matching avoids accidentally selecting a different variant merely because its name contains a preferred ID.

**Apply these defaults to an existing install:** run setup, choose **Reset all to defaults** (or reset an individual agent), then **Install & exit**. Saved model choices are preserved during ordinary reconfiguration; changing the defaults does not silently replace them. `npm run setup -- /path/to/target-repo --defaults` applies current defaults noninteractively and writes canonical prompts.

If a role has no available listed candidate, first-time/defaults installation leaves it unset (inheriting the current opencode model); an interactive reset keeps its existing choice. Check the resulting selections before running a quality-sensitive stage.

Only enabled roles consume work for a given run; the allocation changes naturally with your confirmed pipeline. When cheap/bounded work reveals unresolved architecture or design decisions, route them to the enabled decision owner or ask for reconfiguration before implementation guesses.

**Explicit upgrades:** for difficult bugs, disputed review findings, or a sensitive threat model that exceeds the current model's demonstrated capability, Lead can recommend a stronger model for that role and bounded task. Sol, Terra, or `openai/gpt-6-luna` are available choices in the checked catalog. Raising effort above the role's confirmed setting is also a separate, explicit user choice, not an automatic response to every failure. Record approved reconfiguration in the run contract and return to the normal defaults when the exception is finished.

## Your command restrictions

The shared policy distinguishes **forbidden** actions (stop and find an allowed alternative) from **approval-required** actions (wait for scoped authorization). Confirming the pipeline does not waive prohibitions or automatically authorize publication. Approval covers the specified action and target for that pipeline.

Add your preferences to the target repo's `AGENTS.md`. For example:

```markdown
## Team command policy

- Forbidden: `git reset --hard`, `git clean`, force pushes, and hook bypasses.
- Preserve existing user changes and worktrees.
- Ask before deleting existing files or running database migrations.
- Commits, pushes, PR creation/updates, and deployments require my explicit authorization for the current run.
```

Use your actual forbidden commands and allowed alternatives. All eight agents read the shared policy and applicable project instructions; Lead also passes restrictions to subagents. Commands executed through scripts or other agents have the same restrictions.

Prompt instructions guide model behavior. Configure runtime tool permissions or hooks as well when you need commands mechanically blocked.

## Workflow and evidence contracts

### Artifact handover

Configure tracker conventions once with /project-setup: GitHub Issues, Azure DevOps or local Markdown. Existing docs/agents/issue-tracker.md and AGENTS.md take precedence. Direction, specs and Tickets have distinct ownership; use links instead of editable copies.

Examples:
- Analyst: /wayfinder assess adding a waitlist to our booking app
- Analyst: /slice the waitlist direction into backlog tasks
- Analyst: /refine <selected task reference>
- Analyst: /plan <ready task reference> — optional technical planning
- Lead: /autonomous-implement <Ticket refs> — Developer + Reviewer; current checkout; local only
- Lead: /autonomous-implement <batch refs> — Architect x2 evaluated by Lead; concurrency 2; worktrees; one consolidated PR; scoped commit/push/PR/integration authorized

A supplied local spec works without remote tracker setup. Follow native field/state/dependency mappings and verify remote writes; unavailable access is a blocker, not a reason to fabricate Tickets.

The installer ships six skills and their references. Reinstall with overwrite enabled to update canonical prompts; Analyst receives its own configurable model entry. Existing custom agent prompts are retained when overwrite is disabled, so they may still use the previous workflow until manually updated. Existing project conventions are never rewritten by installation.

See the installed run-contract.md, proposals.md, worktrees.md and usage.md for execution protocols.

### GLM 5.2 option

The local catalog includes `opencode-go/glm-5.2` with `high` and `max` variants, and the effort picker supports them. “Max” is an effort setting, not a separately named model. Pricing/quota research and replacement recommendations are in [research/glm-opencode-go.md](research/glm-opencode-go.md). It is available as an explicit experiment; the current role defaults use the agreed matrix above.

Every role has an ordered workflow with completion criteria. Results use a common task-fit, outcome, scope, findings, verification, remaining-work, and next-owner format. Findings have consistent severity; Reviewer must explicitly conclude approved, changes required, or blocked.

Lead records the confirmed configuration separately from `team.config.json`, which remains the installer's per-agent model settings. The configuration covers all six toggles, candidate/evaluator choices, concurrency, scope, workspace/base, delivery mode, checks, bounds, command restrictions and publication permissions. See the installed skill's `references/run-contract.md` for the exact startup question and dispatch packet.

Framework/engine guidance lives in the skill's conditional `references/stack-guidance.md`. Agents consult the relevant section rather than applying web-specific advice to every game task.

For behavior-regression scenarios and evidence requirements, see [prompt-evaluation.md](prompt-evaluation.md).


## Resumable product workflow

Start Analyst with /project-setup to define documentation folders, task storage, lifecycle mappings and done gates. /wayfinder explores any product, game, area or major feature across unlimited sessions, maintaining briefs/specs/ADRs/glossary only where useful. /slice decomposes that direction into areas/domains and actual tasks marked ready-for-refinement. /refine updates one task across sessions until ready-to-implement. Handover one or more refined task references directly to Lead with /autonomous-implement. /plan is optional, never a mandatory extra product phase.

Analyst and Lead size the work and keep documentation proportional. Multiple candidate analyses and arbitration are configurable choices. Each specialist also supports direct consultation in a separate conversation without a Ticket or pipeline.

Reinstallation refreshes shared skills/policy even when native role instructions are kept; the CLI reports this distinction. Legacy planner model settings migrate to analyst when no analyst setting exists. Existing planner definitions are retained to protect custom instructions; the CLI flags them for deliberate migration/removal. Choose analyst for the current workflow.

## Optional Toady persona

Choose **Toady mode** in the agent configuration menu. The switch is off initially and saved separately in `.opencode/toady.config.json`; later configuration restores it. Noninteractive setup accepts `--toady` or `--no-toady` with any selected harness (including `--defaults`). The name is read locally from `git config --get user.name` in the target repository at installation time, with **Master** as fallback. No email is read and no identity lookup is sent to an external service; the chosen display name is part of the persona context sent to the configured model.

Installation writes `.opencode/personas/toady.md` and adds that local path to the root OpenCode `instructions` array. Existing JSONC comments, provider settings, permissions and unrelated instructions are preserved; malformed config is rejected. The persona is loaded at startup with normal project rules, including for built-in agents. Disabling removes only this exact instruction entry, retaining the file inactive. Start a new session to load the changed instructions.

Toady refers to itself in third person and uses brief, comic villain titles based on the Git name. The style affects conversation only: technical accuracy, independent critique, security policy, role ownership and code/document contents take precedence. Link formatting follows the host. The same TUI toggle supports every selected harness. Startup destinations:

| Harness | Persona destination |
| --- | --- |
| OpenCode | `.opencode/personas/toady.md` registered in root `instructions` |
| Claude Code | Managed block in `CLAUDE.md` |
| Codex | Managed block in root `AGENTS.override.md` if present, otherwise `AGENTS.md` |
| Copilot | Managed block in `.github/copilot-instructions.md` |
| Antigravity | `.agents/rules/toady.md` with `trigger: always_on` |

Existing instructions outside the marked block are preserved. Disabling removes only the marked persona block/entry. Each harness saves its own switch beside its team config; other installed harnesses are not reconfigured. Shared native rule files such as `AGENTS.md` may also be discovered by other tools according to their own compatibility rules; these are repo-level instructions, not workstation-global preferences. Malformed managed blocks and unmanaged conflicting Antigravity rules fail without replacement.
