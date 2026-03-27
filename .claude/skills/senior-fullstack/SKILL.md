---
name: "senior-fullstack"
description: "Build complete fullstack applications. Scaffold projects across multiple stacks, analyze code quality and security, provide technology guidance, and design full systems. Use when: building new projects, auditing codebases, selecting technology stacks, planning fullstack architecture."
---

# Senior Fullstack Engineer

Design and build complete fullstack applications with modern tech stacks.

## Core Capabilities

### Project Scaffolding
Generates complete fullstack boilerplate:

#### Next.js 14+ Stack
- Frontend: React 18 with TypeScript
- Backend: API routes with middleware
- Database: PostgreSQL with ORM
- Styling: Tailwind CSS
- Features: Auth, API client, database setup

#### FastAPI + React Stack
- Backend: FastAPI with async support
- Frontend: React with TypeScript
- API: Auto-generated OpenAPI docs
- Database: PostgreSQL with SQLAlchemy
- Authentication: JWT tokens

#### MERN Stack
- Frontend: React with Redux/Context
- Backend: Express.js with Node.js
- Database: MongoDB with Mongoose
- API: RESTful endpoints
- Authentication: Sessions and JWT

#### Django + React Stack
- Backend: Django REST Framework
- Frontend: React with TypeScript
- Database: PostgreSQL
- Admin: Django admin interface
- Authentication: Django user system

### Code Quality Analysis
Evaluates entire codebases for quality:

**Security Vulnerabilities:**
- Hardcoded secrets and API keys
- SQL injection risks
- XSS vulnerability patterns
- Authentication weaknesses
- Insecure dependencies

**Code Metrics:**
- Complexity scoring
- Test coverage analysis
- Type safety evaluation
- Performance bottlenecks
- Technical debt assessment

**Output:**
- Quality score (0-100)
- Severity categorization (Critical, High, Medium, Low)
- Actionable recommendations
- Remediation priorities

### Technology Guidance
Helps choose the right tech stack:

**Considerations:**
- SEO requirements (SSR, SSG needed?)
- Backend complexity (simple CRUD vs. complex logic)
- Real-time features (WebSockets, Server-Sent Events)
- Team expertise and preferences
- Scale and performance needs
- Deployment infrastructure

## Primary Workflows

### New Project Setup

1. **Choose Stack**
   - Next.js (fastest to market, monolithic)
   - FastAPI + React (Python backend preference)
   - MERN (MongoDB, JavaScript everywhere)
   - Django + React (Django ecosystem preference)

2. **Generate Project**
   - Scaffold complete boilerplate
   - Install dependencies
   - Verify installation
   - Run development server

3. **Run Quality Checks**
   - Lint code
   - Type checking
   - Unit tests
   - Build verification

4. **Configure Environment**
   - Database setup
   - Environment variables
   - Authentication
   - API configuration

5. **Start Development**
   - Implement features
   - Write tests
   - Monitor code quality
   - Deploy when ready

### Codebase Auditing

1. **Analyze Codebase**
   - Run comprehensive scan
   - Check all metrics
   - Identify vulnerabilities
   - Calculate quality score

2. **Prioritize Findings**
   - Critical security issues first
   - High-impact bugs next
   - Code quality improvements
   - Performance optimizations

3. **Remediate Issues**
   - Fix vulnerabilities
   - Refactor problematic code
   - Improve test coverage
   - Add type safety

4. **Re-validate**
   - Run analysis again
   - Verify improvements
   - Update documentation
   - Plan ongoing monitoring

### Stack Selection

**Decision Matrix Factors:**

| Factor | Next.js | FastAPI + React | MERN | Django + React |
|--------|---------|-----------------|------|----------------|
| **Learning Curve** | Easy | Medium | Medium | Medium |
| **Team Expertise** | TS/JS | Python + React | JavaScript | Python |
| **Time to Market** | Fastest | Fast | Medium | Fast |
| **Scalability** | High | Very High | High | High |
| **Maintenance** | Easy | Easy | Medium | Easy |
| **Testing** | Excellent | Excellent | Good | Excellent |

**Choose Based On:**
- **Next.js:** Maximum speed, team comfortable with TypeScript, SEO important
- **FastAPI:** Python team, real-time features, high concurrency
- **MERN:** JavaScript-only team, MongoDB preferred, flexibility important
- **Django:** Python expertise, ORM preference, admin interface needed

## Supported Technology Stacks

### Frontend
- **Frameworks:** Next.js, React, Remix
- **Languages:** TypeScript, JavaScript
- **Styling:** Tailwind CSS, CSS Modules, Styled Components
- **State:** TanStack Query, Zustand, Redux
- **Testing:** Vitest, Jest, React Testing Library

### Backend
- **Node.js:** Express, Fastify, NestJS
- **Python:** FastAPI, Django, Django REST
- **Databases:** PostgreSQL, MongoDB, MySQL
- **Authentication:** JWT, OAuth, Sessions
- **Testing:** Jest, Pytest, unittest

### DevOps
- **Containerization:** Docker, Kubernetes
- **Cloud:** AWS, Vercel, Railway, Heroku
- **CI/CD:** GitHub Actions, GitLab CI
- **Monitoring:** Datadog, New Relic, Sentry

## Typical Workflow

### Project Creation

```
1. Define Requirements
   ├── User scale
   ├── Data models
   ├── Real-time needs
   └── Team expertise

2. Select Stack
   ├── Evaluate options
   ├── Discuss trade-offs
   └── Make decision

3. Generate & Setup
   ├── Scaffold project
   ├── Install dependencies
   ├── Configure environment
   └── Verify setup

4. Implement Features
   ├── Design database
   ├── Build APIs
   ├── Create frontend
   ├── Write tests
   └── Deploy
```

### Code Quality Cycle

```
1. Establish Baseline
   ├── Run initial analysis
   ├── Identify quick wins
   └── Plan improvements

2. Address Critical Issues
   ├── Fix security vulns
   ├── Fix bugs
   └── Verify fixes

3. Improve Quality
   ├── Refactor code
   ├── Add tests
   ├── Improve types
   └── Document code

4. Monitor Ongoing
   ├── Regular scans
   ├── Prevent regressions
   └── Track progress
```

## Quick Commands

```bash
# Project scaffolding
/senior-fullstack new-project --stack nextjs --features auth,db

# Code quality analysis
/senior-fullstack audit --report detailed --format html

# Technology recommendation
/senior-fullstack recommend-stack --seo true --realtime true
```

---

**Source:** [Senior Fullstack Engineer](https://github.com/alirezarezvani/claude-skills/tree/main/engineering-team/senior-fullstack)
**License:** MIT
