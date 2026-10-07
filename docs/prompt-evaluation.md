# Updated workflow evaluation

Use these scenarios for forward-testing the revised bundle. The historical cases below are retained as archive only, not release expectations. Their repeated-toggle, Lead-per-Ticket and forced single-Ticket isolation assumptions are superseded by the current scenarios above.

| Scenario | Expected behavior |
| --- | --- |
| New app with vague scope | Analyst/Wayfinder asks at most three material questions per turn; supports unlimited sessions with persisted decisions/open questions |
| New idea in established app | Existing direction preserved; fit/next action assessed without rediscovery |
| Unknown feasibility | Refine creates a bounded spike or blocked contract, not invented implementation criteria |
| Small local task | Developer + Reviewer; one task result, no mandatory extra reports; reliable final-version evidence reused unless independent execution required |
| Small ready change | Refine updates one task; direct Lead handover without mandatory Plan/spec |
| Repeated Slice | Create new tasks ready-for-refinement; preserve existing states, identities and accepted scope |
| Paused Refine | Persist in-refinement and resume same task without repeating settled questions |
| Standalone Architect | Consult without Ticket or Lead; return recommendations/authorized ADR without starting pipeline |
| Existing remote tracker | Project Setup reuses conventions; verifies access/mapping before writes |
| A blocks B; C independent | One Lead runs A/C, starts B when verified A commit is usable; no wave-wide wait |
| Fully specified run | Reuse supplied settings; no repeated startup form |
| Two architecture candidates | Independent read-only inputs, bounded concurrency, one evidence-based evaluation |
| Neither candidate meets constraints | Block/spike; do not force a winner |
| Consolidated PR | Topological integration plus checks/review of assembled result |
| Cost data absent | Unknown metrics; no invented cost or guaranteed monetary cap |
| Reviewer fixes | Stable findings, bounded delta review; broaden on invalidated shared behavior |


## Current validation protocol

Install into a disposable repo, start a fresh native Lead and judge actual dispatch, diff, checks, tracker states and final evidence. Record model/provider/effort/harness version, scenario, pass/fail/not-run and sanitized aggregate metrics. Installer tests and source read-through do not establish model adherence. Production/Vertex measurements remain separate from local simulations.

| Additional scenario | Observable expectation |
| --- | --- |
| Related ready tasks | One proposed bounded packet may share Developer/Reviewer contexts, with separate criteria/outcomes |
| Separate PRs with related tasks | Separate diffs preserved; split packets if grouping would blur delivery |
| Packet with dependent task | Required prerequisite checks/review occur before dependent edits; local state allowed only in same checkout |
| Partial packet failure | Failed/blocked task stays active; no blanket done from other task success |
| Tester test-design | Read-only cases/seams, Developer owns tests |
| Tester test-author | Explicit test ownership, real red signal or blocked environment, no production edits |
| General-subagent explicit model unsupported | Capability gap and user choice; no prompt-only override or silent inheritance |
| Unmarked skill collision | No writes until explicit adoption; no automatic overwrite |
| Symlink/invalid late destination with persona enabled | Preflight rejects before persona/team writes |
| Long Wayfinder resume | Current state read first; settled decisions/questions preserved |
| Missing usage | Unknown, no fabricated savings or hard billing cap |

Historical scenarios live in research/historical-prompt-evaluation.md; their earlier full toggle forms, note files and isolation defaults are superseded.

## Recorded local packet evidence

2026-10-08: fresh-context Lead used a newly installed Codex-format bundle in a disposable formatter repo, with two related ready tasks, Developer+independent Reviewer, concurrency one, inherited models and local delivery. Lead selected one packet, dispatched each role once, and retained individual task results. One test execution passed three tests/nine assertions; Reviewer approved both criteria/interactions on pass one. No repairs, extra reports or publication. Wall phases: Developer ~52s, Reviewer ~42s, contract-to-recording ~119s (intake excluded). This is one behavioral trial through this environment's native agents, not live Codex/OpenCode client validation or proof of Vertex/token savings.
