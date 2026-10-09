import React from 'react';
import { render, type Instance } from 'ink';
import { InstallerApp, type AppResult, type InstallHandler } from './app.js';
import { cancelDiscovery } from './discovery.js';
import { MIN_COLUMNS, MIN_ROWS } from './layout.js';
import type { SessionState } from './state.js';
import type { TargetRefreshLoader } from './screens/directory.js';

export interface InteractiveCaps {
  stdinTTY: boolean;
  stdoutTTY: boolean;
  term: string | undefined;
  rawMode: boolean;
}

/** Null when interactive startup is allowed, otherwise the human reason. */
export function interactiveBlockers(caps: InteractiveCaps): string | null {
  if (caps.term === 'dumb') return 'TERM=dumb: interactive setup needs a real terminal. Rerun with --defaults for a noninteractive single-directory install.';
  if (!caps.stdinTTY || !caps.stdoutTTY) return 'Standard input/output is not a TTY: interactive setup needs a terminal. Rerun with --defaults for a noninteractive single-directory install.';
  if (!caps.rawMode) return 'Raw mode is unavailable: interactive setup cannot read keys. Rerun with --defaults for a noninteractive single-directory install.';
  return null;
}

export function currentCaps(stdin: NodeJS.ReadStream = process.stdin, stdout: NodeJS.WriteStream = process.stdout): InteractiveCaps {
  return {
    stdinTTY: Boolean(stdin.isTTY),
    stdoutTTY: Boolean(stdout.isTTY),
    term: process.env.TERM,
    rawMode: typeof stdin.setRawMode === 'function',
  };
}

export interface RunOptions {
  initial: SessionState;
  stdin?: NodeJS.ReadStream;
  stdout?: NodeJS.WriteStream;
  stderr?: NodeJS.WriteStream;
  /** Diagnostics only: disable console patching for fake-stream tests. */
  patchConsole?: boolean;
  /** Runs validation + writes inside the mounted shell on Install. */
  onInstall?: InstallHandler;
  /** Synchronous read-only refresh for target/harness changes. */
  loadRefresh?: TargetRefreshLoader;
}

function viewportOf(stdout: NodeJS.WriteStream | undefined): { columns: number | undefined; rows: number | undefined } {
  const stream = (stdout ?? process.stdout) as Partial<Record<'columns' | 'rows', unknown>>;
  return {
    columns: typeof stream.columns === 'number' ? stream.columns : undefined,
    rows: typeof stream.rows === 'number' ? stream.rows : undefined,
  };
}

/**
 * Mount the full-screen Ink app, keep the shell mounted until validation and
 * writes finish, then restore the terminal before the caller prints durable
 * output. Refuses startup below the minimum viewport BEFORE entering the
 * alternate screen; mid-session shrinks keep the session with a resize state.
 * The app owns catchable signals while mounted (including the write window);
 * this runner only guarantees restoration around render failures.
 */
export async function runInstallerApp(options: RunOptions): Promise<AppResult> {
  const blocker = interactiveBlockers(currentCaps(options.stdin, options.stdout));
  if (blocker) throw new Error(blocker);
  const viewport = viewportOf(options.stdout);
  // Zero/unknown dims are not a small terminal (Ink falls back to a default);
  // only a known small viewport refuses startup before the screen take-over.
  const small = (value: number | undefined, minimum: number): boolean =>
    typeof value === 'number' && value > 0 && value < minimum;
  if (small(viewport.columns, MIN_COLUMNS) || small(viewport.rows, MIN_ROWS)) {
    const known = `${viewport.columns ?? '?'}x${viewport.rows ?? '?'}`;
    throw new Error(`Terminal too small (${known}; need at least ${MIN_COLUMNS}x${MIN_ROWS}). Enlarge the terminal or rerun with --defaults; nothing was written and the screen was never taken over.`);
  }
  let app: Instance | undefined;
  let settled = false;
  return new Promise<AppResult>((resolve, reject) => {
    const finish = (result: AppResult) => {
      if (settled) return;
      settled = true;
      cancelDiscovery();
      // Ink unmount restores the terminal (alternate screen, cursor, raw mode).
      try {
        app?.unmount();
      } catch {
        // Restoration is best-effort after a settled result.
      }
      resolve(result);
    };
    try {
      app = render(React.createElement(InstallerApp, { initial: options.initial, onDone: finish, onInstall: options.onInstall, loadRefresh: options.loadRefresh }), {
        stdin: options.stdin ?? process.stdin,
        stdout: options.stdout ?? process.stdout,
        stderr: options.stderr ?? process.stderr,
        exitOnCtrlC: false,
        patchConsole: options.patchConsole ?? true,
        // This runner is interactive by contract (interactiveBlockers above
        // refuses non-TTY startup). Force interactive so Ink does not fall
        // back to non-interactive mode under CI detection (`is-in-ci`), which
        // would disable raw mode and input.
        interactive: true,
        // Full-terminal alternate screen; Ink restores it on unmount.
        alternateScreen: true,
      });
      app.waitUntilExit().then(
        () => {
          // waitUntilExit resolves after unmount; finish only if onDone never fired.
          if (!settled) finish({ type: 'quit', state: options.initial });
        },
        (error: unknown) => {
          if (!settled) {
            settled = true;
            cancelDiscovery();
            reject(error);
          }
        },
      );
    } catch (error) {
      cancelDiscovery();
      reject(error);
    }
  });
}
