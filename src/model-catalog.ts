export interface ModelEntry {
  provider: string;
  model: string;
}

const ANSI_RE = /\x1b\[[0-9;]*m/g;

const CREDENTIAL_ALIASES: Record<string, string> = {
  'opencode-zen': 'opencode',
  'opencode-go': 'opencode-go',
};

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function stripAnsi(output: string): string {
  return output.replace(ANSI_RE, '');
}

export function parseAuthList(output: string): string[] {
  const ids = new Set<string>();
  for (const line of stripAnsi(output).split('\n')) {
    const bullet = line.includes('●') ? line : undefined;
    if (!bullet) continue;
    const name = bullet
      .replace('●', '')
      .trim()
      .replace(/\s+(api|provider)$/i, '')
      .trim();
    if (!name) continue;
    const slug = slugify(name);
    ids.add(CREDENTIAL_ALIASES[slug] ?? slug);
  }
  return [...ids];
}

export function parseModels(output: string): ModelEntry[] {
  const entries: ModelEntry[] = [];
  for (const line of stripAnsi(output).split('\n')) {
    const match = line.trim().match(/^([\w.-]+)\/([\w.-]+)$/);
    if (match) {
      entries.push({ provider: match[1], model: match[2] });
    }
  }
  return entries;
}

export function availableModels(authListOutput: string, modelsOutput: string): string[] {
  const authed = new Set(parseAuthList(authListOutput));
  return parseModels(modelsOutput)
    .filter((entry) => authed.has(entry.provider))
    .map((entry) => `${entry.provider}/${entry.model}`);
}

const EFFORT_BY_PROVIDER: Record<string, string[]> = {
  google: ['minimal', 'low', 'medium', 'high'],
  openai: ['none', 'minimal', 'low', 'medium', 'high', 'xhigh'],
  deepseek: ['none', 'low', 'medium', 'high'],
  anthropic: ['none', 'high', 'max'],
};

export function deriveEffortLevels(provider: string): string[] {
  return EFFORT_BY_PROVIDER[provider] ?? ['none', 'low', 'medium', 'high'];
}