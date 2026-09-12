import { select, text, intro, outro, cancel } from '@clack/prompts';
import { execFileSync } from 'node:child_process';
import { availableModels, deriveEffortLevels, detectEnvProviders } from './model-catalog.js';
import type { TeamConfig } from './types.js';

export const AGENT_NAMES = ['lead', 'architect', 'security', 'ux', 'tester', 'developer', 'reviewer'] as const;

export interface TuiResult {
  config: TeamConfig;
  overwrite: Record<string, boolean>;
}

function guard<T>(value: T | symbol): T {
  if (typeof value === 'symbol') {
    cancel('Cancelled.');
    process.exit(0);
  }
  return value as T;
}

function safeExec(cmd: string, args: string[]): string {
  try {
    return execFileSync(cmd, args, { encoding: 'utf8' });
  } catch {
    return '';
  }
}

export function enumerateAvailableModels(): string[] {
  return availableModels(
    safeExec('opencode', ['auth', 'list']),
    safeExec('opencode', ['models']),
    detectEnvProviders(),
  );
}

function currentHint(choice: { model?: string; reasoningEffort?: string } | undefined): string {
  if (!choice?.model) return 'unset (opencode default)';
  return choice.reasoningEffort ? `${choice.model} @ ${choice.reasoningEffort}` : choice.model;
}

async function pickModel(
  name: string,
  config: TeamConfig,
  models: string[],
): Promise<void> {
  const choice = guard(
    await select<string>({
      message: `Model for ${name}`,
      options: [
        { value: '__unset__', label: "Don't set (use opencode's current model)" },
        ...models.map((m) => ({ value: m, label: m })),
        { value: '__custom__', label: 'Type your own model id…' },
      ],
    }),
  );
  let model: string | undefined;
  if (choice === '__custom__') {
    const typed = guard(
      await text({
        message: 'Model id (e.g. google/gemini-3.6-flash)',
        validate: (value) => (value?.trim() ? undefined : 'Required'),
      }),
    );
    model = typed.trim();
  } else if (choice !== '__unset__') {
    model = choice;
  }

  const current = config[name] ?? {};
  if (model) {
    config[name] = { ...current, model };
    const provider = model.split('/')[0];
    const levels = deriveEffortLevels(provider);
    if (current.reasoningEffort && !levels.includes(current.reasoningEffort)) {
      config[name] = { ...config[name], reasoningEffort: undefined };
    }
  } else {
    config[name] = { ...current, model: undefined };
  }
}

async function pickEffort(name: string, config: TeamConfig): Promise<void> {
  const current = config[name] ?? {};
  const provider = current.model?.split('/')[0] ?? 'unknown';
  const levels = deriveEffortLevels(provider);
  const choice = guard(
    await select<string>({
      message: `Reasoning effort for ${name} (${current.model ?? 'unset model'})`,
      options: [
        { value: '__unset__', label: "Don't set" },
        ...levels.map((l) => ({ value: l, label: l })),
      ],
    }),
  );
  config[name] = { ...current, reasoningEffort: choice === '__unset__' ? undefined : choice };
}

async function configureAgent(
  name: string,
  config: TeamConfig,
  overwrite: Record<string, boolean>,
  models: string[],
): Promise<void> {
  let back = false;
  while (!back) {
    const current = config[name] ?? {};
    const option = guard(
      await select<string>({
        message: `${name} — ${currentHint(current)}`,
        options: [
          { value: 'model', label: 'Model', hint: current.model ?? 'unset (opencode default)' },
          { value: 'effort', label: 'Reasoning effort', hint: current.reasoningEffort ?? 'not set' },
          { value: 'overwrite', label: 'Overwrite instructions', hint: overwrite[name] ? 'yes (canonical prompt)' : 'no (keep my edits)' },
          { value: 'back', label: 'Back' },
        ],
      }),
    );
    switch (option) {
      case 'model':
        await pickModel(name, config, models);
        break;
      case 'effort':
        await pickEffort(name, config);
        break;
      case 'overwrite':
        overwrite[name] = !overwrite[name];
        break;
      case 'back':
        back = true;
        break;
    }
  }
}

export async function runTui(options: { existing: TeamConfig }): Promise<TuiResult> {
  intro('Spec-Driven Scrum Team');

  const config: TeamConfig = structuredClone(options.existing);
  const overwrite: Record<string, boolean> = {};
  for (const name of AGENT_NAMES) overwrite[name] = true;

  const models = enumerateAvailableModels();

  let done = false;
  while (!done) {
    const agent = guard(
      await select<string>({
        message: 'Select an agent to configure',
        options: [
          ...AGENT_NAMES.map((name) => ({
            value: name,
            label: name,
            hint: currentHint(config[name]),
          })),
          { value: '__install__', label: 'Install & exit', hint: 'write files into the target repo' },
        ],
      }),
    );
    if (agent === '__install__') {
      done = true;
      break;
    }
    await configureAgent(agent, config, overwrite, models);
  }

  outro('Install complete.');
  return { config, overwrite };
}