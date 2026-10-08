# Spec-Driven Scrum Team

Explore an idea with **Analyst**. Hand ready tasks to **Lead** for implementation and independent review.

Eight agent roles and twelve skills, installed per repository for **OpenCode, Claude Code, Codex, Antigravity or GitHub Copilot**. Autonomous execution requires native multi-agent support in your harness.

## Install

Requires Node.js 22+.

```sh
git clone https://github.com/ppierzchalka/spec-driven-scrum-team.git
cd spec-driven-scrum-team
npm install
npm run setup
```

Select target folders with **Space**, navigate with **←/→**, and confirm with **Enter**, then choose a harness, configure agent models and enable **Toady**, an optional cartoon-minion communication style. Directly below it, **Additional rules (loaded to persona)** imports your own coding, commit, formatting or service instructions into the same startup persona, independently of Toady. Rules are retained on update. Run setup again for another harness or to update an installation.

One configuration is applied to all selected folders. For a direct install, paths still work: `npm run setup -- ../project-a ../project-b`. All targets are validated before writes. Only the selected harness's files are installed. `.gitignore` stays yours. Existing unmarked skill folders require explicit adoption; recognized unchanged legacy Planner definitions are removed on update. [Installation and model settings →](docs/team-configuration.md)

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

Installer tests and local workflow trials are documented. Native behavior varies by harness and version; token savings need measurement on your actual setup. The prompts coordinate agents; runtime permissions enforce their access.
