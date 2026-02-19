---
name: git-commit
description: Generate consistent Conventional Commits messages across Python, Node.js/TS, Go and Rust projects
license: MIT
compatibility: opencode
metadata:
  audience: all-developers
  workflow: version-control
---

## What I do
- Analyze `git diff --cached` (staged) or `git diff` (unstaged) to understand the change
- Determine the correct Conventional Commits type and scope
- Produce a ready-to-use commit message under 72 characters
- Add a body when the change is non-obvious (breaking changes, migrations, security fixes)

## Conventional Commits format
```
<type>(<scope>): <description>

[optional body]

[optional footer: BREAKING CHANGE: ... | Closes #NNN]
```

## Types
| Type | When to use |
|------|-------------|
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |
| `refactor` | Code restructure, no behavior change |
| `perf` | Performance improvement |
| `test` | Adding or fixing tests |
| `build` | Build system, dependencies |
| `ci` | CI/CD pipeline changes |
| `chore` | Tooling, config, housekeeping |

## Scope conventions by stack
- **Python**: module name (e.g. `api`, `auth`, `models`, `migrations`)
- **Node.js/TS**: package or module (e.g. `server`, `client`, `prisma`, `routes`)
- **Go**: package name (e.g. `handler`, `store`, `middleware`)
- **Rust**: crate or module (e.g. `core`, `cli`, `http`, `db`)

## Rules
- Subject line: imperative mood, lowercase, no period, max 72 chars
- Body: explain WHY, not WHAT (the diff already shows what)
- BREAKING CHANGE footer required if API/behavior changes
- Never include file paths or line numbers in the subject
- Never commit — only generate the message

## Examples
```
feat(auth): add OAuth2 PKCE flow for mobile clients

fix(db): prevent N+1 query in user list endpoint

Closes #142

refactor(middleware): extract rate limiter into standalone module

BREAKING CHANGE: rate limiter config moved from app.config to ratelimit.config
```

## When to use me
Use when you need to write or review a commit message. Works in any repository regardless of stack.
