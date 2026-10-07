# One agent per role, model chosen at install

The team ships exactly seven agents — `lead`, `architect`, `security`, `ux`, `tester`, `developer`, `reviewer` — with no per-model variants (e.g. `developer-muse` vs `developer-deepseek`) and no separate Astra reviewer. The installer picks the model per agent at install time from what the target opencode install actually offers. An earlier draft (`brief.md`) proposed model-permutated agents and a hidden Astra reviewer; one agent per role keeps the installer, skill, and pipeline simple, and model choice becomes configuration rather than code.


## Current amendment

The original seven-role decision remains: no agent-per-model variants. Analyst is now a separate eighth role. Selected-harness adapters configure native models, with inheritance outside OpenCode by default. Detailed procedures live in skills; native role files remain thin model/tool/ownership adapters. See ADR 0004.
