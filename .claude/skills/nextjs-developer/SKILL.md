---
name: "nextjs-developer"
description: "Build modern Next.js 14+ applications. Master App Router, Server Components, data fetching, performance optimization, and deployment. Use when: building Next.js apps, setting up routing, implementing data fetching, optimizing performance, deploying applications."
---

# Next.js Developer

Modern Next.js 14+ development with App Router and Server Components.

## Core Principles

### Always Use App Router

```
app/
├── layout.tsx           # Root layout
├── page.tsx             # Home page
├── (group)/             # Route group
│   └── about/
│       ├── layout.tsx
│       └── page.tsx
├── posts/               # Dynamic route
│   ├── [id]/
│   │   └── page.tsx
│   └── layout.tsx
├── api/                 # API routes
│   └── posts/
│       └── route.ts
└── loading.tsx          # Loading state
```

### Server Components First

Use Server Components by default, `'use client'` only when needed:

```typescript
// app/posts/page.tsx (Server Component - default)
import { getPost } from '@/lib/db';

export const revalidate = 3600; // ISR: revalidate every hour

export async function generateMetadata({ params }: { params: { id: string } }) {
  const post = await getPost(params.id);
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      images: [post.image],
    },
  };
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const post = await getPost(params.id);

  return (
    <article>
      <h1>{post.title}</h1>
      <time>{post.date}</time>
      <p>{post.content}</p>
      <CommentSection postId={params.id} />
    </article>
  );
}

// Components/CommentSection.tsx (Client Component - for interactivity)
'use client';

import { useState } from 'react';

export function CommentSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState([]);
  return <section>{/* interactive content */}</section>;
}
```

### Data Fetching Strategy

Use native `fetch()` with explicit caching:

```typescript
// Revalidate on-demand
export const revalidate = 3600; // 1 hour (ISR)

// Cache indefinitely (until manually revalidated)
const response = await fetch('https://api.example.com/data', {
  cache: 'force-cache', // default
});

// No caching
const response = await fetch('https://api.example.com/data', {
  cache: 'no-store',
});

// Revalidate every 60 seconds
const response = await fetch('https://api.example.com/data', {
  next: { revalidate: 60 },
});
```

### Route Organization

```typescript
// app/posts/[id]/page.tsx
interface Params {
  id: string;
}

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map(post => ({ id: post.id }));
}

export default async function PostPage({ params }: { params: Params }) {
  // Implementation
}
```

## Must-Follow Practices

### ✅ Loading & Error States

Always provide loading and error UI:

```typescript
// app/posts/loading.tsx
export default function Loading() {
  return <div className="animate-pulse">Loading posts...</div>;
}

// app/posts/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}

// app/posts/page.tsx
import { Suspense } from 'react';

export default function PostsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PostsList />
    </Suspense>
  );
}

async function PostsList() {
  const posts = await getPosts();
  return posts.map(p => <PostCard key={p.id} post={p} />);
}
```

### ✅ Image Optimization

Use `next/image` for all images:

```typescript
import Image from 'next/image';

export function Hero() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero image"
      width={1200}
      height={600}
      priority={true} // Load above the fold
      quality={85}
    />
  );
}

// Background images
export function Banner() {
  return (
    <div
      className="relative w-full h-96"
      style={{
        backgroundImage: `url(/banner.jpg)`,
        backgroundSize: 'cover',
      }}
    >
      Content
    </div>
  );
}
```

### ✅ Font Optimization

Use `next/font`:

```typescript
// app/layout.tsx
import { Inter, Playfair_Display } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.className} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

### ✅ Metadata

Use `generateMetadata` for dynamic SEO:

```typescript
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const post = await getPost(params.id);

  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: post.author }],
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      images: [
        {
          url: post.image,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  };
}
```

## Forbidden Practices

### ❌ Unnecessary Client Components

```typescript
// Wrong: entire page as client component
'use client';

export default function Page() {
  // If you don't use hooks/interactivity, this should be server
  return <static-content />;
}

// Correct: only client component for interactivity
export default async function Page() {
  const data = await fetch('...');
  return (
    <>
      <ServerContent data={data} />
      <ClientComponent />
    </>
  );
}

'use client';
function ClientComponent() {
  // Only interactive code here
}
```

### ❌ Missing Loading/Error Files

```typescript
// Wrong: no loading.tsx or error.tsx
export default async function Page() {
  const data = await fetch('...'); // Can suspend!
  return <div>{data}</div>;
}

// Correct: provide boundaries
// app/loading.tsx
export default function Loading() {
  return <Skeleton />;
}

// app/error.tsx
export default function Error() {
  return <ErrorUI />;
}
```

### ❌ Deploying Without Build Validation

```bash
# Always test locally first
next build  # Must succeed without errors
next start  # Test production build

# Then deploy with confidence
vercel deploy
```

## API Routes

### API Handler Pattern

```typescript
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') ?? '1';

    const posts = await getPosts(parseInt(page));

    return NextResponse.json({ posts });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const post = await createPost(body);

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 400 }
    );
  }
}
```

### Dynamic API Routes

```typescript
// app/api/posts/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const post = await getPost(params.id);

  if (!post) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(post);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const updated = await updatePost(params.id, body);

  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await deletePost(params.id);
  return new NextResponse(null, { status: 204 });
}
```

## Server Actions

Mutations on the server without API routes:

```typescript
// app/actions.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;

  // Validate
  if (!title || !content) {
    throw new Error('Missing fields');
  }

  // Database operation
  const post = await db.posts.create({ title, content });

  // Revalidate cache
  revalidatePath('/posts');

  return { success: true, postId: post.id };
}

// app/components/CreatePostForm.tsx
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
        {isPending ? 'Creating...' : 'Create'}
      </button>
      {state?.success && <p>Post created!</p>}
    </form>
  );
}
```

## Middleware

Run code before requests:

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Check auth
  const token = request.cookies.get('auth-token');

  if (!token && request.nextUrl.pathname.startsWith('/protected')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Add headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

## Deployment

### Vercel (Recommended)

```bash
# Connect GitHub repo
vercel link

# Deploy
vercel

# Production
git push  # Auto-deploys from main
```

### Alternative Hosting

```bash
# Build for production
next build  # Creates .next directory

# Start production server
next start  # Runs on port 3000

# Or containerize
docker build .
docker run -p 3000:3000 my-next-app
```

## Performance Best Practices

### Bundle Analysis

```bash
# Analyze bundle size
npm install -D @next/bundle-analyzer

# next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({});

# Run analysis
ANALYZE=true npm run build
```

### Route Caching

```typescript
// Cache everything for 1 hour
export const revalidate = 3600;

// Cache indefinitely
export const revalidate = false;

// Dynamic rendering (no cache)
export const revalidate = 0;
```

---

**Source:** [Next.js Developer](https://github.com/Jeffallan/claude-skills/tree/main/skills/nextjs-developer)
**License:** MIT | **Author:** Jeffallan
