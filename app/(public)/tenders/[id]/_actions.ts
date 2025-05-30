'use server';

import { getUser } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { tenders, tenderDocuments } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getUserProfile } from './_queries';
import { generateSignedUrl } from '@/lib/utils/file-upload';

export async function deleteTenderAction(tenderId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Get current user
    const user = await getUser();
    if (!user) {
      return { success: false, error: 'Authentication required' };
    }

    

    const database = await db();

    // First, check if the tender exists and belongs to the user
    const existingTender = await database
      .select()
      .from(tenders)
      .where(and(
        eq(tenders.id, tenderId),
        eq(tenders.deleted, false)
      ))
      .limit(1);

    
      const profile = await getUserProfile(user?.id || '');
  // const isOwner = profile?.id === existingTender[0].userId;
  

    if (existingTender.length === 0) {
      return { success: false, error: 'Tender not found' };
    }

    if (existingTender[0].userId !== profile?.id) {
      return { success: false, error: 'Unauthorized to delete this tender' };
    }

    // Soft delete the tender
    await database
      .update(tenders)
      .set({ 
        deleted: true,
        status: 'DELETED',
        updatedAt: new Date()
      })
      .where(eq(tenders.id, tenderId));

    // Revalidate the tenders list page
    revalidatePath('/tenders');

    return { success: true };
  } catch (error) {
    console.error('Error deleting tender:', error);
    return { success: false, error: 'Failed to delete tender' };
  }
}

export async function getFreeDocumentDownloadUrl(documentId: string): Promise<{
  success: boolean;
  downloadUrl?: string;
  error?: string;
}> {
  try {
    const database = await db();

    // Get the document details
    const [document] = await database
      .select({
        id: tenderDocuments.id,
        storagePath: tenderDocuments.storagePath,
        tenderId: tenderDocuments.tenderId,
        deleted: tenderDocuments.deleted,
      })
      .from(tenderDocuments)
      .where(and(
        eq(tenderDocuments.id, documentId),
        eq(tenderDocuments.deleted, false)
      ));

    if (!document) {
      return { success: false, error: 'Document not found' };
    }

    // Get the tender to check if documents are free
    const [tender] = await database
      .select({
        documentsArePaid: tenders.documentsArePaid,
        deleted: tenders.deleted,
      })
      .from(tenders)
      .where(and(
        eq(tenders.id, document.tenderId),
        eq(tenders.deleted, false)
      ));

    if (!tender) {
      return { success: false, error: 'Tender not found' };
    }

    // Check if documents are actually free
    if (tender.documentsArePaid) {
      return { success: false, error: 'Documents require payment' };
    }

    // Generate signed URL for free download (15 minutes expiry)
    const signedUrl = await generateSignedUrl(document.storagePath, 900);

    if (!signedUrl) {
      return { success: false, error: 'Failed to generate download link' };
    }

    return { success: true, downloadUrl: signedUrl };
  } catch (error) {
    console.error('Error generating free document download URL:', error);
    return { success: false, error: 'Failed to generate download link' };
  }
} 