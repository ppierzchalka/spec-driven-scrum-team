import { afterEach, describe, expect, it, vi } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { installBatch } from './installBatch.js';
const privateContext = vi.hoisted(() => ({ root: '' }));
vi.mock('./personalPaths.js', () => ({ personalConfigRoot: (harness: string) => join(privateContext.root, 'user', harness) }));
const roots: string[] = [];
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }); });
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'batch-install-')); roots.push(root); privateContext.root = root;
  const definitionsDir = join(root, 'defs');
  const skillDir = join(root, 'source/autonomous-implement');
  mkdirSync(definitionsDir); mkdirSync(skillDir, { recursive: true });
  writeFileSync(join(definitionsDir, 'analyst.md'), '---\ndescription: Analyst\n---\nAnalyze.\n');
  writeFileSync(join(skillDir, 'SKILL.md'), '# Core\n');
  const targets = [join(root, 'a'), join(root, 'b')];
  for (const target of targets) mkdirSync(target);
  const plans = targets.map(targetDir => ({ options: { definitionsDir, skillDir, targetDir, config: { analyst: { model: 'inherit' } }, harness: 'codex' as const }, persona: { enabled: false, rules: 'No any.' } }));
  return { root, targets, plans };
}
describe('multi-target installation', () => {
  it('applies a shared profile with per-target startup rules and preserves unrelated instructions', () => {
    const { targets, plans } = fixture();
    writeFileSync(join(targets[1], 'AGENTS.md'), 'Company rules\n');
    const reports: string[] = [];
    const results = installBatch(plans, result => reports.push(result.target));
    expect(reports).toEqual(targets);
    expect(results).toHaveLength(2);
    for (const target of targets) {
      expect(readFileSync(join(target, '.codex/agents/analyst.toml'), 'utf8')).toContain('model = "inherit"');
      expect(readFileSync(join(privateContext.root, 'user/codex/AGENTS.md'), 'utf8')).toContain('No any.');
      expect(existsSync(join(target, '.gitignore'))).toBe(false);
    }
    expect(readFileSync(join(targets[1], 'AGENTS.md'), 'utf8')).toContain('Company rules');
  });
  it('rejects a late team destination before writing the first target', () => {
    const { targets, plans } = fixture();
    mkdirSync(join(targets[1], '.codex'));
    writeFileSync(join(targets[1], '.codex/agents'), 'not a directory');
    expect(() => installBatch(plans)).toThrow();
    expect(existsSync(join(targets[0], '.codex'))).toBe(false);
    expect(existsSync(join(targets[0], 'AGENTS.md'))).toBe(false);
  });
  it('rejects a late persona destination before any team writes', () => {
    const { targets, plans } = fixture();
    mkdirSync(join(targets[1], 'AGENTS.md'));
    expect(() => installBatch(plans)).toThrow();
    expect(existsSync(join(targets[0], '.codex'))).toBe(false);
    expect(existsSync(join(targets[1], '.codex'))).toBe(false);
  });
  it('rejects an unowned collision in the second repo before touching the first', () => {
    const { targets, plans } = fixture();
    mkdirSync(join(targets[1], '.agents/skills/autonomous-implement'), { recursive: true });
    writeFileSync(join(targets[1], '.agents/skills/autonomous-implement/SKILL.md'), '# External\n');
    expect(() => installBatch(plans)).toThrow(/Unowned/);
    expect(existsSync(join(targets[0], '.codex'))).toBe(false);
    expect(readFileSync(join(targets[1], '.agents/skills/autonomous-implement/SKILL.md'), 'utf8')).toBe('# External\n');
  });
});
