import { describe, expect, it } from 'vitest';
import { promptResult, SetupCancelledError } from './prompts.js';
describe('native prompt lifecycle', () => {
  it('treats terminal cancellation as a clean setup exit rather than a stack trace', async () => {
    const error = new Error('User force closed prompt'); error.name = 'ExitPromptError';
    await expect(promptResult(() => Promise.reject(error))).rejects.toBeInstanceOf(SetupCancelledError);
  });
  it('preserves real errors and valid answers', async () => {
    const error = new Error('Cannot read directory');
    await expect(promptResult(() => Promise.reject(error))).rejects.toBe(error);
    expect(await promptResult(() => Promise.resolve(['a', 'b']))).toEqual(['a', 'b']);
  });
});
