import type { AgentChoice, TeamConfig } from './types.js';

interface DefaultRule {
  models: string[];
  reasoningEffort: string;
}

const DEFAULT_RULES: Record<string, DefaultRule> = {
  analyst: { models: ['openai/gpt-6.1-sol', 'openai/gpt-6-sol', 'openai/gpt-5.6-terra'], reasoningEffort: 'medium' },
  // Sol/medium for planning and UX, Luna/xhigh for architecture; keep
  // implementation and verification on Muse/OpenCode with role-specific effort.
  lead: { models: ['openai/gpt-6.1-sol', 'openai/gpt-6-sol', 'openai/gpt-5.6-terra'], reasoningEffort: 'medium' },
  architect: { models: ['openai/gpt-6-luna', 'openai/gpt-5.6-luna'], reasoningEffort: 'xhigh' },
  security: { models: ['opencode-go/deepseek-v4-pro', 'opencode/deepseek-v4-pro', 'opencode-go/qwen3.8-max', 'opencode/qwen3.8-max'], reasoningEffort: 'high' },
  ux: { models: ['openai/gpt-6.1-sol', 'openai/gpt-6-sol'], reasoningEffort: 'medium' },
  tester: { models: ['opencode-go/muse-spark-1.3-contributor', 'opencode/muse-spark-1.3-contributor-free', 'opencode-go/kimi-k3', 'opencode/kimi-k3'], reasoningEffort: 'medium' },
  developer: { models: ['opencode-go/muse-spark-1.3-contributor', 'opencode/muse-spark-1.3-contributor-free', 'opencode-go/deepseek-v4-pro', 'opencode/deepseek-v4-pro'], reasoningEffort: 'medium' },
  reviewer: { models: ['opencode-go/deepseek-v4-flash', 'opencode/deepseek-v4-flash', 'opencode-go/deepseek-v4-pro', 'opencode/deepseek-v4-pro'], reasoningEffort: 'medium' },
};

export function resolveDefault(agent: string, available: string[]): AgentChoice | undefined {
  const rule = DEFAULT_RULES[agent];
  if (!rule) return undefined;
  const availableModels = new Set(available);
  for (const model of rule.models) {
    if (availableModels.has(model)) return { model, reasoningEffort: rule.reasoningEffort };
  }
  return undefined;
}

export function resetAgent(config: TeamConfig, name: string, available: string[]): AgentChoice | undefined {
  const choice = resolveDefault(name, available);
  if (choice) config[name] = choice;
  return choice;
}

export function resetAllToDefaults(config: TeamConfig, names: readonly string[], available: string[]): string[] {
  const reset: string[] = [];
  for (const name of names) {
    if (resetAgent(config, name, available)) reset.push(name);
  }
  return reset;
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

// Preserve explicit Analyst settings; inherit legacy Planner choices only once.
export function migratePlannerConfig(existing: TeamConfig): TeamConfig {
  const config = structuredClone(existing);
  if (!config.analyst && config.planner) config.analyst = structuredClone(config.planner);
  return config;
}
