# Bulk Email Sending Feature Implementation Plan

## 1. Overview

This document outlines the plan to implement a bulk email sending feature for administrators. The implementation will follow the "direct server action" approach, adhering strictly to the project's existing Vertical Slice Architecture and conventions.

## 2. File & Directory Structure

The following files and directories will be created:

-   **Feature Slice Root:** `app/(admin)/admin/email-send/`
    -   `page.tsx`: The main server component for the UI.
    -   `_components/EmailSendForm.tsx`: A client component to handle the interactive form, including file upload and template selection.
    -   `_actions.ts`: A file to contain the `sendBulkEmails` server action.
    -   `_utils/validation.ts`: Zod schemas for validating form input and the structure of the uploaded JSON file.
-   **Email Templates:** `emails/`
    -   `WelcomeEmail.tsx`: An example React component for an email template.
    -   `MarketingBlast.tsx`: Another example template.

## 3. Implementation Steps

### Step 1: Create Directory Structure & Initial Files
-   Create the `app/(admin)/admin/email-send/` directory and its `_components`, `_utils` subdirectories.
-   Create the `emails` directory in the project root.
-   Create empty placeholder files for `page.tsx`, `EmailSendForm.tsx`, `_actions.ts`, `validation.ts`, and the example email templates.

### Step 2: Define Validation Schemas (`_utils/validation.ts`)
-   Create a Zod schema (`contactSchema`) for a single contact object (e.g., `{ name: z.string(), email: z.string().email() }`).
-   Create a Zod schema (`contactsFileSchema`) for the entire JSON file content (e.g., `z.array(contactSchema)`).
-   Create a Zod schema (`sendEmailFormSchema`) for the form data to be sent to the server action, including the template identifier and the contacts array.

### Step 3: Create Email Templates (`emails/*.tsx`)
-   Implement two simple React components as email templates (e.g., `WelcomeEmail.tsx`, `MarketingBlast.tsx`).
-   Each template will accept props (e.g., `name`) to personalize the content.
-   These components will be rendered to HTML by Resend.

### Step 4: Build the Page Server Component (`page.tsx`)
-   This will be an `async` server component.
-   It will use Node.js `fs` module to read the filenames from the `/emails` directory to get a list of available templates.
-   It will render the main page layout (e.g., heading).
-   It will import and render the `<EmailSendForm />` client component, passing the list of available template names as a prop.

### Step 5: Build the Interactive Form (`_components/EmailSendForm.tsx`)
-   Mark as a client component with `'use client'`.
-   Use React Hook Form with `zodResolver` for form management.
-   Implement state management (`useState`) for the parsed file content and validation status.
-   **File Input:**
    -   On file select, use `FileReader` to read the file in the browser.
    -   Parse the content as JSON.
    -   Use the `contactsFileSchema` from `_utils/validation.ts` to validate the parsed data client-side.
    -   Provide immediate UI feedback (e.g., "Loaded 150 valid contacts" or "Error: Invalid file format").
-   **Template Select:**
    -   Use the `Select` component from Shadcn UI, populated with the template names passed from `page.tsx`.
-   **Submission:**
    -   The submit button will be disabled until a valid file is loaded and a template is selected.
    -   The `onSubmit` handler will call the `sendBulkEmails` server action.
    -   Use `useTransition` to manage the form's pending state, showing a loading indicator while the emails are being sent.
    -   Display a success or error message (e.g., using `react-hot-toast`) based on the action's return value.

### Step 6: Implement the Server Action (`_actions.ts`)
-   Define an `async` server action `sendBulkEmails`.
-   The action will receive the form data.
-   **Security:** It will re-validate the received data against the `sendEmailFormSchema`. This is a critical security step.
-   It will dynamically import the selected React email template component from the `emails/` directory.
-   It will instantiate the Resend client.
-   It will map over the array of contacts and use Resend's `sendBulk` method. Each payload in the bulk operation will include the recipient's email, a subject line, and the rendered React template (`react: <TemplateComponent name={contact.name} />`).
-   The action will be wrapped in a `try/catch` block to handle errors from the Resend API.
-   It will return a success or error object to the client for UI feedback. 