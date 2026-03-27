---
name: "database-schema-designer"
description: "Design database schemas from requirements. Generate type-safe code, handle multi-tenancy, implement audit trails, and optimize for performance. Use when: designing new database features, creating schemas, generating migrations, implementing tenant isolation."
---

# Database Schema Designer

Design relational database schemas from requirements with type safety and best practices.

## Core Capabilities

### Schema Design from Requirements

**Requirement Analysis**
- Translates business requirements into data models
- Identifies entities and relationships
- Determines cardinality and constraints
- Plans for scale and growth

**Entity-Relationship Design**
- Creates normalized schemas (3NF/BCNF)
- Defines table relationships
- Plans foreign keys and constraints
- Designs for data integrity

**Performance-First Design**
- Anticipates common queries
- Plans composite indexes
- Identifies denormalization opportunities
- Optimizes for access patterns

### Code Generation

**Migration Generation**
- Supports Drizzle, Prisma, TypeORM, Alembic
- Generates up/down migrations
- Creates seed scripts
- Includes rollback procedures

**Type-Safe Code**
- Generates TypeScript interfaces from schemas
- Creates Python dataclasses
- Ensures type consistency
- Reduces runtime errors

**ORM Integration**
- Prisma schema generation
- TypeORM entity definitions
- Drizzle schema exports
- SQLAlchemy models

### Multi-Tenancy Patterns

**Row-Level Security (RLS)**
- PostgreSQL RLS policy generation
- Organization-based isolation
- Query filtering at database layer
- Prevents data leakage

**Tenant Isolation Strategies**
- Row-level keys (customer_id in every table)
- Separate schemas per tenant
- Separate databases per tenant
- Hybrid approaches

**Audit Capabilities**
- Soft deletes (deleted_at column)
- Complete change tracking
- Created_at / updated_at on all tables
- Optimistic locking with version fields

## Defensive Design Patterns

### Timestamp Fields

Add to every table:
```sql
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
```

Benefits: Track lifecycle, audit trails, temporal queries.

### Soft Deletes

```sql
deleted_at TIMESTAMP NULL DEFAULT NULL
```

Usage: `WHERE deleted_at IS NULL` in queries.

Benefits: Data recovery, compliance, audit trails.

### Optimistic Locking

```sql
version INTEGER NOT NULL DEFAULT 1
```

Usage: Check version matches before UPDATE.

Benefits: Prevent lost updates in concurrent scenarios.

### UUID Primary Keys

```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
```

Over sequential integers:
- No information leakage (user count, sequence)
- Distributed generation (no central ID server)
- Merge-friendly for replication
- Cross-database portability

### Constraints

**NOT NULL** — Avoid nullable columns unless semantically meaningful.

```sql
email VARCHAR(255) NOT NULL UNIQUE
```

**CHECK** — Enforce domain constraints:

```sql
CREATE TABLE orders (
  status VARCHAR(50) NOT NULL,
  CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'cancelled'))
);
```

**FOREIGN KEY** — Maintain referential integrity:

```sql
customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT
```

## Schema Templates

### SaaS Application Core

```sql
-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(org_id, email)
);

-- User Roles
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id),
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, org_id)
);

-- Audit Log
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID NOT NULL,
  changes JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_org_created (org_id, created_at)
);
```

### E-Commerce Core

```sql
-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## Migration Generation

### Using Prisma

```prisma
model User {
  id    String   @id @default(cuid())
  email String   @unique
  name  String?
  posts Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id    String   @id @default(cuid())
  title String
  body  String
  authorId String
  author User @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Generate migrations:
```bash
prisma migrate dev --name initial
```

### Using TypeORM

```typescript
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @OneToMany(() => Post, post => post.author)
  posts: Post[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Using Drizzle

```typescript
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

## Type-Safe Code Generation

### TypeScript Interfaces

```typescript
interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Order {
  id: string;
  customerId: string;
  status: 'pending' | 'completed' | 'cancelled';
  total: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Python Dataclasses

```python
from dataclasses import dataclass
from datetime import datetime

@dataclass
class User:
  id: str
  email: str
  password_hash: str
  created_at: datetime
  updated_at: datetime

@dataclass
class Order:
  id: str
  customer_id: str
  status: str  # 'pending' | 'completed' | 'cancelled'
  total: Decimal
  created_at: datetime
  updated_at: datetime
```

## Multi-Tenancy Implementation

### Row-Level Security

```sql
-- Enable RLS on user table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for user to see only their org
CREATE POLICY org_isolation ON users
  FOR SELECT
  USING (org_id = current_setting('app.current_org_id')::uuid);

-- Set org context in application
SET app.current_org_id = '12345678-1234-1234-1234-123456789012';
```

### Query Filtering

Always filter by org_id in queries:

```sql
-- Safe: includes org filter
SELECT * FROM users WHERE org_id = $1 AND email = $2;

-- Risky: missing org filter
SELECT * FROM users WHERE email = $1;
```

## Performance Optimization

### Indexes for Common Queries

```sql
-- Foreign keys (always index)
CREATE INDEX idx_users_org_id ON users(org_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);

-- Lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_sku ON products(sku);

-- Time-series queries
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- Multi-column for combined lookups
CREATE INDEX idx_order_items_order_product ON order_items(order_id, product_id);
```

### Partial Indexes

```sql
-- Only active users (most queries)
CREATE INDEX idx_active_users ON users(email) WHERE deleted_at IS NULL;

-- Recent orders (common report)
CREATE INDEX idx_recent_orders ON orders(created_at DESC)
  WHERE created_at > NOW() - INTERVAL '90 days';
```

## Typical Workflow

1. **Analyze Requirements** — Entities, relationships, scale
2. **Design Schema** — Tables, columns, constraints
3. **Normalize** — Ensure 3NF or BCNF
4. **Add Defensive Patterns** — Timestamps, soft deletes, optimistic locking
5. **Plan Indexes** — Foreign keys, common queries
6. **Generate Code** — Migrations, types, ORM definitions
7. **Implement** — Apply migrations, verify schema
8. **Monitor** — Track performance, adjust indexes

---

**Source:** [Database Schema Designer](https://github.com/alirezarezvani/claude-skills/tree/main/engineering/database-schema-designer)
**License:** MIT
