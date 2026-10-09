import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, symlinkSync, existsSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { parse } from 'jsonc-parser';
const context = vi.hoisted(() => ({ root: '' }));
vi.mock('./personalPaths.js', () => ({ personalConfigRoot: (harness: string) => join(context.root, harness) }));
import { installToady, readToadySettings, persona, loadToadyRulesFile, personalSettingsPath } from './toady.js';
const roots: string[] = [];
function workspace() { const root = mkdtempSync(join(tmpdir(), 'persona-')); roots.push(root); return root; }
beforeEach(() => { context.root = workspace(); });
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }); });
const layouts = [
  ['opencode', 'AGENTS.md'], ['claude-code', 'CLAUDE.md'],
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
    expect(readFileSync(path, 'utf8')).not.toContain(rules);
    if (harness === 'opencode') expect(existsSync(join(context.root, harness, 'opencode.jsonc'))).toBe(false);
    expect(existsSync(join(target, 'AGENTS.md'))).toBe(false);
    expect(existsSync(join(target, '.opencode'))).toBe(false);
    expect(existsSync(join(target, 'CLAUDE.md'))).toBe(false);
    expect(existsSync(join(target, '.github'))).toBe(false);
    expect(existsSync(join(target, '.agents'))).toBe(false);
    if (process.platform !== 'win32') expect(statSync(personalSettingsPath(harness)).mode & 0o777).toBe(0o600);
  });
  it('keeps user JSONC, provider settings, comments and project AGENTS unchanged', () => {
    const target = workspace(), user = join(context.root, 'opencode'); mkdirSync(user);
    const source = '// Company routing\n{"model":"vertex/gemini","share":"disabled","instructions":["~/company.md"],}\n';
    writeFileSync(join(user, 'opencode.jsonc'), source);
    writeFileSync(join(target, 'AGENTS.md'), 'Existing project conventions\n');
    installToady(target, true); installToady(target, true);
    const text = readFileSync(join(user, 'opencode.jsonc'), 'utf8');
    expect(text).toBe(source);
    expect(readFileSync(join(user, 'AGENTS.md'), 'utf8')).toContain('Henchman identity');
    expect(parse(text)).toEqual({ model: 'vertex/gemini', share: 'disabled', instructions: ['~/company.md'] });
    expect(readFileSync(join(target, 'AGENTS.md'), 'utf8')).toBe('Existing project conventions\n');
    expect(existsSync(join(target, 'opencode.jsonc'))).toBe(false);
  });
  it('does not create a config or inject a reference into an existing user JSON config', () => {
    const target = workspace(), user = join(context.root, 'opencode'); mkdirSync(user);
    writeFileSync(join(user, 'opencode.json'), '{"instructions":["company.md"]}');
    installToady(target, true);
    expect(existsSync(join(user, 'opencode.jsonc'))).toBe(false);
    expect(parse(readFileSync(join(user, 'opencode.json'), 'utf8')).instructions).toEqual(['company.md']);
  });
  it('migrates old inline and file-based personal content without removing project conventions', () => {
    const target = workspace(); mkdirSync(join(target, '.opencode/personas'), { recursive: true });
    writeFileSync(join(target, '.opencode/toady.config.json'), '{"enabled":true,"projectRules":"No any."}');
    writeFileSync(join(target, '.opencode/personas/toady.md'), persona('Master', 'No any.'));
    writeFileSync(join(target, 'AGENTS.md'), 'Before\n<!-- spec-driven-scrum-team:toady:start -->\nPrivate persona\n<!-- spec-driven-scrum-team:toady:end -->\nAfter');
    for (const file of ['opencode.json', 'opencode.jsonc']) writeFileSync(join(target, file), '{"instructions":["company.md",".opencode/personas/toady.md"]}');
    expect(readToadySettings(target).projectRules).toBe('No any.');
    installToady(target, true);
    expect(readFileSync(join(context.root, 'opencode/AGENTS.md'), 'utf8')).toContain('No any.');
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
  it('migrates both user configs to one global block, preserving other instructions and rules', () => {
    const target = workspace(), user = join(context.root, 'opencode');
    mkdirSync(join(user, 'personas'), { recursive: true });
    const old = join(user, 'personas/spec-driven-scrum-team.md');
    const reference = old.replaceAll('\\', '/');
    writeFileSync(old, persona('Master', 'Azure DevOps is read-only.'));
    writeFileSync(join(user, 'AGENTS.md'), 'Existing personal policy\n');
    for (const filename of ['opencode.json', 'opencode.jsonc']) {
      writeFileSync(join(user, filename), '// Vertex routing\n' + JSON.stringify({ model: 'vertex/gemini', instructions: ['company.md', reference] }));
    }
    installToady(target, true, 'opencode', false, 'Azure DevOps is read-only.');
    installToady(target, true);
    const content = readFileSync(join(user, 'AGENTS.md'), 'utf8');
    expect(content).toContain('Existing personal policy');
    expect(content).toContain('Azure DevOps is read-only.');
    expect(content.split('Henchman identity')).toHaveLength(2);
    expect(existsSync(old)).toBe(false);
    for (const filename of ['opencode.json', 'opencode.jsonc']) {
      const config = readFileSync(join(user, filename), 'utf8');
      expect(config).toContain('// Vertex routing');
      expect(parse(config)).toEqual({ model: 'vertex/gemini', instructions: ['company.md'] });
    }
    expect(existsSync(join(target, 'AGENTS.md'))).toBe(false);
    installToady(target, false, 'opencode', false, '');
    expect(readFileSync(join(user, 'AGENTS.md'), 'utf8').trim()).toBe('Existing personal policy');
  });
  it('preflights malformed global blocks before removing old user references or files', () => {
    const target = workspace(), user = join(context.root, 'opencode');
    mkdirSync(join(user, 'personas'), { recursive: true });
    const old = join(user, 'personas/spec-driven-scrum-team.md');
    writeFileSync(old, persona('Master'));
    const config = JSON.stringify({ instructions: [old.replaceAll('\\', '/')] });
    writeFileSync(join(user, 'opencode.jsonc'), config);
    writeFileSync(join(user, 'AGENTS.md'), '<!-- spec-driven-scrum-team:toady:start -->');
    expect(() => installToady(target, true)).toThrow('Malformed');
    expect(readFileSync(join(user, 'opencode.jsonc'), 'utf8')).toBe(config);
    expect(existsSync(old)).toBe(true);
    expect(existsSync(personalSettingsPath('opencode'))).toBe(false);
  });
  it('rejects linked global instructions without modifying their contents', () => {
    const target = workspace(), user = join(context.root, 'opencode'), outside = workspace();
    mkdirSync(user); writeFileSync(join(outside, 'AGENTS.md'), 'External policy');
    symlinkSync(join(outside, 'AGENTS.md'), join(user, 'AGENTS.md'));
    expect(() => installToady(target, true)).toThrow('symlink');
    expect(readFileSync(join(outside, 'AGENTS.md'), 'utf8')).toBe('External policy');
  });

});

describe('toady product namespace upgrade', () => {
  const NEW_START = '<!-- toady:start -->';
  const NEW_END = '<!-- toady:end -->';
  const OLD_START = '<!-- spec-driven-scrum-team:toady:start -->';
  const OLD_END = '<!-- spec-driven-scrum-team:toady:end -->';
  function legacySettingsPath(harness = 'opencode'): string {
    return join(context.root, harness, 'spec-driven-scrum-team', 'persona.json');
  }
  function writeLegacySettings(enabled: boolean, projectRules: string): void {
    const path = legacySettingsPath();
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, JSON.stringify({ enabled, projectRules }));
  }
  function writeSettings(path: string, body: string): void {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, body);
  }

  it('writes current-namespace markers and settings on a fresh install', () => {
    const target = workspace();
    installToady(target, true, 'opencode', false, 'Use Conventional Commits.');
    const body = readFileSync(join(context.root, 'opencode', 'AGENTS.md'), 'utf8');
    expect(body).toContain(NEW_START);
    expect(body).toContain(NEW_END);
    expect(body).not.toContain('spec-driven-scrum-team:toady');
    expect(existsSync(legacySettingsPath())).toBe(false);
    expect(readToadySettings(workspace())).toEqual({ enabled: true, projectRules: 'Use Conventional Commits.' });
  });

  it('recognizes prior-namespace ownership and migrates the managed block', () => {
    const target = workspace(), user = join(context.root, 'opencode');
    mkdirSync(user, { recursive: true });
    writeFileSync(join(user, 'AGENTS.md'), `Company policy\n${OLD_START}\nOld voice\n${OLD_END}\nTrailing\n`);
    installToady(target, true, 'opencode', false, 'Kept rules.');
    const body = readFileSync(join(user, 'AGENTS.md'), 'utf8');
    expect(body).toContain('Company policy');
    expect(body).toContain('Trailing');
    expect(body).toContain(NEW_START);
    expect(body).toContain('Kept rules.');
    expect(body).not.toContain(OLD_START);
    expect(body.split('Henchman identity')).toHaveLength(2);
    // Repeated reinstall is idempotent.
    installToady(target, true);
    const again = readFileSync(join(user, 'AGENTS.md'), 'utf8');
    expect(again).toBe(body);
    expect(again.match(/toady:start/g)).toHaveLength(1);
  });

  it('consolidates valid old and new blocks into one current block', () => {
    const target = workspace(), user = join(context.root, 'opencode');
    mkdirSync(user, { recursive: true });
    writeFileSync(join(user, 'AGENTS.md'), `Head\n${OLD_START}\nOld\n${OLD_END}\nMiddle\n${NEW_START}\nNew\n${NEW_END}\nTail\n`);
    installToady(target, true, 'opencode', false, 'Rules.');
    const body = readFileSync(join(user, 'AGENTS.md'), 'utf8');
    expect(body).toContain('Head');
    expect(body).toContain('Middle');
    expect(body).toContain('Tail');
    expect(body).not.toContain(OLD_START);
    expect(body.match(/toady:start/g)).toHaveLength(1);
    expect(body.match(/toady:end/g)).toHaveLength(1);
  });

  it('reads old-only settings and migrates them to the new namespace', () => {
    const target = workspace();
    writeLegacySettings(true, 'Legacy rules.');
    expect(readToadySettings(target)).toEqual({ enabled: true, projectRules: 'Legacy rules.' });
    installToady(target, true);
    expect(existsSync(legacySettingsPath())).toBe(false);
    expect(readToadySettings(workspace())).toEqual({ enabled: true, projectRules: 'Legacy rules.' });
    expect(JSON.parse(readFileSync(personalSettingsPath('opencode'), 'utf8'))).toEqual({ enabled: true, projectRules: 'Legacy rules.' });
  });

  it('prefers new settings when both namespaces exist', () => {
    const target = workspace();
    writeLegacySettings(false, 'Old rules.');
    writeSettings(personalSettingsPath('opencode'), JSON.stringify({ enabled: true, projectRules: 'New rules.' }));
    expect(readToadySettings(target)).toEqual({ enabled: true, projectRules: 'New rules.' });
    installToady(target, true);
    expect(existsSync(legacySettingsPath())).toBe(false);
    expect(readToadySettings(workspace())).toEqual({ enabled: true, projectRules: 'New rules.' });
  });

  it('fails preflight on invalid chosen state without mutation', () => {
    const target = workspace();
    writeLegacySettings(false, 'Old rules.');
    writeSettings(personalSettingsPath('opencode'), '{"enabled":"yes"}');
    const before = readFileSync(legacySettingsPath(), 'utf8');
    expect(() => readToadySettings(target)).toThrow('Invalid Toady settings');
    expect(() => installToady(target, true, 'opencode', true)).toThrow('Invalid Toady settings');
    expect(readFileSync(legacySettingsPath(), 'utf8')).toBe(before);
    expect(existsSync(join(target, 'AGENTS.md'))).toBe(false);
    // Invalid old-only state fails as well, without mutation.
    rmSync(personalSettingsPath('opencode'), { force: true });
    writeSettings(legacySettingsPath(), 'not json');
    expect(() => installToady(workspace(), true)).toThrow();
    expect(existsSync(join(target, 'AGENTS.md'))).toBe(false);
  });

  it('rejects duplicate markers from either namespace without writing', () => {
    const target = workspace(), user = join(context.root, 'opencode');
    mkdirSync(user, { recursive: true });
    writeFileSync(join(user, 'AGENTS.md'), `${NEW_START}\nA\n${NEW_END}\n${NEW_START}\nB\n${NEW_END}\n`);
    expect(() => installToady(target, true)).toThrow('Malformed');
    expect(existsSync(personalSettingsPath('opencode'))).toBe(false);
    writeFileSync(join(user, 'AGENTS.md'), `${OLD_START}\nA\n${OLD_END}\n${OLD_START}\nB\n${OLD_END}\n`);
    expect(() => installToady(target, true)).toThrow('Malformed');
    expect(existsSync(personalSettingsPath('opencode'))).toBe(false);
  });

  it('rejects injected markers from either namespace in rules', () => {
    expect(() => persona('Master', `${NEW_END}`)).toThrow('markers');
    expect(() => persona('Master', `${OLD_END}`)).toThrow('markers');
    const target = workspace(), path = join(target, 'rules.md');
    writeFileSync(path, `ok\n${NEW_START}\n`);
    expect(() => loadToadyRulesFile(path)).toThrow('markers');
  });

  it('installs the toolkit with voice off while rules stay on', () => {
    const target = workspace();
    installToady(target, false, 'opencode', false, 'Always follow Conventional Commits.');
    const body = readFileSync(join(context.root, 'opencode', 'AGENTS.md'), 'utf8');
    expect(body).toContain(NEW_START);
    expect(body).toContain('Always follow Conventional Commits.');
    expect(body).not.toContain('Henchman identity');
    expect(readToadySettings(workspace())).toEqual({ enabled: false, projectRules: 'Always follow Conventional Commits.' });
  });
});
