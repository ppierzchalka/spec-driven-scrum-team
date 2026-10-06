# Artifact contract

Use target-repo tracker conventions for destinations and native fields. This common shape is semantic, not a duplicate database.

- Direction: audience/problem, usage loop, useful release, non-goals, constraints, decisions, assumptions, open questions/owners, backlog.
- Refined idea/spec: goal, behavior, scope/non-goals, criterion IDs, decisions, dependencies, checks and blockers.
- Ticket: stable ID, implementation/spike type, outcome, scope, exact assigned behavior/criteria, spec/context links, blocked-by IDs, status, verification and results.
- Spike: question, bounded investigation, evidence/deliverable and decision unlocked; unknown feasibility is not implementation-ready.

Specs own shared behavior, Tickets own slice criteria/status, direction owns product intent. Update the owning artifact and link it.

| Field | Local Markdown | GitHub Issues | Azure DevOps |
| --- | --- | --- | --- |
| Identity | Path/local ID | Issue number/URL | Work item ID/URL |
| Body | Markdown sections | Issue body | Configured description/AC fields |
| State | Status line | State/configured labels | Configured process state |
| Dependency | Blocked by paths/IDs | Supported native relation or explicit linked list | Configured predecessor/successor relations |
| Spec/direction | Configured files | Repo docs/configured artifact | Repo docs/wiki/configured artifact |

Inspect actual capabilities/process fields; never invent relations, state names or endpoints. Use authorized installed connectors/CLIs. Remote writes require requested publication scope; local planning does not authorize remote publication.

When conventions are absent, propose docs/product/direction.md, docs/specs/<feature>.md and .scratch/<feature>/issues/NN-<slug>.md. Confirm once in Project Setup. Existing paths take precedence.

Read current items before writes, match stable identity, preserve unrelated fields and avoid duplicates. Verify persisted criteria, links, status/dependencies after writing; report unpersisted results.
