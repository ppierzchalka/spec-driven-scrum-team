import { spawn } from 'node:child_process';
import { openSync, closeSync, readFileSync, readdirSync } from 'node:fs';

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Linux zombies cannot execute or hold output handles; container PID 1 may
// leave them unreaped. Other POSIX platforms use the process-group probe.
export function groupAlive(pgid) {
  if (process.platform === 'linux') {
    return readdirSync('/proc').filter((name) => /^\d+$/.test(name)).some((pid) => {
      try {
        const fields = readFileSync(`/proc/${pid}/stat`, 'utf8').split(') ')[1].split(' ');
        return Number(fields[2]) === pgid && !['Z', 'X'].includes(fields[0]);
      } catch { return false; }
    });
  }
  try { process.kill(-pgid, 0); return true; } catch (error) {
    if (error.code === 'ESRCH') return false;
    throw error;
  }
}

/** Only use for noninteractive test-owned commands, never user sessions.
 * File output prevents grandchildren keeping captured pipes open. One deadline
 * covers the command; grace and escalation are separately bounded teardown.
 * Windows tree cleanup is deliberately unsupported, not silently partial.
 */
export async function runOwned(command, args, { cwd, env, log, timeoutMs, graceMs = 200, signal }) {
  if (process.platform === 'win32') throw new Error('Owned process-tree cleanup is unverified on Windows');
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new Error('A positive owned-command deadline is required');
  const started = performance.now();
  const fd = openSync(log, 'w');
  let child;
  try {
    child = spawn(command, args, { cwd, env, detached: true, stdio: ['ignore', fd, fd] });
  } finally { closeSync(fd); }
  let timer;
  let abort;
  const outcome = await new Promise((resolve) => {
    let settled = false;
    const finish = (value) => { if (!settled) { settled = true; resolve(value); } };
    child.once('error', (error) => finish({ kind: 'spawn-error', status: null, error: error.message }));
    child.once('exit', (status, exitSignal) => finish({ kind: status === 0 ? 'success' : 'nonzero', status, signal: exitSignal }));
    timer = setTimeout(() => finish({ kind: 'timeout', status: null }), timeoutMs);
    abort = () => finish({ kind: 'abort', status: null });
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) abort();
  });
  clearTimeout(timer);
  signal?.removeEventListener('abort', abort);
  const send = (name) => {
    try { process.kill(-child.pid, name); } catch (error) { if (error.code !== 'ESRCH') throw error; }
  };
  // Even a normally exited parent can leave descendants behind.
  if (child.pid && groupAlive(child.pid)) {
    send('SIGTERM');
    const graceEnd = performance.now() + graceMs;
    while (groupAlive(child.pid) && performance.now() < graceEnd) await pause(10);
    if (groupAlive(child.pid)) send('SIGKILL');
    const teardownEnd = performance.now() + 2000;
    while (groupAlive(child.pid) && performance.now() < teardownEnd) await pause(10);
    if (groupAlive(child.pid)) throw new Error(`Owned process group ${child.pid} survived escalation; log: ${log}`);
  }
  // Reap the direct child before returning/deleting its workspace.
  if (child.pid && child.exitCode === null && child.signalCode === null) {
    await new Promise((resolve) => child.once('exit', resolve));
  }
  return { ...outcome, pid: child.pid, output: readFileSync(log, 'utf8'), log, durationMs: performance.now() - started };
}
