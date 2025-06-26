# Ligaye.com Project Context

## Overview
Ligaye.com is a comprehensive job board platform designed specifically for the Gambian market, connecting job seekers and employers with features tailored to local needs and payment options.

## Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **UI**: React, Tailwind CSS, Shadcn UI (in `components/ui/`)
- **Backend**: Supabase (PostgreSQL + Auth)
- **ORM**: Drizzle ORM
- **State Management**: 
  - Server State: React Query (TanStack Query)
  - Client State: Context API (for user session), React Hooks
  - URL State: `nuqs`
- **Validation**: Zod
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Package Manager**: pnpm

## Architecture: Vertical Slice Architecture (VSA)
The project follows VSA strictly with code organized by feature/capability within each route segment in the `app/` directory.

### Key Structure Principles:
- **NO `src/` directory** - everything is in `app/`
- Feature-specific code lives in route segments with `_` prefixed folders
- Each route segment contains its own `_components`, `_actions`, `_queries`, `_hooks`, `_utils`
- **Duplication between sibling routes is acceptable** to maintain isolation

### Example Feature Structure:
```
app/
└── transactions/
    ├── page.tsx               # List View
    ├── _components/           # Components ONLY for List View
    ├── _actions.ts           # Server Actions for List View
    ├── _queries.ts           # DB queries ONLY for List View
    ├── _utils/               # Utils ONLY for List View
    ├── [id]/                 # Detail View
    │   ├── page.tsx
    │   ├── _components/
    │   ├── _actions.ts
    │   ├── _queries.ts
    │   └── _utils/
    └── new/                  # Create View
        ├── page.tsx
        ├── _components/
        ├── _actions.ts
        ├── _queries.ts
        └── _utils/
```

## Shared Code Locations
- **Generic UI Components**: `components/ui/` (Shadcn UI components)
- **Core Infrastructure**: `lib/`
  - `lib/db/index.ts`: Drizzle client setup
  - `lib/db/schema.ts`: Database schema
  - `lib/supabase/client.ts`: Client-side Supabase helpers
  - `lib/supabase/server.ts`: Server-side Supabase helpers (includes `getUser`)
  - `lib/utils.ts`: Generic utility functions
  - `lib/constants.ts`: Global constants

## Database & Data Access
- **ORM**: Drizzle ORM
- **Pattern**: Queries/mutations defined in `_queries.ts` files within each route segment
- **Access**: `import { db } from '@/lib/db'` - **MUST await db()** before use
- **NO central queries file** - data access is decentralized to feature slices

### Key Tables:
- `profiles`: User profile information
- `locations`: Structured location data
- `industries`, `sectors`: Categorization data
- `employerProfiles`, `candidateProfiles`: Role-specific profiles
- `jobs`, `applications`, `savedJobs`: Job-related data
- `skills`, `jobSkills`, `candidateSkills`: Skills management
- `education`, `experience`: Candidate history
- `tenders`: Procurement opportunities
- `payments`: Transaction records

## Critical Conventions

### Next.js 15 Page Props
Props are now promises and must be awaited:
```tsx
interface PageProps {
    params: Promise<{id: string}>
}
export default async function Page({ params }: PageProps) {
    const id = await params.id; // CORRECT: Await the param
    // Use the awaited value...
}
```

### Authentication
Server-side: `const user = await getUser()` from `@/lib/supabase/server`
**Do not destructure user**, access directly.

### Data Mutations
Use Server Actions in `_actions.ts` files that call sibling `_queries.ts` functions.
NO API routes for database interactions.

### Styling
- Use Tailwind CSS with custom classes from the project's configuration
- Reference `app/globals.css`, `documents/style-guide.md`, and `tailwind.config.ts`
- Use semantic color classes (e.g., `bg-primary-*`, `text-theme-*`)
- Avoid hardcoded values in square brackets

### Testing & Linting
- Check README or search codebase for test commands
- Run lint/typecheck commands after completing tasks
- If commands unknown, ask user and suggest adding to CLAUDE.md

## Important Notes
- **Package Manager**: Always use `pnpm`
- **Error Handling**: Use try/catch in Server Actions and `_queries.ts`
- **Do NOT restart dev server** unless explicitly asked
- **Do NOT modify**: Core DB setup, schema, or Supabase config files
- **Always await db()** when using Drizzle client

## React & Next.js Form Handling Best Practices

### 1. Async Error Handling in Forms
**NEVER wrap entire form submission logic in try/catch**. Only wrap the server call:
```tsx
// ❌ WRONG - Don't do this
try {
  const result = await serverAction(data);
  if (result.success) {
    toast.success();
    router.refresh();
  }
} catch (error) {
  toast.error(); // Will catch client-side errors too!
}

// ✅ CORRECT - Isolate server errors
let result;
try {
  result = await serverAction(data);
} catch (error) {
  toast.error('Server communication error');
  return;
}

// Handle UI separately
if (result.success) {
  toast.success();
  router.refresh();
} else {
  toast.error(result.error);
}
```

### 2. Dialog State & Router Transitions
**Decouple dialog closing from background transitions** to avoid race conditions:
```tsx
// ❌ WRONG - Dialog gets stuck if isPending
const canClose = !isSubmitting && !isPending;

// ✅ CORRECT - Only block during submission
const canClose = !isSubmitting;
```

### 3. React Synthetic Events & Async Operations
**Use refs for DOM operations after await**. React nullifies event.currentTarget:
```tsx
// ❌ WRONG - Will be null after await
async function handleSubmit(e: FormEvent) {
  await serverAction();
  e.currentTarget.reset(); // Error: Cannot read null
}

// ✅ CORRECT - Use ref
const formRef = useRef<HTMLFormElement>(null);
async function handleSubmit(e: FormEvent) {
  await serverAction();
  formRef.current?.reset();
}
```

## Remember
- Prioritize VSA and route-segment isolation
- Feature code belongs in route segments, not in `lib/`
- Duplication between sibling routes is acceptable
- Check existing patterns before implementing new features
- Separate server error handling from UI logic
- Use refs for DOM operations in async functions
- Don't couple dialog state with background operations