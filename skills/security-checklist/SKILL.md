---
name: security-checklist
description: Quick OWASP Top 10 security checklist for code review and pre-ship validation across Python, Node.js/TS, Go and Rust
license: MIT
compatibility: opencode
metadata:
  audience: engineers-and-security
  workflow: security-review
---

## What I do
- Provide a quick OWASP Top 10 checklist for any code review
- Flag common security anti-patterns by stack
- Guide on secrets management, auth patterns and input validation
- Define when to escalate to a full @security audit

## OWASP Top 10 — Quick checklist

### A01 — Broken Access Control
- [ ] Every endpoint checks authentication AND authorization
- [ ] Object IDs are validated for ownership (IDOR protection)
- [ ] Admin-only routes are protected at the router level, not just UI
- [ ] CORS is configured to specific origins, not `*` in production

### A02 — Cryptographic Failures
- [ ] No plaintext passwords in database or logs
- [ ] Password hashing uses bcrypt/argon2/scrypt (NOT MD5/SHA1)
- [ ] HTTPS enforced everywhere (HSTS header set)
- [ ] Sensitive data not stored in localStorage or cookies without `Secure; HttpOnly; SameSite=Strict`
- [ ] JWT secrets are ≥ 256 bits and rotated

### A03 — Injection
- [ ] SQL queries use parameterized statements or ORM (no string concatenation)
- [ ] Shell commands do not interpolate user input
- [ ] HTML output is escaped (no raw innerHTML with user data)
- [ ] GraphQL resolvers validate and sanitize arguments

### A04 — Insecure Design
- [ ] Rate limiting on auth endpoints (login, register, password reset)
- [ ] Account enumeration prevented (same response for invalid user/password)
- [ ] Sensitive operations require re-authentication

### A05 — Security Misconfiguration
- [ ] No debug mode or verbose error messages in production
- [ ] Default credentials changed
- [ ] Unnecessary services/ports disabled
- [ ] Security headers set: `X-Content-Type-Options`, `X-Frame-Options`, `CSP`

### A06 — Vulnerable Components
- [ ] Dependencies are pinned to exact versions in lockfile
- [ ] No known CVEs in direct dependencies (run `npm audit`, `pip-audit`, `govulncheck`, `cargo audit`)
- [ ] Outdated dependencies have a documented update plan

### A07 — Auth & Session Failures
- [ ] Session tokens are invalidated on logout
- [ ] Short session expiry with refresh token rotation
- [ ] No sensitive data in JWT payload (it's base64, not encrypted)
- [ ] MFA available for privileged accounts

### A08 — Software & Data Integrity
- [ ] CI/CD pipeline cannot be influenced by PR authors without review
- [ ] Dependency checksums verified (lockfiles committed)
- [ ] Container images pinned to digest, not just tag

### A09 — Logging & Monitoring
- [ ] Auth events logged (login success, failure, logout, password reset)
- [ ] No PII or secrets in logs
- [ ] Logs are structured (JSON) and shipped to centralized store
- [ ] Alerts configured for anomalous auth patterns

### A10 — SSRF
- [ ] User-supplied URLs are validated against an allowlist
- [ ] Internal network ranges blocked in URL validation
- [ ] Cloud metadata endpoints (169.254.169.254) explicitly blocked

## Stack-specific quick checks

### Python
```python
# ❌ VULNERABLE
query = f"SELECT * FROM users WHERE id = {user_id}"
subprocess.run(f"process {user_input}", shell=True)

# ✅ SAFE
query = "SELECT * FROM users WHERE id = %s"
cursor.execute(query, (user_id,))
subprocess.run(["process", user_input], shell=False)
```

### Node.js / TypeScript
```typescript
// ❌ VULNERABLE
res.send(`<div>${req.body.name}</div>`)   // XSS
db.query(`SELECT * FROM users WHERE id = ${id}`)  // SQLi

// ✅ SAFE
res.send(escapeHtml(req.body.name))
db.query('SELECT * FROM users WHERE id = $1', [id])
```

### Go
```go
// ❌ VULNERABLE
tmpl.Execute(w, template.HTML(userInput))  // XSS bypass
cmd := exec.Command("sh", "-c", userInput)  // Shell injection

// ✅ SAFE
tmpl.Execute(w, userInput)  // auto-escaped
cmd := exec.Command("process", userInput)   // no shell
```

### Rust
```rust
// ❌ VULNERABLE
let query = format!("SELECT * FROM users WHERE id = {}", id);

// ✅ SAFE
sqlx::query!("SELECT * FROM users WHERE id = $1", id)
```

## Secrets management
- **Never** hardcode secrets in source code
- Use environment variables loaded from `.env` (gitignored) locally
- Production: use Vault, AWS Secrets Manager, GCP Secret Manager, or Doppler
- Rotate secrets on any suspected exposure immediately
- Use `git-secrets` or `detect-secrets` pre-commit hooks

## When to escalate to @security
- Any finding rated 🔴 Critical or multiple 🟡 Important
- New auth/authz system being designed
- Crypto implementation (JWT, encryption, signing)
- Payment or PII data handling
- Infrastructure/IaC changes with IAM implications

## When to use me
Use before any PR/MR merge to quickly scan for the most common security issues. For deep audits, use @security with Trivy MCP.
