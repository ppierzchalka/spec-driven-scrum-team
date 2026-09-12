# 01: Project scaffold + installTeam generation engine

**What to build:** The TypeScript/ESM project and the core pure generation module. Given the seven Agent definitions, a resolved per-Agent config (`{ model?, reasoningEffort? }`), and a Target repo path, it writes the seven agent files under `.opencode/agents/` (with correct frontmatter — `model` key omitted when unset, reasoning effort applied when set), copies the `/autonomous-implement` skill into `.opencode/skills/`, and writes `team.config.json`. Ships initial canonical Agent definitions and a skill stub so a run produces a complete, valid install.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] TS/ESM project scaffolded (bun + tsc build, test runner) with a test command that runs headless
- [ ] `installTeam(definitions, config, targetDir)` writes seven agent markdown files with correct frontmatter (`description`, `mode`, `model` only when set, reasoning-effort key only when set)
- [ ] An unset model omits the `model` frontmatter key entirely (agent inherits opencode's current model)
- [ ] The skill is copied into the Target repo's skills directory
- [ ] `team.config.json` is written with the per-Agent config
- [ ] The seven canonical Agent definitions exist in this repo (lead, architect, security, ux, tester, developer, reviewer — no variants)
- [ ] Temp-dir tests assert the full generated layout and frontmatter behavior