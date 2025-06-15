'use server';

import { Resend } from 'resend';
import { sendEmailFormSchema, type TSendEmailForm } from './_utils/validation';
import * as React from 'react';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = 'Campaigns <no-reply@ligaye.com>';

type ActionResult = {
  success: boolean;
  message: string;
};

// A map to safely access email components
// This prevents arbitrary file path imports
const emailTemplates: Record<
  string,
  React.ComponentType<{ name: string }>
> = {
  EmployerLaunchPromo: require('@/emails/EmployerLaunchPromo').EmployerLaunchPromo,
};

export async function sendBulkEmails(
  data: TSendEmailForm
): Promise<ActionResult> {
  try {
    // 1. Server-side validation
    const validationResult = sendEmailFormSchema.safeParse(data);
    if (!validationResult.success) {
      console.error('Server validation failed:', validationResult.error);
      return { success: false, message: 'Invalid data provided.' };
    }

    const { templateName, contacts, subject } = validationResult.data;

    // 2. Get the template component
    const TemplateComponent = emailTemplates[templateName];
    if (!TemplateComponent) {
      return { success: false, message: 'Invalid email template selected.' };
    }

    // 3. Prepare the bulk email payload for Resend
    const emailPayloads = contacts.map(contact => ({
      from: fromEmail,
      to: contact.email,
      subject: subject,
      react: React.createElement(TemplateComponent, { name: contact.name }),
    }));

    // 4. Send the emails using the batch method
    const { data: sentData, error } = await resend.batch.send(emailPayloads);

    if (error) {
      console.error('Resend batch send error:', error);
      return {
        success: false,
        message: 'Failed to send emails. Please check the logs.',
      };
    }

    // If we reach here, the batch was successfully submitted to Resend
    // The sentData.data contains an array of objects with 'id' properties
    const emailCount = sentData?.data?.length || 0;

    return {
      success: true,
      message: `Successfully queued ${emailCount} emails for sending.`,
    };
  } catch (e) {
    console.error('Unexpected error in sendBulkEmails:', e);
    return {
      success: false,
      message: 'An unexpected error occurred on the server.',
    };
  }
}
