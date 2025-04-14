'use server'

import { db } from '@/lib/db'
import { eq, and } from 'drizzle-orm'
import { applications, candidateProfiles, profiles } from '@/lib/db/schema'
import { getUser } from '@/lib/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * Withdraws a job application
 */
export async function withdrawApplication(applicationId: string) {
  const user = await getUser()
  
  if (!user) {
    return { success: false, error: 'User not authenticated' }
  }
  
  try {
    // First find the candidate profile ID for this user
    const candidateProfile = await db()
      .select({
        id: candidateProfiles.id
      })
      .from(candidateProfiles)
      .innerJoin(profiles, eq(candidateProfiles.profileId, profiles.id))
      .where(and(
        eq(profiles.userId, user.id),
        eq(candidateProfiles.deleted, false),
        eq(profiles.deleted, false)
      ))
      .limit(1)
      .then(res => res[0])
    
    if (!candidateProfile) {
      return { success: false, error: 'Candidate profile not found' }
    }
    
    // Verify application exists and belongs to this candidate
    const existingApplication = await db()
      .select({ id: applications.id })
      .from(applications)
      .where(and(
        eq(applications.id, applicationId),
        eq(applications.candidateProfileId, candidateProfile.id),
        eq(applications.deleted, false)
      ))
      .limit(1)
      .then(res => res[0])
    
    if (!existingApplication) {
      return { success: false, error: 'Application not found' }
    }
    
    // Update application status to WITHDRAWN
    await db()
      .update(applications)
      .set({
        status: 'WITHDRAWN',
        updatedAt: new Date()
      })
      .where(eq(applications.id, applicationId))
    
    // Revalidate the applications pages
    revalidatePath('/candidate/applications')
    revalidatePath(`/candidate/applications/${applicationId}`)
    
    // Revalidate the applications cache tag
    revalidateTag('applications')
    
    return { success: true }
  } catch (error) {
    console.error('Error withdrawing application:', error)
    return { success: false, error: 'Failed to withdraw application' }
  }
} 