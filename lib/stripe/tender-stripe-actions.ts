import { db } from '@/lib/db';
import { tenderPayments, tenderDocumentPurchases } from '@/lib/db/schema';
import stripe from '@/lib/stripe';

export async function handleTenderDocumentPurchase(session: any) {
  try {
    console.log('Starting tender document purchase processing...');
    console.log('Session data:', {
      id: session.id,
      amount_total: session.amount_total,
      currency: session.currency,
      payment_status: session.payment_status,
      metadata: session.metadata
    });

    const metadata = session.metadata;
    const tenderId = metadata.tenderId;
    const purchaserFullName = metadata.purchaserFullName;
    const purchaserEmail = metadata.purchaserEmail;
    const purchaserPhone = metadata.purchaserPhone;

    console.log('Extracted metadata:', {
      tenderId,
      purchaserFullName,
      purchaserEmail,
      purchaserPhone
    });

    if (!tenderId || !purchaserFullName || !purchaserEmail) {
      const missingFields = [];
      if (!tenderId) missingFields.push('tenderId');
      if (!purchaserFullName) missingFields.push('purchaserFullName');
      if (!purchaserEmail) missingFields.push('purchaserEmail');
      
      throw new Error(`Missing required metadata for tender document purchase: ${missingFields.join(', ')}`);
    }

    // Get payment intent ID
    const paymentIntentId = typeof session.payment_intent === 'string' 
      ? session.payment_intent 
      : session.payment_intent?.id;

    console.log('Payment intent ID:', paymentIntentId);

    if (!paymentIntentId) {
      throw new Error('Missing payment intent ID');
    }

    // Record the purchase in database
    console.log('Starting database transaction...');
    const database = await db();
    await database.transaction(async (tx) => {
      console.log('Creating payment record...');
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

      console.log('Payment record created with ID:', payment.id);

      console.log('Creating purchase entitlement record...');
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

      console.log('Purchase entitlement record created');
    });

    console.log(`Tender document purchase completed successfully for tender ${tenderId}`);
  } catch (error) {
    console.error('Error handling tender document purchase:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      sessionId: session?.id,
      tenderId: session?.metadata?.tenderId
    });
    throw error;
  }
} 