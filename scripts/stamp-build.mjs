// Stamp the compiled build with its source identity for diagnosability.
// Runs after tsc; never fails the build (unstamped builds report dev identity).
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
try {
  const commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8', cwd: root, timeout: 10000 }).trim();
  const stamp = { commit, builtAt: new Date().toISOString() };
  writeFileSync(join(root, 'dist', 'build-info.json'), JSON.stringify(stamp, null, 2) + '\n');
  console.log(`stamped build ${commit.slice(0, 12)}`);
} catch (error) {
  console.log(`build stamp skipped: ${error instanceof Error ? error.message : String(error)}`);
}
