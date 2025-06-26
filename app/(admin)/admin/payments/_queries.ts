'use server'

import { eq, and, not, desc, asc, sql, or, inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import { payments, jobs, employerProfiles, profiles } from '@/lib/db/schema'
import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import type { Job, EmployerProfile, Profile } from '@/lib/db/schema'
import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

import { recordCouponRedemption } from '@/app/(dashboard)/employer/jobs/new/_queries/coupon'

// Define the structure for the unpaid jobs list item
export interface UnpaidJobListItem {
  job: Pick<Job, 'id' | 'title' | 'status' | 'createdAt'>;
  employer: Pick<EmployerProfile, 'id' | 'companyName'>;
  employerUser: Pick<Profile, 'fullName'>;
}

// Cache tags for hierarchical invalidation
const CACHE_TAGS = {
  payment: (id: string) => `payment-${id}`,
  paymentCollection: 'payments-collection',
  adminPaymentData: 'admin-payment-data',
  unpaidJobs: 'unpaid-jobs',
  paymentStats: 'payment-stats',
  job: (id: string) => `job-${id}`,
  jobCollection: 'jobs-collection'
};

// Helper function to check if user is admin (outside cache scope)
async function checkAdminAccess(): Promise<boolean> {
  const user = await getUser()
  if (!user) return false
  
  if (user.user_metadata.role === 'admin') {
    return true
  }
  
  // Fallback check in database
  const adminProfile = await db()
    .select({ role: profiles.role })
    .from(profiles)
    .where(and(
      eq(profiles.userId, user.id),
      eq(profiles.deleted, false)
    ))
    .limit(1)
    .then(res => res[0])
  
  return adminProfile?.role === 'admin'
}

// Internal function for unpaid jobs without caching (no auth check inside)
async function getUnpaidJobsInternal(
  sort: 'newest' | 'oldest' = 'newest'
): Promise<{ unpaidJobs?: UnpaidJobListItem[], error?: string }> {
  try {
    const unpaidJobs = await db()
      .select({
        job: {
          id: jobs.id,
          title: jobs.title,
          status: jobs.status,
          createdAt: jobs.createdAt
        },
        employer: {
          id: employerProfiles.id,
          companyName: employerProfiles.companyName,
        },
        employerUser: {
          fullName: profiles.fullName
        }
      })
      .from(jobs)
      .innerJoin(employerProfiles, eq(jobs.companyId, employerProfiles.id))
      .innerJoin(profiles, eq(employerProfiles.profileId, profiles.id))
      .where(
        and(
          // Fetch jobs with status DRAFT or PENDING_PAYMENT
          inArray(jobs.status, ['DRAFT', 'PENDING_PAYMENT']), 
          not(eq(jobs.status, 'DELETED')), // Exclude explicitly deleted jobs
          eq(profiles.deleted, false) // Ensure employer profile is not deleted
        )
      )
      .orderBy(sort === 'newest' ? desc(jobs.createdAt) : asc(jobs.createdAt))
    
    return { unpaidJobs }
  } catch (error) {
    console.error('Error fetching unpaid jobs:', error)
    return { error: 'Failed to fetch unpaid jobs' }
  }
}

// Internal function for payment stats without caching (no auth check inside)
async function getJobPaymentStatsInternal(): Promise<{ stats?: { draft: number, pendingPayment: number, active: number }, error?: string }> {
  try {
    // Get job counts by status
    const jobCounts = await db()
      .select({
        status: jobs.status,
        count: sql<number>`count(*)`
      })
      .from(jobs)
      .where(
         // Only count relevant statuses, exclude DELETED
         inArray(jobs.status, ['DRAFT', 'PENDING_PAYMENT', 'ACTIVE']) 
      )
      .groupBy(jobs.status);

    // Process results into the desired structure
    const stats = {
      draft: 0,
      pendingPayment: 0,
      active: 0 // Added active count for context
    };

    for (const row of jobCounts) {
      if (row.status === 'DRAFT') {
        stats.draft = row.count;
      } else if (row.status === 'PENDING_PAYMENT') {
        stats.pendingPayment = row.count;
      } else if (row.status === 'ACTIVE') {
        stats.active = row.count;
      }
    }
    
    return { stats };

  } catch (error) {
    console.error('Error fetching job payment stats:', error)
    return { error: 'Failed to fetch job payment statistics' }
  }
}

// Public functions with auth checks outside cache scope
export const getUnpaidJobs = async (
  sort: 'newest' | 'oldest' = 'newest'
): Promise<{ unpaidJobs?: UnpaidJobListItem[], error?: string }> => {
  // Auth check outside cache scope
  const isAdmin = await checkAdminAccess()
  if (!isAdmin) {
    redirect('/sign-in')
    return { error: 'Redirecting...' }
  }

  // Cache the data fetching (without auth logic)
  const cachedFunction = unstable_cache(
    async () => getUnpaidJobsInternal(sort),
    [`unpaid-jobs-${sort}`],
    {
      tags: [CACHE_TAGS.unpaidJobs, CACHE_TAGS.adminPaymentData, CACHE_TAGS.jobCollection]
      // NO revalidate property = indefinite cache until tag invalidation
    }
  )
  
  return cachedFunction()
}

export const getJobPaymentStats = async (): Promise<{ stats?: { draft: number, pendingPayment: number, active: number }, error?: string }> => {
  // Auth check outside cache scope
  const isAdmin = await checkAdminAccess()
  if (!isAdmin) {
    return { error: 'Unauthorized. Admin access required.' }
  }

  // Cache the data fetching (without auth logic)
  const cachedFunction = unstable_cache(
    async () => getJobPaymentStatsInternal(),
    ['job-payment-stats'],
    {
      tags: [CACHE_TAGS.paymentStats, CACHE_TAGS.adminPaymentData, CACHE_TAGS.jobCollection]
      // NO revalidate property = indefinite cache until tag invalidation
    }
  )
  
  return cachedFunction()
}

// Request-level cache for repeated calls within same request
export const getUnpaidJobsCached = cache(getUnpaidJobs)
export const getJobPaymentStatsCached = cache(getJobPaymentStats)

// Approve a cash payment
export async function approveCashPayment(paymentId: string) {
  try {
    // Verify user is admin (outside any cache scope)
    const isAdmin = await checkAdminAccess()
    if (!isAdmin) {
      return { error: 'Unauthorized. Admin access required.' }
    }
    
    // Get payment and job information with employer profile
    const paymentInfo = await db()
      .select({
        payment: payments,
        jobId: jobs.id,
        profileId: profiles.id
      })
      .from(payments)
      .innerJoin(jobs, eq(payments.jobId, jobs.id))
      .innerJoin(employerProfiles, eq(employerProfiles.id, payments.employerProfileId))
      .innerJoin(profiles, eq(profiles.id, employerProfiles.profileId))
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
    const paymentRecord = paymentInfo[0]
    
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
        .where(eq(jobs.id, paymentRecord.jobId))
    })
    
    // Record coupon redemption if a coupon was used (outside transaction)
    if (paymentRecord.payment.couponId && paymentRecord.payment.metadata) {
      try {
        const metadata = JSON.parse(paymentRecord.payment.metadata)
        const baseAmount = metadata.baseAmount || paymentRecord.payment.amount
        const discountAmount = metadata.discountAmount || 0
        
        await recordCouponRedemption(
          paymentRecord.payment.couponId,
          paymentRecord.profileId,
          paymentRecord.payment.id,
          paymentRecord.jobId,
          baseAmount,
          discountAmount,
          paymentRecord.payment.amount
        )
      } catch (error) {
        console.error('Error recording coupon redemption:', error)
        // Don't fail the payment approval if coupon redemption fails
      }
    }
    
    // ON-DEMAND cache invalidation
    await invalidatePaymentCache(paymentId, paymentRecord.jobId)
    
    return { success: true }
  } catch (error) {
    console.error('Error approving cash payment:', error)
    return { error: 'Failed to approve payment' }
  }
}

// Reject a cash payment
export async function rejectCashPayment(paymentId: string) {
  try {
    // Verify user is admin (outside any cache scope)
    const isAdmin = await checkAdminAccess()
    if (!isAdmin) {
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
    
    // ON-DEMAND cache invalidation
    await invalidatePaymentCache(paymentId, paymentInfo[0].jobId)
    
    return { success: true }
  } catch (error) {
    console.error('Error rejecting cash payment:', error)
    return { error: 'Failed to reject payment' }
  }
}

// --- NEW FUNCTION to update job status directly ---
export async function updateJobStatusInDb(
  jobId: string, 
  newStatus: Job['status'] // Use indexed access type for status
): Promise<{ success: boolean, error?: string }> {
  try {
    const updateData: Partial<Job> = {
      status: newStatus,
      updatedAt: new Date(),
    };

    // Set publishedAt only if transitioning to ACTIVE
    if (newStatus === 'ACTIVE') {
      updateData.publishedAt = new Date();
    } else {
      // Ensure publishedAt is nullified if moving away from ACTIVE
      // This might need adjustment based on exact requirements for reactivation
      updateData.publishedAt = null; 
    }

    await db()
      .update(jobs)
      .set(updateData)
      .where(eq(jobs.id, jobId));
      
    // ON-DEMAND cache invalidation
    await invalidateJobCache(jobId)
      
    return { success: true };
  } catch (error) {
    console.error('Error updating job status in DB:', error);
    return { success: false, error: 'Database error updating job status.' };
  }
}

// Cache invalidation helpers - call these when data changes
export async function invalidatePaymentCache(paymentId?: string, jobId?: string) {
  const { revalidateTag } = await import('next/cache')
  
  const tags = [
    CACHE_TAGS.paymentCollection,
    CACHE_TAGS.adminPaymentData,
    CACHE_TAGS.unpaidJobs,
    CACHE_TAGS.paymentStats,
    CACHE_TAGS.jobCollection
  ]
  
  if (paymentId) {
    tags.push(CACHE_TAGS.payment(paymentId))
  }
  
  if (jobId) {
    tags.push(CACHE_TAGS.job(jobId))
  }
  
  await Promise.all(tags.map(tag => revalidateTag(tag)))
}

export async function invalidateJobCache(jobId: string) {
  const { revalidateTag } = await import('next/cache')
  
  await Promise.all([
    revalidateTag(CACHE_TAGS.job(jobId)),
    revalidateTag(CACHE_TAGS.jobCollection),
    revalidateTag(CACHE_TAGS.unpaidJobs),
    revalidateTag(CACHE_TAGS.paymentStats),
    revalidateTag(CACHE_TAGS.adminPaymentData)
  ])
} 