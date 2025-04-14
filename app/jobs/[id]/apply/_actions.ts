'use server'

import { revalidatePath, revalidateTag } from "next/cache"
import { getUser } from "@/lib/supabase/server"
import { createClient } from "@/lib/supabase/server"
import { applicationFormSchema, type ApplicationFormValues } from "./_utils/validation"
import { insertApplication, checkExistingApplication } from "./_queries"
import { applicationStatusEnum } from "@/lib/db/schema"
import { v4 as uuidv4 } from "uuid"

interface ApplicationSubmissionParams {
  formData: ApplicationFormValues
  jobId: string
  candidateProfileId: string
  profileResumeUrl: string | null
  profileResumeFilename: string | null
}

export async function submitApplication({
  formData,
  jobId,
  candidateProfileId,
  profileResumeUrl,
  profileResumeFilename
}: ApplicationSubmissionParams) {
  try {
    // Validate user authentication
    const user = await getUser()
    if (!user) {
      return { success: false, error: "You must be logged in to apply" }
    }
    
    // Parse and validate form data
    const validatedData = applicationFormSchema.parse(formData)
    
    // Check if already applied
    const alreadyApplied = await checkExistingApplication(jobId, candidateProfileId)
    if (alreadyApplied) {
      return { success: false, error: "You have already applied for this job" }
    }
    
    // Initialize Supabase client for file uploads
    const supabase = await createClient()
    
    // Handle resume
    let resumeUrl = profileResumeUrl
    let resumeFilename = profileResumeFilename
    
    if (validatedData.resumeOption === "upload" && validatedData.resumeFile) {
      const file = validatedData.resumeFile
      const fileExt = file.name.split('.').pop()
      const fileName = `${uuidv4()}.${fileExt}`
      const filePath = `resumes/${candidateProfileId}/${jobId}/${fileName}`
      
      // Upload file to Supabase Storage
      const { data: resumeData, error: resumeError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file)
      
      if (resumeError) {
        console.log('Resume upload failed in submitApplication:', resumeError);
        return { success: false, error: "Failed to upload resume" }
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath)
      
      resumeUrl = publicUrl
      resumeFilename = file.name
    }
    
    // Handle cover letter
    let coverLetterUrl = null
    let coverLetterFilename = null
    let coverLetterText = null
    
    if (validatedData.coverLetterOption === "upload" && validatedData.coverLetterFile) {
      const file = validatedData.coverLetterFile
      const fileExt = file.name.split('.').pop()
      const fileName = `${uuidv4()}.${fileExt}`
      const filePath = `cover-letters/${candidateProfileId}/${jobId}/${fileName}`
      
      // Upload file to Supabase Storage
      const { data: clData, error: clError } = await supabase.storage
        .from('cover-letters')
        .upload(filePath, file)
      
      if (clError) {
        console.log('Cover letter upload failed in submitApplication:', clError);
        return { success: false, error: "Failed to upload cover letter" }
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('cover-letters')
        .getPublicUrl(filePath)
      
      coverLetterUrl = publicUrl
      coverLetterFilename = file.name
    } else if (validatedData.coverLetterOption === "text" && validatedData.coverLetterText) {
      coverLetterText = validatedData.coverLetterText
    }
    
    // Prepare application data
    const applicationData = {
      jobId,
      candidateProfileId,
      status: applicationStatusEnum.enumValues[0], // 'APPLIED'
      resumeUrl,
      resumeFilename,
      coverLetterUrl,
      coverLetterFilename,
      coverLetterText,
      appliedAt: new Date(),
      updatedAt: new Date(),
    }
    
    // Insert application record
    const result = await insertApplication(applicationData)
    
    // Revalidate related paths
    revalidatePath(`/jobs/${jobId}`)
    revalidatePath('/applications')
    revalidatePath('/dashboard/applications')
    revalidatePath('/candidate/applications')
    
    // Revalidate applications cache tag
    revalidateTag('applications')
    
    return result
  } catch (error) {
    console.error("Application submission error:", error)
    return { success: false, error: "Failed to submit application" }
  }
} 