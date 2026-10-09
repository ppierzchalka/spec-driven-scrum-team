import { describe, it, expect, afterEach } from 'vitest';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
// @ts-expect-error Test-only JavaScript helper intentionally outside shipped src.
import { privateEnv, checked } from '../../scripts/test-support/release-fixture.mjs';
// @ts-expect-error Test-only JavaScript helper intentionally outside shipped src.
import { runOwned } from '../../scripts/test-support/owned-process.mjs';

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));
const launcher = join(repoRoot, 'scripts', 'fresh-launch.mjs');
const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function workspace(): string {
  const root = mkdtempSync(join(tmpdir(), 'fresh-launch-'));
  roots.push(root);
  return root;
}

async function stubTarball(dir: string, identity: string): Promise<string> {
  const pkg = join(dir, 'package');
  mkdirSync(pkg, { recursive: true });
  writeFileSync(join(pkg, 'package.json'), JSON.stringify({ name: 'stub-toady', version: '0.0.0', bin: { toady: './cli.js', 'install-team': './cli.js' } }));
  writeFileSync(join(pkg, 'cli.js'), `#!/usr/bin/env node\nconsole.log('${identity}');\n`, { mode: 0o755 });
  const tgz = join(dir, 'pkg.tgz');
  await checked('tar', ['-czf', tgz, '-C', dir, 'package'], { cwd: dir, env: privateEnv(join(dir, 'sandbox')), log: join(dir, 'tar.log'), timeoutMs: 10000 });
  return tgz;
}

async function launch(base: string, cacheDir: string, cwd: string): Promise<{ status: number; output: string }> {
  const outLog = join(workspace(), 'launch.log');
  const result = await runOwned(process.execPath, [launcher, '--base', base, '--cache-dir', cacheDir, '--', '--help'], {
    cwd, env: privateEnv(join(cacheDir, 'sandbox')), log: outLog, timeoutMs: 90000,
  });
  if (!['success', 'nonzero'].includes(result.kind)) throw new Error(`${result.kind}: ${outLog}\n${result.output}`);
  return { status: result.status ?? 1, output: result.output };
}

function writeCurrent(dir: string, tag: string, sha: string, url: string, tgzPath: string): void {
  const sha256 = createHash('sha256').update(readFileSync(tgzPath)).digest('hex');
  writeFileSync(join(dir, 'current.json'), JSON.stringify({ version: 1, tag, sha, url, sha256 }));
}

describe('production freshness launcher', () => {
  it('executes the exact pinned build, advances with current, and reuses verified cache', async () => {
    const root = workspace();
    const srv = join(root, 'srv');
    mkdirSync(srv, { recursive: true });
    const sha1 = 'a'.repeat(40);
    const sha2 = 'b'.repeat(40);
    const tgz1 = await stubTarball(join(root, 'b1'), 'STUB-BUILD-1');
    const tgz2 = await stubTarball(join(root, 'b2'), 'STUB-BUILD-2');
    mkdirSync(join(srv, sha1), { recursive: true });
    mkdirSync(join(srv, sha2), { recursive: true });
    writeFileSync(join(srv, sha1, 'pkg.tgz'), readFileSync(tgz1));
    writeFileSync(join(srv, sha2, 'pkg.tgz'), readFileSync(tgz2));
    const base = pathToFileURL(srv).href;
    const urlFor = (sha: string) => `${base}/${sha}/pkg.tgz`;
    writeCurrent(srv, `build-${sha1}`, sha1, urlFor(sha1), tgz1);
    const cache = join(root, 'cache');
    const work = join(root, 'work');
    mkdirSync(work, { recursive: true });

    const first = await launch(base, cache, work);
    expect(first.status).toBe(0);
    expect(first.output).toContain('downloading exact build');
    expect(first.output).toContain('STUB-BUILD-1');

    // Same populated cache, current flipped: must execute build2, not stale build1.
    writeCurrent(srv, `build-${sha2}`, sha2, urlFor(sha2), tgz2);
    const second = await launch(base, cache, work);
    expect(second.status).toBe(0);
    expect(second.output).toContain('STUB-BUILD-2');
    expect(second.output).not.toContain('STUB-BUILD-1');

    // Repeated identical current: reuse the verified cached build.
    const third = await launch(base, cache, work);
    expect(third.status).toBe(0);
    expect(third.output).toContain('reusing verified cached build');
    expect(third.output).toContain('STUB-BUILD-2');
    for (const path of ['package.json', 'package-lock.json', 'node_modules']) expect(existsSync(join(work, path))).toBe(false);
  }, 180000);

  it('fails closed on missing metadata, malformed metadata and checksum mismatch', async () => {
    const root = workspace();
    const srv = join(root, 'srv');
    mkdirSync(srv, { recursive: true });
    const sha = 'c'.repeat(40);
    const tgz = await stubTarball(join(root, 'b'), 'STUB-NEVER');
    const base = pathToFileURL(srv).href;
    const cache = join(root, 'cache');
    const work = join(root, 'work');
    mkdirSync(work, { recursive: true });

    // Missing current.json fails closed.
    const missing = await launch(base, cache, work);
    expect(missing.status).not.toBe(0);
    expect(missing.output).toContain('refusing to run a possibly stale cached build');

    // Malformed metadata fails closed.
    writeFileSync(join(srv, 'current.json'), 'not json');
    const malformed = await launch(base, cache, work);
    expect(malformed.status).not.toBe(0);
    expect(malformed.output).toContain('refusing to run a possibly stale cached build');

    // Checksum mismatch fails closed even when bytes are readable.
    mkdirSync(join(srv, sha), { recursive: true });
    writeFileSync(join(srv, sha, 'pkg.tgz'), readFileSync(tgz));
    writeFileSync(
      join(srv, 'current.json'),
      JSON.stringify({ version: 1, tag: `build-${sha}`, sha, url: `${base}/${sha}/pkg.tgz`, sha256: 'd'.repeat(64) }),
    );
    const tampered = await launch(base, cache, work);
    expect(tampered.status).not.toBe(0);
    expect(tampered.output).toMatch(/verification|refusing/);

    // Non-GitHub https tarball URLs are rejected without downloading.
    writeFileSync(
      join(srv, 'current.json'),
      JSON.stringify({ version: 1, tag: `build-${sha}`, sha, url: `https://example.com/${sha}/pkg.tgz`, sha256: 'd'.repeat(64) }),
    );
    const outside = await launch(base, cache, work);
    expect(outside.status).not.toBe(0);
    expect(outside.output).toContain('outside GitHub');
  }, 180000);
});
