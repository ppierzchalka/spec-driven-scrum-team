# Task lifecycle defaults

Use the lifecycle in `skills/project-setup/references/artifacts.md`:
`ready-for-refinement` → `in-refinement` → `ready-to-implement` → `in-progress` → `in-review` → `done`.
`cancelled` records a deliberate decision not to continue. `blocked` is an independent marker with a reason/owner, not a replacement lifecycle status.

This repo uses these exact strings in local task `Status:` lines and an optional `Blocked:` line. Existing projects map these meanings during Project Setup; do not silently overwrite their vocabulary. Remove only obsolete lifecycle labels when transitioning, preserving unrelated tags.
