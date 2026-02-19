---
name: code-review
description: Standard code review checklist for Python, Node.js/TS, Go and Rust — quality, correctness, security and maintainability
license: MIT
compatibility: opencode
metadata:
  audience: tech-leads-and-engineers
  workflow: pull-request
---

## What I do
- Provide a systematic review checklist adapted to the detected stack
- Classify findings by severity: 🔴 Blocking | 🟡 Important | 🟢 Suggestion
- Flag patterns that commonly introduce bugs, security issues or tech debt
- Acknowledge good patterns explicitly

## Review checklist (all stacks)

### Correctness
- [ ] Logic is correct for all documented edge cases
- [ ] No off-by-one errors, null dereferences, or unhandled empty collections
- [ ] Error paths are handled and not silently swallowed
- [ ] Concurrency: shared state is protected (locks, channels, atomic types)

### Naming & readability
- [ ] Names are descriptive and consistent with the codebase conventions
- [ ] No magic numbers or unexplained constants
- [ ] Functions do one thing (Single Responsibility)
- [ ] Complexity is justified with a comment if unavoidable

### Security (quick check — escalate to @security for deep audit)
- [ ] No hardcoded secrets, API keys or passwords
- [ ] User inputs are validated and/or sanitized before use
- [ ] SQL queries use parameterized statements (no string concatenation)
- [ ] File paths are validated to prevent path traversal
- [ ] Auth/authz checks are present on sensitive operations

### Tests
- [ ] New behavior has corresponding tests
- [ ] Tests assert behavior, not implementation details
- [ ] Edge cases and error paths are tested
- [ ] No test uses production credentials or external services directly

### Performance (flag, do not block unless critical)
- [ ] No obvious N+1 queries in loops
- [ ] Large data sets are paginated or streamed, not loaded entirely in memory
- [ ] No unnecessary blocking calls in async code

## Stack-specific checks

### Python
- [ ] Type hints present on public functions
- [ ] No bare `except:` clauses — catch specific exceptions
- [ ] Context managers used for resources (files, DB connections)
- [ ] No mutable default arguments (`def f(x=[])` is a bug)

### Node.js / TypeScript
- [ ] No `any` types without justification
- [ ] Promises are awaited or `.catch()` handled — no floating promises
- [ ] No `console.log` left in production code
- [ ] ESM/CJS boundary issues checked for library code

### Go
- [ ] Errors are handled, not ignored with `_`
- [ ] Goroutines have clear ownership and lifecycle management
- [ ] No unbounded goroutine creation in loops
- [ ] Exported types and functions have godoc comments

### Rust
- [ ] `unwrap()` and `expect()` justified — prefer `?` or proper error handling
- [ ] Lifetimes are sound — no use-after-free patterns
- [ ] `unsafe` blocks are minimal, justified and commented
- [ ] `clone()` usage is intentional, not a workaround for borrow issues

## Output format
```
STATUS: ✅ APPROVED | ⚠️ CHANGES_REQUESTED | 🔴 BLOCKING_ISSUES

**Summary**: [2-sentence overall assessment]

🔴 Blocking
- [file:line] — [issue] — [recommended fix]

🟡 Important
- [file:line] — [issue]

🟢 Suggestions
- [brief note]

✅ Positive patterns
- [what was done well]
```

## When to use me
Use before any PR/MR review to ensure systematic, consistent coverage across all reviewers.
