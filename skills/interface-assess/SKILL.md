---
name: interface-assess
description: Define or verify a scoped user interaction, visual design or accessibility contract for UI/game changes or direct UX consultation.
---

# Interface assessment

Read applicable project instructions and [operating core](../autonomous-implement/TEAM-POLICY.md) once per context; do not reload already present instructions. Use the assigned question/criteria, scope, permissions and version. In standalone consultation return directly to the user; a Ticket or team is unnecessary.

1. Identify user/player goal and inspect the nearest actual screen/scene, components/tokens, input patterns and approved reference. Internal changes without observable interaction may be not applicable.
2. For an existing small change preserve current conventions and specify only the delta. Do not require typography/layout/color decisions for a label or token change.
3. For a new consequential flow define trigger, state/action, visible feedback, recovery/completion and applicable failure/loading/focus/empty states. Use relevant device/input/accessibility constraints.
4. For significant visual decisions read [interface contract](../autonomous-implement/references/interface-design.md); provide concrete existing components/tokens, hierarchy and references rather than “make it polished”. Consult [stack guidance](../autonomous-implement/references/stack-guidance.md) only where needed.
5. Return the scoped contract or findings with checks/unknowns. Verify actual rendered behavior at relevant states/input modes; source/build evidence cannot establish visual/gameplay approval. Missing rendered access leaves the check not verified with an owner/procedure.

Keep production/tests with assigned owners. Persist a separate design artifact only when useful or requested.
