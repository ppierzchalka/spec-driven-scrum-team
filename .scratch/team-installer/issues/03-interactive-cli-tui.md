# 03: Interactive CLI + TUI

**What to build:** The `./install [path]` entry point and the layered `@clack/prompts` menu. Run from this repo against a Target repo path (prompted if omitted). The menu walks agents → pick one → choose model (authed-only + type-your-own) → choose reasoning effort → back. On first run no models are preselected (agents inherit opencode's current model if you save and exit); on re-run the persisted choices from `team.config.json` are shown and editable. A per-Agent "overwrite instructions?" toggle decides whether the canonical prompt is rewritten or local edits survive. Writes the final install through `installTeam`.

**Blocked by:** 01 (installTeam engine), 02 (model enumeration + effort derivation).

**Status:** ready-for-agent

- [ ] `./install [path]` runs from this repo against a Target repo path (interactive prompt when omitted)
- [ ] Layered menu: list agents → select one → pick model → pick reasoning effort → back
- [ ] Model list is authed-only from enumeration, with a type-your-own option
- [ ] First run: models unset by default, so saving/exiting yields agents that inherit opencode's current model
- [ ] Re-run shows persisted choices from `team.config.json` and allows editing
- [ ] Per-Agent "overwrite instructions?" toggle: canonical prompt written or local edits preserved
- [ ] Completing the flow calls `installTeam` and reports what was written