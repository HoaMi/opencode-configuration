---
name: api-design
description: REST and GraphQL API design conventions — versioning, contracts, error formats, pagination, naming and backward compatibility
license: MIT
compatibility: opencode
metadata:
  audience: backend-engineers
  workflow: api-development
---

## What I do
- Define naming conventions, URL structure and HTTP semantics for REST APIs
- Provide GraphQL schema conventions and query/mutation patterns
- Guide versioning strategy and breaking change management
- Define standard error response formats
- Provide pagination and filtering patterns

## REST API conventions

### URL structure
```
# Resources: plural nouns, kebab-case
GET    /users
GET    /users/{id}
POST   /users
PATCH  /users/{id}       # partial update
PUT    /users/{id}        # full replace
DELETE /users/{id}

# Nested resources (max 2 levels deep)
GET    /users/{id}/orders
GET    /users/{id}/orders/{orderId}

# Actions (use sparingly, prefer state transitions)
POST   /users/{id}/activate
POST   /orders/{id}/cancel

# Versioning: URL prefix (preferred for breaking changes)
GET    /v1/users
GET    /v2/users
```

### HTTP status codes
| Code | Meaning |
|------|---------|
| 200 | OK — read/update success |
| 201 | Created — POST success |
| 204 | No Content — DELETE success |
| 400 | Bad Request — validation error |
| 401 | Unauthorized — missing/invalid auth |
| 403 | Forbidden — valid auth, insufficient permission |
| 404 | Not Found |
| 409 | Conflict — duplicate or state conflict |
| 422 | Unprocessable Entity — semantic validation error |
| 429 | Too Many Requests — rate limited |
| 500 | Internal Server Error — never expose stack traces |

### Standard error format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "email",
        "code": "INVALID_FORMAT",
        "message": "Must be a valid email address"
      }
    ],
    "request_id": "req_abc123",
    "timestamp": "2026-02-19T12:00:00Z"
  }
}
```

### Pagination (cursor-based — preferred over offset for large datasets)
```json
// Request
GET /users?limit=20&cursor=eyJ...

// Response
{
  "data": [...],
  "pagination": {
    "limit": 20,
    "next_cursor": "eyJ...",
    "has_more": true,
    "total": 1542
  }
}
```

### Filtering and sorting
```
GET /users?status=active&role=admin
GET /users?sort=created_at&order=desc
GET /users?fields=id,email,name   # sparse fieldsets
```

## GraphQL conventions

### Schema naming
- Types: PascalCase (`UserProfile`, `OrderItem`)
- Fields: camelCase (`createdAt`, `userId`)
- Enums: SCREAMING_SNAKE_CASE (`ORDER_STATUS`, `USER_ROLE`)
- Mutations: verb + noun (`createUser`, `updateOrder`, `deleteComment`)

### Mutation response pattern
```graphql
type CreateUserPayload {
  user: User
  errors: [UserError!]!
}

type UserError {
  field: String
  code: String!
  message: String!
}
```

### Pagination (Relay spec — preferred)
```graphql
type UserConnection {
  edges: [UserEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}
```

## Breaking vs non-breaking changes

### ✅ Non-breaking (safe to ship)
- Adding new optional fields to responses
- Adding new optional query parameters
- Adding new endpoints
- Adding new enum values (be careful with exhaustive switches client-side)

### 🔴 Breaking (requires version bump or feature flag)
- Removing or renaming existing fields
- Changing field types
- Making optional fields required
- Changing HTTP status codes
- Removing endpoints

## Versioning strategy
1. **Minor/patch** → backward compatible, ship without version bump
2. **Major** → create `/v2/` prefix, maintain `/v1/` for 6-12 months minimum
3. **Deprecation** → add `Sunset` and `Deprecation` headers, document migration path

## When to use me
Use when designing or reviewing any REST or GraphQL API — new endpoints, schema changes, or client contract reviews.
