# Toady

A reusable personal multi-agent toolkit: eight thin agent definitions, twelve procedures as skills, selected-harness adapters and a target-repo installer. Current usage starts in README.md; historical proposals are marked as such.

## Vocabulary

- **Analyst**: product analysis partner using Setup, Wayfinder, Slice, Refine and optional Plan. Owns analysis artifacts; never starts implementation implicitly.
- **Lead**: one execution coordinator consuming ready tasks, selecting a proportionate team and preserving the agreed configuration/delivery scope.
- **Role definition**: model/effort, native tools/permissions and ownership adapter. **Skill**: reusable procedure loaded when relevant. Both can be used in direct consultation.
- **Ticket/task**: one stable tracker record, enriched through refinement with criteria, dependencies and checks. Lifecycle mappings follow target conventions.
- **Execution packet**: bounded coherent tasks sharing a worker context. Task IDs and outcomes remain separate. Not a merged tracker task or an automatic consolidated PR.
- **Review unit**: agreed scoped diff (task or packet) with an independent verdict and per-task disposition; default two total passes.
- **Worktree**: isolated Git checkout for a concurrent writable packet, not process/model isolation. One local packet uses the current checkout.
- **Handover**: one effective run contract, reusing explicit choices and project preferences. Missing delivery choice is asked before execution.
- **Delivery**: local, separate PRs, stacked PRs or consolidated PR, explicitly chosen. Merge, deployment and cleanup are separate actions.
- **Tester mode**: test-design (read-only cases/seams) or explicitly test-author (writes tests; Developer owns production).
- **Provider**: configured model service. Available credentials are not organizational authorization; inherit is the corporate Vertex starting point.
- **Verified evidence**: actual check results tied to the reviewed version/environment. Missing/manual gates stay unverified.

There is no Guardian/Jev command gateway, scheduler daemon, tracker client, billing limiter or sandbox implemented here. Runtime restrictions are separate from prompt discipline. Native capabilities and model selection must be verified in the chosen harness.
