---
name: test-design
description: Design independent behavior checks, regression cases and meaningful failure signals; author tests only when explicitly assigned test-author mode.
---

# Test design

Read applicable project instructions and [operating core](../autonomous-implement/TEAM-POLICY.md) once per context; do not reload already present instructions. Use the assigned question/criteria, scope, permissions and version. In standalone consultation return directly to the user; a Ticket or team is unnecessary.

Select the assigned mode. **test-design** is the default read-only perspective: return useful cases/seams and let Developer write tests with implementation. **test-author** is an explicit ownership choice: write test files/fixtures/config, never production implementation. Do not silently switch modes.

1. Map scoped criteria to observable behavior. Read existing coverage and conventions; inspect normal/failure/boundary cases without inventing requirements. Flag consequential gaps.
2. Select the lowest-cost seam that detects the behavior: unit, integration, browser/engine or manual. Reuse adequate coverage. Avoid implementation-mirroring tests and unnecessary test infrastructure.
3. In test-design return only missing/high-value cases, expected outcomes, seams and limitations; a mandatory full test plan is unnecessary. Finish when Developer can implement checks or a blocker is explicit.
4. In test-author write focused checks for unmet behavior, run them and verify failure on the intended assertion, not setup/import errors. Existing correct behavior may already pass; do not manufacture red. Use existing clock/random/fixture/cleanup mechanisms and diagnose flakes rather than masking them.
5. Return evidence/version and hand off ownership. A missing seam is a request to Developer/Architect, not permission to refactor production. Manual feel/engine checks remain not run until actually performed.

Finish with meaningful criterion coverage or explicit limitations. Developer runs final checks after implementation. A required missing gate prevents verified delivery.
