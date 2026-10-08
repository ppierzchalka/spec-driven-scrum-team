import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('../skills/autonomous-implement/scripts/summarize-usage.mjs', import.meta.url));
function run(rows: unknown) {
  const root = mkdtempSync(join(tmpdir(), 'team-usage-'));
  try {
    const path = join(root, 'rows.json'); writeFileSync(path, JSON.stringify(rows));
    return JSON.parse(execFileSync(process.execPath, [script, path], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
  } finally { rmSync(root, { recursive: true, force: true }); }
}
describe('normalized usage summaries', () => {
  it('keeps missing metrics unknown, separates currencies and strips transcript fields', () => {
    const result = run([{ source: 'runtime', task: 'A', inputTokens: 10, cost: 1, currency: 'USD', transcript: 'secret' }, { source: 'runtime', task: 'B', cost: 2, currency: 'PLN' }]);
    expect(result.totals.inputTokens).toEqual({ knownTotal: 10, observedRows: 1, complete: false });
    expect(result.totals.outputTokens.knownTotal).toBeNull();
    expect(result.costs).toEqual({ USD: 1, PLN: 2 });
    expect(JSON.stringify(result)).not.toContain('secret');
  });
  it('rejects invented/unattributed/invalid metrics', () => {
    expect(() => run([{ inputTokens: 5 }])).toThrow();
    expect(() => run([{ source: 'runtime', cost: 5 }])).toThrow();
    expect(() => run([{ source: 'runtime', inputTokens: -1 }])).toThrow();
    expect(run([]).costComplete).toBe(false);
  });
});
