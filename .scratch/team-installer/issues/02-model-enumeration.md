# 02: Model enumeration + reasoning-effort derivation

**What to build:** Two pure functions that feed the TUI. The first parses `opencode auth list` and `opencode models [provider]` stdout into the list of models actually available to the target opencode install (authed providers only, with an "all catalog" escape hatch). The second derives the supported reasoning-effort levels for a given provider/model (Google → minimal/low/medium/high; OpenAI → none/minimal/low/medium/high/xhigh; DeepSeek → none/low/medium/high; Anthropic → none/high/max) with a "don't set" default.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Parser converts `opencode auth list` output into authed provider ids
- [ ] Parser converts `opencode models [provider]` output into model ids for a provider
- [ ] Custom/typed model ids are accepted alongside enumerated ones
- [ ] Effort derivation maps provider/model → supported levels, returning "don't set" as the default option
- [ ] Unit tests cover canned outputs and the provider mappings