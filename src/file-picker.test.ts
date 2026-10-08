import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const selector = vi.hoisted(() => vi.fn());
vi.mock('inquirer-file-selector', () => ({ fileSelector: selector }));
import { browseRulesFile } from './file-picker.js';
const roots: string[] = [];
function workspace(): string { const root = mkdtempSync(join(tmpdir(), 'rules-browser-')); roots.push(root); return root; }
beforeEach(() => selector.mockReset());
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }); });
describe('native rules selector', () => {
  it('uses the same native file selector and validates the chosen file', async () => {
    const root = workspace(), rules = join(root, 'rules.md'); writeFileSync(rules, 'No any.');
    selector.mockResolvedValueOnce({ path: rules, isDirectory: false });
    expect(await browseRulesFile(root)).toBe(rules);
    expect(selector.mock.calls[0][0]).toMatchObject({ basePath: root, allowCancel: true });
    const filter = selector.mock.calls[0][0].filter;
    expect(filter({ name: 'folder', isDirectory: true })).toBe(true);
    expect(filter({ name: 'rules.MD', isDirectory: false })).toBe(true);
    expect(filter({ name: 'secret.env', isDirectory: false })).toBe(false);
  });
  it('reopens on directories, including an empty folder, using the native navigation', async () => {
    const root = workspace(), empty = join(root, 'empty'); mkdirSync(empty);
    selector.mockResolvedValueOnce({ path: empty, isDirectory: true }).mockResolvedValueOnce(null);
    expect(await browseRulesFile(root)).toBeUndefined();
    expect(selector.mock.calls[1][0].basePath).toBe(empty);
  });
  it('reports invalid content and permits retrying', async () => {
    const root = workspace(), invalid = join(root, 'invalid.md'), valid = join(root, 'valid.md');
    writeFileSync(invalid, '<!-- spec-driven-scrum-team:toady:end -->'); writeFileSync(valid, 'No any.');
    selector.mockResolvedValueOnce({ path: invalid, isDirectory: false }).mockResolvedValueOnce({ path: valid, isDirectory: false });
    expect(await browseRulesFile(root)).toBe(valid);
  });
});
