# GLM-5.2 at max effort through OpenCode Go

## Bottom line and scope

**Official Go documentation lists `glm-5.2`; official models.dev Go metadata lists `high` and `max` effort. This supports GLM-5.2 at max effort, not a separately named `glm-5.2-max` model.** No separate Max ID appears in the Go/Zen tables reviewed. Z.AI explicitly demonstrates `model: "glm-5.2"` with `thinking.type: "enabled"` and `reasoning_effort: "max"`. [1][2][3][4]

These public sources were fetched during this session; models.dev links below follow mutable `dev` branches. Local `opencode models opencode-go --verbose` also confirms `opencode-go/glm-5.2`, variants `high`/`max`, and input/output/cache-read costs of $1.40/$4.40/$0.26 per million tokens. Catalog metadata establishes availability/settings, not a successful model execution or role-quality comparison.

## Subscription, quota, and token pricing

Go costs **$10/month**; Go Plus costs **$40/month**. Both include GLM-5.2. Included usage is expressed as model-specific dollar allowances, metered using token prices, with **5-hour = 20%, weekly = 50%, monthly = 100%** of the listed monthly allowance. These allowance dollars are not the subscription charge or an extra upfront token purchase. [1]

| Go model | Input / output / cached read, USD per 1M tokens | Monthly allowance: Go / Go Plus |
|---|---:|---:|
| GLM-5.2 | 1.40 / 4.40 / 0.26 | $60 / $180 |
| DeepSeek V4 Flash, off-peak | 0.15 / 0.60 / 0.003 | $30 / $120 |
| DeepSeek V4 Flash, peak | 0.30 / 1.20 / 0.006 | same allowance |
| DeepSeek V4 Pro, off-peak | 0.66 / 1.98 / 0.022 | $15 / $60 |
| DeepSeek V4 Pro, peak | 1.32 / 3.96 / 0.044 | same allowance |
| Muse Spark 1.2 or 1.3 Contributor | 0.10 / 0.20 / 0.002 | $60 / $120 |

All table values come from Go's usage-limit tables; cached write is shown as unavailable for these entries. Thus GLM's allowance windows are **$12 / $30 / $60** on Go and **$36 / $90 / $180** on Plus. Plus costs 4× the subscription price but gives GLM 3× the allowance, DeepSeek Flash/Pro 4×, and Muse Contributor 2×. These are calculated allowance ratios, **not published model “multipliers” or extra max-effort surcharges**. The reviewed sources do not state a separate max-effort token price. Longer reasoning may consume more tokens; no max-specific request guarantee is documented. [1]

Do not sum the per-model allowances into a guaranteed independently spendable total: the page describes how each model counts toward allowances but does not fully specify mixed-model pooling/accounting. Its estimated GLM request counts (about 4,300/month on Go, 12,900 on Plus) use a particular highly cached workload, not guaranteed requests or max-effort throughput. Limits may change. With **Use balance** enabled, exhausted Go usage falls back to paid Zen credits. [1]

**Zen is separate pay-as-you-go billing.** Its GLM-5.2 rates match Go's token rates, but its published DeepSeek V4 Flash rates are **0.14 / 0.28 / 0.028** and Pro **1.74 / 3.48 / 0.145**: do not substitute Zen prices for Go quota accounting. Zen passes through card fees of 4.4% + $0.30 per transaction. [2]

## Does this justify replacing existing roles?

**It justifies evaluating GLM for long-horizon text coding; it does not establish that GLM should replace every listed model/role.** Go/Zen say they test model/provider combinations, but publish no role-specific comparison proving GLM-5.2-max-effort superiority over these exact alternatives. [1][2]

- **DeepSeek V4 Flash/Pro:** Go lists both exact IDs. GLM has a larger Go monthly allowance, but higher token rates than either at the documented peak/off-peak rates. Flash's low-cost/high-volume role is therefore not economically improved by default. DeepSeek's own current direct API documentation says legacy V4 Flash IDs are now aliases served by **V4.1 Flash**, and Pro is **V4-Pro-0813**. That does not prove OpenCode routes identically: compare provider-specific versions, not just labels. [1][5]
- **Muse Contributor:** identify the version (`muse-spark-1.2-contributor` or `muse-spark-1.3-contributor`), not an invented generic model ID. Its Go token rates are far below GLM's. Contributor permits training on prompts/completions and has geographic restrictions; this is a material product distinction, not evidence that GLM is better at its assigned task. [1][6]
- **Sol6.1 / Terra5.6:** Zen documents **`gpt-6.1-sol`** and **`gpt-5.6-terra`**; the retrieved Go list does not include them. Zen rates at ≤272K tokens are respectively **2 / 10 / 0.10** and **2 / 12 / 0.20** (input/output/cached read per 1M); above 272K they are **4 / 15 / 0.20** and **4 / 18 / 0.40**. GLM has cheaper uncached input/output but more expensive cache reads than both lower-context tiers. Lower token rates or included Go usage do not demonstrate equivalent planning, reviewing, or implementation quality. [2]
- **Evidence for GLM:** Z.AI advertises text-only 1M context, 128K maximum output, tools, and long-horizon engineering; it reports Terminal-Bench 2.1 **81.0** and SWE-bench Pro **62.1**. These are first-party claims, not proof of superiority over all exact alternatives above. models.dev corroborates text-only/tool/reasoning metadata and effective effort levels `high`/`max`, but metadata is not a quality benchmark or a guarantee of gateway limits. [3][4][7]

Decision: trial GLM on representative role tasks with comparable effort, actual provider versions, latency, cache behavior, and allowance consumption before changing role defaults. Public evidence supports availability and a plausible coding candidate; **blanket replacement remains unsubstantiated**.

## Primary sources

1. OpenCode Go: https://opencode.ai/docs/go/ — availability, endpoints, subscription, quotas, prices, estimates, fallback, privacy.
2. OpenCode Zen: https://opencode.ai/docs/zen/ — exact IDs, pay-as-you-go pricing, fees; endpoint lists also retain deprecated entries, so listing alone is not live-service proof.
3. Z.AI GLM-5.2: https://docs.z.ai/guides/llm/glm-5.2 — API max-effort examples, capabilities, first-party benchmark claims.
4. Official models.dev Go entry: https://raw.githubusercontent.com/anomalyco/models.dev/dev/providers/opencode-go/models/glm-5.2.toml — base model, `high`/`max`, prices.
5. DeepSeek Models & Pricing: https://api-docs.deepseek.com/quick_start/pricing/ — current direct API versions, legacy Flash aliases, prices and peak periods. Its Chinese-public-holiday exception is not stated in Go's schedule; retain the gateway's own billing terms.
6. Meta Contributor pricing: https://dev.meta.ai/docs/pricing-rate-limits#contributor-tier — exact versioned IDs, prices, training permission.
7. Official models.dev base entry: https://raw.githubusercontent.com/anomalyco/models.dev/dev/providers/zhipuai/models/glm-5.2.toml — effective effort levels and capability/limit metadata. Zen entry: https://raw.githubusercontent.com/anomalyco/models.dev/dev/providers/opencode/models/glm-5.2.toml.
8. OpenCode model configuration: https://opencode.ai/docs/models/#variants — variants change settings for the same model; they do not create a distinct upstream model ID.
