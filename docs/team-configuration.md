# Installation and team configuration

Run `npm run setup -- /path/to/target-repo`. Select one harness in the TUI, configure agent models/effort, canonical prompt overwrite and optional Toady. No .gitignore changes or unrelated harness folders. CLI defaults: `npm run setup -- /path/to/target-repo --harness=codex --defaults`.

## Installation ownership and paths

Validate all team destinations and persona changes before the first installation write. Reject symlink roots/children, dangling links, escaping paths, incompatible file types and malformed known configuration. Recheck skill paths during copying. Source skills must use regular files/directories. These checks prevent ordinary linked-destination writes; this is not an OS sandbox or a defense against a hostile process changing paths concurrently.

Each installed skill has a .team-owner.json marker. Existing unmarked folders (including previous versions and external packages with the same name) require explicit adoption. Interactive setup asks once for listed collisions; noninteractive setup stops unless you supply `--replace-skills`. Review the listed folders first: adoption authorizes overwriting their shipped paths. Other skills are untouched. Custom contents within owned shipped paths can be replaced during refresh; back up intentional skill edits first. No folder deletion/cleanup is automatic.

Refresh canonical agent instructions with overwrite=yes; overwrite=no retains edited prompts while updating model choices. Operator-defined native permissions, tools, hooks and MCP integrations survive instruction refresh. Shared procedures always refresh. Legacy planner settings migrate to Analyst during interactive configuration; old planner definitions remain until deliberately removed.

Preflight is read-only validation, not a filesystem transaction. Disk errors or concurrent modifications after validation can still cause partial writes. Do not run the installer against a concurrently mutated checkout.

## Selected-harness layout

| Harness | Agents | Skills | Model default |
| --- | --- | --- | --- |
| OpenCode | .opencode/agents/*.md | .opencode/skills/ | Existing agreed routing matrix below |
| Claude Code | .claude/agents/*.md | .claude/skills/ | Inherit |
| Codex | .codex/agents/*.toml | .agents/skills/ | Inherit |
| Antigravity | .agents/agents/*.md | .agents/skills/ | Inherit; optional flash/pro tiers |
| Copilot | .github/agents/*.agent.md | .github/skills/ | Inherit |

CLI/GUI discovery depends on version, project trust and native multi-agent access. The installer writes formats; it does not enable runtime features. Portable role bodies and references/roles/runtime.json preserve the selected model/effort and native-definition path for general-subagent dispatch. Model text in a prompt is not a runtime override: unavailable explicit selections require a capability decision rather than silent inheritance.

Fresh Reviewer defaults use OpenCode edit-deny, Claude denied Write/Edit/NotebookEdit and Codex read-only sandbox. Existing native controls take precedence on reinstall. Removing edit tools alone does not stop shell writes; enforce meaningful shell/network limits in the runtime. Architecture/Security/UX retain possible authorized document persistence and prompt ownership boundaries. Antigravity integrations can be added in native configuration; defaults are not a universal MCP/browser setup.

## Procedures and team

Eight named agents remain available: Analyst, Lead, Architect, Security, UX, Tester, Developer, Reviewer. Twelve skills contain the methods:

| Activity | Skill |
| --- | --- |
| Conventions / direction / decomposition / refinement / optional technical plan | project-setup / wayfinder / slice / refine / plan |
| Execution coordination | autonomous-implement |
| Structural decision / trust-boundary assessment / interaction contract | architecture-assess / security-assess / interface-assess |
| Independent cases / implementation / independent review | test-design / implement-task / review-change |

No procedure depends on external Matt Pocock skills being installed. Existing TDD/debugging skills can be used when relevant; do not invoke two procedures for the same work automatically. Agents load only assigned procedures and absent role/core instructions. Standalone consultation needs no Ticket, Lead or pipeline.

Wayfinder/Refine support unlimited resumable sessions, at most three consequential questions per turn, and a small Current state section in the owning artifact. Long exploration is valid. Slice creates real tasks ready-for-refinement; Refine updates the same IDs until ready-to-implement. Plan remains optional.

## Execution choices

Setup optionally stores chosen execution preferences in docs/agents/execution.md or the existing equivalent. They are separate from team.config.json model settings. Precedence: current invocation, explicit session choices, project preferences, lean recommendations. Defaults are not permission to publish/deploy.

Lead classifies scope/uncertainty/risk and recommends lean Developer+Reviewer. Extra specialists need concrete value. Tester is test-design/read-only by default when enabled; explicit test-author assigns test ownership separately. Developer owns tests otherwise. Optional independent candidates use distinct lenses, evidence and a bounded evaluation; consensus is not proof.

Group bounded related tasks into an agreed execution packet when context, permissions, checks and delivery align. One Developer and independent Reviewer can cover the packet, with separate task IDs/criteria/statuses and interaction checks. Do not group away separate PR diffs. Split unrelated/large/risky work or conflicting ownership. Required intermediate dependency gates still apply; same-checkout sequential tasks may use verified local state, while cross-worktree dependencies require verified usable commits and integration permission.

One local packet uses current checkout. Concurrent writable packets use isolated worktrees; concurrency counts workers, not tasks. One Lead manages the frontier without wave-wide waits or Lead-per-task by default.

Before execution Lead asks for local/separate/stacked/consolidated delivery unless already explicitly chosen. Stack/consolidate remain available later on demand; no automatic PR closure, deletion, force push, merge or deployment. Effective contract is recorded once. Detailed run-contract/proposal/worktree references load only when relevant.

Default review budget: two total passes per agreed review unit, stopping on approval. Delta rereview reuses reliable unchanged evidence. Remaining findings or missing gates at the limit are reported with the next option; unreviewed fixes are not approved. Integration invalidates relevant evidence and requires assembled checks/review.

Optional usage reporting accepts sanitized actual aggregates, tracks coverage/unknowns and compares cost per correctly delivered result. The local summarize-usage script does not fetch billing or export conversations. Cached/reasoning fields may overlap provider totals. Hard monetary limits require runtime enforcement.

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

## Optional Toady

One opt-in TUI switch or `--toady` / `--no-toady` works for the selected harness. Git user.name is read locally with Master fallback; the chosen name becomes persona context for the selected model. Persona affects user-facing tone, not source/docs, internal handoffs or honest review.

| Harness | Startup instruction |
| --- | --- |
| OpenCode | .opencode/personas/toady.md in root instructions array |
| Claude Code | Managed block in CLAUDE.md |
| Codex | AGENTS.override.md if present, otherwise AGENTS.md |
| Copilot | Managed block in .github/copilot-instructions.md |
| Antigravity | .agents/rules/toady.md, always_on |

Preserve unrelated rules/provider settings; disabling removes only the managed block/entry. State is stored per selected harness; shared native rules may be discovered by other tools. Use a fresh session after changes.

## Validation status

Package tests check all five layouts and local links, collision handling, path safety and metadata preservation. These are not proof of discovery/spawning/model adherence in each CLI/GUI. Codex-target installation and fresh-context workflow tests run in disposable repos. Corporate OpenCode/Gemini/Vertex latency, tokens and native permission behavior require measurement on that runtime. Follow docs/prompt-evaluation.md before claiming a harness/model behavior pass.
