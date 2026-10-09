import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runOwned } from './owned-process.mjs';

export const repoRoot = fileURLToPath(new URL('../../', import.meta.url));
export function privateEnv(root, extra = {}) {
  const home = join(root, 'home');
  const temp = join(root, 'tmp');
  mkdirSync(home, { recursive: true });
  mkdirSync(temp, { recursive: true });
  return { ...process.env, HOME: home, XDG_CACHE_HOME: join(home, '.cache'), XDG_CONFIG_HOME: join(home, '.config'), XDG_DATA_HOME: join(home, '.local/share'), npm_config_cache: join(root, 'npm-cache'), TMPDIR: temp, ...extra };
}

export async function checked(command, args, options) {
  const result = await runOwned(command, args, options);
  if (result.kind !== 'success') throw new Error(`${command}: ${result.kind} (${result.status}); ${result.log}\n${result.output}`);
  return result.output;
}

/** One fresh isolated compilation and base pack per file; no HEAD-only cache.
 * Identity includes every tracked/untracked, nonignored working-tree file.
 */
export async function createReleaseFixture() {
  mkdirSync('/tmp/opencode', { recursive: true });
  const root = mkdtempSync('/tmp/opencode/release-fixture-');
  const env = privateEnv(root);
  const timings = {};
  const command = async (cmd, args, name, cwd = repoRoot) => {
    const start = performance.now();
    try { return await checked(cmd, args, { cwd, env, log: join(root, `${name}.log`), timeoutMs: 120000 }); }
    finally { timings[name] = Math.round(performance.now() - start); }
  };
  const commit = (await command('git', ['rev-parse', 'HEAD'], 'head')).trim();
  const paths = (await command('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], 'paths')).split('\0').filter(Boolean).sort();
  const hash = createHash('sha256');
  for (const path of paths) {
    hash.update(path + '\0');
    hash.update(existsSync(join(repoRoot, path)) ? readFileSync(join(repoRoot, path)) : '<deleted>');
    hash.update('\0');
  }
  const fingerprint = hash.digest('hex');
  const stage = join(root, 'package');
  mkdirSync(stage);
  for (const path of ['package.json', 'README.md', 'agents', 'skills']) cpSync(join(repoRoot, path), join(stage, path), { recursive: true });
  await command(process.execPath, [join(repoRoot, 'node_modules/typescript/bin/tsc'), '-p', 'tsconfig.build.json', '--outDir', join(stage, 'dist')], 'compile');
  // Direct stale-bootstrap probes need runtime imports before handoff. Reuse
  // installed local dependencies only there; npm never packs node_modules and
  // the real npx tarball probes still install in their explicit private cache.
  symlinkSync(join(repoRoot, 'node_modules'), join(stage, 'node_modules'), 'dir');
  const stamp = (sha) => writeFileSync(join(stage, 'dist/build-info.json'), JSON.stringify({ commit: sha, fingerprint, builtAt: new Date().toISOString() }) + '\n');
  let packCount = 0;
  const pack = async (sha) => {
    const stampPath = join(stage, 'dist/build-info.json');
    const previous = existsSync(stampPath) ? readFileSync(stampPath) : null;
    stamp(sha);
    const dest = join(root, `pack-${++packCount}`);
    mkdirSync(dest);
    try {
      const output = await command('npm', ['pack', '--silent', '--ignore-scripts', '--pack-destination', dest], `pack-${packCount}`, stage);
      return join(dest, output.trim().split('\n').at(-1));
    } finally {
      if (previous) writeFileSync(stampPath, previous);
    }
  };
  const basePack = await pack(commit);
  writeFileSync(join(root, 'identity.json'), JSON.stringify({ commit, fingerprint, basePack }, null, 2));
  return { root, stage, commit, fingerprint, basePack, pack, timings, get packCount() { return packCount; } };
}
