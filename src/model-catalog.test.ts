import { describe, it, expect } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  parseAuthList,
  parseModels,
  availableModels,
  deriveEffortLevels,
  stripAnsi,
  detectEnvProviders,
  detectConfigProviders,
} from './model-catalog.js';

const REAL_AUTH_OUTPUT = `\u001b[0m
┌  Credentials \u001b[90m~/.local/share/opencode/auth.json
│
●  OpenCode Zen \u001b[90mapi
│
●  OpenCode Go \u001b[90mapi
│
●  OpenAI \u001b[90moauth
│
└  2 credentials
`;

const REAL_MODELS_OUTPUT = `meta/llama-4
opencode/big-pickle
opencode/claude-fable-5
opencode-go/deepseek-v4-flash
opencode-go/deepseek-v4-pro
opencode-go/glm-5.1
`;

describe('parseAuthList', () => {
  it('extracts authed provider ids from the real opencode output', () => {
    expect(parseAuthList(REAL_AUTH_OUTPUT)).toEqual(['opencode', 'opencode-go', 'openai']);
  });
});

describe('parseModels', () => {
  it('parses provider/model lines', () => {
    expect(parseModels(REAL_MODELS_OUTPUT)).toEqual([
      { provider: 'meta', model: 'llama-4' },
      { provider: 'opencode', model: 'big-pickle' },
      { provider: 'opencode', model: 'claude-fable-5' },
      { provider: 'opencode-go', model: 'deepseek-v4-flash' },
      { provider: 'opencode-go', model: 'deepseek-v4-pro' },
      { provider: 'opencode-go', model: 'glm-5.1' },
    ]);
  });
});

describe('availableModels', () => {
  it('returns only models from authed providers', () => {
    expect(availableModels(REAL_AUTH_OUTPUT, REAL_MODELS_OUTPUT)).toEqual([
      'opencode/big-pickle',
      'opencode/claude-fable-5',
      'opencode-go/deepseek-v4-flash',
      'opencode-go/deepseek-v4-pro',
      'opencode-go/glm-5.1',
    ]);
  });
});

describe('deriveEffortLevels', () => {
  it('supports verified max effort for Luna and GLM without enabling it for every model', () => {
    expect(deriveEffortLevels('openai', 'openai/gpt-6-luna')).toEqual(['none', 'low', 'medium', 'high', 'xhigh', 'max']);
    expect(deriveEffortLevels('openai', 'openai/gpt-5.6-luna')).toContain('max');
    expect(deriveEffortLevels('opencode-go', 'opencode-go/glm-5.2')).toEqual(['high', 'max']);
    expect(deriveEffortLevels('openai', 'openai/gpt-5.4')).not.toContain('max');
  });
  it('maps google to thinkingLevel levels', () => {
    expect(deriveEffortLevels('google')).toEqual(['minimal', 'low', 'medium', 'high']);
  });
  it('maps openai to full reasoning effort range', () => {
    expect(deriveEffortLevels('openai')).toEqual(['none', 'minimal', 'low', 'medium', 'high', 'xhigh']);
  });
  it('maps deepseek to a short range', () => {
    expect(deriveEffortLevels('deepseek')).toEqual(['none', 'low', 'medium', 'high']);
  });
  it('maps anthropic to none/high/max', () => {
    expect(deriveEffortLevels('anthropic')).toEqual(['none', 'high', 'max']);
  });
  it('defaults unknown providers to a sane range', () => {
    expect(deriveEffortLevels('meta')).toEqual(['none', 'low', 'medium', 'high']);
  });
});

describe('stripAnsi', () => {
  it('removes ANSI escape sequences', () => {
    expect(stripAnsi('\u001b[90mhello\u001b[0m')).toBe('hello');
  });
});

describe('detectEnvProviders', () => {
  it('detects providers from env vars', () => {
    const env = { META_MODEL_API_KEY: 'x', ANTHROPIC_API_KEY: 'y' } as NodeJS.ProcessEnv;
    expect(detectEnvProviders(env)).toEqual(expect.arrayContaining(['meta', 'anthropic']));
  });

  it('returns empty when no provider keys are set', () => {
    expect(detectEnvProviders({} as NodeJS.ProcessEnv)).toEqual([]);
  });
});

describe('availableModels with env providers', () => {
  it('includes models from env-detected providers', () => {
    const models = 'meta/muse-spark-1.3-contributor\nopencode-go/deepseek-v4-pro\n';
    expect(availableModels('', models, ['meta'])).toEqual(['meta/muse-spark-1.3-contributor']);
  });

  it('includes OpenAI models when auth list labels credentials as OAuth', () => {
    const models = 'openai/gpt-6-astra\nmeta/muse-spark-1.3\nopencode/muse-spark-1.3\n';
    expect(availableModels(REAL_AUTH_OUTPUT, models)).toEqual([
      'openai/gpt-6-astra',
      'opencode/muse-spark-1.3',
    ]);
  });
});

describe('detectConfigProviders', () => {
  it('reads providers with an apiKey from a jsonc config', () => {
    const dir = mkdtempSync(join(tmpdir(), 'oc-config-'));
    const file = join(dir, 'opencode.jsonc');
    writeFileSync(
      file,
      `{
  // a comment
  "provider": {
    "meta": {
      "options": {
        "apiKey": "{file:~/.config/opencode/meta-api-key}",
      },
    },
    "unauthed": { "npm": "@ai-sdk/foo" },
  },
}`,
    );
    try {
      expect(detectConfigProviders([file])).toEqual(['meta']);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('returns empty for missing or unparseable files', () => {
    expect(detectConfigProviders([join(tmpdir(), 'does-not-exist.json')])).toEqual([]);
  });
});
