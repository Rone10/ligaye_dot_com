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
