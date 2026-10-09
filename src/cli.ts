#!/usr/bin/env node
import { main } from './cli/main.js';
import { readBuildInfo } from './cli/buildInfo.js';
import { resolvePackageRoot } from './cli/assets.js';

/**
 * Internal installer entry (the packaged `install-team` bin is dist/cli/launch.js,
 * which resolves freshness first). Direct execution runs the local installer
 * with no network freshness check — this is the local-development path.
 *
 * INSTALL_TEAM_EXACT_BUILD pins an exact build identity for validated
 * handoffs: when set, this entry aborts unless its own stamp matches,
 * so a handoff can never silently run stale code.
 */
const pin = process.env.INSTALL_TEAM_EXACT_BUILD;
try {
  if (pin) {
    const root = resolvePackageRoot(import.meta.url);
    const own = readBuildInfo(root);
    if (pin !== own.commit) {
      console.error(`install-team: build identity ${own.tag} does not match pinned build; refusing to run stale code. Nothing was installed.`);
      process.exitCode = 1;
    } else {
      main().catch(report);
    }
  } else {
    main().catch(report);
  }
} catch (error) {
  report(error);
}

function report(error: unknown): void {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
