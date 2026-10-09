import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface BuildInfo {
  version: string;
  commit: string;
  builtAt: string;
  tag: string;
}

interface StampedInfo {
  commit?: unknown;
  builtAt?: unknown;
}

/** Visible build identity for diagnosability (release builds stamp dist/). */
export function readBuildInfo(packageRoot: string): BuildInfo {
  let version = '0.0.0-dev';
  try {
    const pkg = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8')) as { version?: unknown };
    if (typeof pkg.version === 'string' && pkg.version) version = pkg.version;
  } catch {
    // Keep the dev fallback; identity must never crash the installer.
  }
  let commit = 'dev';
  let builtAt = 'dev';
  const stampPath = join(packageRoot, 'dist', 'build-info.json');
  if (existsSync(stampPath)) {
    try {
      const stamped = JSON.parse(readFileSync(stampPath, 'utf8')) as StampedInfo;
      if (typeof stamped.commit === 'string' && /^[0-9a-f]{7,40}$/.test(stamped.commit)) commit = stamped.commit;
      if (typeof stamped.builtAt === 'string' && stamped.builtAt) builtAt = stamped.builtAt;
    } catch {
      // Unstamped build; dev identity stands.
    }
  }
  const short = commit === 'dev' ? 'dev' : commit.slice(0, 12);
  return { version, commit, builtAt, tag: `${version}+${short}` };
}
