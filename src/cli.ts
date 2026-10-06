#!/usr/bin/env node
import { text, cancel } from '@clack/prompts';
import { dirname, join, resolve } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { runTui, enumerateAvailableModels, AGENT_NAMES } from './tui.js';
import { installTeam } from './installTeam.js';
import { resolveDefault } from './defaults.js';
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
  const positional = args.filter((arg) => !arg.startsWith('-'));
  const target = await resolveTarget(positional[0]);

  const configPath = join(target, '.opencode', 'team.config.json');
  let existing: TeamConfig = {};
  if (existsSync(configPath)) {
    existing = JSON.parse(readFileSync(configPath, 'utf8')) as TeamConfig;
  }

  let config: TeamConfig;
  let overwrite: Record<string, boolean>;
  if (useDefaults) {
    const available = enumerateAvailableModels();
    config = {};
    overwrite = {};
    for (const name of AGENT_NAMES) {
      const choice = resolveDefault(name, available);
      if (choice) config[name] = choice;
      overwrite[name] = true;
    }
    console.log('Default configuration (from models available to this opencode install):');
    for (const name of AGENT_NAMES) {
      const choice = config[name];
      console.log(`  ${name}: ${choice?.model ?? 'unset'}${choice?.reasoningEffort ? ` @ ${choice.reasoningEffort}` : ''}`);
    }
    console.log();
    if (!config.ux?.model) {
      console.log('No recommended Sol model is available for UX. An unset UX model inherits opencode’s current model; select a suitable model explicitly before running design work.');
    }
  } else {
    const tui = await runTui({ existing });
    config = tui.config;
    overwrite = tui.overwrite;
  }

  const result = installTeam({ definitionsDir, skillDir, config, targetDir: target, overwrite });

  console.log(`\nInstalled into ${target}`);
  for (const path of result.written) console.log(`  wrote  ${path}`);
  for (const path of result.preserved) console.log(`  kept   ${path} (instructions preserved)`);
  for (const path of result.skillPaths) console.log(`  wrote  ${path}`);
  console.log(`  wrote  ${result.configPath}`);
  console.log('\nNext: use Planner with /wayfinder, /refine, /plan or /project-setup; use Lead with /autonomous-implement for ready Tickets.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
