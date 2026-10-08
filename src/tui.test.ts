import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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

it('toggles and retains the OpenCode persona setting independently of model choices', async () => {
  vi.mocked(select).mockResolvedValueOnce('__toady__').mockResolvedValueOnce('__install__');
  const result = await runTui({ existing: { lead: { model: 'vertex/gemini' } }, harness: 'opencode', toadyMode: false });
  expect(result.toadyMode).toBe(true);
  expect(result.config.lead?.model).toBe('vertex/gemini');
});

it.each(['claude-code', 'codex', 'copilot', 'antigravity'] as const)('offers Toady for %s', async (harness) => {
  vi.mocked(select).mockResolvedValueOnce('__toady__').mockResolvedValueOnce('__install__');
  const result = await runTui({ existing: {}, harness });
  expect(result.toadyMode).toBe(true);
  expect(vi.mocked(select).mock.calls[0][0].options.some((option) => option.value === '__toady__')).toBe(true);
});


it('imports additional rules independently of Toady and keeps model settings untouched', async () => {
  const root = mkdtempSync(join(tmpdir(), 'toady-tui-'));
  try {
    const path = join(root, 'rules.md');
    writeFileSync(path, 'Azure DevOps is read-only. Use custom commit format.');
    vi.mocked(select).mockResolvedValueOnce('__toady_rules__').mockResolvedValueOnce('load').mockResolvedValueOnce('__install__');
    vi.mocked(text).mockResolvedValueOnce(path);
    const result = await runTui({ existing: { lead: { model: 'vertex/gemini' } }, harness: 'codex', toadyMode: false, toadyRules: 'old' });
    expect(result.toadyRules).toBe('Azure DevOps is read-only. Use custom commit format.');
    expect(result.config.lead?.model).toBe('vertex/gemini');
    expect(result.toadyMode).toBe(false);
    const options = vi.mocked(select).mock.calls[0][0].options;
    const toadyIndex = options.findIndex(option => option.value === '__toady__');
    expect(options[toadyIndex + 1]).toMatchObject({ value: '__toady_rules__', label: 'Additional rules (loaded to persona)' });
  } finally { rmSync(root, { recursive: true, force: true }); }
});

it('clears only extra Toady rules', async () => {
  vi.mocked(select).mockResolvedValueOnce('__toady_rules__').mockResolvedValueOnce('clear').mockResolvedValueOnce('__install__');
  const result = await runTui({ existing: {}, harness: 'copilot', toadyMode: true, toadyRules: 'custom' });
  expect(result.toadyRules).toBe('');
  expect(result.toadyMode).toBe(true);
});


it('imports a browsed file without enabling Toady', async () => {
  const root = mkdtempSync(join(tmpdir(), 'browse-tui-'));
  try {
    const path = join(root, 'rules.md');
    writeFileSync(path, 'Use Conventional Commits.');
    vi.mocked(select).mockResolvedValueOnce('__toady_rules__').mockResolvedValueOnce('browse').mockResolvedValueOnce('__install__');
    vi.mocked(autocomplete).mockResolvedValueOnce('file:' + path);
    const result = await runTui({ existing: {}, harness: 'codex', toadyMode: false });
    expect(result.toadyRules).toBe('Use Conventional Commits.');
    expect(result.toadyMode).toBe(false);
    expect(text).not.toHaveBeenCalled();
  } finally { rmSync(root, { recursive: true, force: true }); }
});

it('keeps existing rules when leaving the browser without a selection', async () => {
  vi.mocked(select).mockResolvedValueOnce('__toady_rules__').mockResolvedValueOnce('browse').mockResolvedValueOnce('__install__');
  vi.mocked(autocomplete).mockResolvedValueOnce('__back__');
  const result = await runTui({ existing: {}, harness: 'codex', toadyRules: 'Keep this rule.' });
  expect(result.toadyRules).toBe('Keep this rule.');
});
