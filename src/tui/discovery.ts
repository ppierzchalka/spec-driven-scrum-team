import { execFile, type ChildProcess } from 'node:child_process';
import { availableModels, detectConfigProviders, detectEnvProviders } from '../installer/model-catalog.js';

export interface DiscoveryResult {
  models: string[];
  /** Short truthful note for the UI; never raw command output. */
  detail: string;
}

export type ExecFn = (cmd: string, args: string[]) => Promise<{ stdout: string; stderr: string }>;

/** In-flight discovery children, so quit/unmount never orphans them. */
const activeChildren = new Set<ChildProcess>();

/** Kill in-flight provider probes (event loop drains; nothing is logged). */
export function cancelDiscovery(): void {
  for (const child of activeChildren) {
    try {
      child.kill('SIGTERM');
    } catch {
      // Already exited; the callback settles the promise.
    }
  }
}

/** Default executor: bounded, swallows failures, never surfaces output. */
export function execBounded(cmd: string, args: string[], timeoutMs = 15000): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const settle = (value: { stdout: string; stderr: string }) => {
      if (child) activeChildren.delete(child);
      resolve(value);
    };
    let child: ChildProcess | undefined;
    try {
      child = execFile(cmd, args, { encoding: 'utf8', timeout: timeoutMs }, (error, stdout, stderr) => {
        if (error) {
          settle({ stdout: typeof stdout === 'string' ? stdout : '', stderr: '' });
          return;
        }
        settle({ stdout: typeof stdout === 'string' ? stdout : '', stderr: typeof stderr === 'string' ? stderr : '' });
      });
      activeChildren.add(child);
    } catch {
      settle({ stdout: '', stderr: '' });
    }
  });
}

/**
 * Asynchronous provider/model discovery for the mounted app. Runs only
 * `opencode auth list` and `opencode models` plus local env/config reads.
 * It NEVER executes `opencode auth export` (secret-bearing) and never returns
 * raw stdout/stderr — only derived model IDs and a short status note — so
 * command output and secrets cannot leak into the UI.
 */
export async function discoverModels(
  exec: ExecFn = execBounded,
  env: NodeJS.ProcessEnv = process.env,
): Promise<DiscoveryResult> {
  const [authList, models] = await Promise.all([exec('opencode', ['auth', 'list']), exec('opencode', ['models'])]);
  const extra = [...detectEnvProviders(env), ...detectConfigProviders()];
  const ids = availableModels(authList.stdout, models.stdout, extra);
  if (ids.length > 0) {
    return { models: ids, detail: `${ids.length} model${ids.length === 1 ? '' : 's'} from configured providers` };
  }
  return { models: [], detail: 'No configured providers found — inherit the harness model or type a model ID.' };
}
