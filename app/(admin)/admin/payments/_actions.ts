'use server'

import { approveCashPayment, rejectCashPayment } from './_queries'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { redirect } from 'next/navigation'
import { eq, and } from 'drizzle-orm'
import { db } from '@/lib/db'
import { getUser } from '@/lib/supabase/server'
import { profiles, jobs, jobStatusEnum } from '@/lib/db/schema'
import type { Job } from '@/lib/db/schema'
import { updateJobStatusInDb } from './_queries'

// Server action to approve a cash payment
export async function handleApproveCashPayment(formData: FormData) {
  try {
    // Get payment ID from form data
    const paymentId = formData.get('paymentId') as string
    
    if (!paymentId) {
      return { error: 'Payment ID is required' }
    }
    
    // Approve the payment
    const result = await approveCashPayment(paymentId)
    
    if (result.error) {
      return { error: result.error }
    }
    
    // Revalidate the payments page
    revalidatePath('/admin/payments')
    
    return { success: true, message: 'Payment approved successfully' }
  } catch (error) {
    console.error('Error approving payment:', error)
    return { error: 'Failed to approve payment' }
  }
}

// Server action to reject a cash payment
export async function handleRejectCashPayment(formData: FormData) {
  try {
    // Get payment ID from form data
    const paymentId = formData.get('paymentId') as string
    
    if (!paymentId) {
      return { error: 'Payment ID is required' }
    }
    
    // Reject the payment
    const result = await rejectCashPayment(paymentId)
    
    if (result.error) {
      return { error: result.error }
    }
    
    // Revalidate the payments page
    revalidatePath('/admin/payments')
    
    return { success: true, message: 'Payment rejected successfully' }
  } catch (error) {
    console.error('Error rejecting payment:', error)
    return { error: 'Failed to reject payment' }
  }
}

// Define schema for input validation
const updateJobStatusSchema = z.object({
  jobId: z.string().uuid({ message: 'Invalid Job ID' }),
  newStatus: z.enum(jobStatusEnum.enumValues, { message: 'Invalid Job Status' })
})

export async function updateJobStatus(
  formData: FormData
): Promise<{ success: boolean; error?: string; message?: string }> {
  
  // --- Authentication and Authorization ---
  const user = await getUser();
  if (!user) {
    redirect('/sign-in'); // Redirect unauthenticated users
  }

  // Verify user is admin
  const adminProfile = await db()
    .select({ role: profiles.role })
    .from(profiles)
    .where(and(eq(profiles.userId, user.id), eq(profiles.deleted, false)))
    .limit(1)
    .then(res => res[0]);

  if (!adminProfile || adminProfile.role !== 'admin') {
    return { success: false, error: 'Unauthorized: Admin access required.' };
  }

  // --- Input Validation ---
  const rawFormData = {
    jobId: formData.get('jobId'),
    newStatus: formData.get('newStatus'),
  };
  
  const validation = updateJobStatusSchema.safeParse(rawFormData);
  if (!validation.success) {
    // Combine specific zod errors into a single message if needed, or just take the first
    const errorMessage = validation.error.errors.map(e => e.message).join(', ');
    return { success: false, error: `Invalid input: ${errorMessage}` };
  }

  const { jobId, newStatus } = validation.data;

  // --- Database Operation ---
  try {
    const result = await updateJobStatusInDb(jobId, newStatus);
    if (!result.success) {
      return { success: false, error: result.error || 'Failed to update job status in database.' };
    }

    // --- Revalidation and Response ---
    revalidatePath('/admin/payments'); // Revalidate the page where the table is
    return { success: true, message: `Job status updated to ${newStatus}.` };

  } catch (error) {
    console.error("Error in updateJobStatus action:", error);
    // Generic error for unexpected issues
    return { success: false, error: 'An unexpected error occurred.' };
  }
} 