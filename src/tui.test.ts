import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./prompts.js', () => ({
  select: vi.fn(), checkbox: vi.fn(), text: vi.fn(), autocomplete: vi.fn(),
  intro: vi.fn(), outro: vi.fn(), cancel: vi.fn(), note: vi.fn(),
}));

vi.mock('./file-picker.js', () => ({ browseRulesFile: vi.fn() }));
import { browseRulesFile } from './file-picker.js';
import { select, checkbox, text, autocomplete } from './prompts.js';
import { selectHarness, runTui } from './tui.js';

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(checkbox).mockImplementation(async ({ options }) => options.filter(option => option.checked).map(option => option.value));
});

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
      .mockResolvedValueOnce('__next__').mockResolvedValueOnce('__next__').mockResolvedValueOnce('__install__');
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
      .mockResolvedValueOnce('__next__').mockResolvedValueOnce('__next__').mockResolvedValueOnce('__install__');
    const result = await runTui({ existing: {}, harness: 'antigravity' });
    expect(result.config.developer).toEqual({ model: 'flash' });
    const tierOptions = vi.mocked(select).mock.calls[2][0].options;
    expect(tierOptions.map((option) => option.value)).toEqual(['inherit', 'flash', 'pro']);
    expect(text).not.toHaveBeenCalled();
  });
});

it('toggles and retains the OpenCode persona setting independently of model choices', async () => {
  vi.mocked(checkbox).mockResolvedValueOnce([]).mockResolvedValueOnce(['toady']);
  vi.mocked(select).mockResolvedValueOnce('__next__').mockResolvedValueOnce('__toady__').mockResolvedValueOnce('__next__').mockResolvedValueOnce('__install__');
  const result = await runTui({ existing: { lead: { model: 'vertex/gemini' } }, harness: 'opencode', toadyMode: false });
  expect(result.toadyMode).toBe(true);
  expect(result.config.lead?.model).toBe('vertex/gemini');
});

it.each(['claude-code', 'codex', 'copilot', 'antigravity'] as const)('offers Toady for %s', async (harness) => {
  vi.mocked(checkbox).mockResolvedValueOnce([]).mockResolvedValueOnce(['toady']);
  vi.mocked(select).mockResolvedValueOnce('__next__').mockResolvedValueOnce('__toady__').mockResolvedValueOnce('__next__').mockResolvedValueOnce('__install__');
  const result = await runTui({ existing: {}, harness });
  expect(result.toadyMode).toBe(true);
  expect(vi.mocked(select).mock.calls[1][0].options.some((option) => option.value === '__toady__')).toBe(true);
});


it('imports additional rules independently of Toady and keeps model settings untouched', async () => {
  const root = mkdtempSync(join(tmpdir(), 'toady-tui-'));
  try {
    const path = join(root, 'rules.md');
    writeFileSync(path, 'Azure DevOps is read-only. Use custom commit format.');
    vi.mocked(select).mockResolvedValueOnce('__next__').mockResolvedValueOnce('__toady_rules__').mockResolvedValueOnce('load').mockResolvedValueOnce('__next__').mockResolvedValueOnce('__install__');
    vi.mocked(text).mockResolvedValueOnce(path);
    const result = await runTui({ existing: { lead: { model: 'vertex/gemini' } }, harness: 'codex', toadyMode: false, toadyRules: 'old' });
    expect(result.toadyRules).toBe('Azure DevOps is read-only. Use custom commit format.');
    expect(result.config.lead?.model).toBe('vertex/gemini');
    expect(result.toadyMode).toBe(false);
    const options = vi.mocked(select).mock.calls[1][0].options;
    const toadyIndex = options.findIndex(option => option.value === '__toady__');
    expect(options[toadyIndex + 1]).toMatchObject({ value: '__toady_rules__', label: 'Additional rules (loaded to persona)' });
  } finally { rmSync(root, { recursive: true, force: true }); }
});

it('clears only extra Toady rules', async () => {
  vi.mocked(select).mockResolvedValueOnce('__next__').mockResolvedValueOnce('__toady_rules__').mockResolvedValueOnce('clear').mockResolvedValueOnce('__next__').mockResolvedValueOnce('__install__');
  const result = await runTui({ existing: {}, harness: 'copilot', toadyMode: true, toadyRules: 'custom' });
  expect(result.toadyRules).toBe('');
  expect(result.toadyMode).toBe(true);
});


it('imports a browsed file without enabling Toady', async () => {
  const root = mkdtempSync(join(tmpdir(), 'browse-tui-'));
  try {
    const path = join(root, 'rules.md');
    writeFileSync(path, 'Use Conventional Commits.');
    vi.mocked(select).mockResolvedValueOnce('__next__').mockResolvedValueOnce('__toady_rules__').mockResolvedValueOnce('browse').mockResolvedValueOnce('__next__').mockResolvedValueOnce('__install__');
    vi.mocked(browseRulesFile).mockResolvedValueOnce(path);
    const result = await runTui({ existing: {}, harness: 'codex', toadyMode: false });
    expect(result.toadyRules).toBe('Use Conventional Commits.');
    expect(result.toadyMode).toBe(false);
    expect(text).not.toHaveBeenCalled();
  } finally { rmSync(root, { recursive: true, force: true }); }
});

it('keeps existing rules when leaving the browser without a selection', async () => {
  vi.mocked(select).mockResolvedValueOnce('__next__').mockResolvedValueOnce('__toady_rules__').mockResolvedValueOnce('browse').mockResolvedValueOnce('__next__').mockResolvedValueOnce('__install__');
  vi.mocked(browseRulesFile).mockResolvedValueOnce(undefined);
  const result = await runTui({ existing: {}, harness: 'codex', toadyRules: 'Keep this rule.' });
  expect(result.toadyRules).toBe('Keep this rule.');
});


it('separates configuration stages and retains edits when navigating back', async () => {
  vi.mocked(checkbox).mockResolvedValueOnce([]).mockResolvedValueOnce(['toady']);
  vi.mocked(select)
    .mockResolvedValueOnce('developer')
    .mockResolvedValueOnce('model')
    .mockResolvedValueOnce('overwrite')
    .mockResolvedValueOnce('back')
    .mockResolvedValueOnce('__next__')
    .mockResolvedValueOnce('__toady__')
    .mockResolvedValueOnce('__back__')
    .mockResolvedValueOnce('__next__')
    .mockResolvedValueOnce('__next__')
    .mockResolvedValueOnce('__back__')
    .mockResolvedValueOnce('__next__')
    .mockResolvedValueOnce('__install__');
  vi.mocked(text).mockResolvedValueOnce('native-model');
  const result = await runTui({ existing: {}, harness: 'codex', toadyRules: 'Use strict types.', targets: ['/repo-a', '/repo-b'] });
  expect(result).toMatchObject({
    config: { developer: { model: 'native-model' } },
    overwrite: { developer: false },
    toadyMode: true,
    toadyRules: 'Use strict types.',
  });
  const menus = vi.mocked(select).mock.calls.map(([menu]) => menu);
  const agents = menus.filter(menu => menu.message === 'Step 2 of 4 — Agents and models');
  const persona = menus.filter(menu => menu.message === 'Step 3 of 4 — Personal instructions');
  const install = menus.filter(menu => menu.message === 'Review and install');
  expect(agents).toHaveLength(3);
  expect(persona).toHaveLength(4);
  expect(install).toHaveLength(2);
  for (const menu of agents) {
    expect(menu.options.some(option => option.value === 'developer')).toBe(true);
    expect(menu.options.some(option => ['__toady__', '__toady_rules__', '__install__'].includes(String(option.value)))).toBe(false);
  }
  for (const menu of persona) {
    expect(menu.options.some(option => option.value === '__toady__')).toBe(true);
    expect(menu.options.some(option => ['developer', '__install__'].includes(String(option.value)))).toBe(false);
  }
});


it('starts personal instructions with a native checkbox and preserves an enabled setting', async () => {
  vi.mocked(select).mockResolvedValueOnce('__next__').mockResolvedValueOnce('__next__').mockResolvedValueOnce('__install__');
  const result = await runTui({ existing: {}, harness: 'codex', toadyMode: true });
  expect(result.toadyMode).toBe(true);
  expect(checkbox).toHaveBeenCalledWith({
    message: 'Toady mode — Space toggles, Enter confirms',
    options: [expect.objectContaining({ value: 'toady', checked: true })],
  });
});

it('allows unchecking Toady while keeping additional rules', async () => {
  vi.mocked(checkbox).mockResolvedValueOnce([]);
  vi.mocked(select).mockResolvedValueOnce('__next__').mockResolvedValueOnce('__next__').mockResolvedValueOnce('__install__');
  const result = await runTui({ existing: {}, harness: 'codex', toadyMode: true, toadyRules: 'Keep strict types.' });
  expect(result.toadyMode).toBe(false);
  expect(result.toadyRules).toBe('Keep strict types.');
});
