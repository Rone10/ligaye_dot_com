## Feature: Job Posting
### Story: Create backend (server actions, queries, etc) for job posting
### Story: Create job posting form UI
### Story: Integrate job posting form with API
### Story: Create Employer dashboard section sidebar with navigation


# App flow
**Post a Job**
- From the dashboard, clicks "Post a Job."
- Fills in job details (title, description, requirements, location, etc) and selects job duration (e.g., 1 month).
**Chooses payment method:**
- Stripe: Redirects to payment gateway; job is posted immediately upon successful payment.
- Cash: Job posting is saved as pending, awaiting admin approval after payment confirmation.
- Receives a notification of job posting status.
**Manage Applicants**
- From the dashboard, views "My Job Postings."
- Selects a job to see a list of applicants, their profiles, and application details.
- Updates application status (e.g., reviewed, shortlisted).


## Third Party Pachages
**Syncfusion Rich Text Editor**: we will be using this rich text editor for posting jobs.
- the package has already been installed and setup accurately
- the editor component can be imported from here: `import { Editor } from '@/components/RichTextEditor/editor';`
- example usage:
```typescript
'use client'

import { Editor } from '@/components/RichTextEditor/editor';
import { useState } from 'react';
import { Button } from '@/components/ui/button';


export default function MyPageComponent() {
  const [editorContent, setEditorContent] = useState<string>('<p>Initial content</p>');

  const handleEditorChange = (content: string) => {
    setEditorContent(content);
    // You can add logic here to save the content, update a preview, etc.
    console.log("Editor content changed:", content);
  };

  const handleSave = () => {
     // Logic to save editorContent to your database
     console.log("Saving content:", editorContent);
  }

  return (
    <div className='container mx-auto max-w-screen-lg mt-10'>
      <h1>My Page</h1>
      <Editor value={editorContent} onChange={handleEditorChange} />
      {/* Example: Display a preview */}
      {/* <div dangerouslySetInnerHTML={{ __html: editorContent }} /> */}
      <Button onClick={handleSave} className='mt-4'>Save Content</Button>
    </div>
  );
}
```

## Implementation Notes

- use `style-guide.md` to build the UI accordingly
- read the schema file to fully understand the relevant tables and their respective fields
- create a sidebar for the employer section of (dashboard)
    - sidebar should have navigation elements to the relevant pages and sections
    - sidebar should be on the left and collapsible on small screens with hamburger icon to open it
    - follow our style guide to build our the sidebar accordingly
    - implement the sidebar in layout file of the employer section to serve all employer pages




# GEMINI 2.5 REFINED PROMPT:

Okay, I have reviewed the requirements for the Job Posting feature, including the user stories, app flow, specific third-party package usage (Syncfusion Rich Text Editor), and implementation notes. I will now generate the refined instructions based on this information and the established project context (`base-knowledge.md`, `schema.ts`).

These instructions are formatted for the `<user instructions>` section of the `feature-planner.md` prompt for the Feature Planner AI.

---

**Refined Instructions for Feature Planner (`<user instructions>` section):**

Implement the Job Posting feature for employers on the Ligaye.com platform. This includes creating a job posting form, handling the submission process with payment options (Stripe/Cash), and providing a basic view for employers to see their own postings. Additionally, implement the main sidebar navigation for the employer dashboard section. Adhere strictly to the project's VSA, conventions (`base-knowledge.md`), schema (`schema.ts`), style guide (`style-guide.md`), and specific technical requirements below.

**General Requirements:**

1.  **Architecture:** Implement using the granular Vertical Slice Architecture (VSA).
    *   The Employer Dashboard Sidebar logic belongs in `app/(dashboard)/employer/layout.tsx`.
    *   The Job Posting Form resides in its own slice: `app/(dashboard)/employer/jobs/new/`.
    *   The list of employer's job postings resides in its slice: `app/(dashboard)/employer/jobs/`.
    *   Ensure co-location of components (`_components/`), actions (`_actions.ts`), queries (`_queries.ts`), validation (`_utils/validation.ts`), and hooks (`_hooks/`) within their respective feature slices.
2.  **Data:** Use Drizzle ORM via functions in slice-specific `_queries.ts` files for all interactions with `jobs`, `payments`, `jobSkills`, `jobIndustries`, `locations`, `skills`, `industries`, etc. Refer to `schema.ts` for table structures and relationships.
3.  **Technology:**
    *   **Forms:** Use React Hook Form (RHF) and Zod (`_utils/validation.ts`) for the job posting form.
    *   **Rich Text Editor:** Use the pre-configured Syncfusion Rich Text Editor component imported from `@/components/RichTextEditor/editor` for the job `description` field, following the example usage provided.
    *   **Mutations:** Use Server Actions (`_actions.ts`) for handling form submissions, creating job records, initiating payment flows, and potentially updating job statuses post-payment.
    *   **UI:** Implement UI using Shadcn UI components (`components/ui/`). Strictly adhere to `style-guide.md` for appearance, including glassmorphism and shadows where appropriate.
    *   **Responsiveness:** Ensure the sidebar, forms, and job lists are fully responsive and optimized for mobile devices.

**Specific Feature Implementations:**

**1. Employer Dashboard Sidebar (`app/(dashboard)/employer/layout.tsx`)**

*   **Purpose:** Provide consistent navigation for the employer section of the dashboard.
*   **Target File:** `app/(dashboard)/employer/layout.tsx`
*   **Key Functionality:**
    *   Implement a persistent sidebar navigation component on the left side of the employer dashboard pages.
    *   Include navigation links to key employer sections (e.g., "Dashboard Overview", "Post a Job" -> `/employer/jobs/new`, "My Job Postings" -> `/employer/jobs`, "Company Profile" -> `/employer/profile`, "Applicants" - link might point to `/employer/jobs` initially).
    *   The sidebar must be collapsible on small screens, with a standard hamburger menu icon to toggle visibility.
    *   Style the sidebar according to `style-guide.md`.
*   **Implementation:** Define the sidebar structure and navigation items within the `layout.tsx` file. Use state management within the layout (or a dedicated client component imported into the layout) to handle the collapsible state.

**2. Job Posting Form (`app/(dashboard)/employer/jobs/new/`)**

*   **Purpose:** Allow logged-in employers to create and submit new job postings.
*   **Target Route Slice:** `app/(dashboard)/employer/jobs/new/`
*   **Key Functionality:**
    *   **Form Fields:** Create a comprehensive form using RHF/Zod that captures all necessary job details based on the `jobs` table schema in `schema.ts`. This includes:
        *   `title`, `description` (using Syncfusion Editor), `jobLanguage`, `numberOfOpenings`, `displayAddress`.
        *   `locationId` (UI to select from `locations` table), `workLocation` (enum).
        *   `educationRequirements` (text array?), `experienceRequirements` (text array?), `experienceLevel` (enum).
        *   `languageRequirements` (text array?), `languageTrainingProvided` (boolean).
        *   `jobType` (enum), `schedule` (enum array?), `expectedHours`, `hoursType`.
        *   `contractLength`, `contractPeriod` (conditional based on `jobType`).
        *   `plannedStartDate`.
        *   Salary fields (`salaryRangeMin`, `salaryRangeMax`, `salaryCurrency`, `salaryFrequency`, `salaryDisplayType`).
        *   `supplementalPay` (text array?), `benefits` (text array?).
        *   Skills (UI to select multiple skills from `skills` table - to be saved in `jobSkills`).
        *   Industries (UI to select multiple industries from `industries` table - to be saved in `jobIndustries`).
        *   Application settings (`applicationMethod`, `applicationInstructions`, `applicationUrl`, `applicationEmail`, `resumeRequired`, `allowCandidateContact`, `applicationDeadline`).
        *   **Job Duration/Expiry:** Include a field to select the desired job posting duration (e.g., 1 month, 2 months). This will be used later (likely in the Server Action/payment logic) to calculate the `expiresAt` timestamp.
        *   **Payment Method Selection:** Radio buttons or similar to choose 'Stripe' or 'Cash'.
    *   **Validation:** Define a comprehensive Zod schema in `_utils/validation.ts` covering all required fields and formats.
*   **UI Structure:**
    *   `page.tsx`: Can be a Server Component rendering the main form component.
    *   `_components/NewJobForm.tsx` (`'use client'`): The main form component using RHF, Zod resolver, Shadcn UI components, and the Syncfusion Editor. Handles form state and submission triggering. May include sub-components for complex sections like skill/industry/location selection.
*   **Data Flow (Write):** `NewJobForm.tsx` submits validated data -> Calls Server Action `createJobPosting` in `./_actions.ts`.
*   **Server Action (`_actions.ts` -> `createJobPosting`):**
    *   Receives validated form data, selected job duration, and chosen payment method.
    *   Retrieves the logged-in employer's `profileId` and `employerProfileId` (likely via `getUser()` and a quick query).
    *   Calculates `expiresAt` based on the selected duration.
    *   Determines the initial `jobs.status`:
        *   If 'Cash' selected: `status = 'PENDING_PAYMENT'`.
        *   If 'Stripe' selected: `status = 'DRAFT'` (or 'PENDING_PAYMENT' until Stripe confirms).
    *   Calls a function in `./_queries.ts` (e.g., `insertNewJob`) to insert the main job record into the `jobs` table and associated records into `jobSkills` and `jobIndustries`. This query function should handle the creation of related records within a transaction if possible using Drizzle's transaction API.
    *   **Payment Handling:**
        *   **Cash:** After successful insertion with `PENDING_PAYMENT` status, potentially create a record in the `payments` table with `status='pending'`, `method='cash'`. Redirect user to a confirmation page ("Job submitted, pending payment confirmation").
        *   **Stripe:** After successful insertion (maybe still as `DRAFT` or `PENDING_PAYMENT`), initiate the Stripe payment flow (e.g., create a Checkout session associated with the new `jobId` and payment amount based on duration). This might involve calling a separate Stripe-specific service/action. Redirect the user to the Stripe Checkout URL. A separate mechanism (webhook handler - outside the scope of *this* instruction set but needs consideration) will be required to listen for successful Stripe payments and update the corresponding `jobs.status` to `'ACTIVE'` and potentially create the `payments` record.
    *   Returns success/error state or performs redirect.
*   **Data Query (`_queries.ts` -> `insertNewJob`):** Handles inserting data into `jobs`, `jobSkills`, `jobIndustries`. Should accept all necessary data from the action. Use transactions for atomicity.

**3. My Job Postings View (`app/(dashboard)/employer/jobs/`)**

*   **Purpose:** Allow employers to view a list of the jobs they have posted.
*   **Target Route Slice:** `app/(dashboard)/employer/jobs/`
*   **Key Functionality:**
    *   Fetch and display a list of jobs associated with the logged-in employer's `companyId` (`employerProfiles.id`).
    *   Display key information for each job (Title, Status, Date Posted, Expires At, Number of Applicants - count may be a separate feature).
    *   Provide links/buttons for actions like: View Details/Applicants (likely links to `/jobs/[slug]` initially or a dedicated applicant view page later), Edit (links to `/employer/jobs/[id]/edit/` - edit feature is separate), potentially Renew/Delete.
*   **UI Structure:**
    *   `page.tsx`: Server Component. Fetches the employer's jobs using a function from `./_queries.ts`. Passes data to a list/table component.
    *   `_components/EmployerJobList.tsx` (or DataTable): Renders the jobs in a table or list format using Shadcn components.
*   **Data Flow (Read):** `page.tsx` calls `./_queries.ts` function (e.g., `getEmployerJobs(employerProfileId)`) -> Query fetches jobs linked to the employer -> Data rendered by UI component.

---