import { describe, it, expect } from 'vitest';
import { resolveDefault, seedDefaults, resetAgent, resetAllToDefaults } from './defaults.js';
import type { TeamConfig } from './types.js';

const AVAILABLE = [
  'openai/gpt-6.1-sol',
  'openai/gpt-6-sol',
  'openai/gpt-6-luna',
  'openai/gpt-5.6-luna',
  'openai/gpt-5.6-terra',
  'openai/gpt-6-astra',
  'meta/muse-spark-1.3-contributor',
  'opencode-go/deepseek-v4-pro',
  'opencode-go/deepseek-v4-flash',
  'opencode-go/deepseek-v4-flash-vision-exp',
  'opencode-go/kimi-k3',
  'opencode-go/kimi-k2.7-code',
  'opencode-go/muse-spark-1.3-contributor',
  'opencode-go/qwen3.8-flash',
  'opencode-go/qwen3.8-max',
];

describe('resolveDefault', () => {
  it('allocates planning/design to OpenAI and implementation/checks to Muse and DeepSeek at the agreed effort', () => {
    expect(resolveDefault('lead', AVAILABLE)).toEqual({ model: 'openai/gpt-6.1-sol', reasoningEffort: 'medium' });
    expect(resolveDefault('architect', AVAILABLE)).toEqual({ model: 'openai/gpt-6-luna', reasoningEffort: 'max' });
    expect(resolveDefault('security', AVAILABLE)).toEqual({ model: 'opencode-go/deepseek-v4-pro', reasoningEffort: 'high' });
    expect(resolveDefault('ux', AVAILABLE)).toEqual({ model: 'openai/gpt-6.1-sol', reasoningEffort: 'medium' });
    expect(resolveDefault('tester', AVAILABLE)).toEqual({ model: 'meta/muse-spark-1.3-contributor', reasoningEffort: 'medium' });
    expect(resolveDefault('developer', AVAILABLE)).toEqual({ model: 'meta/muse-spark-1.3-contributor', reasoningEffort: 'high' });
    expect(resolveDefault('reviewer', AVAILABLE)).toEqual({ model: 'opencode-go/deepseek-v4-flash', reasoningEffort: 'high' });
  });

  it('falls back to explicitly listed models when preferred providers are unavailable', () => {
    const noMeta = AVAILABLE.filter((m) => !m.startsWith('meta/'));
    expect(resolveDefault('developer', noMeta)).toEqual({ model: 'opencode-go/muse-spark-1.3-contributor', reasoningEffort: 'high' });
    const noGo = AVAILABLE.filter((m) => !m.startsWith('opencode-go/'));
    expect(resolveDefault('tester', noGo)).toEqual({ model: 'meta/muse-spark-1.3-contributor', reasoningEffort: 'medium' });
    expect(resolveDefault('tester', noMeta)?.model).toBe('opencode-go/muse-spark-1.3-contributor');
    expect(resolveDefault('architect', AVAILABLE.filter((m) => m !== 'openai/gpt-6-luna'))).toEqual({ model: 'openai/gpt-5.6-luna', reasoningEffort: 'max' });
    expect(resolveDefault('reviewer', AVAILABLE.filter((m) => !m.includes('deepseek-v4-flash')))).toEqual({ model: 'opencode-go/deepseek-v4-pro', reasoningEffort: 'high' });
    expect(resolveDefault('lead', AVAILABLE.filter((m) => !m.endsWith('-sol')))?.model).toBe('openai/gpt-5.6-terra');
  });

  it('does not automatically select OpenAI for implementation, tests, security, or review', () => {
    const openaiOnly = AVAILABLE.filter((model) => model.startsWith('openai/'));
    for (const name of ['security', 'tester', 'developer', 'reviewer']) {
      expect(resolveDefault(name, openaiOnly)).toBeUndefined();
    }
  });

  it('returns undefined when nothing matches', () => {
    expect(resolveDefault('developer', [])).toBeUndefined();
    expect(resolveDefault('reviewer', ['opencode-go/qwen3.8-flash'])).toBeUndefined();
  });

  it('never picks a premium model by accident of prefix', () => {
    expect(resolveDefault('architect', ['opencode-go/gpt-5.6-luna'])).toBeUndefined();
    expect(resolveDefault('architect', ['openai/gpt-6.1-sol-fast'])).toBeUndefined();
    expect(resolveDefault('developer', ['meta/muse-spark-1.3-contributor-premium'])).toBeUndefined();
  });

  it('never defaults any role to Astra', () => {
    for (const name of ['lead', 'architect', 'security', 'ux', 'tester', 'developer', 'reviewer']) {
      expect(resolveDefault(name, ['openai/gpt-6-astra', 'opencode/gpt-6-astra'])).toBeUndefined();
    }
  });

  it('does not silently downgrade UX to a cheap or execution-oriented model', () => {
    const noSol = AVAILABLE.filter((m) => !m.endsWith('-sol'));
    expect(resolveDefault('ux', noSol)).toBeUndefined();
    expect(resolveDefault('ux', ['openai/gpt-6-sol'])?.model).toBe('openai/gpt-6-sol');
  });

  it('respects preference order regardless of catalog ordering', () => {
    expect(resolveDefault('ux', [...AVAILABLE].reverse())?.model).toBe('openai/gpt-6.1-sol');
  });

  it('uses Zen equivalents when Go models are unavailable', () => {
    expect(resolveDefault('tester', ['opencode/kimi-k3'])?.model).toBe('opencode/kimi-k3');
    expect(resolveDefault('security', ['opencode/deepseek-v4-pro'])?.model).toBe('opencode/deepseek-v4-pro');
    expect(resolveDefault('reviewer', ['opencode/deepseek-v4-flash', 'opencode-go/deepseek-v4-pro'])?.model).toBe('opencode/deepseek-v4-flash');
  });

  it('prefers plain Flash to Pro and Flash vision variants for review regardless of catalog order', () => {
    expect(resolveDefault('reviewer', [...AVAILABLE].reverse())?.model).toBe('opencode-go/deepseek-v4-flash');
    expect(resolveDefault('reviewer', ['opencode-go/deepseek-v4-flash-vision-exp'])).toBeUndefined();
  });
});

describe('seedDefaults', () => {
  it('fills every agent with a default when there is no saved config', () => {
    const seeded = seedDefaults({}, AVAILABLE);
    for (const name of ['lead', 'architect', 'security', 'ux', 'tester', 'developer', 'reviewer']) {
      expect(seeded[name]?.model).toBeTruthy();
    }
    expect(seeded.lead).toEqual({ model: 'openai/gpt-6.1-sol', reasoningEffort: 'medium' });
  });

  it('keeps persisted choices and only fills in agents that are unset', () => {
    const seeded = seedDefaults({ lead: { model: 'opencode-go/gpt-5.6-luna', reasoningEffort: 'high' } }, AVAILABLE);
    expect(seeded.lead).toEqual({ model: 'opencode-go/gpt-5.6-luna', reasoningEffort: 'high' });
    expect(seeded.tester?.model).toBe('meta/muse-spark-1.3-contributor');
  });

  it('preserves explicitly selected Astra and cheap UX models until the user resets them', () => {
    const existing: TeamConfig = {
      architect: { model: 'openai/gpt-6-astra', reasoningEffort: 'xhigh' },
      ux: { model: 'opencode-go/qwen3.8-flash', reasoningEffort: 'high' },
    };
    const seeded = seedDefaults(existing, AVAILABLE);
    expect(seeded.architect).toEqual(existing.architect);
    expect(seeded.ux).toEqual(existing.ux);
  });

  it('does not mutate the existing config', () => {
    const existing = { lead: { model: 'x' } as const };
    seedDefaults(existing, AVAILABLE);
    expect(existing).toEqual({ lead: { model: 'x' } });
  });
});

describe('resetAgent / resetAllToDefaults', () => {
  it('restores a single agent to its default', () => {
    const config: TeamConfig = { lead: { model: 'opencode-go/gpt-5.6-luna', reasoningEffort: 'high' } };
    const choice = resetAgent(config, 'lead', AVAILABLE);
    expect(choice).toEqual({ model: 'openai/gpt-6.1-sol', reasoningEffort: 'medium' });
    expect(config.lead).toEqual(choice);
  });

  it('leaves the agent alone when no default is available', () => {
    const config: TeamConfig = { lead: { model: 'custom/x' } };
    expect(resetAgent(config, 'lead', [])).toBeUndefined();
    expect(config.lead).toEqual({ model: 'custom/x' });
  });

  it('resets every agent and returns the names', () => {
    const config: TeamConfig = { lead: { model: 'custom/x' }, tester: {} };
    const names = resetAllToDefaults(config, ['lead', 'tester', 'ux'], AVAILABLE);
    expect(names).toEqual(['lead', 'tester', 'ux']);
    expect(config.lead?.model).toBe('openai/gpt-6.1-sol');
    expect(config.tester?.model).toBe('meta/muse-spark-1.3-contributor');
  });
});
