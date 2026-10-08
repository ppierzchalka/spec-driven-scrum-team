import { describe, it, expect, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { parse } from 'jsonc-parser';
import { installToady, readToadyMode, readToadySettings, persona, loadToadyRulesFile, gitDisplayName } from './toady.js';
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

describe('native harness persona adapters', () => {
  const layouts = [
    ['claude-code', 'CLAUDE.md'], ['codex', 'AGENTS.md'],
    ['copilot', '.github/copilot-instructions.md'], ['antigravity', '.agents/rules/toady.md'],
  ] as const;
  it.each(layouts)('installs and disables %s without replacing unrelated instructions', (harness, destination) => {
    const root = workspace(), path = join(root, destination);
    mkdirSync(join(path, '..'), { recursive: true });
    const existing = harness === 'antigravity' ? '' : 'Existing company policy\n';
    if (existing) writeFileSync(path, existing);
    installToady(root, true, harness); installToady(root, true, harness);
    const active = readFileSync(path, 'utf8');
    expect(active.split('spec-driven-scrum-team:toady:start')).toHaveLength(2);
    expect(active).toContain('third person');
    if (harness === 'antigravity') expect(active).toMatch(/^---\ntrigger: always_on/);
    else expect(active.startsWith(existing)).toBe(true);
    expect(readToadyMode(root, harness)).toBe(true);
    installToady(root, false, harness);
    const disabled = readFileSync(path, 'utf8');
    expect(disabled).not.toContain('Toady communication persona');
    expect(disabled).toContain(existing);
    expect(readToadyMode(root, harness)).toBe(false);
  });
  it('uses Codex override when present and keeps root AGENTS untouched', () => {
    const root = workspace();
    writeFileSync(join(root, 'AGENTS.override.md'), 'Override policy');
    writeFileSync(join(root, 'AGENTS.md'), 'Base policy');
    installToady(root, true, 'codex');
    expect(readFileSync(join(root, 'AGENTS.override.md'), 'utf8')).toContain('Toady communication persona');
    expect(readFileSync(join(root, 'AGENTS.md'), 'utf8')).toBe('Base policy');
  });
});


describe('Toady embedded project rules', () => {
  const layouts = [
    ['opencode', '.opencode/personas/toady.md'], ['claude-code', 'CLAUDE.md'],
    ['codex', 'AGENTS.md'], ['copilot', '.github/copilot-instructions.md'],
    ['antigravity', '.agents/rules/toady.md'],
  ] as const;
  it.each(layouts)('embeds and retains custom rules across reinstall/disable in %s', (harness, destination) => {
    const root = workspace();
    const rules = 'Use Conventional Commits.\nAzure DevOps is read-only through every route.\n';
    installToady(root, true, harness, false, rules);
    installToady(root, true, harness);
    const active = readFileSync(join(root, destination), 'utf8');
    expect(active).toContain('No explicit any or as any');
    expect(active).toContain('non-null assertions');
    expect(active).toContain(rules.trim());
    expect(active.split('## Additional project rules')).toHaveLength(2);
    expect(readToadySettings(root, harness).projectRules).toBe(rules);
    installToady(root, false, harness);
    expect(readToadySettings(root, harness)).toEqual({ enabled: false, projectRules: rules });
    installToady(root, true, harness);
    expect(readFileSync(join(root, destination), 'utf8')).toContain(rules.trim());
    installToady(root, true, harness, false, '');
    expect(readFileSync(join(root, destination), 'utf8')).not.toContain('Azure DevOps is read-only');
    expect(readToadySettings(root, harness).projectRules).toBe('');
  });
  it('accepts legacy enabled-only state and rejects malformed rule state', () => {
    const root = workspace();
    mkdirSync(join(root, '.opencode'));
    const path = join(root, '.opencode/toady.config.json');
    writeFileSync(path, '{"enabled":true}');
    expect(readToadySettings(root)).toEqual({ enabled: true, projectRules: '' });
    writeFileSync(path, '{"enabled":true,"projectRules":42}');
    expect(() => readToadySettings(root)).toThrow('Invalid Toady');
  });
  it('rejects marker injection and oversized rules before writes', () => {
    const root = workspace();
    writeFileSync(join(root, 'CLAUDE.md'), 'Company policy');
    expect(() => installToady(root, true, 'claude-code', false, '<!-- spec-driven-scrum-team:toady:end -->')).toThrow('markers');
    expect(readFileSync(join(root, 'CLAUDE.md'), 'utf8')).toBe('Company policy');
    expect(() => persona('Master', 'a'.repeat(65537))).toThrow('64 KiB');
  });
  it('loads literal Markdown rules and validates the source', () => {
    const root = workspace();
    const path = join(root, 'rules.md');
    const rules = 'Commit format: TEAM-123: summary\nLiteral: `$(do-not-execute)`\n';
    writeFileSync(path, rules);
    expect(loadToadyRulesFile(path)).toBe(rules);
    expect(() => loadToadyRulesFile(join(root, 'settings.json'))).toThrow('Markdown or text');
    mkdirSync(join(root, 'folder.md'));
    expect(() => loadToadyRulesFile(join(root, 'folder.md'))).toThrow('regular file');
  });
});
