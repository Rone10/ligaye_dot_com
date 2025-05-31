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

    console.log(`Received Stripe webhook: ${event.type}`);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        
        console.log(`Processing checkout session: ${session.id}`);
        console.log(`Payment status: ${session.payment_status}`);
        console.log(`Metadata:`, session.metadata);
        
        if (session.payment_status === 'paid') {
          const metadata = session.metadata;
          
          if (metadata?.purchaseType === 'TENDER_DOCUMENT') {
            console.log(`Processing tender document purchase for tender: ${metadata.tenderId}`);
            try {
              // Handle Tender Document Purchase
              await handleTenderDocumentPurchase(session);
              console.log(`Successfully processed tender document purchase`);
            } catch (error) {
              console.error('Error processing tender document purchase:', error);
              // Don't throw here to avoid webhook retry loops
              return NextResponse.json(
                { error: 'Failed to process tender document purchase' },
                { status: 500 }
              );
            }
          } else {
            console.log(`Processing job payment for session: ${session.id}`);
            try {
              // Existing job payment logic
              await handleSuccessfulPayment(session.id);
              console.log(`Successfully processed job payment`);
            } catch (error) {
              console.error('Error processing job payment:', error);
              // Don't throw here to avoid webhook retry loops
              return NextResponse.json(
                { error: 'Failed to process job payment' },
                { status: 500 }
              );
            }
          }
        } else {
          console.log(`Payment not completed, status: ${session.payment_status}`);
        }
        break;

      case 'payment_intent.succeeded':
        // This event can be used for additional payment confirmation if needed
        console.log('Payment succeeded:', event.data.object.id);
        break;

      case 'payment_intent.payment_failed':
        const paymentIntent = event.data.object;
        const paymentIntentId = paymentIntent.id;
        
        console.log(`Payment failed for intent: ${paymentIntentId}`);
        
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