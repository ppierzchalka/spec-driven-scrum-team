import { autocomplete, cancel, note } from '@clack/prompts';
import { readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { checkInstallDirectory } from './installPaths.js';

export function normalizeTargets(paths: string[]): string[] {
  const targets = [...new Set(paths.map(path => resolve(path)))];
  for (const target of targets) {
    checkInstallDirectory(target, target);
    if (!statSync(target).isDirectory()) throw new Error('Target must be an existing directory: ' + target);
  }
  return targets;
}

/** Select exact directories; children are not implicitly selected or scanned. */
export async function browseTargets(startDirectory = process.cwd()): Promise<string[]> {
  let directory = resolve(startDirectory);
  const targets = new Set<string>();
  note('Enter on a folder opens it. Inside the desired folder, choose Add this folder and press Enter to select it.\nRepeat for more targets, then choose Continue with N targets.\nSpace is search input; selection uses the Add/Remove actions.', 'Target folder controls');
  while (true) {
    let folders: { value: string; label: string; hint: string }[];
    try {
      folders = readdirSync(directory, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(entry => ({ value: 'dir:' + join(directory, entry.name), label: entry.name + '/' + (targets.has(join(directory, entry.name)) ? ' [selected]' : ''), hint: 'Enter: open folder' }));
    } catch (error) {
      note(error instanceof Error ? error.message : 'Cannot read directory', 'Target browser');
      const parent = dirname(directory);
      if (parent === directory) throw error;
      directory = parent;
      continue;
    }
    const parent = dirname(directory);
    const choice = await autocomplete<string>({
      message: `Select target folders — ${directory} (${targets.size} selected)`,
      placeholder: 'Enter opens folders; Add this folder + Enter selects; type to filter',
      options: [
        { value: '__toggle__', label: targets.has(directory) ? 'Remove this folder' : 'Add this folder', hint: 'Enter: ' + (targets.has(directory) ? 'unselect ' : 'select ') + directory },
        ...(parent !== directory ? [{ value: '__parent__', label: '../', hint: 'parent folder' }] : []),
        ...folders,
        ...[...targets].map(path => ({ value: 'remove:' + path, label: 'Remove selected: ' + path, hint: 'selected target' })),
        ...(targets.size ? [{ value: '__done__', label: `Continue with ${targets.size} target${targets.size === 1 ? '' : 's'}`, hint: 'configure one shared installation profile' }] : []),
        { value: '__cancel__', label: 'Cancel setup', hint: 'no files written' },
      ],
    });
    if (typeof choice === 'symbol' || choice === '__cancel__') {
      cancel('Cancelled.');
      process.exit(0);
    }
    if (choice === '__toggle__') {
      if (targets.has(directory)) targets.delete(directory);
      else { normalizeTargets([directory]); targets.add(directory); }
    } else if (choice === '__parent__') directory = parent;
    else if (choice.startsWith('dir:')) directory = choice.slice(4);
    else if (choice.startsWith('remove:')) targets.delete(choice.slice(7));
    else if (choice === '__done__' && targets.size) return normalizeTargets([...targets]);
  }
}
