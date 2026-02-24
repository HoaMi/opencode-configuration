# AGENTS.md — opencode Configuration Repository

This repository holds the personal opencode configuration: agent prompts, skills,
MCP server wiring, keybinds, permissions and slash commands. There is no application
source code and no test suite — agents editing files here are modifying AI tooling
configuration and system prompts.

---

## Repository Layout

```
opencode.json        # Master config — models, agents, tools, permissions, keybinds
package.json         # Bun workspace; single dep: @opencode-ai/plugin
bun.lock             # Lockfile (commit this — reproducible installs)
prompts/             # One .txt file per agent (sourced via {file:./prompts/<name>.txt})
skills/              # Loadable skill packs (SKILL.md per skill)
  api-design/
  code-review/
  git-commit/
  security-checklist/
  test-strategy/
node_modules/        # Managed by Bun — do NOT commit
```

---

## Build / Install Commands

```bash
# Install dependencies (Bun required)
bun install

# Validate JSON config (strips JSON5 comments, checks required agent fields)
node validate-config.mjs
```

There are no compile, lint or test commands — this repo contains no application code.
When you add or edit a prompt or skill, validate the YAML front-matter in SKILL.md
files manually (name, description, license, compatibility, metadata fields).

---

## Running a Single Test

No automated test suite exists. To verify changes:

1. **Prompt edits** — open opencode, switch to the affected agent, and run a smoke
   task. Confirm the agent behaves according to its updated instructions.
2. **opencode.json edits** — reload opencode (`ctrl+x n` for a new session). If the
   config fails to parse, opencode will surface the error on startup.
3. **Skill edits** — invoke the skill via `/skill <name>` inside opencode and confirm
   the injected content matches your expectations.

---

## Slash Commands (defined in opencode.json)

| Command      | Agent   | Purpose |
|--------------|---------|---------|
| `/commit`    | @mini   | Generate a Conventional Commits message from staged/unstaged changes |
| `/search`    | @build  | Brave Search synthesis with sources |
| `/review`    | @build  | Full code review pipeline (explore → review → security) |
| `/audit`     | @build  | Security audit pipeline (explore → security → report) |
| `/debug`     | @build  | Debug pipeline (debug → fix → verify) |
| `/test`      | @build  | Test coverage analysis and gap-filling |
| `/document`  | @build  | Auto-documentation pipeline (explore → docs) |
| `/refactor`  | @build  | Guided refactor (architect → reviewer → implement → verify) |
| `/onboard`   | @build  | Codebase onboarding guide (explore → architect → docs) |
| `/brainstorm` | @architect-brainstorm | Dual-architect debate — 5 strategies (Quick / Debate / Red-Team / Perspectives / Delphi) |

---

## Agent Roster

| Agent          | Model           | Mode      | Token budget | Purpose |
|----------------|-----------------|-----------|--------------|---------|
| `mini`         | MiniMax M2.5 Free | primary   | 15 steps     | Micro-edits, commit messages, quick Q&A |
| `build`        | Sonnet 4.6      | primary   | 100 steps    | Full orchestrator, all specialists (default) |
| `plan`         | Opus 4.6        | primary   | 40 steps     | Strategic planning, read-only |
| `explore`      | MiniMax M2.5 Free | subagent  | 40 steps     | Fast read-only codebase traversal |
| `debug`        | Opus 4.6        | subagent  | 70 steps     | Root cause analysis only — no edits |
| `backend`      | Sonnet 4.6      | subagent  | 65 steps     | APIs, databases, server logic |
| `frontend`     | Sonnet 4.6      | subagent  | 60 steps     | UI, components, accessibility |
| `security`     | Opus 4.6        | subagent  | 60 steps     | OWASP, vulnerability audits, Trivy |
| `devops`       | Sonnet 4.6      | subagent  | 70 steps     | CI/CD, containers, infrastructure |
| `reviewer`     | Sonnet 4.6      | subagent  | 40 steps     | PR review, code quality, read-only |
| `architect`    | Opus 4.6        | subagent  | 60 steps     | System design, ADRs, trade-offs |
| `tester`       | Sonnet 4.6      | subagent  | 60 steps     | Test strategy, TDD/BDD, E2E |
| `docs`         | MiniMax M2.5 Free | subagent  | 40 steps     | READMEs, JSDoc, changelogs |
| `gitlab-operator` | MiniMax M2.5 Free | subagent  | 20 steps     | GitLab REST write ops (MR comments, labels, approvals) via curl |
| `architect-brainstorm` | Opus 4.6 | subagent | 70 steps | Brainstorm orchestrator — coordinates the two personas and synthesizes. **Manual only** via `/brainstorm` |
| `arch-pragmatist` | Claude Opus 4.6 | subagent | 30 steps  | Debate persona: Pragmatist. Only invoked by `@architect-brainstorm` |
| `arch-innovator` | GPT-5.2-Codex | subagent | 30 steps  | Debate persona: Innovator. Only invoked by `@architect-brainstorm` |

**Token Optimization Rule:** always use the lightest agent that can handle the task.
Prefer `@mini` for single-line edits and quick Q&A, `@build` for multi-file work and
complex orchestration, `@reviewer` for code reviews, and `@tester` for all testing work.
Use `@plan` for all planning — simple or architectural.

---

## Inter-Agent Protocol

All sub-agents share a standardized communication protocol that `@build` understands and routes.

### Output Status
Every sub-agent starts its response with a STATUS line:
```
STATUS: ✅ [DONE] | ⚠️ [PARTIAL] | ❌ [BLOCKED/FAILED]
```

### Escalation Signals
Sub-agents emit these signals when they detect something outside their domain:
```
SECURITY_ESCALATION: [description]  → @build routes to @security
ARCH_QUESTION: [description]        → @build routes to @architect
TEST_GAP: [description]             → @build routes to @tester
DOC_UPDATE: [description]           → @build queues @docs at end of workflow
```

### Handoff
When work must continue with another specialist:
```
HANDOFF: @[agent] — [context and specific ask]
```

### Explore SCOPE Block
`@explore` always ends with a structured block for downstream agents:
```
SCOPE:
  files:        [relevant files with paths]
  symbols:      [key functions / classes / types]
  entry_points: [main files to read first]
  warnings:     [dead code, orphaned refs — or "none"]
```

### Feature Implementation Lifecycle (Protocol 6)
Standard cycle enforced by `@build` for non-trivial features:
`@plan` → `@architect` → `@security`* → domain agents → `@tester` → `@reviewer` → `@docs`*
(*) Only when triggered by SECURITY_ESCALATION or public API change.

### Security Early Warning
`@plan` and `@architect` emit `SECURITY_ESCALATION` before finalizing if the work involves
auth, crypto, PII, external credentials, or payments — so `@security` is involved early.

### Brainstorm Protocol
`@architect-brainstorm` follows this specific flow:
1. **Pre-debate**: calls `@explore` to get a SCOPE block of the relevant codebase (skipped for greenfield topics)
2. **Debate rounds**: invokes `@arch-pragmatist` and `@arch-innovator` in the order defined by the chosen strategy, passing the SCOPE block + previous round outputs as context
3. **Persona signals**: both persona agents emit `SECURITY_ESCALATION`, `TEST_GAP` and `ARCH_QUESTION` when genuinely warranted — the orchestrator surfaces these in the synthesis
4. **Handoff**: ends with `HANDOFF: @architect` (ADR) or `HANDOFF: @plan` (implementation), with the full Decision Log and Risks table as context

---

## Code Style Guidelines

### Language

All file edits, code, comments, commit messages and documentation **must be written
in English** unless the user explicitly requests otherwise.

### Naming Conventions

| Target | Convention | Example |
|--------|------------|---------|
| Files | kebab-case | `git-commit/`, `api-design/` |
| Functions / variables | camelCase | `getUserById` |
| Classes / types | PascalCase | `UserProfile` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Database entities | snake_case | `user_sessions` |
| REST URL segments | kebab-case, plural nouns | `/user-profiles/{id}/orders` |
| GraphQL types | PascalCase | `OrderItem` |
| GraphQL fields | camelCase | `createdAt` |
| GraphQL enums | SCREAMING_SNAKE_CASE | `ORDER_STATUS` |

### Formatting and Structure

- **No magic numbers** — every literal must be a named constant with context.
- **No TODO without context** — always explain why the TODO exists and when it
  should be resolved (e.g., `# TODO(auth-refactor): remove once OAuth2 lands`).
- **No commented-out code** in final output — remove it or keep it with a clear
  explanation in a code review comment.
- Functions must follow Single Responsibility — if a function does more than one
  thing, extract it.
- Complexity that cannot be avoided must be explained with an inline comment.

### Imports

- Group imports: standard library → third-party → internal — separated by blank lines.
- No unused imports in any language.
- Prefer named imports over wildcard/star imports.

### Error Handling

- Always use **typed errors with error codes** — never throw/return bare strings.
- Error paths must be handled explicitly; do not silently swallow exceptions.
- Standard REST error envelope (from `api-design` skill):
  ```json
  { "error": { "code": "VALIDATION_ERROR", "message": "...", "request_id": "..." } }
  ```
- No stack traces in HTTP responses in production.

### Stack-specific rules

**TypeScript / Node.js**
- No `any` types without an inline justification comment.
- All Promises must be `await`ed or have `.catch()` — no floating promises.
- No `console.log` left in production code.

**Python**
- Type hints required on all public functions.
- No bare `except:` — catch specific exception types.
- Use context managers (`with`) for files, DB connections and other resources.
- Never use mutable default arguments (`def f(x=[])` is a latent bug).

**Go**
- Never ignore errors with `_` on the error return.
- Goroutines require clear ownership and lifecycle management.
- Exported types and functions must have godoc comments.

**Rust**
- Prefer `?` over `unwrap()` / `expect()` unless the panic is intentional and commented.
- `unsafe` blocks must be minimal, justified and accompanied by a safety comment.
- `clone()` must be intentional — not a shortcut around borrow checker friction.

---

## Security Requirements

Run the `security-checklist` skill before any PR merge. Key rules:

- No hardcoded secrets, API keys or passwords — ever.
- SQL queries must use parameterized statements; no string interpolation.
- Shell commands must not interpolate user input (`shell=False` / `exec.Command`).
- HTML output must be escaped; never pass raw user data to `innerHTML`.
- Auth/authz checks required on every sensitive operation.
- CORS must specify explicit origins — never `*` in production.
- Escalate to `@security` (with Trivy MCP) for any 🔴 Critical finding, new auth
  systems, crypto implementations, or payment/PII handling.

---

## MCP Tool Usage Policy

Brave Search and Context7 are enabled globally but have **limited API quota**.

**Rule: always ask the user before invoking any `brave_search_*` or `context7_*` tool.**

Confirmation format: "I'd like to use [Brave Search / Context7] to [reason]. Shall I proceed?"

Never invoke these tools automatically — wait for explicit user approval first.

---

## README Update Rule

When modifying this configuration repository (agents, MCP servers, slash commands,
permissions, prompt files or environment variables), **update `README.md` before closing
the task** so it accurately reflects the new state. Delegate to `@docs` for non-trivial
documentation work.

---

## Commit Message Convention (Conventional Commits)

```
<type>(<scope>): <description>    # max 72 characters

[optional body — explain WHY, not WHAT]

[optional footer: BREAKING CHANGE: ... | Closes #NNN]
```

**Types:** `feat` · `fix` · `docs` · `style` · `refactor` · `perf` · `test` ·
`build` · `ci` · `chore`

- Imperative mood, lowercase, no trailing period.
- Body only when the change is non-obvious.
- `BREAKING CHANGE:` footer required when API or behavior changes.
- Use `/commit` slash command to auto-generate via `@mini`.

---

## Permission Model (summary)

| Action | Default | Exceptions |
|--------|---------|------------|
| Read files | allow | `.env`, `.env.*` → deny (`.env.example` allowed) |
| Bash | ask | `git status/diff/log`, `grep`, `rg` → allow |
| `git push` | deny (global) | Never overridden |
| `rm -rf` | deny (global) | Never overridden |
| `git commit` | ask | Subagents that can commit list it explicitly |
| Brave Search tools | allow (global) | Ask user before calling — limited quota |
| Context7 tools | allow (global) | Ask user before calling — limited quota |
| GitLab tools | deny (global) | Re-enabled on `@build`, `@devops` |
| Trivy tools | deny (global) | Re-enabled on `@security` only |
| Kubernetes tools | deny (global) | Re-enabled on `@devops`, `@debug` |
| AWS Cost tools (`aws-cost`) | deny (global) | Re-enabled on `@devops`, `@architect` |
| AWS API tools (`aws-api`) | deny (global) | Re-enabled on `@devops` only |
| EKS tools | deny (global) | Re-enabled on `@devops`, `@debug` |
| Git MCP tools | deny (global) | Read tools re-enabled on `@reviewer`, `@debug`, `@explore`; write tools (`git_commit`, `git_add`, `git_reset`, `git_create_branch`, `git_checkout`) remain blocked |
| Filesystem MCP tools | deny (global) | Re-enabled on `@build`, `@backend`, `@frontend`, `@devops`, `@docs` |
| AWS Docs tools (`aws-docs`) | allow (global) | Ask user before calling |
| `webfetch` | allow (most agents) | Denied on `@mini` and `@gitlab-operator` only |
| `lsp` | allow (most agents) | Denied on `@explore`, `@gitlab-operator`; explicitly allowed on `@plan`, `@architect`, `@devops` |

The `doom_loop` policy is set to `ask` — agents that detect they are stuck must
surface the situation to the user rather than retrying silently.

---

## Model Environment Variables

Each agent's model is configured via an environment variable, allowing per-agent
overrides without editing `opencode.json`. All variables must be set in `~/.zshrc`
(or equivalent) before starting opencode — there is no fallback.

```bash
# ── Global defaults ───────────────────────────────────────────────────────────
export OPENCODE_DEFAULT_MODEL="github-copilot/claude-sonnet-4.6"
export OPENCODE_SMALL_MODEL="opencode/minimax-m2.5-free"

# ── Per-agent model overrides ─────────────────────────────────────────────────
export OPENCODE_MODEL_MINI="opencode/minimax-m2.5-free"
export OPENCODE_MODEL_BUILD="github-copilot/claude-sonnet-4.6"
export OPENCODE_MODEL_PLAN="github-copilot/claude-opus-4.6"
export OPENCODE_MODEL_EXPLORE="opencode/minimax-m2.5-free"
export OPENCODE_MODEL_DEBUG="github-copilot/claude-opus-4.6"
export OPENCODE_MODEL_BACKEND="github-copilot/claude-sonnet-4.6"
export OPENCODE_MODEL_FRONTEND="github-copilot/claude-sonnet-4.6"
export OPENCODE_MODEL_SECURITY="github-copilot/claude-opus-4.6"
export OPENCODE_MODEL_DEVOPS="github-copilot/claude-sonnet-4.6"
export OPENCODE_MODEL_REVIEWER="github-copilot/claude-sonnet-4.6"
export OPENCODE_MODEL_ARCHITECT="github-copilot/claude-opus-4.6"

# ── Brainstorm — real two-model confrontation ─────────────────────────────────
export OPENCODE_MODEL_ARCH_PRAGMATIST="opencode/claude-opus-4-6"   # ARCH-A: Pragmatist
export OPENCODE_MODEL_ARCH_INNOVATOR="opencode/gpt-5.2-codex"      # ARCH-B: Innovator
export OPENCODE_MODEL_TESTER="github-copilot/claude-sonnet-4.6"
export OPENCODE_MODEL_DOCS="opencode/minimax-m2.5-free"
export OPENCODE_MODEL_GITLAB_OPERATOR="opencode/minimax-m2.5-free"
```

| Variable | Agent | Current value |
|----------|-------|---------------|
| `OPENCODE_DEFAULT_MODEL` | root `model` | `github-copilot/claude-sonnet-4.6` |
| `OPENCODE_SMALL_MODEL` | root `small_model` | `opencode/minimax-m2.5-free` |
| `OPENCODE_MODEL_MINI` | `mini` | `opencode/minimax-m2.5-free` |
| `OPENCODE_MODEL_BUILD` | `build` | `github-copilot/claude-sonnet-4.6` |
| `OPENCODE_MODEL_PLAN` | `plan` | `github-copilot/claude-opus-4.6` |
| `OPENCODE_MODEL_EXPLORE` | `explore` | `opencode/minimax-m2.5-free` |
| `OPENCODE_MODEL_DEBUG` | `debug` | `github-copilot/claude-opus-4.6` |
| `OPENCODE_MODEL_BACKEND` | `backend` | `github-copilot/claude-sonnet-4.6` |
| `OPENCODE_MODEL_FRONTEND` | `frontend` | `github-copilot/claude-sonnet-4.6` |
| `OPENCODE_MODEL_SECURITY` | `security` | `github-copilot/claude-opus-4.6` |
| `OPENCODE_MODEL_DEVOPS` | `devops` | `github-copilot/claude-sonnet-4.6` |
| `OPENCODE_MODEL_REVIEWER` | `reviewer` | `github-copilot/claude-sonnet-4.6` |
| `OPENCODE_MODEL_ARCHITECT` | `architect` + brainstorm synthesizer | `github-copilot/claude-opus-4.6` |
| `OPENCODE_MODEL_ARCH_PRAGMATIST` | `arch-pragmatist` | `opencode/claude-opus-4-6` |
| `OPENCODE_MODEL_ARCH_INNOVATOR` | `arch-innovator` | `opencode/gpt-5.2-codex` |
| `OPENCODE_MODEL_TESTER` | `tester` | `github-copilot/claude-sonnet-4.6` |
| `OPENCODE_MODEL_DOCS` | `docs` | `opencode/minimax-m2.5-free` |
| `OPENCODE_MODEL_GITLAB_OPERATOR` | `gitlab-operator` | `opencode/minimax-m2.5-free` |

---

## MCP Servers

| Server | Type | Scope | Requires |
|--------|------|-------|---------|
| `brave_search` | local (`npx @brave/brave-search-mcp-server`) | all agents — ask first | `BRAVE_API_KEY` env var |
| `context7` | remote (`https://mcp.context7.com/mcp`) | all agents — ask first | `CONTEXT7_API_KEY` env var |
| `gitlab` | remote (`https://gitlab.com/api/v4/mcp`) | `@build`, `@devops` | OAuth2 on first use |
| `trivy` | local (`trivy mcp`) | `@security` only | `brew install trivy` + `trivy plugin install mcp` |
| `kubernetes` | local (`npx mcp-server-kubernetes`) | `@devops`, `@debug` | `kubectl` configured context |
| `aws-cost` | local (`uvx awslabs.billing-cost-management-mcp-server`) | `@devops`, `@architect` | `AWS_PROFILE` + `AWS_REGION` + IAM perms (`ce:*`, `budgets:*`, `compute-optimizer:*`) |
| `aws-docs` | local (`uvx awslabs.aws-documentation-mcp-server`) | all — ask first | none (public docs) |
| `aws-api` | local (`uvx mcp-proxy-for-aws`) | `@devops` | `AWS_PROFILE` + `AWS_REGION` (preview — CloudTrail audited) |
| `eks` | local (`uvx awslabs.eks-mcp-server`) | `@devops`, `@debug` | `AWS_PROFILE` + `AWS_REGION` |
| `git` | local (`uvx mcp-server-git`) | `@reviewer`, `@debug`, `@explore` | none — uses CWD; git_commit/add/reset/create_branch/checkout blocked globally |
| `filesystem` | local (`npx @modelcontextprotocol/server-filesystem`) | `@build`, `@backend`, `@frontend`, `@devops`, `@docs` | none — allowed root: `$HOME` |

### GitLab write operations

The GitLab MCP server (OAuth2 remote) **does not reliably support write operations**
(MR comments, labels, approvals). All writes must go through `@gitlab-operator`,
which uses `curl` + `GITLAB_PERSONAL_ACCESS_TOKEN` directly against the REST API.

- **Read operations** (MR details, pipelines, issues) → use GitLab MCP tools (`gitlab_*`)
- **Write operations** (post comment, add label, approve MR) → delegate to `@gitlab-operator`

Required env var: `GITLAB_PERSONAL_ACCESS_TOKEN` (set in `~/.zshrc` or equivalent).
curl is restricted to `https://gitlab.com/api/v4/*` only — no other domains.

---

## Keybinds

Leader key: `ctrl+x`

| Binding | Action |
|---------|--------|
| `ctrl+x ←` / `ctrl+x →` | Cycle child (subagent) sessions |
| `ctrl+x n` | New session |
| `ctrl+x a` | Agent picker (Tab also cycles primary agents) |
