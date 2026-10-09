import { describe, it, expect } from 'vitest';
import { applyGitignoreEntries, managedGitignoreEntries } from './gitignore.js';
import { HARNESS_NAMES } from './harness.js';

const start = '# spec-driven-scrum-team:gitignore:start';
const end = '# spec-driven-scrum-team:gitignore:end';
const entries = ['.opencode/agents/', '.opencode/skills/', '.opencode/team.config.json'];

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
  });
});
