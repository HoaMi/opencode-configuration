# opencode configuration

⚠️ Personal Configuration

Personal repository to manage and version [opencode](https://opencode.ai) configuration. This contains personal agent prompts and conventions

## Structure

```
.
├── opencode.json          # Master config (models, agents, tools, permissions)
├── validate-config.mjs    # JSON5-aware config validator (node validate-config.mjs)
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
- **Validate** → `node validate-config.mjs`, then reload opencode (`ctrl+x n`)

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
| `/brainstorm-quick` | @architect-brainstorm | 3-model brainstorm · 3 calls · fast synthesis |
| `/brainstorm-debate` | @architect-brainstorm | 3-model brainstorm · 6 calls · 2 rounds · convergence score |
| `/brainstorm-redteam` | @architect-brainstorm | 3-model brainstorm · dual attack (tech + ops) + harden |
| `/brainstorm-perspectives` | @architect-brainstorm | 3-model brainstorm · risk / opportunity / business lenses |
| `/brainstorm-delphi` | @architect-brainstorm | 3-model brainstorm · iterative consensus · ARCH-C mediates |

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

# ── Brainstorm — 3-model confrontation ────────────────────────────────────────
export OPENCODE_MODEL_ARCH_PRAGMATIST="opencode/claude-opus-4-6"   # ARCH-A
export OPENCODE_MODEL_ARCH_INNOVATOR="opencode/gpt-5.3-codex"      # ARCH-B
export OPENCODE_MODEL_ARCH_CONTRARIAN="opencode/minimax-m2.5-free" # ARCH-C

# ── AWS MCP servers ───────────────────────────────────────────────────────────
export AWS_PROFILE="default"           # AWS profile for aws-cost, aws-api, eks MCPs
export AWS_REGION="eu-west-3"          # AWS region
```

## Brainstorm Mode

Five dedicated commands activate a **3-model architectural debate** between three opposing personas, inspired by [Mysti](https://github.com/DeepMyst/Mysti)'s Brainstorm Collaboration feature.

| Persona | Model | Philosophy |
|---------|-------|-----------|
| **ARCH-A** "The Pragmatist" | `opencode/claude-opus-4-6` | Simplicity, proven patterns, operational cost, TCO |
| **ARCH-B** "The Innovator" | `opencode/gpt-5.3-codex` | Scalability, correctness, future-proofing, modern patterns |
| **ARCH-C** "The Contrarian" | `opencode/minimax-m2.5-free` | Challenges assumptions, business/ops reality, convergence assessor |

### Commands and strategies

| Command | Calls | Use when |
|---------|-------|---------|
| `/brainstorm-quick` | 3 | Time-boxed decision, quick trade-off exploration |
| `/brainstorm-debate` | 6 | Standard architectural decision — positions + defense rounds |
| `/brainstorm-redteam` | 6 | Security-sensitive design, failure modes, high blast-radius — ARCH-B attacks technical, ARCH-C attacks operational/business |
| `/brainstorm-perspectives` | 3 | Technology selection, build-vs-buy — risk / opportunity / business-reality lenses |
| `/brainstorm-delphi` | 6–8 | Complex multi-factor decisions — iterative consensus, ARCH-C mediates until ≥7/10 convergence |

### Usage

```
/brainstorm-debate should we use a monolith or microservices for this project?
/brainstorm-redteam design of the authentication system
/brainstorm-perspectives PostgreSQL vs MongoDB for the user events store
/brainstorm-delphi event-driven vs request-response for the notification service
/brainstorm-quick which caching strategy for the API layer?
```

### How it works

1. **Pre-debate**: `@explore` maps the codebase and produces a SCOPE block — injected into all three agents' first prompts (skipped for greenfield topics)
2. **Debate rounds**: ARCH-A, ARCH-B and ARCH-C exchange positions according to the chosen strategy
3. **Escalation signals**: all three personas emit `SECURITY_ESCALATION`, `TEST_GAP` or `ARCH_QUESTION` when warranted; ARCH-C can also emit `REFRAME` if the problem statement itself is flawed — the orchestrator pauses and surfaces it to the user before continuing
4. **Convergence**: ARCH-C scores agreement (0–10) in Round 2+ for Debate and Delphi; ≥7/10 triggers synthesis, otherwise additional rounds are added (Delphi max 3 rounds)
5. **Synthesis**: ends with a **Decision Log**, a **Risks & Mitigations** table, a **Validated Assumptions** section, and a **HANDOFF** to `@architect` (ADR) or `@plan` (implementation)

> **Note:** `@architect-brainstorm`, `@arch-pragmatist`, `@arch-innovator` and `@arch-contrarian`
> are only reachable via `/brainstorm-*` commands — never invoked automatically by other agents.

### Required env vars (`~/.zshrc`)

```bash
export OPENCODE_MODEL_ARCH_PRAGMATIST="opencode/claude-opus-4-6"
export OPENCODE_MODEL_ARCH_INNOVATOR="opencode/gpt-5.3-codex"
export OPENCODE_MODEL_ARCH_CONTRARIAN="opencode/minimax-m2.5-free"
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
| `aws-cost` | local | `@devops`, `@architect` | `AWS_PROFILE` + `AWS_REGION` + IAM |
| `aws-docs` | local | all — ask first | none (public docs) |
| `aws-api` | local | `@devops` | `AWS_PROFILE` + `AWS_REGION` (preview) |
| `eks` | local | `@devops`, `@debug` | `AWS_PROFILE` + `AWS_REGION` |
| `git` | local | `@reviewer`, `@debug`, `@explore` | none (uses CWD) — write tools blocked globally |
| `filesystem` | local | `@build`, `@backend`, `@frontend`, `@devops`, `@docs` | none — allowed root: `$HOME` |

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
| Command | `npx -y mcp-server-kubernetes` |
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
- Run `node validate-config.mjs` after editing `opencode.json` to catch parse errors and missing agent fields before reloading opencode

## Links

- [opencode](https://opencode.ai)
- [Conventional Commits](https://www.conventionalcommits.org/)

## License

This project is licensed under the Apache License 2.0. See [LICENSE](./LICENSE) for details.
