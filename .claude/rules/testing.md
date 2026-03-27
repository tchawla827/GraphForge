---
paths:
  - "src/**/*"
  - "tests/**/*"
---
# Testing Rules

## Testing philosophy
Test the product where it is fragile:
- graph normalization
- import parsing
- algorithm correctness
- playback event sequencing
- permission boundaries
- share access behavior

## Minimum expectations
Any meaningful feature is incomplete without relevant tests.

## What must be tested

### Algorithms
For each supported algorithm, test:
- happy path
- disconnected graph behavior
- invalid configuration handling
- constraint failures
- result correctness
- event timeline sanity

### Imports
Test:
- valid adjacency list
- invalid adjacency list
- valid adjacency matrix
- invalid adjacency matrix
- JSON schema validation
- edge case parsing errors

### Permissions
Test:
- guest cannot mutate projects
- owner can mutate own project
- non-owner cannot mutate another user project
- public share is readable
- private token share rejects invalid tokens
- fork creates a new owned project

### Playback
Test:
- next/previous behavior
- pause/resume
- restart
- invalidation after graph edit
- deterministic event replay

## Test style
- Prefer small deterministic unit tests for algorithms and parsers.
- Add integration tests for API and permission flows.
- Use clear fixture graphs with named scenarios.
- Avoid snapshot-heavy tests for domain behavior.

## Done means tested
Before marking a task done:
- run relevant tests
- add new tests for new behavior
- update existing tests if contracts changed
