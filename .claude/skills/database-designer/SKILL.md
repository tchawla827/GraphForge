---
name: "database-designer"
description: "Design, optimize, and manage database schemas. Analyze normalization, generate ERDs, optimize indexes, plan zero-downtime migrations, and handle multi-database decisions. Use when: designing schemas, optimizing database performance, planning migrations, analyzing data structures."
---

# Database Designer

Expert-level database design, optimization, and migration management.

## Core Competencies

### Schema Design & Analysis

**Normalization Analysis**
- Detects normalization levels (1NF through BCNF)
- Identifies anomalies and data redundancy
- Recommends normalization improvements
- Validates referential integrity

**Data Type Optimization**
- Identifies inappropriate or oversized types
- Recommends compression strategies
- Validates numeric precision and ranges
- Optimizes storage efficiency

**Constraint Analysis**
- Detects missing foreign keys
- Validates unique constraints
- Identifies missing NOT NULL constraints
- Checks check constraints completeness

**ERD Generation**
- Automatic Mermaid diagram creation from DDL
- Visualizes table relationships
- Shows cardinality and constraints
- Documents schema structure

### Index Optimization

**Index Gap Analysis**
- Identifies missing indexes on foreign keys
- Detects query pattern opportunities
- Finds unused indexes
- Analyzes selectivity

**Composite Index Strategy**
- Determines optimal column ordering
- Identifies covering index opportunities
- Plans partial indexes
- Analyzes write performance impact

**Performance Impact Modeling**
- Estimates selectivity
- Calculates query cost
- Projects storage overhead
- Models index trade-offs

### Migration Management

**Zero-Downtime Migrations**
- Uses expand-contract pattern
- Manages dual-write phases
- Handles data backfill safely
- Plans transaction windows

**Schema Evolution**
- Safe column additions (with defaults)
- Safe column deletions (with backups)
- Type changes with casting
- Default value migrations

**Data Migration Scripts**
- Generates transformation code
- Includes validation checks
- Plans rollback procedures
- Manages dependencies

## Best Practices

### Schema Design

1. **Use meaningful names** — Clear, consistent conventions across tables/columns
2. **Choose appropriate data types** — Right-sized columns for efficiency
3. **Define proper constraints** — Foreign keys, check constraints, unique indexes
4. **Plan for growth** — Consider scale from the beginning
5. **Document relationships** — Clear business rules and dependencies

### Performance Optimization

1. **Index strategically** — Cover query patterns without over-indexing
2. **Monitor query performance** — Regular EXPLAIN plan analysis
3. **Partition large tables** — Improve query performance and maintenance
4. **Use appropriate isolation levels** — Balance consistency with performance
5. **Implement connection pooling** — Efficient resource utilization

### Security

1. **Principle of least privilege** — Minimal necessary permissions
2. **Encrypt sensitive data** — At rest and in transit
3. **Audit access patterns** — Monitor and log database access
4. **Validate inputs** — Prevent SQL injection
5. **Regular security updates** — Keep database current

## Query Patterns

### JOINs

```sql
-- INNER JOIN: only matching rows
SELECT o.id, c.name, o.total
FROM orders o
INNER JOIN customers c ON c.id = o.customer_id;

-- LEFT JOIN: all left rows, NULLs for non-matches
SELECT c.name, COUNT(o.id) AS order_count
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.name;

-- Self-join: hierarchical data
SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON m.id = e.manager_id;
```

### Window Functions

```sql
-- ROW_NUMBER for deduplication
SELECT *, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC) AS rn
FROM orders;

-- RANK vs DENSE_RANK
SELECT name, score,
  RANK() OVER (ORDER BY score DESC) AS rank,
  DENSE_RANK() OVER (ORDER BY score DESC) AS dense_rank
FROM leaderboard;

-- LAG/LEAD for comparisons
SELECT date, revenue,
  revenue - LAG(revenue) OVER (ORDER BY date) AS daily_change
FROM daily_sales;
```

### CTEs (Common Table Expressions)

```sql
-- Recursive CTE for org chart
WITH RECURSIVE org AS (
  SELECT id, name, manager_id, 1 AS depth
  FROM employees
  WHERE manager_id IS NULL
  UNION ALL
  SELECT e.id, e.name, e.manager_id, o.depth + 1
  FROM employees e
  INNER JOIN org o ON o.id = e.manager_id
)
SELECT * FROM org ORDER BY depth, name;
```

## Migration Patterns

### File Structure

```
migrations/
├── 20260101_000001_create_users.up.sql
├── 20260101_000001_create_users.down.sql
├── 20260115_000002_add_email_index.up.sql
└── 20260115_000002_add_email_index.down.sql
```

### Expand-Contract Pattern

**Zero-downtime approach:**

1. **Expand** — Add new column/table (nullable, with default)
2. **Migrate Data** — Backfill in batches; dual-write from application
3. **Transition** — Application reads new column; stop writing old
4. **Contract** — Drop old column in follow-up migration

### Batch Backfill

```sql
-- Avoid long-running locks
UPDATE users SET email_normalized = LOWER(email)
WHERE id IN (
  SELECT id FROM users
  WHERE email_normalized IS NULL
  LIMIT 5000
);
-- Repeat until 0 rows affected
```

### Rollback Procedures

- Test `down.sql` in staging before production `up.sql`
- Keep rollback window short
- For irreversible changes, take logical backup first
- Document rollback risks

## Index Types

| Type | Use Case | Example |
|------|----------|---------|
| **B-tree** | Equality, range, ORDER BY | `CREATE INDEX idx_email ON users(email);` |
| **GIN** | Full-text, JSONB, arrays | `CREATE INDEX idx_docs ON docs USING gin(body);` |
| **GiST** | Geometry, range, nearest-neighbor | `CREATE INDEX idx_geo ON places USING gist(coords);` |
| **Partial** | Subset of rows | `CREATE INDEX idx_active ON users(email) WHERE active=true;` |
| **Covering** | Index-only scans | `CREATE INDEX idx_cov ON orders(customer_id) INCLUDE (total);` |

## Database Selection

| Database | Best For | Strengths |
|----------|----------|-----------|
| **PostgreSQL** | Complex queries, extensions | JSONB, advanced features, extensibility |
| **MySQL** | Web apps, read-heavy | Simple, fast, wide adoption |
| **SQLite** | Embedded, dev/test | Zero-config, single-file, portable |
| **SQL Server** | .NET, enterprise | Strong Windows integration, BI tools |

**Default:** PostgreSQL for new projects.

## Sharding Strategy

| Strategy | How | Pros | Cons |
|----------|-----|------|------|
| **Hash** | `shard = hash(key) % N` | Even distribution | Expensive resharding |
| **Range** | By date/ID range | Simple, time-series friendly | Hot spots on latest |
| **Geographic** | By region | Data locality, compliance | Cross-region queries hard |

## Connection Pooling

| Tool | Protocol | Best For |
|------|----------|----------|
| **PgBouncer** | PostgreSQL | Low overhead, transaction pooling |
| **ProxySQL** | MySQL | Query routing, read/write splitting |
| **HikariCP** | Any | Java applications |
| **SQLAlchemy** | Any | Python applications |

**Rule of thumb:** Pool size = `(2 × CPU cores) + disk spindles`. For cloud SSDs: `2 × vCPUs`.

## Performance Monitoring

### EXPLAIN Plan Analysis

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) SELECT ...;
```

Key signals:
- **Seq Scan** on large tables → missing index
- **Nested Loop** high estimates → add index
- **Buffers shared read >> hit** → working set exceeds memory

### Common Problems

**N+1 Queries:**
- Issue: One query per row (loop in application)
- Fix: Use JOIN, subquery, or ORM eager loading

**Slow Aggregations:**
- Issue: Large GROUP BY over unindexed columns
- Fix: Add composite indexes, consider materialized views

**Lock Contention:**
- Issue: Long-running transactions blocking others
- Fix: Reduce transaction scope, use optimistic locking

## Typical Workflow

1. **Define Requirements** — Data model, access patterns, scale
2. **Design Schema** — Tables, relationships, constraints
3. **Normalize** — Verify 3NF or BCNF
4. **Optimize** — Add indexes, plan partitioning
5. **Plan Migrations** — Expand-contract for zero-downtime
6. **Monitor** — Track performance, identify bottlenecks
7. **Evolve** — Incremental schema improvements

---

**Source:** [Database Designer](https://github.com/alirezarezvani/claude-skills/tree/main/engineering/database-designer)
**License:** MIT
