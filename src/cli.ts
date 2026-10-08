#!/usr/bin/env node
import { confirm, cancel, intro, note } from './prompts.js';
import { dirname, join, resolve } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { runTui, selectHarness, enumerateAvailableModels, AGENT_NAMES } from './tui.js';
import { installBatch, type TargetPlan, type TargetResult } from './installBatch.js';
import { browseTargets, normalizeTargets } from './target-picker.js';
import { conflictingSkills } from './installTeam.js';
import { resolveDefault } from './defaults.js';
import { HARNESS_LAYOUTS, isHarness } from './harness.js';
import { readToadySettings, loadToadyRulesFile, toadyStatePath, personalSettingsPath } from './toady.js';
import { checkInstallPath } from './installPaths.js';
import type { TeamConfig } from './types.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const definitionsDir = join(root, 'agents');
const skillDir = join(root, 'skills', 'autonomous-implement');

function reportTarget(harness: string, { target, team: result, personaPaths }: TargetResult): void {
  console.log(`\nInstalled ${harness} into ${target}`);
  for (const path of personaPaths) console.log(`  wrote  ${path}`);
  for (const path of result.written) console.log(`  wrote  ${path}`);
  for (const path of result.preserved) console.log(`  kept   ${path} (instructions preserved)`);
  for (const path of result.skillPaths) console.log(`  wrote  ${path}`);
  console.log(`  wrote  ${result.configPath}`);
  for (const path of result.removed) console.log(`  removed ${path} (unchanged retired definition)`);
  for (const path of result.legacyPreserved) console.log(`  kept   ${path} (custom/unrecognized legacy definition; migrate to analyst before removing)`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const useDefaults = args.includes('--defaults') || args.includes('-d');
  const harnessFlag = args.find((arg) => arg.startsWith('--harness='));
  const harnessName = harnessFlag?.slice('--harness='.length);
  if (harnessName && !isHarness(harnessName)) throw new Error('Unknown harness: ' + harnessName);
  const positional = args.filter((arg) => !arg.startsWith('-'));
  if (useDefaults && !positional.length) throw new Error('Provide target folders with --defaults, or run setup without --defaults to browse');
  if (!useDefaults) { intro('Spec-Driven Scrum Team'); note('Select the repositories to configure.', 'Step 1 of 4 — Targets'); }
  const targets = positional.length ? normalizeTargets(positional) : await browseTargets();
  const target = targets[0];
  console.log(`Selected ${targets.length} target(s):\n${targets.map(path => '  ' + path).join('\n')}`);
  if (targets.length > 1 && !useDefaults) console.log(`One shared profile will be applied to all targets. Agent settings come from ${target}; the final Install step applies your selected models, prompt overwrite and one personal persona/rules profile. Native provider settings and operator controls remain per repo.`);
  if (!useDefaults) note('Choose a harness, then configure its agents and models.', 'Step 2 of 4 — Agents and models');
  const harness = harnessName && isHarness(harnessName) ? harnessName : useDefaults ? 'opencode' : await selectHarness();
  console.log('Persona and additional rules use private user configuration and apply across projects in this harness. Agent definitions and skills remain per repository.');
  const savedPersonas = targets.map(path => readToadySettings(path, harness));

  const configPath = join(target, HARNESS_LAYOUTS[harness].config);
  checkInstallPath(target, configPath);
  let existing: TeamConfig = {};
  if (existsSync(configPath)) {
    existing = JSON.parse(readFileSync(configPath, 'utf8')) as TeamConfig;
  }

  if (args.includes('--toady') && args.includes('--no-toady')) throw new Error('Choose --toady or --no-toady');
  const toadySettings = savedPersonas[0];
  let toadyMode = toadySettings.enabled;
  let toadyRules = toadySettings.projectRules;
  const rulesFlags = args.filter(arg => arg.startsWith('--additional-rules=') || arg.startsWith('--toady-rules='));
  if (rulesFlags.length > 1) throw new Error('Choose one additional rules file');
  const rulesFlag = rulesFlags[0];
  const clearRules = args.includes('--clear-additional-rules') || args.includes('--clear-toady-rules');
  if (rulesFlag && clearRules) throw new Error('Choose an additional rules file or clear rules');
  if (rulesFlag) toadyRules = loadToadyRulesFile(resolve(rulesFlag.slice(rulesFlag.indexOf('=') + 1)));
  if (clearRules) toadyRules = '';
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
    const tui = await runTui({ existing, harness, toadyMode, toadyRules, targets });
    config = tui.config;
    overwrite = tui.overwrite;
    toadyMode = tui.toadyMode ?? false;
    toadyRules = tui.toadyRules ?? toadyRules;
  }

  const plans: TargetPlan[] = targets.map(path => {
    // Personal settings are one user profile; the first target seeds legacy migration.
    const enabled = useDefaults ? args.includes('--toady') ? true : args.includes('--no-toady') ? false : savedPersonas[0].enabled : toadyMode;
    const rules = useDefaults ? rulesFlag ? toadyRules : clearRules ? '' : savedPersonas[0].projectRules : toadyRules;
    const configurePersona = enabled || rules.trim().length > 0 || clearRules || existsSync(join(path, toadyStatePath(harness))) || existsSync(personalSettingsPath(harness)) || args.includes('--no-toady');
    return {
      options: { definitionsDir, skillDir, config, targetDir: path, overwrite, harness, replaceSkills: args.includes('--replace-skills') },
      persona: configurePersona ? { enabled, rules } : undefined,
    };
  });
  const collisions = plans.flatMap(plan => conflictingSkills(plan.options).map(name => `${plan.options.targetDir}: ${name}`));
  if (collisions.length && !args.includes('--replace-skills') && !useDefaults) {
    const answer = await confirm({ message: `Adopt/replace unowned skill folders: ${collisions.join(', ')}? Existing skill contents may be overwritten.`, initialValue: false });
    if (answer !== true) throw new Error('Installation cancelled; no files written.');
    for (const plan of plans) plan.options.replaceSkills = true;
  }
  installBatch(plans, result => reportTarget(harness, result));
  console.log(`\nCompleted ${targets.length} target(s). Shared skills refreshed; unrelated harnesses and .gitignore untouched.`);
  console.log('\nNext: use Analyst with /project-setup, /wayfinder, /slice or /refine; /plan is optional; use Lead with /autonomous-implement for ready Tickets.');
}

main().catch((error) => {
  if (error instanceof Error && error.name === 'SetupCancelledError') { cancel('Cancelled.'); process.exit(0); }
  console.error(error);
  process.exit(1);
});
