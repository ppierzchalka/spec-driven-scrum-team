import type { AgentChoice, TeamConfig } from './types.js';

interface DefaultRule {
  patterns: string[];
  reasoningEffort: string;
}

const DEFAULT_RULES: Record<string, DefaultRule> = {
  lead: { patterns: ['opencode-go/kimi-k3', 'opencode-go/qwen3.8-max', 'opencode-go/deepseek-v4-pro'], reasoningEffort: 'medium' },
  architect: { patterns: ['opencode-go/deepseek-v4-pro', 'opencode-go/kimi-k3', 'meta/muse-spark-1.3-contributor'], reasoningEffort: 'high' },
  security: { patterns: ['opencode-go/deepseek-v4-pro', 'opencode-go/qwen3.8-max'], reasoningEffort: 'high' },
  ux: { patterns: ['opencode-go/deepseek-v4-flash-vision-exp', 'opencode-go/qwen3.8-flash'], reasoningEffort: 'high' },
  tester: { patterns: ['meta/muse-spark-1.3-contributor', 'opencode-go/deepseek-v4-pro', 'opencode-go/kimi-k2.7-code'], reasoningEffort: 'high' },
  developer: { patterns: ['meta/muse-spark-1.3-contributor', 'opencode-go/muse-spark-1.3-contributor', 'opencode-go/deepseek-v4-flash'], reasoningEffort: 'medium' },
  reviewer: { patterns: ['opencode-go/kimi-k3', 'opencode-go/qwen3.8-max', 'opencode-go/deepseek-v4-pro'], reasoningEffort: 'high' },
};

export function resolveDefault(agent: string, available: string[]): AgentChoice | undefined {
  const rule = DEFAULT_RULES[agent];
  if (!rule) return undefined;
  for (const pattern of rule.patterns) {
    const match = available.find((model) => model.includes(pattern));
    if (match) return { model: match, reasoningEffort: rule.reasoningEffort };
  }
  return undefined;
}

export function seedDefaults(existing: TeamConfig, available: string[]): TeamConfig {
  const config: TeamConfig = structuredClone(existing);
  for (const name of Object.keys(DEFAULT_RULES)) {
    if (!config[name]?.model) {
      const choice = resolveDefault(name, available);
      if (choice) config[name] = choice;
    }
  }
  return config;
}