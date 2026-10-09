# Pipeline time and coordination — task 12

## Outcome and boundary

2026-10-09. Report-only operation: no pipeline, policy, tests, model, runtime or publication changes. Reuse [task13's measured baseline and candidate](test-value-and-runtime.md); do not rerun suites just to time this report. The evidence demonstrates expensive rendered/release commands and a local focused improvement, **not a measured dispatch-to-verdict improvement**. No complete critical path, coordination-overhead total, queue time, token usage or billing can be computed from the available observations.

The smallest justified next step is an identity-led evidence-reuse pilot on a genuine small packet. Its protocol below is executable but **unmeasured**: two comparable dispatch-to-independent-verdict intervals are missing. This satisfies the accepted protocol alternative; it does not claim an executed pipeline pilot or independent approval. Lead owns scheduling, final gates, task lifecycle and the consolidated delivery. Task13 owns individual test changes; its ongoing read-only long-path diagnosis is not an approved repair.

## Sources, identities and measurement conventions

Direct inspection here means reading existing records/artifacts, not re-executing their commands. Historical test observations were executed by earlier operations. The excerpts below preserve selected sanitized facts durably before temporary task cleanup; local `/tmp/opencode/` artifacts are not permanent hosted evidence.

| Source | Content identity at inspection | Provenance / limitations |
|---|---|---|
| Historical task09 record | SHA-256 `61843431975cff0a844b027d1f151ced8f2d557b7d80fc7c13a75babc6f99273` | Directly read `.scratch/team-installer/issues/09-verification-feedback-and-interruption-diagnostics.md`; selected observations migrated below. Historical timing base `26ff0b3`, dirty task08; not the later delivered identity. No durable dependency on its ignored link. |
| [Task13 report](test-value-and-runtime.md) | SHA-256 `90138faf9b39ee0f87833e56bb993b1d7ddb766cff4f489781ef1b6373fbad99` | Directly read current report and baseline JSONs; no new execution. Final report content differs from report identity used during its code checks. |
| [Task11 cancellation report](native-session-cancellations.md) | SHA-256 `524e3b8802d24dde90b26b5387d4cc056d1ae0e148c951971ca75ad86efe68ed` | Durable incident taxonomy and sanitized correlation ledger; initiator/root cause unresolved. No private logs inspected here. |
| Lead packet | No serialized content hash supplied | Reported task11 Developer phase 122.016s, validation 0.0053s, independent Reviewer validation 0.000662s. These are different scopes, not interchangeable pipeline intervals. |

Current task13 baseline HEAD is `4be1db6bef208bae0087c92c47da693de6fecba6`; working-tree fingerprint `e4916d8b3a84c9364c532a25bb207426888f7903f306549160b1d0bf15674c34`. Fingerprinting hashes sorted cached/unignored paths, NUL, bytes (or `<deleted>`), NUL; it includes the then-untracked cancellation report. All three baseline post-command identities matched. Environment: Linux x64, Node v22.22.0, npm 11.14.1, installed node_modules reused, owned short TMPDIR/EVIDENCE_DIR. OS/module cache state was uncontrolled. Release used isolated HOME/XDG/npm caches with deliberate within-scenario cache reuse; real npx dependency installation can use npm/network. Registry/download/extraction/startup attribution is unknown.

Historical evidence records Vitest v5.0.0 and this Linux checkout, but does not retain a matched full environment/cache ledger or exact dated UTC command boundaries. Reporter clock-only starts below have **unknown timezone and date binding**; do not subtract them to estimate an operation. Initial historical release fingerprint is missing. Historical render's final owned manifest is `13505743676260c022b2842e22970fa0c1d593dd75c4dba30f3b5a4793360652`; it is not proof of a matched initial manifest. Historical release final source fingerprint is `e2ab3e68fce4a364670a971f303a002eab4c988bec62c1171e1d6a7c13c682d0`.

**Units:** owned command time includes npm startup/owned teardown; Vitest Duration measures an inner interval. Baseline phase wall wraps invocation but excludes driver startup/identity hashing; task13 final phase includes post-command hashing. Agent/report wall includes reading, reasoning, tool turns and waits where observed. These are not interchangeable. Parallel test-case sums are not suite wall time; repeated command times are not agent elapsed time.

## Durable command observations

Historical exact focused invocation was **not recovered**; its selector must not be reconstructed from the three passing cases. Release logs likewise do not retain the exact original baseline invocation. Current named npm selectors exist, but naming a plausible historical command would falsify provenance.

| Observation / command when known | Duration and result | Stage / timing coverage |
|---|---|---|
| Historical render focused three-case journey, original invocation unknown | 26.96s → 6.61s; repeat 6.65s; 3 passed / 10 skipped each | Command wall only; observable input/render synchronization repair with nine helper regressions. No session start/end. |
| Historical release baseline invocation unknown → final release gate | 14.86s → 16.28826631s; 2 files / 5 passed each | No demonstrated gain; isolated outputs and five → two packs improve ownership, not established elapsed speed. Missing initial fingerprint and network/cache comparability. |
| `npm run test:fast -- --reporter=verbose` | 3257.118ms owned; 3257.597ms phase; Vitest 2.87s; 20 files / 194 passed | Task13 stable baseline, serialized. |
| `npm run test:rendered -- --reporter=verbose` | 14977.986ms owned; 14978.142ms phase; Vitest 14.59s; 9 files / 117 passed | Same baseline; concurrent cases within the suite. |
| `npm run test:release -- --reporter=verbose` | 16991.816ms owned; 16991.990ms phase; Vitest 16.64s; 2 files / 5 passed | Same baseline; network-sensitive subprocess work. |
| `npm run test:rendered -- src/tui/targetFlow.test.tsx -t 'returns from edited Agents' --reporter=verbose` | Short original 5828.098 / 5738.098ms; candidate 5035.419 / 5063.606ms. Long original 5914.044 / 5897.440ms; candidate 5177.942 / 5168.091ms. Each 2 passed / 12 filtered. | Task13 repeated focused commands, before-then-after order; same selector/environment apart from named TMPDIR variants. Not pipeline or full-suite gain. |
| `npm test -- --reporter=verbose` | Candidate 32166.424ms owned; 32176.287ms phase; Vitest 31.81s; 31 files / 316 passed | Task13 final full gate; no matched original full trial. Cannot compare with historical changing-count totals to claim speedup. |

The baseline serialized phase sum is 35227.729ms (35.228s rounded), command sum 35226.921ms (summing unrounded measurements). Neither is an observed `npm test` invocation or pipeline duration. Task09's eight historical logged runs total **116.837s command runs**, not agent wall time; overlaps and interstitial waits were not mapped. Historical suites grew through 300, 312 and 316 cases; comparing their 31.94s/33.37s/36.55s totals ignores test changes, network and environment.

Render focused reductions: `(26.96 - 6.61) / 26.96 = 75.482%`; repeat 75.334%. Historical release difference +1.428s (+9.611%) is an observation, not causal regression proof. Task13 short mean reduction 733.5855ms (12.685%); long 732.7255ms (12.407%); smallest paired reduction 674.492ms. Fewer inputs alone would not prove speed; repeated actual command timings support only this local hotspot result.

### Selected raw excerpts (sanitized projection)

Line text below removes terminal escape sequences and omits unrelated output. Hashes identify **original local artifact bytes**, not this projection. Clock-only starts remain clock-only.

```text
task09-v2-20261009/before.log:
Tests  3 passed | 10 skipped (13)
Start at  17:37:48
Duration  26.67s
real 26.96
task09-v2-20261009/after-fixed.log:
Tests  3 passed | 10 skipped (13)
Start at  17:41:54
Duration  6.34s
real 6.61
task09-v2-20261009/after-repeat.log:
Tests  3 passed | 10 skipped (13)
Start at  19:38:11
Duration  6.37s
real 6.65
task09-release/before.log:
Tests  5 passed (5)
Start at  19:39:20
Duration  14.59s
elapsed=14.86
task09-release/release-vfinal.json:
"kind": "success", "status": 0, "durationMs": 16288.266309999999
task09-release/gate-release-vfinal.log:
Tests  5 passed (5)
Start at  19:50:22
Duration  15.94s
t13-evidence-EsCVvD/fast.json:
"kind": "success", "status": 0, "commandMs": 3257.117955, "phaseWallMs": 3257.597497
t13-evidence-EsCVvD/rendered.json:
"kind": "success", "status": 0, "commandMs": 14977.986256999999, "phaseWallMs": 14978.141545999999
t13-evidence-EsCVvD/release.json:
"kind": "success", "status": 0, "commandMs": 16991.81632, "phaseWallMs": 16991.98999
```

Original artifact SHA-256 ledger (all paths rooted at `/tmp/opencode/`):

| Artifact | SHA-256 |
|---|---|
| `task09-v2-20261009/after-fixed.log` | `15fb3ade925e9a562fa1a8ba337d581d567450ba5988a03892eebd42fc1dc14f` |
| `task09-v2-20261009/after-repeat.log` | `027e04adf2e507191e4bbcba601afa3fa6897ba98fda76ac9b9e6871a4c4a41b` |
| `task09-v2-20261009/final-results.txt` | `ee7891908a7ab3c77d3b5761955270ce608249e2704f59b5897d24817cfaa2e5` |
| `task09-release/before.log` | `514950e194ef167f4170b0948c806aedd443b381ebe7be1ba0b275124adebb23` |
| `task09-release/release-vfinal.json` | `a7fd03bc6ecb0d74a66f730e69e6b1d81cc703de205239b29df09e7004ccd4af` |
| `task09-release/gate-release-vfinal.log` | `6095535cfcee9e5f9a32938f65b9f2e58e1e98ec02c0067d5d5ab6a40e503a9a` |
| `t13-evidence-EsCVvD/identity.json` | `2fcb4b119e78a6940e339420db1554ff27d39d03b2370bb4bed8679eb863d070` |
| `t13-evidence-EsCVvD/fast.json` | `c3d1cfa77cc7c4968a4c441519f7c7eb648fa6e1f56c93a486187a7b4a3cf592` |
| `t13-evidence-EsCVvD/rendered.json` | `50ab1244db1870287833793fa573fd01abb312877fadadf18cde1286b5273ae5` |
| `t13-evidence-EsCVvD/release.json` | `10467dd4113753008ba99677b82bb55f330844bcdf78a3cf57a687168d59a2b9` |
| `t13-evidence-EsCVvD/final-full.json` | `54864b797ffae168a355b889f16154c0eb656cfb070744fa1eb04e710c426cad` |

Task13 final-full before/after fingerprint matched `b678bbc0d95b41dc6379ea1aa9171475842e06f2305951da87637ccdf67ad60d`; candidate source SHA `48c6d162f32a25e72613b082cd1dd81dc4212e9c663db31d3ed33bc9d5973790`, checked report SHA `2153abbf70c7352b2e76f524b3fcc3a4c609417d21c0f1a1416e6ee121611d59`. Later report-only additions do not establish changed code or invalidate those code checks, but must have their own documentation review.

## Stage timeline and critical-path limits

No supplied packet has both dispatch and independent verdict timestamps. Order below is logical/recorded, not an invented contiguous timeline; concurrent read-only activity is not added to serialized elapsed time.

| Stage | Available boundaries / observation | Elapsed wall / wait disposition |
|---|---|---|
| Dispatch / discovery | Task09 read-only render/release/instruction analyses parallel; writable operations waited for task08 ownership release. Current Lead coordinates separate report/test operations. | Start/end, queue and user waiting unknown; no quantified handoff tax. |
| Implementation | Task09 separate instruction, render, release and later repair operations; task13 one test-only candidate. | Agent start/end unknown; source changes and command records do not time reasoning/edits. |
| Checks | Historical/current command intervals above; task13 baselines serialized with stable identity. | Command duration known; absolute UTC boundaries and dispatch coverage unknown. Worker test sums overlap. |
| Independent review | Task09 pass1 findings → repairs → pass2; later concrete UX counterexample formed a new scoped delta. Current report review pending. Task11 Reviewer validation reported 0.000662s. | Full review duration/queue unknown; a validation microcheck is not a review interval. |
| Relevant UX | Historical U09-1 real-PTY delta 2.49s, probe 0.72s; focused reviewer 1.52s, reported by task09. | These are check costs, not total UX wall. Current report has no UI change; meaningful UX remains required on affected future packets. |
| Repairs | R09-1–4 and U09-1 counterexamples drove bounded repairs. Task13 original/candidate long runs reproduced same six failures. | Repair elapsed unknown. Findings establish useful work, not avoidable churn by themselves. |
| Permission waiting | Task11 correlates permission-reply POST404s, including UTC 17:36:54.682 and 19:47:39.084. | Initiator, pending duration and cancellation time unknown; 404 timestamps do not bound wait. |
| Interruption recovery | Task09 reconciled no running owned checks/no visible pending permission, then resumed only incomplete typecheck/helper/repeat checks. | Recovery start/end unknown; no proven lost-work total or runtime cure. |
| Report operation / validation | Lead supplied task11 Developer report phase 122.016s and validation 0.0053s. | Distinct scopes; neither compared with Reviewer 0.000662s as speedup. Task12 check duration recorded separately in handoff; full report phase not instrumented. |

Only the three serialized baseline command/phase totals are fully covered additive intervals. There is no covered dispatch-to-verdict critical path or subtractable coordination residual. Future intervals need UTC endpoints and monotonic elapsed, attribution of overlapping owned operations and explicit waits. Do not subtract summed parallel commands from session wall or assign unexplained residual to “agent overhead.”

## Bottlenecks and prioritized recommendations

Strong evidence: historical fixed render waits were removable; current release npx/subprocess work outweighs compile/pack (task13 compile + two packs 918ms, versus release command 16991.816ms). Exact dependency/network breakdown remains unmeasured. Strong reliability evidence: candidate and restored original both have 111 passes / the same six long-TMPDIR failures; candidate normal full gate has 316 passes. Long-path repair is pending diagnosis, not locally approved or waived. Suggestive only: repeated broad checks, duplicated loading, waiting and handoff churn may dominate some operations, but no causal elapsed ledger measures their shares. Task11's long report phase relative to microvalidation does not establish what consumed that phase.

Existing [team core](../../skills/autonomous-implement/TEAM-POLICY.md) already permits reliable unchanged evidence reuse, focused checks, small operations, one core read per context and invalidation-based broader gates; [domain context](../../CONTEXT.md) already defines bounded review units. No canonical instruction rewrite is justified here. Recommendations operationalize those mechanisms rather than duplicate or weaken them.

| Priority / owner and behavior | Mechanism / prerequisite | Tradeoff / risk | Observable metric and retained gates |
|---|---|---|---|
| P0 — Lead + Developer: one compact identity/check ledger; reuse task13 baseline, start with focused reproducer, then stable final gates | Packet records source/content identity, environment, output owner, exact commands/results and invalidated gates. Reviewer traces existing evidence rather than automatic broad timing reruns. Requires comparable evidence and explicit invalidation decision. | Stale evidence if source/environment changes; hashing/docs also cost time. Rerun unreliable, required-independent or invalidated checks. | Count reused versus rerun unchanged checks; paired command and dispatch-to-verdict elapsed. Preserve complete final/CI gates, independent diff/test review and output serialization. No full-suite improvement promised. |
| P1 — Lead: one small writable packet with read-only diagnosis parallel only on independent inputs | Precise task/file frontier and separate per-task outcomes reduce context reload and competing outputs; no extra optional specialists. Requires stable inputs, native capability and known output ownership. | Tiny packets can multiply dispatches; concurrent readers may see unstable versions. Stop/reconcile identity drift; measure before expanding. | Dispatch count, reloaded instruction bytes/occurrences, actual overlap, queue intervals and packet verdict elapsed. One writer/shared-output owner; smallest sufficient team, independent Reviewer; UX when affected. |
| P1 — Reviewer + Lead + Developer: two-pass review unit, repairs driven by concrete counterexamples | Inspect actual scoped diff; convert demonstrated interaction defect to durable regression; new material findings require justified separately scoped units rather than unlimited “review” continuations. Requires finding/criterion and repair ownership. | Over-small deltas can hide integration defects; cap is not permission to accept blockers. | Pass/unit count, finding recurrence, repair duration, unchanged checks reused; maintain assembled final gates and independent verdict. Task09 UX counterexample shows why relevant UX cannot be removed. |
| P2 — Lead/runtime owner: bounded interruption reconciliation | Preserve partial results; verify owned-command and permission state through allowed surfaces; resume incomplete/invalidated work only. Request sanitized lifecycle evidence separately if cause matters. | Missing runtime capability can leave results unknown; blind retries can duplicate writes. No live cancellation, profile edits, signals or service restart under this report. | Recovery timestamps, duplicate command count, attributable pending-wait duration if safely captured. Interrupted checks never treated as passed/failed; retain final gates and independent review. |

## One bounded pilot protocol — not executed

**Owner/input:** Lead selects one genuine small forthcoming packet and independent Reviewer; Developer owns its code/checks. No fake coding/review work is created to manufacture a result. Prefer a non-network focused reproducer with a stable rendered failure oracle, if the actual packet needs it. Task13 focused numbers are input evidence, not paired pipeline intervals. Report has no authority to launch additional workers or changes.

1. **Pre-register before dispatch:** record packet criteria, exact source fingerprint, HEAD, dependency/Node/npm/platform identity, TMPDIR shape, cache/network conditions, exclusive output allocation, exact focused command, complete final/CI gate list and relevant UX obligation. Record the ordinary safe baseline sequence actually used and candidate sequence: reuse qualified evidence → focused reproducer/check → one stable set of invalidated final gates → independent review. Never insert a redundant broad run into the baseline merely to make the candidate look faster.
2. **Comparable observations:** need two genuine comparable dispatch-to-verdict observations (ordinary and candidate), using the same check scope/source fingerprint and environment. On an unchanged real packet, use already occurring valid handoffs only if both have these boundaries and comparable ownership/wait conditions; do not replay approval or invent work. If genuine packets necessarily change identity/scope or no second real observation exists, label unmatched comparisons exploratory and leave pipeline gain unmeasured. Lead owns the missing endpoints/comparability decision.
3. **Record intervals:** UTC dispatch acceptance, discovery/implementation/check/review/UX/repair starts and ends, verdict emitted, plus monotonic command elapsed and environment/content identity before/after. Separate permission/queue/user wait with known boundaries; unknown remains unknown. Include nested/parallel ownership explicitly. No private runtime stores, billing estimates or model changes needed.
4. **Expected mechanism/threshold:** direction is fewer unnecessary unchanged-check invocations and shorter dispatch-to-independent-verdict elapsed, without fewer valid gates or weaker assertions. Before trial, after observing a comparable baseline, Lead names a threshold exceeding observed timing noise; no universal percentage is imposed from task09's 75% or task13's 12.7%. If repetitions are part of necessary checks, report their spread, not selectively best runs.
5. **Gates/stop:** preserve independent actual-diff/test review, meaningful concrete UX when affected, one writer/exclusive owned outputs, all mandatory final/CI checks and permission boundaries. Stop comparison on identity drift, changed selectors/counts/environment, network/cache noncomparability, output conflict, native interruption, missing required gate or newly exposed material defect. Preserve results; classify introduced/pre-existing/unknown. A new finding needs its own justified bounded repair unit, not an unlimited pilot extension.
6. **Evaluate once:** report command sums/paired deltas separately from both dispatch-to-verdict elapsed intervals and waits; derive a covered critical path only with full attribution. Report improvement, no gain or regression honestly. If one interval is missing, deliver this protocol and gap, not a pipeline speedup. Larger workflow redesign returns to refinement; a canonical policy delta needs precise evidence, approved scope and checks.

## Criteria disposition and verification

- P12-1: historical/current evidence inventoried with identities, environment, results and durable selected excerpts; missing exact historical commands/fingerprints/UTC boundaries explicit.
- P12-2: all requested stages covered; only covered command/phase sums computed. Complete pipeline/critical path/coordination overhead unknown, not fabricated.
- P12-3: ranked owner/mechanism/prerequisite/tradeoff/metric/gate recommendations; existing policy distinguished from proposals.
- P12-4: bounded protocol delivered via accepted alternative; two comparable genuine dispatch-to-verdict intervals missing, Lead-owned. No pilot launched.
- P12-5: executed-pilot portion not applicable; preservation and stop conditions specified, no measured pipeline gain or approval claimed.
- P12-6: report/protocol only; no production/canonical instruction delta justified or implemented. Task13 measured local candidate is external input, not task12 gain.

This operation checks relative links, extracted source facts/artifact hashes, time arithmetic and whitespace; final report SHA and actual validation duration go in the handoff to avoid a self-referential hash. No tests/build/network/output-mutating fixtures are needed for this documentation-only operation. Full report phase elapsed was not instrumented and remains unknown. Independent review and all Lead-owned delivery gates remain pending, not passed by this report.
