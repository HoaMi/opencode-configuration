# opencode configuration

⚠️ Personal Configuration

Personal repository to manage and version [opencode](https://opencode.ai) configuration. This contains personal agent prompts and conventions

## Structure

```
.
├── opencode.json          # Master config (models, agents, tools, permissions)
├── package.json           # Bun workspace
├── bun.lock              # Lockfile (reproducibility)
├── prompts/              # Custom prompts per agent
│   ├── mini.txt
│   └── ...
├── skills/               # Reusable skill packs
│   ├── api-design/
│   ├── code-review/
│   ├── git-commit/
│   ├── security-checklist/
│   └── test-strategy/
└── README.md             # This file
```

## Usage

- **Edit config** → JSON editor (`opencode.json`)
- **Add agent** → create `prompts/<name>.txt`, declare in `opencode.json`
- **Add skill** → create `skills/<name>/SKILL.md` + resources
- **Validate** → reload opencode (`ctrl+x n`)

## Slash Commands

| Command | Agent | Purpose |
|---------|-------|---------|
| `/commit` | @mini | Generate Conventional Commits message |
| `/search` | @build | Brave Search synthesis with sources |
| `/review` | @build | Full code review pipeline (explore → review → security) |
| `/audit` | @build | Security audit pipeline (explore → security → report) |
| `/test` | @build | Test coverage analysis and gap-filling |
| `/debug` | @build | Debug pipeline (debug → fix → verify) |
| `/refactor` | @build | Guided refactoring (architect → reviewer → implement → verify) |
| `/document` | @build | Auto-documentation (explore → docs) |
| `/onboard` | @build | Codebase onboarding guide (explore → architect → docs) |
| `/brainstorm` | @architect-brainstorm | Dual-architect debate (Pragmatist vs Innovator) — 5 strategies |

## Environment Variables

Each agent's model is configured via an environment variable, allowing per-agent overrides without editing `opencode.json`. All variables must be set in `~/.zshrc` (or equivalent) **before** starting opencode.

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
export OPENCODE_MODEL_TESTER="github-copilot/claude-sonnet-4.6"
export OPENCODE_MODEL_DOCS="opencode/minimax-m2.5-free"
export OPENCODE_MODEL_GITLAB_OPERATOR="opencode/minimax-m2.5-free"
```

## Brainstorm Mode

`/brainstorm` activates a dual-architect debate between two opposing philosophies:

| Persona | Model | Philosophy |
|---------|-------|-----------|
| **ARCH-A** "The Pragmatist" | `opencode/claude-opus-4-6` | Simplicity, proven patterns, operational cost, time-to-market |
| **ARCH-B** "The Innovator" | `opencode/gpt-5.2-codex` | Scalability, correctness, future-proofing, modern patterns |

### Strategies

| Strategy | Use when |
|----------|---------|
| `quick` | Time-boxed decision or simple trade-off |
| `debate` *(default)* | Evaluating a specific proposed approach |
| `red-team` | Security-sensitive decisions, failure modes, high blast-radius changes |
| `perspectives` | Technology selection, build-vs-buy, paradigm choices |
| `delphi` | Complex multi-factor decisions needing iterative consensus |

### Usage

```
/brainstorm should we use a monolith or microservices for this project?
/brainstorm red-team: design of the authentication system
/brainstorm perspectives: PostgreSQL vs MongoDB for the user events store
/brainstorm delphi: event-driven vs request-response for the notification service
```

### How it works

1. **Pre-debate**: `@explore` maps the codebase and produces a SCOPE block — injected into both agents' first prompts so the debate is grounded in the actual project (skipped for greenfield topics)
2. **Debate rounds**: ARCH-A and ARCH-B alternate positions according to the chosen strategy
3. **Escalation signals**: both personas emit `SECURITY_ESCALATION`, `TEST_GAP` or `ARCH_QUESTION` when warranted — the orchestrator surfaces these in the synthesis
4. **Synthesis**: ends with a **Decision Log**, a **Risks & Mitigations** table, and a **HANDOFF** to `@architect` (ADR) or `@plan` (implementation)

> **Note:** `@architect-brainstorm`, `@arch-pragmatist` and `@arch-innovator` are only
> reachable via `/brainstorm` — never invoked automatically by other agents.

### Required env vars (`~/.zshrc`)

```bash
export OPENCODE_MODEL_ARCH_PRAGMATIST="opencode/claude-opus-4-6"
export OPENCODE_MODEL_ARCH_INNOVATOR="opencode/gpt-5.2-codex"
```

---

## MCP Servers

| Server | Type | Agents | Requires |
|--------|------|--------|---------|
| `brave_search` | local | all — ask first | `BRAVE_API_KEY` env var |
| `context7` | remote | all — ask first | `CONTEXT7_API_KEY` env var |
| `gitlab` | remote | `@build`, `@devops` | OAuth2 on first use |
| `trivy` | local | `@security` | `brew install trivy` + `trivy plugin install mcp` |
| `kubernetes` | local | `@devops`, `@debug` | `kubectl` configured context |

### GitLab MCP

The GitLab MCP server uses OAuth2 remote mode for **read operations** (MR details, pipelines, issues).

| Setting | Value |
|---------|-------|
| Type | Remote |
| URL | `https://gitlab.com/api/v4/mcp` |
| Auth | OAuth2 (interactive on first use) |

**Write operations** (post comment, add label, approve MR) are handled by the `@gitlab-operator` agent, which uses `curl` against the GitLab REST API directly.

Required environment variable:

```bash
export GITLAB_PERSONAL_ACCESS_TOKEN="glpat-xxxxxxxxxxxxxxxxxxxx"
```

> **Note:** `curl` calls from `@gitlab-operator` are restricted to `https://gitlab.com/api/v4/*` only.

### Brave Search MCP

The Brave Search MCP server provides web search, news, images and AI-summarized results.

| Setting | Value |
|---------|-------|
| Type | Local |
| Command | `npx -y @brave/brave-search-mcp-server` |
| Agents | All agents (ask user before use) |

**Prerequisites:**

- Free API key at [api-dashboard.search.brave.com/register](https://api-dashboard.search.brave.com/register)

Required environment variable:

```bash
export BRAVE_API_KEY="BSA-xxxxxxxxxxxxxxxxxxxx"
```

> **Note:** Brave Search is enabled globally. Agents must confirm with the user before invoking any `brave_search_*` tool (limited quota — never auto-invoked).

### Context7 MCP

Context7 resolves library names to up-to-date documentation and code examples, injected directly into agent context.

| Setting | Value |
|---------|-------|
| Type | Remote |
| URL | `https://mcp.context7.com/mcp` |
| Auth | Bearer token (`CONTEXT7_API_KEY`) |
| Agents | all |

**Prerequisites:**

- API key at [context7.com](https://context7.com)

Required environment variable:

```bash
export CONTEXT7_API_KEY="your-context7-api-key"
```

**Usage:** agents call `resolve-library-id` first, then `query-docs` to retrieve targeted docs. No manual intervention needed.

### Kubernetes MCP

The Kubernetes MCP server wraps `kubectl` to expose cluster resources to agents.

| Setting | Value |
|---------|-------|
| Type | Local |
| Command | `npx -y @modelcontextprotocol/server-kubernetes` |
| Agents | `@devops`, `@debug` |

**Prerequisites:**

- `kubectl` installed and configured with a valid context (`kubectl config current-context`)
- The server uses the **current active context** — switch context before starting opencode if needed

```bash
# Verify kubectl context before starting opencode
kubectl config current-context
kubectl get nodes  # sanity check
```

> **Note:** Kubernetes tools are disabled globally and enabled only on `@devops` and `@debug` to avoid burning context on unrelated tasks.

## Notes

- `package.json` and `bun.lock` must stay in git (reproducible dependencies)
- `node_modules/` is ignored (`.gitignore`)
- No test suite — validate changes by opening opencode
- All files in **English** except local documentation

## Links

- [opencode](https://opencode.ai)
- [Conventional Commits](https://www.conventionalcommits.org/)

## License

This project is licensed under the Apache License 2.0. See [LICENSE](./LICENSE) for details.
