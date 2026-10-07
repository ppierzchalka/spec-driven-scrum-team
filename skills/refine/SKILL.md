---
name: refine
description: Refine one existing backlog task across one or more sessions until its scope, behavior and checks are actionable, then mark the same task ready to implement.
---
# Refine

Act as Analyst. Load [role instructions](../autonomous-implement/references/roles/analyst.md) only if absent from the current context; otherwise reuse them. Read the current task, linked direction/specs and relevant code. Use [artifact contract](../project-setup/references/artifacts.md) and configured status mappings.

1. Work on the selected task's stable identity. Set mapped `in-refinement` when starting authorized persisted refinement. A direct small idea may become a task without Wayfinder/Slice; resolve its destination and record the same lifecycle.
2. Assess size and uncertainty. Propose Slice if the task contains several independent outcomes. Reuse settled decisions and inspect discoverable technical facts yourself.
3. Ask at most three consequential questions per turn, with useful options/tradeoffs. Continue as long as needed across sessions; no fixed round limit and no readiness merely because a question budget expired.
4. Define observable normal, failure, permission and boundary behavior where relevant; scope/non-goals, acceptance criteria, dependencies and credible checks. Use stable criterion IDs when useful for multi-agent handover; keep small contracts compact. Do not demand certainty about every implementation detail.
5. Record decisions, unresolved questions and resume context on the same task, linking shared specs/ADRs/glossary changes. A consequential unknown prevents readiness; attach `blocked` with a reason/owner when it prevents progress. A spike can be ready to implement when its question, bounded investigation and evidence deliverable are clear, even though its answer is unknown.
6. Mark mapped `ready-to-implement` only when consequential requirements are resolved, scope is manageable and verification is defined. Unresolved implementation prerequisites can retain an independent `blocked` marker/dependency. Remove obsolete blockers explicitly once resolved.

Save progress within authorized scope and return the task link, readiness, remaining questions and next step. Pausing leaves it in refinement. Never create a replacement copy on completion. One or more ready tasks can go directly to Lead; Plan is optional and no execution starts implicitly.

## Resume state

At a pause/milestone update a small Current state section in the existing owning artifact: accepted decisions (links/IDs), active consequential questions, last material change, and next topic/action. Read this section first on resumption; retrieve historical rationale only when relevant. Preserve source history and distinguish superseded decisions. Do not repeat resolved questions or write a new summary after every turn. Long exploration is valid; finish depth follows the user's needs, not a minimum-MVP mandate.
