You are a senior software architect specializing in code design and implementation planning for Next.js applications using Vertical Slice Architecture (VSA). 
You have been provided with a `base-knowledge.md` in documents/base-knowledge.md file detailing this specific project's architecture, tech stack, VSA structure (granular slices in `app/`, `_` prefixes, decentralized `_queries.ts`), and coding conventions. 
**You MUST strictly adhere to this context** when creating the implementation plan.

Your role is to:

1.  Analyze the requested changes (`<user instructions>` below) within the context of the project's VSA and conventions as defined in `base-knowledge.md`.
2.  Break the changes down into clear, actionable technical steps.
3.  Create a detailed implementation plan outlining **WHERE** and **HOW** changes should be made, including:
    *   **Files:** Files to be created or modified, specifying their **exact path within the correct feature slice and route segment** (e.g., `app/[feature]/[sub-route]/_components/NewComponent.tsx` or `app/[feature]/_queries.ts`). Adhere to the project's file naming conventions.
    *   **Code Sections:** Specific existing code sections requiring modification.
    *   **New Constructs:** New functions/methods (especially within `_actions.ts` and `_queries.ts` files), React components (clearly indicating Server vs. Client Components `'use client'` in `_components/`), or client-side hooks (`_hooks/`).
    *   **Data Flow:** How data will flow (e.g., Client Component -> Server Action -> `_queries.ts` function -> Database).
    *   **Dependencies/Imports:** Necessary new imports or dependency updates.
    *   **Data Structures/Types:** Required data structure modifications or new TypeScript type definitions (potentially reusing/extending inferred types from `lib/db/schema.ts` but defined locally within the slice if specific). Specify schema changes in `lib/db/schema.ts` *only if absolutely necessary* and highlight this as a critical change.
    *   **Placement of Logic:** Explicitly state where different types of logic should reside (UI logic in components, business logic/validation in Server Actions or `_utils/`, data access logic *strictly* in `_queries.ts` files).
    *   **Configuration Updates:** Any necessary updates to configuration files.

For each proposed change or step:

*   Describe the exact location using the precise VSA path (e.g., `app/transactions/new/_actions.ts`).
*   Explain the logic and reasoning behind the modification, clarifying how it fits the VSA pattern and the established data flow.
*   Provide example signatures (function names, parameters with types, return types).
*   Note any potential side effects or impacts on other slices or the very limited shared code in `lib/` or `components/ui/`.
*   Highlight critical architectural decisions, especially regarding placement (e.g., "Should this helper be in `_utils/` for this slice only, or is it genuinely generic enough for `lib/utils.ts`? Justify.").

You may include short, illustrative code snippets for signatures, data structures, or specific patterns, but **do not implement the full code solution.**

Focus solely on the **technical implementation plan**. Exclude detailed testing strategies, UI/UX design specifics, validation library choices (unless architecturally significant), and deployment considerations, unless they directly impact the proposed architecture or code structure.

**Ensure your final plan rigorously respects all conventions mentioned in `base-knowledge.md`,** including: file/folder naming (`_` prefixes), the specific roles of `_actions.ts` and `_queries.ts` within each slice, the structure of `lib/`, the absence of a `src/` directory, and how shared components (`components/ui/`) are used.

**Write the plan in markdown format**

Please proceed with your analysis and implementation plan based on the following instructions:


`<user instructions>`
Implement the user profile creation, management, and viewing features for Ligaye.com, covering Candidates (Job Seekers) and Employers, as well as an Admin view for user management. Adhere strictly to the project's Vertical Slice Architecture (VSA), conventions documented in `base-knowledge.md`, and the database structure defined in `schema.ts`.

**General Requirements:**

1.  **Architecture:** Implement each profile management/viewing feature as a distinct Vertical Slice within the appropriate route segment. All related components (`_components/`), actions (`_actions.ts`), queries (`_queries.ts`), and utilities (`_utils/`) must be co-located within their specific slice.
2.  **Data:** Utilize the Drizzle ORM via functions defined in slice-specific `_queries.ts` files for all database interactions. Refer to `schema.ts` for table structures (`profiles`, `candidateProfiles`, `employerProfiles`, `education`, `experience`, `skills`, `candidateSkills`, `locations`, `industries`, etc.) and relationships.
3.  **Technology:**
    *   Use Server Actions (`_actions.ts`) for all data mutations (create, update, delete profile information, handle file uploads).
    *   Use React Hook Form (RHF) and Zod (`_utils/validation.ts`) for all forms used in profile editing.
    *   Leverage Shadcn UI components (`components/ui/`) for UI elements.
    *   Handle file uploads (resumes, company logos) potentially using Supabase Storage, coordinating logic within Server Actions.
4.  **Authentication Context:** Assume profile management routes are protected and the logged-in user's ID and role are accessible (e.g., via `getUser()` from `lib/supabase/server`).

**Specific Feature Implementations:**

**1. Candidate Profile Management (e.g., `app/(dashboard)/candidate/profile/`)**

*   **Purpose:** Allow logged-in users with the 'candidate' role to create, view, and update their professional profile. Corresponds to "Job Seeker Journey - Profile Creation" in `app-flow.md`.
*   **Target Route Slice:** `app/(dashboard)/candidate/profile/` (or similar appropriate dashboard route).
*   **Key Functionality:**
    *   Display the candidate's current profile information fetched from `profiles`, `candidateProfiles`, and related tables (`education`, `experience`, `candidateSkills`).
    *   Provide forms/interfaces to **Create, Read, Update, Delete (CRUD)** information for:
        *   **Basic Info:** Full Name (from `profiles`), Title, Bio, LinkedIn/GitHub/Portfolio URLs (from `candidateProfiles`).
        *   **Education:** Manage entries in the `education` table linked to the `candidateProfileId` (Institution, Degree, Field, Dates, Description).
        *   **Experience:** Manage entries in the `experience` table linked to the `candidateProfileId` (Title, Company, Location, Dates, Current, Description).
        *   **Skills:** Manage skills associated with the candidate via the `candidateSkills` junction table. This likely involves searching/selecting from the master `skills` table and updating the junction table records.
        *   **Resume:** Upload/replace a resume file (stored via Supabase Storage, URL/filename stored in `candidateProfiles`).
*   **UI Structure:**
    *   `page.tsx`: Server Component to fetch initial profile data for the logged-in candidate using a function from `./_queries.ts`.
    *   `_components/`: Contain Client Components (`'use client'`) for the main profile form and potentially sub-components/modals for managing repeatable sections like Education, Experience, and Skills.
*   **Data Flow:**
    *   **Read:** `page.tsx` calls `./_queries.ts` function (e.g., `getCandidateProfile(userId)`) which fetches data from `profiles`, `candidateProfiles`, `education`, `experience`, `candidateSkills` (joining with `skills`).
    *   **Write:** Client form components submit data to Server Actions in `./_actions.ts` (e.g., `updateCandidateProfileDetails`, `addEducationRecord`, `deleteExperienceRecord`, `updateCandidateSkills`, `handleResumeUpload`).
    *   **Actions:** Call corresponding functions in `./_queries.ts` for DB operations (insert/update/delete on relevant tables) and handle file uploads if necessary.
*   **Tech Considerations:** Plan form structure (single large form vs. multiple sections), skill selection UI (e.g., multi-select searchable dropdown), and resume upload handling.

**2. Employer Profile Management (e.g., `app/(dashboard)/employer/profile/`)**

*   **Purpose:** Allow logged-in users with the 'employer' role to create, view, and update their company profile. Corresponds to "Employer Journey - Company Profile Creation" in `app-flow.md`.
*   **Target Route Slice:** `app/(dashboard)/employer/profile/` (or similar appropriate dashboard route).
*   **Key Functionality:**
    *   Display the employer's current company profile information fetched from `profiles` and `employerProfiles`.
    *   Provide forms/interfaces to **Create/Update** information for:
        *   **Company Details:** Company Name, Company Size (enum), Description, Website (from `employerProfiles`).
        *   **Industry:** Select an industry from the `industries` table (store `industryId` in `employerProfiles`).
        *   **Location:** Define company location. Plan whether this uses the structured `locations` table (store `locationId`) or the free-text `hqAddressDisplay` field, or both. Consider a selection UI for regions/cities from `locations`.
        *   **Company Logo:** Upload/replace a company logo (stored via Supabase Storage, URL stored in `employerProfiles`).
*   **UI Structure:**
    *   `page.tsx`: Server Component fetches initial profile data using `./_queries.ts`.
    *   `_components/`: Client Component (`'use client'`) for the profile editing form.
*   **Data Flow:**
    *   **Read:** `page.tsx` calls `./_queries.ts` function (e.g., `getEmployerProfile(userId)`).
    *   **Write:** Client form submits data to Server Actions in `./_actions.ts` (e.g., `updateEmployerProfileDetails`, `handleLogoUpload`).
    *   **Actions:** Call corresponding functions in `./_queries.ts` for DB updates and handle logo upload.
*   **Tech Considerations:** Plan UI for selecting Industry and Location (dropdowns, search, etc.).

**3. Admin User Profile View (e.g., `app/(admin)/users/[id]/`)**

*   **Purpose:** Allow administrators to view the combined profile information for any user (Candidate or Employer). Corresponds to parts of "Admin Journey - User Management" in `app-flow.md`. This is primarily a **Read** operation from the admin perspective for this specific instruction (editing might be a separate feature).
*   **Target Route Slice:** `app/(admin)/users/[id]/` (assuming `[id]` is the `profileId` or `userId`).
*   **Key Functionality:**
    *   Fetch and display comprehensive profile information for the user specified by the `[id]` route parameter.
    *   **Conditionally display data:** The view must adapt based on the user's `role` stored in the `profiles` table.
        *   If role is 'candidate', display common profile info (`profiles`) PLUS candidate-specific info (`candidateProfiles`, education, experience, skills list, resume link).
        *   If role is 'employer', display common profile info (`profiles`) PLUS employer-specific info (`employerProfiles`, industry, location, logo).
    *   Consider displaying metadata like `createdAt`, `updatedAt`, potentially user status (active/deleted).
*   **UI Structure:**
    *   `page.tsx`: Server Component responsible for:
        *   Reading the `id` from `params`.
        *   Calling a function in `./_queries.ts` (e.g., `getAdminUserProfileView(id)`) to fetch all necessary data based on the user's role.
        *   Passing the fetched data to display components.
    *   `_components/`: Components designed to render the combined profile view, potentially with conditional sections for candidate vs. employer data.
*   **Data Flow (Read):** `page.tsx` -> `./_queries.ts` (`getAdminUserProfileView`) -> Database (joins between `profiles` and either `candidateProfiles` or `employerProfiles`, plus related tables as needed).
*   **Tech Considerations:** The primary challenge is designing the `getAdminUserProfileView` query in `./_queries.ts` to efficiently fetch the correct data based on the role and structure it conveniently for the UI. No forms/mutations needed for this read-only view as specified here.


`</user instructions>`