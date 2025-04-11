# Job search with filters feature

### Story: Create jobs listing page (/jobs)
### Story: Create job details page
### Story: Create search bar UI on jobs page
### Story: Create job list component
### Story: Create backend (sever actions and db queries)
### Story: Integrate search bar with backend and display results

## App flow
**Job Search and Application**
- From the dashboard, uses the search bar (keywords, location, job type) to find jobs.
- Views search results listing available jobs.
- Selects a job to see details and clicks "Apply" to submit an application.
- Receives a confirmation notification.


## Statement Management API (`nuqs`)
- We'll be using nuqs for the URL state management in this feature for filtering the jobs listing page. 
- the package has already been installed and configured properly.
- you can read about how to implement it in `documents/nuqs-docs.md`.


## Implementation details
- use `style-guide.md` to build the UI accordingly and give that glassmorphic look and feel
- make it responsive on mobile. Strong emphasis on making all components responsive on mobile (most users use the site on smartphones)
- use shadows to elevate the job cards and other components according to our style guide


## GEMINI 2.5 REFINED PROMPT
Okay, I understand. I will refine the provided user stories, app flow description, and implementation details for the Job Listing, Search, Filtering, and Detail features into a set of instructions suitable for the Feature Planner AI, following the established project context (`base-knowledge.md`, `schema.ts`) and my role.

Here are the refined instructions:

---

**Refined Instructions for Feature Planner (`<user instructions>` section):**

Implement the core job discovery features for Ligaye.com, including listing jobs, providing search and filtering capabilities, and displaying detailed job information. Ensure the implementation strictly follows the project's VSA, conventions (`base-knowledge.md`), database schema (`schema.ts`), and specific technical requirements outlined below.

**General Requirements:**

1.  **Architecture:** Implement using the granular Vertical Slice Architecture (VSA). Code related to the job listing/filtering will reside primarily in `app/jobs/`, while code for the job detail view will be in `app/jobs/[id]/` (using `id` from the `jobs` table for the route parameter is preferred). Ensure co-location of components (`_components/`), queries (`_queries.ts`), hooks (`_hooks/`), etc., within their respective slices.
2.  **Data:** Use Drizzle ORM via functions in slice-specific `_queries.ts` for all data fetching from the `jobs` table and related tables (`employerProfiles`, `locations`, `skills` via `jobSkills`, etc.). Queries should only return non-deleted (`deleted=false` or appropriate `status`) and active/published (`status='ACTIVE'`, `expiresAt` > now) jobs unless specifically for admin views (which is not part of this feature).
3.  **Technology:**
    *   **URL State Management:** Utilize `nuqs` for managing search and filter parameters in the URL on the job listing page (`app/jobs/`). The relevant client-side component(s) will use `nuqs` hooks (likely defined in `app/jobs/_hooks/`) to read/write filter state to the URL. 
    *   **UI:** Implement UI elements using Shadcn UI components (`components/ui/`). Adhere strictly to the visual guidelines specified in `style-guide.md` (glassmorphism, shadows, elevation).
    *   **Responsiveness:** All components, especially the job list, job cards, filters, and detail page layout, **must** be fully responsive and optimized for mobile devices.
    *   Server Actions (`_actions.ts`) are likely *not* the primary mechanism here, as this is mainly data fetching, but could be used if any interactive elements require server mutations (e.g., a "quick apply" directly from the list - though the main flow goes to the detail page).

4. **Statement Management API (`nuqs`)**
- We'll be using nuqs for the URL state management in this feature for filtering the jobs listing page. 
- the package has already been installed and configured properly.
- you can read about how to implement it in `documents/nuqs-docs.md`.

**Specific Feature Implementations:**

**1. Job Listing & Filtering Page (`app/jobs/`)**

*   **Purpose:** Display a list of available job postings with robust search and filtering capabilities. Corresponds to "Job Search and Application" flow start in `app-flow.md`.
*   **Target Route Slice:** `app/jobs/`
*   **Key Functionality:**
    *   **Fetch Jobs:** Retrieve a paginated list of active/published jobs based on current filter criteria.
    *   **Search Bar:** Allow users to search by keywords (matching against `jobs.title`, `jobs.description`, potentially `skills.name`, `employerProfiles.companyName`).
    *   **Filters:** Provide UI controls (dropdowns, checkboxes, sliders, etc.) to filter jobs by:
        *   Location (using data from `locations` table, potentially region, district, city).
        *   Job Type (using `jobTypeEnum`).
        *   Work Location (using `workLocationEnum`).
        *   Experience Level (using `experienceLevelEnum`).
        *   Salary Range (min/max).
        *   Industry (using data from `industries` via `jobIndustries`).
        *   Other relevant fields from `jobs` schema as deemed necessary (e.g., `schedule`).
    *   **URL State:** Use `nuqs` to reflect the current keyword search and selected filters in the URL query parameters. Changes in the UI controls should update the URL, and the page should read the URL on load to set the initial filter state and trigger data fetching.
    *   **Display Results:** Render the filtered and paginated job results using a reusable job card component. Include pagination controls.
*   **UI Structure:**
    *   `page.tsx`: Likely needs to be a Client Component (`'use client'`) or contain one to manage interaction with `nuqs` and the filter UI state. It orchestrates fetching data based on the URL state.
    *   `_components/`:
        *   `JobFilters.tsx` (`'use client'`): Contains the search bar and all filter controls. Uses `nuqs` hooks (from `_hooks/`) to manage state.
        *   `JobList.tsx`: Renders the list of job cards based on data passed from `page.tsx`. Might handle pagination display.
        *   `JobCard.tsx`: Displays summary information for a single job (title, company, location, salary snippet, date posted). Should link to the corresponding job detail page (`/jobs/[id]`). This component *might* be reusable on the detail page or other areas, consider if it belongs here or potentially slightly higher up if truly generic *within the job context*. For now, place in `app/jobs/_components/`.
    *   `_hooks/`:
        *   `useJobFilters.ts` (`'use client'`): Custom hook encapsulating `nuqs` logic for parsing and updating job filter parameters in the URL.
    *   `_utils/`: May contain validation schemas (`validation.ts`) for filter inputs if needed.
*   **Data Flow:**
    *   **Client (`JobFilters.tsx`, `page.tsx`, `useJobFilters.ts`):** User interacts with filters -> `nuqs` hook updates URL -> `page.tsx` detects URL change -> Triggers data re-fetch, passing current filters.
    *   **Server (`page.tsx` on re-render/navigation, called from client fetch):** Receives filter parameters (parsed from URL state) -> Calls function in `./_queries.ts` (e.g., `getFilteredJobs(filters, pagination)`).
    *   **Query (`_queries.ts` -> `getFilteredJobs`):** Constructs a Drizzle query based on the provided filters (keywords, locationId, jobType, etc.) and pagination settings. Fetches relevant data, joining necessary tables (`employerProfiles`, `locations`, etc.). Returns paginated job list.

**2. Job Detail Page (`app/jobs/[id]/`)**

*   **Purpose:** Display comprehensive information about a single job posting. Allow users to initiate the application process (details of the application submission itself are a separate feature).
*   **Target Route Slice:** `app/jobs/[id]/`
*   **Key Functionality:**
    *   Fetch detailed information for the job identified by the `id` parameter.
    *   Display all relevant job details from the `jobs` table and related tables (company info, full description, requirements, salary, benefits, location details, skills list, application instructions, etc.).
    *   Include a prominent "Apply" button/mechanism (which might link externally, open an email, or trigger an on-platform application flow later).
    *   Potentially display related jobs or company information.
*   **UI Structure:**
    *   `page.tsx`: Server Component. Reads the `id` from `params`. Calls a function in `./_queries.ts` to fetch the job details. Passes data to display components. Handle "Not Found" cases if the id is invalid or the job is not active/published.
    *   `_components/`: Components specific to rendering sections of the job detail page (e.g., `JobHeader.tsx`, `JobDescriptionSection.tsx`, `CompanyInfoSidebar.tsx`, `SkillsList.tsx`).
*   **Data Flow (Read):** `page.tsx` reads `id` -> Calls function in `./_queries.ts` (e.g., `getJobDetailsByid(id)`) -> Query fetches data for the specific job, joining related tables -> Data passed to UI components.
*   **Data Query (`_queries.ts` -> `getJobDetailsByid`):** Fetches a single job record matching the `id` where `status='ACTIVE'` and `expiresAt` is valid. Includes detailed information by joining `employerProfiles`, `locations`, `jobSkills` -> `skills`, etc.

**3. UI/Styling Constraints:**

*   Implement all UI according to `style-guide.md`, focusing on the specified glassmorphic look, shadows for elevation (especially on `JobCard.tsx`), and overall feel.
*   Ensure layout and components are fully responsive and provide an excellent experience on mobile devices. Test thoroughly on various screen sizes.

---