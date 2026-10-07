# Spec-Driven Scrum Team

A reusable scrum-like multi-agent development team across supported multi-agent harnesses: Analyst plus seven execution agents, planning skills and `/autonomous-implement` for prepared tracker or local work, and an interactive installer for target repos.

## Language

### The team

**Agent**:
One of the eight canonical agents this repo installs: `analyst`, `lead`, `architect`, `security`, `ux`, `tester`, `developer`, `reviewer`. Source instructions are Markdown; the selected harness adapter renders native Markdown/YAML or TOML definitions.
_Avoid_: bot, role

**Team**:
Analyst, seven execution agents and six skills, installed together.

**Target repo**:
The repository the installer runs in and installs into — the project that will use the team. Not this tool repo.

**Install**:
Run the installer CLI in a target repo: writes eight agents, six skills, and per-agent model configuration.

**Reconfigure**:
Re-run the installer to change an agent's model or reasoning effort, and optionally overwrite its instructions.

### Work items

**Ticket**:
A task with stable identity in the configured tracker. Slice creates it ready for refinement; Refine adds agreed behavior and acceptance criteria on the same record before it becomes ready to implement. “Task”, “Ticket” and the tracker’s native issue/work-item terminology refer to the same record.

**Handover**:
Transfer of a ready Ticket and its agreed requirements, decisions, and constraints from planning to an implementation run.

**Autonomous-implement**:
The skill that runs the pipeline over ready tickets, driven by the `lead` agent and its subagents in the current session.

**Pipeline**:
A dependency-aware execution run: independent enabled analysis stages/proposals, optional Tester, Developer and Reviewer, followed by authorized delivery. One Lead coordinates the batch.

### Parallel execution

**Worktree**:
A per-ticket Git worktree with its own branch. Lead and its subagents use it as an isolated checkout for one Ticket.
_Avoid_: workspace

**Stacked PR**:
A pull request targeting its predecessor branch; its diff shows the incremental Ticket change.

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

