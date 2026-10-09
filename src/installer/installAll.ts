import { conflictingSkills, installTeam, preflightTeam } from './installTeam.js';
import { installToady } from './toady.js';
import { applyVscodeSettings, planVscodeSettings, preflightVscodeSettings, type VscodeResult } from './vscodeSettings.js';
import type { InstallOptions, InstallResult } from '../types.js';

export interface InstallPlan {
  options: InstallOptions;
  persona?: { enabled: boolean; rules: string };
}

export interface InstallAllResult {
  target: string;
  team: InstallResult;
  personaPaths: string[];
  vscode: VscodeResult;
}

/**
 * Single-cwd installation orchestration (replaces the retired multi-target
 * batch). Read-only validation across every write scope — team files, private
 * persona profile and VS Code settings — runs before the first write.
 */
export function preflightAll(plan: InstallPlan): { vscodeKept: boolean } {
  preflightTeam(plan.options);
  if (plan.persona) {
    installToady(plan.options.targetDir, plan.persona.enabled, plan.options.harness, true, plan.persona.rules);
  }
  preflightVscodeSettings(plan.options.targetDir);
  return { vscodeKept: planVscodeSettings(plan.options.targetDir).body === null };
}

export function installAll(plan: InstallPlan): InstallAllResult {
  // Validate every scope before the first write; each writer re-validates cheaply.
  preflightAll(plan);
  try {
    const team = installTeam(plan.options);
    const personaPaths = plan.persona
      ? installToady(plan.options.targetDir, plan.persona.enabled, plan.options.harness, false, plan.persona.rules)
      : [];
    const vscode = applyVscodeSettings(plan.options.targetDir);
    return { target: plan.options.targetDir, team, personaPaths, vscode };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`Installation failed for ${plan.options.targetDir}: ${reason}. The target may be partially written; remaining scopes were not installed.`, { cause: error });
  }
}

/** Unowned shipped skill names that need explicit adoption for this plan. */
export function planSkillConflicts(plan: InstallPlan): string[] {
  return conflictingSkills(plan.options);
}
