# Issue tracker: Local Markdown

Tasks live at `.scratch/<feature>/issues/<NN>-<slug>.md`, one file per stable task identity. Use `Status:` with the defaults in `triage-labels.md`; record blockers separately as `Blocked:` and `Blocked by:` IDs/paths. Comments/history append under `## Comments`.

Documentation defaults: direction/briefs in `docs/product/`, shared specs in `docs/specs/`, decisions in `docs/adr/`, domain vocabulary in `docs/domain/glossary.md`. Existing `CONTEXT.md` remains repository-wide context. Create only useful artifacts.

Wayfinder maintains direction, decisions and resume notes, potentially over many sessions. Slice creates actual tasks ready for refinement. Refine updates those same files until ready to implement. Lead records implementation/review progress against the same identities. Optional Plan adds technical details without duplicating tasks.

For this repo, done requires accepted scope, passing applicable checks, independent review and merged delivery. Local completion or a published PR alone is not done. A different target repo defines its own done gate in Project Setup.

Read existing records before writes and preserve IDs and unrelated content. Resolve task links after creation, distinguish hard dependencies from suggested order, and report any unpersisted drafts. Changing tracker destination requires explicit setup; never silently move tasks between stores.
