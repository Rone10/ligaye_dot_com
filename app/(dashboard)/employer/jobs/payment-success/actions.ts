'use server'

import { handleSuccessfulPayment } from '@/lib/stripe/stripe-actions'
import { db } from '@/lib/db'
import { jobs, payments } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function processPayment(sessionId: string) {
  try {
    // Enhanced logging
    console.log(`Processing payment for session ID: ${sessionId}`)
    
    // First check if payment record exists
    const paymentRecord = await db()
      .select()
      .from(payments)
      .where(eq(payments.transactionId, sessionId))
      .limit(1)
      .then(res => res[0])
    
    if (!paymentRecord) {
      console.error(`Payment record not found for session ID: ${sessionId}`)
      return { success: false, error: 'Payment record not found' }
    }
    
    if (!paymentRecord.jobId) {
      console.error(`Job ID is missing in payment record for session ID: ${sessionId}`)
      return { success: false, error: 'Job ID is missing in payment record' }
    }
    
    console.log(`Found payment record for session ID: ${sessionId}, job ID: ${paymentRecord.jobId}`)
    
    // Now check job status
    const jobRecord = await db()
      .select({ id: jobs.id, status: jobs.status })
      .from(jobs)
      .where(eq(jobs.id, paymentRecord.jobId))
      .limit(1)
      .then(res => res[0])
    
    if (!jobRecord) {
      console.error(`Job record not found for payment with session ID: ${sessionId}`)
      return { success: false, error: 'Job record not found' }
    }
    
    console.log(`Current job status: ${jobRecord.status}`)
    
    // Process the payment if job is not already ACTIVE
    if (jobRecord.status !== 'ACTIVE') {
      await handleSuccessfulPayment(sessionId)
      console.log(`Payment successfully processed for session ID: ${sessionId}`)
      return { success: true }
    } else {
      console.log(`Job is already active for session ID: ${sessionId}`)
      return { success: true, message: 'Job is already active' }
    }
  } catch (error) {
    console.error('Error processing payment:', error)
    return { success: false, error: 'Failed to process payment' }
  }
} 