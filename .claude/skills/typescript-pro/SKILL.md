---
name: "typescript-pro"
description: "Master TypeScript type systems. Design type-safe APIs, implement advanced patterns, optimize build performance, and ensure exhaustive type coverage. Use when: designing type architectures, implementing complex types, optimizing build performance, ensuring type safety."
---

# TypeScript Pro

Advanced TypeScript patterns for type-safe, maintainable applications.

## Core Methodology

1. **Type Architecture Analysis** — Evaluate tsconfig and build performance
2. **Type-First API Design** — Design APIs with types first, implementation second
3. **Implementation with Safety** — Apply type guards and discriminated unions
4. **Build Optimization** — Configure incremental compilation and project references
5. **Type Validation** — Ensure comprehensive type coverage

## Strict Configuration

Always start with strict TypeScript:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node"
  }
}
```

## Branded Types

Prevent accidental mixing of similar types:

```typescript
// Create branded types for IDs
type UserId = string & { readonly brand: 'UserId' };
type PostId = string & { readonly brand: 'PostId' };

function brandUserId(id: string): UserId {
  return id as UserId;
}

function brandPostId(id: string): PostId {
  return id as PostId;
}

function getUser(id: UserId) {
  // id is guaranteed to be a UserId, not just any string
}

const userId = brandUserId('123');
const postId = brandPostId('456');

getUser(userId); // ✅ OK
getUser(postId); // ❌ Type error: PostId is not UserId
```

## Discriminated Unions

Model complex states with type safety:

```typescript
type LoadingState = { status: 'loading' };
type SuccessState = { status: 'success'; data: User };
type ErrorState = { status: 'error'; message: string };

type UserState = LoadingState | SuccessState | ErrorState;

function handleUserState(state: UserState) {
  switch (state.status) {
    case 'loading':
      return 'Loading...';
    case 'success':
      // state is SuccessState here, data is available
      return `Hello, ${state.data.name}`;
    case 'error':
      // state is ErrorState here, message is available
      return `Error: ${state.message}`;
  }
}

// Exhaustiveness checking
function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${x}`);
}

function handleUserStateExhaustive(state: UserState) {
  switch (state.status) {
    case 'loading':
      return 'Loading...';
    case 'success':
      return `Hello, ${state.data.name}`;
    case 'error':
      return `Error: ${state.message}`;
    default:
      return assertNever(state); // Error if not all cases covered
  }
}
```

## Type Guards

Safely narrow types:

```typescript
// Custom type guard
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value
  );
}

function processValue(value: unknown) {
  if (isString(value)) {
    // value is string here
    console.log(value.toUpperCase());
  } else if (isUser(value)) {
    // value is User here
    console.log(value.name);
  }
}
```

## Advanced Utility Types

### Deep Readonly

```typescript
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};

interface User {
  name: string;
  address: {
    city: string;
  };
}

const user: DeepReadonly<User> = {
  name: 'John',
  address: { city: 'NYC' },
};

// user.name = 'Jane'; // ❌ Error
// user.address.city = 'LA'; // ❌ Error
```

### Conditional Types

```typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<'hello'>; // true
type B = IsString<number>; // false

// Distribute over unions
type Flatten<T> = T extends Array<infer U> ? U : T;

type A = Flatten<string[]>; // string
type B = Flatten<string>; // string
type C = Flatten<string[] | number>; // string | number
```

### Mapped Types

```typescript
// Make all properties optional
type Partial<T> = {
  [P in keyof T]?: T[P];
};

// Make all properties readonly
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

// Make all properties getters
type Getters<T> = {
  [P in keyof T as `get${Capitalize<string & P>}`]: () => T[P];
};

type User = { name: string; age: number };
type UserGetters = Getters<User>;
// { getName: () => string; getAge: () => number }
```

## Class Decorators

```typescript
// Decorator for method logging
function LogMethod(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function(...args: any[]) {
    console.log(`Calling ${propertyKey} with:`, args);
    const result = originalMethod.apply(this, args);
    console.log(`Result:`, result);
    return result;
  };

  return descriptor;
}

class Calculator {
  @LogMethod
  add(a: number, b: number): number {
    return a + b;
  }
}
```

## API Design with Types

### Request/Response Types

```typescript
// Request types with literal unions
type CreateUserRequest = {
  type: 'create_user';
  name: string;
  email: string;
};

type UpdateUserRequest = {
  type: 'update_user';
  userId: string;
  name?: string;
  email?: string;
};

type DeleteUserRequest = {
  type: 'delete_user';
  userId: string;
};

type UserRequest = CreateUserRequest | UpdateUserRequest | DeleteUserRequest;

async function handleUserRequest(req: UserRequest) {
  switch (req.type) {
    case 'create_user':
      return createUser(req.name, req.email);
    case 'update_user':
      return updateUser(req.userId, { name: req.name, email: req.email });
    case 'delete_user':
      return deleteUser(req.userId);
  }
}
```

### Response Types

```typescript
type Success<T> = { ok: true; data: T };
type Failure<E> = { ok: false; error: E };

type Result<T, E = string> = Success<T> | Failure<E>;

async function fetchUser(id: string): Promise<Result<User, 'NOT_FOUND' | 'SERVER_ERROR'>> {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (response.status === 404) {
      return { ok: false, error: 'NOT_FOUND' };
    }
    const data = await response.json();
    return { ok: true, data };
  } catch {
    return { ok: false, error: 'SERVER_ERROR' };
  }
}

// Usage with type safety
const result = await fetchUser('123');
if (result.ok) {
  console.log(result.data.name); // Safe: data is available
} else {
  console.log(`Error: ${result.error}`); // Safe: error is available
}
```

## Build Optimization

### tsconfig Project References

```json
// tsconfig.json (root)
{
  "files": [],
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/ui" },
    { "path": "./packages/api" }
  ]
}

// packages/core/tsconfig.json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### Incremental Compilation

```json
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

## Type Coverage

### Checking Coverage

```bash
# Install type coverage analyzer
npm install --save-dev type-coverage

# Check type coverage
type-coverage

# Show untyped code
type-coverage --detail

# Set minimum threshold
type-coverage --at-least 95
```

### Enforcing Types

```typescript
// ESLint rules
{
  "@typescript-eslint/explicit-function-return-types": "error",
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/no-implicit-any-catch": "error"
}
```

## Common Patterns

### Generic Utilities

```typescript
// Type-safe event emitter
type EventMap = {
  userCreated: { id: string; name: string };
  userDeleted: { id: string };
};

class EventEmitter<T extends Record<string, any>> {
  private listeners: Map<string, Function[]> = new Map();

  on<K extends keyof T>(event: K, handler: (data: T[K]) => void) {
    if (!this.listeners.has(String(event))) {
      this.listeners.set(String(event), []);
    }
    this.listeners.get(String(event))!.push(handler);
  }

  emit<K extends keyof T>(event: K, data: T[K]) {
    const handlers = this.listeners.get(String(event)) ?? [];
    handlers.forEach(h => h(data));
  }
}

const emitter = new EventEmitter<EventMap>();
emitter.on('userCreated', (data) => {
  console.log(data.name); // ✅ Autocomplete: name is available
});
```

### API Client with Types

```typescript
type Endpoint<T> = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  request?: any;
  response: T;
};

const endpoints = {
  getUser: {
    method: 'GET',
    path: '/users/:id',
    response: {} as User,
  },
  createPost: {
    method: 'POST',
    path: '/posts',
    request: {} as CreatePostRequest,
    response: {} as Post,
  },
} as const;

class ApiClient {
  async call<E extends Endpoint<any>>(
    endpoint: E,
    params: E extends { request: infer R } ? R : never
  ): Promise<E extends { response: infer Res } ? Res : never> {
    // Implementation
  }
}

const client = new ApiClient();
const user = await client.call(endpoints.getUser, {}); // ✅ No params needed
const post = await client.call(endpoints.createPost, {
  title: 'Hello',
}); // ✅ createPostRequest is required
```

## Forbidden Practices

### ❌ Unqualified `any`

```typescript
// Wrong: loses type safety
function processData(data: any) {
  return data.value; // No type checking
}

// Correct: use unknown and guard
function processData(data: unknown) {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return (data as any).value;
  }
  throw new Error('Invalid data');
}
```

### ❌ Disabled Strict Checks

```json
// Wrong: disables strict mode
{
  "strict": false
}

// Correct: enable all strict checks
{
  "strict": true
}
```

### ❌ Using `enum`

```typescript
// Wrong: enums are problematic
enum Status {
  Active = 'active',
  Inactive = 'inactive',
}

// Correct: use const objects
const Status = {
  Active: 'active',
  Inactive: 'inactive',
} as const;

type Status = typeof Status[keyof typeof Status];
```

---

**Source:** [TypeScript Pro](https://github.com/Jeffallan/claude-skills/tree/main/skills/typescript-pro)
**License:** MIT | **Author:** Jeffallan
