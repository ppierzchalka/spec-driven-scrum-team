# Spec-Driven Scrum Team

Explore an idea with **Analyst**. Hand ready tasks to **Lead** for implementation and independent review.

Eight agent roles and twelve skills, installed per repository for **OpenCode, Claude Code, Codex, Antigravity or GitHub Copilot**. Autonomous execution requires native multi-agent support in your harness.

## Install

Requires Node.js 22.19+ and npm. The interactive setup defaults to the
directory you run it from and offers a folder picker for another existing
directory; the confirmed single target receives the install. There are no
target-path arguments and no multi-target mode. Passing a path fails with
usage instead of installing elsewhere. Noninteractive `--defaults` always
installs into the current directory.

**Registry-free launch from GitHub Releases (no npm publish, no clone):**

```sh
cd your-project
npx --yes --package=https://github.com/ppierzchalka/spec-driven-scrum-team/releases/download/current/installer-current.tgz install-team --harness=opencode
```

Requires Node.js 22.19+ and npm. Every launch resolves the newest
successfully verified master build, verifies its exact tarball checksum, and
executes that exact build — even when an older npx install is cached. Pass
installer flags after the bin name, e.g. `install-team --defaults --toady`.
Network, lookup or verification failures abort before anything is written, so
a stale cache is never silently run. Each run prints its build identity
(`version+commit`) for diagnosability. Even `--help` verifies freshness first,
so the text you read always belongs to the current build.

> No release is published yet: until the first successful master build ships
> its `current` release, the command above fails closed. Track
> [releases](https://github.com/ppierzchalka/spec-driven-scrum-team/releases)
> or install from a checkout below in the meantime.

**Local development:**

```sh
git clone https://github.com/ppierzchalka/spec-driven-scrum-team.git
cd spec-driven-scrum-team
npm install
npm run setup
```

A keyboard-first native full-screen setup walks four steps:
**installation directory (invocation-folder default plus a folder picker for
another existing directory) → agents and models →
personal instructions → review and install**. Navigate with **↑/↓** (**Home**,
**End**, **PgUp**/**PgDn** in long lists), activate with **Enter**,
**Space** toggles checkboxes (and types in inputs), **Tab** moves between
search and list, **Esc** opens a safe Quit dialog from anywhere — editors
offer explicit Cancel rows and Back navigation for local cancellation —
before anything is written. No mouse. Browsing folders never changes the
target or writes files: only an explicit **Use this folder** action confirms
a new single target (loading that folder's saved configuration, with explicit
consent when it would discard your session edits), while **Cancel** keeps the
prior target. Choose a harness in the agents step.
Personal instructions start with a **Toady** checkbox: **Enter** toggles the
optional cartoon-minion style (Space still toggles checkboxes too). Then **Additional rules
(loaded to persona)** imports your own coding, commit, formatting or service
instructions into the same startup persona, independently of Toady. Persona and
imported rules are saved privately in your user configuration, apply across
projects for that harness, and are retained on update. Agent definitions and
skills stay per repo. Run setup again for another harness or to update an
installation.

Everything is validated before writes. Only the selected harness's files are
installed. Setup adds a managed block to the target's `.gitignore` that
ignores the installed agent, skills and config paths while leaving the rest of
`.gitignore` alone, and configures the target's `.vscode/settings.json` so
**Ctrl+P** reaches applications running in the VS Code integrated terminal.
Existing unmarked skill folders require explicit adoption; recognized unchanged
legacy Planner definitions are removed on update. [Installation and model
settings →](docs/team-configuration.md)

## From idea to ready task

Work with **Analyst**. Start at the point that fits what you already know.

| Skill | Result |
| --- | --- |
| `project-setup` | Documentation paths, task tracker, statuses and definition of done. Run once; revisit when conventions change. |
| `wayfinder` | Product or feature direction: brief, shared vocabulary and significant decisions. Resume across sessions. |
| `slice` | Manageable tasks with dependencies, marked **ready-for-refinement**. |
| `refine` | One task with accepted behavior, scope, criteria and verification, marked **ready-to-implement**. |
| `plan` | Optional technical execution detail on the existing task. |

Domain modeling happens during the conversation: Analyst clarifies ambiguous terms, checks relationships against scenarios and code, and records accepted definitions and rules in the configured documents. ADRs capture decisions worth preserving.

A small change can start at `refine`. A ready task can go straight to Lead. You decide how long discovery lasts.

## From ready task to working change

Use **Lead** with `autonomous-implement` and one or more task references. For example:

> Implement tasks 12 and 15 locally. Use Developer and Reviewer. Keep the work in this checkout.

Lead proposes the team, task grouping, dependency order and checks. **Developer + independent Reviewer** is the default; specialists join when their input has value. Related tasks can share a bounded execution context while retaining separate criteria and outcomes. Concurrent writable work uses isolated worktrees.

Choose **local changes, separate PRs, stacked PRs or one consolidated PR** before execution. Stacking and consolidation are also available later on request. Merge and deployment require explicit authorization.

## Consult a specialist

Agents define responsibility and runtime settings; skills describe how to do the work. You can consult any specialist directly, without Lead or a pipeline.

| Agent | Skill | Focus |
| --- | --- | --- |
| Architect | `architecture-assess` | Boundaries, interfaces and design tradeoffs |
| Security | `security-assess` | Threats and trust boundaries |
| UX | `interface-assess` | Interface behavior and interactions |
| Tester | `test-design` | Cases and verification; read-only by default |
| Developer | `implement-task` | Code, tests and checks |
| Reviewer | `review-change` | Requirements, code quality and evidence |

## Details and validation

[Configuration](docs/team-configuration.md) · [Workflow scenarios](docs/prompt-evaluation.md) · [Design decisions](docs/adr/0004-skills-and-execution-packets.md)

```sh
npm test
npm run typecheck
npm run build
```

For focused feedback, use `npm run test:fast` (non-rendered tests and test-helper
regressions), `npm run test:rendered` (Ink interaction tests), or
`npm run test:release` (serialized shipped-bin/freshness integration).
`npm test` still runs all three projects; CI and final verification retain
the complete suite, typecheck, build and packaging checks. File/test-name
filters can narrow a selected project further.

Release tests compile once into a private `/tmp/opencode` fixture, recording
HEAD plus a working-tree content fingerprint, and pack twice (base and a
second stamped identity). They do not rebuild or clean repository `dist/`.
Every subprocess has private HOME/XDG/temp/npm cache configuration, with
explicit same-cache reuse inside freshness scenarios. These are real `npx`
calls: `file://` metadata does **not** make dependency downloads offline;
cold-cache/network cost remains part of release-suite timing. Test-owned
noninteractive commands use file-backed logs, a deadline and POSIX group
teardown with graceful termination then escalation; timeout, nonzero exit,
spawn failure and abort remain distinct. Windows process-tree cleanup is
unverified and unsupported by this helper. Linux orphan zombies may await
PID 1 reaping; teardown verifies no executable descendants or heartbeats
remain. No interactive user process is subject to these test deadlines.

Installer tests and local workflow trials are documented. Native behavior varies by harness and version; token savings need measurement on your actual setup. The prompts coordinate agents; runtime permissions enforce their access.
