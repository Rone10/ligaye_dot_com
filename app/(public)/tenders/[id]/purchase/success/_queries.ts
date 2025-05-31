import { db } from '@/lib/db';
import { tenders, tenderPayments, tenderDocuments, tenderDocumentPurchases } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { generateSignedUrl } from '@/lib/utils/file-upload';
import stripe from '@/lib/stripe';

export async function verifyPurchaseAndGetDocuments(tenderId: string, sessionId: string) {
  console.log('inside verifyPurchaseAndGetDocuments', tenderId, sessionId);
  try {
    console.log('inside verifyPurchaseAndGetDocuments try');
    const database = await db();
    
    // First, verify the payment exists
    const [payment] = await database
      .select()
      .from(tenderPayments)
      .where(eq(tenderPayments.stripeSessionId, sessionId));

    console.log('payment inside verifyPurchaseAndGetDocuments');
    console.log('payment', payment);
    console.log('payment.status', payment?.status);
    console.log('payment.tenderId', payment?.tenderId);

    if (!payment || payment.tenderId !== tenderId) {
      console.log('Payment not found or tender ID mismatch');
      return null;
    }

    // If payment is still pending, check with Stripe and update if completed
    if (payment.status === 'pending') {
      console.log('Payment is pending, checking with Stripe...');
      try {
        const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
        console.log('Stripe session status:', stripeSession.payment_status);
        
        if (stripeSession.payment_status === 'paid') {
          console.log('Payment confirmed with Stripe, updating local records...');
          
                     // Get payment intent ID for transaction reference
           let transactionId: string | null = null;
           if (stripeSession.payment_intent) {
             transactionId = typeof stripeSession.payment_intent === 'string' 
               ? stripeSession.payment_intent 
               : stripeSession.payment_intent.id;
           }
           
           // Update payment status and create purchase record
           await database.transaction(async (tx) => {
             // Update payment status
             await tx
               .update(tenderPayments)
               .set({
                 status: 'succeeded',
                 transactionId: transactionId,
                 updatedAt: new Date(),
               })
               .where(eq(tenderPayments.id, payment.id));
             
             // Check if purchase record already exists
             const existingPurchase = await tx
               .select()
               .from(tenderDocumentPurchases)
               .where(eq(tenderDocumentPurchases.tenderPaymentId, payment.id))
               .limit(1)
               .then(res => res[0]);
             
             // Create purchase record if it doesn't exist
             if (!existingPurchase) {
               await tx.insert(tenderDocumentPurchases).values({
                 tenderId: tenderId,
                 tenderPaymentId: payment.id,
                 deleted: false,
                 createdAt: new Date(),
                 updatedAt: new Date(),
               });
             }
           });
           
           // Update the payment object for the rest of the function
           payment.status = 'succeeded';
           payment.transactionId = transactionId;
        } else {
          console.log('Payment not yet completed in Stripe');
          return null;
        }
      } catch (stripeError) {
        console.error('Error checking Stripe session:', stripeError);
        return null;
      }
    }

    // At this point, payment should be succeeded
    if (payment.status !== 'succeeded') {
      console.log('Payment status is not succeeded:', payment.status);
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

    console.log('tender inside verifyPurchaseAndGetDocuments', tender);
    if (!tender) {
      return null;
    }

    // Get documents for this tender
    const documents = await database
      .select()
      .from(tenderDocuments)
      .where(eq(tenderDocuments.tenderId, tenderId));

    console.log('documents inside verifyPurchaseAndGetDocuments', documents);
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