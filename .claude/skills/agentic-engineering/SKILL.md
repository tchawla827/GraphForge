---
name: "agentic-engineering"
description: "Framework for AI-driven implementation with human oversight. Organize work in 15-minute units, define completion criteria upfront, evaluate performance baselines, and focus reviews on invariants and edge cases. Use when: planning AI-assisted development, organizing implementation tasks, establishing quality gates, balancing cost and capability."
---

# Agentic Engineering

Framework for AI-driven implementation while maintaining human quality oversight.

## Core Philosophy

**AI as Primary Implementer** — Agents handle implementation work efficiently
**Humans for Oversight** — Humans focus on architectural decisions and risk management
**Eval-First Execution** — Define completion criteria before work begins
**Capability-Aware Routing** — Match model tier to task complexity and requirements

## Work Organization

### 15-Minute Units

Break work into small, independently verifiable pieces:

```
✅ Good task units (15 min each):
- Implement single function with tests
- Add validation to API endpoint
- Create database migration
- Write component with one responsibility
- Fix specific bug with known cause

❌ Bad task units (too large):
- "Build authentication system"
- "Implement entire feature"
- "Refactor all database queries"
- "Optimize performance"
```

Each unit should:

1. **Address Single Risk** — One dominant problem to solve
2. **Have Clear Signals** — Obvious completion indicators
3. **Be Independently Verifiable** — Can test/review in isolation
4. **Enable Parallelization** — Multiple agents can work on different units

### Task Structure

```markdown
## Task: [Name]

### Objective
[Single, focused goal in 1-2 sentences]

### Acceptance Criteria
- [ ] Code compiles/passes linting
- [ ] Unit tests pass
- [ ] Error handling for case X
- [ ] Performance target: < 100ms
- [ ] Type safety: no `any` types

### Risks to Address
- Missing error boundary for API failure
- Race condition in concurrent access
- Database transaction rollback on error

### Completion Signals
- [ ] All tests passing
- [ ] No console errors
- [ ] Type checker clean
- [ ] Code review approved
```

## Model Selection Strategy

### Haiku (Fast, Cost-Effective)
- Simple classification and formatting
- Straightforward bug fixes
- Documentation and comments
- Boilerplate generation
- Refactoring existing code

**Example:** Format JSON, add comments, rename variables

### Sonnet (Balanced)
- Core implementation work
- Most features and endpoints
- Complex logic with clear specs
- Integration of components
- Bug fixes requiring some reasoning

**Example:** Implement user registration endpoint, add validation layer

### Opus (Powerful, Expensive)
- Architectural decisions
- Complex reasoning across codebase
- Multi-file refactorings
- Performance optimizations
- Security design decisions

**Example:** Design database schema for multi-tenant app, plan major refactor

### Routing Rules

```
Task Type              | Model  | When to Escalate
------------------------+--------+---------------------
Format/Cleanup        | Haiku  | If output quality low
Simple Implementation | Sonnet | If reasoning gaps
Complex Logic         | Sonnet | If needs Opus for gaps
Architecture          | Opus   | Always (not routine)
Cross-Service Design  | Opus   | Always (not routine)
```

## Eval-First Execution

### Define Before Execution

1. **Capability Baseline** — What's the expected performance?

```
Task: Implement search function
Expected: Results return < 100ms for 1M records
Baseline: Run benchmark on current code
Current:  Average 50ms
Target:   Maintain < 100ms after changes
```

2. **Regression Baseline** — What might break?

```
Define before changes:
- Unit tests must pass
- Integration tests must pass
- No new TypeScript errors
- API response format unchanged
- Error handling for all edge cases
```

3. **Completion Criteria** — How do we verify success?

```
✅ Implementation complete when:
- All acceptance criteria met
- Tests passing
- No performance regression
- Error cases handled
- Code reviewed and approved
```

### Baseline Evaluation

Run before starting work:

```bash
# Tests
npm test  # baseline: 487 tests pass

# Performance
npm run benchmark  # baseline: avg 45ms

# Type checking
npm run type-check  # baseline: 0 errors

# Linting
npm run lint  # baseline: 0 warnings
```

Document baselines, measure after completion.

## Code Review Focus

### What NOT to Review (Tools Catch These)

```
❌ Formatting, indentation, line breaks
❌ Naming consistency (use linter)
❌ Type errors (use TypeScript)
❌ Unused variables (use linter)
❌ Obvious performance issues (use profiler)
```

### What TO Review (Critical for Quality)

#### 1. Invariants & Constraints

```typescript
// ❌ Review question: Can status ever be invalid?
function setOrderStatus(status: string) {
  order.status = status;  // What if status = "invalid"?
}

// ✅ Better: Invariant enforced
function setOrderStatus(status: 'pending' | 'shipped' | 'delivered') {
  order.status = status;  // Compiler enforces valid values
}
```

#### 2. Edge Cases

```typescript
// ❌ Missing edge cases
function calculateDiscount(items: Item[]) {
  return items.reduce((sum, item) => sum + item.discount, 0);
  // What if items is empty?
  // What if discount is negative?
  // What if sum overflows?
}

// ✅ Handles edges
function calculateDiscount(items: Item[]): number {
  if (items.length === 0) return 0;

  return items
    .filter(item => item.discount >= 0)
    .reduce((sum, item) => sum + item.discount, 0);
}
```

#### 3. Error Handling

```typescript
// ❌ Missing error handling
async function fetchUser(id: string) {
  const response = await fetch(`/api/users/${id}`);
  return response.json();  // What if 404? What if 500?
}

// ✅ Handles errors
async function fetchUser(id: string): Promise<User | null> {
  try {
    const response = await fetch(`/api/users/${id}`);

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    logger.error('Failed to fetch user', { id, error });
    throw error;
  }
}
```

#### 4. Security Assumptions

```typescript
// ❌ Unsafe: Trusts client input
function deletePost(postId: string) {
  return db.query(`DELETE FROM posts WHERE id = '${postId}'`);
  // SQL injection risk!
}

// ✅ Secure: Parameterized query
function deletePost(postId: string) {
  return db.query('DELETE FROM posts WHERE id = $1', [postId]);
}

// ❌ Missing authorization check
function deletePost(postId: string, userId: string) {
  return db.query('DELETE FROM posts WHERE id = $1', [postId]);
  // Doesn't verify user owns the post!
}

// ✅ Checks authorization
async function deletePost(postId: string, userId: string) {
  const post = await db.query('SELECT user_id FROM posts WHERE id = $1', [postId]);

  if (post.user_id !== userId) {
    throw new Error('Unauthorized: cannot delete other users\' posts');
  }

  return db.query('DELETE FROM posts WHERE id = $1', [postId]);
}
```

#### 5. Cross-File Dependencies

```typescript
// ❌ Hidden coupling
// auth.ts
export function validateToken(token: string): User {
  return jwt.verify(token, SECRET_KEY);
}

// api.ts
app.use((req, res, next) => {
  const user = validateToken(req.headers.auth);  // Assumption: always valid
  req.user = user;  // Breaks if validateToken throws
});

// ✅ Explicit dependency handling
// auth.ts
export function validateToken(token: string): Result<User, TokenError> {
  try {
    return { ok: true, data: jwt.verify(token, SECRET_KEY) };
  } catch (error) {
    return { ok: false, error: TokenError.INVALID };
  }
}

// api.ts
app.use((req, res, next) => {
  const result = validateToken(req.headers.auth);

  if (!result.ok) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  req.user = result.data;
  next();
});
```

## Metrics & Tracking

### Per-Task Metrics

Track for each 15-minute unit:

```
Task: "Implement search filter"

Model Used:           Sonnet
Token Usage:          12,450 tokens (input) + 3,200 (output)
Iterations:           2 (initial + 1 fix)
Time to Completion:   18 minutes
Review Time:          5 minutes
Test Coverage:        94%
Performance Impact:   +2% API latency (acceptable)
Bugs Found in Review: 1 (missing validation)
```

### When to Escalate

Escalate to more capable (more expensive) model when:

```
✅ Observable reasoning gap — lower tier misunderstood requirement
✅ Quality issue — multiple iterations not resolving problem
✅ Architectural question — needs cross-system thinking
❌ Style preference — wrong reason (use linter instead)
❌ "Just to be safe" — no measurable quality gain
```

Example escalation:

```
Task: "Add caching layer"
Assigned:    Haiku
Result:      Implementation doesn't invalidate cache correctly
Reasoning:   Missing multi-writer cache invalidation logic
Escalate to: Sonnet (needs distributed systems reasoning)
```

## Quality Gates

### Before Starting Work

- [ ] Acceptance criteria written and clear
- [ ] Baseline metrics captured
- [ ] Edge cases identified
- [ ] Error scenarios documented

### Before Code Review

- [ ] All tests passing
- [ ] Linting clean
- [ ] Type checking clean
- [ ] Performance baseline maintained
- [ ] Security assumptions documented

### Code Review Checklist

- [ ] Invariants are enforced (types, constraints)
- [ ] Edge cases handled
- [ ] Error cases handled with meaningful messages
- [ ] Security assumptions documented and validated
- [ ] Cross-file dependencies clear and safe
- [ ] Performance impact acceptable

### Approved for Merge

- [ ] All review comments addressed
- [ ] New tests added for changes
- [ ] No performance regression
- [ ] Documentation updated
- [ ] Rollback plan documented (if needed)

## Common Patterns

### Task Breakdown Example

**Feature:** "Add user email verification"

**Break into 15-min units:**

1. **Database Schema**
   - Add `email_verified` boolean
   - Add `verification_token` field
   - Add `token_created_at` timestamp
   - ✅ Clear, testable, independent

2. **Generate Verification Token**
   - Implement `generateVerificationToken()`
   - Secure random generation
   - Store in database
   - ✅ Isolated function, unit testable

3. **Send Verification Email**
   - Implement `sendVerificationEmail()`
   - Include token in link
   - Handle email service failures
   - ✅ Single responsibility, mockable

4. **Verify Email Endpoint**
   - Implement GET `/api/verify-email/:token`
   - Validate token exists and not expired
   - Mark user as verified
   - Return appropriate errors
   - ✅ API contract clear, testable

5. **Add Verification Requirement**
   - Check `email_verified` on login
   - Redirect unverified to verification page
   - ✅ Business logic, cross-service interaction

## Typical Workflow

```
1. Define Task & Acceptance Criteria
   ↓
2. Establish Baseline Metrics
   ↓
3. Select Model Tier (Haiku/Sonnet/Opus)
   ↓
4. Execute Implementation
   ↓
5. Measure Against Baseline
   ↓
6. Code Review (invariants, edges, errors, security, dependencies)
   ↓
7. Iterate If Needed (escalate if gaps detected)
   ↓
8. Merge & Track Metrics
```

## Philosophy Summary

**Work Organization:**
- Small, independently verifiable units (15 minutes each)
- Single dominant risk per task
- Clear completion signals

**Model Selection:**
- Route by complexity, not cost anxiety
- Escalate only when demonstrable gaps
- Track metrics to optimize routing

**Quality Focus:**
- Let tools catch style/format issues
- Humans focus on critical risks
- Review for invariants, edges, errors, security, dependencies

**Outcomes:**
- Efficient implementation
- Maintained quality standards
- Cost-effective model usage
- Parallel work possible

---

**Source:** [Agentic Engineering](https://github.com/affaan-m/everything-claude-code/tree/main/skills/agentic-engineering)
**License:** MIT
