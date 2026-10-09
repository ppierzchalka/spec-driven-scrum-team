import { HARNESS_LAYOUTS, type Harness } from './harness.js';

export const GITIGNORE_START = '# toady:gitignore:start';
export const GITIGNORE_END = '# toady:gitignore:end';
/** Prior product namespace; recognized and consolidated on reinstall, never written. */
export const LEGACY_GITIGNORE_START = '# spec-driven-scrum-team:gitignore:start';
export const LEGACY_GITIGNORE_END = '# spec-driven-scrum-team:gitignore:end';

/** Installed paths for the selected harness, as `.gitignore` entries. */
export function managedGitignoreEntries(harness: Harness): string[] {
  const layout = HARNESS_LAYOUTS[harness];
  return [layout.agents + '/', layout.skills + '/', layout.config];
}

function withTrailingNewline(value: string): string {
  return value.endsWith('\n') ? value : value + '\n';
}

function locate(source: string, start: string, end: string): { first: number; last: number } | null {
  const first = source.indexOf(start);
  const last = source.indexOf(end);
  if (first < 0 && last < 0) return null;
  if (
    (first < 0) !== (last < 0) ||
    (first >= 0 &&
      (last < first ||
        source.indexOf(start, first + start.length) >= 0 ||
        source.indexOf(end, last + end.length) >= 0))
  ) {
    throw new Error('Malformed managed gitignore block; existing .gitignore unchanged');
  }
  return { first, last };
}

/**
 * Insert or replace the managed ignore block, preserving all unrelated lines.
 * A prior-namespace block is recognized and consolidated into the current
 * `toady` block in place; repeated reinstalls are idempotent. Rejects
 * malformed or duplicated managed markers from either namespace instead of
 * corrupting the file.
 */
export function applyGitignoreEntries(source: string, entries: string[]): string {
  const block = [GITIGNORE_START, ...entries, GITIGNORE_END].join('\n');
  const current = locate(source, GITIGNORE_START, GITIGNORE_END);
  const legacy = locate(source, LEGACY_GITIGNORE_START, LEGACY_GITIGNORE_END);
  if (current && legacy) {
    const currentEnd = current.last + GITIGNORE_END.length;
    const legacyEnd = legacy.last + LEGACY_GITIGNORE_END.length;
    if (current.first < legacyEnd && legacy.first < currentEnd) {
      throw new Error('Malformed managed gitignore block; existing .gitignore unchanged');
    }
    // Consolidate both valid blocks into one current block: strip the legacy
    // block, then replace the current block in place.
    const stripped = removeBlock(source, LEGACY_GITIGNORE_START, LEGACY_GITIGNORE_END);
    return withTrailingNewline(replaceBlock(stripped, GITIGNORE_START, GITIGNORE_END, block));
  }
  if (legacy && !current) {
    return withTrailingNewline(replaceBlock(source, LEGACY_GITIGNORE_START, LEGACY_GITIGNORE_END, block));
  }
  if (current) {
    return withTrailingNewline(replaceBlock(source, GITIGNORE_START, GITIGNORE_END, block));
  }
  if (source.length === 0) return block + '\n';
  return (source.endsWith('\n') ? source + '\n' : source + '\n\n') + block + '\n';
}

function replaceBlock(source: string, start: string, end: string, block: string): string {
  const first = source.indexOf(start);
  const last = source.indexOf(end);
  return source.slice(0, first) + block + source.slice(last + end.length);
}

function removeBlock(source: string, start: string, end: string): string {
  const first = source.indexOf(start);
  const last = source.indexOf(end);
  return source.slice(0, first) + source.slice(last + end.length);
}
