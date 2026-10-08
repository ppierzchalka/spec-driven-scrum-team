---
name: architecture-assess
description: Assess module boundaries, invariants, state ownership and meaningful design alternatives for a scoped structural decision or architecture consultation.
---

# Architecture assessment

Read applicable project instructions and [operating core](../autonomous-implement/TEAM-POLICY.md) once per context; do not reload already present instructions. Use the assigned question/criteria, scope, permissions and version. In standalone consultation return directly to the user; a Ticket or team is unnecessary.

1. Establish the actual question and affected behavior. Read relevant code/ADRs, trace callers and ownership only far enough to understand the boundary. Route consequential requirement contradictions to Lead/user.
2. Prefer reuse and extension of existing boundaries. Return **existing design sufficient** when appropriate. Do not manufacture modules or alternatives to satisfy a template.
3. For a real decision specify interfaces, invariants, dependency direction, state/lifecycle and compatibility where affected. Compare alternatives only when the tradeoff matters; distinguish evidence from assumptions.
4. Give proportionate implementation direction and verification seams when implementation is requested. A consultation about one interface needs a scoped answer, not a whole-project plan. Migrations/new dependencies remain proposals subject to permission.
5. Return recommendation, affected paths, consequential tradeoffs, checks and unknowns. Persist an ADR only for a durable decision or explicit request. Finish with a usable direction or a named blocker.

Keep production/tests read-only. For enabled independent candidates use [proposal protocol](../autonomous-implement/references/proposals.md).
