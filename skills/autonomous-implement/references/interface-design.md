# Product-specific interface contract

Use for visible web or game-interface changes. A stronger design model makes the decisions; a bounded implementation model follows the contract. Preserve the confirmed role toggles and command restrictions throughout.

## Ground the design

- Inspect the existing product, nearest relevant screen/scene, design-system components, and tokens. Cite specific paths/screenshots or approved reference screens and explain what each reference contributes.
- Establish the audience, primary action, information hierarchy, content density, and device/input constraints. Design around real product content and interactions, not interchangeable demo copy.
- Existing products keep their visual language unless redesign is explicitly requested. For a new interface, make deliberate hierarchy, typography, spacing, color, and component choices; ask for missing brand/reference direction when it is consequential.
- Use references as evidence for specific decisions, not permission to copy an unrelated product. Extra cards, gradients, badges, rounded surfaces, animation, or large empty areas need an actual hierarchy, feedback, or brand purpose.

## Write the contract in `ux_notes`

Provide enough detail for implementation without invented visual decisions:

| Contract field | Required decision |
| --- | --- |
| Goal and hierarchy | Primary action, reading/attention order, essential content, and secondary actions |
| Layout and density | Page/HUD/scene regions, alignment, sizing constraints, responsive or resolution behavior |
| Typography | Existing tokens/styles, roles, emphasis, wrapping/truncation behavior |
| Spacing and color | Actual token references or justified values, contrast and semantic color use |
| Components/assets | Named reusable components/scenes, meaningful variants, approved asset sources |
| Interaction and states | Input/focus/navigation, pending/empty/error/success/disabled states that apply, recovery |
| Distinctive decisions | Product-specific choices to preserve and where implementation has discretion |
| Verification | Rendered scenarios, viewport/resolution/input modes, comparison baseline, verifier |

List only applicable fields and states; explain consequential omissions. Provide concrete component/scene references, a wireframe/region description, or an annotated visual when useful. Avoid instructions like “make it modern/polished” as substitutes for decisions. If the contract depends on an unresolved requirement, record blocked rather than passing the ambiguity to Developer.

## Rendered finish gate

Include applicable checks in the run's agreed verification plan:

1. Compare the actual page/scene with the contract and product baseline using realistic content. Verify hierarchy, density, alignment, typography, token use, and required states.
2. Exercise the primary flow, meaningful failure/recovery path, focus/navigation, and applicable input modes. Check relevant viewport/resolution changes, overflow, and readability; a happy-path screenshot is insufficient for interaction claims.
3. Record observed deviations with screenshots or reproducible steps and affected components. Separate a design-contract violation from a preference; route fixes through enabled owners within the review budget.
4. State **observed pass**, **changes required**, or **not verified** with the rendered build/diff covered. Code review, successful compilation, and the assigned model's reputation do not count as visual evidence.

Lead assigns a verifier from the enabled roles or the user. If UX is enabled, it can perform a scoped post-implementation contract check before final review without changing the toggles. If UX is off, the user's design requirements and existing system remain the baseline. Missing access to a required browser/engine view leaves that check pending and is reported honestly.
