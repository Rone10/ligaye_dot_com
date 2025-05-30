import { db } from '@/lib/db';
import { tenders, tenderPayments, tenderDocuments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateSignedUrl } from '@/lib/utils/file-upload';

export async function verifyPurchaseAndGetDocuments(tenderId: string, sessionId: string) {
  try {
    const database = await db();
    
    // First, verify the payment exists and is successful
    const [payment] = await database
      .select()
      .from(tenderPayments)
      .where(eq(tenderPayments.stripeSessionId, sessionId));

    if (!payment || payment.status !== 'succeeded' || payment.tenderId !== tenderId) {
      return null;
    }

    // Get tender details
    const [tender] = await database
      .select({
        id: tenders.id,
        title: tenders.title,
        organizationName: tenders.organizationName,
      })
      .from(tenders)
      .where(eq(tenders.id, tenderId));

    if (!tender) {
      return null;
    }

    // Get documents for this tender
    const documents = await database
      .select()
      .from(tenderDocuments)
      .where(eq(tenderDocuments.tenderId, tenderId));

    // Generate signed URLs for documents
    const documentsWithUrls = await Promise.all(
      documents.map(async (doc) => {
        const signedUrl = await generateSignedUrl(doc.storagePath, 900); // 15 minutes
        return {
          id: doc.id,
          originalFilename: doc.originalFilename,
          fileSize: doc.fileSize || 0,
          signedUrl: signedUrl || '',
        };
      })
    );

    return {
      tender,
      payment,
      documents: documentsWithUrls,
    };
  } catch (error) {
    console.error('Error verifying purchase and getting documents:', error);
    return null;
  }
} 