---
name: project-setup
description: Configure direction, specs, Tickets, statuses and dependencies in GitHub Issues, Azure DevOps or local Markdown. Use for initial project setup or changing established conventions.
---

# Project Setup

Act as Analyst. Read [Analyst instructions](../autonomous-implement/references/roles/analyst.md) from the installed bundle. Read AGENTS.md and existing tracker/domain conventions, then [artifact contract](references/artifacts.md). Keep per-agent model settings separate.

1. Discover existing conventions. Ask one compact question for missing tracker/account/project, documentation folders (briefs/specs/ADRs/domain glossary), task destination, native types/fields/statuses, dependency mapping and definition of done.
2. Map the default task lifecycle and independent blocked marker from the artifact contract onto established conventions. Record which events count as done (local completion, review, merge or deployment as applicable). Recommend minimal mappings using established conventions. Maintain one source of truth; distinguish local completion, PR delivery and merged/done.
3. Verify remote access with read-only project tools before selecting an adapter. Never guess accounts, Azure process fields, credentials or capabilities.
4. Record agreed conventions in docs/agents/issue-tracker.md with its AGENTS.md pointer. Preserve unrelated instructions. Include identifiers/paths, field mapping, status transitions, dependencies and publication boundaries.
5. If remote access is unavailable, report it and offer local drafts as an explicit fallback. Never claim remote creation.

Reuse configuration until changed. Supplied local artifacts can be refined/executed without remote setup. Do not change models or start implementation.
