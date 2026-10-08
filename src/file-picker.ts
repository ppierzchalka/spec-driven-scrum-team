import { fileSelector } from 'inquirer-file-selector';
import { note, promptResult } from './prompts.js';
import { loadToadyRulesFile } from './toady.js';

export async function browseRulesFile(startDirectory = process.cwd()): Promise<string | undefined> {
  let directory = startDirectory;
  while (true) {
    const choice = await promptResult(() => fileSelector({
      message: 'Select additional rules (.md or .txt)', basePath: directory,
      allowCancel: true,
      // Include the plugin's current-directory entry so empty folders remain navigable.
      filter: item => item.isDirectory || /\.(md|txt)$/i.test(item.name),
    }));
    if (typeof choice === 'symbol' || !choice) return undefined;
    if (choice.isDirectory) { directory = choice.path; continue; }
    try { loadToadyRulesFile(choice.path); return choice.path; }
    catch (error) { note(error instanceof Error ? error.message : 'Cannot load rules file'); }
  }
}
