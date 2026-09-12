import { mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parse, stringify } from 'yaml';
import type { InstallOptions, InstallResult, TeamConfig } from './types.js';

const AGENTS_DIR = '.opencode/agents';
const SKILLS_DIR = '.opencode/skills';
const CONFIG_FILE = '.opencode/team.config.json';

export function parseAgentFile(content: string): { frontmatter: Record<string, unknown>; body: string } {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: content };
  }
  return {
    frontmatter: (parse(match[1]) as Record<string, unknown>) ?? {},
    body: match[2],
  };
}

export function serializeAgentFile(frontmatter: Record<string, unknown>, body: string): string {
  return `---\n${stringify(frontmatter).trimEnd()}\n---\n${body}`;
}

function applyChoice(
  frontmatter: Record<string, unknown>,
  choice: { model?: string; reasoningEffort?: string } | undefined,
): void {
  if (choice?.model) {
    frontmatter.model = choice.model;
  } else {
    delete frontmatter.model;
  }
  if (choice?.reasoningEffort) {
    frontmatter.reasoningEffort = choice.reasoningEffort;
  } else {
    delete frontmatter.reasoningEffort;
  }
}

function writeConfig(targetDir: string, config: TeamConfig): string {
  const dir = join(targetDir, '.opencode');
  mkdirSync(dir, { recursive: true });
  const configPath = join(dir, 'team.config.json');
  writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
  return configPath;
}

function copySkill(skillDir: string, targetDir: string): string {
  const source = join(skillDir, 'SKILL.md');
  const destDir = join(targetDir, SKILLS_DIR, 'autonomous-implement');
  mkdirSync(destDir, { recursive: true });
  const dest = join(destDir, 'SKILL.md');
  writeFileSync(dest, readFileSync(source, 'utf8'));
  return dest;
}

function writeAgent(
  definitionsDir: string,
  name: string,
  targetDir: string,
  choice: { model?: string; reasoningEffort?: string } | undefined,
): string {
  const source = join(definitionsDir, `${name}.md`);
  const agent = parseAgentFile(readFileSync(source, 'utf8'));
  applyChoice(agent.frontmatter, choice);
  const destDir = join(targetDir, AGENTS_DIR);
  mkdirSync(destDir, { recursive: true });
  const dest = join(destDir, `${name}.md`);
  writeFileSync(dest, serializeAgentFile(agent.frontmatter, agent.body));
  return dest;
}

function updateAgentInPlace(targetDir: string, name: string, choice: { model?: string; reasoningEffort?: string } | undefined): string {
  const dest = join(targetDir, AGENTS_DIR, `${name}.md`);
  const agent = parseAgentFile(readFileSync(dest, 'utf8'));
  applyChoice(agent.frontmatter, choice);
  writeFileSync(dest, serializeAgentFile(agent.frontmatter, agent.body));
  return dest;
}

export function installTeam(options: InstallOptions): InstallResult {
  const { definitionsDir, skillDir, config, targetDir, overwrite = {} } = options;
  const written: string[] = [];
  const preserved: string[] = [];

  const names = readdirSync(definitionsDir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => file.slice(0, -3))
    .sort();

  for (const name of names) {
    const choice = config[name];
    if (overwrite[name] === false && existsSync(join(targetDir, AGENTS_DIR, `${name}.md`))) {
      preserved.push(updateAgentInPlace(targetDir, name, choice));
    } else {
      written.push(writeAgent(definitionsDir, name, targetDir, choice));
    }
  }

  const skillPath = copySkill(skillDir, targetDir);
  const configPath = writeConfig(targetDir, config);

  return { written, preserved, configPath, skillPath };
}