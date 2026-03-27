---
name: "brainstorming"
description: "Turn ideas into validated designs before implementation. Explore context, ask clarifying questions, propose approaches, present designs, and write specification documents. Use when: starting new features, designing systems, gathering requirements, planning implementation, validating ideas."
---

# Brainstorming: Ideas Into Designs

Structured process for turning ideas into validated designs before any implementation begins.

## Core Principle

**Hard Gate:** Do NOT invoke any implementation skill, write any code, scaffold any project, or take any implementation action until you have presented a design and the user has approved it.

This applies universally—regardless of project complexity, timeline, or how "simple" the feature seems.

## Process Steps

### 1. Explore Project Context

Review existing files and documentation to understand:

```
- Project structure and organization
- Existing patterns and conventions
- Current architecture
- Related existing features
- Technology stack
- Code style and conventions
```

Read relevant files:
- `README.md` — Project overview
- `CLAUDE.md` — Project guidelines
- `docs/` — Architecture documentation
- Recent commits — What's changing
- Issue/PR history — What's being worked on

### 2. Offer Visual Companion (If Appropriate)

For visual content, offer a browser-based design tool:

```
"Would a visual mockup/diagram help with this?
I can offer a browser-based tool if you'd like to
explore layouts or system diagrams together."
```

**Visual content benefits:** layouts, information architecture, data flows, system diagrams
**Stay text-based:** requirements, validation rules, business logic, API design

### 3. Ask Clarifying Questions

Ask one question at a time to understand:

```
Purpose:
- What problem does this solve?
- Who are the users?
- What are the success metrics?

Constraints:
- Timeline or deadlines?
- Performance requirements?
- Security/compliance needs?
- Browser/platform support?

Scope:
- What's included? What's NOT included?
- Any phased rollout needed?
- Dependencies on other features?
```

**Prefer multiple-choice questions** when possible:

```
✅ "Should this be a separate page or a modal popup?"
❌ "How should we implement this?"
```

### 4. Propose 2-3 Approaches

Present approaches with trade-offs:

```
Approach A: [Description]
- Pros: ...
- Cons: ...
- When to use: ...

Approach B: [Description]
- Pros: ...
- Cons: ...
- When to use: ...

Recommendation: Approach B because ...
```

### 5. Present Design

Present design in appropriately-scaled sections, getting approval after each:

```
Design for: [Feature Name]

Section 1: Data Model
[Entity definitions, relationships, schema]
👍 Approve / 👎 Revise?

Section 2: User Interface
[Layouts, flows, interactions]
👍 Approve / 👎 Revise?

Section 3: API/Integration
[Endpoints, contracts, integration points]
👍 Approve / 👎 Revise?

Section 4: Implementation Plan
[Steps, dependencies, timeline]
👍 Approve / 👎 Revise?
```

### 6. Write Design Spec

Create detailed specification document:

```
docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md
```

Structure:

```markdown
# Design Spec: [Feature Name]

## Overview
Brief description of the feature.

## Purpose & Goals
What problem does this solve?
Who benefits?
Success metrics?

## Data Model
Entity definitions, relationships, constraints.

## User Interface
Screens, layouts, workflows, interactions.

## API / Integration
Endpoints, contracts, data flows.

## Implementation Details
Technical approach, technology choices.

## Edge Cases & Error Handling
Validation rules, error scenarios.

## Testing Strategy
Test plan, validation approach.

## Rollout Plan
Phased deployment strategy if needed.

## Assumptions
What we're assuming to be true?

## Open Questions
Anything still to be decided?
```

### 7. Self-Review Spec

Before user reviews, check for:

```
Placeholders:
- [ ] No TODO or FIXME left in spec
- [ ] All [FILL_IN] sections completed
- [ ] No "TBD" remaining

Clarity:
- [ ] Each section has clear content
- [ ] No ambiguous references
- [ ] No internal contradictions
- [ ] Diagrams/examples where helpful

Completeness:
- [ ] Data model fully defined
- [ ] UI flows clearly described
- [ ] Integration points documented
- [ ] Error cases considered
```

### 8. User Reviews Written Spec

Present spec to user for approval:

```
"Here's the detailed spec. Please review and let me
know:
1. Does this match your vision?
2. Any sections that need revision?
3. Any missing considerations?
4. Ready to proceed with implementation?"
```

### 9. Transition to Implementation

Once approved, invoke the writing-plans skill:

```
The user has approved the design. Let me create
an implementation plan using /writing-plans.
```

Only invoke /writing-plans after design approval.

## Key Principles

### Break Into Smaller Units

Design systems as compositions of smaller, focused components:

```
Feature Request: "Build a user management system"

Breaks into:
- User listing page
  - Search/filter component
  - User table component
  - Pagination component
- User detail page
  - User form component
  - Permissions editor component
  - Activity log component
- User creation workflow
  - Create form
  - Email verification
  - Welcome email

Each with clear purpose and well-defined interfaces.
```

### Follow Existing Patterns

When working in established projects:

```
Study the codebase:
- How are similar features built?
- What naming conventions are used?
- What folder structure is typical?
- What libraries/frameworks are standard?

Design to match:
- Use existing patterns
- Follow naming conventions
- Suggest components that fit architecture
- Leverage existing utilities
```

### Address Scope Decomposition

If request describes multiple independent systems:

```
Request: "Build a new dashboard with reports, analytics,
and export functionality"

Decompose:
❌ One big design
✅ Three separate designs:
   1. Dashboard overview
   2. Analytics engine
   3. Export system

Design each independently with clear integration points.
```

### Use Multiple-Choice Questions

When asking clarifying questions:

```
❌ "How should we organize the code?"
✅ "Should we organize by feature or by layer?"

❌ "What database should we use?"
✅ "SQL database (PostgreSQL/MySQL) or NoSQL (MongoDB)?"

❌ "How many results per page?"
✅ "25, 50, or 100 results per page?"
```

### Apply YAGNI Ruthlessly

Remove unnecessary features before design:

```
Feature request: "User management with admin console,
two-factor auth, audit logging, and SAML integration"

Design discussion:
- Admin console: Core feature ✅
- Two-factor auth: Nice-to-have, can add later ❌
- Audit logging: Compliance requirement ✅
- SAML integration: No current users need it ❌

Design for: Admin console + Audit logging
Plan future work: 2FA, SAML in later phases
```

## Design Document Template

```markdown
---
date: YYYY-MM-DD
feature: Feature Name
status: draft
---

# Design: [Feature Name]

## Executive Summary
[2-3 sentence description of what you're building]

## Problem Statement
[What problem are we solving?]
[Why does it matter?]
[Who benefits?]

## Goals
- Primary goal 1
- Primary goal 2
- Success metric 1
- Success metric 2

## Non-Goals
- Feature we're explicitly NOT building
- Edge case we're deferring
- Performance target we're not chasing

## Data Model

### User
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  ...
)
```

### [Entity Name]
[Entity definition]

## User Interface

### Page: [Page Name]
[Description and layout]

[Wireframe or ASCII diagram]

User interactions:
1. User sees...
2. User clicks...
3. System responds with...

### Error Cases
- Validation error: [How shown?]
- Server error: [How handled?]

## API Design

### GET /api/[resource]
Request:
```json
{
  "query": "search term",
  "page": 1
}
```

Response:
```json
{
  "data": [...],
  "meta": { "total": 100 }
}
```

### POST /api/[resource]
[Request/response structure]

## Implementation Strategy

### Phase 1: MVP
- [Feature subset 1]
- [Feature subset 2]
Timeline: [2 weeks?]

### Phase 2: Enhancement
- [Additional feature 1]
Timeline: [future]

## Testing Plan

### Unit Tests
[What to test?]

### Integration Tests
[API/DB interactions to verify?]

### E2E Tests
[User workflows to validate?]

## Assumptions

- Users have modern browsers (Chrome/Firefox/Safari 2023+)
- Database can handle 1M records
- Email delivery takes < 5 minutes

## Open Questions

- [ ] Should we support bulk user import?
- [ ] What's the minimum role permission model?
- [ ] Archive or hard-delete inactive users?
```

## Common Design Mistakes to Avoid

### ❌ Over-Engineering

```
Request: "Add a simple edit button"

❌ Wrong: Design full CRUD framework with
   change tracking, audit logs, complex
   permissions, versioning

✅ Right: Design edit modal with:
   - Simple form
   - Validation
   - Success/error feedback
   - Basic permissions check
```

### ❌ Vague Specs

```
❌ "Design the user interface"
✅ "Design the user onboarding flow:
    1. Sign up form
    2. Email verification
    3. Profile setup
    4. Permission selection
    Each with specific screens and interactions"
```

### ❌ Missing Constraints

```
❌ "Design the API"
✅ "Design the API with these constraints:
    - Must work offline for 5 minutes
    - Response time < 200ms p95
    - Must handle 10k concurrent users"
```

### ❌ No Integration Points

```
❌ "Here's the user service"
✅ "Here's the user service:
    - Integrates with auth service (how?)
    - Integrates with email service (how?)
    - Stores data in PostgreSQL (schema included)
    - Exposes REST API (examples included)"
```

## Workflow Diagram

```
📝 Explore Context
     ↓
🎨 Offer Visual Companion? (if appropriate)
     ↓
❓ Ask Clarifying Questions (one at a time)
     ↓
💡 Propose 2-3 Approaches
     ↓
📋 Present Design (section by section)
     ↓
✅ Get Approval After Each Section
     ↓
📄 Write Detailed Spec
     ↓
🔍 Self-Review (check for placeholders, clarity, completeness)
     ↓
👁️ User Reviews Spec
     ↓
🚀 Invoke /writing-plans (ONLY after approval)
     ↓
💻 Implementation Begins
```

## Success Criteria

Design phase is successful when:

```
✅ User has approved the design
✅ Design spec is written and reviewed
✅ All major questions answered
✅ Data model is clear
✅ UI flows are defined
✅ API contracts are specified
✅ Implementation is ready to begin
✅ Team understands the approach
```

---

**Source:** [Brainstorming](https://github.com/obra/superpowers/blob/main/skills/brainstorming)
**License:** MIT
