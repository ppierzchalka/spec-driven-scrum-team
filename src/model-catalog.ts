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

export function availableModels(
  authListOutput: string,
  modelsOutput: string,
  extraProviders: string[] = [],
): string[] {
  const authed = new Set([...parseAuthList(authListOutput), ...extraProviders]);
  return parseModels(modelsOutput)
    .filter((entry) => authed.has(entry.provider))
    .map((entry) => `${entry.provider}/${entry.model}`);
}

const ENV_PROVIDER_KEYS: Record<string, string[]> = {
  OPENAI_API_KEY: ['openai'],
  ANTHROPIC_API_KEY: ['anthropic'],
  GOOGLE_API_KEY: ['google', 'google-vertex'],
  GEMINI_API_KEY: ['google'],
  DEEPSEEK_API_KEY: ['deepseek'],
  META_MODEL_API_KEY: ['meta'],
  GROQ_API_KEY: ['groq'],
  OPENROUTER_API_KEY: ['openrouter'],
  XAI_API_KEY: ['xai'],
  MISTRAL_API_KEY: ['mistral'],
  GITHUB_API_KEY: ['github-copilot'],
};

export function detectEnvProviders(env: NodeJS.ProcessEnv = process.env): string[] {
  const providers = new Set<string>();
  for (const [key, ids] of Object.entries(ENV_PROVIDER_KEYS)) {
    if (env[key]) {
      for (const id of ids) providers.add(id);
    }
  }
  return [...providers];
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