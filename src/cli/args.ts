export interface CliArgs {
  defaults: boolean;
  harnessName: string | undefined;
  toady: boolean | undefined;
  rulesFlag: string | undefined;
  clearRules: boolean;
  replaceSkills: boolean;
  help: boolean;
}

const KNOWN_FLAGS = new Set([
  '--defaults', '-d',
  '--toady', '--no-toady',
  '--clear-additional-rules', '--clear-toady-rules',
  '--replace-skills',
  '--help', '-h',
]);

export const USAGE = `install-team — configure the Spec-Driven Scrum Team in a single target directory

Usage:
  install-team [--harness=<name>] [--toady|--no-toady]
               [--additional-rules=<file>|--clear-additional-rules]
               [--replace-skills] [--defaults]

  Runs an interactive full-screen setup. The first screen defaults to the
  invocation (current) directory and offers a folder picker for another
  existing directory; the confirmed single target receives the install.
  With --defaults it installs noninteractively into the same current directory.

Options:
  --harness=<name>        opencode | claude-code | codex | antigravity | copilot
  --toady / --no-toady    Enable or disable the Toady persona voice
  --additional-rules=<f>  Load extra rules into the private persona (also --toady-rules=<f>)
  --clear-additional-rules Clear extra rules (also --clear-toady-rules)
  --replace-skills        Adopt/replace unowned shipped skill folders
  --defaults, -d          Noninteractive install with default models (cwd only)
  --help, -h              Show this help

Notes:
  Interactive installs have exactly one target, chosen in the setup;
  --defaults always uses the current directory. Target paths and
  multi-target flags were removed. Personal instructions are stored in your
  user configuration, never in the repository.`;

export function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    defaults: false,
    harnessName: undefined,
    toady: undefined,
    rulesFlag: undefined,
    clearRules: false,
    replaceSkills: false,
    help: false,
  };
  const rulesFlags: string[] = [];
  for (const arg of argv) {
    if (arg === '--defaults' || arg === '-d') args.defaults = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else if (arg === '--replace-skills') args.replaceSkills = true;
    else if (arg === '--toady') {
      if (args.toady === false) throw new Error('Choose --toady or --no-toady.\n' + USAGE);
      args.toady = true;
    } else if (arg === '--no-toady') {
      if (args.toady === true) throw new Error('Choose --toady or --no-toady.\n' + USAGE);
      args.toady = false;
    } else if (arg.startsWith('--harness=')) {
      if (args.harnessName !== undefined) throw new Error('Choose a single --harness=<name>.\n' + USAGE);
      args.harnessName = arg.slice('--harness='.length);
    } else if (arg.startsWith('--additional-rules=') || arg.startsWith('--toady-rules=')) {
      rulesFlags.push(arg.slice(arg.indexOf('=') + 1));
    } else if (arg === '--clear-additional-rules' || arg === '--clear-toady-rules') {
      args.clearRules = true;
    } else if (arg.startsWith('-')) {
      if (!KNOWN_FLAGS.has(arg) && !arg.startsWith('--harness=')) {
        throw new Error(`Unknown flag: ${arg}\n` + USAGE);
      }
    } else {
      throw new Error(
        `Unexpected target path: ${arg}\nThe installer works only in the invocation directory (interactive setups pick a single target folder in the setup instead of taking paths). Multi-target installs were removed.\n` + USAGE,
      );
    }
  }
  if (rulesFlags.length > 1) throw new Error('Choose one additional rules file.\n' + USAGE);
  if (rulesFlags.length === 1 && args.clearRules) throw new Error('Choose an additional rules file or clear rules.\n' + USAGE);
  args.rulesFlag = rulesFlags[0];
  return args;
}
