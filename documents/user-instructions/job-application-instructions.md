## Feature: Job Application Process
### Story: Click on job post to apply to job

# App Flow

**Job Application**
- when user sees a job, they click on it to view the job
- user then clicks on "Apply" and gets sent to job application page
- user submits application with their resume on file or use a different resume and the option to upload cover letter or paste text into rich text editor
- upon successfully applying, user gets application success modal 


## GEMINI 2.5 PROMPT

Okay, I understand the requirements for the Job Application feature. Based on the user story, app flow, schema details, and the established project context, here are the refined instructions for the Feature Planner AI:

---

**Refined Instructions for Feature Planner (`<user instructions>` section):**

Implement the Job Application feature for Ligaye.com, allowing logged-in candidates to apply for specific jobs. This includes navigating from the job detail page to a dedicated application form, handling resume and cover letter submission (using profile defaults, new uploads, or text input), and providing user feedback upon successful submission. Ensure strict adherence to the project's VSA, conventions (`base-knowledge.md`), database schema (`schema.ts`), and the specific requirements below.

**General Requirements:**

1.  **Architecture:** Implement using granular Vertical Slice Architecture.
    *   The primary application form and logic will reside in a new slice, e.g., `app/jobs/[slug]/apply/`. The `[slug]` parameter identifies the job being applied for.
    *   The trigger ("Apply" button) will likely be on the job detail page (`app/jobs/[slug]/`).
2.  **Data:** Use Drizzle ORM via functions in slice-specific `_queries.ts` to insert application records into the `applications` table (`schema.ts`). Ensure the `jobCandidateUniqueIdx` constraint (preventing duplicate applications) is handled gracefully.
3.  **Technology:**
    *   **Forms:** Use React Hook Form (RHF) and Zod (`_utils/validation.ts` within the `apply/` slice) for the application form.
    *   **Rich Text Editor:** Utilize the pre-configured Syncfusion Rich Text Editor component (`@/components/RichTextEditor/editor`) for the optional cover letter text input.
    *   **Mutations:** Use a Server Action (`_actions.ts` within the `apply/` slice) to handle form submission, process data (including file uploads), and interact with the database.
    *   **File Handling:** Implement file uploads for resumes and cover letters, likely using Supabase Storage. Store the resulting URL and original filename in the `applications` table.
    *   **UI:** Use Shadcn UI components (`components/ui/`) for form elements, buttons, and the success modal. Adhere to `style-guide.md`.
    *   **Responsiveness:** Ensure the application form and modal are fully responsive.
4.  **Authentication:** The application route must be protected, ensuring only logged-in users with the 'candidate' role can access it. The Server Action must retrieve the candidate's `profileId` and `candidateProfileId`.

**Specific Feature Implementations:**

**1. Trigger Application Flow (on `app/jobs/[slug]/`)**

*   **Location:** Job Detail Page (`app/jobs/[slug]/page.tsx` or a component within it).
*   **Functionality:** Include an "Apply" button. This button should navigate the user to the dedicated application page (`/jobs/[slug]/apply`). Ensure the `slug` is passed correctly. Check if the job's `applicationMethod` allows platform applications (if relevant).

**2. Job Application Page (`app/jobs/[slug]/apply/`)**

*   **Purpose:** Provide the interface for a candidate to submit their application for the specific job identified by `[slug]`.
*   **Target Route Slice:** `app/jobs/[slug]/apply/`
*   **Key Functionality:**
    *   **Fetch Context Data:** On page load, fetch details of the job (`jobs` table via `slug`) and the logged-in candidate's profile (`profiles`, `candidateProfiles`), including their default `resumeUrl` and `resumeFilename`.
    *   **Display Job Context:** Show minimal job details (e.g., Title, Company) for user orientation.
    *   **Application Form:** Present a form with the following sections:
        *   **Resume Selection:**
            *   Radio button/toggle: "Use profile resume ([filename])".
            *   Radio button/toggle: "Upload a new resume".
            *   Conditional file input field for uploading a new resume (`.pdf`, `.docx`, etc.).
        *   **Cover Letter Selection:**
            *   Radio button/toggle: "Upload cover letter file".
            *   Radio button/toggle: "Paste cover letter text".
            *   Radio button/toggle: "No cover letter" (Optional, based on requirements).
            *   Conditional file input field for uploading a cover letter file.
            *   Conditional Rich Text Editor (`@/components/RichTextEditor/editor`) for pasting cover letter text.
        *   **Submit Button.**
*   **UI Structure:**
    *   `page.tsx`: Server Component. Reads `slug` from `params`. Fetches job and candidate profile data using `./_queries.ts`. Passes data to the form component.
    *   `_components/ApplicationForm.tsx` (`'use client'`): The main form using RHF/Zod. Manages state for resume/cover letter choices and inputs. Handles conditional display of file inputs/editor. On submit, calls the `submitApplication` Server Action. Manages display of the success modal upon successful submission.
    *   `_components/ApplicationSuccessModal.tsx` (`'use client'`): A modal component displayed upon successful application submission.
    *   `_utils/validation.ts`: Zod schema for form validation (potentially optional fields for cover letter/resume depending on choices).
*   **Data Flow (Load):** `page.tsx` reads `slug`, gets `userId` -> `./_queries.ts` (`getApplicationContextData`) -> DB (fetch job by slug, fetch candidate profile by userId) -> Pass data to `ApplicationForm.tsx`.

**3. Application Submission Logic (`app/jobs/[slug]/apply/`)**

*   **Target Files:** `_actions.ts`, `_queries.ts`
*   **Server Action (`_actions.ts` -> `submitApplication`):**
    *   Accepts validated form data, `jobId` (derived from slug lookup), `candidateProfileId` (from logged-in user).
    *   **File Upload Handling:**
        *   If a new resume was uploaded, upload it to Supabase Storage (e.g., under a path like `resumes/[candidateProfileId]/[jobId]/[filename]`). Get the `resumeUrl` and `resumeFilename`.
        *   If a cover letter file was uploaded, upload it similarly. Get `coverLetterUrl` and `coverLetterFilename`.
    *   **Data Preparation:** Construct the `NewApplication` object for insertion:
        *   Set `jobId`, `candidateProfileId`.
        *   Determine `resumeUrl`/`resumeFilename` based on user choice (profile default or new upload).
        *   Determine `coverLetterUrl`/`coverLetterFilename` or `coverLetterText` based on user choice.
        *   Set initial `status` to `'APPLIED'`.
    *   **Database Insertion:** Call the `insertApplication` function from `./_queries.ts`.
    *   **Error Handling:** Catch potential errors, especially unique constraint violations (user already applied). Return structured success/error states to the form.
*   **Query (`_queries.ts` -> `insertApplication`):**
    *   Accepts the `NewApplication` object.
    *   Uses Drizzle (`await db()`) to insert the record into the `applications` table.
*   **Query (`_queries.ts` -> `getApplicationContextData`):**
    *   Fetches job details by slug and candidate profile details by user ID. Needed for the application page load.

---