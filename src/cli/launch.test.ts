import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync, copyFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { readBuildInfo } from './buildInfo.js';
// @ts-expect-error Test-only JavaScript helper intentionally outside shipped src.
import { createReleaseFixture, privateEnv } from '../../scripts/test-support/release-fixture.mjs';
// @ts-expect-error Test-only JavaScript helper intentionally outside shipped src.
import { runOwned } from '../../scripts/test-support/owned-process.mjs';

let fixture: Awaited<ReturnType<typeof createReleaseFixture>>;
let repoRoot: string;
const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function workspace(): string {
  const root = mkdtempSync(join(tmpdir(), 'launch-npx-'));
  roots.push(root);
  return root;
}

/** Sandboxed HOME/XDG; npm cache is configured per npx call below. */
function sandboxEnv(extra: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv {
  const home = mkdtempSync(join(tmpdir(), 'launch-home-'));
  roots.push(home);
  return privateEnv(home, extra);
}

/** Run a command, capturing combined output to a file (npx grandchildren hold pipes open). */
async function runToFile(cmd: string, args: string[], cwd: string, env: NodeJS.ProcessEnv, timeout: number): Promise<{ status: number; output: string }> {
  const log = join(workspace(), 'run.log');
  const result = await runOwned(cmd, args, { cwd, env, log, timeoutMs: timeout });
  if (!['success', 'nonzero'].includes(result.kind)) throw new Error(`${result.kind}: ${log}\n${result.output}`);
  return { status: result.status ?? 1, output: result.output };
}

function npxInstallTeam(opts: {
  npmCache: string;
  env: NodeJS.ProcessEnv;
  work: string;
  pkg: string;
  args: string[];
  timeout: number;
}): Promise<{ status: number; output: string }> {
  return runToFile(
    'npx',
    ['--yes', `--package=${opts.pkg}`, 'install-team', ...opts.args],
    opts.work,
    { ...opts.env, npm_config_cache: opts.npmCache },
    opts.timeout,
  );
}

function writeCurrent(dir: string, tag: string, sha: string, url: string, tgzPath: string): void {
  const sha256 = createHash('sha256').update(readFileSync(tgzPath)).digest('hex');
  writeFileSync(join(dir, 'current.json'), JSON.stringify({ version: 1, tag, sha, url, sha256 }));
}

beforeAll(async () => {
  fixture = await createReleaseFixture();
  repoRoot = fixture.stage;
  console.log(`release fixture HEAD=${fixture.commit} fingerprint=${fixture.fingerprint}`);
}, 300000);
afterAll(() => {
  if (fixture) {
    console.log(`release fixture packs=${fixture.packCount} phaseMs=${JSON.stringify(fixture.timings)}`);
    expect(fixture.packCount).toBe(2);
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

describe('public npx route through the shipped bootstrap bin', () => {
  it('executes the exact current build across two builds sharing one npm cache, then reuses cache', async () => {
    const root = workspace();
    const srv = join(root, 'srv');
    const builds = join(srv, 'builds');
    mkdirSync(builds, { recursive: true });
    const work = join(root, 'work');
    mkdirSync(work, { recursive: true });
    const npmCache = join(root, 'npm-cache');
    mkdirSync(npmCache, { recursive: true });
    const env = sandboxEnv({ INSTALL_TEAM_RELEASE_BASE: pathToFileURL(srv).href });

    // Build 1: the real working-tree build, stamped with HEAD.
    const stamp1 = readBuildInfo(repoRoot);
    expect(stamp1.commit).toMatch(/^[0-9a-f]{40}$/);
    const sha1 = stamp1.commit;
    const sha2 = sha1[0] === 'b' ? 'c'.repeat(40) : 'b'.repeat(40);
    const tag1 = `0.1.0+${sha1.slice(0, 12)}`;
    const tag2 = `0.1.0+${sha2.slice(0, 12)}`;
    const packed1 = fixture.basePack;
    const imm1 = join(builds, sha1, 'installer.tgz');
    mkdirSync(join(builds, sha1), { recursive: true });
    copyFileSync(packed1, imm1);
    const stable = join(srv, 'installer-current.tgz');
    copyFileSync(packed1, stable);
    writeCurrent(srv, `build-${sha1}`, sha1, pathToFileURL(imm1).href, imm1);

    // Public invocation path, exactly as documented.
    const stableUrl = pathToFileURL(stable).href;
    const first = await npxInstallTeam({ npmCache, env, work, pkg: stableUrl, args: ['--help'], timeout: 300000 });
    expect(first.status).toBe(0);
    expect(first.output).toContain(`build ${tag1}`);

    // Build 2: same sources, distinct immutable identity.
    const packed2 = await fixture.pack(sha2);
    expect(readBuildInfo(repoRoot).commit).toBe(sha1);
    const imm2 = join(builds, sha2, 'installer.tgz');
    mkdirSync(join(builds, sha2), { recursive: true });
    copyFileSync(packed2, imm2);
    copyFileSync(packed2, stable);
    writeCurrent(srv, `build-${sha2}`, sha2, pathToFileURL(imm2).href, imm2);

    // Same populated npm cache: whatever copy npm serves, the outcome must
    // be exactly build 2 — never stale build 1.
    const second = await npxInstallTeam({ npmCache, env, work, pkg: stableUrl, args: ['--help'], timeout: 300000 });
    expect(second.status).toBe(0);
    expect(second.output).toContain(`build ${tag2}`);
    expect(second.output).not.toContain(`build ${tag1}`);

    // Deterministic stale-bootstrap path with an isolated bootstrap cache:
    // the previous build binary itself, pointed at the new metadata, must
    // download the exact build and hand off (proving the cached case).
    const staleEnv = sandboxEnv({ INSTALL_TEAM_RELEASE_BASE: pathToFileURL(srv).href });
    const staleWork = join(root, 'stale-work');
    mkdirSync(staleWork, { recursive: true });
    // The on-disk fixture remains the old bootstrap identity; only the second
    // tarball has the new stamp. Never modify shared repository dist.
    const stale = await runToFile(process.execPath, [join(repoRoot, 'dist', 'cli', 'launch.js'), '--help'], staleWork, staleEnv, 120000);
    expect(stale.status, stale.output).toBe(0);
    expect(stale.output).toContain('downloading exact build');
    expect(stale.output).toContain(`build ${tag2}`);

    // Repeat invocation with the populated cache: reuse, same exact build.
    const third = await runToFile(process.execPath, [join(repoRoot, 'dist', 'cli', 'launch.js'), '--help'], staleWork, staleEnv, 120000);
    expect(third.status).toBe(0);
    expect(third.output).toContain('reusing verified cached build');
    expect(third.output).toContain(`build ${tag2}`);

    // No consumer dependency mutation in any run.
    for (const dir of [work, staleWork]) {
      expect(existsSync(join(dir, 'package.json'))).toBe(false);
      expect(existsSync(join(dir, 'node_modules'))).toBe(false);
      expect(existsSync(join(dir, 'package-lock.json'))).toBe(false);
    }
  }, 600000);

  it('fails closed through npx when metadata is unreachable, even with a populated cache', async () => {
    const root = workspace();
    const work = join(root, 'work');
    mkdirSync(work, { recursive: true });
    const npmCache = join(root, 'npm-cache');
    mkdirSync(npmCache, { recursive: true });
    const srv = join(root, 'srv');
    mkdirSync(srv, { recursive: true });
    const stamp = readBuildInfo(repoRoot);
    expect(stamp.commit).toMatch(/^[0-9a-f]{40}$/);
    const sha = stamp.commit;
    const packed = fixture.basePack;
    const served = join(srv, sha, 'installer.tgz');
    mkdirSync(join(srv, sha), { recursive: true });
    copyFileSync(packed, served);
    // Populate the npm cache with a good run first.
    const goodEnv = sandboxEnv({ INSTALL_TEAM_RELEASE_BASE: pathToFileURL(srv).href });
    writeCurrent(srv, `build-${sha}`, sha, pathToFileURL(served).href, served);
    const good = await npxInstallTeam({ npmCache, env: goodEnv, work, pkg: pathToFileURL(packed).href, args: ['--help'], timeout: 300000 });
    expect(good.status).toBe(0);
    // Then kill the metadata source: the cached bootstrap must still refuse.
    const deadBase = pathToFileURL(join(root, 'empty-srv')).href;
    mkdirSync(join(root, 'empty-srv'), { recursive: true });
    const deadEnv = sandboxEnv({ INSTALL_TEAM_RELEASE_BASE: deadBase });
    const result = await npxInstallTeam({ npmCache, env: deadEnv, work, pkg: pathToFileURL(packed).href, args: ['--help'], timeout: 300000 });
    expect(result.status).not.toBe(0);
    expect(result.output).toMatch(/refusing to run a possibly stale cached build/);
    expect(existsSync(join(work, '.opencode'))).toBe(false);
    expect(existsSync(join(work, '.vscode'))).toBe(false);
  }, 600000);

  it('fails closed on checksum mismatch before executing anything', async () => {
    const root = workspace();
    const srv = join(root, 'srv');
    mkdirSync(srv, { recursive: true });
    const work = join(root, 'work');
    mkdirSync(work, { recursive: true });
    const env = sandboxEnv({ INSTALL_TEAM_RELEASE_BASE: pathToFileURL(srv).href });
    const packed = fixture.basePack;
    const sha = 'c'.repeat(40);
    const served = join(srv, sha, 'installer.tgz');
    mkdirSync(join(srv, sha), { recursive: true });
    copyFileSync(packed, served);
    writeFileSync(
      join(srv, 'current.json'),
      JSON.stringify({ version: 1, tag: `build-${sha}`, sha, url: pathToFileURL(served).href, sha256: 'd'.repeat(64) }),
    );
    const result = await runToFile(process.execPath, [join(repoRoot, 'dist', 'cli', 'launch.js'), '--help'], work, env, 120000);
    expect(result.status).not.toBe(0);
    expect(result.output).toMatch(/verification|refusing/);
    expect(existsSync(join(work, '.opencode'))).toBe(false);
  }, 300000);
});
