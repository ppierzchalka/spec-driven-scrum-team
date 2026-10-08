import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, symlinkSync, existsSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parse } from 'jsonc-parser';
const context = vi.hoisted(() => ({ root: '' }));
vi.mock('./personalPaths.js', () => ({ personalConfigRoot: (harness: string) => join(context.root, harness) }));
import { installToady, readToadySettings, persona, loadToadyRulesFile, personalSettingsPath } from './toady.js';
const roots: string[] = [];
function workspace() { const root = mkdtempSync(join(tmpdir(), 'persona-')); roots.push(root); return root; }
beforeEach(() => { context.root = workspace(); });
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }); });
const layouts = [
  ['opencode', 'personas/spec-driven-scrum-team.md'], ['claude-code', 'CLAUDE.md'],
  ['codex', 'AGENTS.md'], ['copilot', 'copilot-instructions.md'], ['antigravity', 'GEMINI.md'],
] as const;

describe('private startup persona', () => {
  it.each(layouts)('stores %s persona and rules outside the repo and retains them independently', (harness, file) => {
    const target = workspace(), path = join(context.root, harness, file);
    const rules = 'Use Conventional Commits. Azure DevOps is read-only.';
    installToady(target, true, harness, false, rules);
    installToady(target, true, harness);
    let body = readFileSync(path, 'utf8');
    expect(body).toContain('Henchman identity'); expect(body).toContain(rules);
    expect(body.split('## Additional rules')).toHaveLength(2);
    expect(readToadySettings(workspace(), harness)).toEqual({ enabled: true, projectRules: rules });
    installToady(target, false, harness);
    body = readFileSync(path, 'utf8');
    expect(body).toContain(rules); expect(body).not.toContain('Henchman identity');
    installToady(target, false, harness, false, '');
    if (harness === 'opencode') {
      expect(existsSync(path)).toBe(false);
      expect(parse(readFileSync(join(context.root, harness, 'opencode.jsonc'), 'utf8')).instructions).toBeUndefined();
    } else expect(readFileSync(path, 'utf8')).not.toContain(rules);
    expect(existsSync(join(target, 'AGENTS.md'))).toBe(false);
    expect(existsSync(join(target, '.opencode'))).toBe(false);
    expect(existsSync(join(target, 'CLAUDE.md'))).toBe(false);
    expect(existsSync(join(target, '.github'))).toBe(false);
    expect(existsSync(join(target, '.agents'))).toBe(false);
    if (process.platform !== 'win32') expect(statSync(personalSettingsPath(harness)).mode & 0o777).toBe(0o600);
  });
  it('merges user JSONC without changing provider settings, comments or project AGENTS', () => {
    const target = workspace(), user = join(context.root, 'opencode'); mkdirSync(user);
    const source = '// Company routing\n{"model":"vertex/gemini","share":"disabled","instructions":["~/company.md"],}\n';
    writeFileSync(join(user, 'opencode.jsonc'), source);
    writeFileSync(join(target, 'AGENTS.md'), 'Existing project conventions\n');
    installToady(target, true); installToady(target, true);
    const text = readFileSync(join(user, 'opencode.jsonc'), 'utf8');
    expect(text).toContain('// Company routing');
    expect(parse(text)).toEqual({ model: 'vertex/gemini', share: 'disabled', instructions: ['~/company.md', join(user, 'personas/spec-driven-scrum-team.md').replaceAll('\\', '/')] });
    expect(readFileSync(join(target, 'AGENTS.md'), 'utf8')).toBe('Existing project conventions\n');
    expect(existsSync(join(target, 'opencode.jsonc'))).toBe(false);
  });
  it('uses an existing user JSON config rather than creating a shadow JSONC config', () => {
    const target = workspace(), user = join(context.root, 'opencode'); mkdirSync(user);
    writeFileSync(join(user, 'opencode.json'), '{"instructions":["company.md"]}');
    installToady(target, true);
    expect(existsSync(join(user, 'opencode.jsonc'))).toBe(false);
    expect(parse(readFileSync(join(user, 'opencode.json'), 'utf8')).instructions).toHaveLength(2);
  });
  it('migrates old inline and file-based personal content without removing project conventions', () => {
    const target = workspace(); mkdirSync(join(target, '.opencode/personas'), { recursive: true });
    writeFileSync(join(target, '.opencode/toady.config.json'), '{"enabled":true,"projectRules":"No any."}');
    writeFileSync(join(target, '.opencode/personas/toady.md'), persona('Master', 'No any.'));
    writeFileSync(join(target, 'AGENTS.md'), 'Before\n<!-- spec-driven-scrum-team:toady:start -->\nPrivate persona\n<!-- spec-driven-scrum-team:toady:end -->\nAfter');
    for (const file of ['opencode.json', 'opencode.jsonc']) writeFileSync(join(target, file), '{"instructions":["company.md",".opencode/personas/toady.md"]}');
    expect(readToadySettings(target).projectRules).toBe('No any.');
    installToady(target, true);
    expect(readFileSync(join(context.root, 'opencode/personas/spec-driven-scrum-team.md'), 'utf8')).toContain('No any.');
    expect(readFileSync(join(target, 'AGENTS.md'), 'utf8')).toBe('Before\n\nAfter');
    expect(existsSync(join(target, '.opencode/toady.config.json'))).toBe(false);
    expect(existsSync(join(target, '.opencode/personas/toady.md'))).toBe(false);
    for (const file of ['opencode.json', 'opencode.jsonc']) expect(parse(readFileSync(join(target, file), 'utf8')).instructions).toEqual(['company.md']);
  });
  it('preflights malformed private config and old managed blocks before writing anything', () => {
    const target = workspace(), user = join(context.root, 'opencode'); mkdirSync(user);
    writeFileSync(join(user, 'opencode.jsonc'), '{invalid');
    expect(() => installToady(target, true)).toThrow('Invalid OpenCode');
    expect(existsSync(personalSettingsPath('opencode'))).toBe(false);
    writeFileSync(join(user, 'opencode.jsonc'), '{}');
    writeFileSync(join(target, 'AGENTS.md'), '<!-- spec-driven-scrum-team:toady:start -->');
    expect(() => installToady(target, true)).toThrow('Malformed');
    expect(readFileSync(join(user, 'opencode.jsonc'), 'utf8')).toBe('{}');
    expect(existsSync(personalSettingsPath('opencode'))).toBe(false);
  });
  it('rejects linked private destinations without changing external content', () => {
    const target = workspace(), outside = workspace(), user = join(context.root, 'opencode');
    mkdirSync(user); writeFileSync(join(outside, 'config'), '{}');
    symlinkSync(join(outside, 'config'), join(user, 'opencode.jsonc'));
    expect(() => installToady(target, true)).toThrow('symlink');
    expect(readFileSync(join(outside, 'config'), 'utf8')).toBe('{}');
  });
  it('uses the active Codex user override and preserves unrelated user instructions', () => {
    const target = workspace(), user = join(context.root, 'codex'); mkdirSync(user);
    writeFileSync(join(user, 'AGENTS.override.md'), 'Company user policy');
    writeFileSync(join(user, 'AGENTS.md'), 'Base user policy');
    installToady(target, true, 'codex');
    expect(readFileSync(join(user, 'AGENTS.override.md'), 'utf8')).toContain('Henchman identity');
    expect(readFileSync(join(user, 'AGENTS.override.md'), 'utf8')).toContain('Company user policy');
    expect(readFileSync(join(user, 'AGENTS.md'), 'utf8')).toBe('Base user policy');
  });
  it('dry run makes no user or project writes', () => {
    const target = workspace(); installToady(target, true, 'opencode', true, 'No any.');
    expect(existsSync(join(context.root, 'opencode'))).toBe(false);
    expect(existsSync(join(target, 'AGENTS.md'))).toBe(false);
  });
  it('rejects personal configuration inside the target', () => {
    expect(() => installToady(context.root, true)).toThrow('outside the target');
  });
  it('loads literal source rules and rejects invalid sources', () => {
    const target = workspace(), path = join(target, 'rules.md');
    writeFileSync(path, 'Literal: `$(do-not-execute)`');
    expect(loadToadyRulesFile(path)).toBe('Literal: `$(do-not-execute)`');
    expect(() => loadToadyRulesFile(join(target, 'config.json'))).toThrow('Markdown');
    expect(() => persona('Master', 'a'.repeat(65537))).toThrow('64 KiB');
    expect(() => persona('Master', '<!-- spec-driven-scrum-team:toady:end -->')).toThrow('markers');
    expect(persona('Master')).not.toContain('Conventional Commits');
  });
});
