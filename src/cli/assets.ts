import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Resolve the installer package root from the running module — never from
 * the invocation cwd. Works from packaged `dist/` nesting (`dist/cli.js` →
 * package root) and from `src/` during development. Throws when the runtime
 * assets cannot be found.
 */
export function resolvePackageRoot(moduleUrl: string | URL): string {
  let dir = dirname(fileURLToPath(moduleUrl));
  for (let depth = 0; depth < 6; depth += 1) {
    if (
      existsSync(join(dir, 'package.json')) &&
      existsSync(join(dir, 'agents')) &&
      existsSync(join(dir, 'skills', 'autonomous-implement', 'SKILL.md'))
    ) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error('Cannot locate installer assets (agents/skills) from the running package. Reinstall the current build.');
}

export interface InstallerPaths {
  root: string;
  definitionsDir: string;
  skillDir: string;
}

export function installerPaths(packageRoot: string): InstallerPaths {
  return {
    root: packageRoot,
    definitionsDir: join(packageRoot, 'agents'),
    skillDir: join(packageRoot, 'skills', 'autonomous-implement'),
  };
}
