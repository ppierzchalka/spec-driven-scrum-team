import { autocomplete, select, text, intro, outro, cancel, note } from '@clack/prompts';
import { execFileSync } from 'node:child_process';
import { availableModels, deriveEffortLevels, detectEnvProviders, detectConfigProviders } from './model-catalog.js';
import { migratePlannerConfig, seedDefaults, resolveDefault, resetAgent, resetAllToDefaults } from './defaults.js';
import type { TeamConfig } from './types.js';
import { HARNESS_NAMES, supportsEffort, type Harness } from './harness.js';

export const AGENT_NAMES = ['analyst', 'lead', 'architect', 'security', 'ux', 'tester', 'developer', 'reviewer'] as const;

export async function selectHarness(): Promise<Harness> {
  return guard(await select<Harness>({
    message: 'Install for which harness?',
    options: HARNESS_NAMES.map((value) => ({ value, label: value })),
  }));
}

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
    [...detectEnvProviders(), ...detectConfigProviders()],
  );
}

function currentHint(choice: { model?: string; reasoningEffort?: string } | undefined): string {
  if (!choice?.model) return 'unset (inherit harness model)';
  return choice.reasoningEffort ? `${choice.model} @ ${choice.reasoningEffort}` : choice.model;
}

async function pickModel(
  name: string,
  config: TeamConfig,
  models: string[],
  harness: Harness,
): Promise<void> {
  if (harness === 'antigravity') {
    const model = guard(await select<string>({
      message: `Model tier for ${name} (Antigravity)`,
      options: [
        { value: 'inherit', label: 'Inherit session model' },
        { value: 'flash', label: 'Flash' },
        { value: 'pro', label: 'Pro' },
      ],
    }));
    config[name] = { ...config[name], model: model === 'inherit' ? undefined : model };
    return;
  }
  if (harness !== 'opencode') {
    const model = guard(await text({
      message: `Native model ID for ${name} (${harness}); blank = inherit`,
      initialValue: config[name]?.model ?? '',
    })).trim();
    config[name] = { ...config[name], model: model || undefined };
    return;
  }
  const choice = guard(
    await autocomplete<string>({
      message: `Model for ${name}`,
      placeholder: 'Type to search models or providers…',
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
    const levels = deriveEffortLevels(provider, model);
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
  const levels = deriveEffortLevels(provider, current.model);
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
  harness: Harness,
): Promise<void> {
  let back = false;
  while (!back) {
    const current = config[name] ?? {};
    const defaultChoice = harness === 'opencode' ? resolveDefault(name, models) : undefined;
    const option = guard(
      await select<string>({
        message: `${name} — ${currentHint(current)}`,
        options: [
          { value: 'model', label: 'Model', hint: current.model ?? 'unset (inherit harness model)' },
          ...(supportsEffort(harness) ? [{ value: 'effort', label: 'Reasoning effort', hint: current.reasoningEffort ?? 'not set' }] : []),
          ...(harness === 'antigravity' ? [{ value: 'tools', label: 'Additional native tools', hint: current.additionalTools?.join(', ') || 'none; configure MCP servers in native agent file' }] : []),
          { value: 'overwrite', label: 'Overwrite instructions', hint: overwrite[name] ? 'yes (canonical prompt)' : 'no (keep my edits)' },
          { value: 'reset', label: harness === 'opencode' ? 'Reset to default' : 'Reset to inherited model', hint: defaultChoice ? `${defaultChoice.model}${defaultChoice.reasoningEffort ? ` @ ${defaultChoice.reasoningEffort}` : ''}` : 'no default available' },
          { value: 'back', label: 'Back' },
        ],
      }),
    );
    switch (option) {
      case 'model':
        await pickModel(name, config, models, harness);
        break;
      case 'tools': {
        const tools = guard(await text({
          message: 'Additional Antigravity tool names (comma-separated); use names exposed by your runtime',
          initialValue: current.additionalTools?.join(', ') ?? '',
        }));
        config[name] = { ...current, additionalTools: [...new Set(tools.split(',').map((tool) => tool.trim()).filter(Boolean))] };
        break;
      }
      case 'effort':
        await pickEffort(name, config);
        break;
      case 'overwrite':
        overwrite[name] = !overwrite[name];
        break;
      case 'reset': {
        const reset = harness === 'opencode' ? resetAgent(config, name, models) : undefined;
        if (harness !== 'opencode') config[name] = {};
        note(harness !== 'opencode' ? `Reset ${name} to inheritance.` : reset ? `Reset ${name} to ${reset.model}${reset.reasoningEffort ? ` @ ${reset.reasoningEffort}` : ''}.` : `No default available for ${name} — keeping current choice.`);
        break;
      }
      case 'back':
        back = true;
        break;
    }
  }
}

export async function runTui(options: { existing: TeamConfig; harness?: Harness }): Promise<TuiResult> {
  intro('Spec-Driven Scrum Team');

  const harness = options.harness ?? 'opencode';
  const models = harness === 'opencode' ? enumerateAvailableModels() : [];
  const existing = migratePlannerConfig(options.existing);
  const config = harness === 'opencode' ? seedDefaults(existing, models) : existing;
  if (harness === 'opencode' && !config.ux?.model) {
    note('No recommended Sol model is available for UX. An unset UX model inherits opencode’s current model; select a suitable model explicitly before running design work.', 'UX model selection');
  }
  const overwrite: Record<string, boolean> = {};
  for (const name of AGENT_NAMES) overwrite[name] = true;

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
          { value: '__reset_all__', label: harness === 'opencode' ? 'Reset all to defaults' : 'Reset all to inherited models', hint: 'discard manual model picks' },
          { value: '__install__', label: 'Install & exit', hint: 'write files into the target repo' },
        ],
      }),
    );
    if (agent === '__install__') {
      done = true;
      break;
    }
    if (agent === '__reset_all__') {
      const reset = harness === 'opencode' ? resetAllToDefaults(config, AGENT_NAMES, models) : AGENT_NAMES.map((name) => { config[name] = {}; return name; });
      note(reset.length > 0
        ? `Reset to defaults: ${reset.join(', ')}.`
        : 'No defaults available for resolved models — nothing changed.');
      continue;
    }
    await configureAgent(agent, config, overwrite, models, harness);
  }

  outro('Install complete.');
  return { config, overwrite };
}
