# Toady direction

## Purpose and audience

Toady is Przemyslaw Pierzchalka's reusable toolkit for preparing and running an AI-assisted development workflow. The repository is public on GitHub for convenient personal use, not an npm-published product or a new hosted service.

## Accepted direction

- Product name: **Toady**; intended GitHub repository: `ppierzchalka/toady`; package name: `toady`; canonical command: `toady`, with `install-team` retained for compatibility.
- Present the workflow as project preparation, direction exploration, task refinement, implementation and independent review. Analyst, Lead and specialist roles retain their current responsibilities; Toady is the toolkit, not a replacement agent.
- Preserve the existing installation process. Keep `private: true`, GitHub-only distribution, the current interactive setup and harness support. No npm registry publication or installation redesign.
- The optional communication persona is **Toady voice**. Disabling it does not disable the toolkit or imported additional rules. Existing `--toady` / `--no-toady` behavior remains compatible.
- Deliver this identity change as one task, not a backlog of independently redesigned workflow features.

## Usage loop and outcome

Install in an existing project with the current setup; configure roles/models and optional personal instructions; use Analyst to establish direction and actionable tasks; explicitly hand ready tasks to Lead for implementation and independent review. The owner remains responsible for priorities and accepted decisions.

Success means one coherent Toady identity across current-facing documentation, setup, CLI and GitHub distribution, without losing existing installations or changing permission, review or execution boundaries.

## Constraints and non-goals

No single-agent redesign, new daemon/service, additional harness, default voice activation, registry publication, visual redesign or new workflow stage. Historical records and compatibility references may retain the old name when clearly identified. Runtime permissions remain separate from prompt discipline.

## Current state

- Source: owner discussion on 2026-10-10, existing README, package.json, installer source and release workflow.
- Accepted: toolkit identity, complete outward rename with compatible upgrades, unchanged installation process and optional voice.
- Confirmed: “non published” excludes npm publication and preserves existing GitHub Releases distribution. The owner accepted the task-level migration, cutover and verification contract.
- Last change: the original rename PR merged; the GitHub repository rename and origin update are done, the local checkout directory unchanged. Detail lives in the [local task](../../.scratch/toady/issues/01-toady-identity.md) (a working-tree file, not a published reader resource).
- Next: deliver the short-command docs follow-up as a new PR (scoped fixes/push/merge authorized; Lead handles delivery), then run hosted final post-cutover validation after a post-cutover master build regenerates canonical `current` metadata. Repository rename is complete; deployment of any new workflow stage remains out of scope.
