'use server'

import { redirect } from 'next/navigation'
import { handleSuccessfulPayment } from '@/lib/stripe/stripe-actions'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { jobs, payments } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function processPayment(sessionId: string) {
  try {
    if (!sessionId) {
      return { success: false, error: 'No session ID provided' }
    }
    
    // Find the payment record to get the job ID
    const paymentRecord = await db()
      .select({
        id: payments.id,
        jobId: payments.jobId,
      })
      .from(payments)
      .where(and(
        eq(payments.transactionId, sessionId),
        eq(payments.method, 'stripe'),
        eq(payments.deleted, false)
      ))
      .limit(1)
      .then(res => res[0])
    
    if (!paymentRecord) {
      return { success: false, error: 'Payment record not found' }
    }
    
    // Process the payment
    await handleSuccessfulPayment(sessionId)
    
    // Revalidate paths
    revalidatePath('/employer/jobs')
    
    // Return success with job ID
    return { 
      success: true, 
      message: 'Payment processed successfully',
      jobId: paymentRecord.jobId
    }
  } catch (error) {
    console.error('Error processing payment:', error)
    
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    
    return { success: false, error: 'Failed to process payment' }
  }
} 