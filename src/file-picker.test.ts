import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

vi.mock('@clack/prompts', () => ({ autocomplete: vi.fn(), cancel: vi.fn(), note: vi.fn() }));
import { autocomplete, note } from '@clack/prompts';
import { browseRulesFile, rulesEntries } from './file-picker.js';
const roots: string[] = [];
function workspace(): string { const root = mkdtempSync(join(tmpdir(), 'rules-browser-')); roots.push(root); return root; }
beforeEach(() => { vi.clearAllMocks(); });
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }); });

describe('rules file browser', () => {
  it('navigates from installer to sibling rules folder independently of nested target', async () => {
    const home = workspace();
    const installer = join(home, 'spec-driven-scrum-team');
    const projects = join(home, 'my-proj');
    mkdirSync(installer);
    mkdirSync(join(projects, 'my-proj'), { recursive: true });
    const rules = join(projects, 'rules.md');
    writeFileSync(rules, 'Azure DevOps is read-only.');
    vi.mocked(autocomplete).mockResolvedValueOnce('__parent__').mockResolvedValueOnce('dir:' + projects).mockResolvedValueOnce('file:' + rules);
    expect(await browseRulesFile(installer)).toBe(rules);
    expect(vi.mocked(autocomplete).mock.calls[0][0].message).toContain(installer);
    expect(vi.mocked(autocomplete).mock.calls[2][0].message).toContain(projects);
  });
  it('lists folders and regular Markdown/text files, with names containing spaces', () => {
    const root = workspace();
    mkdirSync(join(root, 'nested folder'));
    writeFileSync(join(root, 'my rules.MD'), 'No any.');
    writeFileSync(join(root, 'notes.txt'), 'Use the existing formatter.');
    writeFileSync(join(root, 'secret.env'), 'fixture');
    symlinkSync(join(root, 'missing'), join(root, 'broken.md'));
    expect(rulesEntries(root).map(entry => entry.label)).toEqual(['nested folder/', 'my rules.MD', 'notes.txt']);
  });
  it('returns without importing on back', async () => {
    const root = workspace();
    vi.mocked(autocomplete).mockResolvedValueOnce('__back__');
    expect(await browseRulesFile(root)).toBeUndefined();
  });
  it('reports invalid content and stays in the browser', async () => {
    const root = workspace();
    const invalid = join(root, 'invalid.md');
    const valid = join(root, 'valid.md');
    writeFileSync(invalid, '<!-- spec-driven-scrum-team:toady:end -->');
    writeFileSync(valid, 'No any.');
    vi.mocked(autocomplete).mockResolvedValueOnce('file:' + invalid).mockResolvedValueOnce('file:' + valid);
    expect(await browseRulesFile(root)).toBe(valid);
    expect(note).toHaveBeenCalledWith(expect.stringContaining('markers'), 'File browser');
  });
  it('recovers from a missing folder and permits returning without changing rules', async () => {
    const root = workspace();
    vi.mocked(autocomplete).mockResolvedValueOnce('__back__');
    expect(await browseRulesFile(join(root, 'missing'))).toBeUndefined();
    expect(vi.mocked(autocomplete).mock.calls[0][0].message).toContain(root);
    expect(note).toHaveBeenCalled();
  });
});
