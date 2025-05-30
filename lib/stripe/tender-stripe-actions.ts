import { db } from '@/lib/db';
import { tenderPayments, tenderDocumentPurchases } from '@/lib/db/schema';
import stripe from '@/lib/stripe';

export async function handleTenderDocumentPurchase(session: any) {
  try {
    const metadata = session.metadata;
    const tenderId = metadata.tenderId;
    const purchaserFullName = metadata.purchaserFullName;
    const purchaserEmail = metadata.purchaserEmail;
    const purchaserPhone = metadata.purchaserPhone;

    if (!tenderId || !purchaserFullName || !purchaserEmail) {
      throw new Error('Missing required metadata for tender document purchase');
    }

    // Get payment intent ID
    const paymentIntentId = typeof session.payment_intent === 'string' 
      ? session.payment_intent 
      : session.payment_intent?.id;

    if (!paymentIntentId) {
      throw new Error('Missing payment intent ID');
    }

    // Record the purchase in database
    const database = await db();
    await database.transaction(async (tx) => {
      // Create payment record
      const [payment] = await tx
        .insert(tenderPayments)
        .values({
          tenderId,
          amount: session.amount_total,
          currency: session.currency.toUpperCase(),
          method: 'stripe',
          status: 'succeeded',
          transactionId: paymentIntentId,
          stripeSessionId: session.id,
          purchaserFullName,
          purchaserEmail,
          purchaserPhone: purchaserPhone || null,
          deleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning({ id: tenderPayments.id });

      // Create purchase entitlement record
      await tx
        .insert(tenderDocumentPurchases)
        .values({
          tenderId,
          tenderPaymentId: payment.id,
          deleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
    });

    console.log(`Tender document purchase completed for tender ${tenderId}`);
  } catch (error) {
    console.error('Error handling tender document purchase:', error);
    throw error;
  }
} 