---
name: "senior-frontend"
description: "Build scalable React/Next.js applications. Generate projects and components, optimize bundles, implement accessibility, and design performant UIs. Use when: building React apps, creating components, optimizing performance, implementing accessibility."
---

# Senior Frontend Engineer

Build scalable, accessible, performant React and Next.js applications.

## Core Capabilities

### Project Scaffolder
Generates complete project boilerplate:
- **Next.js 14+** with TypeScript and Tailwind CSS
- **React** with Vite build tooling
- **Routing** setup (Next.js App Router)
- **Optional features:** Authentication, API clients, forms, testing, Storybook
- **Pre-configured:** ESLint, Prettier, TypeScript strict mode

### Component Generator
Creates React components with TypeScript:
- **Client components** for interactivity
- **Server components** for data fetching
- **Custom hooks** for reusable logic
- **Test files** with React Testing Library
- **Storybook stories** for documentation
- **TypeScript types** for component props

### Bundle Analyzer
Identifies optimization opportunities:
- **Dependency analysis** to find heavy packages
- **Health scoring** (A-F grades) for bundle size
- **Alternative recommendations** for oversized packages
- **Split analysis** to find unused code
- **Tree-shaking validation** for dead code removal

## React Patterns

### Compound Components
Share state across multiple components:
```typescript
<Select>
  <Select.Trigger />
  <Select.Content>
    <Select.Item value="option1" />
  </Select.Content>
</Select>
```

Benefits: Flexibility, composition, encapsulation.

### Custom Hooks
Extract reusable logic:
```typescript
const { data, loading, error } = useFetch(url);
const { value, setValue } = useLocalStorage(key);
const { isOpen, open, close } = useModal();
```

Benefits: Reusability, separation of concerns, testability.

### Render Props
Flexible component composition:
```typescript
<DataFetcher url="/api/users">
  {({ data, loading }) => (
    <UserList users={data} loading={loading} />
  )}
</DataFetcher>
```

## Next.js Optimization

### Server Components First
- Use server components by default
- Fetch data directly in components
- Reduce client-side JavaScript
- Secure API calls and secrets

### Client Components for Interactivity
- Use only when interactivity needed
- Implement state management
- Handle user events
- Keep components small

### Image Optimization
```typescript
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority
/>
```

Benefits:
- Automatic format conversion (WebP)
- Responsive image serving
- Lazy loading by default
- Priority loading for above-fold images

### Data Fetching
```typescript
// Parallel data fetching
const [users, posts] = await Promise.all([
  fetch('/api/users'),
  fetch('/api/posts'),
]);

// Suspense for streaming
<Suspense fallback={<Loading />}>
  <UserList />
</Suspense>
```

## Accessibility & Testing

### Semantic HTML
- Use appropriate HTML elements
- `<button>` instead of `<div onClick>`
- `<nav>`, `<main>`, `<aside>` landmarks
- `<form>` and form fields properly

### Keyboard Navigation
- All interactions via keyboard
- Visible focus indicators
- Tab order follows visual order
- Escape key closes modals

### ARIA Labels
```typescript
<button aria-label="Close menu">✕</button>
<nav aria-label="Main navigation">
<div role="status" aria-live="polite">
```

### Color Contrast
- Minimum ratio 4.5:1 for text
- Check with contrast checker tools
- Test with color-blind simulators
- Avoid color-only information

### Testing with React Testing Library

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('button click works', async () => {
  render(<Button>Click me</Button>);
  const button = screen.getByRole('button');
  await userEvent.click(button);
  expect(button).toHaveAttribute('aria-pressed', 'true');
});
```

## Typical Workflow

### New Project Setup
1. **Generate boilerplate** — Choose Next.js or React
2. **Verify installation** — Run dev server
3. **Configure tools** — ESLint, Prettier, TypeScript
4. **Run quality checks** — Lint, type check
5. **Create first component** — Verify setup works

### Component Development
1. **Define props** — TypeScript interface
2. **Generate component** — Scaffold with tests
3. **Implement logic** — Add interactivity
4. **Write tests** — React Testing Library
5. **Create Storybook** — Document component
6. **Review accessibility** — Audit with tools

### Performance Optimization
1. **Analyze bundle** — Bundle analyzer
2. **Identify heavy packages** — Find opportunities
3. **Replace dependencies** — Use lighter alternatives
4. **Code splitting** — Dynamic imports
5. **Re-analyze** — Verify improvements

## Supported Technologies

- **Frameworks:** Next.js 14+, React 18+, Remix, SvelteKit
- **Languages:** TypeScript, JavaScript
- **Styling:** Tailwind CSS, CSS Modules, Styled Components
- **Testing:** Vitest, Jest, React Testing Library, Playwright
- **State Management:** TanStack Query, Zustand, Redux, Context
- **Build Tools:** Vite, Turbopack, Webpack

## Quick Commands

```bash
# Project generation
/senior-frontend scaffold-project --framework next --features auth,db,testing

# Component creation
/senior-frontend create-component --name UserCard --type client

# Bundle analysis
/senior-frontend analyze-bundle --report html
```

---

**Source:** [Senior Frontend Engineer](https://github.com/alirezarezvani/claude-skills/tree/main/engineering-team/senior-frontend)
**License:** MIT
