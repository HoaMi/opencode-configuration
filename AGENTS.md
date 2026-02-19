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

# Validate JSON config (opencode.json supports // comments — use a tolerant parser)
node -e "console.log('ok')"  # no build step; config is loaded directly by opencode
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

---

## Agent Roster

| Agent          | Model           | Mode      | Token budget | Purpose |
|----------------|-----------------|-----------|--------------|---------|
| `mini`         | Haiku 4.5       | primary   | 15 steps     | Micro-edits, commit messages, quick Q&A |
| `build-light`  | Sonnet 4.6      | primary   | 30 steps     | Lightweight orchestrator, simple delegation |
| `plan-light`   | Sonnet 4.6      | primary   | 20 steps     | Simple task breakdowns, read-only |
| `build`        | Sonnet 4.6      | primary   | 100 steps    | Full orchestrator, all specialists |
| `plan`         | Opus 4.6        | primary   | 40 steps     | Strategic planning, read-only |
| `explore`      | Haiku 4.5       | subagent  | 40 steps     | Fast read-only codebase traversal |
| `reviewer-light` | Haiku 4.5     | subagent  | 15 steps     | Quick review of 1-3 files |
| `tester-light` | Haiku 4.5       | subagent  | 20 steps     | Run tests, write simple unit tests |
| `debug`        | Opus 4.6        | subagent  | 70 steps     | Root cause analysis only — no edits |
| `backend`      | Sonnet 4.6      | subagent  | 80 steps     | APIs, databases, server logic |
| `frontend`     | Sonnet 4.6      | subagent  | 60 steps     | UI, components, accessibility |
| `security`     | Opus 4.6        | subagent  | 60 steps     | OWASP, vulnerability audits, Trivy |
| `devops`       | Sonnet 4.6      | subagent  | 70 steps     | CI/CD, containers, infrastructure |
| `reviewer`     | Sonnet 4.6      | subagent  | 40 steps     | PR review, code quality, read-only |
| `architect`    | Opus 4.6        | subagent  | 60 steps     | System design, ADRs, trade-offs |
| `tester`       | Sonnet 4.6      | subagent  | 60 steps     | Test strategy, TDD/BDD, E2E |
| `docs`         | Haiku 4.5       | subagent  | 40 steps     | READMEs, JSDoc, changelogs |

**Token Optimization Rule:** always use the lightest agent that can handle the task.
Prefer `@mini` for single-line edits, `@build-light` for multi-file quick work,
`@reviewer-light` for small reviews, and `@tester-light` to run existing tests.

---

## Code Style Guidelines

### Language

All file edits, code, comments, commit messages and documentation **must be written
in English** unless the user explicitly requests otherwise.

### Naming Conventions

| Target | Convention | Example |
|--------|------------|---------|
| Files | kebab-case | `build-light.txt`, `api-design/` |
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
| Brave Search tools | deny (global) | Re-enabled on `@build`, `@plan` |
| GitLab tools | deny (global) | Re-enabled on `@build-light`, `@build`, `@devops` |
| Trivy tools | deny (global) | Re-enabled on `@security` only |

The `doom_loop` policy is set to `ask` — agents that detect they are stuck must
surface the situation to the user rather than retrying silently.

---

## MCP Servers

| Server | Type | Requires |
|--------|------|---------|
| `brave_search` | local (`npx @brave/brave-search-mcp-server`) | `BRAVE_API_KEY` env var |
| `gitlab` | remote (`https://gitlab.com/api/v4/mcp`) | OAuth2 on first use |
| `trivy` | local (`trivy mcp`) | `brew install trivy` + `trivy plugin install mcp` |

---

## Keybinds

Leader key: `ctrl+x`

| Binding | Action |
|---------|--------|
| `ctrl+x ←` / `ctrl+x →` | Cycle child (subagent) sessions |
| `ctrl+x n` | New session |
| `ctrl+x a` | Agent picker (Tab also cycles primary agents) |
