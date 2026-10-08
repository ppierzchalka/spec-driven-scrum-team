import { fileSelector, ItemType } from 'inquirer-file-selector';
import { cancel, note, promptResult } from './prompts.js';
import { lstatSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { checkInstallDirectory } from './installPaths.js';

export function normalizeTargets(paths: string[]): string[] {
  const targets = [...new Set(paths.map(path => resolve(path)))];
  for (const target of targets) {
    checkInstallDirectory(target, target);
    if (!statSync(target).isDirectory()) throw new Error('Target must be an existing directory: ' + target);
  }
  return targets;
}

/** Native Inquirer folder multiselect; children are never selected implicitly. */
export async function browseTargets(startDirectory = process.cwd()): Promise<string[]> {
  while (true) {
    const choice = await promptResult(() => fileSelector({
      message: 'Select target folders', basePath: resolve(startDirectory),
      type: ItemType.Directory, multiple: true, allowCancel: true,
      filter: item => item.isDirectory && !lstatSync(item.path).isSymbolicLink(),
    }));
    if (typeof choice === 'symbol' || !choice) { cancel('Cancelled.'); process.exit(0); }
    if (!choice.length) { note('Select at least one folder with Space, then press Enter.'); continue; }
    return normalizeTargets(choice.map(item => item.path));
  }
}
