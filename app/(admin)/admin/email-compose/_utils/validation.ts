import * as z from 'zod';

// Email address validation
const emailAddressSchema = z.string().email('Invalid email address');

// Multiple email addresses (comma-separated)
const multipleEmailsSchema = z
  .string()
  .optional()
  .refine(
    (value) => {
      if (!value) return true;
      const emails = value.split(',').map(email => email.trim());
      return emails.every(email => z.string().email().safeParse(email).success);
    },
    { message: 'Invalid email addresses. Please separate multiple emails with commas.' }
  );

// Individual email form schema
export const individualEmailFormSchema = z.object({
  recipient: emailAddressSchema,
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject is too long'),
  bodyHtml: z.string().min(1, 'Email body is required'),
  bodyText: z.string().optional(), // Plain text version is optional
  cc: multipleEmailsSchema,
  bcc: multipleEmailsSchema,
});

// Draft save schema (allows partial data)
export const emailDraftSchema = z.object({
  id: z.string().uuid().optional(), // For updating existing drafts
  recipient: z.string().optional(),
  subject: z.string().optional(),
  bodyHtml: z.string().optional(),
  bodyText: z.string().optional(),
  cc: z.string().optional(),
  bcc: z.string().optional(),
});

// Server-side email send schema (includes validation)
export const sendEmailSchema = individualEmailFormSchema.extend({
  templateId: z.string().optional(), // If using a template
  templateData: z.record(z.any()).optional(), // Template variables
});

// Types
export type TIndividualEmailForm = z.infer<typeof individualEmailFormSchema>;
export type TEmailDraft = z.infer<typeof emailDraftSchema>;
export type TSendEmail = z.infer<typeof sendEmailSchema>;