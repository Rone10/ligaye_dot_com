Implement a feature enabling users (typically employers/admins) to upload documents associated with tenders. These documents can either be free to download or require a one-time payment via Stripe for access. This feature needs to integrate with existing tender creation/editing flows and introduce a new purchase flow for paid documents, accessible to both authenticated and unauthenticated users.


# Feature Implementation: Tender Document Uploads & Paid Access

**Project Context:** Ligaye.com (Job & Tender Board for Gambia)
**Core Technologies:** Next.js 15 (App Router), Supabase (Auth, DB, Storage), Drizzle ORM, Stripe, Tailwind CSS, Shadcn UI.
**Architectural Pattern:** Granular Vertical Slice Architecture (VSA) within `app/` route segments.

**Objective:**
Implement a feature allowing employers/admins to upload documents when posting/editing a tender. These documents can be free to download or require a one-time payment for access. Users (including unauthenticated ones) should be able to purchase and download paid documents.

---

## 1. Database Schema Modifications (`lib/db/schema.ts`)

You will need to add three new tables and modify the existing `tenders` table.

**a. New Table: `tenderDocuments`**
   - Stores metadata for each document uploaded for a tender.

   ```typescript
   // In lib/db/schema.ts

   // ... other imports
   import { tenders } from './schema'; // Ensure tenders is defined before this or imported correctly

   export const tenderDocuments = pgTable('tender_documents', {
     id: uuid('id').primaryKey().defaultRandom(),
     tenderId: uuid('tender_id').notNull().references(() => tenders.id, { onDelete: 'cascade' }),
     storagePath: text('storage_path').notNull(), // e.g., tender-documents/tender_uuid/document_uuid_filename.pdf
     originalFilename: text('original_filename').notNull(),
     fileSize: integer('file_size'), // In bytes
     mimeType: text('mime_type'),   // E.g., 'application/pdf'
     // description: text('description'), // Optional: if you want a short desc per document
     deleted: boolean('deleted').default(false).notNull(),
     createdAt: timestamp('created_at').notNull().defaultNow(),
     updatedAt: timestamp('updated_at').notNull().defaultNow(),
   }, (table) => {
     return {
       tenderIdIdx: index('tender_documents_tender_id_idx').on(table.tenderId),
       deletedIdx: index('tender_documents_deleted_idx').on(table.deleted),
     };
   });
   ```

**b. Modify `tenders` Table:**
   - Add fields to manage document payment status and price.

   ```typescript
   // In lib/db/schema.ts, within the existing `tenders` table definition:
   export const tenders = pgTable('tenders', {
     // ... existing fields (id, title, description, organizationName, etc.)
     documentsArePaid: boolean('documents_are_paid').default(false).notNull(),
     documentPrice: real('document_price'), // Nullable: Price if documentsArePaid is true
     documentCurrency: text('document_currency').default('GMD'), // Default currency, only relevant if documentPrice is set
     // ... existing fields (status, userId, deleted, createdAt, updatedAt)
   } // ... existing indexes
   );
   ```

**c. New Table: `tenderPayments`**
   - Stores payment details for tender document purchases. This is separate from the existing `payments` table used for job postings.

   ```typescript
   // In lib/db/schema.ts
   export const tenderPayments = pgTable('tender_payments', {
     id: uuid('id').primaryKey().defaultRandom(),
     tenderId: uuid('tender_id').notNull().references(() => tenders.id, { onDelete: 'cascade' }),
     amount: integer('amount').notNull(), // Amount in smallest currency unit
     currency: text('currency').notNull().default('GMD'),
     method: text('method').notNull().default('stripe'), // 'stripe'
     status: text('status').notNull(), // 'pending', 'succeeded', 'failed'
     transactionId: text('transaction_id').unique(), // Stripe Payment Intent ID or Charge ID
     stripeSessionId: text('stripe_session_id').unique(), // Stripe Checkout Session ID
     purchaserFullName: text('purchaser_full_name').notNull(),
     purchaserEmail: text('purchaser_email').notNull(),
     purchaserPhone: text('purchaser_phone'), // Optional
     deleted: boolean('deleted').default(false).notNull(),
     createdAt: timestamp('created_at').notNull().defaultNow(),
     updatedAt: timestamp('updated_at').notNull().defaultNow(),
   }, (table) => {
     return {
       tenderIdIdx: index('tender_payments_tender_id_idx').on(table.tenderId),
       transactionIdIdx: index('tender_payments_transaction_id_idx').on(table.transactionId),
       stripeSessionIdIdx: index('tender_payments_stripe_session_id_idx').on(table.stripeSessionId),
       purchaserEmailIdx: index('tender_payments_purchaser_email_idx').on(table.purchaserEmail),
       statusIdx: index('tender_payments_status_idx').on(table.status),
       deletedIdx: index('tender_payments_deleted_idx').on(table.deleted),
     };
   });
   ```

**d. New Table: `tenderDocumentPurchases`**
   - Tracks successful purchases, linking a tender to its payment record. This table does NOT store `userId` as purchases can be made by unauthenticated users.

   ```typescript
   // In lib/db/schema.ts
   export const tenderDocumentPurchases = pgTable('tender_document_purchases', {
     id: uuid('id').primaryKey().defaultRandom(),
     tenderId: uuid('tender_id').notNull().references(() => tenders.id, { onDelete: 'cascade' }),
     tenderPaymentId: uuid('tender_payment_id').notNull().unique().references(() => tenderPayments.id, { onDelete: 'cascade' }),
     // accessKey: text('access_key').unique(), // Optional: if generating custom secure links, can be set upon successful payment
     deleted: boolean('deleted').default(false).notNull(),
     createdAt: timestamp('created_at').notNull().defaultNow(),
     updatedAt: timestamp('updated_at').notNull().defaultNow(),
   }, (table) => {
     return {
       tenderPaymentUniqueIdx: uniqueIndex('tender_doc_purchase_payment_unique_idx').on(table.tenderPaymentId),
       tenderIdIdx: index('tender_doc_purchase_tender_id_idx').on(table.tenderId),
       deletedIdx: index('tender_doc_purchase_deleted_idx').on(table.deleted),
     };
   });
   ```

**e. Define Drizzle Relations:**
   - Update existing relations and add new ones for the new tables.

   ```typescript
   // In lib/db/schema.ts, within the relations definitions:

   // For tenders
   export const tendersRelations = relations(tenders, ({ one, many }) => ({
     // ... existing relations (user, location, sector)
     documents: many(tenderDocuments, { relationName: 'tenderToDocuments' }),
     payments: many(tenderPayments, { relationName: 'tenderToPayments' }), // All payments made for this tender's documents
     purchases: many(tenderDocumentPurchases, { relationName: 'tenderToPurchases' }), // All completed purchases for this tender's documents
     // postedBy: one(profiles, { fields: [tenders.userId], references: [profiles.id] }) // Assuming this exists
   }));

   // New relations for tenderDocuments
   export const tenderDocumentsRelations = relations(tenderDocuments, ({ one }) => ({
     tender: one(tenders, {
       fields: [tenderDocuments.tenderId],
       references: [tenders.id],
       relationName: 'tenderToDocuments'
     }),
   }));

   // New relations for tenderPayments
   export const tenderPaymentsRelations = relations(tenderPayments, ({ one }) => ({
     tender: one(tenders, {
       fields: [tenderPayments.tenderId],
       references: [tenders.id],
       relationName: 'tenderToPayments'
     }),
     purchaseRecord: one(tenderDocumentPurchases, { // Link from payment to the purchase entitlement record
       fields: [tenderPayments.id],
       references: [tenderDocumentPurchases.tenderPaymentId],
       relationName: 'paymentToPurchaseRecord'
     })
   }));

   // New relations for tenderDocumentPurchases
   export const tenderDocumentPurchasesRelations = relations(tenderDocumentPurchases, ({ one }) => ({
     tender: one(tenders, {
       fields: [tenderDocumentPurchases.tenderId],
       references: [tenders.id],
       relationName: 'tenderToPurchases'
     }),
     payment: one(tenderPayments, { // Link from purchase entitlement back to payment
       fields: [tenderDocumentPurchases.tenderPaymentId],
       references: [tenderPayments.id],
       relationName: 'paymentToPurchaseRecord'
     }),
   }));
   ```

**f. Generate and Apply Migrations:**
   - After schema changes, run `pnpm drizzle-kit generate:pg` and then apply the migration.

---

## 2. Supabase Storage & RLS (Row Level Security)

**a. Create Storage Bucket (if not already done):**
   - Name: `tender-documents`
   - **Set to Private.** Public access will be managed via signed URLs.

**b. RLS Policies for `tender-documents` bucket:**
   - **Uploads (INSERT):** Server Actions will use the Supabase Admin key (service_role) for uploads, bypassing RLS for the write. Authorization *must* happen in the Server Action.
   - **Downloads (SELECT):** Access for paid documents will be exclusively via short-lived signed URLs generated by the backend after payment. Free documents can also use signed URLs generated by the backend.
     - **Policy 1: Tender owner (authenticated user who posted it) can read their documents.**
       ```sql
       -- Make sure the tenders table has a userId linking to the profiles.id of the poster
       CREATE POLICY "Tender owners can read their documents"
       ON storage.objects FOR SELECT USING (
         bucket_id = 'tender-documents' AND
         auth.role() = 'authenticated' AND -- Ensure user is authenticated
         auth.uid() = (
           SELECT t.user_id FROM public.tenders t
           WHERE t.id = (string_to_array(storage.objects.name, '/'))[1]::uuid -- Assumes path: {tender_id}/{filename}
         )
       );
       ```
     - **Policy 2: Allow read access for documents belonging to FREE tenders.**
       This policy allows the backend (using its service_role key) to generate signed URLs for these files.
       ```sql
       CREATE POLICY "Allow read for free tender documents via service role"
       ON storage.objects FOR SELECT USING (
         bucket_id = 'tender-documents' AND
         (storage.foldername(name))[1] IS NOT NULL AND -- Ensures there's a tender_id part in the path
         false = (
           SELECT t.documents_are_paid FROM public.tenders t
           WHERE t.id = (string_to_array(storage.objects.name, '/'))[1]::uuid
         )
       );
       ```
     - **Note on Paid Documents:** For *paid* documents, direct RLS SELECT by anonymous users is implicitly denied because the bucket is private and no specific RLS grants them access. Access is *only* via signed URLs generated by the backend (using service_role which bypasses RLS SELECT if needed, or relies on Policy 1 if the generator is the owner).

---

## 3. Backend Logic: Tender Creation/Update

Follow VSA: place logic within `app/(public)/tenders/new/` and `app/(public)/tenders/[id]/edit/` slices (these slices already exist, update them with the new feature).

**a. UI (`_components/NewTenderForm.tsx` or similar):**
   - Add a file input component (e.g., Shadcn `Input type="file"` or a custom one) allowing multiple file selections. Display selected file names and allow removal.
   - Add a checkbox/radio group: "Are these documents free or paid?"
   - If "Paid" is selected, conditionally display inputs for `documentPrice` (e.g., `Input type="number"`) and `documentCurrency` (e.g., `Select` prefilled with 'GMD').

**b. Server Action (`_actions.ts` - e.g., `createTenderAction`, `updateTenderAction`):**
   - Accept `FormData` which includes tender details and uploaded `File[]`.
   - **Authorization:** Ensure the calling user is authenticated and has permission (e.g., 'employer', 'admin').
   - **Transaction for DB operations:**
     1. Create/update the `tenders` record (including `documentsArePaid`, `documentPrice`, `documentCurrency`).
     2. For each new file uploaded:
        *   Generate a unique `storagePath` within the `tender-documents` bucket (e.g., `tender-documents/${tenderId}/${uuidV4()}-${file.name}`).
        *   Use `await supabase.storage.from('tender-documents').upload(storagePath, file)` (server-side Supabase client using service_role).
        *   Create a record in `tenderDocuments` with `tenderId`, `storagePath`, `originalFilename`, `fileSize`, `mimeType`.
     3. For files marked for deletion during an update:
        *   Soft-delete the record in `tenderDocuments`.
        *   Optionally, delete the file from Supabase Storage: `await supabase.storage.from('tender-documents').remove([storagePath])`.
   - Return success/error state.

**c. Queries (`_queries.ts`):**
   - `createTenderWithDocuments(...)`: Handles DB inserts for `tenders` and `tenderDocuments`.
   - `updateTenderWithDocuments(...)`: Handles DB updates for `tenders` and `tenderDocuments`, including deletions.
   - `getTenderForEdit(...)`: Fetch tender details and its associated non-deleted `tenderDocuments`.

---

## 4. Backend Logic: Document Purchase Flow (for Unauthenticated & Authenticated Users)

Create a new route segment, e.g., `app/(public)/tenders/[id]/purchase/`.

**a. Page (`app/(public)/tenders/[id]/purchase/page.tsx`):**
   - Fetch tender details (`_queries.ts` `getTenderPurchaseInfo(tenderId)`: needs `title`, `documentsArePaid`, `documentPrice`, `documentCurrency`).
   - If `!tender.documentsArePaid` or `!tender.documentPrice`, show an appropriate message (e.g., "Documents are free" or "Price not set").
   - Display a form to collect purchaser information:
     *   Full Name (required)
     *   Email (required, for receipt and potentially download links)
     *   Phone (optional)
   - "Proceed to Payment" button.

**b. Server Action (`app/(public)/tenders/[id]/purchase/_actions.ts` - `initiateDocumentPurchaseAction`):**
   - Receives tender ID and purchaser info from the form.
   - **Validation:** Validate purchaser info (Zod).
   - Fetch tender details to confirm price and currency.
   - Create a Stripe Checkout Session:
     *   `line_items`: [{ price_data: { currency, product_data: { name: `Tender Documents: ${tender.title}` }, unit_amount: priceInSmallestUnit }, quantity: 1 }]
     *   `mode`: 'payment'
     *   `customer_email`: `purchaserEmail` (pre-fills Stripe email)
     *   `metadata`:
         *   `tenderId`: tender.id
         *   `purchaseType`: 'TENDER_DOCUMENT' (to differentiate from job payments)
         *   `purchaserFullName`: purchaserInfo.fullName
         *   `purchaserEmail`: purchaserInfo.email
         *   `purchaserPhone`: purchaserInfo.phone (if provided)
     *   `success_url`: `${process.env.NEXT_PUBLIC_APP_URL}/tenders/${tenderId}/purchase/success?session_id={CHECKOUT_SESSION_ID}`
     *   `cancel_url`: `${process.env.NEXT_PUBLIC_APP_URL}/tenders/${tenderId}/purchase/cancel`
   - Redirect user to `session.url`.

**c. Stripe Webhook Updates (`app/api/webhooks/stripe/route.ts`):**
   - Modify the existing `POST` handler.
   - Inside the `checkout.session.completed` case:
     ```typescript
     const session = event.data.object;
     const metadata = session.metadata;

     if (session.payment_status === 'paid') {
       if (metadata?.purchaseType === 'TENDER_DOCUMENT') {
         // New: Handle Tender Document Purchase
         const tenderId = metadata.tenderId;
         const purchaserFullName = metadata.purchaserFullName;
         const purchaserEmail = metadata.purchaserEmail;
         const purchaserPhone = metadata.purchaserPhone; // Optional
         const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : null; // or session.payment_intent.id if object

         if (!tenderId || !purchaserFullName || !purchaserEmail || !paymentIntentId) {
           console.error('Missing metadata for tender document purchase:', metadata);
           // Potentially return an error or log for investigation
           return NextResponse.json({ error: 'Webhook: Missing tender purchase metadata' }, { status: 400 });
         }

         // Use a new handler function in _queries.ts or a dedicated stripe actions file for tenders
         await recordTenderDocumentPurchase({
           tenderId,
           amount: session.amount_total, // Ensure this is the correct amount
           currency: session.currency,
           transactionId: paymentIntentId,
           stripeSessionId: session.id,
           purchaserFullName,
           purchaserEmail,
           purchaserPhone,
         });
         // TODO: Optionally send email with receipt/download instructions here or after purchase record

       } else {
         // Existing logic for job payments (handleSuccessfulPayment)
         await handleSuccessfulPayment(session.id);
       }
     }
     break;
     ```
   - **New Query/Action (`_queries.ts` for webhooks, or a new `lib/stripe/tender-stripe-actions.ts`): `recordTenderDocumentPurchase`**
     *   This function will be called by the webhook.
     *   **DB Transaction:**
         1. Create a record in `tenderPayments` with all details (tenderId, amount, currency, status='succeeded', transactionId, stripeSessionId, purchaser info).
         2. Create a record in `tenderDocumentPurchases` linking `tenderId` and the new `tenderPayments.id`.
     *   Consider sending a confirmation email to `purchaserEmail` with a link to the success page or directly to download (if feasible and secure).

**d. Success Page (`app/(public)/tenders/[id]/purchase/success/page.tsx`):**
   - Get `session_id` from `searchParams`.
   - **Server-side:**
     *   Verify the `session_id` by fetching the session from Stripe API to confirm payment.
     *   Crucially, check your `tenderDocumentPurchases` table (via `_queries.ts`) to ensure the purchase for this `stripeSessionId` was successfully recorded by the webhook.
     *   If verified:
         *   Fetch the `tenderId` (e.g., from Stripe session metadata or your DB via session_id).
         *   Fetch the associated `tenderDocuments` for that `tenderId`.
         *   For each document, generate a short-lived (e.g., 5-15 minutes) Supabase Storage signed URL:
           `await supabase.storage.from('tender-documents').createSignedUrl(doc.storagePath, 900)`
         *   Pass these signed URLs to the client component.
   - **Client-side:** Display "Purchase Successful!" and list documents with their download links (the signed URLs).

**e. Cancel Page (`app/(public)/tenders/[id]/purchase/cancel/page.tsx`):**
   - Display "Purchase Cancelled" message.

---

## 5. Backend Logic: Document Download Flow

**a. On Tender Details Page (`app/(public)/tenders/[id]/page.tsx`):**
   - **`_queries.ts` (`getTenderPublicDetails(tenderId)`):**
     *   Fetch tender details.
     *   Fetch non-deleted `tenderDocuments` (only `originalFilename`, `id`, `fileSize` - not `storagePath` yet for security if paid).
   - **`_components/TenderDisplay.tsx` / `_components/DocumentList.tsx`:**
     *   **If `tender.documentsArePaid` is `false` (Free Documents):**
         *   For each document, you'll need a way to get a signed URL. This could be a Server Action called by a button click, or pre-fetched if performance allows and security is maintained.
         *   **Server Action (`app/(public)/tenders/[id]/_actions.ts` - `getFreeDocumentDownloadUrl(documentId)`):**
             1. Fetch `tenderDocument` by `documentId`.
             2. Verify its parent `tender.documentsArePaid` is `false`.
             3. Generate and return a Supabase Storage signed URL.
             4. Client opens this URL.
     *   **If `tender.documentsArePaid` is `true` (Paid Documents):**
         *   Display "Documents available for purchase: [Price] [Currency]".
         *   Provide a link/button to the purchase page: `/tenders/[id]/purchase/`.
         *   **Do NOT show download links here.** Access is only granted after payment via the success page or a secure link (e.g., from email, though success page is simpler initially).

---

## 6. Type Definitions (`lib/db/schema.ts`)

Ensure you add `InferSelectModel` and `InferInsertModel` types for the new tables:
```typescript
// In lib/db/schema.ts, at the end

export type TenderDocument = InferSelectModel<typeof tenderDocuments>;
export type NewTenderDocument = InferInsertModel<typeof tenderDocuments>;

export type TenderPayment = InferSelectModel<typeof tenderPayments>;
export type NewTenderPayment = InferInsertModel<typeof tenderPayments>;

export type TenderDocumentPurchase = InferSelectModel<typeof tenderDocumentPurchases>;
export type NewTenderDocumentPurchase = InferInsertModel<typeof tenderDocumentPurchases>;
```

---

## 7. Key Files to Create/Modify (Illustrative List)

*   `lib/db/schema.ts` (Schema, Relations, Types)
*   `app/(public)/tenders/new/_components/NewTenderForm.tsx` (UI for upload & payment options)
*   `app/(public)/tenders/new/_actions.ts` (Handle tender creation with documents)
*   `app/(public)/tenders/new/_queries.ts` (DB logic for creation)
*   `app/(public)/tenders/[id]/edit/...` (Similar to `new/` for updates)
*   `app/(public)/tenders/[id]/page.tsx` (Display tender, links to purchase or download free docs)
*   `app/(public)/tenders/[id]/_components/DocumentList.tsx` (Render document list)
*   `app/(public)/tenders/[id]/_actions.ts` (Action to get free document signed URLs)
*   `app/(public)/tenders/[id]/_queries.ts` (Fetch tender details including documents)
*   `app/(public)/tenders/[id]/purchase/page.tsx` (Purchaser info form)
*   `app/(public)/tenders/[id]/purchase/_actions.ts` (Initiate Stripe Checkout)
*   `app/(public)/tenders/[id]/purchase/success/page.tsx` (Handle successful payment, provide download links)
*   `app/(public)/tenders/[id]/purchase/cancel/page.tsx` (Handle cancelled payment)
*   `app/api/webhooks/stripe/route.ts` (Update webhook handler)
*   New file for tender-specific Stripe webhook processing, e.g., `lib/stripe/tender-stripe-actions.ts` (containing `recordTenderDocumentPurchase`) or place this logic in a `_queries.ts` file accessible by the webhook.

---

## Reminders:

*   **VSA:** Adhere strictly to placing components, actions, queries, utils, etc., within their respective feature route segments.
*   **Error Handling:** Implement robust try/catch blocks, user-friendly error messages, and proper error reporting from Server Actions.
*   **Validation:** Use Zod for form data validation on the server.
*   **Security:**
    *   Prioritize server-side authorization for all sensitive actions.
    *   Ensure Stripe webhook signatures are verified.
    *   Use short-lived signed URLs for all document downloads.
    *   Do not expose raw `storagePath` to the client unless it's for a signed URL.
*   **User Experience:** Provide clear feedback during uploads, payment processing, and for download access.

**Key Considerations for Planning:**

*   **Transactionality:** Ensure database operations for creating/updating tenders with documents, and for recording purchases, are transactional to maintain data integrity.
*   **Security:** Rigorous server-side authorization for all mutations. Stripe webhook signature verification. Secure handling of signed URLs (short-lived, not exposing raw paths).
*   **User Experience:** Clear feedback during uploads, payment, and download. Handling of edge cases (e.g., payment failure, webhook delay).
*   **Modularity:** Design webhook handlers and Stripe interaction logic to be maintainable, potentially in dedicated files within `lib/stripe/` if complexity warrants, but ensure data access still goes through appropriate `_queries.ts` files.