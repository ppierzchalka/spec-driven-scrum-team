import { existsSync, lstatSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { applyEdits, modify, parse, type ParseError } from 'jsonc-parser';
import { checkInstallDirectory, checkInstallFile } from './installPaths.js';

/**
 * Exact negative Quick Open entry. The leading `-` removes the command from
 * the skip list negation: with this entry present, Ctrl+P reaches applications
 * running in the VS Code integrated terminal instead of opening Quick Open.
 * (`workbench.action.quickOpen` is Quick Open, not the Ctrl+Shift+P palette.)
 */
export const VSCODE_QUICK_OPEN_SKIP = '-workbench.action.quickOpen';
const SETTINGS_KEY = 'terminal.integrated.commandsToSkipShell';

export function vscodeSettingsPath(targetDir: string): string {
  return join(targetDir, '.vscode', 'settings.json');
}

export type VscodePlan = { path: string; body: string | null };

function readPlanned(targetDir: string): { path: string; source: string | null } {
  const path = vscodeSettingsPath(targetDir);
  checkInstallDirectory(targetDir, dirname(path));
  checkInstallFile(targetDir, path);
  if (!existsSync(path)) return { path, source: null };
  // checkInstallFile already rejects non-regular files (including symlinks).
  void lstatSync(path);
  return { path, source: readFileSync(path, 'utf8') };
}

function parseSettings(source: string, path: string): Record<string, unknown> {
  const errors: ParseError[] = [];
  const value: unknown = parse(source, errors, { allowTrailingComma: true });
  if (errors.length) {
    throw new Error(`Invalid VS Code settings JSONC: ${path} (${errors.map((error) => `offset ${error.offset}`).join(', ')}). Fix or remove the file, then reinstall.`);
  }
  if (value === undefined) {
    if (source.trim() === '') return {};
    throw new Error(`Invalid VS Code settings: ${path} has no JSON value. Fix or remove the file, then reinstall.`);
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Invalid VS Code settings: ${path} root must be a JSON object. Fix or remove the file, then reinstall.`);
  }
  return value as Record<string, unknown>;
}

/** Read-only validation before any installer writes. Throws an actionable error. */
export function preflightVscodeSettings(targetDir: string): void {
  planVscodeSettings(targetDir);
}

/**
 * Compute the post-install file body, or `body: null` when the negative Quick
 * Open entry is already present (byte-identical reinstall). Never throws away
 * comments, unrelated settings or existing array entries.
 */
export function planVscodeSettings(targetDir: string): VscodePlan {
  const { path, source } = readPlanned(targetDir);
  if (source === null || source.trim() === '') {
    // A whitespace-only file carries no settings; start from an empty object.
    const body = applyEdits('{}', modify('{}', [SETTINGS_KEY], [VSCODE_QUICK_OPEN_SKIP], {
      formattingOptions: { insertSpaces: true, tabSize: 2, eol: '\n' },
    }));
    return { path, body: body.endsWith('\n') ? body : body + '\n' };
  }
  const settings = parseSettings(source, path);
  const existing = settings[SETTINGS_KEY];
  if (existing === undefined) {
    const body = applyEdits(source, modify(source, [SETTINGS_KEY], [VSCODE_QUICK_OPEN_SKIP], {
      formattingOptions: { insertSpaces: true, tabSize: 2, eol: '\n' },
    }));
    return { path, body };
  }
  if (!Array.isArray(existing) || !existing.every((entry): entry is string => typeof entry === 'string')) {
    throw new Error(
      `Invalid VS Code settings: ${path} has "${SETTINGS_KEY}" as a non-string-array value. ` +
        'Set it to an array of strings (or remove the key), then reinstall; the installer never repairs it destructively.',
    );
  }
  if (existing.includes(VSCODE_QUICK_OPEN_SKIP)) return { path, body: null };
  const body = applyEdits(source, modify(source, [SETTINGS_KEY, existing.length], VSCODE_QUICK_OPEN_SKIP, {
    formattingOptions: { insertSpaces: true, tabSize: 2, eol: '\n' },
  }));
  return { path, body };
}

export interface VscodeResult {
  path: string;
  status: 'wrote' | 'kept';
}

/** Preflighted apply: appends the missing entry or leaves a configured file untouched. */
export function applyVscodeSettings(targetDir: string): VscodeResult {
  const plan = planVscodeSettings(targetDir);
  if (plan.body === null) return { path: plan.path, status: 'kept' };
  mkdirSync(dirname(plan.path), { recursive: true });
  writeFileSync(plan.path, plan.body);
  return { path: plan.path, status: 'wrote' };
}
