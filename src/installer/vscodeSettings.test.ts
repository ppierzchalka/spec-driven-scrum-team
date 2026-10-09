import { describe, it, expect, afterEach } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parse as parseJsonc } from 'jsonc-parser';
import {
  VSCODE_QUICK_OPEN_SKIP,
  applyVscodeSettings,
  planVscodeSettings,
  preflightVscodeSettings,
  vscodeSettingsPath,
} from './vscodeSettings.js';
import { managedGitignoreEntries } from './gitignore.js';
import { HARNESS_NAMES } from './harness.js';

const roots: string[] = [];
function workspace(): string {
  const root = mkdtempSync(join(tmpdir(), 'vscode-settings-'));
  roots.push(root);
  return root;
}
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function read(target: string): string {
  return readFileSync(vscodeSettingsPath(target), 'utf8');
}

describe('VS Code Quick Open pass-through', () => {
  it('creates .vscode/settings.json with the exact negative entry when absent', () => {
    const target = workspace();
    expect(existsSync(join(target, '.vscode'))).toBe(false);
    expect(applyVscodeSettings(target)).toMatchObject({ status: 'wrote' });
    const parsed = parseJsonc(read(target)) as Record<string, unknown>;
    expect(parsed['terminal.integrated.commandsToSkipShell']).toEqual([VSCODE_QUICK_OPEN_SKIP]);
    expect(VSCODE_QUICK_OPEN_SKIP).toBe('-workbench.action.quickOpen');
  });

  it('creates a settings object when only the directory exists', () => {
    const target = workspace();
    mkdirSync(join(target, '.vscode'), { recursive: true });
    expect(applyVscodeSettings(target).status).toBe('wrote');
    expect(parseJsonc(read(target))['terminal.integrated.commandsToSkipShell']).toEqual([VSCODE_QUICK_OPEN_SKIP]);
  });

  it('treats an empty file as an absent object', () => {
    const target = workspace();
    mkdirSync(join(target, '.vscode'), { recursive: true });
    writeFileSync(vscodeSettingsPath(target), '');
    expect(applyVscodeSettings(target).status).toBe('wrote');
    expect(parseJsonc(read(target))['terminal.integrated.commandsToSkipShell']).toEqual([VSCODE_QUICK_OPEN_SKIP]);
  });

  it('appends to a populated array while preserving comments, commas and unrelated settings', () => {
    const target = workspace();
    mkdirSync(join(target, '.vscode'), { recursive: true });
    const source = '// Company editor policy\n{\n  "editor.fontSize": 14,\n  "terminal.integrated.commandsToSkipShell": [\n    "workbench.action.terminal.focus",\n  ],\n}\n';
    writeFileSync(vscodeSettingsPath(target), source);
    expect(applyVscodeSettings(target).status).toBe('wrote');
    const body = read(target);
    expect(body).toContain('// Company editor policy');
    expect(body).toContain('"editor.fontSize": 14');
    expect(body).toContain('"workbench.action.terminal.focus"');
    expect(body).toContain(VSCODE_QUICK_OPEN_SKIP);
    expect(parseJsonc(body)['terminal.integrated.commandsToSkipShell']).toEqual([
      'workbench.action.terminal.focus',
      VSCODE_QUICK_OPEN_SKIP,
    ]);
  });

  it('adds the key when other settings exist', () => {
    const target = workspace();
    mkdirSync(join(target, '.vscode'), { recursive: true });
    writeFileSync(vscodeSettingsPath(target), '{"editor.wordWrap":"on"}\n');
    applyVscodeSettings(target);
    const parsed = parseJsonc(read(target)) as Record<string, unknown>;
    expect(parsed['editor.wordWrap']).toBe('on');
    expect(parsed['terminal.integrated.commandsToSkipShell']).toEqual([VSCODE_QUICK_OPEN_SKIP]);
  });

  it('leaves a configured file byte-identical on reinstall (kept, not wrote)', () => {
    const target = workspace();
    mkdirSync(join(target, '.vscode'), { recursive: true });
    const source = '{\n  "terminal.integrated.commandsToSkipShell": [\n    "workbench.action.terminal.focus",\n    "-workbench.action.quickOpen"\n  ]\n}\n';
    writeFileSync(vscodeSettingsPath(target), source);
    expect(planVscodeSettings(target)).toEqual({ path: vscodeSettingsPath(target), body: null });
    expect(applyVscodeSettings(target)).toMatchObject({ status: 'kept' });
    expect(read(target)).toBe(source);
    // Second apply never duplicates the entry.
    expect(applyVscodeSettings(target).status).toBe('kept');
    expect(parseJsonc(read(target))['terminal.integrated.commandsToSkipShell']).toHaveLength(2);
  });

  it('rejects malformed JSONC before any writes', () => {
    const target = workspace();
    mkdirSync(join(target, '.vscode'), { recursive: true });
    writeFileSync(vscodeSettingsPath(target), '{invalid');
    expect(() => preflightVscodeSettings(target)).toThrow(/Invalid VS Code settings JSONC/);
    expect(() => applyVscodeSettings(target)).toThrow(/Invalid VS Code settings JSONC/);
    expect(read(target)).toBe('{invalid');
  });

  it('rejects a non-object root', () => {
    const target = workspace();
    mkdirSync(join(target, '.vscode'), { recursive: true });
    for (const bad of ['[]', 'null', '"settings"']) {
      writeFileSync(vscodeSettingsPath(target), bad);
      expect(() => preflightVscodeSettings(target)).toThrow(/root must be a JSON object/);
    }
  });

  it('rejects an existing non-array or non-string-array value without repair', () => {
    const target = workspace();
    mkdirSync(join(target, '.vscode'), { recursive: true });
    for (const bad of ['{"terminal.integrated.commandsToSkipShell":"x"}', '{"terminal.integrated.commandsToSkipShell":[42]}', '{"terminal.integrated.commandsToSkipShell":{}}']) {
      writeFileSync(vscodeSettingsPath(target), bad);
      expect(() => preflightVscodeSettings(target)).toThrow(/non-string-array/);
      expect(read(target)).toBe(bad);
    }
  });

  it('rejects symlinked .vscode paths and non-file destinations', () => {
    const target = workspace();
    const outside = workspace();
    writeFileSync(join(outside, 'settings.json'), '{}');
    symlinkSync(join(outside, 'settings.json'), join(target, 'link-settings.json'));
    symlinkSync(outside, join(target, '.vscode'));
    expect(() => preflightVscodeSettings(target)).toThrow(/symlink/i);
    // Nothing is written through the link: the outside file is untouched.
    expect(readFileSync(join(outside, 'settings.json'), 'utf8')).toBe('{}');
    const target2 = workspace();
    mkdirSync(join(target2, '.vscode'), { recursive: true });
    mkdirSync(vscodeSettingsPath(target2));
    expect(() => preflightVscodeSettings(target2)).toThrow(/regular file/);
  });

  it('rejects a symlinked target root before any writes', () => {
    const target = workspace();
    const outside = workspace();
    symlinkSync(outside, join(target, 'linked'), 'dir');
    expect(() => preflightVscodeSettings(join(target, 'linked'))).toThrow(/symlink/i);
    expect(existsSync(join(outside, '.vscode'))).toBe(false);
  });

  it('keeps .vscode out of the managed gitignore block for every harness', () => {
    for (const harness of HARNESS_NAMES) {
      const entries = managedGitignoreEntries(harness);
      expect(entries.join('\n')).not.toMatch(/\.vscode/);
    }
  });
});
