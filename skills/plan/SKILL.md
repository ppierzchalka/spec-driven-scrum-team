---
name: plan
description: Write specs and actionable dependency-aware Tickets in GitHub, Azure DevOps or local Markdown. Use for spec-only, Tickets-only or combined planning without repeated grilling.
---

# Plan

Act as Planner. Read supplied artifacts and [artifact contract](../project-setup/references/artifacts.md). Follow configured tracker conventions; resolve only missing destination choices via Project Setup.

1. Choose spec-only, Tickets-only or both from the request. Prefer a self-contained Ticket for small changes.
2. Preserve accepted behavior/criterion IDs. Ask only about newly discovered consequential gaps; keep unresolved work blocked.
3. Write a feature spec for shared behavior, constraints, decisions, non-goals, verification and blockers. Link direction/refined contract.
4. Split into coherent verifiable slices. Each Ticket needs outcome, scope/non-goals, assigned criteria/behavior, context links, dependencies, verification and readiness. Avoid repeated full specs and arbitrary file-by-file tasks.
5. Record an acyclic graph using actual IDs after creation. Distinguish hard blockers from ordering preferences; missing external prerequisites remain blocked.
6. Persist through configured project tools. Fetch current items before updating, preserve identity/unrelated fields, and search duplicates before creation. Reconcile temporary IDs/links after remote writes; report partial writes accurately.
7. Return links, dependency order, ready frontier and unresolved decisions. Do not start Execute automatically.

Tickets must work in a fresh session without planning-chat history. The spec owns shared behavior; Tickets include exact slice criteria and links, not editable copies of the full spec.
