import { afterEach, describe, expect, it } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { HARNESS_LAYOUTS, HARNESS_NAMES, locateInstructions, renderAgent } from './harness.js';
import { installTeam, parseAgentFile, serializeAgentFile } from './installTeam.js';
import { stringify as tomlStringify, parse as tomlParse } from 'smol-toml';
import { planLegacyCleanup } from './legacyAgents.js';

const fixture = parseAgentFile(readFileSync(new URL('./fixtures/legacy-planner.md', import.meta.url), 'utf8'));
const roots: string[] = [];
function setup(harness: typeof HARNESS_NAMES[number] = 'opencode') {
  const root = mkdtempSync(join(tmpdir(), 'legacy-team-'));
  roots.push(root);
  const definitionsDir = join(root, 'defs');
  const skillDir = join(root, 'source/autonomous-implement');
  const targetDir = join(root, 'target');
  mkdirSync(definitionsDir, { recursive: true });
  mkdirSync(skillDir, { recursive: true });
  writeFileSync(join(definitionsDir, 'analyst.md'), '---\ndescription: Analyst\n---\nNew analyst.\n');
  writeFileSync(join(skillDir, 'SKILL.md'), '# Core\n');
  const path = join(targetDir, HARNESS_LAYOUTS[harness].agents, 'planner' + HARNESS_LAYOUTS[harness].extension);
  mkdirSync(dirname(path), { recursive: true });
  let native = renderAgent('planner', String(fixture.frontmatter.description), fixture.body, { model: 'inherit' }, harness);
  if (harness === 'opencode') native = native.replace('mode: all', 'mode: primary');
  if (harness === 'antigravity') native = native.replace('mainAgent: false', 'mainAgent: true').replace('  - run_command', '  - run_command\n  - replace_file_content');
  writeFileSync(path, native);
  return { options: { definitionsDir, skillDir, targetDir, config: {}, harness }, path, native };
}
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }); });

describe('retired definitions', () => {
  it.each(HARNESS_NAMES)('removes unchanged Planner after installation in %s and is idempotent', harness => {
    const { options, path } = setup(harness);
    // An adopted historical skill folder may contain the old portable role copy.
    const portable = join(options.targetDir, HARNESS_LAYOUTS[harness].skills, 'autonomous-implement/references/roles/planner.md');
    mkdirSync(dirname(portable), { recursive: true });
    writeFileSync(portable, locateInstructions(fixture.body, harness));
    const result = installTeam({ ...options, replaceSkills: true });
    expect(result.removed).toEqual([path, portable]);
    expect(existsSync(path)).toBe(false);
    expect(existsSync(portable)).toBe(false);
    expect(existsSync(join(dirname(path), 'analyst' + HARNESS_LAYOUTS[harness].extension))).toBe(true);
    expect(installTeam(options).removed).toEqual([]);
  });
  it.each(HARNESS_NAMES)('preserves custom native controls in %s', harness => {
    const { options, path, native } = setup(harness);
    if (harness === 'codex') writeFileSync(path, tomlStringify({ ...tomlParse(native), sandbox_mode: 'read-only' }));
    else {
      const agent = parseAgentFile(native);
      writeFileSync(path, serializeAgentFile({ ...agent.frontmatter, permission: { edit: 'deny' } }, agent.body));
    }
    const before = readFileSync(path, 'utf8');
    expect(installTeam(options).legacyPreserved).toEqual([path]);
    expect(readFileSync(path, 'utf8')).toBe(before);
  });
  it('preserves changed instructions, malformed files and unrelated agents', () => {
    const { options, path, native } = setup();
    writeFileSync(path, native + '\nCustom requirement.\n');
    expect(installTeam(options).legacyPreserved).toEqual([path]);
    writeFileSync(path, '---\nmalformed: [\n---\ncustom');
    expect(installTeam(options).legacyPreserved).toEqual([path]);
    const other = join(dirname(path), 'my-planner.md');
    writeFileSync(other, native);
    installTeam(options);
    expect(readFileSync(other, 'utf8')).toBe(native);
  });
  it('cleans the original OpenCode format without a name field', () => {
    const { options, path } = setup();
    writeFileSync(path, serializeAgentFile(fixture.frontmatter, fixture.body.replaceAll('skills/', '.opencode/skills/')));
    expect(installTeam(options).removed).toEqual([path]);
  });
  it('does not remove a role still shipped by the source', () => {
    const { options, path } = setup();
    writeFileSync(join(options.definitionsDir, 'planner.md'), serializeAgentFile(fixture.frontmatter, fixture.body));
    expect(planLegacyCleanup(options).removed).toEqual([]);
    expect(installTeam(options).removed).toEqual([]);
    expect(existsSync(path)).toBe(true);
  });
  it('rejects dangling legacy symlinks before any installation writes', () => {
    const { options, path } = setup();
    rmSync(path);
    symlinkSync(join(options.targetDir, 'missing'), path);
    expect(() => installTeam(options)).toThrow(/symlink/i);
    expect(existsSync(join(dirname(path), 'analyst.md'))).toBe(false);
    expect(existsSync(join(options.targetDir, HARNESS_LAYOUTS.opencode.config))).toBe(false);
  });
  it('retains the legacy role when installation fails', () => {
    const { options, path, native } = setup();
    rmSync(join(options.skillDir, 'SKILL.md'));
    expect(() => installTeam(options)).toThrow();
    expect(readFileSync(path, 'utf8')).toBe(native);
  });
});
