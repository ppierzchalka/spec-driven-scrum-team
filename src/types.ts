export interface AgentChoice {
  model?: string;
  reasoningEffort?: string;
  additionalTools?: string[];
}

export type TeamConfig = Record<string, AgentChoice>;

export interface InstallOptions {
  harness?: import('./harness.js').Harness;
  definitionsDir: string;
  skillDir: string;
  config: TeamConfig;
  targetDir: string;
  overwrite?: Record<string, boolean>;
  /** Explicit authorization to replace conflicting, unowned shipped skill names. */
  replaceSkills?: boolean;
}

export interface InstallResult {
  removed: string[];
  legacyPreserved: string[];
  written: string[];
  preserved: string[];
  configPath: string;
  skillPath: string;
  skillPaths: string[];
}
