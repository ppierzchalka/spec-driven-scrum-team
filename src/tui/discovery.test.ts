import { describe, it, expect } from 'vitest';
import { cancelDiscovery, discoverModels, execBounded } from './discovery.js';
import type { ExecFn } from './discovery.js';

const MODELS = 'opencode/big-pickle\nopencode-go/deepseek-v4-pro\n';
const AUTH = '● OpenCode Go API\n● OpenAI OAuth\n';

describe('async provider discovery', () => {
  it('derives model IDs without executing auth export', async () => {
    const calls: string[][] = [];
    const exec: ExecFn = async (cmd, args) => {
      calls.push([cmd, ...args]);
      if (args.join(' ') === 'auth list') return { stdout: AUTH, stderr: '' };
      return { stdout: MODELS, stderr: '' };
    };
    const result = await discoverModels(exec, {});
    expect(calls).toEqual([
      ['opencode', 'auth', 'list'],
      ['opencode', 'models'],
    ]);
    expect(calls.flat().join(' ')).not.toContain('export');
    expect(result.models).toContain('opencode-go/deepseek-v4-pro');
    expect(result.detail).toContain('1 model');
  });

  it('never surfaces raw stdout or stderr in the UI detail', async () => {
    const secret = 'sk-secret-abcdef';
    const exec: ExecFn = async () => ({ stdout: secret, stderr: 'FATAL: ' + secret });
    const result = await discoverModels(exec, {});
    expect(JSON.stringify(result)).not.toContain(secret);
    expect(result.models).toEqual([]);
    expect(result.detail).toContain('No configured providers');
  });

  it('treats command failure as an empty catalog, not a crash', async () => {
    const exec: ExecFn = async () => {
      throw new Error('opencode not installed');
    };
    await expect(discoverModels(exec, {})).rejects.toThrow();
  });

  it('kills in-flight probes on cancel so quit never orphans children', async () => {
    const started = Date.now();
    const pending = execBounded('sleep', ['30'], 25000);
    await new Promise((resolve) => setTimeout(resolve, 200));
    cancelDiscovery();
    const result = await pending;
    expect(Date.now() - started).toBeLessThan(10000);
    expect(result).toEqual({ stdout: '', stderr: '' });
  });
});
