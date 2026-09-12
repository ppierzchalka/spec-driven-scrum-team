#!/usr/bin/env node
import { text, cancel } from '@clack/prompts';
import { dirname, join, resolve } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { runTui } from './tui.js';
import { installTeam } from './installTeam.js';
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
  const target = await resolveTarget(process.argv[2]);

  const configPath = join(target, '.opencode', 'team.config.json');
  let existing: TeamConfig = {};
  if (existsSync(configPath)) {
    existing = JSON.parse(readFileSync(configPath, 'utf8')) as TeamConfig;
  }

  const { config, overwrite } = await runTui({ existing });
  const result = installTeam({ definitionsDir, skillDir, config, targetDir: target, overwrite });

  console.log(`\nInstalled into ${target}`);
  for (const path of result.written) console.log(`  wrote  ${path}`);
  for (const path of result.preserved) console.log(`  kept   ${path} (instructions preserved)`);
  console.log(`  wrote  ${result.skillPath}`);
  console.log(`  wrote  ${result.configPath}`);
  console.log('\nNext: open a fresh opencode session in the target repo and run /autonomous-implement.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});