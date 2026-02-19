---
name: test-strategy
description: Test pyramid strategy, naming conventions and tooling recommendations for Python, Node.js/TS, Go and Rust
license: MIT
compatibility: opencode
metadata:
  audience: engineers-and-qa
  workflow: testing
---

## What I do
- Define the optimal test pyramid ratio for the project type
- Recommend the right tools per stack and test type
- Provide naming conventions and structural patterns
- Guide on what to test and what NOT to test
- Define CI integration strategy (parallelization, flaky detection, coverage gating)

## Test pyramid ratios

### Backend API / microservice
```
         [E2E: 5%]          — Critical happy paths only
       [Integration: 25%]   — Repository, API contracts, external calls
     [Unit: 70%]            — Business logic, transformations, validators
```

### Frontend application
```
      [E2E: 10%]            — Critical user journeys (login, checkout…)
    [Integration: 30%]      — Component interactions, API mocking
  [Unit: 60%]               — Pure functions, hooks, state management
```

### CLI tool / library
```
  [Integration: 20%]        — Command end-to-end, file I/O
[Unit: 80%]                 — Functions, edge cases, error paths
```

## What to test
✅ Test:
- Business logic (pure functions, algorithms, transformations)
- Error paths and edge cases (empty, null, boundary values)
- Integration with external systems (DB, HTTP, message queues) — with mocks/stubs
- User-facing behavior (not internal implementation)
- Security-sensitive code (auth, input validation, crypto)

❌ Do NOT test:
- Framework internals (trust your dependencies)
- Trivial getters/setters with no logic
- Private methods directly (test via public API)
- Implementation details that change frequently

## Test naming convention
```
# Pattern: [unit]_[condition]_[expected_result]
# Or: should [do something] when [condition]

# Python
def test_calculate_total_returns_zero_for_empty_cart():
def test_user_login_raises_for_invalid_credentials():

# Go
func TestCalculateTotal_EmptyCart_ReturnsZero(t *testing.T)
func TestUserLogin_InvalidCredentials_ReturnsError(t *testing.T)

# Rust
#[test]
fn calculate_total_returns_zero_for_empty_cart() {}

# TypeScript / Vitest / Jest
describe('calculateTotal', () => {
  it('returns zero for an empty cart', () => {})
  it('throws when price is negative', () => {})
})
```

## Tooling by stack

### Python
| Type | Tool | Notes |
|------|------|-------|
| Unit / Integration | pytest | Use fixtures, parametrize, conftest |
| Mocking | pytest-mock, unittest.mock | Prefer dependency injection over monkeypatching |
| Property-based | hypothesis | For complex input validation |
| Coverage | pytest-cov | Gate at 80% in CI |
| Load | locust | Define SLOs before writing tests |

### Node.js / TypeScript
| Type | Tool | Notes |
|------|------|-------|
| Unit / Integration | Vitest (preferred) or Jest | Vitest is faster, native ESM |
| E2E | Playwright | Use page object model, avoid brittle selectors |
| API contract | Pact JS | For microservice contract testing |
| Coverage | V8 (built into Vitest) | Gate at 80% meaningful branches |
| Load | k6 | JS-native, CI-friendly |

### Go
| Type | Tool | Notes |
|------|------|-------|
| Unit / Integration | testing (stdlib) | Table-driven tests, t.Parallel() |
| Assertions | testify/assert | Cleaner failure messages |
| Mocking | gomock, mockery | Generate mocks from interfaces |
| HTTP testing | httptest | Built-in, no external deps |
| Load | k6 | Or `go test -bench` for microbenchmarks |

### Rust
| Type | Tool | Notes |
|------|------|-------|
| Unit | built-in #[test] | Keep in same file as implementation |
| Integration | tests/ directory | Separate crate tests |
| Parametrized | rstest | Fixtures and parametrize |
| Mocking | mockall | Procedural macro-based |
| Benchmarks | criterion | Statistical benchmarks |

## CI integration patterns
```yaml
# Run fast tests first, block on failure
steps:
  - run: test:unit        # < 30s — always run
  - run: test:integration # < 2min — always run
  - run: test:e2e         # < 10min — run on PRs targeting main

# Coverage gate
  - run: coverage check --threshold 80

# Parallelization
  - use: shard strategy for E2E (split by file or by tag)
```

## When to use me
Use when planning a new test suite, reviewing test coverage gaps, or deciding which tests to write first for a new feature.
