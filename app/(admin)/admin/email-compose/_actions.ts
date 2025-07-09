'use server';

import { Resend } from 'resend';
import { db } from '@/lib/db';
import { getUser } from '@/lib/supabase/server';
import { emailDrafts } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { 
  individualEmailFormSchema, 
  emailDraftSchema,
  type TIndividualEmailForm,
  type TEmailDraft 
} from './_utils/validation';
import * as React from 'react';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = 'Ligaye <contact@ligaye.com>';

type ActionResult<T = void> = {
  success: boolean;
  message?: string;
  data?: T;
};

// Send individual email
export async function sendIndividualEmail(
  data: TIndividualEmailForm
): Promise<ActionResult> {
  try {
    // Check authentication
    const user = await getUser();
    if (!user || user.user_metadata?.role !== 'admin') {
      return { success: false, message: 'Unauthorized' };
    }

    // Validate data
    const validationResult = individualEmailFormSchema.safeParse(data);
    if (!validationResult.success) {
      return { success: false, message: 'Invalid email data' };
    }

    const { recipient, subject, bodyHtml, cc, bcc } = validationResult.data;

    // Prepare email payload
    const emailPayload: any = {
      from: fromEmail,
      to: recipient,
      subject: subject,
      html: bodyHtml,
    };

    // Add CC if provided
    if (cc) {
      emailPayload.cc = cc.split(',').map(email => email.trim());
    }

    // Add BCC if provided
    if (bcc) {
      emailPayload.bcc = bcc.split(',').map(email => email.trim());
    }

    // Send email
    const { data: sentData, error } = await resend.emails.send(emailPayload);

    if (error) {
      console.error('Resend error:', error);
      return {
        success: false,
        message: 'Failed to send email. Please try again.',
      };
    }

    // Save to email_drafts with status 'sent'
    const database = await db();
    await database.insert(emailDrafts).values({
      userId: user.id,
      recipient,
      subject,
      bodyHtml,
      bodyText: data.bodyText || null,
      cc: cc || null,
      bcc: bcc || null,
      status: 'sent',
      sentAt: new Date(),
    });

    return {
      success: true,
      message: 'Email sent successfully!',
    };
  } catch (error) {
    console.error('Unexpected error in sendIndividualEmail:', error);
    return {
      success: false,
      message: 'An unexpected error occurred.',
    };
  }
}

// Save email draft
export async function saveDraft(
  data: TEmailDraft
): Promise<ActionResult<{ id: string }>> {
  try {
    // Check authentication
    const user = await getUser();
    if (!user || user.user_metadata?.role !== 'admin') {
      return { success: false, message: 'Unauthorized' };
    }

    // Validate data
    const validationResult = emailDraftSchema.safeParse(data);
    if (!validationResult.success) {
      return { success: false, message: 'Invalid draft data' };
    }

    const database = await db();
    const { id, ...draftData } = validationResult.data;

    // Update existing draft or create new one
    if (id) {
      // Update existing draft
      await database
        .update(emailDrafts)
        .set({
          ...draftData,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(emailDrafts.id, id),
            eq(emailDrafts.userId, user.id),
            eq(emailDrafts.status, 'draft'),
            eq(emailDrafts.deleted, false)
          )
        );

      return {
        success: true,
        data: { id },
      };
    } else {
      // Create new draft
      const [newDraft] = await database
        .insert(emailDrafts)
        .values({
          userId: user.id,
          recipient: draftData.recipient || '',
          subject: draftData.subject || '',
          bodyHtml: draftData.bodyHtml || '',
          bodyText: draftData.bodyText || null,
          cc: draftData.cc || null,
          bcc: draftData.bcc || null,
          status: 'draft',
        })
        .returning({ id: emailDrafts.id });

      return {
        success: true,
        data: { id: newDraft.id },
      };
    }
  } catch (error) {
    console.error('Error saving draft:', error);
    return {
      success: false,
      message: 'Failed to save draft.',
    };
  }
}

// Load email draft
export async function loadDraft(
  draftId: string
): Promise<ActionResult<TEmailDraft & { id: string }>> {
  try {
    // Check authentication
    const user = await getUser();
    if (!user || user.user_metadata?.role !== 'admin') {
      return { success: false, message: 'Unauthorized' };
    }

    const database = await db();
    const [draft] = await database
      .select()
      .from(emailDrafts)
      .where(
        and(
          eq(emailDrafts.id, draftId),
          eq(emailDrafts.userId, user.id),
          eq(emailDrafts.status, 'draft'),
          eq(emailDrafts.deleted, false)
        )
      )
      .limit(1);

    if (!draft) {
      return { success: false, message: 'Draft not found' };
    }

    return {
      success: true,
      data: {
        id: draft.id,
        recipient: draft.recipient,
        subject: draft.subject,
        bodyHtml: draft.bodyHtml,
        bodyText: draft.bodyText || undefined,
        cc: draft.cc || undefined,
        bcc: draft.bcc || undefined,
      },
    };
  } catch (error) {
    console.error('Error loading draft:', error);
    return {
      success: false,
      message: 'Failed to load draft.',
    };
  }
}

// Get all drafts for the current user
export async function getDrafts(): Promise<ActionResult<Array<{
  id: string;
  recipient: string;
  subject: string;
  updatedAt: Date;
}>>> {
  try {
    // Check authentication
    const user = await getUser();
    if (!user || user.user_metadata?.role !== 'admin') {
      return { success: false, message: 'Unauthorized' };
    }

    const database = await db();
    const drafts = await database
      .select({
        id: emailDrafts.id,
        recipient: emailDrafts.recipient,
        subject: emailDrafts.subject,
        updatedAt: emailDrafts.updatedAt,
      })
      .from(emailDrafts)
      .where(
        and(
          eq(emailDrafts.userId, user.id),
          eq(emailDrafts.status, 'draft'),
          eq(emailDrafts.deleted, false)
        )
      )
      .orderBy(desc(emailDrafts.updatedAt));

    return {
      success: true,
      data: drafts,
    };
  } catch (error) {
    console.error('Error getting drafts:', error);
    return {
      success: false,
      message: 'Failed to load drafts.',
    };
  }
}

// Delete draft
export async function deleteDraft(draftId: string): Promise<ActionResult> {
  try {
    // Check authentication
    const user = await getUser();
    if (!user || user.user_metadata?.role !== 'admin') {
      return { success: false, message: 'Unauthorized' };
    }

    const database = await db();
    await database
      .update(emailDrafts)
      .set({
        deleted: true,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(emailDrafts.id, draftId),
          eq(emailDrafts.userId, user.id),
          eq(emailDrafts.status, 'draft')
        )
      );

    return {
      success: true,
      message: 'Draft deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting draft:', error);
    return {
      success: false,
      message: 'Failed to delete draft.',
    };
  }
}