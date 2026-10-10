# One agent per role, model chosen at install

Status: accepted; count superseded (seven at decision time, eight current).

At decision time the team shipped exactly seven agents — `lead`, `architect`, `security`, `ux`, `tester`, `developer`, `reviewer` — with no per-model variants (e.g. `developer-muse` vs `developer-deepseek`) and no separate Astra reviewer. The installer picks the model per agent at install time from what the target opencode install actually offers. An earlier proposal considered model-permutated agents and a hidden Astra reviewer; one agent per role keeps the installer, skill, and pipeline simple, and model choice becomes configuration rather than code.

## Amendment (current)

The no-agent-per-model-variants rationale stands and is now owned jointly with [ADR 0004](0004-skills-and-execution-packets.md): eight named agents for conversation and ownership, reusable procedures in skills. `analyst` is a separate eighth role, so the original "exactly seven" count is historical, not current.

Installer model configuration (which model each role uses, chosen from the install-time catalog with saved user choices preserved) is distinct from runtime inheritance (a role left unset inherits the current harness model at run time; model text in a prompt is not a runtime override). See [installation and team configuration](../team-configuration.md#opencode-provider-balanced-model-defaults) for the current defaults and fallback lists.
