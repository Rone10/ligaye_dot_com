import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import stripe from '@/lib/stripe';
import { handleSuccessfulPayment } from '@/lib/stripe/stripe-actions';
import { handleTenderDocumentPurchase } from '@/lib/stripe/tender-stripe-actions';
import { db } from '@/lib/db';
import { payments, jobs } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    return NextResponse.json(
      { error: 'Webhook secret is not set' },
      { status: 500 }
    );
  }

  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify the event came from Stripe
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        
        if (session.payment_status === 'paid') {
          const metadata = session.metadata;
          
          if (metadata?.purchaseType === 'TENDER_DOCUMENT') {
            // Handle Tender Document Purchase
            await handleTenderDocumentPurchase(session);
          } else {
            // Existing job payment logic
            await handleSuccessfulPayment(session.id);
          }
        }
        break;

      case 'payment_intent.succeeded':
        // This event can be used for additional payment confirmation if needed
        console.log('Payment succeeded:', event.data.object);
        break;

      case 'payment_intent.payment_failed':
        const paymentIntent = event.data.object;
        const paymentIntentId = paymentIntent.id;
        
        // Handle failed payment by updating records
        await db().transaction(async (tx) => {
          // Find the payment record with this transaction ID
          const payment = await tx
            .select()
            .from(payments)
            .where(and(
              eq(payments.transactionId, paymentIntentId),
              eq(payments.deleted, false)
            ))
            .limit(1)
            .then(res => res[0]);
          
          if (payment) {
            // Update payment status to failed
            await tx
              .update(payments)
              .set({
                status: 'failed',
                updatedAt: new Date(),
              })
              .where(eq(payments.id, payment.id));
            
            // If job status is PENDING_PAYMENT, revert it to DRAFT
            if (payment.jobId) {
              await tx
                .update(jobs)
                .set({
                  status: 'DRAFT',
                  updatedAt: new Date(),
                })
                .where(and(
                  eq(jobs.id, payment.jobId),
                  eq(jobs.status, 'PENDING_PAYMENT')
                ));
            }
          }
        });
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
} 