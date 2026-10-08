import { afterEach, describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { PassThrough } from 'node:stream';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { TargetFolderPrompt, normalizeTargets } from './target-picker.js';
const roots: string[] = [];
function workspace(): string { const root = mkdtempSync(join(tmpdir(), 'target-picker-')); roots.push(root); return root; }
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }); });

function picker(root: string) {
  const input = new PassThrough();
  const output = new PassThrough();
  let rendered = '';
  output.on('data', chunk => { rendered += chunk.toString(); });
  const prompt = new TargetFolderPrompt(root, { input, output });
  const result = prompt.prompt();
  function key(name: string, sequence = '') { input.emit('keypress', sequence, { name, sequence }); }
  return { prompt, key, result, rendered: () => rendered };
}

describe('target selection with real Clack key events', () => {
  it('Space selects siblings without opening them; Enter confirms', async () => {
    const root = workspace();
    const a = join(root, 'a'), b = join(root, 'b');
    mkdirSync(a); mkdirSync(b);
    const p = picker(root);
    p.key('down'); p.key('space', ' ');
    expect(p.prompt.directory).toBe(root);
    expect(p.prompt.value).toEqual([a]);
    p.key('down'); p.key('space', ' '); p.key('return', '\r');
    expect(await p.result).toEqual([a, b]);
    expect(p.rendered()).toContain('Space: toggle');
    expect(p.rendered()).toContain('☑');
  });
  it('retains selections across right/left navigation and Space can unselect', async () => {
    const root = workspace(), a = join(root, 'a'), child = join(a, 'child');
    mkdirSync(child, { recursive: true });
    const p = picker(root);
    p.key('down'); p.key('space', ' '); p.key('right');
    expect(p.prompt.directory).toBe(a);
    p.key('down'); p.key('space', ' '); p.key('left');
    expect(p.prompt.directory).toBe(root);
    expect(p.prompt.folders[p.prompt.cursor]).toBe(a);
    p.key('space', ' '); p.key('return', '\r');
    expect(await p.result).toEqual([child]);
  });
  it('Enter with no selection stays in the browser, Escape cancels', async () => {
    const p = picker(workspace());
    p.key('return', '\r');
    expect(p.prompt.state).toBe('error');
    expect(p.rendered()).toContain('Select at least one');
    p.key('escape', '\u001b');
    expect(typeof await p.result).toBe('symbol');
  });
  it('deduplicates paths and rejects files, missing folders and symlink roots', () => {
    const root = workspace();
    expect(normalizeTargets([root, join(root, '.')])).toEqual([root]);
    const file = join(root, 'file'); writeFileSync(file, 'fixture');
    expect(() => normalizeTargets([file])).toThrow(/directory/);
    expect(() => normalizeTargets([join(root, 'missing')])).toThrow();
    const link = join(root, 'link'); symlinkSync(root, link, 'dir');
    expect(() => normalizeTargets([link])).toThrow(/symlink/);
  });
});
