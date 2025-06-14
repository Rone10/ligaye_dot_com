import * as z from 'zod';

export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
});

export const contactsFileSchema = z.array(contactSchema);

export const sendEmailFormSchema = z.object({
  templateName: z.string().min(1, 'An email template must be selected'),
  contacts: contactsFileSchema.min(1, 'The contacts file cannot be empty.'),
  subject: z.string().min(1, 'Subject is required'),
});

export type TSendEmailForm = z.infer<typeof sendEmailFormSchema>;
export type TContact = z.infer<typeof contactSchema>;
