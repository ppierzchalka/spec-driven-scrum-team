import { cancel } from '@clack/prompts';
import { Prompt } from '@clack/core';
import type { Readable, Writable } from 'node:stream';
import { readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { checkInstallDirectory } from './installPaths.js';

export function normalizeTargets(paths: string[]): string[] {
  const targets = [...new Set(paths.map(path => resolve(path)))];
  for (const target of targets) {
    checkInstallDirectory(target, target);
    if (!statSync(target).isDirectory()) throw new Error('Target must be an existing directory: ' + target);
  }
  return targets;
}

/** Clack prompt with independent checkbox selection and filesystem navigation. */
export class TargetFolderPrompt extends Prompt<string[]> {
  directory: string;
  folders: string[] = [];
  cursor = 0;
  browserError = '';

  constructor(startDirectory: string, streams: { input?: Readable; output?: Writable } = {}) {
    super({
      ...streams,
      render: () => this.renderFolders(),
      validate(value) {
        if (!value?.length) return 'Select at least one target folder with Space.';
        try { normalizeTargets(value); } catch (error) {
          return error instanceof Error ? error.message : 'Invalid target folder';
        }
      },
    }, false);
    this.directory = resolve(startDirectory);
    this.value = [];
    this.open(this.directory);
    this.on('cursor', action => {
      if (action === 'up') this.cursor = (this.cursor + this.folders.length - 1) % this.folders.length;
      else if (action === 'down') this.cursor = (this.cursor + 1) % this.folders.length;
      else if (action === 'right') {
        const folder = this.folders[this.cursor];
        if (folder && folder !== this.directory) this.open(folder);
      } else if (action === 'left') this.open(dirname(this.directory));
      else if (action === 'space') this.toggle();
    });
    this.on('key', (_char, key) => {
      if (key.name === 'backspace') this.open(dirname(this.directory));
    });
  }

  private open(directory: string): void {
    try {
      const children = readdirSync(directory, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(entry => join(directory, entry.name));
      const previous = this.directory;
      this.directory = directory;
      this.folders = [directory, ...children];
      this.cursor = Math.max(0, this.folders.indexOf(previous));
      this.browserError = '';
    } catch (error) {
      this.browserError = error instanceof Error ? error.message : 'Cannot read directory';
      if (!this.folders.length) throw error;
    }
  }

  private toggle(): void {
    const folder = this.folders[this.cursor];
    if (!folder) return;
    const selected = this.value ?? [];
    if (selected.includes(folder)) this.value = selected.filter(path => path !== folder);
    else {
      try { normalizeTargets([folder]); this.value = [...selected, folder]; this.browserError = ''; }
      catch (error) { this.browserError = error instanceof Error ? error.message : 'Invalid target folder'; }
    }
  }

  private renderFolders(): string {
    const selected = this.value ?? [];
    if (this.state === 'cancel') return '■ Target selection cancelled';
    if (this.state === 'submit') return `◇ Selected ${selected.length} target(s)\n` + selected.map(path => '│  ' + path).join('\n');
    const first = Math.max(0, Math.min(this.cursor - 5, this.folders.length - 12));
    const rows = this.folders.slice(first, first + 12).map((path, offset) => {
      const label = path === this.directory ? './ (current folder)' : relative(this.directory, path) + '/';
      return `│ ${first + offset === this.cursor ? '›' : ' '} ${selected.includes(path) ? '☑' : '☐'} ${label}`;
    });
    return [
      `◆ Select target folders — ${this.directory}`,
      ...rows,
      ...(this.folders.length > 12 ? [`│  Showing ${first + 1}–${Math.min(first + 12, this.folders.length)} of ${this.folders.length}`] : []),
      `│  ${selected.length} selected: ${selected.join(', ') || 'none'}`,
      '│  ↑/↓: move · Space: toggle · →: open · ←/Backspace: parent · Enter: continue · Esc: cancel',
      ...(this.browserError || this.state === 'error' ? ['│  ' + (this.browserError || this.error)] : []),
      '└',
    ].join('\n');
  }
}

/** Select exact directories; children are not implicitly selected or scanned. */
export async function browseTargets(startDirectory = process.cwd()): Promise<string[]> {
  const choice = await new TargetFolderPrompt(startDirectory).prompt();
  if (typeof choice === 'symbol' || !choice) {
    cancel('Cancelled.');
    process.exit(0);
  }
  return normalizeTargets(choice);
}
