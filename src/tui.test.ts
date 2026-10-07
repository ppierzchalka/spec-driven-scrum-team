import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@clack/prompts', () => ({
  select: vi.fn(), text: vi.fn(), autocomplete: vi.fn(),
  intro: vi.fn(), outro: vi.fn(), cancel: vi.fn(), note: vi.fn(),
}));

import { select, text, autocomplete } from '@clack/prompts';
import { selectHarness, runTui } from './tui.js';

beforeEach(() => { vi.clearAllMocks(); });

describe('selected harness TUI', () => {
  it('offers exactly the five supported harnesses', async () => {
    vi.mocked(select).mockResolvedValueOnce('codex');
    expect(await selectHarness()).toBe('codex');
    const options = vi.mocked(select).mock.calls[0][0].options;
    expect(options.map((option) => option.value)).toEqual(['opencode', 'claude-code', 'codex', 'antigravity', 'copilot']);
  });

  it('uses native manual model IDs without an OpenCode catalog for Codex', async () => {
    vi.mocked(select)
      .mockResolvedValueOnce('analyst')
      .mockResolvedValueOnce('model')
      .mockResolvedValueOnce('back')
      .mockResolvedValueOnce('__install__');
    vi.mocked(text).mockResolvedValueOnce('gpt-native-model');
    const existing = { lead: { model: 'existing-native-model' } };
    const result = await runTui({ existing, harness: 'codex' });
    expect(result.config.analyst).toEqual({ model: 'gpt-native-model' });
    expect(result.config.lead).toEqual(existing.lead);
    expect(existing).toEqual({ lead: { model: 'existing-native-model' } });
    expect(autocomplete).not.toHaveBeenCalled();
  });

  it('offers Antigravity supported tiers instead of free-text provider IDs', async () => {
    vi.mocked(select)
      .mockResolvedValueOnce('developer')
      .mockResolvedValueOnce('model')
      .mockResolvedValueOnce('flash')
      .mockResolvedValueOnce('back')
      .mockResolvedValueOnce('__install__');
    const result = await runTui({ existing: {}, harness: 'antigravity' });
    expect(result.config.developer).toEqual({ model: 'flash' });
    const tierOptions = vi.mocked(select).mock.calls[2][0].options;
    expect(tierOptions.map((option) => option.value)).toEqual(['inherit', 'flash', 'pro']);
    expect(text).not.toHaveBeenCalled();
  });
});
