#!/usr/bin/env node
/**
 * Shipped freshness bootstrap and the `toady` / `install-team` bin entry.
 *
 * Both bin names run the same freshness-protected installer with equivalent
 * arguments and results; `install-team` is a supported alias for `toady`.
 *
 * Every launch resolves the immutable metadata of the newest successfully
 * verified/published master build and executes exactly that build:
 * - running build matches pinned sha  -> run the internal installer directly
 * - stale or dev build                -> download the exact tarball, verify
 *   its sha256, and hand off execution with the pinned identity attached
 *
 * A mutable `latest` URL alone is never trusted (npm caches installs), and
 * any network/lookup/verification failure aborts BEFORE the installer can
 * write anything. The handoff carries TOADY_EXACT_BUILD so the exact
 * build runs without recursive rechecking; a pin mismatch aborts instead of
 * running stale code.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from './args.js';
import { resolvePackageRoot } from './assets.js';
import { readBuildInfo } from './buildInfo.js';
import { fetchCurrentMetadata, parseCurrentMetadata, type CurrentBuild } from './freshness.js';
import { main } from './main.js';

const REPO = 'ppierzchalka/toady';
/** Current environment names; the `INSTALL_TEAM_*` names remain accepted fallbacks. */
const BASE_ENV = 'TOADY_RELEASE_BASE';
const LEGACY_BASE_ENV = 'INSTALL_TEAM_RELEASE_BASE';
const PIN_ENV = 'TOADY_EXACT_BUILD';
const LEGACY_PIN_ENV = 'INSTALL_TEAM_EXACT_BUILD';
/** Canonical bin invoked for the verified handoff; the alias resolves to the same entry. */
const CANONICAL_BIN = 'toady';

function defaultBase(): string {
  return `https://github.com/${REPO}/releases/download/current`;
}

function releaseBase(): string {
  return process.env[BASE_ENV] || process.env[LEGACY_BASE_ENV] || defaultBase();
}

function exactPin(): string | undefined {
  return process.env[PIN_ENV] || process.env[LEGACY_PIN_ENV];
}

function fail(message: string): never {
  console.error(`toady: ${message}`);
  console.error('toady: refusing to run a possibly stale cached build; nothing was installed.');
  process.exit(1);
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function loadCurrent(base: string): Promise<CurrentBuild> {
  if (base.startsWith('file://')) {
    // Local-verification route: same shape and checksum rules as releases.
    let raw: string;
    try {
      raw = readFileSync(fileURLToPath(base.replace(/\/+$/, '') + '/current.json'), 'utf8');
    } catch (error) {
      fail(`cannot read ${base}/current.json: ${describe(error)}`);
    }
    try {
      return parseCurrentMetadata(raw, { allowFile: true });
    } catch (error) {
      fail(`current build metadata rejected: ${describe(error)}`);
    }
  }
  try {
    return await fetchCurrentMetadata(base);
  } catch (error) {
    fail(describe(error));
  }
}

function cacheDir(): string {
  const base = process.env.XDG_CACHE_HOME || join(homedir(), '.cache');
  return join(base, 'toady', 'builds');
}

function sha256File(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

async function downloadTarball(url: string, dest: string, allowFile: boolean): Promise<void> {
  mkdirSync(join(dest.split('/').slice(0, -1).join('/') || '.'), { recursive: true });
  if (url.startsWith('file://')) {
    if (!allowFile) fail('file tarball URLs are for local fixtures only');
    try {
      writeFileSync(dest, readFileSync(fileURLToPath(url)));
    } catch (error) {
      fail(`cannot read tarball ${url}: ${describe(error)}`);
    }
    return;
  }
  let response: Response;
  try {
    response = await fetch(url, { redirect: 'follow' });
  } catch (error) {
    fail(`cannot download ${url}: ${describe(error)}`);
  }
  if (!response.ok) fail(`download answered HTTP ${response.status} for ${url}`);
  const remaining = response.headers.get('x-ratelimit-remaining');
  if (remaining !== null && Number.parseInt(remaining, 10) === 0) {
    fail('GitHub rate limit exhausted; retry later');
  }
  writeFileSync(dest, Buffer.from(await response.arrayBuffer()));
}

async function launch(argv: string[]): Promise<void> {
  const packageRoot = resolvePackageRoot(import.meta.url);
  const own = readBuildInfo(packageRoot);

  // Validated handoff from an outer bootstrap: the pinned identity was
  // verified before download, so run without recursive rechecking. A pin
  // that does not match this exact build aborts instead of running stale.
  const pin = exactPin();
  if (pin) {
    if (pin !== own.commit) {
      console.error(`toady: build identity ${own.tag} does not match pinned build; refusing to run stale code. Nothing was installed.`);
      process.exitCode = 1;
      return;
    }
    await main(argv);
    return;
  }

  let args;
  try {
    args = parseArgs(argv);
  } catch (error) {
    console.error(describe(error));
    process.exitCode = 2;
    return;
  }
  void args;

  const base = releaseBase();
  const allowFile = base.startsWith('file://');
  const current = await loadCurrent(base);

  if (own.commit !== 'dev' && own.commit === current.sha) {
    // Fresh: just resolved, no rechecking needed below.
    await main(argv);
    return;
  }

  const dir = cacheDir();
  mkdirSync(dir, { recursive: true });
  const cached = join(dir, `${current.sha}.tgz`);
  if (existsSync(cached) && sha256File(cached) === current.sha256) {
    console.error(`toady: reusing verified cached build ${current.tag}.`);
  } else {
    if (existsSync(cached)) {
      console.error(`toady: cached ${current.tag} failed verification; re-downloading exact build.`);
    } else {
      console.error(`toady: downloading exact build ${current.tag}.`);
    }
    await downloadTarball(current.url, cached, allowFile);
  }
  if (sha256File(cached) !== current.sha256) fail('downloaded tarball failed sha256 verification');
  console.error(`toady: executing exact build ${current.tag} (${current.sha.slice(0, 12)}).`);

  // The installer's target is the invocation cwd: keep it, run from here.
  // Consumer package files are untouched; npm resolves into its own cache.
  const child = spawnSync('npx', ['--yes', `--package=${cached}`, CANONICAL_BIN, ...argv], {
    stdio: 'inherit',
    cwd: process.cwd(),
    env: { ...process.env, [PIN_ENV]: current.sha },
  });
  process.exit(child.status ?? 1);
}

launch(process.argv.slice(2)).catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
