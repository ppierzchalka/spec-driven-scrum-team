import { HARNESS_LAYOUTS, type Harness } from './harness.js';

const start = '# spec-driven-scrum-team:gitignore:start';
const end = '# spec-driven-scrum-team:gitignore:end';

/** Installed paths for the selected harness, as `.gitignore` entries. */
export function managedGitignoreEntries(harness: Harness): string[] {
  const layout = HARNESS_LAYOUTS[harness];
  return [layout.agents + '/', layout.skills + '/', layout.config];
}

function withTrailingNewline(value: string): string {
  return value.endsWith('\n') ? value : value + '\n';
}

/**
 * Insert or replace the managed ignore block, preserving all unrelated lines.
 * Rejects malformed or duplicated managed markers instead of corrupting the file.
 */
export function applyGitignoreEntries(source: string, entries: string[]): string {
  const block = [start, ...entries, end].join('\n');
  const first = source.indexOf(start);
  const last = source.indexOf(end);
  if (
    (first < 0) !== (last < 0) ||
    (first >= 0 &&
      (last < first ||
        source.indexOf(start, first + start.length) >= 0 ||
        source.indexOf(end, last + end.length) >= 0))
  ) {
    throw new Error('Malformed managed gitignore block; existing .gitignore unchanged');
  }
  if (first >= 0) {
    return withTrailingNewline(source.slice(0, first) + block + source.slice(last + end.length));
  }
  if (source.length === 0) return block + '\n';
  return (source.endsWith('\n') ? source + '\n' : source + '\n\n') + block + '\n';
}
