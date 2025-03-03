'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import { 
  createProfile, 
  createCandidateProfile, 
  createEmployerProfile 
} from '@/lib/db/queries/profiles'
import { experienceLevelEnum } from '@/lib/db/schema'

// Type definitions for form data
type BasicProfileData = {
  fullName: string
  avatarUrl?: string
  role: 'candidate' | 'employer'
}

type CandidateProfileData = {
  jobTitle: string
  yearsOfExperience: string
  skills: string[]
  bio: string
}

type EmployerProfileData = {
  companyName: string
  companySize: string
  industry: string
  companyDescription: string
  companyWebsite: string
}

/**
 * Create a candidate profile
 */
export async function createCandidateProfileAction(
  basicData: BasicProfileData,
  candidateData: CandidateProfileData
) {
  try {
    // Get the authenticated user
    const user = await getUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Create the base profile
    const profileResult = await createProfile({
      userId: user.id,
      fullName: basicData.fullName,
      email: user.email || '',
      avatarUrl: basicData.avatarUrl || null,
      role: 'candidate',
    })

    if (!profileResult.success || !profileResult.data) {
      return { success: false, error: 'Failed to create base profile' }
    }

    // Create the candidate profile
    const candidateProfileResult = await createCandidateProfile({
      profileId: profileResult.data.id,
      title: candidateData.jobTitle,
      experienceLevel: determineExperienceLevel(parseInt(candidateData.yearsOfExperience)),
      skills: candidateData.skills,
      bio: candidateData.bio,
    })

    if (!candidateProfileResult.success) {
      return { success: false, error: 'Failed to create candidate profile' }
    }

    // Revalidate the profile page
    revalidatePath('/candidate/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error('Error in createCandidateProfileAction:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Create an employer profile
 */
export async function createEmployerProfileAction(
  basicData: BasicProfileData,
  employerData: EmployerProfileData
) {
  try {
    // Get the authenticated user
    const user = await getUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Create the base profile
    const profileResult = await createProfile({
      userId: user.id,
      fullName: basicData.fullName,
      email: user.email || '',
      avatarUrl: basicData.avatarUrl || null,
      role: 'employer',
    })

    if (!profileResult.success || !profileResult.data) {
      return { success: false, error: 'Failed to create base profile' }
    }

    // Create the employer profile
    const employerProfileResult = await createEmployerProfile({
      profileId: profileResult.data.id,
      companyName: employerData.companyName,
      companySize: employerData.companySize as any, // Type cast to match enum
      industry: employerData.industry,
      companyDescription: employerData.companyDescription || null,
      website: employerData.companyWebsite || null,
      location: 'Banjul', // Default location, should be updated to use actual location data
    })

    if (!employerProfileResult.success) {
      return { success: false, error: 'Failed to create employer profile' }
    }

    // Revalidate the profile page
    revalidatePath('/employer/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error('Error in createEmployerProfileAction:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Helper function to determine experience level based on years
 */
function determineExperienceLevel(years: number): typeof experienceLevelEnum.enumValues[number] {
  if (years < 1) return 'Entry'
  if (years < 3) return 'Junior'
  if (years < 5) return 'Mid-Level'
  if (years < 8) return 'Senior'
  if (years < 12) return 'Director'
  return 'Executive'
} 