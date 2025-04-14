
Okay, I understand the performance issues you're facing with Ligaye.com. Slow load times, sluggish navigation, and excessive database queries due to dynamic rendering are common problems that can significantly impact user experience.

Based on the build output showing all routes (`ƒ`) are dynamically rendered, the `base-knowledge.md` context, and the Next.js best practices you provided, here's a detailed plan to fine-tune the application's performance. I will put this plan into `documents/plans/performance-finetuning.md`.

**Analysis Summary:**

The primary performance bottlenecks appear to stem from:

1.  **Universal Dynamic Rendering:** Every page is server-rendered on demand (`ƒ`), preventing the use of Next.js's powerful static optimization and caching capabilities (Full Route Cache, Data Cache). This leads to slower initial loads and increased server load as every request hits the compute layer and potentially the database.
2.  **Lack of Server-Side Caching:** The absence of effective caching means data is likely fetched from the database on almost every request, contributing to latency. While React Query handles client-side server state, it doesn't optimize the initial server render or subsequent requests hitting the server directly. Direct Drizzle usage bypasses Next.js's built-in `fetch` caching.
3.  **Potentially Large Client-Side JavaScript Bundles:** Pages like `/employer/jobs/new` (535kB), `/employer/jobs/[id]/edit` (531kB), and `/jobs/[id]/apply` (465kB) have significant First Load JS sizes, impacting client-side hydration, interactivity (TBT), and overall perceived speed.
4.  **Slow Navigation:** Likely a consequence of points 1, 2, and 3. Either the server takes too long to render the next page, or large JS bundles slow down client-side transitions and hydration. Lack of prefetching could also be a factor.

**Goals:**

*   Significantly improve Core Web Vitals (LCP, FID/INP, CLS).
*   Enable Static Site Generation (SSG) or Incremental Static Regeneration (ISR) for as many routes as possible.
*   Reduce First Load JS size, particularly for complex pages.
*   Decrease server response times by implementing effective caching.
*   Make page navigation feel near-instantaneous.

**Action Plan (Prioritized):**

Here’s a phased approach focusing on the highest impact areas first:

**Phase 1: Enable Caching & Static Rendering (High Impact)**

1.  **Audit Dynamic Function Usage:**
    *   **Action:** Systematically scan all `layout.tsx` and `page.tsx` files, plus any Server Components within `_components/` folders.
    *   **Look For:** Direct or indirect usage of:
        *   `cookies()` from `next/headers`
        *   `headers()` from `next/headers`
        *   `searchParams` prop (when read outside of a `<Suspense>` boundary)
        *   Potentially `await getUser()` from `@/lib/supabase/server` if it reads cookies/headers internally without being memoized or cached per request. **Verify** `getUser`'s implementation regarding dynamic function usage.
    *   **Remediation:**
        *   If dynamic functions are used unnecessarily (e.g., reading headers for analytics that could be done client-side), remove them.
        *   If essential, isolate the component needing the dynamic function within a `<Suspense>` boundary. This allows the surrounding page structure to potentially remain static or be cached.
        *   Pass data down as props from Server Components instead of having child components read dynamic functions themselves.

2.  **Implement Data Caching Strategy:**
    *   **Challenge:** Drizzle ORM doesn't use `fetch`, so Next.js's automatic `fetch` caching doesn't apply to database queries in `_queries.ts`.
    *   **Action:** Implement caching at the data-fetching level within your `_queries.ts` files or potentially at the route segment level.
    *   **Strategies:**
        *   **Route Segment Config:** Use `export const revalidate = <seconds>;` in `page.tsx` or `layout.tsx` files to enable time-based revalidation (ISR) for entire segments. This caches the rendered HTML and the data. Start with longer durations (e.g., 3600 seconds) for less frequently changing data (like individual job details, employer profiles) and adjust.
        *   **`unstable_cache` (or stable equivalent if available in Next 15):** Wrap data-fetching functions (`_queries.ts`) with Next.js's caching helpers. This allows fine-grained, tag-based caching.
            ```typescript
            // Example in _queries.ts
            import { unstable_cache } from 'next/cache';
            import { db } from '@/lib/db';
            import { jobs } from '@/lib/db/schema';
            import { eq } from 'drizzle-orm';

            export const getJobByIdCached = unstable_cache(
              async (jobId: string) => {
                console.log(`Fetching job ${jobId}`); // Log to see cache misses
                const database = await db();
                return database.query.jobs.findFirst({
                  where: eq(jobs.id, jobId),
                  with: { /* relations */ }
                });
              },
              ['get-job-by-id'], // Cache key parts
              {
                tags: (jobId) => [`jobs`, `job:${jobId}`], // Cache tags for revalidation
                revalidate: 3600 // Optional: Time-based revalidation (seconds)
              }
            );
            ```
        *   **Tag-Based Revalidation:** In Server Actions (`_actions.ts`) that modify data, use `revalidateTag('tagname')` or `revalidatePath('/path')` to invalidate the relevant caches.
            ```typescript
            // Example in _actions.ts
            'use server';
            import { revalidateTag } from 'next/cache';
            // ... other imports and action logic ...

            export async function updateJob(jobId: string, data: NewJob) {
              // ... update logic using _queries.ts ...
              revalidateTag(`job:${jobId}`);
              revalidateTag('jobs'); // Invalidate list views if needed
            }
            ```
    *   **Prioritize:** Apply caching first to read-heavy pages like job listings (`/jobs`), job details (`/jobs/[id]`), employer profiles, candidate profiles.

3.  **Target Static Rendering:**
    *   **Action:** Identify pages that *should* be fully static (no user-specific data, no dynamic functions needed for the initial render). Examples might include informational pages, potentially the homepage (`/`) if personalized elements are loaded client-side.
    *   **Verification:** After addressing dynamic functions and implementing caching, run `pnpm build` again. Aim to see `○` (Static) or `●` (ISR) instead of `ƒ` (Dynamic) for these routes in the build output.

**Phase 2: Reduce Client-Side JavaScript (Medium Impact)**

1.  **Audit `'use client'` Boundaries:**
    *   **Action:** Review all files containing the `'use client'` directive.
    *   **Principle:** Ensure the boundary is as "deep" in the component tree as possible. A large page component should ideally remain a Server Component, importing smaller Client Components (e.g., `<NewTransactionForm />` in `base-knowledge.md` example) only for interactive parts.
    *   **Refactor:** If a layout or large page is unnecessarily marked `'use client'`, refactor to extract the interactive pieces into dedicated Client Components within the feature slice's `_components/` folder.

2.  **Implement Dynamic Imports:**
    *   **Action:** Identify large components or libraries contributing significantly to the First Load JS, especially on pages with complex forms or interactions (e.g., `/employer/jobs/new`, `/employer/jobs/[id]/edit`, `/jobs/[id]/apply`).
    *   **Use `next/dynamic`:** Load these components dynamically with a loading fallback.
        ```typescript
        // Example in app/employer/jobs/new/page.tsx
        import dynamic from 'next/dynamic';
        import { Skeleton } from '@/components/ui/skeleton'; // Your loading component

        const NewJobForm = dynamic(() => import('./_components/NewJobForm'), {
          ssr: false, // Disable SSR if component relies heavily on browser APIs
          loading: () => <Skeleton className="h-[400px] w-full" />, // Or a more specific skeleton
        });

        export default async function NewJobPage() {
          // ... other server-side logic ...
          return (
            <div>
              <h1>Create New Job</h1>
              <NewJobForm /* props */ />
            </div>
          );
        }
        ```
    *   **Target:** Rich text editors, complex form libraries (if not already optimized), heavy charting libraries, components below the fold or triggered by user interaction.

3.  **Bundle Analysis:**
    *   **Action:** Install and run `@next/bundle-analyzer`.
        ```bash
        pnpm add -D @next/bundle-analyzer
        # Add to next.config.mjs or next.config.js
        # Run with: ANALYZE=true pnpm build
        ```
    *   **Analyze:** Visualize the bundle output. Identify large dependencies. Are there duplicates? Can heavy libraries be replaced with lighter alternatives (e.g., `date-fns` instead of Moment.js - already done ✅)?

**Phase 3: Optimize Navigation & Rendering (Medium Impact)**

1.  **Ensure `<Link>` Usage:**
    *   **Action:** Audit internal navigation elements. Ensure all standard `<a>` tags used for navigating within the app are replaced with `<Link href="...">` from `next/link`.
    *   **Benefit:** Enables client-side navigation and automatic prefetching of route bundles and data (when routes are cacheable/static).

2.  **Optimize Images & Fonts:**
    *   **Action:** Verify consistent use of `next/image` for all images, providing `width`, `height`, and `priority` props where appropriate (especially for LCP images). Ensure `next/font` is used for loading web fonts.
    *   **Benefit:** Improves LCP, reduces layout shifts (CLS), and optimizes asset loading.

3.  **Leverage Suspense for UI Streaming:**
    *   **Action:** Wrap slower data-fetching components or sections of the page in `<Suspense>` boundaries with appropriate fallback UIs (skeletons, spinners).
    *   **Benefit:** Allows the server to stream the initial HTML faster (like the layout and shell) while slower parts load in. Improves perceived performance and TTI (Time to Interactive). Combine this with the data caching in Phase 1.

**Phase 4: Database & Backend Optimization (Lower Priority unless identified as bottleneck)**

1.  **Review Database Indexes:**
    *   **Action:** Examine the existing indexes in `lib/db/schema.ts`. Analyze slow queries identified during development or via monitoring. Ensure common query patterns (filters, joins, sorts) in `_queries.ts` files are supported by appropriate indexes.
    *   **Benefit:** Speeds up database query execution time.

2.  **Optimize Queries:**
    *   **Action:** Review Drizzle queries in `_queries.ts`. Ensure you are only selecting the necessary columns (`select({ neededField: table.field })`) rather than entire tables (`select()`). Avoid N+1 query problems, especially within loops. Use Drizzle's `with` syntax efficiently for relations.
    *   **Benefit:** Reduces data transfer between the database and application, potentially speeding up serialization.

**Tooling & Measurement:**

*   **Local:** Chrome DevTools (Network Throttling, Performance Profiling).
*   **Build:** `@next/bundle-analyzer`.
*   **Production/Testing:** Lighthouse, WebPageTest, Vercel Analytics/Speed Insights (if applicable).
*   **Monitoring:** Implement logging and potentially application performance monitoring (APM) to track performance regressions and identify slow database queries or API calls in production.

**Process:**

1.  **Benchmark:** Establish current performance metrics using Lighthouse and WebPageTest.
2.  **Iterate:** Implement changes phase by phase, starting with Phase 1.
3.  **Measure:** After each significant change or phase, run `pnpm build` to check route types (`○`, `●`, `ƒ`) and re-benchmark using the tools above.
4.  **Monitor:** Continuously monitor performance in production.

This plan provides a structured approach to tackling the performance issues. Prioritizing caching and static rendering (Phase 1) will likely yield the most significant improvements initially.


