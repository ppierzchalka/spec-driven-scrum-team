# Conditional stack guidance

Read only the section relevant to the task. These are decision checks, not a mandate to redesign a project. Resolve versions and patterns from the target repo before relying on framework defaults.

For visible interface changes, use [interface-design.md](interface-design.md) to define and verify the visual/interaction contract. UX owns design decisions when enabled; Developer implements the contract, and Reviewer checks its evidence.

## Web / React / Next.js

- Establish installed versions, router, rendering model, and existing component/data-access conventions. Locate the nearest working analogue before introducing a new pattern.
- Keep server-only credentials and data access on the server. Introduce client boundaries only where interaction/browser APIs require them; account for serialization and hydration at the boundary.
- Match the project's data-fetching, caching/revalidation, mutation, routing, and error-handling patterns. Verify current version behavior when an API or default materially affects correctness.
- Use established design tokens and components. Specify relevant responsive, loading, empty, error, pending, success, focus, and recovery states. Verify semantic controls and keyboard behavior; visual inspection and automated accessibility checks cover different things.
- For auth, server actions, APIs, or untrusted content, assess authorization at the actual operation, validation at trust boundaries, and rendering/storage risks. Security off does not excuse a concrete defect, but it does not authorize dispatching Security.
- Choose checks that exercise the affected behavior: component or integration tests for interaction/data flow, browser checks for navigation/hydration, and the project's type/lint/build gates. Inspect scripts before running them; browser/e2e tests may use external services or mutate data.

## Games / engines

- Establish engine/version, scripting language, scene/entity/resource architecture, lifecycle, and existing ownership patterns. Prefer the project's engine-native composition and tooling over importing web/service abstractions.
- Locate when input is sampled, simulation/physics advances, and visuals update. Check frame-rate independence, coordinate spaces, pause/resume, lifecycle cleanup, and save compatibility only where affected.
- Keep simulation logic separable enough to verify when the project supports it. Preserve determinism and performance budgets where required; measure a claimed performance regression/improvement instead of guessing.
- For HUD/menu/player interaction, specify keyboard/controller/mouse/touch behavior as applicable, focus and feedback, readability, and failure/recovery states. Make changes fit the game's visual and interaction language.
- Local mechanics usually have no Security stage. Multiplayer authority, network messages, accounts, payments, downloaded mods, and untrusted saves introduce actual trust boundaries; explain them when recommending Security.
- Use engine-supported headless/unit/integration checks when available. For visual behavior, game feel, or editor-only interactions, provide a named scene/build, setup, exact actions, expected result, and who must verify it. A successful compile is not evidence of correct gameplay.
- Preserve generated/imported assets and scene/resource identifiers according to project tooling. Avoid hand-editing generated files or bulk reimporting assets without understanding the effects.
