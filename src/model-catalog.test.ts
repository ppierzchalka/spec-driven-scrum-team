import { describe, it, expect } from 'vitest';
import {
  parseAuthList,
  parseModels,
  availableModels,
  deriveEffortLevels,
  stripAnsi,
} from './model-catalog.js';

const REAL_AUTH_OUTPUT = `\u001b[0m
┌  Credentials \u001b[90m~/.local/share/opencode/auth.json
│
●  OpenCode Zen \u001b[90mapi
│
●  OpenCode Go \u001b[90mapi
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
    expect(parseAuthList(REAL_AUTH_OUTPUT)).toEqual(['opencode', 'opencode-go']);
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