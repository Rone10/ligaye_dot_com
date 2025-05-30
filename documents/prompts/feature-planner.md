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


Implement a feature enabling users (typically employers/admins) to upload documents associated with tenders. These documents can either be free to download or require a one-time payment via Stripe for access. This feature needs to integrate with existing tender creation/editing flows and introduce a new purchase flow for paid documents, accessible to both authenticated and unauthenticated users.

**General Requirements:**

1.  **Architecture & VSA:**
    *   Strictly adhere to the project's granular Vertical Slice Architecture (VSA).
    *   Modifications will occur in existing tender slices (e.g., `app/(public)/tenders/new/`, `app/(public)/tenders/[id]/edit/`, `app/(public)/tenders/[id]/`).
    *   A new slice will be required for the document purchase flow (e.g., `app/(public)/tenders/[id]/purchase/`).
    *   All new VSA slices must follow established conventions for `_components/`, `_actions.ts`, `_queries.ts`, etc.

2.  **Database Modifications:**
    *   **Critical:** This feature requires significant database schema changes.
    *   **New Tables:**
        *   `tenderDocuments`: Stores metadata for uploaded documents.
        *   `tenderPayments`: Records payment transactions specifically for tender documents.
        *   `tenderDocumentPurchases`: Tracks successful document purchases, linking tenders to payments.
    *   **Modify `tenders` Table:** Add fields for `documentsArePaid` (boolean), `documentPrice` (real), and `documentCurrency` (text).
    *   **Drizzle Relations:** Define new relations between `tenders`, `tenderDocuments`, `tenderPayments`, and `tenderDocumentPurchases`.
    *   **Migrations:** Generate and apply Drizzle migrations after schema updates.
    *   **(Refer to the detailed schema provided in internal documentation for exact field definitions and relations.)**

3.  **Supabase Storage & RLS:**
    *   Utilize a **private** Supabase Storage bucket (e.g., `tender-documents`).
    *   Implement Row Level Security (RLS) policies for this bucket:
        *   Uploads: Handled by Server Actions using service_role (bypassing RLS for write, authorization in action).
        *   Downloads:
            *   Tender owners can read their own documents.
            *   Backend (service_role) can generate signed URLs for free documents.
            *   Paid documents accessed *only* via short-lived signed URLs generated post-payment.

4.  **Technology & UI:**
    *   **Forms:** React Hook Form (RHF) + Zod for tender forms and purchaser information.
    *   **File Uploads:** Handle `File[]` objects in Server Actions, upload to Supabase Storage.
    *   **Payments:** Integrate Stripe Checkout for paid document access.
    *   **UI Components:** Use Shadcn UI components. Adhere to `style-guide.md`.
    *   **Server Actions:** For all mutations (tender creation/update with documents, initiating purchase).
    *   **Webhooks:** Update existing Stripe webhook to handle tender document payment success.

**Specific Feature Implementations:**

**1. Tender Creation/Update with Document Uploads (Modifying `app/(public)/tenders/new/` & `app/(public)/tenders/[id]/edit/`)**

*   **UI Enhancements (`_components/NewTenderForm.tsx`, `_components/EditTenderForm.tsx`):**
    *   Add multi-file input for document uploads.
    *   Include UI elements (checkbox/radio) to mark documents as "Free" or "Paid".
    *   If "Paid", add inputs for `documentPrice` and `documentCurrency`.
*   **Server Actions (`_actions.ts` - `createTenderAction`, `updateTenderAction`):**
    *   Accept `FormData` including files.
    *   Perform authorization.
    *   **Transactional DB Operations:**
        1.  Create/update the `tenders` record (with `documentsArePaid`, `price`, `currency`).
        2.  For each uploaded file:
            *   Upload to Supabase Storage (path like `tender-documents/[tenderId]/[file_uuid_filename]`).
            *   Create a corresponding record in `tenderDocuments`.
        3.  Handle deletion of existing documents during an update (soft delete in DB, optional physical delete from storage).
*   **Queries (`_queries.ts`):**
    *   New/updated functions to create/update tenders along with their associated `tenderDocuments`.
    *   Fetch tender details including its `tenderDocuments` for edit forms.

**2. Document Purchase Flow (New Slice: `app/(public)/tenders/[id]/purchase/`)**

*   **Purpose:** Allow any user (authenticated or not) to purchase access to paid tender documents.
*   **Purchase Page (`.../purchase/page.tsx`):**
    *   Fetch tender details (title, price, currency).
    *   If documents are free or price not set, display an appropriate message.
    *   Present a form for purchaser info (Full Name, Email, optional Phone).
    *   "Proceed to Payment" button.
*   **Server Action (`.../purchase/_actions.ts` - `initiateDocumentPurchaseAction`):**
    *   Validate purchaser info.
    *   Fetch tender price.
    *   Create a Stripe Checkout Session with relevant `line_items`, `metadata` (including `tenderId`, `purchaseType: 'TENDER_DOCUMENT'`, purchaser details), `success_url`, and `cancel_url`.
    *   Redirect user to Stripe.
*   **Stripe Webhook Update (`app/api/webhooks/stripe/route.ts`):**
    *   Modify the `checkout.session.completed` event handler.
    *   If `session.metadata.purchaseType === 'TENDER_DOCUMENT'` and `session.payment_status === 'paid'`:
        *   Extract `tenderId` and purchaser details from metadata.
        *   Call a new query/handler (e.g., `recordTenderDocumentPurchase`).
*   **Query/Handler for Webhook (`_queries.ts` or `lib/stripe/tender-stripe-actions.ts` - `recordTenderDocumentPurchase`):**
    *   **Transactional DB Operations:**
        1.  Create a record in `tenderPayments` (status 'succeeded', Stripe IDs, amount, purchaser info).
        2.  Create a record in `tenderDocumentPurchases` linking `tenderId` to the new `tenderPayments.id`.
    *   (Optional: Trigger confirmation email).
*   **Success Page (`.../purchase/success/page.tsx`):**
    *   Verify Stripe `session_id` from `searchParams`.
    *   Confirm purchase record exists in `tenderDocumentPurchases` via `_queries.ts`.
    *   If verified, fetch `tenderDocuments` for the tender.
    *   Generate and display short-lived Supabase Storage signed URLs for each document.
*   **Cancel Page (`.../purchase/cancel/page.tsx`):**
    *   Display a "Purchase Cancelled" message.

**3. Document Download Logic (Modifying `app/(public)/tenders/[id]/page.tsx`)**

*   **Displaying Documents:**
    *   Fetch tender details along with its `tenderDocuments` (filenames, IDs, sizes).
*   **Free Documents (`tender.documentsArePaid === false`):**
    *   For each document, provide a download mechanism (e.g., a button).
    *   Clicking the button should call a Server Action (`app/(public)/tenders/[id]/_actions.ts` - e.g., `getFreeDocumentDownloadUrl(documentId)`).
    *   This action verifies the document is free, generates a Supabase Storage signed URL, and returns it for client-side download.
*   **Paid Documents (`tender.documentsArePaid === true`):**
    *   Display "Documents available for purchase: [Price] [Currency]".
    *   Link to the purchase page (`/tenders/[id]/purchase/`).
    *   Do NOT provide direct download links. Access is granted only via the purchase success page.

**4. Type Definitions (`lib/db/schema.ts`):**

*   Ensure `InferSelectModel` and `InferInsertModel` types are defined for `tenderDocuments`, `tenderPayments`, and `tenderDocumentPurchases`.

**Key Considerations for Planning:**

*   **Transactionality:** Ensure database operations for creating/updating tenders with documents, and for recording purchases, are transactional to maintain data integrity.
*   **Security:** Rigorous server-side authorization for all mutations. Stripe webhook signature verification. Secure handling of signed URLs (short-lived, not exposing raw paths).
*   **User Experience:** Clear feedback during uploads, payment, and download. Handling of edge cases (e.g., payment failure, webhook delay).
*   **Modularity:** Design webhook handlers and Stripe interaction logic to be maintainable, potentially in dedicated files within `lib/stripe/` if complexity warrants, but ensure data access still goes through appropriate `_queries.ts` files.


</user_instructions>