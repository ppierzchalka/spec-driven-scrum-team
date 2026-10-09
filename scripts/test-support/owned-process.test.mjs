import { describe, it, expect } from 'vitest';
import { rmSync, readFileSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { runOwned, groupAlive } from './owned-process.mjs';
import { privateEnv, checked } from './release-fixture.mjs';
import { ownedTemp } from './owned-temp.mjs';

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const rootFor = () => ownedTemp('owned-process-');

describe.skipIf(process.platform === 'win32')('owned POSIX commands', () => {
  it('distinguishes success, nonzero, spawn failure and explicit abort', async () => {
    const root = rootFor();
    try {
      const options = { cwd: root, env: privateEnv(root), log: join(root, 'output.log'), timeoutMs: 2000 };
      const good = await runOwned(process.execPath, ['-e', 'console.log("OUTPUT")'], options);
      expect(good.kind).toBe('success');
      expect(good.output).toContain('OUTPUT');
      const failed = await runOwned(process.execPath, ['-e', 'process.exit(7)'], options);
      expect(failed.kind).toBe('nonzero');
      expect(failed.status).toBe(7);
      const missing = await runOwned(join(root, 'missing-command'), [], options);
      expect(missing.kind).toBe('spawn-error');
      expect(missing.error).toMatch(/ENOENT/);
      const controller = new AbortController();
      controller.abort();
      const aborted = await runOwned(process.execPath, ['-e', 'setInterval(()=>{},100)'], { ...options, signal: controller.signal });
      expect(aborted.kind).toBe('abort');
      expect(groupAlive(aborted.pid)).toBe(false);
      await expect(checked(process.execPath, ['-e', 'process.exit(9)'], options)).rejects.toThrow(/nonzero \(9\)/);
    } finally { rmSync(root, { recursive: true, force: true }); }
  });

  it('deadline escalates only the owned tree and stops parent/grandchild heartbeats', async () => {
    const root = rootFor();
    try {
      // Both processes resist graceful termination. Their PID files and
      // heartbeats prove readiness before the test requests its deadline.
      const heartbeatCode = `
        const fs = require('node:fs');
        const path = require('node:path');
        fs.writeFileSync(path.join(process.cwd(), process.env.ROLE + '.pid'), String(process.pid));
        process.on('SIGTERM', () => {});
        setInterval(() => fs.appendFileSync(path.join(process.cwd(), process.env.ROLE + '.beat'), 'x'), 10);
      `;
      writeFileSync(join(root, 'child.cjs'), heartbeatCode);
      writeFileSync(join(root, 'parent.cjs'), heartbeatCode + `
        require('node:child_process').spawn(process.execPath, ['child.cjs'], {
          env: { ...process.env, ROLE: 'grandchild' }, stdio: 'inherit'
        });
      `);
      const running = runOwned(process.execPath, ['parent.cjs'], {
        cwd: root, env: privateEnv(root, { ROLE: 'parent' }), log: join(root, 'tree.log'), timeoutMs: 1000, graceMs: 100,
      });
      const readyEnd = performance.now() + 800;
      while ((!existsSync(join(root, 'parent.beat')) || !existsSync(join(root, 'grandchild.beat'))) && performance.now() < readyEnd) await pause(10);
      const result = await running;
      expect(existsSync(join(root, 'parent.beat'))).toBe(true);
      expect(existsSync(join(root, 'grandchild.beat'))).toBe(true);
      expect(result.kind).toBe('timeout');
      expect(result.durationMs).toBeLessThan(4000);
      const parent = Number(readFileSync(join(root, 'parent.pid'), 'utf8'));
      const grandchild = Number(readFileSync(join(root, 'grandchild.pid'), 'utf8'));
      expect(result.pid).toBe(parent);
      expect(grandchild).not.toBe(parent);
      expect(groupAlive(parent)).toBe(false);
      for (const pid of [parent, grandchild]) {
        if (process.platform === 'linux' && existsSync(`/proc/${pid}/stat`)) {
          expect(readFileSync(`/proc/${pid}/stat`, 'utf8').split(') ')[1][0]).toMatch(/[ZX]/);
        } else {
          expect(() => process.kill(pid, 0)).toThrow();
        }
      }
      const beats = ['parent', 'grandchild'].map((name) => readFileSync(join(root, `${name}.beat`), 'utf8'));
      await pause(100);
      expect(['parent', 'grandchild'].map((name) => readFileSync(join(root, `${name}.beat`), 'utf8'))).toEqual(beats);
      console.log(`owned timeout reaped parent=${parent}; grandchild=${grandchild} non-executing; heartbeats stopped`);
    } finally { rmSync(root, { recursive: true, force: true }); }
  });

  it('cleans descendants even when their parent exits successfully', async () => {
    const root = rootFor();
    try {
      const result = await runOwned(process.execPath, ['-e', `
        const child = require('node:child_process').spawn(process.execPath, ['-e', 'setInterval(()=>{},100)'], { stdio: 'inherit' });
        console.log(child.pid);
        child.unref();
      `], { cwd: root, env: privateEnv(root), log: join(root, 'orphan.log'), timeoutMs: 2000 });
      expect(result.kind).toBe('success');
      expect(Number(result.output.trim())).toBeGreaterThan(0);
      expect(groupAlive(result.pid)).toBe(false);
    } finally { rmSync(root, { recursive: true, force: true }); }
  });
});
