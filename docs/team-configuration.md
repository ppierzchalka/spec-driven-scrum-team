# Configure the installed team

## Models and updated prompts

Run `npm run setup -- /path/to/target-repo` from this tool repo. Select an agent, then **Model**. Type part of a provider or model ID (for example `muse` or `openai/gpt`) to filter the list, use arrow keys to select, and press Enter. Clear the search to find **Don't set** or **Type your own model id…**.

To apply updated canonical prompts to an existing install, keep **Overwrite instructions** set to **yes** for each agent you want updated. Choose **no** to preserve a locally edited prompt. The skill and its shared `TEAM-POLICY.md` are copied on each install. Open a fresh opencode session after reinstalling.

## Pipeline selection

Invoke `/autonomous-implement` as Lead with your Ticket references or PR feedback. Before execution, Lead asks you to confirm the on/off state of architect, security, UX, tester, developer, and reviewer, plus relevant checks and command/publication permissions. Lead stays on as coordinator.

Repo defaults and command arguments are suggestions for that confirmation, not a way to bypass it. For local game mechanics, security is normally proposed off; networking, accounts, untrusted content, or sensitive data can make it relevant. Your confirmed selection governs the run and its fix loops.

## Provider-balanced model defaults

The default allocation puts OpenAI capacity into planning, architecture, and UX; OpenCode Go handles implementation/tests, and OpenCode Go/Zen handles review/security. Effort is selected per role rather than raised uniformly. It is a routing policy, not a benchmark or a guarantee about a model's capabilities, usage limits, or billing.

| Agent | Preferred model | Effort | Workload rationale |
| --- | --- | --- | --- |
| Lead | `openai/gpt-6.1-sol` | medium | Requirements grilling, specs, overall planning, and coordination |
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

Use your actual forbidden commands and allowed alternatives. All seven agents read the shared policy and applicable project instructions; Lead also passes restrictions to subagents. Commands executed through scripts or other agents have the same restrictions.

Prompt instructions guide model behavior. Configure runtime tool permissions or hooks as well when you need commands mechanically blocked.

## Workflow and evidence contracts

### Plan elsewhere, implement in your terminal

Use your chosen grilling/planning skills and save the agreed specs, criteria, decisions, and dependencies as GitHub issues or local files. Then invoke the single `/autonomous-implement` skill with those existing artifacts:

```text
/autonomous-implement https://github.com/<owner>/<repo>/issues/<number>
/autonomous-implement .scratch/<feature>/spec.md
```

No handover skill, preparation command, or extra dispatch document is required. The implementation session reads the supplied artifacts and linked decisions directly; it does not need planning-chat history or tracker setup for a directly supplied local spec. It asks focused questions only if consequential requirements are missing or contradictory.

A single Ticket uses the current worktree; Lead asks whether you want to use it instead of proposing a new one. Parallel Tickets each use a new branch and independent worktree. Lead dispatches specialist subagents directly for one Ticket. For parallel Tickets, Lead dispatches one Lead-role subagent per Ticket in the current session. Open another terminal yourself when you want an independent session. Dependent tasks wait for an agreed usable prerequisite commit.

Worktrees isolate Git branches and checkouts only. Publication, integration, and cleanup require scoped permission. See the installed `references/worktrees.md` for setup rules.

The installer ships only `/autonomous-implement` and its references. Reset Architect to its new Luna/xhigh default when applying the revised allocation; ordinary reconfiguration preserves saved model choices.

### GLM 5.2 option

The local catalog includes `opencode-go/glm-5.2` with `high` and `max` variants, and the effort picker supports them. “Max” is an effort setting, not a separately named model. Pricing/quota research and replacement recommendations are in [research/glm-opencode-go.md](research/glm-opencode-go.md). It is available as an explicit experiment; the current role defaults use the agreed matrix above.

Every role has an ordered workflow with completion criteria. Results use a common task-fit, outcome, scope, findings, verification, remaining-work, and next-owner format. Findings have consistent severity; Reviewer must explicitly conclude approved, changes required, or blocked.

Lead records the confirmed configuration separately from `team.config.json`, which remains the installer's per-agent model settings. The configuration covers all six toggles, scope, workspace/base, required/manual checks, fix-round limit, command restrictions, and publication permissions. See the installed skill's `references/run-contract.md` for the exact startup question and dispatch packet.

Framework/engine guidance lives in the skill's conditional `references/stack-guidance.md`. Agents consult the relevant section rather than applying web-specific advice to every game task.

For behavior-regression scenarios and evidence requirements, see [prompt-evaluation.md](prompt-evaluation.md).
