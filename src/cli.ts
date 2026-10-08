#!/usr/bin/env node
import { text, cancel, confirm } from '@clack/prompts';
import { dirname, join, resolve } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { runTui, selectHarness, enumerateAvailableModels, AGENT_NAMES } from './tui.js';
import { installTeam, preflightTeam, conflictingSkills } from './installTeam.js';
import { resolveDefault } from './defaults.js';
import { HARNESS_LAYOUTS, isHarness } from './harness.js';
import { installToady, readToadyMode, toadyStatePath } from './toady.js';
import { checkInstallPath } from './installPaths.js';
import type { TeamConfig } from './types.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const definitionsDir = join(root, 'agents');
const skillDir = join(root, 'skills', 'autonomous-implement');

async function resolveTarget(rawTarget: string | undefined): Promise<string> {
  if (rawTarget) {
    const target = resolve(rawTarget);
    if (!existsSync(target)) {
      console.error(`Target repo does not exist: ${target}`);
      process.exit(1);
    }
    return target;
  }
  const answer = await text({
    message: 'Path to the target repo (where the team will be installed)?',
    placeholder: 'e.g. ~/code/my-project',
    validate: (value) => {
      const trimmed = value?.trim() ?? '';
      if (!trimmed) return 'Path is required.';
      if (!existsSync(resolve(trimmed))) return `No such path: ${trimmed}`;
      return undefined;
    },
  });
  if (typeof answer === 'symbol') {
    cancel('Cancelled.');
    process.exit(0);
  }
  return resolve(answer.trim());
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const useDefaults = args.includes('--defaults') || args.includes('-d');
  const harnessFlag = args.find((arg) => arg.startsWith('--harness='));
  const harnessName = harnessFlag?.slice('--harness='.length);
  if (harnessName && !isHarness(harnessName)) throw new Error('Unknown harness: ' + harnessName);
  const harness = harnessName && isHarness(harnessName) ? harnessName : useDefaults ? 'opencode' : await selectHarness();
  const positional = args.filter((arg) => !arg.startsWith('-'));
  const target = await resolveTarget(positional[0]);

  const configPath = join(target, HARNESS_LAYOUTS[harness].config);
  checkInstallPath(target, configPath);
  let existing: TeamConfig = {};
  if (existsSync(configPath)) {
    existing = JSON.parse(readFileSync(configPath, 'utf8')) as TeamConfig;
  }

  if (args.includes('--toady') && args.includes('--no-toady')) throw new Error('Choose --toady or --no-toady');
  let toadyMode = readToadyMode(target, harness);
  if (args.includes('--toady')) toadyMode = true;
  if (args.includes('--no-toady')) toadyMode = false;
  let config: TeamConfig;
  let overwrite: Record<string, boolean>;
  if (useDefaults) {
    const available = harness === 'opencode' ? enumerateAvailableModels() : [];
    config = {};
    overwrite = {};
    for (const name of AGENT_NAMES) {
      const choice = harness === 'opencode' ? resolveDefault(name, available) : undefined;
      if (choice) config[name] = choice;
      overwrite[name] = true;
    }
    console.log('Default configuration (for the selected harness; unset models inherit):');
    for (const name of AGENT_NAMES) {
      const choice = config[name];
      console.log(`  ${name}: ${choice?.model ?? 'unset'}${choice?.reasoningEffort ? ` @ ${choice.reasoningEffort}` : ''}`);
    }
    console.log();
    if (harness === 'opencode' && !config.ux?.model) {
      console.log('No recommended Sol model is available for UX. An unset UX model inherits opencode’s current model; select a suitable model explicitly before running design work.');
    }
  } else {
    const tui = await runTui({ existing, harness, toadyMode });
    config = tui.config;
    overwrite = tui.overwrite;
    toadyMode = tui.toadyMode ?? false;
  }

  const options = { definitionsDir, skillDir, config, targetDir: target, overwrite, harness, replaceSkills: args.includes('--replace-skills') };
  const conflicts = conflictingSkills(options);
  if (conflicts.length && !options.replaceSkills && !useDefaults) {
    const answer = await confirm({ message: `Adopt/replace unowned skill folders: ${conflicts.join(', ')}? Existing skill contents may be overwritten.`, initialValue: false });
    if (answer !== true) throw new Error('Installation cancelled; no files written.');
    options.replaceSkills = true;
  }
  preflightTeam(options);
  const configurePersona = toadyMode || existsSync(join(target, toadyStatePath(harness))) || args.includes('--no-toady');
  if (configurePersona) installToady(target, toadyMode, harness, true);
  const result = installTeam(options);
  const personaPaths = configurePersona ? installToady(target, toadyMode, harness) : [];

  console.log(`\nInstalled ${harness} into ${target}`);
  for (const path of personaPaths) console.log(`  wrote  ${path}`);
  for (const path of result.written) console.log(`  wrote  ${path}`);
  for (const path of result.preserved) console.log(`  kept   ${path} (instructions preserved)`);
  for (const path of result.skillPaths) console.log(`  wrote  ${path}`);
  console.log(`  wrote  ${result.configPath}`);
  console.log('Shared skills and policy were refreshed; kept agent instructions still use the updated shared workflow.');
  for (const path of result.removed) console.log(`  removed ${path} (unchanged retired definition)`);
  for (const path of result.legacyPreserved) console.log(`  kept   ${path} (custom/unrecognized legacy definition; migrate to analyst before removing)`);
  console.log('\nNext: use Analyst with /project-setup, /wayfinder, /slice or /refine; /plan is optional; use Lead with /autonomous-implement for ready Tickets.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
