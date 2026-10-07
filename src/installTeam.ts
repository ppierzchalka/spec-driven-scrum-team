import { cpSync, mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { parse, stringify } from 'yaml';
import { parse as parseToml } from 'smol-toml';
import type { InstallOptions, InstallResult, TeamConfig } from './types.js';
import { HARNESS_LAYOUTS, renderAgent, updateTomlChoice, applyHarnessChoice, reconcileAntigravityTools, type Harness } from './harness.js';


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

function writeConfig(targetDir: string, config: TeamConfig, harness: Harness): string {
  const dir = dirname(join(targetDir, HARNESS_LAYOUTS[harness].config));
  mkdirSync(dir, { recursive: true });
  const configPath = join(targetDir, HARNESS_LAYOUTS[harness].config);
  writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
  return configPath;
}

function copySkill(skillDir: string, targetDir: string, harness: Harness): string {
  const destDir = join(targetDir, HARNESS_LAYOUTS[harness].skills, 'autonomous-implement');
  mkdirSync(destDir, { recursive: true });
  cpSync(skillDir, destDir, { recursive: true });
  const dest = join(destDir, 'SKILL.md');
  return dest;
}

// Keep the legacy skillDir API; discover only the shipped planning siblings.
// Never copy a target repo's unrelated skills or configuration.
function copyPlanningSkills(skillDir: string, targetDir: string, harness: Harness): string[] {
  const paths: string[] = [];
  for (const name of ['wayfinder', 'slice', 'refine', 'plan', 'project-setup']) {
    const source = join(dirname(skillDir), name);
    if (!existsSync(join(source, 'SKILL.md'))) continue;
    const destination = join(targetDir, HARNESS_LAYOUTS[harness].skills, name);
    mkdirSync(destination, { recursive: true });
    cpSync(source, destination, { recursive: true });
    paths.push(join(destination, 'SKILL.md'));
  }
  return paths;
}

function writeAgent(
  definitionsDir: string,
  name: string,
  targetDir: string,
  choice: { model?: string; reasoningEffort?: string } | undefined,
  harness: Harness,
  previousChoice?: TeamConfig[string],
): string {
  const source = join(definitionsDir, `${name}.md`);
  const agent = parseAgentFile(readFileSync(source, 'utf8'));
  const destDir = join(targetDir, HARNESS_LAYOUTS[harness].agents);
  mkdirSync(destDir, { recursive: true });
  const dest = join(destDir, name + HARNESS_LAYOUTS[harness].extension);
  let content = renderAgent(name, String(agent.frontmatter.description ?? name), agent.body, choice, harness);
  if (harness === 'antigravity' && existsSync(dest)) {
    // Refresh instructions without erasing operator-configured native integrations.
    const existing = parseAgentFile(readFileSync(dest, 'utf8')).frontmatter;
    const rendered = parseAgentFile(content);
    for (const key of ['tools', 'mcpServers']) {
      if (existing[key] !== undefined) rendered.frontmatter[key] = existing[key];
    }
    reconcileAntigravityTools(rendered.frontmatter, previousChoice, choice);
    applyHarnessChoice(rendered.frontmatter, choice, harness);
    content = serializeAgentFile(rendered.frontmatter, rendered.body);
  }
  writeFileSync(dest, content);
  return dest;
}

function updateAgentInPlace(targetDir: string, name: string, choice: TeamConfig[string] | undefined, harness: Harness, previousChoice?: TeamConfig[string]): string {
  const dest = join(targetDir, HARNESS_LAYOUTS[harness].agents, name + HARNESS_LAYOUTS[harness].extension);
  const content = readFileSync(dest, 'utf8');
  if (harness === 'codex') writeFileSync(dest, updateTomlChoice(content, choice));
  else {
    const agent = parseAgentFile(content);
    if (harness === 'antigravity') reconcileAntigravityTools(agent.frontmatter, previousChoice, choice);
    applyHarnessChoice(agent.frontmatter, choice, harness);
    writeFileSync(dest, serializeAgentFile(agent.frontmatter, agent.body));
  }
  return dest;
}

export function installTeam(options: InstallOptions): InstallResult {
  const { definitionsDir, skillDir, config, targetDir, overwrite = {}, harness = 'opencode' } = options;
  // Validate all configured tiers before any install writes.
  if (harness === 'antigravity') {
    for (const choice of Object.values(config)) applyHarnessChoice({}, choice, harness);
  }
  const written: string[] = [];
  const preserved: string[] = [];
  const savedConfig = join(targetDir, HARNESS_LAYOUTS[harness].config);
  const previousConfig: TeamConfig = existsSync(savedConfig) ? JSON.parse(readFileSync(savedConfig, 'utf8')) as TeamConfig : {};

  const names = readdirSync(definitionsDir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => file.slice(0, -3))
    .sort();

  for (const name of names) {
    const choice = config[name];
    if (overwrite[name] === false && existsSync(join(targetDir, HARNESS_LAYOUTS[harness].agents, name + HARNESS_LAYOUTS[harness].extension))) {
      preserved.push(updateAgentInPlace(targetDir, name, choice, harness, previousConfig[name]));
    } else {
      written.push(writeAgent(definitionsDir, name, targetDir, choice, harness, previousConfig[name]));
    }
  }

  const skillPath = copySkill(skillDir, targetDir, harness);
  const skillPaths = [skillPath, ...copyPlanningSkills(skillDir, targetDir, harness)];
  const rolesDir = join(targetDir, HARNESS_LAYOUTS[harness].skills, 'autonomous-implement/references/roles');
  mkdirSync(rolesDir, { recursive: true });
  for (const name of names) {
    const native = readFileSync(join(targetDir, HARNESS_LAYOUTS[harness].agents, name + HARNESS_LAYOUTS[harness].extension), 'utf8');
    const body = harness === 'codex' ? String(parseToml(native).developer_instructions ?? '') : parseAgentFile(native).body;
    writeFileSync(join(rolesDir, name + '.md'), body);
  }
  const configPath = writeConfig(targetDir, config, harness);

  return { written, preserved, configPath, skillPath, skillPaths };
}
