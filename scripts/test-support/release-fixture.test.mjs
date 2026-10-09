import { it, expect } from 'vitest';
import { rmSync, existsSync, writeFileSync, readFileSync } from 'node:fs';
import { join, sep } from 'node:path';
import { privateEnv } from './release-fixture.mjs';
import { ownedTemp } from './owned-temp.mjs';

it('uses explicit private HOME, XDG, temp and npm cache with deliberate cache reuse', () => {
  const root = ownedTemp('release-env-');
  try {
    const first = privateEnv(root);
    const again = privateEnv(root);
    for (const key of ['HOME', 'XDG_CACHE_HOME', 'XDG_CONFIG_HOME', 'XDG_DATA_HOME', 'TMPDIR', 'npm_config_cache']) {
      expect(first[key].startsWith(root + sep)).toBe(true);
      expect(again[key]).toBe(first[key]);
    }
    expect(privateEnv(root, { npm_config_cache: join(root, 'deliberate-cache') }).npm_config_cache).toBe(join(root, 'deliberate-cache'));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

it('initializes an absent configured temp parent and cleans only the owned fixture', () => {
  const root = ownedTemp('absent-parent-');
  try {
    const base = join(root, 'not-created', 'configured-temp');
    const sentinel = join(root, 'unrelated-evidence');
    writeFileSync(sentinel, 'preserve');
    expect(existsSync(base)).toBe(false);
    const fixture = ownedTemp('fixture-', base);
    expect(fixture.startsWith(join(base, 'fixture-'))).toBe(true);
    expect(existsSync(fixture)).toBe(true);
    rmSync(fixture, { recursive: true });
    expect(existsSync(fixture)).toBe(false);
    expect(existsSync(base)).toBe(true);
    expect(readFileSync(sentinel, 'utf8')).toBe('preserve');
  } finally { rmSync(root, { recursive: true, force: true }); }
});
