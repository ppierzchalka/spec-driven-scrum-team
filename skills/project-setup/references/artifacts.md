# Artifact and task contract

Follow target-repo conventions. These are semantic defaults, not a second database. Setup records paths, native fields and mappings once.

- Direction: problem/audience, usage loop, outcomes, constraints/non-goals, accepted decisions, assumptions, open questions and source links. Can cover a whole product or one area.
- Supporting docs: specs for shared behavior, glossary/domain boundaries for common vocabulary, ADRs for significant decisions. Create only what the scope justifies.
- Task: stable identity, goal/value, initial scope, source/area links, dependencies and refinement questions. Slice creates it; Refine enriches the same record with agreed behavior, acceptance criteria, checks and decisions.
- Spike: bounded question, investigation and evidence deliverable. Unknown answers are expected; unclear scope or deliverable prevents readiness.

Keep brief/spec/task ownership clear. Link shared behavior rather than maintaining editable copies. Preserve task identity through refinement, optional technical planning, implementation and review. Check existing records before writes; preserve unrelated fields and verify persisted links/statuses. Report partial or draft-only results honestly.

## Decision questions and active domain modeling

Apply this discipline inside Wayfinder, Slice, Refine and optional Plan; it is not another stage or required report.

- Track only consequential open decisions and their prerequisites in the owning artifact's existing open questions/resume state. Ask at most three currently answerable questions per turn, prioritizing those that unblock other decisions or expose expensive mistakes. Do not ask a dependent question before its premise is settled. After answers, update the remaining questions; reuse accepted decisions. Give a recommended answer with its reason and meaningful alternative/tradeoff; recommendations are proposals, never consent. Look up discoverable facts yourself; use scoped research or a specialist only when worthwhile and authorized.
- Actively model the domain as discussion changes it. Challenge ambiguous/overloaded terms and conflicts with the configured glossary; propose distinct canonical terms rather than guessing a meaning. Probe affected relationships, ownership, cardinality, lifecycle and invariants with a concrete normal case and relevant counterexample. Compare claimed current behavior with relevant code/docs, distinguishing current facts from desired changes. Surface contradictions for resolution instead of silently rewriting either.
- Persist accepted terms/definitions in the configured glossary when they crystallize; put relationships, invariants and agreed behavior in the owning domain doc/spec/task. Keep implementation recipes and session notes out of the glossary. Respect existing context-specific vocabulary and link shared definitions instead of duplicating them across tasks. If destinations are missing, resolve only the needed convention. Within authorized writes, update changed entries inline; do not generate a fresh report after every answer. Otherwise return an explicit draft.
- Offer an ADR only for a settled decision that has a meaningful reversal cost, needs rationale for a future reader, and chooses between genuine alternatives, or when explicitly requested. Record context, choice, alternatives and consequences; link an existing ADR when applicable. Routine definitions and reversible choices stay in their owning artifact. No empty scaffolding or ADR quota.

Depth follows the affected domain and risk: reuse settled language for a small unambiguous change; investigate consequential ambiguity before readiness. Technical choices that do not change the agreed behavior can remain with Developer. Do not turn every possible edge case into a question or demand exhaustive certainty.

## Default task lifecycle

| Semantic status | Meaning/owner |
| --- | --- |
| ready-for-refinement | Slice created a task; Analyst/user can select it |
| in-refinement | Analyst is refining; persists across paused sessions |
| ready-to-implement | Refine resolved consequential requirements and defined checks |
| in-progress | Lead started execution of an unblocked task |
| in-review | Implementation awaits the agreed review/delivery gates |
| done | Configured definition of done is satisfied |
| cancelled | Explicit decision not to continue |

Use one lifecycle status at a time; replace the previous mapped lifecycle label without removing unrelated labels. `blocked` is independent of status, with reason/owner and dependency links. A ready task can wait on implementation prerequisites; dispatch only the unblocked frontier. Refinement may move a task back from ready when requirements change. Cancellation and reopening follow user scope, never silently discard active work.

A review approval, local completion, PR creation, merge and deployment are distinct events. Setup defines which are required for done. Until those gates are met, keep the appropriate active status and record completed evidence; never infer merge/deployment from a local test pass. Briefs and ADRs do not use this task lifecycle.

## Tracker mapping

| Field | Local Markdown | GitHub Issues | Azure DevOps |
| --- | --- | --- | --- |
| Identity | Path/local ID | Issue number/URL | Work item ID/URL |
| Body | Markdown sections | Issue body | Configured description/AC fields |
| Lifecycle | Status line | Mapped labels or project status, plus open/closed mapping | Existing process states or configured tags/fields |
| Blocker | Blocked: reason; Blocked by IDs | Independent blocked label and supported links | Configured tag/relations |
| Dependency | Blocked by paths/IDs | Supported relation or explicit linked list | Configured predecessor/successor relations |

Inspect actual capabilities; do not invent states, relations, fields or APIs. For GitHub default to the semantic names as labels, closing only on done/cancelled when authorized. For Azure map to existing process states and use agreed tags when necessary; never mutate the process schema implicitly. Read current records before writes. Remote publication needs requested scope; local analysis does not itself authorize remote writes.

When conventions are absent, propose docs/product/<area>.md for direction, docs/specs/<feature>.md, docs/adr/, docs/domain/glossary.md and .scratch/<feature>/issues/NN-<slug>.md for local tasks. Setup confirms destinations once; existing conventions take precedence. Do not create empty document scaffolding for every small task.
