# Per-agent usage telemetry

Capture OpenCode-reported model usage for each implementation run and report it by agent and model. Keep the measurements in the private run registry; do not add raw session exports or transcripts to the repo, PR, or canonical Ticket.

## Capture boundary

At run start, record the run timestamp, the controller's OpenCode session ID, and each root Lead worker's session ID. For a Lead working in the current interactive session, record the current session ID and the run-start boundary so earlier conversation usage is excluded. If the current session ID is unavailable, use the session list only when the active session is uniquely identifiable; otherwise mark controller usage unavailable rather than guessing. For each worker, discover its descendant sessions after completion using the OpenCode session tree (`parentID` / session-children API) or the child-session IDs already recorded during dispatch. Include only sessions belonging to this run.

Use OpenCode session messages or `opencode export <session-id> --sanitize` to read structured usage. OpenCode `AssistantMessage` records expose `providerID`, `modelID`, `cost`, and `tokens` (`input`, `output`, `reasoning`, `cache.read`, `cache.write`). A session's `UserMessage.agent` identifies its assigned agent. Attribute assistant usage to that agent within the session; if the session has no explicit agent identity, use explicit dispatch/subtask metadata. Keep usage `unattributed` when neither source identifies the role—never infer a role from the model name or message contents.

The official API exposes session children and messages, and the CLI supports JSON session export. `opencode stats` is useful for aggregate project/model statistics, but does not provide reliable per-agent attribution; do not divide those totals among agents.

## Aggregation

Group by **run → Ticket → agent → provider/model**. Include:

- assistant-message/request count, and count of messages carrying errors;
- input, output, reasoning, cache-read, and cache-write token counts as separate fields;
- summed OpenCode-reported `cost`, labelled as OpenCode-reported (not a provider invoice or guaranteed billing amount);
- collection status (`complete`, `partial`, or `unavailable`) and a short reason for missing/unattributed records.

Sum message-level usage once. Do not add `reasoning` to input/output totals or cache counters to another token field to manufacture a combined total; fields can overlap. If a metric is absent, record it as unavailable/null, not zero. Do not estimate usage from prompt length, elapsed time, or model pricing.

Write only the aggregate and minimal source metadata (run/session IDs, model IDs, collection time) into the run record under the common Git directory's private `team-runs/` root. Process sanitized exports transiently; discard raw message content after aggregation. Never copy API keys, private prompts, code, or transcripts into the telemetry record.

## Completion report

Report a compact table grouped by agent and model: requests, input/output/reasoning/cache tokens, OpenCode-reported cost, and collection status. Include an `unattributed` row where needed. Distinguish zero usage from unavailable data. If telemetry collection fails, finish the implementation workflow and report the precise gap; do not block completion or claim a measured total.

## OpenCode references

- [CLI: stats and JSON export](https://opencode.ai/docs/cli/#stats)
- [Server API: session children and messages](https://opencode.ai/docs/server/#sessions)
- [SDK message/session types](https://opencode.ai/docs/sdk/#sessions)
