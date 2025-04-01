**<Raw prompt>**

# Below are the user story points for the user registration feature (auth):

**Story**: Create backend API for user registration
**Story**: Create registration page with form and validation
**Story**: Integrate registration form with backend API
**Story**: Create backend API for user login
**Story**: Create login page with form
**Story**: Integrate login form with backend API
**Story**: Set up routing for role-based dashboards


## Resend Email API
- we will be using resend as our email sender with react email
- resend email dependency has already been correctly configured and setup

## Supabase Auth Implementation Notes

We need to implement the core authentication flows for the Ligaye.com project using Supabase Auth.

Context & Constraints (Referencing documents/base-knowledge.md):

Framework: Next.js App Router, No src/ directory. No API routes, use only server actions.

Architecture: Granular Vertical Slice Architecture (VSA). Each auth route (sign-in, sign-up, etc.) within the app/(auth)/ group must have its own complete slice structure (_components/, _actions.ts, _queries.ts where needed, _utils/, _hooks/).

Supabase Client: Pre-configured. Use server client from lib/supabase/server.ts within Server Actions. Use client client from lib/supabase/client.ts if needed in Client Components (though prefer server-side logic where possible).

Data Layer: Database interactions (like creating a user profile record) must occur via functions defined in the relevant slice's _queries.ts file, called from Server Actions.

Forms: Use React Hook Form (RHF) and Zod for all forms. Place form components ('use client') in the respective slice's _components/ directory and Zod schemas in _utils/validation.ts.

Mutations: Use Server Actions defined in _actions.ts files within each slice for handling form submissions and auth logic.

Feature Location:

All authentication-related pages will reside within the app/(auth)/ route group.

Implement the following specific routes/slices:

app/(auth)/sign-in/

app/(auth)/sign-up/

app/(auth)/verify/ (Handles email verification, likely via URL token)

app/(auth)/update-password/ (For logged-in users)

app/(auth)/reset-password/ (For forgotten passwords, likely involves email sending and token handling)

Detailed Flow Requirements:

1. Sign Up (app/(auth)/sign-up/)

UI: page.tsx renders a Client Component SignUpForm.tsx from _components/.

Form (SignUpForm.tsx):

Uses RHF/Zod. Validation schema in _utils/validation.ts.

Fields: First Name, Last Name, Email, Password.

On submit, calls the signUpUser Server Action. Display errors returned from the action.

Server Action (_actions.ts -> signUpUser function):

Receives validated form data.

Imports server Supabase client.

Imports createUserProfile function from ./_queries.ts.

Transaction Requirement: This action must ensure atomicity. First, call supabase.auth.signUp() with email/password. If successful, immediately call the createUserProfile function (passing relevant data like userId from Supabase result, first name, last name, email) from ./_queries.ts to insert the profile into the users table. Plan how to handle potential failures in the second step (e.g., try/catch around the DB insert, though full rollback involving Supabase auth is tricky - prioritize clear error feedback).

Handles errors from both Supabase Auth and the DB insertion. Return structured errors for the form.

On full success, redirect the user (e.g., to a "check your email" page or /sign-in).

Data Layer (_queries.ts -> createUserProfile function):

Receives user details (userId, first name, last name, email).

Imports db and schema from lib/db/.

Uses Drizzle ORM (await db()) to insert a new record into the users table.

2. Sign In (app/(auth)/sign-in/)

UI: page.tsx renders SignInForm.tsx from _components/.

Form (SignInForm.tsx):

Uses RHF/Zod. Validation schema in _utils/validation.ts.

Fields: Email, Password.

On submit, calls the signInUser Server Action. Display errors.

Server Action (_actions.ts -> signInUser function):

Receives validated email/password.

Imports server Supabase client.

Calls supabase.auth.signInWithPassword().

Handles errors (e.g., invalid credentials). Return structured errors for the form.

On success, redirect the user (e.g., to a dashboard page, potentially respecting a redirectUrl query parameter).

Data Layer (_queries.ts): Likely not needed for basic sign-in unless additional user data needs fetching within this action.

3. Other Flows (Plan Implementation Details)

Verify Email (app/(auth)/verify/):

Likely a Server Component (page.tsx) that reads a token from URL search params.

May need a Server Action (_actions.ts) triggered on load or by user action.

Action calls supabase.auth.verifyOtp() using the token.

Provide user feedback (success/failure) and potentially redirect. Define necessary components (_components/).

Update Password (app/(auth)/update-password/):

Assumes user is logged in (protected route via middleware/layout).

UI/Form (_components/UpdatePasswordForm.tsx): RHF/Zod for current password (maybe?), new password, confirm new password.

Server Action (_actions.ts): Calls supabase.auth.updateUser() with the new password. Handle errors. Provide success feedback.

Reset Password (app/(auth)/reset-password/):

Likely two stages/routes:

Request Reset: Form (_components/RequestResetForm.tsx) takes email. Server Action (_actions.ts) calls supabase.auth.resetPasswordForEmail().

Set New Password: User clicks email link containing a token, leading to a new page/route (e.g., app/(auth)/reset-password/confirm/). Form (_components/ConfirmResetForm.tsx) takes new password + confirmation. Server Action (_actions.ts) calls supabase.auth.updateUser() using the token implicitly managed by Supabase client after navigation from link. Handle token expiry/errors.

Supabase API Reference (For Planning):

Client Import: import { createClient } from '@/lib/supabase/[server|client]' -> const supabase = createClient()

Sign In: await supabase.auth.signInWithPassword(data)

Sign Up: await supabase.auth.signUp(data) (Returns { data: { user, session }, error })

Update Password: await supabase.auth.updateUser({ password: new_password })

Verify Email OTP: await supabase.auth.verifyOtp({ token_hash, type: 'signup' | 'email_change' | etc. })

Request Password Reset: await supabase.auth.resetPasswordForEmail(email, { redirectTo: 'url_to_confirm_page' })

Your Task:

Based on these requirements and the project's documents/base-knowledge.md, create a detailed technical implementation plan for these authentication flows, focusing on the file structure within each VSA slice, function signatures, data flow, and key logic placement as requested in the main architect prompt. Highlight how the transactionality for sign-up will be approached.

**<End of Raw Prompt>**

## Refined Auth Prompt (GEMINI 2.5)
Okay, I have processed the `user-auth.md`, `app-flow.md`, and `schema.ts` files in conjunction with the project's context from `base-knowledge.md` and my role definition from `feature-planner.md`.

Here are the refined instructions for the User Authentication feature, suitable for input into the `<user instructions>` section of the `feature-planner.md` prompt for the Feature Planner AI:

---

**Refined User Instructions for Feature Planner: User Authentication**

**1. Overall Goal:**
Implement the core user authentication flows (Sign Up, Sign In, Email Verification, Password Update, Password Reset) for the Ligaye.com platform. This implementation must strictly adhere to the project's architecture and conventions as detailed in `base-knowledge.md`.

**2. Core Requirements & Constraints:**
*   **Architecture:** Utilize the granular Vertical Slice Architecture (VSA) defined in `base-knowledge.md`. All feature-specific code must reside within the relevant route segment under `app/(auth)/`. Use `_` prefixed folders (`_components`, `_actions`, `_queries`, `_utils`, `_hooks`) within each slice. **No `src/` directory.**
*   **Authentication Provider:** Use Supabase Auth. Leverage the pre-configured Supabase clients (`lib/supabase/server.ts` for server-side/actions, `lib/supabase/client.ts` only if essential for client-side).
*   **Mutations:** Use **Next.js Server Actions** defined in slice-specific `_actions.ts` files for all authentication operations (sign-up, sign-in, password changes, etc.). **Do not use API Routes (`route.ts`).**
*   **Data Layer:** Database interactions (specifically creating the user profile record in the `profiles` table upon sign-up) must be performed via functions defined in the relevant slice's `_queries.ts` file, using the Drizzle ORM client (`await db()`) from `lib/db/index.ts` and types/schema from `lib/db/schema.ts`. Reference the provided `schema.ts` for table structure (note: `profiles` links via `userId` to Supabase auth user).
*   **Forms & Validation:** Use React Hook Form (RHF) and Zod for all authentication forms. Place Zod schemas in slice-specific `_utils/validation.ts` files and the React Hook Form components (`'use client'`) in slice-specific `_components/` directories.
*   **Styling & UI:** Use Tailwind CSS and leverage existing Shadcn UI components from `components/ui/` for form elements and layout. Follow the design principles, color palette, typography, spacing, and other UI specifications defined in `documents/style-guide.md` to ensure consistent styling throughout the authentication flows. This includes using the glassmorphic effects, proper elevation/shadow system, border radius values, and interactive states as specified in the style guide.
*   **Routing:** Implement the features within the `app/(auth)/` route group.
*   **Error Handling:** Implement robust error handling within Server Actions and queries. Return structured errors from Server Actions to be displayed in the client-side forms. Use Next.js `error.tsx` boundaries where appropriate.
*   **Email:** Utilize the pre-configured Resend integration for any custom email sending if required (e.g., potentially for password reset notifications beyond Supabase defaults, although Supabase handles its own auth emails). Supabase handles the verification email send upon `signUp`.

**3. Specific Authentication Flows to Implement:**

    **3.1. Sign Up:**
    *   **Route:** `app/(auth)/sign-up/`
    *   **VSA Slice:** Create necessary files within this directory (`page.tsx`, `_components/SignUpForm.tsx`, `_actions.ts`, `_queries.ts`, `_utils/validation.ts`).
    *   **UI (`_components/SignUpForm.tsx`):** Client Component using RHF/Zod. Fields: First Name, Last Name, Email, Password. On submit, it must call the `signUpUser` Server Action. Display validation and action errors.
    *   **Server Action (`_actions.ts` -> `signUpUser`):**
        *   Accepts validated form data.
        *   Uses server Supabase client.
        *   Calls `supabase.auth.signUp()`.
        *   **Transactionality Requirement:** If `signUp` is successful, immediately call a `createUserProfile` function (defined in `./_queries.ts`) to insert a corresponding record into the `profiles` table using the `userId` from the Supabase result, along with `fullName` and default `role` (likely 'candidate' initially, confirm default).
        *   **Error Handling:** Handle errors from both `supabase.auth.signUp` and the `createUserProfile` database call. Provide clear, user-friendly error feedback to the form. Acknowledge that a true atomic transaction across Supabase Auth and the project DB isn't feasible; prioritize robust error checking and feedback for the two steps.
        *   Redirects on success (e.g., to `/sign-in` or a "Check your email" page).
    *   **Data Query (`_queries.ts` -> `createUserProfile`):**
        *   Accepts user details (`userId`, `fullName`, `role`).
        *   Uses Drizzle (`await db()`) to insert into the `profiles` table (`lib/db/schema.ts`).

    **3.2. Sign In:**
    *   **Route:** `app/(auth)/sign-in/`
    *   **VSA Slice:** Create necessary files (`page.tsx`, `_components/SignInForm.tsx`, `_actions.ts`, `_utils/validation.ts`). A `_queries.ts` file is likely *not* needed for the core sign-in logic itself.
    *   **UI (`_components/SignInForm.tsx`):** Client Component using RHF/Zod. Fields: Email, Password. On submit, calls the `signInUser` Server Action. Display errors.
    *   **Server Action (`_actions.ts` -> `signInUser`):**
        *   Accepts validated email/password.
        *   Uses server Supabase client.
        *   Calls `supabase.auth.signInWithPassword()`.
        *   Handles errors (e.g., invalid credentials).
        *   Redirects on success (e.g., to a relevant dashboard, potentially respecting a `redirectUrl` query parameter).

    **3.3. Verify Email:**
    *   **Route:** `app/(auth)/verify/`
    *   **VSA Slice:** Create necessary files (`page.tsx`, potentially `_actions.ts`, `_components/VerificationStatus.tsx`).
    *   **Logic:** The `page.tsx` (likely a Server Component) should handle extracting the verification token (often passed via URL query params by Supabase). It may trigger a Server Action (`_actions.ts`) to call `supabase.auth.verifyOtp()`. Display success or failure feedback to the user using a component like `_components/VerificationStatus.tsx`. Potentially redirect on success.

    **3.4. Update Password (Logged-In User):**
    *   **Route:** `app/(auth)/update-password/` (This route should be protected, assuming middleware handles that).
    *   **VSA Slice:** Create necessary files (`page.tsx`, `_components/UpdatePasswordForm.tsx`, `_actions.ts`, `_utils/validation.ts`).
    *   **UI (`_components/UpdatePasswordForm.tsx`):** Client Component using RHF/Zod. Fields: New Password, Confirm New Password (consider if current password is needed based on UX/security). Calls an `updatePassword` Server Action.
    *   **Server Action (`_actions.ts` -> `updatePassword`):**
        *   Accepts validated new password.
        *   Uses server Supabase client and `getUser()` to ensure user is logged in.
        *   Calls `supabase.auth.updateUser({ password: new_password })`.
        *   Handles errors and provides success/failure feedback.

    **3.5. Reset Password (Forgotten Password):**
    *   **Stage 1: Request Reset**
        *   **Route:** `app/(auth)/reset-password/`
        *   **VSA Slice:** Create necessary files (`page.tsx`, `_components/RequestResetForm.tsx`, `_actions.ts`, `_utils/validation.ts`).
        *   **UI (`_components/RequestResetForm.tsx`):** Client Component using RHF/Zod. Field: Email. Calls a `requestPasswordReset` Server Action.
        *   **Server Action (`_actions.ts` -> `requestPasswordReset`):** Calls `supabase.auth.resetPasswordForEmail()` specifying the confirmation URL (e.g., `/auth/reset-password/confirm`). Provide feedback (e.g., "If an account exists, an email has been sent.").
    *   **Stage 2: Confirm Reset**
        *   **Route:** `app/(auth)/reset-password/confirm/` (or similar route targeted by the reset email link).
        *   **VSA Slice:** Create necessary files (`page.tsx`, `_components/ConfirmResetForm.tsx`, `_actions.ts`, `_utils/validation.ts`).
        *   **Logic:** Supabase client handles the token implicitly when the user navigates from the email link.
        *   **UI (`_components/ConfirmResetForm.tsx`):** Client Component using RHF/Zod. Fields: New Password, Confirm New Password. Calls a `confirmPasswordReset` Server Action.
        *   **Server Action (`_actions.ts` -> `confirmPasswordReset`):** Accepts validated new password. Uses server Supabase client. Calls `supabase.auth.updateUser({ password: new_password })`. Handles errors (e.g., expired token) and provides feedback/redirects on success (e.g., to sign-in page).

**4. Role-Based Routing Context:**
While the user story "Set up routing for role-based dashboards" exists (see `user-auth.md` stories), the focus of *this* implementation plan should be on the core authentication mechanisms within `app/(auth)/`. The subsequent routing based on the user's role (fetched after login, likely from the `profiles` table) will be handled separately, potentially via middleware or layout components outside this specific set of auth routes.

---

<END OF REFINED AUTH PROMPT>

## Refined Profile Instructions Prompt (GEMINI 2.5)
Okay, I understand. I will now generate the refined instructions for implementing the user profile features (Candidate and Employer creation/management, plus Admin viewing capabilities) based on `app-flow.md`, the relevant user stories implied within it, and the context provided by `base-knowledge.md` and `schema.ts`.

These instructions are intended for the `<user instructions>` section of `feature-planner.md` to guide the "Feature Planner" AI.

---

**Refined Instructions for Feature Planner (`<user instructions>` section):**

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

---

<END OF REFINED PROFILES PROMPT>





## GEMINI 2.5 1ST AUTH SETUP
Okay, I have reviewed the `user-auth.md`, `app-flow.md`, `schema.ts`, and `base-knowledge.md` documents. Based on your requirements, I will now refine the information in `user-auth.md` into a detailed set of instructions suitable for the `<user instructions>` section of the `feature-planner.md` file.

These instructions will guide the "Feature Planner" on *what* needs to be planned for the user authentication feature, ensuring strict adherence to the project's architecture and conventions outlined in `base-knowledge.md`.

---

**Refined Instructions for Feature Planner (`<user instructions>` section):**

Implement the core user authentication features for Ligaye.com using Supabase Auth, adhering strictly to the project's Vertical Slice Architecture (VSA) and conventions documented in `base-knowledge.md`.

**Overall Requirements:**

1.  **Location:** All authentication-related routes, components, actions, queries, and utilities must reside within the `app/(auth)/` route group.
2.  **Architecture:** Strictly follow the granular VSA. Each specific auth route (e.g., `sign-in`, `sign-up`) must contain its own co-located `_components/`, `_actions.ts`, `_utils/`, and potentially `_queries.ts` folders/files.
3.  **Technology:**
    *   Use Supabase Auth for all authentication operations.
    *   Use Server Actions (`_actions.ts` within each slice) for handling all form submissions and backend logic. **Do not use API routes (`route.ts`)**.
    *   Use React Hook Form (RHF) with Zod for all form implementation and validation. Place Zod schemas in `_utils/validation.ts` within the relevant slice.
    *   Use Drizzle ORM via functions in slice-specific `_queries.ts` files for any necessary database interactions (e.g., creating profiles). Reference `schema.ts` for table structures, specifically the `profiles` table.
    *   Use Shadcn UI components (`components/ui/`) for building the UI.
    *   Leverage the pre-configured Supabase server client (`lib/supabase/server.ts`) within Server Actions and the client client (`lib/supabase/client.ts`) *only if necessary* in Client Components.
4.  **Email:** Assume the Resend integration is configured. Plan for email sending related to verification and password resets, noting whether Supabase Auth handles this automatically via its triggers or if explicit sending calls are needed within Server Actions.
5.  **Profile Creation:** User registration must create corresponding records in the `profiles` table (defined in `schema.ts`) linking to the Supabase Auth user ID.

**Specific Route Implementations:**

**1. Sign Up (`app/(auth)/sign-up/`)**

*   **Purpose:** Implement the user registration flow.
*   **UI (`page.tsx` & `_components/`):**
    *   `page.tsx` should render a Client Component `SignUpForm.tsx`.
    *   `SignUpForm.tsx` (`'use client'`) should:
        *   Use RHF/Zod for a form with fields: Full Name, Email, Password. (Note: `user-auth.md` mentioned First/Last Name, but `schema.ts` has `fullName`. Use `fullName` based on the schema). Role selection might be needed here or derived differently - clarify if required based on flow. For now, assume a default role or separate registration paths if needed later.
        *   Use validation schema defined in `./_utils/validation.ts`.
        *   On submit, call the `signUpUser` Server Action from `./_actions.ts`.
        *   Display loading states and handle/display errors returned from the Server Action.
*   **Server Action (`_actions.ts` -> `signUpUser`):**
    *   Accept validated form data (fullName, email, password).
    *   Import and use the Supabase server client.
    *   Import the `createUserProfile` function from `./_queries.ts`.
    *   **Logic:**
        1.  Call `supabase.auth.signUp()` with email and password. Supabase should handle sending the verification email.
        2.  If `signUp` is successful, retrieve the `userId` from the Supabase response.
        3.  Immediately call `createUserProfile(userId, fullName, email, role)` from `./_queries.ts` to insert the user's details into the `profiles` table. Determine the appropriate `role` (e.g., 'candidate' or 'employer' - needs clarification on how this is set during sign-up).
    *   **Transactionality/Error Handling:** Plan the error handling for this two-step process. If `createUserProfile` fails after `signUp` succeeds, return a clear error state to the form indicating profile creation failure. Full rollback isn't simple; focus on robust error reporting.
    *   Return structured success/error states to the client.
    *   On successful completion of both steps, redirect the user (e.g., to `/sign-in` or a dedicated "Check your email" page).
*   **Data Layer (`_queries.ts` -> `createUserProfile`):**
    *   Accept `userId`, `fullName`, `email`, and `role`.
    *   Import `db` from `lib/db` and `profiles` schema/types from `lib/db/schema.ts`.
    *   Use `await db().insert(profiles).values(...)` to create the new profile record.
    *   Handle potential database errors and return success/failure status.

**2. Sign In (`app/(auth)/sign-in/`)**

*   **Purpose:** Implement the user login flow.
*   **UI (`page.tsx` & `_components/`):**
    *   `page.tsx` should render a Client Component `SignInForm.tsx`.
    *   `SignInForm.tsx` (`'use client'`) should:
        *   Use RHF/Zod for a form with fields: Email, Password.
        *   Use validation schema defined in `./_utils/validation.ts`.
        *   On submit, call the `signInUser` Server Action from `./_actions.ts`.
        *   Display loading states and handle/display errors (e.g., "Invalid credentials").
*   **Server Action (`_actions.ts` -> `signInUser`):**
    *   Accept validated email and password.
    *   Import and use the Supabase server client.
    *   Call `supabase.auth.signInWithPassword()`.
    *   Handle errors from Supabase (e.g., invalid login). Return structured error states.
    *   On success, redirect the user to their appropriate dashboard (consider role-based redirect logic if necessary, potentially checking user role after successful login before redirect). Consider respecting a `redirectUrl` query parameter if present.
*   **Data Layer (`_queries.ts`):** Likely not required for the basic sign-in action itself unless additional profile data needs fetching *within the action* immediately after login.

**3. Verify Email (`app/(auth)/verify/`)**

*   **Purpose:** Handle email verification link clicks.
*   **UI (`page.tsx`):**
    *   Likely a Server Component that reads verification details (e.g., token) from URL search parameters upon page load.
    *   Display appropriate messages (verifying, success, failure/expired token).
    *   Potentially trigger a Server Action automatically on load or via a user click if interaction is needed.
*   **Server Action (`_actions.ts` - if needed, e.g., `verifyUserEmail`):**
    *   Accept the verification token/details.
    *   Import and use the Supabase server client.
    *   Call the appropriate Supabase function (e.g., `verifyOtp` with type 'signup').
    *   Return success/error status.
*   **Components (`_components/`):** Define necessary components for displaying verification status messages.
*   **Redirect:** Plan redirection upon successful verification (e.g., to sign-in or dashboard).

**4. Update Password (`app/(auth)/update-password/`)**

*   **Purpose:** Allow logged-in users to change their password.
*   **Assumption:** This route should be protected, ensuring only authenticated users can access it (likely handled by middleware or a layout check using `getUser`).
*   **UI (`page.tsx` & `_components/`):**
    *   `page.tsx` renders `UpdatePasswordForm.tsx`.
    *   `UpdatePasswordForm.tsx` (`'use client'`) should:
        *   Use RHF/Zod for fields: New Password, Confirm New Password. (Consider if current password is required by your security policy).
        *   Use validation schema in `./_utils/validation.ts`.
        *   Call `updateUserPassword` Server Action on submit.
        *   Display success/error messages.
*   **Server Action (`_actions.ts` -> `updateUserPassword`):**
    *   Accept validated new password data.
    *   Import and use the Supabase server client.
    *   Call `supabase.auth.updateUser({ password: new_password })`.
    *   Handle errors and return status.

**5. Reset Password (`app/(auth)/reset-password/`)**

*   **Purpose:** Implement the forgotten password flow. This involves two stages.
*   **Stage 1: Request Reset (`app/(auth)/reset-password/`)**
    *   **UI:** `page.tsx` renders `RequestResetForm.tsx` (`'use client'`) in `_components/`. Form takes Email, uses RHF/Zod (`./_utils/validation.ts`), calls `requestPasswordReset` action.
    *   **Server Action (`_actions.ts` -> `requestPasswordReset`):** Takes email, calls `supabase.auth.resetPasswordForEmail()`, providing the correct `redirectTo` URL pointing to the confirmation page/route below. Handle errors. Display confirmation message ("Check your email") on success.
*   **Stage 2: Set New Password (e.g., `app/(auth)/reset-password/confirm/` - route needs confirmation)**
    *   **Assumption:** User arrives here via the email link containing a token. Supabase client handles the token implicitly.
    *   **UI:** `page.tsx` renders `ConfirmResetForm.tsx` (`'use client'`) in `_components/`. Form takes New Password, Confirm New Password, uses RHF/Zod (`./_utils/validation.ts`), calls `confirmPasswordReset` action.
    *   **Server Action (`_actions.ts` -> `confirmPasswordReset`):** Takes new password data, calls `supabase.auth.updateUser({ password: new_password })`. Handle errors (invalid/expired token, etc.). Redirect to sign-in on success.

---



## GEMINI 2.5 2ND PROFILE RESPONSE

Okay, I understand.

I will analyze the profile creation and management requirements described in `app-flow.md` for the Job Seeker (Candidate), Employer, and Admin personas. I will cross-reference this with the database structures in `schema.ts` (particularly `profiles`, `candidateProfiles`, `employerProfiles`, `skills`, `education`, `experience`, `locations`, `industries`) and refine these requirements into detailed instructions suitable for the `<user instructions>` section of `feature-planner.md`.

These instructions will guide the Feature Planner on *what* needs to be planned for these profile flows, ensuring alignment with the VSA, tech stack, and conventions specified in `base-knowledge.md`.

Here are the refined instructions:

---

**Refined Instructions for Feature Planner (`<user instructions>` section):**

Implement the user profile creation and management flows for Candidate (Job Seeker) and Employer roles, as well as a viewing capability for Admins, adhering strictly to the project's Vertical Slice Architecture (VSA) and conventions documented in `base-knowledge.md`.

**Overall Requirements:**

1.  **Location:** Profile management features should reside within appropriate dashboard or admin routes (e.g., `app/dashboard/candidate/profile/`, `app/dashboard/employer/profile/`, `app/admin/users/[userId]/`).
2.  **Architecture:** Strictly follow granular VSA. Each profile editing or viewing page must have its own co-located `_components/`, `_actions.ts`, `_queries.ts`, and `_utils/` as needed.
3.  **Technology:**
    *   Use Server Actions (`_actions.ts` within each slice) for handling profile updates and data mutations. **Do not use API routes (`route.ts`)**.
    *   Use React Hook Form (RHF) with Zod for profile editing forms. Place Zod schemas in `./_utils/validation.ts` within the relevant slice.
    *   Use Drizzle ORM via functions in slice-specific `_queries.ts` files for fetching and updating profile data in the database (`profiles`, `candidateProfiles`, `employerProfiles`, related tables like `skills`, `education`, `experience`, `locations`, `industries` as defined in `schema.ts`).
    *   Use Shadcn UI components (`components/ui/`) for UI elements.
    *   Handle file uploads (resumes, avatars, logos) using Supabase Storage, managed within Server Actions. The action should perform the upload and update the relevant URL field (`avatarUrl`, `resumeUrl`, `companyLogoUrl`) in the database via a `./_queries.ts` function.

**Specific Flow Implementations:**

**1. Candidate Profile Management (`app/dashboard/candidate/profile/`)**

*   **Purpose:** Allow logged-in candidates to create and update their detailed profile information.
*   **UI (`page.tsx` & `_components/`):**
    *   `page.tsx`: Server Component. Should fetch the candidate's complete profile data (from `profiles`, `candidateProfiles`, `candidateSkills`, `education`, `experience`) using a function in `./_queries.ts`. Render the `CandidateProfileForm.tsx` component, passing the fetched data as initial values.
    *   `_components/CandidateProfileForm.tsx` (`'use client'`):
        *   An RHF/Zod form to edit fields defined in `profiles` (fullName, avatarUrl) and `candidateProfiles` (title, experienceLevel, bio, linkedinUrl, githubUrl, portfolioUrl).
        *   Include functionality to manage related data:
            *   **Skills:** Interface (e.g., multi-select, tag input) to add/remove skills from `candidateSkills`. Needs to fetch available skills from the `skills` table (via a query in `./_queries.ts`).
            *   **Education:** Interface to add, edit, and delete education records (`education` table). Consider repeatable form sections.
            *   **Experience:** Interface to add, edit, and delete work experience records (`experience` table). Consider repeatable form sections.
            *   **Resume:** File input to upload/replace the resume (`resumeUrl`, `resumeFilename` in `candidateProfiles`). Handle file upload logic.
            *   **Avatar:** File input to upload/replace the profile avatar (`avatarUrl` in `profiles`). Handle file upload logic.
        *   Use validation schema from `./_utils/validation.ts`.
        *   On submit, call the `updateCandidateProfile` Server Action from `./_actions.ts`.
        *   Display loading states and success/error feedback.
*   **Server Action (`_actions.ts` -> `updateCandidateProfile`):**
    *   Accept validated form data, including file uploads if applicable.
    *   Perform file uploads (resume, avatar) to Supabase Storage, obtaining the URLs.
    *   Call relevant functions in `./_queries.ts` to:
        *   Update the `profiles` table (fullName, avatarUrl).
        *   Update the `candidateProfiles` table (title, experienceLevel, bio, URLs, resumeUrl, etc.).
        *   Synchronize `candidateSkills` (add/remove based on selection).
        *   Add/Update/Delete records in `education` and `experience` tables.
    *   Handle errors from uploads and database operations. Return structured status.
*   **Data Layer (`_queries.ts`):**
    *   `getCandidateProfile(userId)`: Fetch all necessary data for the form (joins might be needed).
    *   `getAllSkills()`: Fetch list of available skills for selection.
    *   `updateBaseProfile(profileId, data)`: Update fields in `profiles`.
    *   `updateCandidateSpecificProfile(candidateProfileId, data)`: Update fields in `candidateProfiles`.
    *   `syncCandidateSkills(candidateProfileId, skillIds)`: Update the `candidateSkills` junction table.
    *   Functions for CRUD operations on `education` linked to `candidateProfileId`.
    *   Functions for CRUD operations on `experience` linked to `candidateProfileId`.
    *   Handle database interactions using `await db()`.

**2. Employer Profile Management (`app/dashboard/employer/profile/`)**

*   **Purpose:** Allow logged-in employers to create and update their company profile.
*   **UI (`page.tsx` & `_components/`):**
    *   `page.tsx`: Server Component. Fetch the employer's profile data (`profiles`, `employerProfiles`, related `locations` and `industries`) using a function in `./_queries.ts`. Render `EmployerProfileForm.tsx` with initial data.
    *   `_components/EmployerProfileForm.tsx` (`'use client'`):
        *   An RHF/Zod form to edit fields from `profiles` (fullName, avatarUrl - maybe less relevant here?) and `employerProfiles` (companyName, companySize, companyDescription, website, hqAddressDisplay).
        *   Include inputs/selectors for related data:
            *   **Industry:** Select input linked to `industryId`. Needs to fetch available industries (`industries` table).
            *   **Location:** Select input(s) linked to `locationId`. Needs to fetch available locations (`locations` table).
            *   **Company Logo:** File input to upload/replace logo (`companyLogoUrl` in `employerProfiles`). Handle file upload.
        *   Use validation schema from `./_utils/validation.ts`.
        *   On submit, call the `updateEmployerProfile` Server Action from `./_actions.ts`.
        *   Display loading/feedback states.
*   **Server Action (`_actions.ts` -> `updateEmployerProfile`):**
    *   Accept validated form data, including logo file if applicable.
    *   Perform logo upload to Supabase Storage, obtaining the URL.
    *   Call relevant functions in `./_queries.ts` to:
        *   Update the `profiles` table (if applicable, e.g., contact person's name).
        *   Update the `employerProfiles` table (company details, industryId, locationId, companyLogoUrl).
    *   Handle errors and return status.
*   **Data Layer (`_queries.ts`):**
    *   `getEmployerProfile(userId)`: Fetch necessary data.
    *   `getAllIndustries()`: Fetch list for selection.
    *   `getAllLocations()`: Fetch list for selection.
    *   `updateBaseProfile(profileId, data)`: Update `profiles` table.
    *   `updateEmployerSpecificProfile(employerProfileId, data)`: Update `employerProfiles` table.
    *   Handle database interactions using `await db()`.

**3. Admin User Profile Viewing (e.g., `app/admin/users/[userId]/`)**

*   **Purpose:** Allow administrators to view the profile details of any user (Candidate or Employer).
*   **UI (`page.tsx` & `_components/`):**
    *   `page.tsx`: Server Component. Read `userId` from params. Call a function in `./_queries.ts` to fetch the comprehensive profile data for that user based on their role.
    *   `_components/UserProfileDisplay.tsx` (or specific `CandidateProfileDisplay.tsx`, `EmployerProfileDisplay.tsx`): Server or Client component(s) responsible for rendering the fetched profile information in a read-only format. Display base profile info, plus role-specific details (candidate skills, education, experience OR employer company info, industry, location).
*   **Server Action (`_actions.ts`):** Not required for viewing profile data.
*   **Data Layer (`_queries.ts`):**
    *   `getComprehensiveUserProfileById(userId)`: Fetch data from `profiles` and conditionally join/fetch from `candidateProfiles` or `employerProfiles` (and their related tables like skills, education, experience, industries, locations) based on the user's `role`. Return all relevant data needed for display.

---


