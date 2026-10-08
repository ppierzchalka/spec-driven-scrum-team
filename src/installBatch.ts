import { installTeam, preflightTeam } from './installTeam.js';
import { installToady } from './toady.js';
import type { InstallOptions, InstallResult } from './types.js';

export interface TargetPlan {
  options: InstallOptions;
  persona?: { enabled: boolean; rules: string };
}
export interface TargetResult {
  target: string;
  team: InstallResult;
  personaPaths: string[];
}

export function installBatch(plans: TargetPlan[], report?: (result: TargetResult) => void): TargetResult[] {
  // Read-only validation across the complete selection before the first write.
  for (const { options, persona } of plans) {
    preflightTeam(options);
    if (persona) installToady(options.targetDir, persona.enabled, options.harness, true, persona.rules);
  }
  const completed: TargetResult[] = [];
  for (const { options, persona } of plans) {
    try {
      const team = installTeam(options);
      const personaPaths = persona ? installToady(options.targetDir, persona.enabled, options.harness, false, persona.rules) : [];
      const result = { target: options.targetDir, team, personaPaths };
      completed.push(result);
      report?.(result);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(`Installation failed for ${options.targetDir}: ${reason}. This target may be partially written. Completed targets: ${completed.map(result => result.target).join(', ') || 'none'}. Remaining targets were not installed.`, { cause: error });
    }
  }
  return completed;
}
