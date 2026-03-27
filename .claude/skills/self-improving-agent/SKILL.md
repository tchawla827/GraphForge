---
name: "self-improving-agent"
description: "Curate Claude Code's auto-memory into durable project knowledge. Analyze MEMORY.md for patterns, promote proven learnings to CLAUDE.md and .claude/rules/, extract recurring solutions into reusable skills. Use when: (1) reviewing what Claude has learned about your project, (2) graduating a pattern from notes to enforced rules, (3) turning a debugging solution into a skill, (4) checking memory health and capacity."
---

# Self-Improving Agent

> Auto-memory captures. This plugin curates.

Claude Code's auto-memory (v2.1.32+) automatically records project patterns, debugging insights, and your preferences in `MEMORY.md`. This plugin adds the intelligence layer: it analyzes what Claude has learned, promotes proven patterns into project rules, and extracts recurring solutions into reusable skills.

## Quick Reference

| Command | What it does |
|---------|-------------|
| `/si:review` | Analyze MEMORY.md — find promotion candidates, stale entries, consolidation opportunities |
| `/si:promote` | Graduate a pattern from MEMORY.md → CLAUDE.md or `.claude/rules/` |
| `/si:extract` | Turn a proven pattern into a standalone skill |
| `/si:status` | Memory health dashboard — line counts, topic files, recommendations |
| `/si:remember` | Explicitly save important knowledge to auto-memory |

## How It Fits Together

```
┌─────────────────────────────────────────────────────────┐
│ Claude Code Memory Stack │
├─────────────┬──────────────────┬────────────────────────┤
│ CLAUDE.md │ Auto Memory │ Session Memory │
│ (you write)│ (Claude writes)│ (Claude writes) │
│ Rules & │ MEMORY.md │ Conversation logs │
│ standards │ + topic files │ + continuity │
│ Full load │ First 200 lines│ Contextual load │
├─────────────┴──────────────────┴────────────────────────┤
│ ↑ /si:promote ↑ /si:review │
│ Self-Improving Agent (this plugin) │
│ ↓ /si:extract ↓ /si:remember │
├─────────────────────────────────────────────────────────┤
│ .claude/rules/ │ New Skills │ Error Logs │
│ (scoped rules) │ (extracted) │ (auto-captured)│
└─────────────────────────────────────────────────────────┘
```

## Memory Architecture

### Where things live

| File | Who writes | Scope | Loaded |
|------|-----------|-------|--------|
| `./CLAUDE.md` | You (+ `/si:promote`) | Project rules | Full file, every session |
| `~/.claude/CLAUDE.md` | You | Global preferences | Full file, every session |
| `~/.claude/projects/<path>/memory/MEMORY.md` | Claude (auto) | Project learnings | First 200 lines |
| `~/.claude/projects/<path>/memory/*.md` | Claude (overflow) | Topic-specific notes | On demand |
| `.claude/rules/*.md` | You (+ `/si:promote`) | Scoped rules | When matching files open |

### The promotion lifecycle

```
1. Claude discovers pattern → auto-memory (MEMORY.md)
2. Pattern recurs 2-3x → /si:review flags it as promotion candidate
3. You approve → /si:promote graduates it to CLAUDE.md or rules/
4. Pattern becomes an enforced rule, not just a note
5. MEMORY.md entry removed → frees space for new learnings
```

## Core Concepts

### Auto-memory is capture, not curation

Auto-memory is excellent at recording what Claude learns. But it has no judgment about:
- Which learnings are temporary vs. permanent
- Which patterns should become enforced rules
- When the 200-line limit is wasting space on stale entries
- Which solutions are good enough to become reusable skills

That's what this plugin does.

### Promotion = graduation

When you promote a learning, it moves from Claude's scratchpad (MEMORY.md) to your project's rule system (CLAUDE.md or `.claude/rules/`). The difference matters:

- **MEMORY.md**: "I noticed this project uses pnpm" (background context)
- **CLAUDE.md**: "Use pnpm, not npm" (enforced instruction)

Promoted rules have higher priority and load in full (not truncated at 200 lines).

### Rules directory for scoped knowledge

Not everything belongs in CLAUDE.md. Use `.claude/rules/` for patterns that only apply to specific file types:

```markdown
# .claude/rules/api-testing.md
---
paths:
 - "src/api/**/\*.test.ts"
 - "tests/api/**/*"
---

- Use supertest for API endpoint testing
- Mock external services with msw
- Always test error responses, not just happy paths
```

This loads only when Claude works with API test files — zero overhead otherwise.

## Usage Commands

### `/si:review`

Analyze your auto-memory for patterns worth promoting:

```
/si:review
```

Shows:
- Entries that recur across multiple sessions
- Stale entries referencing old patterns
- Consolidation opportunities
- Promotion candidates with confidence scores

### `/si:promote`

Graduate a pattern from MEMORY.md to your project rules:

```
/si:promote <entry-number>
```

Interactive workflow:
1. Choose target: CLAUDE.md or `.claude/rules/`
2. Confirm the promoted rule
3. Auto removes the entry from MEMORY.md

### `/si:extract`

Turn a proven pattern into a standalone skill:

```
/si:extract <pattern-description>
```

Generates:
- Complete SKILL.md with frontmatter
- Reference documentation
- Usage examples
- Ready for project use or publishing

### `/si:status`

Memory health dashboard:

```
/si:status
```

Shows:
- MEMORY.md line count (goal: keep under 200 lines)
- Topic file inventory
- Oldest/stalest entries
- Recommendations for cleanup

### `/si:remember`

Explicitly save something to auto-memory:

```
/si:remember This is important for future sessions
```

Use when you want to record knowledge without waiting for auto-capture.

## Platform Support

| Platform | Memory System | Plugin Works? |
|----------|--------------|---------------|
| Claude Code | Auto-memory (MEMORY.md) | ✅ Full support |
| OpenClaw | workspace/MEMORY.md | ✅ Adapted |
| Codex CLI | AGENTS.md | ✅ Adapted |
| GitHub Copilot | `.github/copilot-instructions.md` | ⚠️ Manual only |

## Key Benefits

1. **Prevent knowledge loss** — Promote session learnings to permanent rules
2. **Keep memory healthy** — Remove stale entries, consolidate related ones
3. **Extract skills** — Turn debugging solutions into reusable patterns
4. **Enforce standards** — Graduate best practices into CLAUDE.md
5. **Scale patterns** — Make team learnings discoverable and shareable

---

**Source:** [Self-Improving Agent](https://github.com/alirezarezvani/claude-skills/tree/main/engineering-team/self-improving-agent)
**License:** MIT
