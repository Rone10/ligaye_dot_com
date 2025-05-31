import stripe from './index';
import { db } from '@/lib/db';
import { and, eq } from 'drizzle-orm';
import { tenderPayments, tenderDocumentPurchases } from '@/lib/db/schema';

/**
 * Handles a successful Stripe payment completion for tender documents
 */
export async function handleTenderDocumentPurchase(session: any) {
  try {
    console.log(`Processing tender document purchase for session: ${session.id}`);
    
    if (!session?.metadata?.tenderId) {
      throw new Error('Missing tender ID in Stripe session metadata');
    }

    const tenderId = session.metadata.tenderId;
    const sessionId = session.id;
    
    // Update the payment record in the database
    await db().transaction(async (tx) => {
      // Find the payment record
      const paymentRecord = await tx
        .select()
        .from(tenderPayments)
        .where(and(
          eq(tenderPayments.stripeSessionId, sessionId),
          eq(tenderPayments.method, 'stripe'),
          eq(tenderPayments.status, 'pending'),
          eq(tenderPayments.deleted, false)
        ))
        .limit(1)
        .then(res => res[0]);
      
      if (!paymentRecord) {
        throw new Error('Payment record not found for this session');
      }
      
      // Get the payment intent from the session to get the transaction ID
      let transactionId = null;
      if (session.payment_intent) {
        transactionId = typeof session.payment_intent === 'string' 
          ? session.payment_intent 
          : session.payment_intent.id;
      }
      
      // Update the payment status
      await tx
        .update(tenderPayments)
        .set({
          status: 'succeeded',
          transactionId: transactionId,
          updatedAt: new Date(),
        })
        .where(eq(tenderPayments.id, paymentRecord.id));
      
      // Create a purchase record to grant access to documents
      await tx.insert(tenderDocumentPurchases).values({
        tenderId: tenderId,
        tenderPaymentId: paymentRecord.id,
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    console.log(`Successfully processed tender document purchase for tender: ${tenderId}`);
    return { success: true };
  } catch (error) {
    console.error('Error handling tender document purchase:', error);
    throw new Error('Failed to process tender document purchase completion');
  }
} 