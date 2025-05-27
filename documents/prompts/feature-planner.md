You are a senior software architect specializing in code design and implementation planning for Next.js applications using Vertical Slice Architecture (VSA). 
You have been provided with a `base-knowledge.md` in documents/base-knowledge.md file detailing this specific project's architecture, tech stack, VSA structure (granular slices in `app/`, `_` prefixes, decentralized `_queries.ts`), and coding conventions. 
**You MUST strictly adhere to this context** when creating the implementation plan.

Your role is to:

1.  Analyze the requested changes (`<user_instructions>` below) within the context of the project's VSA and conventions as defined in `base-knowledge.md`.
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


<user_instructions>

Implement a comprehensive Tenders feature for Ligaye.com, allowing authenticated users to create, read, update, and delete (soft delete) tender listings. This feature must strictly adhere to the project's Vertical Slice Architecture (VSA), conventions outlined in `base-knowledge.md`, the existing database schema (`schema.ts`), and UI guidelines from `style-guide.md`.

**General Requirements:**

1.  **Architecture & VSA:**
    *   Organize the feature within the `app/(public)/tenders/` directory using granular VSA.
    *   List View: `app/(public)/tenders/page.tsx`
    *   Create View: `app/(public)/tenders/new/page.tsx`
    *   Detail View: `app/(public)/tenders/[id]/page.tsx` (`[id]` is the tender UUID)
    *   Edit View: `app/(public)/tenders/[id]/edit/page.tsx`
    *   Each route segment must contain its own `_components/`, `_actions.ts`, `_queries.ts`, `_utils/` (e.g., for validation), and `_hooks/` as needed, following project conventions.

2.  **Authentication & Authorization:**
    *   All tender-related routes and actions must be protected, requiring user authentication.
    *   The `userId` from the logged-in user's profile (`profiles.id`) must be associated with created tenders.
    *   Update and Delete operations must be authorized: only the user who created the tender (matching `tenders.userId`) or an admin (if admin roles are implemented for this) can perform these actions. This check should happen within the Server Actions.
    *   Tenders can be viewed by everyone (authenticated or not)

3.  **Data Management (Drizzle ORM & `_queries.ts`):**
    *   All database interactions must use Drizzle ORM, invoked via functions defined in slice-specific `_queries.ts` files.
    *   Reference the `tenders` table schema provided in `lib/db/schema.ts`.
    *   Soft Deletes: Deleting a tender should set its `deleted` flag to `true`, not remove the record.

4.  **Technology & UI:**
    *   **Forms:** Use React Hook Form (RHF) with Zod for validation in slice-specific `_utils/validation.ts` files.
    *   **UI Components:** Leverage Shadcn UI components from `components/ui/` for forms, tables, dialogs, buttons, etc. Adhere to `style-guide.md`.
    *   **Server Actions:** Use Next.js Server Actions (in slice-specific `_actions.ts`) for all CUD operations.
    *   **Date Handling:** Use `date-fns` for date formatting if needed; date inputs should be user-friendly (e.g., Shadcn Date Picker).
    *   **Icons:** Use Lucide React icons.
    *   **Feedback:** Provide clear user feedback for all operations (e.g., toast notifications for success/error, loading states).

**Specific Feature Implementations:**

**1. List Tenders (`app/(public)/tenders/`)**

*   **Purpose:** Display a paginated and filterable list of active (not soft-deleted) tenders.
*   **Route Slice:** `app/(public)/tenders/`
*   **Key Components & Files:**
    *   `page.tsx`: Server Component. Fetches initial tenders list using `./_queries.ts`.
        *   Should include a "Create New Tender" button linking to `/tenders/new`.
    *   `_components/TendersDataTable.tsx` (`'use client'`): Displays tenders in a table (using Shadcn Table).
        *   Columns: Title, Organization, Sector, Location, Deadline, Status.
        *   Actions per row: "View" (links to `app/(public)/tenders/[id]/`), "Edit" (links to `app/(public)/tenders/[id]/edit/`, conditional on ownership), "Delete" (triggers delete action, conditional on ownership).
    *   `_components/TenderFilters.tsx` (`'use client'`): (Optional, if complex filtering is needed) Component for filtering by sector, location, status, etc. Uses `nuqs` for URL state.
    *   `_queries.ts`:
        *   `getTenders(params: { page?: number, limit?: number, filters?: TenderFiltersType }): Promise<Tender[]>`: Fetches a list of non-deleted tenders with pagination and filtering.
        *   `getTendersCount(params: { filters?: TenderFiltersType }): Promise<number>`: For pagination.
        *   `getSectorsForFilter(): Promise<Sector[]>`: Fetches sectors for filter dropdown.
        *   `getLocationsForFilter(): Promise<Location[]>`: Fetches locations for filter dropdown.
    *   `_actions.ts`:
        *   `deleteTenderAction(tenderId: string): Promise<{ success: boolean, error?: string }>`: Handles soft-deletion. Triggered from `TendersDataTable.tsx`. Requires confirmation dialog.

**2. Create Tender (`app/(public)/tenders/new/`)**

*   **Purpose:** Provide a form for authenticated users to create a new tender.
*   **Route Slice:** `app/(public)/tenders/new/`
*   **Key Components & Files:**
    *   `page.tsx`: Server Component. Fetches necessary data for dropdowns (sectors, locations) using `./_queries.ts` and passes it to the form component.
    *   `_components/NewTenderForm.tsx` (`'use client'`):
        *   RHF form with fields corresponding to `tenders` table: `title`, `description` (use `@/components/RichTextEditor/editor`), `organizationName`, `tenderType` (Shadcn Select using `tenderTypeEnum` from schema), `sectorId` (Shadcn Select), `locationId` (Shadcn Select), `deadline` (Shadcn Date Picker), `budgetRange`, `contactInformation` (Shadcn Textarea), `externalLink`, `status` (Shadcn Select, default to 'DRAFT' or 'OPEN').
        *   Handles form submission by calling `createTenderAction`.
        *   Displays validation errors.
    *   `_utils/validation.ts`: Zod schema for new tender validation.
    *   `_actions.ts`:
        *   `createTenderAction(formData: NewTenderSchemaType): Promise<{ success: boolean, tenderId?: string, error?: string }>`: Validates data, gets `userId`, calls `insertTender` from `./_queries.ts`. Redirects to the new tender's detail page (`/tenders/[tenderId]`) or list page on success.
    *   `_queries.ts`:
        *   `insertTender(data: NewTenderDataType, userId: string): Promise<Tender>`: Inserts a new tender into the database.
        *   `getSectors(): Promise<Sector[]>`: Fetches all active sectors for the dropdown.
        *   `getLocations(): Promise<Location[]>`: Fetches all active locations for the dropdown.

**3. View Tender Details (`app/(public)/tenders/[id]/`)**

*   **Purpose:** Display detailed information for a specific tender.
*   **Route Slice:** `app/(public)/tenders/[id]/`
*   **Key Components & Files:**
    *   `page.tsx`: Server Component. Reads `id` from `params`. Fetches tender details using `./_queries.ts`.
        *   Displays all relevant tender fields.
        *   Includes "Edit Tender" and "Delete Tender" buttons, visible only to the tender owner (or admin).
    *   `_components/TenderDetailDisplay.tsx`: Component to render the tender details.
    *   `_components/DeleteTenderDialog.tsx` (`'use client'`): A confirmation dialog for the delete action.
    *   `_queries.ts`:
        *   `getTenderById(id: string): Promise<Tender | null>`: Fetches a single non-deleted tender by its ID, potentially joining with `sectors` and `locations` for display names.
    *   `_actions.ts`:
        *   `deleteTenderAction(tenderId: string): Promise<{ success: boolean, error?: string }>`: (Can be shared with list view if structured appropriately, or duplicated for slice isolation). Handles soft-deletion. Triggered from this page.

**4. Edit Tender (`app/(public)/tenders/[id]/edit/`)**

*   **Purpose:** Provide a form for the tender owner to update an existing tender.
*   **Route Slice:** `app/(public)/tenders/[id]/edit/`
*   **Key Components & Files:**
    *   `page.tsx`: Server Component. Reads `id` from `params`. Fetches tender data and data for dropdowns (sectors, locations) using `./_queries.ts`. Passes data to the form.
        *   Handles cases where the tender is not found or the user is not authorized.
    *   `_components/EditTenderForm.tsx` (`'use client'`):
        *   Similar to `NewTenderForm.tsx` but pre-filled with existing tender data.
        *   Handles form submission by calling `updateTenderAction`.
    *   `_utils/validation.ts`: Zod schema for updating a tender (can be similar to or inherit from the create schema).
    *   `_actions.ts`:
        *   `updateTenderAction(tenderId: string, formData: UpdateTenderSchemaType): Promise<{ success: boolean, error?: string }>`: Validates data, verifies ownership (fetches `userId` of current user and compares with `tender.userId`), calls `updateTender` from `./_queries.ts`. Redirects to the tender's detail page on success.
    *   `_queries.ts`:
        *   `getTenderByIdForEdit(id: string): Promise<Tender | null>`: Fetches tender data for form pre-filling.
        *   `updateTender(id: string, data: UpdateTenderDataType, userId: string): Promise<Tender | null>`: Updates an existing tender in the database. Ensure `updatedAt` is set. The `userId` parameter is for an authorization check if needed at the query level, though primary auth is in the action.
        *   `getSectors(): Promise<Sector[]>`: Fetches all active sectors.
        *   `getLocations(): Promise<Location[]>`: Fetches all active locations.

**5. Data Structures & Types (within respective slices):**

*   Define Zod schemas for form validation in `_utils/validation.ts` for `new` and `edit` slices.
*   Use inferred types from `lib/db/schema.ts` (e.g., `Tender`, `NewTender`) where possible. Create local specific types if needed (e.g., form data types before they match `NewTender`).
*   Types for filter parameters in `app/(public)/tenders/_queries.ts` or a local `_types.ts`.

Ensure all UI elements are responsive and provide appropriate loading states (e.g., using Next.js `loading.tsx` per segment, or client-side loading indicators within components for actions).

</userinstructions>