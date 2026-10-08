import { createHash } from 'node:crypto';
import { existsSync, readFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { parse as parseYaml } from 'yaml';
import { parse as parseToml } from 'smol-toml';
import { HARNESS_LAYOUTS, type Harness } from './harness.js';
import { checkInstallFile } from './installPaths.js';
import type { InstallOptions } from './types.js';

const description = 'Planner. Establishes product direction, refines ideas, writes specs and ready Tickets, and configures project artifact conventions.';
// Fingerprint of the shipped Planner instructions before its replacement by Analyst.
const plannerHash = 'eeb215cb66e01eb43b17459a99baddac9b62e7c8d573c549db48ebfed984e12d';

function knownBody(body: string): boolean {
  const normalized = body.replace(/\r\n/g, '\n').replace(/\.(?:opencode|claude|agents|github)\/skills\//g, 'skills/').trim();
  return createHash('sha256').update(normalized).digest('hex') === plannerHash;
}

function knownNative(content: string, harness: Harness): boolean {
  try {
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    const metadata = harness === 'codex' ? parseToml(content) : match ? parseYaml(match[1]) as Record<string, unknown> : {};
    const body = harness === 'codex' ? metadata.developer_instructions : match?.[2];
    if (typeof body !== 'string' || !knownBody(body)) return false;
    const actual = { ...metadata };
    // Model preferences do not change the legacy role; custom permissions/tools do.
    for (const key of ['model', 'reasoningEffort', 'model_reasoning_effort', 'developer_instructions']) delete actual[key];
    const expected: Record<string, unknown> = { name: 'planner', description };
    if (harness === 'opencode') expected.mode = 'primary';
    if (harness === 'antigravity') Object.assign(expected, { mainAgent: true, subagent: true, tools: ['view_file', 'grep_search', 'run_command', 'replace_file_content'] });
    return isDeepStrictEqual(actual, expected) || (harness === 'opencode' && isDeepStrictEqual(actual, { description, mode: 'primary' }));
  } catch {
    return false; // Unrecognized or malformed custom files are never removed.
  }
}

/** Read-only cleanup plan; bounded paths, no globbing or folder deletion. */
export function planLegacyCleanup(options: InstallOptions): { removed: string[]; legacyPreserved: string[] } {
  const result = { removed: [] as string[], legacyPreserved: [] as string[] };
  if (existsSync(join(options.definitionsDir, 'planner.md'))) return result;
  const harness = options.harness ?? 'opencode';
  const layout = HARNESS_LAYOUTS[harness];
  const candidates = [
    { path: join(options.targetDir, layout.agents, 'planner' + layout.extension), native: true },
    { path: join(options.targetDir, layout.skills, 'autonomous-implement/references/roles/planner.md'), native: false },
  ];
  for (const candidate of candidates) {
    checkInstallFile(options.targetDir, candidate.path);
    if (!existsSync(candidate.path)) continue;
    const content = readFileSync(candidate.path, 'utf8');
    const known = candidate.native ? knownNative(content, harness) : knownBody(content);
    (known ? result.removed : result.legacyPreserved).push(candidate.path);
  }
  return result;
}

export function removeLegacyDefinitions(options: InstallOptions): { removed: string[]; legacyPreserved: string[] } {
  // Recheck contents and paths after installation; do not act on a stale cleanup plan.
  const result = planLegacyCleanup(options);
  for (const path of result.removed) unlinkSync(path);
  return result;
}
