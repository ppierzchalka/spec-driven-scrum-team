# Independent proposals

Use only explicitly enabled read-only Architect, Security, UX or Reviewer stages. Developer/Tester writing stays single-owner. Candidates must not edit production/tests or shared Ticket sections; return standalone results.

1. Fix the question, constraints, evidence target, evaluation criteria and candidate bound. Usually two candidates, one evaluation, no automatic tournament. Name the consequential question/risk each candidate should clarify. Allow one bounded response to concrete conflicts only when agreed; do not seek endless consensus. An evidence gap leads to a check/spike or human decision.
2. Give standalone identical inputs plus distinct lenses: minimum change, correctness/invariants, performance or maintainability. Exclude planning-chat reasoning and competitors' answers.
3. Return short approach, boundaries, tradeoffs, criterion coverage, evidence, unknowns and fatal risks. No implementation.
4. Evaluate mandatory constraints first, then verification feasibility, complexity, maintainability and relevant performance. LLM scores are not proof; unknown claims need verification.
5. Select or synthesize compatible parts explicitly. Persist reasons, discarded options and unresolved decisions once. If none meets mandatory constraints, report blocked or a scoped spike rather than forcing a winner.
6. Resolve conflicting shared decisions before implementation.

Separate contexts reduce answer leakage but can share model blind spots. Worktrees are file isolation, not knowledge/process isolation.

Reviewers inspect spec, diff and tests/evidence before Developer justification, then reconcile role constraints/notes. They return findings/verdicts, not alternate code.
