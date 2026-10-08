import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import type { Harness } from './harness.js';

/** User-scoped native config directories; never fall back to a project directory. */
export function personalConfigRoot(harness: Harness): string {
  const home = homedir();
  switch (harness) {
    case 'opencode': return resolve(process.env.XDG_CONFIG_HOME || join(home, '.config'), 'opencode');
    case 'claude-code': return resolve(process.env.CLAUDE_CONFIG_DIR || join(home, '.claude'));
    case 'codex': return resolve(process.env.CODEX_HOME || join(home, '.codex'));
    case 'copilot': return join(home, '.copilot');
    case 'antigravity': return join(home, '.gemini');
  }
}
