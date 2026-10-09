import { describe, it, expect } from 'vitest';
import { applyGitignoreEntries, managedGitignoreEntries, GITIGNORE_START, GITIGNORE_END, LEGACY_GITIGNORE_START, LEGACY_GITIGNORE_END } from './gitignore.js';
import { HARNESS_NAMES } from './harness.js';

const entries = ['.opencode/agents/', '.opencode/skills/', '.opencode/team.config.json'];
const start = GITIGNORE_START;
const end = GITIGNORE_END;

describe('managedGitignoreEntries', () => {
  it('lists the agents dir, skills dir and config for each harness', () => {
    expect(managedGitignoreEntries('opencode')).toEqual(entries);
    expect(managedGitignoreEntries('codex')).toEqual(['.codex/agents/', '.agents/skills/', '.codex/team.config.json']);
    for (const harness of HARNESS_NAMES) {
      const managed = managedGitignoreEntries(harness);
      expect(managed).toHaveLength(3);
      expect(managed.every((entry) => entry.length > 0 && (entry.endsWith('/') || entry.endsWith('.json')))).toBe(true);
    }
  });
});

describe('applyGitignoreEntries', () => {
  it('creates the managed block from an empty file with a trailing newline', () => {
    expect(applyGitignoreEntries('', entries)).toBe([start, ...entries, end].join('\n') + '\n');
  });

  it('appends and preserves existing user lines exactly', () => {
    const result = applyGitignoreEntries('# user rules\nprivate/\n', entries);
    expect(result).toContain('# user rules\nprivate/\n');
    expect(result).toContain(start);
    expect(result).toContain(end);
    expect(result).toContain('.opencode/agents/');
    expect(result.endsWith('\n')).toBe(true);
  });

  it('preserves a final line without a newline', () => {
    expect(applyGitignoreEntries('node_modules/', entries).startsWith('node_modules/')).toBe(true);
  });

  it('is idempotent on repeated calls', () => {
    const once = applyGitignoreEntries('# user rules\nprivate/\n', entries);
    const twice = applyGitignoreEntries(once, entries);
    expect(twice).toBe(once);
    expect(once.match(/gitignore:start/g)).toHaveLength(1);
    expect(once.match(/\.opencode\/agents\//g)).toHaveLength(1);
  });

  it('replaces the managed block when entries change without duplicating', () => {
    const first = applyGitignoreEntries('keep-me\n', entries);
    const updated = applyGitignoreEntries(first, ['.opencode/agents/']);
    expect(updated).toContain('keep-me\n');
    expect(updated).toContain('.opencode/agents/');
    expect(updated).not.toContain('.opencode/skills/');
    expect(updated.match(/gitignore:start/g)).toHaveLength(1);
  });

  it('rejects malformed managed markers instead of corrupting the file', () => {
    expect(() => applyGitignoreEntries(start + '\n.opencode/\n', entries)).toThrow(/Malformed/);
    expect(() => applyGitignoreEntries('# tail\n' + end + '\n', entries)).toThrow(/Malformed/);
    expect(() => applyGitignoreEntries(end + '\n' + start + '\n', entries)).toThrow(/Malformed/);
    expect(() => applyGitignoreEntries([start, end, start, end].join('\n') + '\n', entries)).toThrow(/Malformed/);
    expect(() => applyGitignoreEntries(LEGACY_GITIGNORE_START + '\n.opencode/\n', entries)).toThrow(/Malformed/);
    expect(() => applyGitignoreEntries([LEGACY_GITIGNORE_START, LEGACY_GITIGNORE_END, LEGACY_GITIGNORE_START, LEGACY_GITIGNORE_END].join('\n') + '\n', entries)).toThrow(/Malformed/);
  });

  it('migrates a prior-namespace block into the current namespace in place', () => {
    const legacy = ['keep-first\n', [LEGACY_GITIGNORE_START, '.opencode/agents/', LEGACY_GITIGNORE_END].join('\n'), '\nkeep-last\n'].join('');
    const result = applyGitignoreEntries(legacy, entries);
    expect(result).toContain('keep-first\n');
    expect(result).toContain('keep-last\n');
    expect(result).toContain(start);
    expect(result).toContain(end);
    expect(result).not.toContain(LEGACY_GITIGNORE_START);
    expect(result).not.toContain(LEGACY_GITIGNORE_END);
    expect(result.match(/gitignore:start/g)).toHaveLength(1);
    // Repeated reinstall is idempotent.
    expect(applyGitignoreEntries(result, entries)).toBe(result);
  });

  it('consolidates both namespaces into one current block', () => {
    const both = [[LEGACY_GITIGNORE_START, '.opencode/agents/', LEGACY_GITIGNORE_END].join('\n'), 'middle\n', [start, '.opencode/skills/', end].join('\n')].join('\n') + '\n';
    const result = applyGitignoreEntries(both, entries);
    expect(result).toContain(start);
    expect(result).not.toContain(LEGACY_GITIGNORE_START);
    expect(result).not.toContain(LEGACY_GITIGNORE_END);
    expect(result).toContain('middle\n');
    expect(result.match(/gitignore:start/g)).toHaveLength(1);
    expect(result.match(/gitignore:end/g)).toHaveLength(1);
    expect(applyGitignoreEntries(result, entries)).toBe(result);
  });
});
