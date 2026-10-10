# Test value and runtime — task 13

## Final disposition (read first; evidence progression, not contradiction)

Executed 2026-10-09. Final outcome: **31 files / 323 passed**, typecheck
passed, private copied-stage build and pack passed. All rendered suites pass
at short, 18-segment long, and bounded stronger TMPDIR shapes (9 files /
124 passed each); the affected-seam matrices pass 17/17 at all three shapes.
No remaining executed counterexample or mandatory check failure. UX recheck
and independent Reviewer disposition remain pending; **this is not final
approval**.

Evidence progression (later subsections supersede only the blocker they
name, not the measurements above them):

1. **Initial test-only candidate** (316 cases): keep all 31 files and all 316
   current cases; implement only the authorized consent-explanation scan in
   `targetFlow.test.tsx`. No production, selector, matrix, deadline or
   assertion changes. Final full gate at that stage: 31 files / 316 passed.
2. **Bounded repair follow-up** (six diagnosed long-path failures → still 316
   scope plus added geometry cases): test plus strictly scoped production
   repairs (consent hint order, menu indicator sharing, static path cap).
   Stronger-path matrix at that stage still blocked on six *different*
   failures — a new finding, not a contradiction of stage 1.
3. **Outage-resume replacement** (323 cases): explicitly executed
   replacement checks supersede the remaining stronger-path blocker. Final
   gates in that subsection are the current verdict (323 passed).

Baseline HEAD throughout: `4be1db6bef208bae0087c92c47da693de6fecba6`.
Production-repair scope is confined to stage 2–3 seams listed in their
subsections; the initial stage-1 hotspot gain (~0.73s matched comparison)
remains only that historical comparison, not a speedup claim for the
repairs. Historical `/tmp` raw logs lost in the outage remain reported
history, not newly recovered evidence.

## Decision and evidence boundary

Keep all 31 files and all 316 current cases at this stage. The layers catch different failures; no dispensable duplicate was demonstrated. Implement only the authorized consent-explanation scan in [targetFlow.test.tsx](../../src/tui/targetFlow.test.tsx): stop on the existing normalized `savedconfig/defaults` oracle, still capped at 20 Down inputs. No production, selector, matrix, deadline or assertion changes at this stage.

Measurements below were executed on 2026-10-09, not copied from task09. Baseline HEAD: `4be1db6bef208bae0087c92c47da693de6fecba6`; working-tree SHA-256: `e4916d8b3a84c9364c532a25bb207426888f7903f306549160b1d0bf15674c34`. Algorithm matches the release helper: sorted `git ls-files -z --cached --others --exclude-standard`, hash each path, NUL, bytes (or `<deleted>`), NUL. Includes the pre-existing untracked cancellation report; no report/source edits occurred during the three baseline commands, and every post-command fingerprint matched.

Raw local evidence: `/tmp/opencode/t13-evidence-EsCVvD/`, with `identity.json`, `{fast,rendered,release}.{log,json}`, focused `{before,before-long,after,after-long}-{1,2}.{log,json}`, and mutation/count logs. These are test-only logs, not profile/auth/session exports. Paths are local artifacts, not promised permanent hosted links. Drivers: `/tmp/opencode/t13-profile.mjs` and `/tmp/opencode/t13-focused.mjs`; they use existing `runOwned`, exclusive file outputs and positive owned-command deadlines. Evidence screenshots/contrast are in the same exclusively allocated EVIDENCE_DIR. No shared repository dist was built or packed.

### Baseline evidence ledger (ephemeral local artifacts)

SHA-256 of original local artifact bytes under `/tmp/opencode/`, preserved here as the owning record. Ephemeral and local-only: hashes alone are not publicly reproducible logs.

| Artifact | SHA-256 |
|---|---|
| `t13-evidence-EsCVvD/identity.json` | `2fcb4b119e78a6940e339420db1554ff27d39d03b2370bb4bed8679eb863d070` |
| `t13-evidence-EsCVvD/fast.json` | `c3d1cfa77cc7c4968a4c441519f7c7eb648fa6e1f56c93a486187a7b4a3cf592` |
| `t13-evidence-EsCVvD/rendered.json` | `50ab1244db1870287833793fa573fd01abb312877fadadf18cde1286b5273ae5` |
| `t13-evidence-EsCVvD/release.json` | `10467dd4113753008ba99677b82bb55f330844bcdf78a3cf57a687168d59a2b9` |
| `t13-evidence-EsCVvD/final-full.json` | `54864b797ffae168a355b889f16154c0eb656cfb070744fa1eb04e710c426cad` |

Environment: Node `v22.22.0`, npm `11.14.1`, Linux x64. Installed local node_modules reused; OS/module caches neither flushed nor measured. Baseline TMPDIR was the owned `short-tmp` under the evidence directory. Release tests privately isolate HOME/XDG/npm caches; a cold private npm cache is populated and deliberately reused within scenarios, not between suite invocations. Local file release metadata/tarballs avoid live GitHub availability, but real npx dependency installation can contact npm; registry/cache/network breakdown is **unknown**, not zero. No private environment dump was captured. Existing ignored `dist/build-info.json` identifies commit `26ff0b34c41c7efdc487a8d57e699c2df94f9d42`, builtAt `2026-10-09T18:29:37.724Z`; it remained untouched. The release fixture compiled current source into its private stage and stamped the checked baseline identity instead.

## Serialized baseline (for task12 reuse)

All commands append `-- --reporter=verbose`. Command time includes npm startup and owned teardown; phase wall wraps that invocation, excluding driver startup and identity hashing. Vitest Duration is its own inner measurement. They are not interchangeable or additive with concurrent per-test totals.

| Command | Files / cases passed | Vitest | Owned command ms | Phase wall ms |
|---|---:|---:|---:|---:|
| `npm run test:fast` | 20 / 194 | 2.87s | 3257.118 | 3257.597 |
| `npm run test:rendered` | 9 / 117 | 14.59s | 14977.986 | 14978.142 |
| `npm run test:release` | 2 / 5 | 16.64s | 16991.816 | 16991.990 |

Serialized phase total: 35.228s, not a measured `npm test` duration. Historical 33.37s full-suite and 14.73/14.72s rendered figures are context only, not current speedup evidence.

Release `phaseMs`: head 8, paths 7, compile 158, pack-1 438, pack-2 322; **two** packs already existed. Compile + packs = 918ms. Pack-2 occurs inside the first test, so do not add it to that test's duration again. launch scenarios: exact-current/stale/cache 8915ms, unreachable metadata with populated cache 4321ms, checksum 305ms. freshLaunch: pinned advance/reuse 2067ms, rejection cases 131ms. npx/subprocess/dependency resolution dominates relative to compilation, but its individual download, extraction, startup and network components were not instrumented. Hook total/setup/cleanup overhead cannot be inferred precisely from these rounded reporter times.

Rendered case sums: targetFlow 13423ms and app 10637ms overlap across workers; they are not independent wall phases. Consent cases cost 1422ms at 40 columns and 5148ms at 100 in this concurrent baseline. Focused serial commands below are the appropriate comparison. The evidence interaction/color journey cost 1761ms; run lifecycle cases 910/731ms; testSupport timeout cases 45/104ms. Fast suite's CLI pin mismatch 1392ms, matching pin 570ms and non-TTY 560ms exercise real source CLI subprocess startup; owned-process timeout 1248ms deliberately proves escalation, and discovery cancellation 211ms includes a real 200ms startup delay. No CPU profile or precise render/flush attribution was collected.

## Complete file inventory

Counts and summed test milliseconds come from baseline verbose reporter successes (hooks/imports excluded). Behavior/assertions/ownership are static source inspection; execution establishes that the cases passed, not that every hypothetical mutation was tested. Historical labels are included only where the source explicitly names them; otherwise history is unknown. Paths link to the actual tests.

Frequency/ownership recommendations, not policy edits: **F** = fast feedback on local changes plus complete CI/final; **R** = relevant rendered feedback plus complete CI/final; **P** = release-route/package changes and complete CI/final. Developer maintains tests with the module; Tester designs failure cases and Reviewer independently assesses changes. Output ownership: **T** = owned mkdtemp fixtures removed by afterEach/finally; **M** = in-memory/no persistent fixture; **L** = live render teardown plus T; **E** = exclusively assigned EVIDENCE_DIR plus live teardown; **O** = owned process group/deadline plus private fixture cleanup. No code change to scheduling is proposed here.

| Project/file | Cases / sum ms | Observable behavior and representative failure signal | Fixtures / frequency |
|---|---:|---|---|
| fast [owned-process](../../scripts/test-support/owned-process.test.mjs) | 3 / 1556 | Success/nonzero/spawn/abort classification; timeout kills only owned tree, heartbeats stop, successful parent cannot orphan descendants. | O / F |
| fast [release-fixture](../../scripts/test-support/release-fixture.test.mjs) | 2 / 6 | Explicit private HOME/XDG/temp/cache, deliberate cache reuse; absent temp parent created and unrelated sentinel retained. Not a compilation test. | T, finally / F |
| fast [cli](../../src/cli/cli.test.ts) | 11 / 2538 | Flag conflicts/removed multi-target rejection, cwd-independent asset lookup, build pin refusal with no writes, matching help identity, non-TTY exit 2. | T + source subprocesses / F |
| fast [freshness](../../src/cli/freshness.test.ts) | 6 / 47 | Metadata shape, pinned SHA/digest/URL policy; mocked network/HTTP/rate-limit failures reject rather than allow stale execution. | M, injected fetch / F |
| fast [defaults](../../src/installer/defaults.test.ts) | 19 / 8 | Approved role/model/effort ordering, no silent premium/Meta/UX downgrade; saved config retained, migration nonmutating. | M / F |
| fast [gitignore](../../src/installer/gitignore.test.ts) | 7 / 4 | Managed entries, exact user-line preservation, idempotence and malformed marker refusal. | M / F |
| fast [harness](../../src/installer/harness.test.ts) | 11 / 658 | Five native adapters install only selected layout, references resolve, native permissions/integrations preserved, unsupported model makes no writes. | T / F |
| fast [installAll](../../src/installer/installAll.test.ts) | 5 / 486 | Team/persona/editor composition; late preflight defect blocks earlier writes; late write failure reports partial installation truthfully. | T, mocked private root/failure / F |
| fast [installPaths](../../src/installer/installPaths.test.ts) | 19 / 577 | Symlink/root/escape/type/generated-output safety; unowned skill requires adoption; external bytes untouched and no partial writes. | T, mocked private root; CLI subprocess / F |
| fast [installTeam](../../src/installer/installTeam.test.ts) | 11 / 347 | Model-only updates retain prompt, overwrite explicit; shipped bundle references/config/skills self-contained; tracker/custom skills survive reinstall. | Shared owned beforeAll root, afterAll removal / F |
| fast [legacyAgents](../../src/installer/legacyAgents.test.ts) | 15 / 239 | Retired Planner removal only for unchanged known definitions; custom controls/malformed bodies retained, idempotent, failure leaves legacy intact. | T / F |
| fast [model-catalog](../../src/installer/model-catalog.test.ts) | 23 / 18 | v1/v2 auth fixtures, env/JSONC provider union and effort ranges. Auth-export parsing uses synthetic strings, no live credential export. | M + T/finally / F |
| fast [toady](../../src/installer/toady.test.ts) | 17 / 409 | User-scoped persona/rules and mode 0600; user/project conventions retained; malformed/linked destinations fail before mutation; global migration unique. | T, mocked private context (not real user profile) / F |
| fast [vscodeSettings](../../src/installer/vscodeSettings.test.ts) | 12 / 41 | Exact negative Quick Open entry, JSONC/comments preserved, byte-identical configured reinstall; invalid shapes/links rejected unchanged. | T / F |
| fast [art](../../src/tui/art.test.ts) | 4 / 127 | 40x20/800 cells, valid colors, no leaked CSS/%c, mono without ANSI. | M; static source assets / F |
| fast [discovery](../../src/tui/discovery.test.ts) | 4 / 222 | Only auth-list/models calls, synthetic secret never surfaces, rejection propagates, real sleep probe cancelled under 10s. | Injected exec + real sleep / F |
| fast [layout](../../src/tui/layout.test.ts) | 9 / 47 | Minimum viewport, density/avatar thresholds, cell wrapping/capping and focus visibility, truecolor/NO_COLOR. | M / F |
| fast [state](../../src/tui/state.test.ts) | 12 / 11 | Commit versus draft cancel, role-independent effort/reset, exact quit snapshot, harness inheritance and browser normalization. | M / F |
| fast [theme](../../src/tui/theme.test.ts) | 2 / 2 | Contrast thresholds and step header; writes contrast evidence. | E (no live render) / F |
| fast [usage](../../src/usage.test.ts) | 2 / 244 | Unknown metrics stay unknown, currencies separate, transcripts stripped, invalid/unattributed metrics rejected. | T/finally / F |
| rendered [app](../../src/tui/app.test.tsx) | 20 / 10637 | Real input/effects, edits/quit/install outcomes, native rules and resize; F04 search commit, F05 wrapped suffix, U09-1 warning/error precedence without mutation. | L, mostly fake installer / R |
| rendered [detail](../../src/tui/detail.test.tsx) | 14 / 1286 | Full middle sentinels, draft-owned error clear/restore, checkbox priority, no unknown-focus commit; F06 real conflict fits 40x8. Contains pure reducer/action cases too. | L + M / R |
| rendered [evidence](../../src/tui/evidence.test.tsx) | 13 / 3798 | Eight viewport boundary states plus interaction/color captures; U09-1 full suppressed notice access, exact long selected target and no writes while inspecting. | E + T / R |
| rendered [run](../../src/tui/run.test.ts) | 4 / 1645 | Alternate screen restored, minimum/TTY guard before mount, signal handlers persistent then removed without leaks. | Live fake streams, finally cleanup / R |
| rendered [screens](../../src/tui/screens.test.tsx) | 24 / 28 | **Pure**, despite extension/project: options/search/draft activation, safe rules loaders, menu focus/wrapping; static architecture import guard. | M + T/finally / R (candidate classification only) |
| rendered [directory](../../src/tui/screens/directory.test.tsx) | 14 / 20 | **Pure** filesystem/reducer helpers: no symlink targets, atomic refresh/explicit discard consent, target unchanged on cancel, exact browser/pending snapshot. | M + T/finally / R (candidate classification only) |
| rendered [stress](../../src/tui/stress.test.tsx) | 5 / 859 | Actionable 40x8 picker/direct-path failures and long model/query commit, long target fits. | L / R |
| rendered [targetFlow](../../src/tui/targetFlow.test.tsx) | 14 / 13423 | A/B exact target/config/conflict/editor ownership, consent/cancel/quit restoration, path inspection, long TMPDIR and symlink/vanishing-folder recovery. | L; fake install records target, filesystem remains unchanged / R |
| rendered [testSupport](../../src/tui/testSupport.test.tsx) | 9 / 259 | Ignored keys acknowledged, sequential handlers, passive flush versus explicit async completion, final-key unmount, bounded diagnostics and raw-mode/listener/timer cleanup. | Live minimal components, teardown afterEach / R |
| release [launch](../../src/cli/launch.test.ts) | 3 / 13541 | Real packed/npx bin advances despite reused cache; deterministic stale bootstrap hands off exact build then verified reuse; unavailable metadata/checksum fail closed, consumer dependencies untouched. | O + T, isolated compile/stamp/two npm packs; afterAll cleanup / P |
| release [freshLaunch](../../src/cli/freshLaunch.test.ts) | 2 / 2198 | Actual standalone launcher with stub tarballs: advances/reuses pinned cache, malformed/missing/digest/outside-GitHub URL rejects. Complement, not substitute, for real shipped package. | O + T, tar-created stubs/private cache / P |

## Why retain the layers; bounded follow-ups

- Exact selected target: targetFlow catches applying A's config or install target after browsing B; directory reducers alone cannot detect a miswired shell input/effect. Assertions check targetB, `saved/b`, conflicts/editor status, exact restored consent/browser frames, and A/B directory contents. The fake installer proves shell routing/no unintended shell writes, not actual installed B files; installAll/installTeam separately prove writes. An assembled real-render-to-real-install B journey is a possible integration gap, not a reason to remove either layer.
- Viewports/error/notice: geometry alone can pass while important text is lost. Detail sentinel and U09-1 tests require inspection text/end markers and nonmutating actions; F04/F05/F06 fixtures identify concrete search/focus/wrapping/conflict regressions. Evidence captures are not pixel-golden comparisons: a cosmetic mismatch within geometry/content assertions can escape automation and needs visual review. Keep all sizes/modes.
- Freshness: parse tests could pass while the shipped bin serves stale npm cache. launch requires new identity and explicitly rejects the old one; freshLaunch proves standalone launcher URL/cache behavior using small stub packages. Neither replaces the other. Missing metadata and checksum tests require nonzero/refusal before consumer writes. No release mutation was performed for this report's initial stage.
- Cleanup: owned-process tests catch descendants surviving timeout or successful parent exit; render-helper tests catch ignored inputs, stalled flush, business-result confusion and listeners/raw mode not restored. Existing observable helper replaced old arbitrary waits already; that repair is not claimed here. Windows tree cleanup explicitly unsupported; this Linux run establishes no cross-platform portability claim.

Actionable follow-ups remain recommendations, not additional edits:

| Candidate | Existing liability / smallest next packet | Preserved oracle / focused check / invalidated gates |
|---|---|---|
| Evidence notice scan | `evidence.test.tsx:123` unconditionally sends 20 PageDown and writes page evidence. Investigate bounded stop only when full notice/end text is recovered; first determine whether intermediate artifacts are required. No proof or change here. | Entire notice + exact restore/nonmutation at all three sizes; `npm run test:rendered -- src/tui/evidence.test.tsx -t 'suppressed UX warning'`; rendered/full + visual artifacts. |
| Detail path sentinel | First path test assumes fixed paging (two Downs + PageDown); current sentinel passes, fragility under other wrapping remains **unproven**. Prefer bounded sentinel observation only after omission counterexample proof, never merely fewer keys. | Middle sentinel inaccessible before inspection, visible inside, no selection; `npm run test:rendered -- src/tui/detail.test.tsx -t 'capped long cwd'`; rendered/full. |
| Pure rendered classification | screens/directory's 38 cases are pure (48ms sum); renaming/moving to fast may clarify feedback ownership, not a proven overall speedup. Keep architecture guard separately assessed. | Preserve every case and equivalent selector discovery; both projects/full and typecheck if imports change. No selector edits in task13's initial stage. |
| Discovery startup | Real sleep cancellation has a 200ms startup wait, unrelated to rendered settlement. Observe owned child readiness before cancel only with an actual cancellation failure proof and cleanup audit; preserve live process exercise. | Cancel returns empty result within bound, no orphan; `npm run test:fast -- src/tui/discovery.test.ts`; fast/full. Current title says empty catalog but assertion expects rejection: clarify wording separately. |
| Release failure cleanup | createReleaseFixture allocates root before awaited setup; rejection before return leaves caller unable to remove it. afterAll pack-count assertion also precedes removal. Use try/finally ownership and inject failed compile/pack to prove cleanup; no scope expansion here. | Failure diagnostic retained, owned children dead, only allocated root removed; release-helper focused proof then release/full; package gates if helper/source packaging affected. |
| Source CLI process bounds | non-TTY execFileSync test lacks its own timeout; pin helper has one. Audit other source CLI subprocesses before a narrow test-only timeout packet; do not impose timeouts on real interactive users. | Exact exit/message/no writes unchanged; fast CLI focused then fast/full. Outer owned command currently bounds suite execution, not each child test. |

Additional long-TMPDIR probe exposed **six pre-existing failures**, not candidate regressions: two detail error-sentinel tests assume two PageDown inputs; three targetFlow same-target/cancel/vanished-folder cases expect `Install into` in an unfocused capped frame; U09-1 evidence at 99x24 rendered 25 rows under this longer path. Candidate full rendered-long: 111 passed / 6 failed, command 13533.800ms, Vitest 13.15s. Restoring the exact original targetFlow source SHA and rerunning the identical long selector/environment reproduced the **same six names and assertion classes**, 111 passed / 6 failed, command 14205.906ms, Vitest 13.81s (`original-rendered-long.{log,json}`). Candidate consent variants passed in both runs. This establishes a real broader long-path reliability limitation: fixed error paging and unfocused-frame assumptions need separate proof-backed packets; the row-overflow issue requires production-versus-fixture diagnosis outside the initial authorized change. No assertion weakening or deadline increase was attempted. The initial stage cannot claim the entire rendered suite passes this long TMPDIR condition.

Implementation-coupled examples: literal palette values, eight-role/12-skill counts, exact focus-ID arrays and regex source-import guard. Some are intentional product/architecture contracts; no demonstrated redundant assertion was removed. Historical identity for unnamed tests remains unknown rather than attributed speculatively.

## Single candidate: consent explanation scan

Authorized file and seam: `src/tui/targetFlow.test.tsx`, originally lines 210–215. Original scans 20 Downs at both widths regardless of recovered text. Replacement accumulates the same ANSI-stripped frames, slices the same 44-character wide avatar column at width 100, removes whitespace identically, stops only on `savedconfig/defaults`, and retains the same `toContain` assertion after at most 20 Downs. Opening Space, closing Enter, both 40x8/100x39 variants and all later consent/browser/config/target/filesystem assertions remain intact. This is not a business-result quiet-render substitution.

Old-to-new failure map: explanation text missing/unreachable still exhausts the 20-input bound and fails specifically at the unchanged substring oracle; available text succeeds before redundant inputs. The later close/cancel/resume/confirm/install assertions demonstrate that closing from an earlier pager position does not change the journey result. Existing render observation keeps one 2000ms deadline with last frame/input/render revisions per send; test has its original 20000ms limit. No new timer, temporary path or cleanup owner is introduced.

Controlled **test observation-seam** mutation (not production mutation): for original, insert `explanation = explanation.replace(/s/g, '!')` immediately before normalization/assertion; for candidate, append `.replace(/s/g, '!')` to normalized observation on every predicate evaluation. Both simulate unavailable oracle text without disturbing fixture setup or consent navigation. Both failed both widths at `toContain('savedconfig/defaults')`, not setup/timeout: `original-unreachable-1.log` (3814.314ms command), `candidate-unreachable-1.log` (3858.995ms). This proves missing-text detection, not all production pager failure modes. The original source was restored to SHA `73c35788af763da2f052166b8e92793232bce12fc3affdd973e70aa9cc6b9031` before implementing the candidate; candidate mutation/log instrumentation were removed before final measurements. No resets or production edits used.

Original input count: fixed 20 Down per width (40 total). Temporary candidate-only observation logging recorded 5 at width 40 and 0 at width 100 (`candidate-input-count-1.log`); logging removed. Final candidate source SHA-256: `48c6d162f32a25e72613b082cd1dd81dc4212e9c663db31d3ed33bc9d5973790`.

Matched focused command: `npm run test:rendered -- src/tui/targetFlow.test.tsx -t 'returns from edited Agents' --reporter=verbose`. Serial repetitions, same installed dependencies, owned EVIDENCE_DIR, no cache clearing/network scenario. Short TMPDIR as baseline; long TMPDIR = evidence root + `long-parent-` + 18 repetitions of `segment-` + `/end-sentinel`. Each invocation passed both widths (12 other cases filtered, not removed).

| TMPDIR / version | Command ms, repetitions 1 / 2 | Case ms 40 columns, 1 / 2 | Case ms 100 columns, 1 / 2 |
|---|---:|---:|---:|
| short original | 5828.098 / 5738.098 | 548 / 546 | 4331 / 4258 |
| short candidate | 5035.419 / 5063.606 | 479 / 512 | 3580 / 3548 |
| long original | 5914.044 / 5897.440 | 536 / 589 | 4354 / 4346 |
| long candidate | 5177.942 / 5168.091 | 514 / 528 | 3698 / 3684 |

Observed command mean reductions: short 733.6ms (~12.7%), long 732.7ms (~12.4%). The smallest paired command reduction is 674.5ms. This is a bounded local hotspot gain supported by repeated timings, **not** an automatic inference from fewer inputs or a CI/full-suite speedup promise. Small width timings are noisier; wide render work dominates. Sequential before-then-after order and uncontrolled OS caches limit causality/generalization. Full baseline network-sensitive totals are not comparable candidate speed evidence.

## Final verification

Initial 316-case stage:

| Check | Actual result | Vitest / owned command / enclosing phase |
|---|---|---|
| Whole affected targetFlow file, short TMPDIR | 14 passed | 10.95s / 11312.104ms / 11321.171ms |
| All rendered, long TMPDIR | 111 passed, six pre-existing failures reproduced with original | 13.15s / 13533.800ms / 13543.229ms |
| All rendered, short TMPDIR | 117 passed | 13.26s / 13635.021ms / 13644.506ms |
| `npm test -- --reporter=verbose`, short TMPDIR | 31 files / 316 passed | 31.81s / 32166.424ms / 32176.287ms |
| `npm run typecheck` | passed, exit 0 | not applicable / 372.099ms / 384.137ms |

Final runner phase wall additionally includes post-command identity hashing (~9–12ms); use owned command times when task12 wants comparable invocation cost. `final-*.{log,json}` preserve per-check before/after identities. Last code-gate identity at this stage: HEAD as above, fingerprint `b678bbc0d95b41dc6379ea1aa9171475842e06f2305951da87637ccdf67ad60d`, report SHA `2153abbf70c7352b2e76f524b3fcc3a4c609417d21c0f1a1416e6ee121611d59`, unchanged candidate source SHA as above. Only documentation identity changed afterwards, so code checks remain applicable at this stage.

No introduced failures observed at this stage; controlled unreachable-oracle failures are intentional; long-path failures are confirmed pre-existing and unresolved within the initial packet. Normal mandatory rendered/full/typecheck gates pass, but broader long-path portability remains a material limitation for Lead/Reviewer, not silently approved. Test files are excluded by tsconfig.build and npm ships only dist/agents/skills/README: this candidate does not invalidate shipped compile/pack inputs. Full `npm test` was executed after the change; no additional release-only profiling rerun was performed.

## Bounded repair follow-up — six diagnosed long-path failures

This subsection supersedes the **unresolved six-failure disposition of the initial stage above**, not the historical baseline, consent measurements, inventory or mutation evidence. Tester evidence `/tmp/opencode/t13-diagnosis-DPcuwZ/{command.txt,identity.txt,red.log,frames}` directly established six failures / 35 filtered cases in 2.31s; that baseline was reused rather than repeated. The original consent scan optimization and its 20-Down bound, oracle and downstream journey remain unchanged; the earlier approximately 0.73s measured gain remains only that earlier matched comparison, not a speed claim for this repair.

Repair evidence is exclusively owned under `/tmp/opencode/t13-repair-1791576629/`. Each `*-command.txt` records exact selectors, TMPDIR and separate EVIDENCE_DIR; `*.log` and `*.json` record actual results, elapsed invocation-wrapper durations and seven scoped source SHA-256 identities before/after. No task lifecycle, global policy, production CLI, staging, commit or publication edits were made. The server state after checks is out of scope for this report's verdict; completed checks stand on their recorded before/after identities.

### Coverage and implementation map

- Two draft-error journeys now scroll one Down at a time until the exact `MIDDLE-ERROR-SENTINEL` is observed, capped at 256 inputs. Every scanned frame retains the strict 40x8 fit checks. Repeated frames do not falsely imply the end: the bare menu focus can advance inside an unchanged window. Existing middle assertions remain; the first journey additionally reaches the `.md` diagnostic tail. The second requires an exact pre-quit/post-Continue overlay frame, then closes to the error-bearing actions and explicitly Cancels the draft/error. No timeouts or row assertions were relaxed.
- Same-target reuse now focuses the confirmation after returning on Choose another target folder, then uses the existing complete `expectInstallLabel(targetA)` inspection oracle. It still installs exactly A with the committed `openai/gpt-5` choice. Picker cancellation still checks the original restored action frame and exact Quit/Continue frame, then focuses/inspects A, closes back to the exact focused frame, returns to the original change focus and quits with unchanged config/filesystem. Vanished-folder recovery retains the actionable filesystem diagnostic and no-early-completion assertion, inspects A after Cancel, restores focus and requires an exact A/config/browser-closed quit outcome and empty filesystem.
- `menuGeometry` and `MenuList` now share explicit indicator visibility. A one-row menu reserves its focused action; two rows show at most one directional indicator, preferring below when both directions exist; three rows retain both. All items remain keyboard-reachable and the existing capped-label detail gating is unchanged. Three pure geometry/navigation cases and three actual rendered cases cover middle focus at budgets 1/2/3, long focused labels, strict row/column limits and visible action identity. Cases were added, none deleted.
- Static directory-path wrapping now yields to the menu's three-row reserve, using the same path-row allowance for `directoryFixedRows` and `DirectoryScreen`. Short paths remain fully displayed; oversized paths get the existing head/tail cap. The full exact path remains on the focusable confirmation and its existing visible Space/details route, verified by the target inspection journeys even in the stronger path environment. Actions, directory notes, complete warning/end text, error precedence and checkbox Space priority are retained. The warning matrix additionally exercises 100x39 and extracts its real text pane (excluding the 44-column avatar) for wrapped warning-content assertions; raw frames and exact snapshots remain intact. Warning-visible versus warning-suppressed branches follow observable content, and both require the complete warning end rather than dropping a warning assertion.

### Failure demonstrations and restoration

`mutate.mjs` temporarily replaced the detail observer's sentinel with `MISSING-ERROR-ORACLE`, and replaced the recovered install-label observation with `MISSING-LABEL-ORACLE` immediately before the exact label assertion. `missing-oracles.log`: all **five** changed journeys failed at their specific content assertions, not setup, geometry, deadlines or timeouts; 23 other cases filtered, Vitest 2.38s. This is an observation-seam missing-content proof, not a claim that every production pager mutation was exercised. Both test files were restored byte-for-byte in `finally` and restoration was explicitly checked.

`geometry-mutate.mjs` similarly restored exact owned production bytes after each run. Restoring unconditional above/below indicators made both pure and rendered 1/2-row cases fail at strict row-count assertions (four failures, two 3-row cases passed). Removing the shared static path cap made the stronger U09-1 99x24 frame render **27 rows**, failing the unchanged 24-row assertion; other warning sizes passed. Corrected final equivalents pass in `focused-long-final` and `focused-strong-final` (15 cases each). Original consent unreachable-oracle proof above is retained separately; the consent seam was not remutated or changed.

### Assembled checks and remaining counterexamples (bounded-repair stage)

Environment remains Node v22.22.0 / npm 11.14.1 / Linux x64 with installed dependencies reused. Short TMPDIR is `…/short`; 18-segment TMPDIR is evidence root + `long-parent-` + 18 `segment-` repetitions + `/end-sentinel`. The bounded stronger TMPDIR is evidence root + **eight separate 68-character components**, each `stronger-` + 12 `path-` repetitions (about 585 characters total before fixture suffixes). Components and total paths stay below ordinary Linux name/path limits. Tests use supported viewports; no absurd below-40x8 terminal was introduced. Each invocation gets a new evidence directory.

| Final check | Actual result | Vitest / enclosing invocation-wrapper ms |
|---|---|---:|
| All rendered, short | 9 files / 124 passed | 14.50s / 14876.066 |
| All rendered, 18-segment long | 9 files / 124 passed | 14.91s / 15272.169 |
| All rendered, bounded stronger | 118 passed / **6 failed**, 9 files | 14.37s / 14758.060 |
| Tight repaired seams + geometry, 18-segment long | 15 passed / 57 filtered | 3.39s / 3758.174 |
| Tight repaired seams + geometry, stronger | 15 passed / 57 filtered | 3.69s / 4061.226 |
| `npm test -- --reporter=verbose`, short | 31 files / **323 passed**, including fast geometry and all five release cases | 33.21s / 33564.725 |
| `npm run typecheck` | exit 0 | — / 381.389 |
| Private copied-stage `npm run build` | exit 0 | — / 509.375 |
| Private copied-stage `npm run pack` | exit 0; build plus dry-run pack, 70 files | — / 740.763 |

The complete suite's real packaged/npx consumer checks compiled current source into a private stage, packed twice, advanced/reused the shared private npm cache, and passed unavailable-metadata and checksum fail-closed scenarios. Fixture costs: compile 191ms, packs 424/320ms; exact-current/stale/cache test 8740ms, unavailable metadata 3810ms, checksum 293ms. This is actual real npx coverage, **not** a mocked replacement. Dependency installation can contact npm; registry/cache/network attribution and variability remain unknown. The additional actual npm build/pack scripts ran only in an owned copied stage with private HOME/XDG/npm cache. Its Git stamp was explicitly skipped because the throwaway stage is not a Git repository; the separately executed real release fixture supplied the checked source identity. No shared repository dist, real user HOME or real-repository consumer smoke was used.

Checked full-suite working-tree fingerprint (release helper's actual identity): `aa828acd94f628e7766dc65459cb272c24135908a70b7a552fd874f807fc6348`, HEAD `4be1db6bef208bae0087c92c47da693de6fecba6`. All seven scoped code hashes matched before/after every final command, and matched after controlled mutation restoration; `full.json` and both final focused JSON files contain the complete map. This documentation appendix changes only report identity after those code gates.

**Not a blanket stronger-path pass at this stage:** the six *original diagnosed* failures are repaired even at the stronger path, but the full stronger matrix exposed six **different** failures. Two static-full-path parsers (`app.test.tsx:117`, `evidence.test.tsx:371`) assume the entire path remains in non-scrollable content, now invalid when bounding it is necessary; their existing full-detail expectations are not reached. The former file is outside this repair's write ownership. The retained 40-column consent scan cannot reach `savedconfig/defaults` within its unchanged 20-Down bound at this stronger path. Two B-install journeys expect the unfocused saved-model row immediately after Home although the long focused review target fills the window. The symlink browser test expects unfocused `real/` while the long focused inspection row fills the window. No production row overflow was reported by the stronger final run, but these content failures are real unresolved checks at this stage. No original-source stronger rerun was performed, so blanket pre-existing classification for this new six-case set is **not established**; the static-summary assertion incompatibility was directly invalidated by the intentional bounded-path behavior. Repairing these additional seams or editing `app.test.tsx` requires another confirmed packet. The stronger all-cases gate therefore remains blocked at this stage, despite all scoped repaired seams and normal/full gates passing. Scoped UX recheck and independent review remain pending; this report does not claim approval.

## Outage-resume follow-up — durable replacement evidence

Executed 2026-10-09 on branch `follow-up/grooming-and-pipeline`, HEAD `4be1db6bef208bae0087c92c47da693de6fecba6`. The outage lost the historical `/tmp` raw logs: earlier completed results above remain reported history, **not newly recovered evidence or interrupted checks**. This subsection supersedes the remaining stronger-path blocker with explicitly executed replacement checks. It does not establish the root cause of session cancellations or change runtime/services/profiles.

Durable ignored local evidence: the local-only evidence directory `task13-outage-resume-20261009-a` under the git-ignored working-tree path `.scratch/team-installer/evidence/` (not tracked; unavailable to readers without that local checkout). `run.mjs`, `proof.mjs`, `tail-link-proof.mjs`, `count.mjs`, and `build-pack.mjs` preserve commands/protocols; each command has exclusive `.log` and `.json` output containing timing and eight source hashes before/after. Test frames have exclusively assigned `*-frames` directories under that same persistent root. Artifacts contain test logs/synthetic fixtures, not auth/profile/session exports. Owned commands use the existing positive deadline/process-group cleanup helper. Runtime fixtures use `/tmp/opencode`, never the durable evidence root or real user HOME as a consumer fixture.

### Actual red, classification and smallest repairs

The starting seven hashes matched the supplied preserved identities exactly. Tight `red` command selected the six named seams in app/evidence/targetFlow with the stronger TMPDIR: **6 failed / 1 passed / 44 filtered**, Vitest 7.11s, owned invocation **7533.184ms**. The before/after source map is unchanged in `red.json`; full diagnostics and assertion locations are in `red.log`.

- **Two incompatible static parsers:** both demanded an uncapped path in the static summary after the prior required path cap. That prior change directly invalidated these assertions; no blanket pre-existing label is used. App/evidence now recover the **entire exact install label/path**, including all middle components, via the existing focused Space/details route, one Down at a time under a 128-input bound. They require exact frame restoration and no installation/writes while inspecting; evidence retains strict 99x24 geometry on every scanned frame and the exact eventual install-target oracle. Static summary/step/shortcut/focus checks remain.
- **Two unfocused B-model assertions:** Home correctly focuses the long review target, not every model. The tests still assert Target, then focus analyst/lead in order and require the visible focused `lead: other/b-model`. Exact B target, B saved config, outcome target, A filesystem preservation and no A team/editor directories remain unchanged. This is an observation mismatch at the preserved source identity, not evidence that the UI lost B's config; historical introduction is unknown.
- **One unfocused browser-child assertion:** the initial inspection row can occupy the viewport. The symlink test now observes parent, focused `real/`, and immediately following focused Show hidden in keyboard order, explicitly rejects `loop` in scanned frames and requires no intervening linked child. It no longer assumes an unfocused child is visible. No entry/filter/selection behavior changed; historical introduction is unknown.
- **Material consent access defect:** at 40x8 the exact normalized `savedconfig/defaults` explanation was buried behind wrapped full-path rows beyond the retained 20-Down budget. The only added production change moves the unchanged discard/load consequences **before** the full path in the confirmation hint. Full path and notice text remain intact; no geometry, paging/input algorithm, safety validation or writer change. The original normalized oracle and 20-Down cap remain, with strict fit assertions added for each consent detail frame. Temporary count instrumentation showed **0 Downs at both widths in each of short/long/strong**; it was restored byte-for-byte. This is reachability evidence, not a new runtime gain claim.

The first replacement full stronger run then exposed an **additional wrapping-oracle counterexample**, 123 passed / 1 failed: the draft diagnostic ended with a dot on one row and `md'` on the next (`rendered-strong.log`). Actual full tail was visible and fit 40x8. The owned detail test now joins adjacent wrapped rows for the tail oracle and requires **`.md'`**, strengthening the old `.md` check with its closing quote. Existing sentinel recovery, geometry, explicit close and Cancel assertions remain. This is an observed test-parser defect; its historical introduction is unknown. No further failures remain in the final executed matrices; arbitrary longer paths and other platforms are not claimed.

### Failure-oracle proof and restoration

- `missing-oracles`: deliberately substituted missing recovered full labels in app/evidence, an incorrect B saved model in the owned fixture, and removed `s` on **every** normalized consent predicate observation. **Six failures**, all at the intended full-path/focused-model/unchanged consent substring assertions, not setup or timeout; Vitest 6.00s, invocation **6379.640ms**. Missing consent text still exhausts the unchanged bounded scan and fails.
- `old-consent-order`: temporarily restored only the old path-first hint order. **40-column case fails**, 100-column case passes, at the unchanged consent substring assertion; Vitest 4.63s, **5000.588ms**. This directly ties the production correction to the supported stronger-path counterexample rather than relaxing the scan budget.
- `tail-link-missing`: temporarily admitted the fixture symlink in the owned directory helper and removed the normalized `.md'` tail observation. **Both tests fail** at their intended no-link/full-tail assertions, Vitest 1.10s, **1476.822ms**.

All mutations/instrumentation were restored using saved exact bytes in `finally`, with explicit byte equality checks; no Git reset/revert was used. No test, viewport, deadline, input limit or real freshness scenario was removed. The previously introduced 1/2/3-row geometry and 40x8 full-notice regression cases remain and pass in the final complete matrices. The historical approximately **0.73s** matched consent hotspot gain remains only that historical comparison; new totals are not a speedup claim.

### Final replacement gates (serialized)

Environment: Node `v22.22.0`, npm `11.14.1`, Linux x64; installed dependencies/OS caches reused. Short TMPDIR: `/tmp/opencode/t13-resume/short`; long: that owned base plus `long-parent-` + 18 `segment-` repetitions + `/end-sentinel`; stronger: that owned base plus **eight separate 68-character components** (`stronger-` + 12 `path-` repetitions). Same bounded definition as the prior report, different owned root; no escalation to arbitrary path exponents. Components and total paths stay below ordinary Linux name/path limits. Every invocation has a separate persistent EVIDENCE_DIR.

| Final replacement check / artifact prefix | Actual result | Vitest / owned invocation ms |
|---|---|---:|
| Affected seams + sentinel/geometry/notice, short / `affected-final-short` | 17 passed / 48 filtered | 7.80s / 8161.785 |
| Same, 18-segment / `affected-final-long` | 17 passed / 48 filtered | 8.01s / 8374.572 |
| Same, stronger / `affected-final-strong` | 17 passed / 48 filtered | 8.14s / 8498.984 |
| All rendered, short / `rendered-final-short` | 9 files / **124 passed** | 13.79s / 14145.444 |
| All rendered, 18-segment / `rendered-final-long` | 9 files / **124 passed** | 14.42s / 14784.800 |
| All rendered, stronger / `rendered-final-strong` | 9 files / **124 passed** | 15.29s / 15650.021 |
| `npm test -- --reporter=verbose` / `full-final` | 31 files / **323 passed** | 31.94s / 32289.220 |
| `npm run typecheck` / `typecheck-final` | exit 0 | — / 307.423 |
| Private copied-stage `npm run build` / `private-build` | exit 0 | — / 486.256 |
| Private copied-stage `npm run pack` / `private-pack` | exit 0; build + dry-run pack, **70 files**, helpers/tests not shipped | — / 729.167 |

Full suite again exercised the **real packed/npx routes**, not a mocked substitute or redundant separate network smoke: exact-current/stale/cache case 8568ms, unavailable metadata with populated cache 4008ms, checksum 288ms; release fixture compile 152ms, packs 420/313ms, exactly two packs. Private consumer HOME/XDG/npm cache/cwd isolation remains supplied by the existing release helper. npm dependency installation can contact the registry; download/cache/network attribution and variability remain **unknown**. Additional build/pack used only an owned copied stage with private HOME/XDG/cache/temp and exact copied-source hash equality; the stage was removed after owned-command teardown. Its Git stamp was skipped (not a Git repo); the real release fixture separately stamped the checked source identity. Shared repository dist was untouched.

Final full-suite release fingerprint: `34aa2cd8c8e8d942e533d969eaf5c2b4b05d0334e97993fadec1671f06826c5f`. All final gate before/after source maps match; the report append changes only documentation identity afterwards. Final SHA-256 values:

| Source | SHA-256 |
|---|---|
| `src/tui/app.test.tsx` | `903ae50b41b8e8a0977758d25ddf6e2c3baac01844279e421e032f434a24d6f8` |
| `src/tui/app.tsx` (preserved) | `993ab2761d28759c7690e7d3fdec7d1fc5630ce99da0e55ad207f81a02f3390f` |
| `src/tui/components/controls.tsx` (preserved) | `d8ca97d183dc7a8ca58f0ad6af60d5636d186e643863fe94c2f17c2bb17e3862` |
| `src/tui/screens/directory.tsx` | `5bb20fa00daa978c8428f436526d97ee59249337422d3830d672efb5cefffb8c` |
| `src/tui/detail.test.tsx` | `d12102da81dda788abc1c644a28f9c7c06c6f27135c37e40b61bd443da25a93c` |
| `src/tui/targetFlow.test.tsx` | `1ea9da52c9519ac3b20dfddb7c0c6cebfda8536926c2424500404274bda0ec75` |
| `src/tui/evidence.test.tsx` | `9627832702c910bcfd9bfbdf19d64cd0dca581d9dcd50162aae20a63cd3582c9` |
| `src/tui/screens.test.tsx` (preserved) | `f0a04a057e1a8b0d37b7cae6f628329c2698def787eec7bcdb20e0abcd1cdbcb` |

No remaining executed counterexample or mandatory check failure. UX recheck and independent Reviewer disposition remain pending; **this is not final approval**. No task/lifecycle records, unrelated source, profiles/services, staging, commits or publication were changed. Historical scratch evidence/active task13 records were retained.
