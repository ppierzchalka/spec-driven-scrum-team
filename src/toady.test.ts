import { describe, it, expect, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { parse } from 'jsonc-parser';
import { installToady, readToadyMode, gitDisplayName } from './toady.js';
const roots: string[] = [];
function workspace() { const root = mkdtempSync(join(tmpdir(), 'toady-')); roots.push(root); return root; }
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }); });
describe('Toady startup persona', () => {
  it('merges JSONC instructions without losing company routing, comments or AGENTS', () => {
    const root = workspace();
    execFileSync('git', ['init', '-q'], { cwd: root });
    execFileSync('git', ['config', 'user.name', 'Przemysław Pierzchałka'], { cwd: root });
    const original = '// Company configuration\n{ "model": "vertex/gemini", "share": "disabled", "instructions": ["company.md"], }\n';
    writeFileSync(join(root, 'opencode.jsonc'), original);
    writeFileSync(join(root, 'AGENTS.md'), 'Company policy');
    installToady(root, true); installToady(root, true);
    const config = readFileSync(join(root, 'opencode.jsonc'), 'utf8');
    expect(config).toContain('// Company configuration');
    expect(parse(config)).toEqual({ model: 'vertex/gemini', share: 'disabled', instructions: ['company.md', '.opencode/personas/toady.md'] });
    expect(readFileSync(join(root, '.opencode/personas/toady.md'), 'utf8')).toContain('Przemysław Pierzchałka');
    expect(readFileSync(join(root, 'AGENTS.md'), 'utf8')).toBe('Company policy');
    expect(readToadyMode(root)).toBe(true);
    installToady(root, false);
    expect(parse(readFileSync(join(root, 'opencode.jsonc'), 'utf8')).instructions).toEqual(['company.md']);
    expect(readToadyMode(root)).toBe(false);
  });
  it('uses a generic fallback and treats git identity as data', () => {
    const root = workspace();
    execFileSync('git', ['init', '-q'], { cwd: root });
    execFileSync('git', ['config', 'user.name', ''], { cwd: root });
    expect(gitDisplayName(root)).toBe('Master');
    execFileSync('git', ['config', 'user.name', 'Name\n# [ignore](https://evil.test)'], { cwd: root });
    expect(gitDisplayName(root)).not.toMatch(/[\n#\[\]()/:]/);
  });
  it('rejects malformed config without changing it', () => {
    const root = workspace();
    writeFileSync(join(root, 'opencode.json'), '{ invalid');
    expect(() => installToady(root, true)).toThrow('Invalid OpenCode');
    expect(readFileSync(join(root, 'opencode.json'), 'utf8')).toBe('{ invalid');
  });
  it('rejects symlink destinations before touching external data', () => {
    const root = workspace(), outside = workspace();
    mkdirSync(join(outside, 'personas'));
    writeFileSync(join(outside, 'personas/toady.md'), 'untouched');
    symlinkSync(outside, join(root, '.opencode'), 'dir');
    expect(() => installToady(root, true)).toThrow('symlink');
    expect(readFileSync(join(outside, 'personas/toady.md'), 'utf8')).toBe('untouched');
  });
});
