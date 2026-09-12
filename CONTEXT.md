# Spec-Driven Scrum Team

A reusable scrum-like multi-agent development team for opencode: this repo ships the seven agents, the `/autonomous-implement` skill that drives them, and the interactive installer that installs and configures them in a target repo.

## Language

### The team

**Agent**:
One of the seven fixed opencode roles this repo installs: `lead`, `architect`, `security`, `ux`, `tester`, `developer`, `reviewer`. Each is a markdown file under the target repo's `.opencode/agents/`.
_Avoid_: bot, role

**Team**:
The seven agents and the `/autonomous-implement` skill that drives them, installed together.

**Target repo**:
The repository the installer runs in and installs into — the project that will use the team. Not this tool repo.

**Install**:
Run the installer CLI in a target repo: writes the seven agents, the skill, and the config file.

**Reconfigure**:
Re-run the installer to change an agent's model or reasoning effort, and optionally overwrite its instructions.

### Work items

**Ticket**:
A unit of work with acceptance criteria, produced by planning skills and stored in the repo's configured issue tracker.
_Avoid_: task, issue

**Handover**:
The point where a ticket is ready for the pipeline to implement autonomously ("ready for agent").

**Autonomous-implement**:
The skill that runs the pipeline over ready tickets, driven by the `lead` agent in a fresh session.

**Pipeline**:
The ordered run of agents over a ticket: architect, security, ux, tester, developer, reviewer, then PR. Any stage is skippable or alterable via prompt input.

### Parallel execution

**Worktree**:
A per-ticket git worktree with its own branch, where a pipeline runs in a separate headless opencode process.
_Avoid_: workspace

**Stacked PR**:
A pull request whose base is the previous ticket's branch, so it contains its predecessors.

**Provider**:
An authenticated model source available in the target repo's opencode install, whose models can be selected in the installer.

**Reasoning effort**:
The per-model effort level written into an agent's frontmatter (e.g. none/low/medium/high). An agent with no model set inherits opencode's currently selected model.