import { describe, it, expect } from 'vitest';
import { resolveDefault, seedDefaults } from './defaults.js';

const AVAILABLE = [
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
  it('picks the first available pattern per role', () => {
    expect(resolveDefault('lead', AVAILABLE)).toEqual({ model: 'opencode-go/kimi-k3', reasoningEffort: 'medium' });
    expect(resolveDefault('architect', AVAILABLE)).toEqual({ model: 'opencode-go/deepseek-v4-pro', reasoningEffort: 'high' });
    expect(resolveDefault('security', AVAILABLE)).toEqual({ model: 'opencode-go/deepseek-v4-pro', reasoningEffort: 'high' });
    expect(resolveDefault('ux', AVAILABLE)).toEqual({ model: 'opencode-go/deepseek-v4-flash-vision-exp', reasoningEffort: 'high' });
    expect(resolveDefault('tester', AVAILABLE)).toEqual({ model: 'meta/muse-spark-1.3-contributor', reasoningEffort: 'high' });
    expect(resolveDefault('developer', AVAILABLE)).toEqual({ model: 'meta/muse-spark-1.3-contributor', reasoningEffort: 'medium' });
    expect(resolveDefault('reviewer', AVAILABLE)).toEqual({ model: 'opencode-go/kimi-k3', reasoningEffort: 'high' });
  });

  it('falls back to the next pattern when the preferred model is unavailable', () => {
    const noMeta = AVAILABLE.filter((m) => !m.startsWith('meta/'));
    expect(resolveDefault('developer', noMeta)).toEqual({ model: 'opencode-go/muse-spark-1.3-contributor', reasoningEffort: 'medium' });
    expect(resolveDefault('tester', noMeta)).toEqual({ model: 'opencode-go/deepseek-v4-pro', reasoningEffort: 'high' });
  });

  it('returns undefined when nothing matches', () => {
    expect(resolveDefault('developer', [])).toBeUndefined();
    expect(resolveDefault('reviewer', ['opencode-go/qwen3.8-flash'])).toBeUndefined();
  });

  it('never picks a premium model by accident of prefix', () => {
    expect(resolveDefault('architect', ['opencode-go/gpt-5.6-luna'])).toBeUndefined();
  });
});

describe('seedDefaults', () => {
  it('fills every agent with a default when there is no saved config', () => {
    const seeded = seedDefaults({}, AVAILABLE);
    for (const name of ['lead', 'architect', 'security', 'ux', 'tester', 'developer', 'reviewer']) {
      expect(seeded[name]?.model).toBeTruthy();
    }
    expect(seeded.lead).toEqual({ model: 'opencode-go/kimi-k3', reasoningEffort: 'medium' });
  });

  it('keeps persisted choices and only fills in agents that are unset', () => {
    const seeded = seedDefaults({ lead: { model: 'opencode-go/gpt-5.6-luna', reasoningEffort: 'high' } }, AVAILABLE);
    expect(seeded.lead).toEqual({ model: 'opencode-go/gpt-5.6-luna', reasoningEffort: 'high' });
    expect(seeded.tester?.model).toBe('meta/muse-spark-1.3-contributor');
  });

  it('does not mutate the existing config', () => {
    const existing = { lead: { model: 'x' } as const };
    seedDefaults(existing, AVAILABLE);
    expect(existing).toEqual({ lead: { model: 'x' } });
  });
});