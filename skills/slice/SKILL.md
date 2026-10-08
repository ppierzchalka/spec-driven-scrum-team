---
name: slice
description: Split product direction or a large feature into areas, domains and real backlog tasks ready for refinement, using the configured tracker.
---
# Slice

Act as Analyst. Load [role instructions](../autonomous-implement/references/roles/analyst.md) only if absent from context. Read selected Wayfinder artifacts and [artifact contract](../project-setup/references/artifacts.md), including its active-domain-modeling discipline; reuse already loaded instructions. Reuse configured destinations; use Project Setup only for missing material choices.

1. Select the requested scope; identify areas/domain boundaries and useful increments. Update relevant glossary, domain docs, specs or ADRs only where the decomposition adds information.
2. Create manageable tasks, preferably vertical outcomes rather than arbitrary database/API/UI layers. Allow technical enablers or spikes when independently justified. Distinguish grouping areas from executable tasks. Target independently demonstrable/verifiable increments with scope that can fit a fresh worker context after refinement. For broad mechanical migrations that cannot land as green vertical slices, prefer expand (compatible new form), migrate (bounded callers), then contract (remove old form), with genuine blocking edges. If intermediate green states are impossible, expose the required integration gate instead of claiming independent delivery.
3. For each task record stable identity, goal/value, initial scope/non-goals, source links, domain/area, known dependencies and questions for refinement. Acceptance criteria may be provisional; do not invent decisions or label unfinished analysis implementation-ready.
4. Persist real tasks in the configured GitHub/Azure/local tracker with mapped `ready-for-refinement` status for newly created tasks. Preserve existing lifecycle states and accepted scope when matching tasks; never reset in-progress/done tasks or silently change their contract. Reopening or returning existing tasks to refinement needs explicit user scope. Read/search existing tasks first, update matching identities and preserve unrelated fields. Create remote tasks only within authorized publication scope; otherwise provide explicit drafts.
5. Separate hard dependencies from suggested order, check for cycles, and resolve actual IDs after creation. Link task identities back to the owning area/spec without copying task state into another backlog database.
6. Return created/updated task links, suggested refinement order and unresolved questions. Report partial writes accurately. The user can refine one now and leave the others for later sessions.

Re-slicing existing work preserves identities where possible. If a task must split, link the resulting tasks and explicitly record the old task's disposition; do not silently delete or duplicate it. Do not run Refine or implementation automatically.
