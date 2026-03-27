---
name: "react-expert"
description: "Master React 19+ development. Build modern components, implement state management, leverage Server Components, handle forms, optimize performance, and test rigorously. Use when: building React components, implementing state management, working with React 19 features, optimizing performance."
---

# React Expert

Modern React 19+ development with Server Components, TypeScript, and best practices.

## Core Workflow

1. **Analyze Requirements** — Component purpose, state needs, rendering strategy
2. **Select Patterns** — Hooks, Context, Server Components, or state library
3. **Implement with TypeScript** — Strict types from the start
4. **Validate Types** — Run `tsc --noEmit` and fix all errors
5. **Optimize Performance** — Memoization, code splitting, bundle analysis
6. **Test Thoroughly** — React Testing Library with user-centric tests

## Must-Do Practices

### TypeScript Strict Mode
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

Run validation before every commit:
```bash
tsc --noEmit
```

### Error Boundaries

Wrap feature sections in Error Boundaries for resilience:

```typescript
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

export function MyFeature() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <FeatureContent />
    </ErrorBoundary>
  );
}
```

### Key Props

Proper key usage for list stability:

```typescript
// ✅ Correct: stable, unique identifier
<ul>
  {items.map(item => (
    <li key={item.id}>{item.name}</li>
  ))}
</ul>

// ❌ Wrong: array indices cause remounts
<ul>
  {items.map((item, index) => (
    <li key={index}>{item.name}</li>
  ))}
</ul>
```

### Effect Cleanup

Always clean up in effects:

```typescript
useEffect(() => {
  // Setup
  const unsubscribe = store.subscribe(handleChange);
  const timer = setTimeout(() => {}, 1000);

  // Cleanup function
  return () => {
    unsubscribe();
    clearTimeout(timer);
  };
}, []);
```

### Semantic HTML & ACCESSIBILITY

```typescript
// ✅ Correct: semantic HTML with ARIA
<button
  aria-label="Close menu"
  aria-expanded={isOpen}
  onClick={handleClose}
>
  ✕
</button>

<nav aria-label="Main navigation">
  <ul role="list">
    {links.map(link => (
      <li key={link.id}>
        <a href={link.href}>{link.label}</a>
      </li>
    ))}
  </ul>
</nav>

// ❌ Wrong: div click handlers, non-semantic
<div onClick={handleClose}>✕</div>
```

## Forbidden Practices

### ❌ Direct State Mutation

```typescript
// Wrong: mutating state directly
const [user, setUser] = useState({ name: 'John' });
user.name = 'Jane'; // Don't do this!

// Correct: create new object
setUser({ ...user, name: 'Jane' });
```

### ❌ Functions in JSX

```typescript
// Wrong: new function on every render
<button onClick={() => handleClick(item.id)}>
  Click me
</button>

// Correct: use useCallback or stable reference
const handleItemClick = useCallback(
  () => handleClick(item.id),
  [item.id]
);
<button onClick={handleItemClick}>Click me</button>
```

### ❌ Missing Effect Dependencies

```typescript
// Wrong: infinite loop or missing updates
useEffect(() => {
  fetchData(userId); // userId not in deps
}); // No dependencies array

// Correct: include all dependencies
useEffect(() => {
  fetchData(userId);
}, [userId]);
```

## State Management

### Local State

For component-specific state:

```typescript
const [count, setCount] = useState(0);
const [isOpen, setIsOpen] = useState(false);
```

### Context API

For moderate complexity, app-wide state:

```typescript
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = useCallback(() => {
    setTheme(t => t === 'light' ? 'dark' : 'light');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

### Zustand (Recommended for Complex State)

```typescript
import { create } from 'zustand';

interface StoreState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export const useStore = create<StoreState>(set => ({
  count: 0,
  increment: () => set(state => ({ count: state.count + 1 })),
  decrement: () => set(state => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));
```

### TanStack Query (For Server State)

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

export function useUserData(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch user');
      return res.json();
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UserData) => {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update user');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
```

## React 19+ Features

### Server Components

Use Server Components by default in Next.js:

```typescript
// app/posts/page.tsx (Server Component)
import { getPost } from '@/lib/db';

export default async function PostPage({ params }: { params: { id: string } }) {
  const post = await getPost(params.id);

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <CommentSection postId={params.id} />
    </article>
  );
}

// Components/CommentSection.tsx (Client Component)
'use client';

import { useState } from 'react';

export function CommentSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState([]);

  return (
    <section>
      {/* Client-side interactivity */}
    </section>
  );
}
```

### Server Actions

Handle mutations on the server:

```typescript
'use server';

import { revalidatePath } from 'next/cache';

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;

  // Database operation
  const post = await db.posts.create({ title, content });

  revalidatePath('/posts');

  return { success: true, postId: post.id };
}

// In a Client Component:
'use client';

import { createPost } from '@/app/actions';
import { useActionState } from 'react';

export function CreatePostForm() {
  const [state, formAction, isPending] = useActionState(createPost, null);

  return (
    <form action={formAction}>
      <input name="title" required />
      <textarea name="content" required />
      <button disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Post'}
      </button>
      {state?.success && <p>Post created!</p>}
    </form>
  );
}
```

### Suspense Boundaries

Stream content progressively:

```typescript
import { Suspense } from 'react';

function LoadingFallback() {
  return <div className="animate-pulse">Loading...</div>;
}

export default function Page() {
  return (
    <div>
      <h1>My Posts</h1>

      <Suspense fallback={<LoadingFallback />}>
        <PostsList />
      </Suspense>

      <Suspense fallback={<LoadingFallback />}>
        <Comments />
      </Suspense>
    </div>
  );
}

async function PostsList() {
  const posts = await fetchPosts();
  return posts.map(post => <PostCard key={post.id} post={post} />);
}

async function Comments() {
  const comments = await fetchComments();
  return comments.map(c => <Comment key={c.id} comment={c} />);
}
```

## Performance Optimization

### Code Splitting

```typescript
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

export function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### Memoization

```typescript
import { memo, useMemo, useCallback } from 'react';

// Memoize expensive component
const ExpensiveList = memo(function List({ items }: { items: Item[] }) {
  return items.map(item => <Item key={item.id} item={item} />);
});

// Memoize computed values
function DataDisplay({ items }: { items: Item[] }) {
  const stats = useMemo(() => {
    return {
      total: items.length,
      sum: items.reduce((acc, i) => acc + i.value, 0),
    };
  }, [items]);

  // Memoize callbacks
  const handleUpdate = useCallback((id: string) => {
    updateItem(id);
  }, []);

  return <div>{stats.total}</div>;
}
```

## Testing

### React Testing Library

```typescript
import { render, screen, userEvent } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('updates when button clicked', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);

    const button = screen.getByRole('button', { name: /increment/i });
    await user.click(button);

    expect(screen.getByText(/count: 1/i)).toBeInTheDocument();
  });

  it('shows error state', () => {
    render(<MyComponent hasError={true} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Error occurred');
  });
});
```

## TypeScript Patterns

### Discriminated Unions for State

```typescript
type LoadingState = { status: 'loading' };
type SuccessState = { status: 'success'; data: User };
type ErrorState = { status: 'error'; error: string };

type UserState = LoadingState | SuccessState | ErrorState;

function UserDisplay({ state }: { state: UserState }) {
  switch (state.status) {
    case 'loading':
      return <Spinner />;
    case 'success':
      return <UserProfile user={state.data} />;
    case 'error':
      return <ErrorAlert message={state.error} />;
  }
}
```

## Common Patterns

### Form Handling

```typescript
'use client';

import { useActionState } from 'react';

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(
    async (prevState, formData) => {
      const result = await sendMessage({
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message'),
      });
      return result;
    },
    null
  );

  return (
    <form action={formAction}>
      <input name="name" required />
      <input name="email" type="email" required />
      <textarea name="message" required />
      <button disabled={isPending}>
        {isPending ? 'Sending...' : 'Send'}
      </button>
      {state?.success && <p>Message sent!</p>}
      {state?.error && <p role="alert">{state.error}</p>}
    </form>
  );
}
```

---

**Source:** [React Expert](https://github.com/Jeffallan/claude-skills/tree/main/skills/react-expert)
**License:** MIT | **Author:** Jeffallan
