import { redirect } from 'next/navigation';
import stripe from './index';
import { db } from '@/lib/db';
import { and, eq } from 'drizzle-orm';
import { jobs, payments } from '@/lib/db/schema';

export interface CreateCheckoutSessionParams {
  jobId: string;
  employerProfileId: string;
  paymentAmount: number;
  currency: string;
  jobTitle: string;
  jobDuration: number;
  userId: string;
}

/**
 * Creates a Stripe checkout session for a job posting payment
 */
export async function createStripeCheckoutSession({
  jobId,
  employerProfileId,
  paymentAmount,
  currency = 'USD',
  jobTitle,
  jobDuration,
  userId,
}: CreateCheckoutSessionParams) {
  try {
    // Create the success and cancel URLs
    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/employer/jobs/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/employer/jobs/payment-cancel?job_id=${jobId}`;

    // Create the Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `Job Posting: ${jobTitle}`,
              description: `${jobDuration} month job posting`,
            },
            unit_amount: paymentAmount, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        jobId,
        employerProfileId,
        type: 'job_posting',
      },
    });

    // Create a pending payment record in the database
    await db().insert(payments).values({
      jobId,
      employerProfileId,
      amount: paymentAmount,
      currency,
      method: 'stripe',
      status: 'pending',
      transactionId: session.id,
      metadata: JSON.stringify({
        jobTitle,
        duration: jobDuration,
        createdBy: userId,
        sessionId: session.id,
      }),
      deleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Return the session URL
    if (!session.url) {
      throw new Error('Failed to generate Stripe checkout URL');
    }

    return { sessionUrl: session.url, sessionId: session.id };
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    throw new Error('Failed to create checkout session');
  }
}

/**
 * Handles a successful Stripe payment completion
 */
export async function handleSuccessfulPayment(sessionId: string) {
  try {
    // Retrieve the session from Stripe to get the metadata
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session?.metadata?.jobId) {
      throw new Error('Missing job ID in Stripe session metadata');
    }

    const jobId = session.metadata.jobId;
    
    // Update the payment record in the database
    await db().transaction(async (tx) => {
      // Find the payment record
      const paymentRecord = await tx
        .select()
        .from(payments)
        .where(and(
          eq(payments.transactionId, sessionId),
          eq(payments.method, 'stripe'),
          eq(payments.status, 'pending'),
          eq(payments.deleted, false)
        ))
        .limit(1)
        .then(res => res[0]);
      
      if (!paymentRecord) {
        throw new Error('Payment record not found for this session');
      }
      
      // Update the payment status
      await tx
        .update(payments)
        .set({
          status: 'succeeded',
          updatedAt: new Date(),
        })
        .where(eq(payments.id, paymentRecord.id));
      
      // Update the job status to ACTIVE
      await tx
        .update(jobs)
        .set({
          status: 'ACTIVE',
          publishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(jobs.id, jobId));
    });

    return { success: true };
  } catch (error) {
    console.error('Error handling successful payment:', error);
    throw new Error('Failed to process payment completion');
  }
} 