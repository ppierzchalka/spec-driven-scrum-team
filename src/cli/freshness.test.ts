import { describe, it, expect } from 'vitest';
import { fetchCurrentMetadata, parseCurrentMetadata } from './freshness.js';

const SHA = 'a'.repeat(40);
const DIGEST = 'b'.repeat(64);
const BASE = 'https://github.com/example/team/releases/download/build-' + SHA;

function metadata(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    version: 1,
    tag: 'build-' + SHA,
    sha: SHA,
    url: BASE + '/installer.tgz',
    sha256: DIGEST,
    ...overrides,
  });
}

describe('release freshness metadata', () => {
  it('accepts immutable pinned metadata', () => {
    const current = parseCurrentMetadata(metadata());
    expect(current).toMatchObject({ version: 1, sha: SHA, sha256: DIGEST });
  });

  it('fails closed on malformed or unpinned metadata', () => {
    expect(() => parseCurrentMetadata('not json')).toThrow(/Freshness lookup failed/);
    expect(() => parseCurrentMetadata('[]')).toThrow(/must be an object/);
    expect(() => parseCurrentMetadata(metadata({ version: 2 }))).toThrow(/unsupported/);
    expect(() => parseCurrentMetadata(metadata({ sha: 'short' }))).toThrow(/commit sha/);
    expect(() => parseCurrentMetadata(metadata({ sha256: 'short' }))).toThrow(/sha256/);
    expect(() => parseCurrentMetadata(metadata({ url: 'https://example.com/other/x.tgz' }))).toThrow(/outside GitHub/);
    expect(() => parseCurrentMetadata(metadata({ url: 'http://example.com/x.tgz' }))).toThrow(/https/);
    expect(() => parseCurrentMetadata(metadata({ url: 'https://github.com/example/team/releases/download/build-' + 'c'.repeat(40) + '/unrelated.tgz', tag: 'build-other' }))).toThrow(/pinned commit/);
  });

  it('accepts loopback http fixtures for local verification', () => {
    const current = parseCurrentMetadata(metadata({ url: `http://127.0.0.1:9/${SHA}/x.tgz` }));
    expect(current.url).toContain('127.0.0.1');
  });

  it('rejects file URLs unless the local-fixture policy allows them', () => {
    const fileUrl = `file:///tmp/fixture/${SHA}/installer.tgz`;
    expect(() => parseCurrentMetadata(metadata({ url: fileUrl }))).toThrow(/local fixtures only/);
    const current = parseCurrentMetadata(metadata({ url: fileUrl }), { allowFile: true });
    expect(current.url).toBe(fileUrl);
  });

  it('fails closed on network errors, HTTP failures and rate limits', async () => {
    await expect(fetchCurrentMetadata('https://github.com/x', async () => {
      throw new Error('boom');
    })).rejects.toThrow(/cannot reach/);
    await expect(
      fetchCurrentMetadata('https://github.com/x', (async () => new Response('nope', { status: 404 })) as typeof fetch),
    ).rejects.toThrow(/HTTP 404/);
    await expect(
      fetchCurrentMetadata(
        'https://github.com/x',
        (async () => new Response(metadata(), { headers: { 'x-ratelimit-remaining': '0' } })) as typeof fetch,
      ),
    ).rejects.toThrow(/rate limit/i);
  });

  it('resolves the exact pinned build from a fixture server response', async () => {
    const body = metadata();
    const current = await fetchCurrentMetadata(
      'https://github.com/x/',
      (async (url: string | URL | Request) => {
        expect(String(url)).toBe('https://github.com/x/current.json');
        return new Response(body);
      }) as typeof fetch,
    );
    expect(current.sha).toBe(SHA);
  });
});
