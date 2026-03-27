---
name: "senior-architect"
description: "Design and analyze system architecture. Create architecture diagrams, analyze dependencies and technical debt, evaluate database selection, design scalable systems, and create Architecture Decision Records (ADRs). Use when: designing systems, evaluating architecture, analyzing dependencies, selecting databases, planning scalability."
---

# Senior Architect

Design and evaluate system architecture for scalable, maintainable systems.

## Core Capabilities

### Architecture Diagram Generator
Creates visual representations of system architecture in multiple formats:
- **Mermaid diagrams** — Component relationships and data flow
- **PlantUML diagrams** — Deployment topology and system structure
- **ASCII diagrams** — Quick sketches and documentation
- Shows components, layers, services, and dependencies

### Dependency Analyzer
Examines project dependencies to identify issues:
- Circular dependency detection
- Coupling analysis between modules
- Outdated package identification
- Version mismatch issues
- Supports: npm, Python, Go, Rust projects

### Project Architect
Analyzes code organization and structure:
- Identifies architectural patterns (MVC, layered, microservices, etc.)
- Detects code smells (god classes, tight coupling, etc.)
- Provides refactoring recommendations
- Visualizes module dependencies

## Decision Workflows

### Database Selection
Guides choosing between SQL and NoSQL:
1. Analyze data characteristics (structured vs. unstructured)
2. Evaluate consistency and scaling requirements
3. Consider query patterns and access methods
4. Assess team expertise
5. Recommend appropriate database technology

### Architecture Patterns
Match design patterns to team and project:
- **Monolithic**: Simpler deployments, tighter coupling
- **Microservices**: Independent scaling, operational complexity
- **Event-Driven**: Loose coupling, eventual consistency
- **Layered**: Traditional separation of concerns

### Monolith vs. Microservices
Decision checklist:
- Team size and structure
- Feature delivery velocity requirements
- Scale and performance needs
- Deployment flexibility
- Operational complexity tolerance

## When to Use

Activate this skill when:
- Designing new system architecture
- Evaluating existing architecture for improvements
- Analyzing dependencies and identifying technical debt
- Selecting database technologies
- Planning for scalability
- Creating Architecture Decision Records (ADRs)
- Technology stack selection

## Supported Tech Stacks

- **Languages**: TypeScript, Python, Go, Rust, Java
- **Frameworks**: React, Node.js, Django, FastAPI, Spring
- **Databases**: PostgreSQL, MongoDB, Redis, DynamoDB, Firestore
- **Cloud**: AWS, GCP, Azure, Kubernetes
- **Patterns**: REST, GraphQL, Event-Driven, CQRS, Event Sourcing

## Typical Workflow

1. **Define System Requirements**
   - User scale and growth projections
   - Data volume and access patterns
   - Latency and throughput requirements
   - Consistency and availability needs

2. **Evaluate Options**
   - Compare architecture patterns
   - Assess technology choices
   - Analyze trade-offs
   - Consider team capabilities

3. **Document Decision**
   - Create Architecture Decision Record (ADR)
   - Design system diagrams
   - Define component boundaries
   - Plan implementation phases

4. **Analyze Dependencies**
   - Review current codebase
   - Identify coupling issues
   - Recommend refactoring
   - Plan migration if needed

---

**Source:** [Senior Architect](https://github.com/alirezarezvani/claude-skills/tree/main/engineering-team/senior-architect)
**License:** MIT
