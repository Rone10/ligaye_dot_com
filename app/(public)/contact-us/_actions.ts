'use server'

import { Resend } from 'resend'
import { type ContactFormValues } from './_utils/validation' // Use the type from validation file
import ContactFormSubmissionEmail from '@/emails/contact-form-submission'

// Initialize Resend
// Ensure RESEND_API_KEY is set in your environment variables
const resend = new Resend(process.env.RESEND_API_KEY)

// Define the recipient email address (consider using an environment variable)
const recipientEmail = process.env.CONTACT_EMAIL_RECIPIENT || 'am.diallo1421@gmail.com';
const fromEmail = 'Contact Form <contact@ligaye.com>'; // Or your verified Resend domain

export async function sendContactMessage(data: ContactFormValues) {
  // No need to re-validate here as the form uses zodResolver
  // The data reaching this action should already be validated.

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [recipientEmail],
      replyTo: data.email,
      subject: `New Contact Form Submission: ${data.subject}`,
      react: ContactFormSubmissionEmail({
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
      }),
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: "Failed to send message. Please try again later." };
    }

    return { success: true, message: "Your message has been sent successfully!" };

  } catch (error) {
    console.error("Contact form submission error:", error);
    // Return a generic error message to the client
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
} 