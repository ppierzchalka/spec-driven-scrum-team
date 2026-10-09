import { mkdirSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Callers remove only the unique directory returned here, never the base.
export function ownedTemp(prefix, base = process.env.TMPDIR || (process.platform === 'win32' ? tmpdir() : '/tmp/opencode')) {
  mkdirSync(base, { recursive: true });
  return mkdtempSync(join(base, prefix));
}
