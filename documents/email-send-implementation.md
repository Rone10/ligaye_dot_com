## Email Send Implementation — Ligaye.com

This document captures the implementation details of the email-sending feature in this repository so you can re-implement it as a standalone application. It covers templates, validation, client UI, server action, provider integration, dependencies, environment variables, flows, and recommended improvements for production.

---

## Quick summary / contract

- Inputs: A JSON contacts file (array of objects { name: string, email: string }), a selected template name, and an email subject.
- Output: The selected email (template) queued/sent to each contact. The server action returns success/failure and a human-friendly message.
- Success criteria: Each contact is submitted to the delivery provider (Resend) via a batched API call; the server action returns success when the provider accepts the batch.

---

## Where the code lives (key files)

- Email templates: `/emails/*.tsx` (e.g. `EmployerLaunchPromo.tsx`, `MarketingBlast.tsx`, `WelcomeEmail.tsx`, etc.)
- Admin page that lists templates: `app/(admin)/admin/email-send/page.tsx`
- Admin UI form component: `app/(admin)/admin/email-send/_components/EmailSendForm.tsx`
- Server action that sends emails: `app/(admin)/admin/email-send/_actions.ts` (exports `sendBulkEmails`)
- Validation (zod): `app/(admin)/admin/email-send/_utils/validation.ts`
- Package/dep declaration: `package.json`

Read these files to see the full implementation and examples used in this repo. The implementation uses React Email components for templates and `resend` for delivery.

---

## Templates (how they are built)

- Templates are React components using `@react-email/components` primitives. Example: `EmployerLaunchPromo.tsx` exports a React component that takes a small props object (commonly `{ name }`) and returns an email document composed with `Html`, `Head`, `Preview`, `Body`, `Container`, `Section`, `Text`, `Heading`, `Img`, and `Button`.
- Template files reference `process.env.NEXT_PUBLIC_APP_URL` to build links and image URLs. This allows preview links and CTA buttons to use the app domain in dev and production.
- Templates are authored with inline styles (JS objects) and are safe to render to HTML.
- In the project, templates are mapped in `app/(admin)/admin/email-send/_actions.ts` via a static object:

  const emailTemplates = { EmployerLaunchPromo: EmployerLaunchPromo, ... }

- Template contract: props are minimal (e.g., name). For standalone implementations, you can design templates to accept richer context (company, dynamic tokens, links, etc.).

---

## Client UI & UX (how an admin triggers a send)

- `EmailSendForm.tsx` is a client component (`'use client'`) using React Hook Form, `zod` schema for client-side validation (via `@hookform/resolvers/zod`), `react-dropzone` for uploading a JSON file of contacts, and `sonner` to show toasts.
- The admin picks a template and subject. They upload a JSON file containing an array of contacts: each contact should match the `contactSchema` (see Validation section).
- On submit, the component calls the Server Action `sendBulkEmails` (imported from `_actions.ts`) with the selected templateName, subject, and parsed contacts array.
- The admin UI includes a preview for the EmployerLaunchPromo template (rendered as an HTML snippet in the page) to provide a preview before sending.

Example client-side flow:

1. Admin selects `EmployerLaunchPromo` from a Select.
2. Uploads `contacts.json` containing `[{"name":"Acme Ltd","email":"hr@acme.example"}, ...]`.
3. Clicks `Launch Email Campaign` which calls the server action.

---

## Contact JSON structure and validation

- Expected contact object shape (zod schema):

  {
    name: string (min 1),
    email: string (valid email)
  }

- Contacts file: JSON array of above objects. The validation is defined in `contactsFileSchema` and used client-side to validate the uploaded file and server-side to validate incoming data.

Example contacts file (contacts.json):

```json
[ { "name": "John Doe", "email": "john@example.com" },
  { "name": "Jane Employer", "email": "jobs@example.com" } ]
```

---

## Server action: sendBulkEmails (implementation notes)

- File: `app/(admin)/admin/email-send/_actions.ts`.
- Marked with `'use server'` so it runs on the server and can safely access environment variables.
- Validation: uses `sendEmailFormSchema` (zod) to validate templateName, contacts, and subject.
- Template resolution: looks up the template component from a server-side static map (no dynamic require). If a template is not found, returns a friendly error.
- Payload construction: for each contact the code builds an object with `from`, `to`, `subject`, and `react` (React.createElement(TemplateComponent, { name: contact.name })).

- Delivery provider: the implementation uses Resend (official npm package `resend`). It creates a client with `new Resend(process.env.RESEND_API_KEY)` and calls `resend.batch.send(emailPayloads)` to send multiple messages in a single batch.

- Response handling: The code inspects the returned `sentData` and `error`. If resend reports an error it returns a failure. Otherwise it reports how many messages were queued.

- From address: hard-coded to `Ligaye <contact@ligaye.com>` in this repository. In production you'd typically set this via env var and ensure the address is verified with the provider.

---

## Delivery provider and environment variables

- This project uses Resend (https://resend.com):
  - npm package: `resend` (see `package.json`).
  - env var used: `RESEND_API_KEY` (server side) — required to authenticate to Resend.
- Templates include `process.env.NEXT_PUBLIC_APP_URL` for links; this is a public env var used in templates and client-side preview.
- Make sure to keep `RESEND_API_KEY` secret and not commit it. In Next.js store it in `.env` (local) and set in your deployment provider (Vercel, Netlify, etc.).

Recommended env variables for standalone app:

- RESEND_API_KEY (server-only)
- NEXT_PUBLIC_APP_URL (optional — used in template CTA links and images)
- EMAIL_FROM (optional — default from address)

---

## Dependencies (relevant)

From `package.json`, the email feature uses the following packages (most relevant):

- `resend` — Resend SDK and batch send API used by server action.
- `@react-email/components` — primitives for building email React templates.
- `react-email` (dev dep) — for helper tooling and rendering (if needed).
- `react` / `react-dom` — React is used everywhere and templates are React components.
- `zod` — schemas for validation.
- `react-hook-form` and `@hookform/resolvers` — client form handling and validation.
- `react-dropzone` — file upload component.
- `sonner` — toast notifications for UI feedback.

Standalone implementation should include at minimum: `react`, `@react-email/components`, `resend`, `zod` and whatever UI/form libraries you choose.

---

## How templates are rendered and sent

Two approaches to deliver HTML from React templates to a provider:

1. Pass React element directly to a provider that supports server-side React rendering (this project relies on `resend.batch.send` and passes `react: React.createElement()` directly in the payload). Resend supports a `react` option which it will render server-side.

2. Render templates to an HTML string in your app (server) and send `html` to any provider that accepts HTML (SendGrid, Mailgun, Postmark, etc.). To render you can use `@react-email/render` or `react-dom/server`'s `renderToStaticMarkup`:

   - `renderToStaticMarkup(<MyTemplate {...props} />)` -> HTML string.
   - Provide HTML as the message body to your provider.

The advantage of using a provider-native `react` option is simplified flow. The advantage of rendering HTML yourself is flexibility (works with any provider) and consistent instrumentation/debugging.

---

## Error handling and validation strategy

- UI-level: file parsing errors and validation failures are surfaced to the admin via toasts (client uses `contactsFileSchema` to validate the uploaded JSON). If validation fails, the form is blocked.
- Server-level: `sendBulkEmails` runs `sendEmailFormSchema.safeParse` and returns an error message if validation fails. Uncaught exceptions are caught and logged, and a generic failure message is returned.
- Provider errors: `resend.batch.send` returns `data` and `error`. The code checks `error` and returns a failure message if present. Batch-level errors should be logged.

---

## Safety, spam, and production considerations

- Verify sending domain and from-address in your provider to avoid deliverability issues.
- Implement rate-limiting/queueing for large send volumes (Resend batch limits vary and providers often restrict per-minute throughput).
- Add proper unsubscribe links and list-unsubscribe headers for marketing emails.
- Monitor bounces, complaints, and unsubscribes via provider webhooks.

Scaling recommendations:

- Offload bulk sends to a background job system (e.g., Redis + BullMQ, Inngest, or serverless workers). Use the server action only to enqueue a job.
- Use provider webhooks to mark delivery status and to remove invalid addresses from future sends.
- Add retry/backoff for transient provider errors.

---

## Suggested standalone project structure

Minimal structure for a standalone service that replicates this feature:

- /templates/
  - EmployerLaunchPromo.tsx
  - MarketingBlast.tsx
- /server/
  - sendEmail.ts (function to validate, map template, and call provider)
  - queueWorker.ts (optional background worker)
- /web/
  - admin UI (upload contacts, select template)
- package.json (include `resend`, `@react-email/components`, `zod`, `react`, `react-dom`, `react-hook-form`)

---

## Minimal example: server send function (concept)

This repo uses `resend.batch.send` and passes `react` elements. A conceptual Node/TS function for standalone use:

```ts
import { Resend } from 'resend';
import React from 'react';
import { EmployerLaunchPromo } from '../templates/EmployerLaunchPromo';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBulk(contacts, subject) {
  const payloads = contacts.map(c => ({
    from: process.env.EMAIL_FROM || 'Your App <noreply@yourdomain.com>',
    to: c.email,
    subject,
    react: React.createElement(EmployerLaunchPromo, { name: c.name }),
  }));

  return await resend.batch.send(payloads);
}
```

If your provider does not accept React elements, render to HTML first using `renderToStaticMarkup` or `@react-email/render`.

---

## How to test locally (quick steps)

1. Create `.env.local` at the project root and add:

```
RESEND_API_KEY=REPLACE_WITH_KEY
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

2. Start the Next.js dev server: `pnpm dev` (this repo uses pnpm). Open the admin email-send page.

3. Use a small contacts file (2 rows) and a test subject and template.

4. Submit and watch logs for the server action returning success. Confirm the provider's dashboard (Resend) to see messages queued/sent.

---

## Files & snippets to copy for a standalone implementation

- Copy template components from `/emails/*.tsx` and adapt props to fit your domain.
- Copy `sendBulkEmails` logic but adapt the transport method if using a different provider.
- Copy `contactsFileSchema` and `sendEmailFormSchema` for validation.

---

## Final notes and next steps

- The repo demonstrates a compact and practical approach to sending marketing emails from a Next.js admin UI using React templates and Resend.
- If you want, I can generate a runnable standalone microservice repository (Express or Fastify + API + simple admin UI) with the same behavior and tests. Tell me which stack you prefer and I can scaffold it.

---

Document created from source files:

- `/emails/EmployerLaunchPromo.tsx`
- `/app/(admin)/admin/email-send/_components/EmailSendForm.tsx`
- `/app/(admin)/admin/email-send/_actions.ts`
- `/app/(admin)/admin/email-send/_utils/validation.ts`
- `package.json`
