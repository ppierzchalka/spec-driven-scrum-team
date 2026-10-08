import { autocomplete, cancel, note } from '@clack/prompts';
import { readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { loadToadyRulesFile } from './toady.js';

export interface RulesEntry {
  value: string;
  label: string;
  hint: string;
}

/** Read only one directory; do not scan trees or preview file contents. */
export function rulesEntries(directory: string): RulesEntry[] {
  const folders: RulesEntry[] = [];
  const files: RulesEntry[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    try {
      const type = entry.isSymbolicLink() ? statSync(path) : entry;
      if (type.isDirectory()) folders.push({ value: 'dir:' + path, label: entry.name + '/', hint: 'folder' });
      else if (type.isFile() && /\.(md|txt)$/i.test(entry.name)) files.push({ value: 'file:' + path, label: entry.name, hint: 'rules file' });
    } catch {
      // Broken/inaccessible links are not selectable files.
    }
  }
  const byName = (a: RulesEntry, b: RulesEntry): number => a.label.localeCompare(b.label);
  return [...folders.sort(byName), ...files.sort(byName)];
}

export async function browseRulesFile(startDirectory = process.cwd()): Promise<string | undefined> {
  let directory = resolve(startDirectory);
  while (true) {
    let entries: RulesEntry[];
    try {
      entries = rulesEntries(directory);
    } catch (error) {
      note(error instanceof Error ? error.message : 'Cannot read directory', 'File browser');
      const parent = dirname(directory);
      if (parent === directory) return undefined;
      directory = parent;
      continue;
    }
    const parent = dirname(directory);
    const choice = await autocomplete<string>({
      message: `Select additional rules — ${directory}`,
      placeholder: 'Type to filter folders and Markdown/text files',
      options: [
        ...(parent !== directory ? [{ value: '__parent__', label: '../', hint: 'parent folder' }] : []),
        ...entries,
        { value: '__back__', label: 'Back without selecting', hint: 'keep existing additional rules' },
      ],
    });
    if (typeof choice === 'symbol') {
      cancel('Cancelled.');
      process.exit(0);
    }
    if (choice === '__back__') return undefined;
    if (choice === '__parent__') { directory = parent; continue; }
    if (choice.startsWith('dir:')) { directory = choice.slice(4); continue; }
    if (choice.startsWith('file:')) {
      const path = choice.slice(5);
      try {
        loadToadyRulesFile(path);
        return path;
      } catch (error) {
        note(error instanceof Error ? error.message : 'Cannot load rules file', 'File browser');
      }
    }
  }
}
