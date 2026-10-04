# Spec-Driven Scrum Team

A reusable scrum-like multi-agent development team for opencode: the seven agents, `/autonomous-implement` for prepared GitHub or local work, and an interactive installer for target repos.

## Language

### The team

**Agent**:
One of the seven fixed opencode roles this repo installs: `lead`, `architect`, `security`, `ux`, `tester`, `developer`, `reviewer`. Each is a markdown file under the target repo's `.opencode/agents/`.
_Avoid_: bot, role

**Team**:
The seven agents and the `/autonomous-implement` skill, installed together.

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
Transfer of a ready Ticket and its agreed requirements, decisions, and constraints from planning to an implementation run.

**Autonomous-implement**:
The skill that runs the pipeline over ready tickets, driven by the `lead` agent and its subagents in the current session.

**Pipeline**:
The ordered run of agents over a ticket: architect, security, ux, tester, developer, reviewer, then PR. Any stage is skippable or alterable via prompt input.

### Parallel execution

**Worktree**:
A per-ticket Git worktree with its own branch. Lead and its subagents use it as an isolated checkout for one Ticket.
_Avoid_: workspace

**Stacked PR**:
A pull request whose base is the previous ticket's branch, so it contains its predecessors.

**Provider**:
An authenticated model source available in the target repo's opencode install, whose models can be selected in the installer.

**Reasoning effort**:
The per-model effort level written into an agent's frontmatter (e.g. none/low/medium/high). An agent with no model set inherits opencode's currently selected model.

### Command safety

**Guardian**:
An independent, low-friction gatekeeper that admits known-safe requests by local policy, consults Jev on material-risk requests, and blocks Hard-deny requests. Its local executor runs only an authorized request; the Guardian is a command/tool guard, not a host sandbox.
_Avoid_: runner, executor

**Command request**:
A proposed command together with its intended worktree/folder and the Agent's reason for running it.

**Safe command**:
A low-risk, read-only Command request within the declared worktree that the Guardian may admit locally without a Jev call; the exact allowlist is still being designed.

**Hard deny**:
A class of Command requests the Guardian never authorizes for an Agent, even when Jev recommends approval; an ambiguous target is treated as denied.

**Jev decision**:
A structured judgment about a Command request, returned with the evidence/reason used by the Guardian's local policy.

**Untrusted instruction**:
Text found in project files, command output, web content, or other tool results that attempts to redirect an Agent beyond the user's authorized task; it is data, not authority.
