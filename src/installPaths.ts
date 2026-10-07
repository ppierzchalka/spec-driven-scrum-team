import { lstatSync, readdirSync } from 'node:fs';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';

/** Reject linked or escaping destinations, including dangling links, before access. */
export function checkInstallPath(root: string, path: string): void {
  const base = resolve(root);
  const target = resolve(path);
  const rel = relative(base, target);
  if (isAbsolute(rel) || rel === '..' || rel.startsWith('..' + sep)) {
    throw new Error('Install path escapes target repository: ' + path);
  }
  let current = base;
  for (const part of ['', ...rel.split(sep).filter(Boolean)]) {
    if (part) current = join(current, part);
    try {
      const stat = lstatSync(current);
      if (stat.isSymbolicLink()) throw new Error('Install destination cannot contain symlinks: ' + current);
      if (current !== target && !stat.isDirectory()) throw new Error('Install parent is not a directory: ' + current);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  }
}

/** Inspect owned destination trees so links in stale/unrelated children cannot be followed. */
export function checkInstallTree(root: string, path: string): void {
  checkInstallPath(root, path);
  let stat;
  try { stat = lstatSync(path); } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
    throw error;
  }
  if (stat.isDirectory()) for (const name of readdirSync(path)) checkInstallTree(root, join(path, name));
}

export function checkInstallFile(root: string, path: string): void {
  checkInstallPath(root, path);
  try {
    if (!lstatSync(path).isFile()) throw new Error('Install destination must be a regular file: ' + path);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
}

export function checkInstallDirectory(root: string, path: string): void {
  checkInstallPath(root, path);
  try {
    if (!lstatSync(path).isDirectory()) throw new Error('Install destination must be a directory: ' + path);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
}
