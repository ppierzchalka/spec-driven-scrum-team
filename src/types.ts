export interface AgentChoice {
  model?: string;
  reasoningEffort?: string;
}

export type TeamConfig = Record<string, AgentChoice>;

export interface InstallOptions {
  definitionsDir: string;
  skillDir: string;
  config: TeamConfig;
  targetDir: string;
  overwrite?: Record<string, boolean>;
}

export interface InstallResult {
  written: string[];
  preserved: string[];
  configPath: string;
  skillPath: string;
}
