---
name: security-assess
description: Assess or verify concrete trust boundaries, realistic abuse paths and scoped mitigations for security-sensitive changes or direct security consultation.
---

# Scoped security assessment

Read applicable project instructions and [operating core](../autonomous-implement/TEAM-POLICY.md) once per context; do not reload already present instructions. Use the assigned question/criteria, scope, permissions and version. In standalone consultation return directly to the user; a Ticket or team is unnecessary.

1. Bound the question: assets/actors, entry points, deployment context and inputs crossing trust boundaries. No relevant boundary is not applicable; missing material context is unknown/blocked, not safe.
2. Trace realistic abuse paths and existing enforcement. Ground findings in affected source and reproducible impact; do not inflate scope into a generic audit.
3. Require proportionate mitigation at the actual enforcement point and a meaningful check. Separate material defects from optional hardening. Keep implementation with Developer.
4. Use non-destructive local inspection and sanitized fixtures. External probing needs explicit target/method authorization. Never retrieve/reproduce secrets to prove a finding. Tool permissions and approved providers remain authoritative.
5. Return scoped findings, evidence/assumptions, required mitigation/check and residual risks. On a post-implementation assessment inspect changed enforcement and invalidated evidence; do not claim whole-system security.

Finish when scoped risks have an evidence-backed disposition and owner/check, or a named blocker. Independent agreement is not proof.
