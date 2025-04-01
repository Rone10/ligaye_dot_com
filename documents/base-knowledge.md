# Base Knowledge: Ligaye.com

**Purpose of this Document:** This file provides essential context about the Ligaye.com project for AI assistants. Please refer to this information to understand the project's goals, technical stack, architecture, and conventions when providing assistance.

---

## 1. Project Overview

### 1.1. Purpose & Domain
*   **Project Goal:** A comprehensive job board platform designed specifically for the Gambian market, connecting job seekers and employers with features tailored to local needs and payment options.
*   **Target Audience:** Job seekers, employers, and administrators in Gambia.
*   **Core Domain:** Employment, Job Posting, Recruitment, Applicant Tracking.

### 1.2. Key Features
*   User authentication with role-based access (job seeker, employer, admin).
*   Profile creation and management for job seekers and employers.
*   Job posting with flexible payment options (Stripe or cash).
*   Job search with filters (keywords, location, job type).
*   Job application process with tracking and notifications.
*   Saved jobs feature for job seekers.
*   Admin payment management for cash transactions.
*   Configurable job duration to control visibility.

---

## 2. Technical Stack

*   **Framework:** Next.js 15 with **App Router**
*   **Language:** TypeScript
*   **UI Library:** React
*   **Styling:** Tailwind CSS
*   **UI Components:** Shadcn UI (installed in `components/ui/`)
*   **Backend/BaaS:** Supabase
    *   **Database:** PostgreSQL (via Supabase)
    *   **ORM/Query Builder:** Drizzle ORM
*   **Authentication:** Supabase Auth
*   **State Management:**
    *   **Server State/Caching:** React Query (TanStack Query)
    *   **Client State (Global):** Context API (specifically for user session)
    *   **Client State (Local):** React Hooks (`useState`, `useReducer`)
    *   **URL State:** `nuqs`
*   **Data Validation:** Zod
*   **Animation:** Framer Motion
*   **Icons:** Lucide React
*   **Date Handling:** `date-fns`
*   **Package Manager:** pnpm
*   **Testing:** Jest
*   **Linting/Formatting:** ESLint/Prettier

---

## 3. Project Architecture & Structure

*   **Core Architecture:** **Vertical Slice Architecture (VSA)** is strictly followed. Code is organized by feature/capability, and this structure is applied *granularly within each route segment* in the `app/` directory.
*   **Location of Features:** The project **does not use** a `src/` directory. Feature-specific code (components, actions, **queries**, hooks, utils, types, tests) resides directly within the relevant route segment folder in `app/`. Conventionally, sub-folders prefixed with `_` (e.g., `_components`, `_actions`, `_queries`, `_utils`, `_hooks`) are used within *each* route segment (e.g., `app/transactions/`, `app/transactions/[id]/`, `app/transactions/new/`).
*   **Instruction for AI:** When adding or modifying code related to a specific feature *view* (e.g., "Transaction Details", "Create Transaction Form"), **place all related files (`_components`, `_actions`, `_queries`, etc.) within that specific route segment's directory** (e.g., `app/transactions/[id]/`, `app/transactions/new/`). Avoid creating shared abstractions between different views prematurely; prioritize the isolation of each route segment. **Duplication between sibling route segments (e.g., having similar validation logic in `app/transactions/new/_utils/` and `app/transactions/[id]/edit/_utils/`) is acceptable and often preferred** if it maintains isolation and avoids incorrect abstractions.
*   **Shared Code:**
    *   **Generic UI Components:** Located in `components/ui/` (e.g., Button, Card, Input - all Shadcn UI components). These should be truly generic and presentation-focused.
    *   **Core Utilities/Libs:** Located in `lib/`. This contains only genuinely cross-cutting, stable infrastructure code:
        *   `lib/db/index.ts`: Drizzle client instance setup.
        *   `lib/db/schema.ts`: Drizzle schema definition.
        *   `lib/supabase/client.ts`: Supabase client-side helpers/instance.
        *   `lib/supabase/server.ts`: Supabase server-side helpers/instance (incl. `getUser`).
        *   `lib/utils.ts`: Truly generic, app-wide utility functions (keep minimal).
        *   `lib/constants.ts`: Global application constants.
        *   **Note:** Feature-specific logic, data fetching/mutation functions (`_queries.ts`), or feature-specific utils **DO NOT** belong in `lib/`.
*   **Example Feature Structure (`transactions`):**
    ```
    app/
    └── transactions/              # Feature: Transactions Root
        ├── page.tsx               # List View (Server Component)
        ├── _components/           # Components ONLY for the List View
        │   ├── TransactionsDataTable.tsx
        │   └── TransactionListFilters.tsx
        ├── _actions.ts            # Server Actions for the List View (calling ./_queries.ts)
        ├── _queries.ts            # DB queries ONLY for the List View (imports from '@/lib/db/*')
        ├── _utils/                # Utils ONLY for the List View
        ├── layout.tsx             # Optional: Layout shared by all transaction routes
        │
        ├── [id]/                  # Sub-Feature Slice: Transaction Detail View
        │   ├── page.tsx           # Detail View (Server Component, calling ./_queries.ts)
        │   ├── _components/       # Components ONLY for the Detail View
        │   │   └── TransactionDetailDisplay.tsx
        │   ├── _actions.ts        # Actions ONLY for the Detail View (calling ./_queries.ts)
        │   ├── _queries.ts        # DB queries ONLY for the Detail View (e.g., getTransactionById)
        │   ├── _utils/            # Utils ONLY for the Detail View
        │   └── loading.tsx        # Loading UI specific to the detail page
        │
        └── new/                   # Sub-Feature Slice: Create Transaction View
            ├── page.tsx           # Create Form View (Server Component + Client Component)
            ├── _components/       # Components ONLY for the Create View
            │   └── NewTransactionForm.tsx  # ('use client')
            ├── _hooks/            # Client Hooks ONLY for the Create View ('use client')
            ├── _actions.ts        # Server Action ONLY for creating (calls ./_queries.ts)
            ├── _queries.ts        # DB queries ONLY for creating (e.g., createTransaction)
            ├── _utils/            # Utils ONLY for the Create View (e.g., validation.ts)
            └── error.tsx          # Error UI specific to creation flow
    ```

---

## 4. Data Layer & Database

*   **ORM/Query Builder:** Drizzle ORM
*   **Database Schema Overview:**
    *   `profiles`: Stores user profile information including name, email, and role.
    *   `locations`: Stores structured location data for jobs, employers, and tenders.
    *   `industries`: Maintains a list of industries for employer categorization.
    *   `sectors`: Stores sectors for tender categorization.
    *   `employerProfiles`: Contains employer-specific profile information linked to base profiles.
    *   `candidateProfiles`: Contains candidate-specific profile information linked to base profiles.
    *   `skills`: Stores skill definitions that can be linked to jobs and candidates.
    *   `jobs`: Records job postings with detailed information about positions.
    *   `jobSkills`: Junction table linking jobs to required skills.
    *   `candidateSkills`: Junction table linking candidates to their skills.
    *   `jobIndustries`: Junction table linking jobs to relevant industries.
    *   `education`: Stores candidate education history.
    *   `experience`: Stores candidate work experience.
    *   `applications`: Records job applications submitted by candidates.
    *   `savedJobs`: Tracks jobs saved by users for later viewing.
    *   `tenders`: Stores tender/procurement opportunities.
    *   `payments`: Records payment transactions from employers.
*   **Data Access Pattern:**
    *   All database interactions use Drizzle ORM.
    *   **Queries and mutations are defined as exported functions within `_queries.ts` files located inside the specific route segment slice they serve** (e.g., `app/tenders/[id]/_queries.ts`).
    *   Server Components (`page.tsx`) and Server Actions (`_actions.ts`) import and call functions directly from their **sibling `_queries.ts` file**.
    *   **There is NO central `queries.ts` file in `lib/db/`.** Data access logic is decentralized to the feature slice.
*   **Database Client:** The primary Drizzle client instance is accessed via: `import { db } from '@/lib/db';`. This `db` object is a function and **must always be `await`ed** before use (e.g., `await db().select()...`).
*   **Schema Definition:** The database schema is defined in `lib/db/schema.ts` using Drizzle schema syntax.
*   **Type Safety:** Always use Drizzle inferred types imported from `lib/db/schema.ts` (e.g., `import type { NewTransaction } from '@/lib/db/schema';`).

---

## 5. Key Implementation Conventions & Constraints

*   **Page Props**: when accessing params in page.tsx components, refer the page-props.mdc rule in Cursor rules
*   **Data Mutations:** Primarily use **Next.js Server Actions** defined within the specific route segment's slice (e.g., `app/transactions/new/_actions.ts`). These actions **must** import and call the necessary data mutation functions from their **sibling `_queries.ts` file**. API routes (`route.ts`) are **NOT** used for application database interactions.
*   **Authentication:** Access the current logged-in user server-side via `const user  = await getUser()` imported from `import { getUser } from '@/lib/supabase/server';`. Do not destructure user, access it directly like so: `const user = await getUser()` For client-side Supabase interactions, helpers/client instances can be imported from `lib/supabase/client.ts`.
*   **Styling & UI:** Use Tailwind CSS and leverage existing Shadcn UI components from `components/ui/` for form elements and layout. Follow the design principles, color palette, typography, spacing, and other UI specifications defined in `documents/style-guide.md` to ensure consistent styling throughout the project. This includes using the glassmorphic effects, proper elevation/shadow system, border radius values, and interactive states as specified in the style guide.
*   **Component Naming:** PascalCase for React components.
*   **File Naming:** Generally kebab-case (e.g., `transaction-card.tsx`). Use Next.js conventions where required (`page.tsx`, `layout.tsx`, etc.). Use `_actions.ts`, `_queries.ts`, and `_` prefixed folders (`_components/`, `_hooks/`, `_utils/`) within feature slices.
*   **Error Handling:** Implement appropriate try/catch blocks within Server Actions and `_queries.ts` functions. Use Next.js `error.tsx` boundaries for route-level UI error handling. Return specific error states/objects from actions/queries where applicable for finer-grained client-side handling.
*   **Environment Variables:** Refer to `.env`. Access using `process.env.VARIABLE_NAME` (server-side) or `process.env.NEXT_PUBLIC_VARIABLE_NAME` (client-side).
*   **Package Manager:** Always use `pnpm` for installing or managing dependencies.
*   **Code Style:** Adhere to the project's ESLint and Prettier configurations. Run `pnpm lint` and `pnpm format` as needed.
*   **"Do Not Touch":**
    *   Core Drizzle client setup (`lib/db/index.ts`) and config (`drizzle.config.ts`).
    *   Database schema definition (`lib/db/schema.ts`).
    *   Core Supabase configuration files / base client setup (`lib/supabase/*`).
    *   **Instruction:** The database schema and connection are stable and correct; do not alter them without explicit instruction.
*   **Specific Library Usage:**
    *   Database interactions **must** occur via functions defined in `_queries.ts` files within feature slices, using the Drizzle ORM interface. Do not use the base Supabase client directly for table access.
    *   Assume all required Shadcn UI components are installed in `components/ui/` and ready for import.
    *   Remember to **`await db()`** when accessing the Drizzle client instance.
*   **Page Props in Next.js 15:** When working with page.tsx components in Next.js 15, props are now returned as promises and must be awaited before usage. This is a significant change from previous versions:
    ```tsx
    // In page.tsx
    interface PageProps {
        params: Promise<{id: string}>
    }
    export default async function Page({ params }: PageProps) {
      // CORRECT: Await the params.id before using it
      const id = await params.id;
      
      // INCORRECT: This will not work as expected
      // const id = params.id;
      
      // Use the awaited value in your component
      return <YourComponent id={id} />;
    }
    ```
    This applies to all props passed to page components, including `params`, `searchParams`, and any other props. Always remember to wrap them in a promise and await these values before using them in your component logic or passing them to child components.

---

**Final Instruction:** Please prioritize adhering to the granular Vertical Slice Architecture (colocation within specific `app/` route segments, including `_queries.ts`) and the conventions outlined above, especially regarding decentralized data access patterns, when generating or modifying code for the Blotter Hub project.