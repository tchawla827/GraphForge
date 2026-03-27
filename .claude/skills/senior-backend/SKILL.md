---
name: "senior-backend"
description: "Design and implement robust backend systems. Generate API scaffolding, optimize databases, implement authentication/security, design microservices, and load test APIs. Use when: building REST APIs, optimizing database performance, implementing security, designing backend architecture."
---

# Senior Backend Engineer

Design and implement robust, scalable backend systems with security and performance.

## Core Capabilities

### API Scaffolder
Generates complete API implementations from schemas:
- Creates route handlers and middleware
- Generates OpenAPI specifications
- Supports Express, Fastify, Koa frameworks
- Includes validation and error handling
- Produces typed request/response definitions

### Database Migration Tool
Manages schema evolution safely:
- Analyzes schema changes
- Generates migrations with rollback capability
- Provides optimization recommendations
- Detects performance bottlenecks
- Supports PostgreSQL, MySQL, MongoDB

### API Load Tester
Measures API performance and reliability:
- HTTP load testing with configurable concurrency
- Measures latency percentiles (p50, p95, p99)
- Calculates throughput and error rates
- Identifies performance bottlenecks
- Supports attack pattern testing

## Key Workflows

### API Design & Development

1. **Define API Schema**
   - Use OpenAPI/Swagger format
   - Define resources and operations
   - Specify request/response schemas
   - Document error responses

2. **Generate Implementation**
   - Scaffold route handlers
   - Create middleware layer
   - Generate validation from schema
   - Set up error handling

3. **Implement Business Logic**
   - Add authentication/authorization
   - Implement data persistence
   - Add caching strategies
   - Handle edge cases

4. **Maintain Documentation**
   - Auto-generate API docs
   - Keep OpenAPI spec in sync
   - Document breaking changes
   - Track API versions

### Database Optimization

1. **Analyze Performance**
   - Identify slow queries
   - Review query execution plans
   - Check index usage
   - Measure disk I/O

2. **Generate Improvements**
   - Suggest indexes
   - Recommend query refactoring
   - Identify schema issues
   - Propose denormalization opportunities

3. **Test & Apply**
   - Dry-run migration
   - Measure performance improvement
   - Verify backward compatibility
   - Plan rollback strategy

### Security Hardening

1. **Configure Authentication**
   - Implement JWT with environment-based secrets
   - Set secure token expiration
   - Add refresh token rotation
   - Implement session management

2. **Add Protection Layers**
   - Rate limiting middleware
   - CORS configuration
   - CSRF protection
   - Security headers (Helmet.js)

3. **Validate & Protect**
   - Input validation from schema
   - Output sanitization
   - SQL injection prevention
   - XSS protection

4. **Test Security**
   - Load test with attack patterns
   - Verify rate limiting effectiveness
   - Test authentication flows
   - Validate error message safety

## Response Standards

### Success Response
```json
{
  "data": {
    "id": "123",
    "name": "Resource"
  },
  "meta": {
    "requestId": "req-abc123",
    "timestamp": "2026-03-27T10:00:00Z"
  }
}
```

### Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      {
        "field": "email",
        "issue": "Invalid format"
      }
    ]
  },
  "meta": {
    "requestId": "req-abc123"
  }
}
```

## Supported Technologies

- **Frameworks**: Express.js, Fastify, Koa, Hapi, NestJS
- **Languages**: Node.js, TypeScript, JavaScript
- **Databases**: PostgreSQL, MySQL, MongoDB, DynamoDB
- **Authentication**: JWT, OAuth 2.0, API Keys, mTLS
- **Caching**: Redis, Memcached
- **Testing**: Jest, Mocha, Artillery

## Quick Commands

```bash
# API scaffolding
/senior-backend api-scaffold --schema openapi.yaml --framework fastify

# Database analysis
/senior-backend db-analyze --connection postgresql://...

# Load testing
/senior-backend load-test https://api.example.com/endpoint --rps 100 --duration 60s
```

---

**Source:** [Senior Backend Engineer](https://github.com/alirezarezvani/claude-skills/tree/main/engineering-team/senior-backend)
**License:** MIT
