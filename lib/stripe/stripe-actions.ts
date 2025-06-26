import stripe from './index';
import { db } from '@/lib/db';
import { and, eq } from 'drizzle-orm';
import { jobs, payments, profiles, employerProfiles } from '@/lib/db/schema';
import { recordCouponRedemption } from '@/app/(dashboard)/employer/jobs/new/_queries/coupon';

export interface CreateCheckoutSessionParams {
  jobId: string;
  employerProfileId: string;
  paymentAmount: number;
  currency: string;
  jobTitle: string;
  jobDuration: number;
  userId: string;
  couponId?: string;
  couponCode?: string;
  baseAmount?: number;
  discountAmount?: number;
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
  couponId,
  couponCode,
  baseAmount,
  discountAmount,
}: CreateCheckoutSessionParams) {
  try {
    // Build the base URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // Create the success URL that will close the window after processing
    const successUrl = `${baseUrl}/employer/jobs/payment-success?session_id={CHECKOUT_SESSION_ID}&auto_close=true`;
    
    // The cancel URL remains the same
    const cancelUrl = `${baseUrl}/employer/jobs/payment-cancel?job_id=${jobId}`;

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
        originUrl: baseUrl,
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
      couponId: couponId || null,
      metadata: JSON.stringify({
        jobTitle,
        duration: jobDuration,
        createdBy: userId,
        sessionId: session.id,
        baseAmount: baseAmount || paymentAmount,
        discountAmount: discountAmount || 0,
        couponCode: couponCode || null,
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
      // Find the payment record with employer profile info
      const paymentRecord = await tx
        .select({
          payment: payments,
          profileId: profiles.id
        })
        .from(payments)
        .innerJoin(employerProfiles, eq(employerProfiles.id, payments.employerProfileId))
        .innerJoin(profiles, eq(profiles.id, employerProfiles.profileId))
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
        .where(eq(payments.id, paymentRecord.payment.id));
      
      // Update the job status to ACTIVE
      await tx
        .update(jobs)
        .set({
          status: 'ACTIVE',
          publishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(jobs.id, jobId));
        
      // Record coupon redemption if a coupon was used
      if (paymentRecord.payment.couponId && paymentRecord.payment.metadata) {
        try {
          const metadata = JSON.parse(paymentRecord.payment.metadata);
          const baseAmount = metadata.baseAmount || paymentRecord.payment.amount;
          const discountAmount = metadata.discountAmount || 0;
          
          await recordCouponRedemption(
            paymentRecord.payment.couponId,
            paymentRecord.profileId,
            paymentRecord.payment.id,
            jobId,
            baseAmount,
            discountAmount,
            paymentRecord.payment.amount
          );
        } catch (error) {
          console.error('Error recording coupon redemption:', error);
          // Don't fail the payment if coupon redemption fails
        }
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error handling successful payment:', error);
    throw new Error('Failed to process payment completion');
  }
} 