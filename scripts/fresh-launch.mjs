#!/usr/bin/env node
// Registry-free freshness bootstrap (single documented launch route).
//
// Resolves the immutable metadata of the newest successfully verified and
// published master build, verifies the exact tarball, and executes that build
// via npx --package=<exact tarball>. A mutable `latest` URL alone is never
// trusted: every launch re-resolves current.json, and any network, lookup or
// verification failure aborts BEFORE the installer can write anything.
//
// Usage:
//   node fresh-launch.mjs --base https://github.com/OWNER/REPO/releases/download/current \
//     [--cache-dir DIR] -- [installer args...]
//
// A `file://` base is the local-verification route (automated tests and the
// documented local fixture workflow): current.json and the tarball are read
// from disk with the same shape and checksum rules. Release traffic always
// uses https.
//
// Defaults: --base points at this repository's `current` release;
// --cache-dir defaults to ~/.cache/spec-driven-scrum-team/builds.
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';

const REPO = 'ppierzchalka/spec-driven-scrum-team';
const DEFAULT_BASE = `https://github.com/${REPO}/releases/download/current`;

function fail(message) {
  console.error(`fresh-launch: ${message}`);
  console.error('fresh-launch: refusing to run a possibly stale cached build; nothing was installed.');
  process.exit(1);
}

function parseCli(argv) {
  const options = { base: DEFAULT_BASE, cacheDir: join(homedir(), '.cache', 'spec-driven-scrum-team', 'builds'), passthrough: [] };
  let i = 0;
  const rest = [];
  for (; i < argv.length; i += 1) {
    if (argv[i] === '--') {
      rest.push(...argv.slice(i + 1));
      break;
    }
    if (argv[i] === '--base' && argv[i + 1]) options.base = argv[(i += 1)];
    else if (argv[i].startsWith('--base=')) options.base = argv[i].slice('--base='.length);
    else if (argv[i] === '--cache-dir' && argv[i + 1]) options.cacheDir = argv[(i += 1)];
    else if (argv[i].startsWith('--cache-dir=')) options.cacheDir = argv[i].slice('--cache-dir='.length);
    else rest.push(argv[i]);
  }
  options.passthrough = rest;
  return options;
}

function checkMetadata(value, allowFile) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return 'metadata must be an object';
  if (value.version !== 1) return 'unsupported metadata version';
  if (typeof value.tag !== 'string' || !value.tag) return 'missing immutable tag';
  if (typeof value.sha !== 'string' || !/^[0-9a-f]{40}$/.test(value.sha)) return 'missing commit sha';
  if (typeof value.url !== 'string' || !value.url) return 'missing tarball URL';
  let parsed;
  try {
    parsed = new URL(value.url);
  } catch {
    return 'malformed tarball URL';
  }
  const loopback = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1' || parsed.hostname === '::1';
  if (parsed.protocol === 'file:') {
    if (!allowFile) return 'file tarball URLs are for local fixtures only';
  } else if (parsed.protocol === 'https:') {
    if (parsed.hostname !== 'github.com' && !parsed.hostname.endsWith('.github.com') && parsed.hostname !== 'objects.githubusercontent.com') {
      return 'tarball host is outside GitHub';
    }
  } else if (!(parsed.protocol === 'http:' && loopback)) {
    return 'tarball URL must use https (loopback http is for local fixtures only)';
  }
  if (typeof value.sha256 !== 'string' || !/^[0-9a-f]{64}$/.test(value.sha256)) return 'missing tarball sha256';
  if (!value.url.includes(value.sha) && !value.tag.includes(value.sha.slice(0, 12))) return 'tarball URL does not address the pinned commit';
  return null;
}

function readFileUrl(url) {
  return readFileSync(fileURLToPath(url));
}

function sha256File(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

async function download(url, dest, allowFile) {
  if (url.startsWith('file://')) {
    if (!allowFile) fail('file tarball URLs are for local fixtures only');
    mkdirSync(join(dest.split('/').slice(0, -1).join('/') || '.'), { recursive: true });
    writeFileSync(dest, readFileUrl(url));
    return;
  }
  const tmp = join(tmpdir(), `fresh-launch-${process.pid}-${Date.now()}.tgz`);
  let response;
  try {
    response = await fetch(url, { redirect: 'follow' });
  } catch (error) {
    fail(`cannot download ${url}: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (!response.ok) fail(`download answered HTTP ${response.status} for ${url}`);
  const remaining = response.headers.get('x-ratelimit-remaining');
  if (remaining !== null && Number.parseInt(remaining, 10) === 0) fail('GitHub rate limit exhausted; retry later');
  const buffer = Buffer.from(await response.arrayBuffer());
  writeFileSync(tmp, buffer);
  mkdirSync(dest.split('/').slice(0, -1).join('/') || '.', { recursive: true });
  writeFileSync(dest, buffer);
}

const options = parseCli(process.argv.slice(2));
const allowFile = options.base.startsWith('file://');
const endpoint = allowFile ? options.base.replace(/\/+$/, '') + '/current.json' : options.base.replace(/\/+$/, '') + '/current.json';
let metadata;
if (allowFile) {
  try {
    metadata = JSON.parse(readFileUrl(endpoint).toString('utf8'));
  } catch (error) {
    fail(`cannot read ${endpoint}: ${error instanceof Error ? error.message : String(error)}`);
  }
} else {
  try {
    const response = await fetch(endpoint, { redirect: 'follow' });
    if (!response.ok) fail(`${endpoint} answered HTTP ${response.status}`);
    const remaining = response.headers.get('x-ratelimit-remaining');
    if (remaining !== null && Number.parseInt(remaining, 10) === 0) fail('GitHub rate limit exhausted; retry later');
    metadata = await response.json();
  } catch (error) {
    fail(`cannot reach ${endpoint}: ${error instanceof Error ? error.message : String(error)}`);
  }
}
const problem = checkMetadata(metadata, allowFile);
if (problem) fail(`current build metadata rejected (${problem})`);

mkdirSync(options.cacheDir, { recursive: true });
const cached = join(options.cacheDir, `${metadata.sha}.tgz`);
if (existsSync(cached)) {
  if (sha256File(cached) !== metadata.sha256) {
    console.log(`fresh-launch: cached ${metadata.tag} failed verification; re-downloading exact build.`);
    await download(metadata.url, cached, allowFile);
  } else {
    console.log(`fresh-launch: reusing verified cached build ${metadata.tag}.`);
  }
} else {
  console.log(`fresh-launch: downloading exact build ${metadata.tag}.`);
  await download(metadata.url, cached, allowFile);
}
if (sha256File(cached) !== metadata.sha256) fail('downloaded tarball failed sha256 verification');
console.log(`fresh-launch: executing exact build ${metadata.tag} (${metadata.sha.slice(0, 12)}).`);

// The installer's target is the invocation cwd: keep it, run from here.
const child = spawnSync('npx', ['--yes', `--package=${cached}`, 'install-team', ...options.passthrough], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: process.env,
});
process.exit(child.status ?? 1);
