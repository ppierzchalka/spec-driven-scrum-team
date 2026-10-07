# Usage and limits

Use only for requested metrics/budgets or relevant available runtime usage. No mandatory reports. Store sanitized aggregates once in the task/batch result or chosen usage location, never full transcripts, credentials or private reasoning.

For each **non-overlapping stage interval**, record task IDs/packet, model/provider/effort, elapsed time, dispatch/review counts, actual input/output/cached/reasoning token fields, cost/currency, source and outcome. Include count of repeat reads, repairs and user interventions when observable. Missing values remain unknown. Do not duplicate the same packet interval into each task's cost or add a parent's inclusive totals to child usage. Provider fields can overlap (cached is often part of input); keep categories separate.

The optional `scripts/summarize-usage.mjs` accepts an array of these normalized aggregate rows and prints whitelisted rows, partial totals and costs separated by currency. It does not fetch billing, inspect sessions or export data. Review/sanitize all identifier strings before input; a field whitelist is not secret detection. Run locally with `node <installed-skill>/scripts/summarize-usage.mjs <normalized-aggregates.json>`. Never infer billed cost from prompt words. Summed stage times are not elapsed wall time when stages overlap.

Assess cost per correctly delivered result within comparable size/risk classes, first-pass success, repairs/regressions and user interventions. Review approval alone is not ground truth. Extra analysis or a stronger approved model can be economical if it reduces rework. Measure rather than labeling every extra token waste.

Check proposal/dispatch/review bounds before dispatch. Monetary ceilings are advisory unless runtime exposes reliable enforcement; state this before execution. Stop new dispatches at observed bounds, preserve work and request a specific extension. No fabricated metrics or automatic billing integration.
