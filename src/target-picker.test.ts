import { afterEach, describe, expect, it, vi, beforeEach } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const selector = vi.hoisted(() => vi.fn());
vi.mock('inquirer-file-selector', () => ({ fileSelector: selector, ItemType: { Directory: 'directory' } }));
import { browseTargets, normalizeTargets } from './target-picker.js';
const roots: string[] = [];
function workspace(): string { const root = mkdtempSync(join(tmpdir(), 'target-picker-')); roots.push(root); return root; }
beforeEach(() => selector.mockReset());
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }); });
describe('native target multiselect', () => {
  it('uses the native multiselect and returns exact folders without adding children', async () => {
    const root = workspace(), a = join(root, 'a'), b = join(root, 'b'); mkdirSync(a); mkdirSync(b);
    selector.mockResolvedValueOnce([{ path: a }, { path: b }]);
    expect(await browseTargets(root)).toEqual([a, b]);
    expect(selector.mock.calls[0][0]).toMatchObject({ multiple: true, type: 'directory', basePath: root, allowCancel: true });
  });
  it('does not accept an empty multiselect', async () => {
    const root = workspace(); selector.mockResolvedValueOnce([]).mockResolvedValueOnce([{ path: root }]);
    expect(await browseTargets(root)).toEqual([root]); expect(selector).toHaveBeenCalledTimes(2);
  });
  it('deduplicates paths and rejects files, missing folders and symlink roots', () => {
    const root = workspace(); expect(normalizeTargets([root, join(root, '.')])).toEqual([root]);
    const file = join(root, 'file'); writeFileSync(file, 'fixture');
    expect(() => normalizeTargets([file])).toThrow(/directory/);
    expect(() => normalizeTargets([join(root, 'missing')])).toThrow();
    const link = join(root, 'link'); symlinkSync(root, link, 'dir');
    expect(() => normalizeTargets([link])).toThrow(/symlink/);
  });
});
