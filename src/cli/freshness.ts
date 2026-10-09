/**
 * Freshness bootstrap contract: the launcher resolves immutable metadata for
 * the newest successfully verified/published master build and executes that
 * exact build. A mutable `latest` URL alone is never enough (npm caches
 * installs), and any network/lookup/verification failure aborts BEFORE the
 * installer can write anything.
 */

export interface CurrentBuild {
  version: 1;
  /** Immutable release tag, e.g. `build-<40-hex-sha>`. */
  tag: string;
  /** Full commit sha the build was produced from. */
  sha: string;
  /** Immutable tarball URL for exactly that build. */
  url: string;
  /** Lowercase hex sha256 of the tarball bytes. */
  sha256: string;
}

function isHex(value: unknown, length: number): value is string {
  return typeof value === 'string' && new RegExp(`^[0-9a-f]{${length}}$`).test(value);
}

export interface CurrentMetadataPolicy {
  /**
   * Allow `file:` tarball URLs. Only for local verification fixtures where
   * the metadata base itself is a `file:` URL; release traffic always uses
   * https and keeps this false.
   */
  allowFile?: boolean;
}

export function parseCurrentMetadata(json: string, policy: CurrentMetadataPolicy = {}): CurrentBuild {
  let value: unknown;
  try {
    value = JSON.parse(json);
  } catch {
    throw new Error('Freshness lookup failed: current build metadata is not valid JSON.');
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Freshness lookup failed: current build metadata must be an object.');
  }
  const record = value as Record<string, unknown>;
  if (record.version !== 1) throw new Error('Freshness lookup failed: unsupported current metadata version.');
  if (typeof record.tag !== 'string' || !record.tag) throw new Error('Freshness lookup failed: current metadata has no immutable tag.');
  if (!isHex(record.sha, 40)) throw new Error('Freshness lookup failed: current metadata has no commit sha.');
  if (typeof record.url !== 'string' || !record.url) throw new Error('Freshness lookup failed: current metadata has no tarball URL.');
  let parsed: URL;
  try {
    parsed = new URL(record.url);
  } catch {
    throw new Error('Freshness lookup failed: current tarball URL is malformed.');
  }
  // Release tarballs come from GitHub over TLS. Plain http is accepted only
  // for loopback fixtures used in local verification.
  const loopback = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1' || parsed.hostname === '::1';
  if (parsed.protocol === 'file:') {
    if (!policy.allowFile) {
      throw new Error('Freshness lookup failed: file tarball URLs are for local fixtures only.');
    }
  } else if (parsed.protocol === 'https:') {
    if (parsed.hostname !== 'github.com' && !parsed.hostname.endsWith('.github.com') && parsed.hostname !== 'objects.githubusercontent.com') {
      throw new Error('Freshness lookup failed: tarball host is outside GitHub.');
    }
  } else if (!(parsed.protocol === 'http:' && loopback)) {
    throw new Error('Freshness lookup failed: tarball URL must use https (or loopback http for local fixtures).');
  }
  if (!isHex(record.sha256, 64)) throw new Error('Freshness lookup failed: current metadata has no tarball sha256.');
  if (!record.url.includes(record.sha) && !record.tag.includes(record.sha.slice(0, 12))) {
    throw new Error('Freshness lookup failed: tarball URL does not address the pinned commit.');
  }
  return { version: 1, tag: record.tag, sha: record.sha, url: record.url, sha256: record.sha256 };
}

export async function fetchCurrentMetadata(baseUrl: string, fetchFn: typeof fetch = fetch): Promise<CurrentBuild> {
  const endpoint = baseUrl.replace(/\/+$/, '') + '/current.json';
  let response: Response;
  try {
    response = await fetchFn(endpoint, { redirect: 'follow' });
  } catch (error) {
    throw new Error(`Freshness lookup failed: cannot reach ${endpoint} (${error instanceof Error ? error.message : String(error)}). Refusing to run a possibly stale cached build.`);
  }
  if (!response.ok) {
    throw new Error(`Freshness lookup failed: ${endpoint} answered HTTP ${response.status}. Refusing to run a possibly stale cached build.`);
  }
  // Rate limits surface here instead of silently falling back to cache.
  const remaining = response.headers.get('x-ratelimit-remaining');
  if (remaining !== null && Number.parseInt(remaining, 10) === 0) {
    throw new Error('Freshness lookup failed: GitHub rate limit exhausted. Retry later; refusing to run a possibly stale cached build.');
  }
  return parseCurrentMetadata(await response.text());
}
