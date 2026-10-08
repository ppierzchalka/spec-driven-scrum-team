import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
vi.mock('@clack/prompts', () => ({ autocomplete: vi.fn(), cancel: vi.fn(), note: vi.fn() }));
import { autocomplete } from '@clack/prompts';
import { browseTargets, normalizeTargets } from './target-picker.js';
const roots: string[] = [];
function workspace(): string { const root = mkdtempSync(join(tmpdir(), 'target-picker-')); roots.push(root); return root; }
beforeEach(() => vi.clearAllMocks());
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }); });
describe('target selection', () => {
  it('adds multiple nested project folders and shows the selection count', async () => {
    const home = workspace();
    const installer = join(home, 'team');
    const a = join(home, 'my-proj/my-proj');
    const b = join(home, 'my-proj/my-proj-2');
    for (const path of [installer, a, b]) mkdirSync(path, { recursive: true });
    vi.mocked(autocomplete).mockResolvedValueOnce('__parent__')
      .mockResolvedValueOnce('dir:' + join(home, 'my-proj')).mockResolvedValueOnce('dir:' + a)
      .mockResolvedValueOnce('__toggle__').mockResolvedValueOnce('__parent__').mockResolvedValueOnce('dir:' + b)
      .mockResolvedValueOnce('__toggle__').mockResolvedValueOnce('__done__');
    expect(await browseTargets(installer)).toEqual([a, b]);
    expect(vi.mocked(autocomplete).mock.calls[7][0].message).toContain('(2 selected)');
  });
  it('can remove a selection and does not select child folders implicitly', async () => {
    const root = workspace();
    const child = join(root, 'child'); mkdirSync(child);
    vi.mocked(autocomplete).mockResolvedValueOnce('__toggle__').mockResolvedValueOnce('dir:' + child)
      .mockResolvedValueOnce('__toggle__').mockResolvedValueOnce('remove:' + root).mockResolvedValueOnce('__done__');
    expect(await browseTargets(root)).toEqual([child]);
    const first = vi.mocked(autocomplete).mock.calls[0][0].options;
    if (!Array.isArray(first)) throw new Error('Expected static browser options');
    expect(first.some(option => option.value === '__done__')).toBe(false);
  });
  it('deduplicates paths and rejects files, missing folders and symlink roots', () => {
    const root = workspace();
    expect(normalizeTargets([root, join(root, '.')])).toEqual([root]);
    const file = join(root, 'file'); writeFileSync(file, 'fixture');
    expect(() => normalizeTargets([file])).toThrow(/directory/);
    expect(() => normalizeTargets([join(root, 'missing')])).toThrow();
    const link = join(root, 'link'); symlinkSync(root, link, 'dir');
    expect(() => normalizeTargets([link])).toThrow(/symlink/);
  });
});
