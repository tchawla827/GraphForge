---
name: "postgres-pro"
description: "Master PostgreSQL optimization. Analyze query performance with EXPLAIN, design indexes, optimize JSONB operations, manage replication, and tune maintenance. Use when: optimizing queries, designing indexes, tuning database performance, setting up replication, managing PostgreSQL."
---

# PostgreSQL Pro

Senior-level PostgreSQL expertise for performance optimization and administration.

## Core Methodology

1. **Analyze Performance Bottlenecks** — Use EXPLAIN ANALYZE to identify issues
2. **Design Appropriate Indexes** — B-tree, GIN, GiST, BRIN for different access patterns
3. **Optimize Queries** — Refactor inefficient queries
4. **Establish Replication** — High availability and read scaling
5. **Continuous Monitoring** — Track performance with pg_stat views

## Query Analysis with EXPLAIN

### EXPLAIN ANALYZE Format

Always use full information:

```sql
EXPLAIN (ANALYZE, BUFFERS, VERBOSE, FORMAT JSON)
SELECT u.id, u.name, COUNT(p.id) as post_count
FROM users u
LEFT JOIN posts p ON p.user_id = u.id
WHERE u.active = true
GROUP BY u.id, u.name;
```

### Reading Plans

```
Seq Scan on users u                      -- ❌ Problem: full table scan
  Filter: (active = true)
  Planning Time: 0.234 ms
  Execution Time: 125.456 ms             -- ❌ Slow: 125ms for simple query
```

Add an index:
```sql
CREATE INDEX CONCURRENTLY idx_users_active ON users(active) WHERE active = true;
```

Rerun EXPLAIN:
```
Index Only Scan using idx_users_active  -- ✅ Better: uses index
  Execution Time: 2.156 ms               -- ✅ Fast: 2ms
```

### Key Signals

| Pattern | Problem | Solution |
|---------|---------|----------|
| **Seq Scan** on large table | Missing index | Add covering index |
| **Nested Loop** with high rows | Join inefficiency | Add indexes, use hash join |
| **Buffers shared read >> hit** | Cache misses | Increase shared_buffers, check working set |
| **Planning Time > Exec Time** | Planner overhead | Simplify query, add statistics |

## Index Design

### Index Types

```sql
-- B-tree (default, most common)
CREATE INDEX idx_users_email ON users(email);

-- GIN (full-text search, JSONB, arrays)
CREATE INDEX idx_docs_content ON documents USING gin(to_tsvector('english', content));

-- GiST (geometric, nearest-neighbor)
CREATE INDEX idx_locations_geo ON locations USING gist(coordinates);

-- BRIN (large tables, sequential order)
CREATE INDEX idx_events_timestamp ON events USING brin(created_at);

-- Partial (subset of rows)
CREATE INDEX idx_active_users ON users(email) WHERE active = true;

-- Covering (index-only scans)
CREATE INDEX idx_orders_date_total ON orders(order_date) INCLUDE (total);
```

### Composite Indexes

Order columns by selectivity:

```sql
-- ❌ Wrong order: low selectivity first
CREATE INDEX idx_orders_status_user ON orders(status, user_id);
-- Filters down to 50% of rows first

-- ✅ Correct: high selectivity first
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
-- Filters down to few rows first
```

### Index Creation in Production

Always create concurrently to avoid locks:

```sql
-- ✅ Correct: creates index without locking table
CREATE INDEX CONCURRENTLY idx_posts_user_created
ON posts(user_id, created_at);

-- ❌ Wrong: blocks writes during creation
CREATE INDEX idx_posts_user_created
ON posts(user_id, created_at);
```

## Query Optimization

### N+1 Query Problem

```sql
-- ❌ Bad: N+1 queries
SELECT * FROM users WHERE active = true;
-- Then in application: for each user, SELECT * FROM posts WHERE user_id = ?

-- ✅ Good: Single query with JOIN
SELECT u.*, p.*
FROM users u
LEFT JOIN posts p ON p.user_id = u.id
WHERE u.active = true;

-- ✅ Or use LATERAL for complex aggregations
SELECT u.*, (
  SELECT json_agg(p.*)
  FROM posts p
  WHERE p.user_id = u.id
  LIMIT 10
) as recent_posts
FROM users u
WHERE u.active = true;
```

### Window Functions

```sql
-- Ranking within groups
SELECT id, department, salary,
  RANK() OVER (PARTITION BY department ORDER BY salary DESC) as dept_rank,
  RANK() OVER (ORDER BY salary DESC) as overall_rank
FROM employees;

-- Running totals
SELECT date, amount,
  SUM(amount) OVER (ORDER BY date) as running_total
FROM transactions;

-- Comparing with previous row
SELECT date, revenue,
  revenue - LAG(revenue) OVER (ORDER BY date) as daily_change,
  100 * (revenue - LAG(revenue) OVER (ORDER BY date)) / LAG(revenue) OVER (ORDER BY date) as pct_change
FROM daily_sales;
```

### CTEs for Clarity

```sql
-- Complex query becomes readable
WITH recent_users AS (
  SELECT id, name
  FROM users
  WHERE created_at > NOW() - INTERVAL '30 days'
),
user_posts AS (
  SELECT ru.id, COUNT(p.id) as post_count
  FROM recent_users ru
  LEFT JOIN posts p ON p.user_id = ru.id
  GROUP BY ru.id
)
SELECT ru.*, up.post_count
FROM recent_users ru
LEFT JOIN user_posts up ON up.id = ru.id
ORDER BY up.post_count DESC;
```

## JSONB Operations

### Efficient JSONB Queries

```sql
-- Create GIN index for JSONB
CREATE INDEX idx_users_metadata ON users USING gin(metadata);

-- Query with index
SELECT * FROM users WHERE metadata @> '{"premium": true}';

-- Index on specific path
CREATE INDEX idx_users_country ON users USING gin((metadata->'address'->>'country'));
SELECT * FROM users WHERE metadata->'address'->>'country' = 'USA';

-- Aggregating JSONB data
SELECT
  metadata->'country' as country,
  COUNT(*) as user_count,
  json_agg(metadata->'interests') as all_interests
FROM users
GROUP BY metadata->'country';
```

## Maintenance

### VACUUM and ANALYZE

```sql
-- Manual vacuum (not usually needed)
VACUUM FULL users;  -- Locks table, use carefully

-- Analyze updates statistics
ANALYZE users;

-- Check autovacuum is running
SELECT * FROM pg_stat_user_tables WHERE schemaname != 'information_schema';

-- View vacuum history
SELECT relname, last_vacuum, last_autovacuum, n_dead_tup
FROM pg_stat_user_tables;
```

### Monitoring Bloat

```sql
-- Find tables with bloat
SELECT
  schemaname,
  tablename,
  round(100 * (CASE WHEN otta > 0 THEN sml.relpages::float/otta
         ELSE 0 END)::numeric, 2) AS bloat_pct,
  CASE WHEN relpages < otta THEN 0
       ELSE relpages::bigint - otta END AS bloat_size
FROM pg_class
JOIN pg_stat_user_tables sml ON pg_class.oid = sml.relid
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY bloat_size DESC;

-- Reindex to recover space
REINDEX INDEX CONCURRENTLY idx_name;
```

## Replication

### Setting Up Replication

```sql
-- Primary server configuration
-- postgresql.conf
wal_level = replica
max_wal_senders = 10
wal_keep_size = 1GB

-- pg_hba.conf
host    replication     replication_user  192.168.1.100/32  md5

-- Create replication user
CREATE ROLE replication_user LOGIN REPLICATION PASSWORD 'password';

-- Standby server backup
pg_basebackup -h primary_host -D /var/lib/postgresql/data -U replication_user -v -P

-- recovery.conf on standby
standby_mode = 'on'
primary_conninfo = 'host=primary_host port=5432 user=replication_user password=password'
```

### Monitoring Replication Lag

```sql
-- Check replication status (on primary)
SELECT
  usename,
  application_name,
  client_addr,
  state,
  write_lsn,
  flush_lsn,
  replay_lsn,
  EXTRACT(EPOCH FROM (NOW() - pg_last_xact_replay_time())) as lag_seconds
FROM pg_stat_replication;

-- Alert if lag > threshold
CREATE TABLE replication_lag_alerts (
  id SERIAL PRIMARY KEY,
  alert_time TIMESTAMP DEFAULT NOW(),
  lag_seconds FLOAT,
  standby_name TEXT
);
```

## Configuration Tuning

### postgresql.conf

```ini
# Memory
shared_buffers = 4GB              # 25% of RAM
effective_cache_size = 12GB       # 75% of RAM
work_mem = 10MB                   # shared_buffers / (max_connections * 2)
maintenance_work_mem = 1GB        # 10% of RAM

# WAL
wal_level = replica               # For replication/backups
max_wal_senders = 10              # For replication
wal_keep_size = 1GB               # Standby recovery

# Query Planning
random_page_cost = 1.1            # SSDs: closer to 1.0
effective_io_concurrency = 200    # For SSDs

# Logging (for analysis)
log_min_duration_statement = 1000 # Log queries > 1 second
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_statement = 'all'             # In dev; use 'ddl' in prod

# Autovacuum (usually good defaults)
autovacuum = on
autovacuum_naptime = 10s
autovacuum_vacuum_scale_factor = 0.1
```

## Performance Baseline

### Create Monitoring Views

```sql
-- Slow queries
CREATE VIEW slow_queries AS
SELECT
  query,
  calls,
  mean_exec_time,
  total_exec_time,
  max_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC;

-- Table sizes
CREATE VIEW table_sizes AS
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index bloat
CREATE VIEW index_bloat AS
SELECT
  schemaname,
  tablename,
  indexname,
  round(100.0 * (pg_relation_size(i.indexrelid) - pg_relation_size(i.indexrelid, 'main')) /
        pg_relation_size(i.indexrelid), 2) as bloat_pct
FROM pg_stat_user_indexes i
ORDER BY bloat_pct DESC;
```

## Must-Do Practices

### ✅ Use EXPLAIN Before Optimizing

Always check the plan first:

```sql
EXPLAIN (ANALYZE, BUFFERS) SELECT ...;
```

### ✅ Create Indexes Concurrently

Avoid locking production tables:

```sql
CREATE INDEX CONCURRENTLY idx_new ON table(column);
```

### ✅ Run ANALYZE After Bulk Operations

Update statistics:

```sql
ANALYZE table_name;
```

### ✅ Monitor Replication Lag

Track standby status:

```sql
SELECT lag_seconds FROM pg_stat_replication;
```

### ✅ Use Connection Pooling

Avoid connection overhead:

```
pgbouncer, PgBouncerPool, or application connection pooling
```

## Forbidden Practices

### ❌ Disable Autovacuum System-Wide

```sql
-- Wrong: database will bloat
ALTER SYSTEM SET autovacuum = off;

-- Right: tune if needed
ALTER SYSTEM SET autovacuum_vacuum_scale_factor = 0.05;
```

### ❌ Create Indexes Without Analysis

```sql
-- Wrong: might not help, could slow writes
CREATE INDEX idx_random ON table(column);

-- Right: use EXPLAIN to verify index helps
EXPLAIN SELECT * FROM table WHERE column = value;
CREATE INDEX CONCURRENTLY idx_random ON table(column);
EXPLAIN SELECT * FROM table WHERE column = value;
```

### ❌ Store Large Files in Database

```sql
-- Wrong: bloats database
CREATE TABLE uploads (
  id SERIAL,
  data BYTEA  -- Large files here
);

-- Right: use object storage
CREATE TABLE uploads (
  id SERIAL,
  s3_key TEXT  -- Reference to S3
);
```

### ❌ Ignore Replication Lag

```sql
-- Monitor continuously
SELECT lag_seconds FROM pg_stat_replication;

-- Alert if > threshold
-- Don't let standbys fall too far behind
```

---

**Source:** [PostgreSQL Pro](https://github.com/Jeffallan/claude-skills/tree/main/skills/postgres-pro)
**License:** MIT | **Author:** Jeffallan
