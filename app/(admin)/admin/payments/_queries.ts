'use server'

import { eq, and, not, desc, asc, sql, or, inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import { payments, jobs, employerProfiles, profiles } from '@/lib/db/schema'
import type { Job, EmployerProfile, Profile } from '@/lib/db/schema'
import { getUser } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Define the structure for the unpaid jobs list item
export interface UnpaidJobListItem {
  job: Pick<Job, 'id' | 'title' | 'status' | 'createdAt'>;
  employer: Pick<EmployerProfile, 'id' | 'companyName'>;
  employerUser: Pick<Profile, 'fullName'>;
}

// Get unpaid jobs (DRAFT or PENDING_PAYMENT)
export async function getUnpaidJobs(
  sort: 'newest' | 'oldest' = 'newest'
): Promise<{ unpaidJobs?: UnpaidJobListItem[], error?: string }> {
  // Verify user is admin
  const user = await getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }
  if (user.user_metadata.role !== 'admin') {
    // Use redirect within the function for clarity
    redirect('/sign-in'); 
    // Although redirect throws an error, satisfy TypeScript return type
    return { error: 'Redirecting...' }; 
  }

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
          // profileId: employerProfiles.profileId // Not needed for display
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
      
    return { success: true };
  } catch (error) {
    console.error('Error updating job status in DB:', error);
    return { success: false, error: 'Database error updating job status.' };
  }
}

// Get job payment statistics for admin dashboard
export async function getJobPaymentStats(): Promise<{ stats?: { draft: number, pendingPayment: number, active: number }, error?: string }> {
  // Verify user is admin
  const user = await getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }
  const adminProfile = await db()
    .select({ role: profiles.role }) // Select only role
    .from(profiles)
    .where(and(
      eq(profiles.userId, user.id),
      eq(profiles.deleted, false)
    ))
    .limit(1)
    .then(res => res[0]); // Get first result or undefined

  if (!adminProfile || adminProfile.role !== 'admin') {
    return { error: 'Unauthorized. Admin access required.' }
  }
  
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