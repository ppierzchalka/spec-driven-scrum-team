import React, { useEffect, useState } from 'react';
import { Text, useApp, useInput, useStdout } from 'ink';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FakeStdout, KEYS, renderTree, stripAnsi, type Rendered } from './testSupport.js';

const live: Rendered[] = [];
afterEach(() => { while (live.length) live.pop()?.stop(); });
function mount(tree: React.ReactElement, timeoutMs?: number): Rendered {
  const rendered = renderTree(tree, { timeoutMs });
  live.push(rendered);
  return rendered;
}

describe('observable rendered test support', () => {
  it('implements both Node write callback signatures without empty frame snapshots', () => {
    const stdout = new FakeStdout();
    const callback = vi.fn();
    expect(stdout.write('content', callback)).toBe(true);
    stdout.write('', 'utf8', callback);
    stdout.write(Buffer.from('bytes'), 'utf8', callback);
    expect(callback.mock.calls).toEqual([[null], [null], [null]]);
    expect(stdout.frames).toEqual(['content', 'bytes']);
  });

  it('acknowledges ignored keys even when no new content frame is written', async () => {
    const rendered = mount(<Text>unchanged</Text>);
    await rendered.ready();
    const before = rendered.stdout.frames.length;
    expect(stripAnsi(await rendered.send(KEYS.down))).toContain('unchanged');
    expect(rendered.stdout.frames).toHaveLength(before);
    await rendered.app.waitUntilRenderFlush();
    expect(rendered.stdout.frames).toHaveLength(before);
  });

  it('serializes inputs against the latest state-dependent handler, including bare Esc then Enter', async () => {
    const seen: string[] = [];
    function Ordered() {
      const [state, setState] = useState('start');
      useInput((input, key) => {
        seen.push(`${state}:${key.escape ? 'esc' : key.return ? 'enter' : input}`);
        setState(key.escape ? 'dialog' : key.return ? 'restored' : input);
      });
      return <Text>{state}</Text>;
    }
    const rendered = mount(<Ordered />);
    // Also covers sending before explicit ready and concurrently queued callers.
    await Promise.all([rendered.send('a'), rendered.send('b')]);
    expect(seen).toEqual(['start:a', 'a:b']);
    await Promise.all([rendered.send(KEYS.esc), rendered.send(KEYS.enter)]);
    expect(seen.slice(2)).toEqual(['b:esc', 'dialog:enter']);
    expect(stripAnsi(rendered.frame())).toContain('restored');
  });

  it('flushes chained passive effects and resized layout', async () => {
    function Chained() {
      const [step, setStep] = useState(0);
      const { stdout } = useStdout();
      const terminal = stdout as NodeJS.WriteStream;
      const [columns, setColumns] = useState(terminal.columns);
      useEffect(() => { if (step < 4) setStep(step + 1); }, [step]);
      useEffect(() => {
        const resize = () => setColumns(terminal.columns);
        stdout.on('resize', resize);
        return () => { stdout.off('resize', resize); };
      }, [stdout]);
      return <Text>step={step} columns={columns}</Text>;
    }
    const rendered = mount(<Chained />);
    expect(stripAnsi(await rendered.ready())).toContain('step=4 columns=100');
    expect(stripAnsi(await rendered.resize(60, 12))).toContain('step=4 columns=60');
  });

  it('does not confuse a deferred async operation with completion', async () => {
    let resolve!: () => void;
    const pending = new Promise<void>((done) => { resolve = done; });
    let completed = false;
    function Deferred() {
      const [status, setStatus] = useState('pending');
      useEffect(() => { void pending.then(() => { completed = true; setStatus('complete'); }); }, []);
      return <Text>{status}</Text>;
    }
    const rendered = mount(<Deferred />);
    expect(stripAnsi(await rendered.ready())).toContain('pending');
    await rendered.settle();
    expect(completed).toBe(false);
    resolve();
    expect(stripAnsi(await rendered.waitFor(() => completed, 'deferred completion'))).toContain('complete');
  });

  it('settles an acknowledged final key and quit result after app-controlled unmount', async () => {
    let done = false;
    function Quit() {
      const { exit } = useApp();
      useInput(() => { done = true; exit(); });
      return <Text>quit snapshot</Text>;
    }
    const rendered = mount(<Quit />);
    await rendered.ready();
    expect(stripAnsi(await rendered.send('Q'))).toContain('quit snapshot');
    await rendered.waitFor(() => done, 'quit result');
    expect(rendered.stdin.isRaw).toBe(false);
  });

  it('bounds a stalled flush with the same overall deadline', async () => {
    const rendered = mount(<Text>stalled flush sentinel</Text>, 40);
    await rendered.ready();
    const flush = vi.spyOn(rendered.app, 'waitUntilRenderFlush').mockImplementation(() => new Promise(() => {}));
    try {
      await expect(rendered.settle()).rejects.toThrow(/Timed out after 40ms.*render\/effect settlement[\s\S]*stalled flush sentinel/);
      expect(flush).toHaveBeenCalledTimes(1);
    } finally {
      flush.mockRestore();
    }
  });

  it('bounds impossible completion and unparsed input with last frame and revision diagnostics', async () => {
    const rendered = mount(<Text>diagnostic sentinel</Text>, 40);
    await rendered.ready();
    await expect(rendered.waitFor(() => false, 'missing install result')).rejects.toThrow(/Timed out after 40ms.*missing install result.*inputRevision=0[\s\S]*diagnostic sentinel/);
    await expect(rendered.send('')).rejects.toThrow(/parsed input.*inputRevision=0[\s\S]*diagnostic sentinel/);
  });

  it('cancels its owned deadline and restores raw mode/subscriptions on teardown', async () => {
    const rendered = mount(<Text>teardown</Text>);
    await rendered.ready();
    expect(rendered.stdin.isRaw).toBe(true);
    expect(rendered.stdin.listenerCount('readable')).toBeGreaterThan(0);
    const scheduled = vi.spyOn(globalThis, 'setTimeout');
    const cleared = vi.spyOn(globalThis, 'clearTimeout');
    try {
      const pending = rendered.waitFor(() => false, 'cancelled operation');
      const index = scheduled.mock.calls.findIndex((call) => call[1] === 2000);
      const ownedTimer = scheduled.mock.results[index]?.value;
      rendered.stop();
      await expect(pending).rejects.toThrow(/Stopped.*cancelled operation/);
      expect(ownedTimer).toBeDefined();
      expect(cleared).toHaveBeenCalledWith(ownedTimer);
    } finally {
      scheduled.mockRestore();
      cleared.mockRestore();
    }
    rendered.stop();
    expect(rendered.stdin.isRaw).toBe(false);
    expect(rendered.stdin.listenerCount('readable')).toBe(0);
    expect(rendered.stdout.listenerCount('resize')).toBe(0);
  });
});
