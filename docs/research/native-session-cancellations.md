# Native session cancellations: bounded diagnostic report

Date: 2026-10-09 UTC. Task11 outcome: **runtime cause unresolved**. No runtime repair or live reproducer was executed; permission-reply HTTP 404s are correlations, not proof of an initiator or causal direction. This durable report preserves the historical evidence before temporary backlog cleanup.

## Scope, environment and evidence identity

Direct checks used Linux, checkout `follow-up/grooming-and-pipeline`, HEAD `4be1db6bef208bae0087c92c47da693de6fecba6`; tracked status was clean before this report. CLI `/home/ppierzchalka/.opencode/bin/opencode --version` returned `opencode v2.0.24`. A CLI version does not independently verify the running server version. This repository supplies agent instructions and an installer, not the native session runtime.

Evidence sources (direct inspection means this operation, reported means earlier observers):

- **S09 — directly read historical record**, [task09](../../.scratch/team-installer/issues/09-verification-feedback-and-interruption-diagnostics.md), paragraphs “Cancellation investigation” and “Operations returned”; SHA-256 `61843431975cff0a844b027d1f151ced8f2d557b7d80fc7c13a75babc6f99273`. Its runtime observations are historical reports, not freshly reproduced checks. The source records timing base `26ff0b3` with dirty task08; it does not tie cancellation incidents to individual checkout versions. Delivery later reached `4be1db6bef208bae0087c92c47da693de6fecba6`. Preserve this link while the local record exists; on authorized task10 removal, use this report as the migrated evidence destination.
- **S11 — directly read accepted contract**, `.scratch/team-installer/issues/11-cancellation-debugging.md`; SHA-256 at inspection `c363ee04b4c9315d77eedd57128eab9857a87c75333868a9dd11208ba12c53c4`. Final validation found this external source had changed to `837dd208506aeb09d9ffca3205401121b02e09c6cc62b63b7831fe475189c466`; the initial unchanged-source assertion therefore failed. This operation did not change any task record; S09 remained identical. Criteria below reflect the contract read, not a claimed review of subsequent lifecycle edits.
- **E — reported independent Explore findings supplied by Lead**: `/home/ppierzchalka/.local/share/opencode/log/opencode.log`, line 141930 at `2026-10-09T17:36:54.682Z`, renderer session `ses_edeb049b7ffeWBQOKaYjS0zt99`; line 144066 at `2026-10-09T19:47:39.084Z`, child Lead session `ses_ede02d3e1ffeJj5HxS2MbNDBIw`. Both were identified as permission-reply POST 404s. This operation did **not** read that private log or verify full contents, endpoint/request body, permission IDs or file hash. Other session references inside diagnostic payloads are not native abort events.
- **L — Lead-supplied operation observation**: caller's child Lead was cancelled before the `git status` tool returned, with tool interrupted and no children reported. Exact cancellation UTC, tool exit result and initiator were not supplied. Separately reported native child-tool spawn gap is a capability limitation, not a demonstrated cancellation cause.
- **H — direct help/version inspection**, starting `2026-10-09T19:52:28.040087Z`. No service status/API request, profile/configuration read, provider log, authentication output, session export, database, network lookup, build/test, signal or induced cancellation was performed. No upstream publication, staging, commit or push occurred.

E's sanitized **reported projection** is defined as these exact UTF-8 lines with a final LF (hash identifies this projection, not the log or independently proven events):

```text
2026-10-09T17:36:54.682Z|141930|ses_edeb049b7ffeWBQOKaYjS0zt99|permission-reply POST|404
2026-10-09T19:47:39.084Z|144066|ses_ede02d3e1ffeJj5HxS2MbNDBIw|permission-reply POST|404
```

Projection SHA-256: `f38f9af3e3ebeba88325dd60e91296dc902fbc6d3f96a9f5ec697307956d12f3`. No raw log, credentials, headers, request body or prompt content is included.

## Incident ledger

All times below are UTC; unknown fields remain unknown. HTTP timestamps are not independently established cancellation timestamps.

| Incident | Time | Evidence and session correlation | Owned command state / limits |
| --- | --- | --- | --- |
| Historical 404 cluster 1 | 2026-10-09 06:11:57.123 | S09 reports permission-reply POST404 for an interrupted session; session/permission IDs absent from preserved record | No initiating action, command result, deadline or native event sequence retained |
| Historical 404 cluster 2 | 2026-10-09 12:56:24.808 | Same S09 finding; IDs absent | Same missing fields |
| Historical 404 cluster 3 | 2026-10-09 15:18:29.148 and .150 | S09 reports one cluster with two timestamps, not two proven cancellations; IDs absent | Same missing fields |
| Historical render-operation interruption | Exact UTC unknown | S09 reports native cancellation during final checks; no session log or pending permission visible during reconciliation; session ID absent | Lead reconciled **no running owned checks**, then resumed only final typecheck/helper/timing-repeat checks. Interrupted results were not claimed passed or failed. No reliable mapping to a particular 404 cluster |
| Renderer 404 lead | 2026-10-09 17:36:54.682 | E, log line 141930, `ses_edeb049b7ffeWBQOKaYjS0zt99` | Permission ID, initiating action, native cancellation timestamp and command state unknown |
| Child Lead 404 lead | 2026-10-09 19:47:39.084 | E, log line 144066, `ses_ede02d3e1ffeJj5HxS2MbNDBIw` | L reports cancelled-before-git-status-return/tool-interrupted/no children; correlation does not establish when/who cancelled or the status result |

S09 historically reported OpenCode V2.0.24, healthy service/responsive API, no kernel/cgroup OOM evidence, about 4.47 GiB available RAM at that observation, and no established provider timeout, abort/initiator or attributable billing evidence. These are **not current health checks** and cannot rule out an unrecorded historical failure. Original diagnostic capture identities/times and underlying sanitized native events are unavailable in the preserved task09 text. Historical successful bounded resume is not a runtime cure.

## Event taxonomy and explanations

| Classification | Required distinguishing evidence | Present disposition |
| --- | --- | --- |
| Native session cancellation | Native session lifecycle event, actor/action and timestamp | Reported in S09/L; initiating native event unavailable |
| Explicit abort | Recorded user/tool/API abort with target session and time | Untested; no initiator proof |
| Command deadline | Owned command timeout/deadline and teardown/exit record | No demonstrated timeout for these incidents; interrupted tool result remains unknown |
| Rejected permission | Permission lifecycle and a recorded deny/reject decision | Untested; reply 404 is not itself a rejection decision |
| Failed assertion | Completed test output with assertion failure | No such output establishes these cancellations; tool interruption is not assertion failure |
| Provider error | Sanitized request/error identity and matching UTC/session | Untested; S09 did not establish provider timeout/error |

Proposed explanations:

- **Observed (reported)**: permission-reply POST404s correlate with interrupted session IDs; direct observation here is of S09 text and CLI help only.
- **Supported inference, narrowly**: permission lifecycle/reply routing merits investigation. The recorded reply failed with 404; its underlying resource state is unknown.
- **Untested alternatives**: cancellation invalidated a pending permission before reply; a stale UI reply targeted a removed permission; a reply/lifecycle defect preceded cancellation; explicit abort; provider or resource failure. No ordering/actor trace selects among them.
- **Contradicted as an evidence claim**: “404 proves who cancelled,” “embedded session ID proves native abort,” “interrupted command proves failed assertion/deadline,” or “prompt changes fix native runtime.” Existing evidence cannot support any of these conclusions.
- **Not established, not ruled out**: OOM/provider-timeout causes. Historical absence of evidence is neither a causal diagnosis nor present health assurance.

## Supported diagnostic surface and permission gaps

H help lists `debug paths` (global paths), `debug agents`, `debug config`; `service status`; `session list`, `delete`, `export`, `import`; and `api` by OpenAPI operation ID or HTTP method/path. Only help/version was run. Paths/status/list could be useful with bounded authorization, but configuration/authentication and full session exports are inappropriate sanitized diagnostics here. Generic API access is not permission to invent endpoints or trigger cancellation. No dedicated cancellation-initiator history command was advertised by the inspected help; that does not prove the runtime lacks internal telemetry.

Lead/runtime owner must request an approved sanitized lifecycle projection: session and parent IDs, permission ID, UTC event times, permission create/reply/resolve/invalidate order, reply method/status, initiating UI/API/tool action and actor category, abort/cancel reason, native child spawn availability, and owned-command start/deadline/exit/teardown state. Exclude auth, headers, request bodies, prompts and full configuration. Correlation identifiers can be pseudonymized consistently for external sharing. Missing provider/service traces require separate scoped permission and owner-led redaction; private log/database inspection is not an authorized fallback.

## Smallest controlled reproduction proposal — NOT EXECUTED

1. Obtain separate runtime-owner approval for an isolated disposable session, any instrumentation change, and any induced cancellation. Record exact client/server versions, platform and runtime revision if available without exposing configuration. Do not use live production work or change model/effort.
2. Initial state: no pending permission, no owned subprocess, one disposable parent/child pair, confirmed native child spawning capability. If spawning is unavailable, record that distinct blocker and stop rather than interpreting it as cancellation.
3. Submit a harmless, owner-approved permission-gated read-only action. Expected baseline transitions: session active → permission created/pending → one allow reply → permission resolved → action completion/session idle. Capture only the sanitized fields above. A completed denied decision is a separate control, not a 404.
4. Under explicit cancellation permission only, repeat once and record one known UI/API initiating action while permission is pending. Expected observed ordering must be captured, not presumed: cancellation, permission invalidation and reply receipt may race. Do not repeatedly send stale replies or retry new sessions blindly.
5. Actual existing failure evidence: reported permission-reply 404 and session interruption; no captured native initiator/order. Proposal success means one complete trace can distinguish initiator and causal ordering (whether or not it reproduces a defect). Failure oracle: reply 404 or unintended session cancellation without traceable actor/order, with command deadline/assertion/provider errors separately classified. A 404 after deliberate cancellation alone does not demonstrate the original defect.
6. Stop after one baseline and at most one explicitly authorized cancellation attempt, or immediately on an unexpected effect, sensitive output, unavailable trace/capability or non-isolated work. Preserve completed evidence/partial work; do not signal global processes, restart services, edit databases/profiles or claim unknown command results. A later regression must target the established cause, not merely suppress a 404.

## Upstream issue draft — unpublished

**Title:** OpenCode v2.0.24: interrupted agent sessions correlated with permission-reply POST404; initiator/order unknown

**Environment:** Linux; directly checked CLI v2.0.24 on 2026-10-09; historical S09 also reports runtime V2.0.24, not freshly verified server identity. Repository base `4be1db6bef208bae0087c92c47da693de6fecba6`. Provider/model, server revision, permission IDs and original initiator are not established and were not exported.

**Expected:** permission replies and session lifecycle have attributable outcomes; interruption diagnostics distinguish cancellation from timeout, permission denial, assertion failure and provider errors. Stale replies should have a documented outcome that does not obscure the lifecycle sequence.

**Actual:** three historical UTC 404 clusters and two later reported session-correlated 404 leads (ledger above); historical render-operation cancellation reconciled without running owned checks; child Lead tool interrupted before git-status result. No causal trace or minimal live reproducer available. Resume completion does not explain cancellation.

**Reproduction limitations:** proposal above is unexecuted; private logs/profile/database and live cancellation are outside this spike. No runtime fix was attempted. Native child-tool spawn gap is separately reported, not cause evidence.

**Requested maintainer help:** identify supported sanitized lifecycle/initiator telemetry for v2.0.24; clarify permission invalidation/reply-404 semantics and known races; advise a bounded regression once trace establishes the ordering. Request only the redacted fields listed above, not auth/configuration or whole session exports.

**Next owner:** Lead requests scoped runtime-owner/maintainer diagnostic approval and decides whether to run the disposable proposal or publish a redacted issue. This document grants neither permission. No supported repair is selected until direct evidence identifies a cause.

## Measured direct checks

All commands exited 0; durations are measured monotonic subprocess wall time, not incident/session duration.

| Check | Seconds |
| --- | ---: |
| `git branch --show-current` | 0.0013 |
| `git rev-parse HEAD` | 0.0012 |
| `git status --short` (initial) | 0.0026 |
| CLI `--help` | 0.0732 |
| CLI `debug --help` | 0.0627 |
| CLI `session --help` | 0.0636 |
| CLI `service --help` | 0.0652 |
| CLI `--version` | 0.0666 |
| CLI `api --help` | 0.0628 |

Initial combined command/source-hash pass: 0.2701 seconds. Report/source-reference and projection-hash validation is recorded in the Developer handoff against the final report SHA-256 (avoiding a self-referential report hash). No build/test gate was required for this report-only change.
