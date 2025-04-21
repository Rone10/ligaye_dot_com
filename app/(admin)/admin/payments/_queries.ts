'use server'

import { eq, and, not, desc, asc, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { payments, jobs, employerProfiles, profiles } from '@/lib/db/schema'
import { getUser } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
// Get pending cash payments for admin
export async function getPendingCashPayments(
  sort: 'newest' | 'oldest' = 'newest'
) {
      // Verify user is admin
      const user = await getUser()
      if (!user) {
        return { error: 'Unauthorized' }
      }
      
    if (user.user_metadata.role !== 'admin') {
      redirect('/sign-in')
    }
  try {
    // Get all pending cash payments with related job and employer information
    const pendingPayments = await db()
      .select({
        payment: {
          id: payments.id,
          amount: payments.amount,
          currency: payments.currency,
          method: payments.method,
          status: payments.status,
          createdAt: payments.createdAt,
          updatedAt: payments.updatedAt
        },
        job: {
          id: jobs.id,
          title: jobs.title,
          status: jobs.status
        },
        employer: {
          id: employerProfiles.id,
          companyName: employerProfiles.companyName,
          profileId: employerProfiles.profileId
        },
        employerUser: {
          fullName: profiles.fullName
        }
      })
      .from(payments)
      .innerJoin(jobs, eq(payments.jobId, jobs.id))
      .innerJoin(employerProfiles, eq(payments.employerProfileId, employerProfiles.id))
      .innerJoin(profiles, eq(employerProfiles.profileId, profiles.id))
      .where(and(
        eq(payments.method, 'cash'),
        eq(payments.status, 'pending'),
        eq(jobs.status, 'PENDING_PAYMENT'),
        eq(payments.deleted, false),
        not(eq(jobs.status, 'DELETED'))
      ))
      .orderBy(sort === 'newest' ? desc(payments.createdAt) : asc(payments.createdAt))
    
    return { pendingPayments }
  } catch (error) {
    console.error('Error fetching pending cash payments:', error)
    return { error: 'Failed to fetch pending payments' }
  }
}

// Approve a cash payment
export async function approveCashPayment(paymentId: string) {
  try {
    // Verify user is admin
    const user = await getUser()
    if (!user) {
      return { error: 'Unauthorized' }
    }
    
    const adminProfile = await db()
      .select()
      .from(profiles)
      .where(and(
        eq(profiles.userId, user.id),
        eq(profiles.deleted, false)
      ))
      .limit(1)
    
    if (!adminProfile.length || adminProfile[0].role !== 'admin') {
      return { error: 'Unauthorized. Admin access required.' }
    }
    
    // Get payment and job information
    const paymentInfo = await db()
      .select({
        paymentId: payments.id,
        jobId: jobs.id
      })
      .from(payments)
      .innerJoin(jobs, eq(payments.jobId, jobs.id))
      .where(and(
        eq(payments.id, paymentId),
        eq(payments.method, 'cash'),
        eq(payments.status, 'pending'),
        eq(jobs.status, 'PENDING_PAYMENT')
      ))
      .limit(1)
    
    if (!paymentInfo.length) {
      return { error: 'Payment not found or already processed' }
    }
    
    // Run transaction to update both payment and job status
    await db().transaction(async (tx) => {
      // Update payment status to succeeded
      await tx
        .update(payments)
        .set({
          status: 'succeeded',
          updatedAt: new Date()
        })
        .where(eq(payments.id, paymentId))
      
      // Update job status to ACTIVE and set publishedAt
      await tx
        .update(jobs)
        .set({
          status: 'ACTIVE',
          publishedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(jobs.id, paymentInfo[0].jobId))
    })
    
    revalidatePath('/admin/payments')
    return { success: true }
  } catch (error) {
    console.error('Error approving cash payment:', error)
    return { error: 'Failed to approve payment' }
  }
}

// Reject a cash payment
export async function rejectCashPayment(paymentId: string) {
  try {
    // Verify user is admin
    const user = await getUser()
    if (!user) {
      return { error: 'Unauthorized' }
    }
    
    const adminProfile = await db()
      .select()
      .from(profiles)
      .where(and(
        eq(profiles.userId, user.id),
        eq(profiles.deleted, false)
      ))
      .limit(1)
    
    if (!adminProfile.length || adminProfile[0].role !== 'admin') {
      return { error: 'Unauthorized. Admin access required.' }
    }
    
    // Get payment and job information
    const paymentInfo = await db()
      .select({
        paymentId: payments.id,
        jobId: jobs.id
      })
      .from(payments)
      .innerJoin(jobs, eq(payments.jobId, jobs.id))
      .where(and(
        eq(payments.id, paymentId),
        eq(payments.method, 'cash'),
        eq(payments.status, 'pending'),
        eq(jobs.status, 'PENDING_PAYMENT')
      ))
      .limit(1)
    
    if (!paymentInfo.length) {
      return { error: 'Payment not found or already processed' }
    }
    
    // Run transaction to update both payment and job status
    await db().transaction(async (tx) => {
      // Update payment status to failed
      await tx
        .update(payments)
        .set({
          status: 'failed',
          updatedAt: new Date()
        })
        .where(eq(payments.id, paymentId))
      
      // Update job status to DRAFT
      await tx
        .update(jobs)
        .set({
          status: 'DRAFT',
          updatedAt: new Date()
        })
        .where(eq(jobs.id, paymentInfo[0].jobId))
    })
    
    revalidatePath('/admin/payments')
    return { success: true }
  } catch (error) {
    console.error('Error rejecting cash payment:', error)
    return { error: 'Failed to reject payment' }
  }
}

// Get payment statistics for admin dashboard
export async function getPaymentStats() {
  try {
    // Verify user is admin
    const user = await getUser()
    if (!user) {
      return { error: 'Unauthorized' }
    }
    
    const adminProfile = await db()
      .select()
      .from(profiles)
      .where(and(
        eq(profiles.userId, user.id),
        eq(profiles.deleted, false)
      ))
      .limit(1)
    
    if (!adminProfile.length || adminProfile[0].role !== 'admin') {
      return { error: 'Unauthorized. Admin access required.' }
    }
    
    // Get payment counts by status and method
    const [pendingCashCount, totalSucceededCount, totalFailedCount] = await Promise.all([
      // Pending cash payments count - NOW CHECKS JOB STATUS
      db()
        .select({
          count: sql<number>`count(DISTINCT ${payments.id})` // Use DISTINCT in case of potential join issues (though unlikely here)
        })
        .from(payments)
        .innerJoin(jobs, eq(payments.jobId, jobs.id)) // JOIN with jobs table
        .where(and(
          eq(payments.method, 'cash'),
          eq(payments.status, 'pending'),
          eq(jobs.status, 'PENDING_PAYMENT'), // ADDED: Check job status
          eq(payments.deleted, false),
          not(eq(jobs.status, 'DELETED')) // Keep this check
        ))
        .then(result => result[0]?.count || 0),
      
      // Total succeeded payments count
      db()
        .select({
          count: sql<number>`count(*)`
        })
        .from(payments)
        .where(and(
          eq(payments.status, 'succeeded'),
          eq(payments.deleted, false)
        ))
        .then(result => result[0]?.count || 0),
      
      // Total failed payments count
      db()
        .select({
          count: sql<number>`count(*)`
        })
        .from(payments)
        .where(and(
          eq(payments.status, 'failed'),
          eq(payments.deleted, false)
        ))
        .then(result => result[0]?.count || 0)
    ])
    
    return {
      stats: {
        pendingCash: pendingCashCount,
        succeeded: totalSucceededCount,
        failed: totalFailedCount
      }
    }
  } catch (error) {
    console.error('Error fetching payment stats:', error)
    return { error: 'Failed to fetch payment statistics' }
  }
} 