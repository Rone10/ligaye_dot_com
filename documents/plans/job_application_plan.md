# Job Application Feature Implementation Plan

## Overview

This plan details the implementation of the Job Application feature for Ligaye.com, allowing logged-in candidates to apply for specific jobs. Following the Vertical Slice Architecture (VSA) principles, all components, actions, and queries will be organized within their respective route segments.

## 1. Architecture Structure

```
app/
└── jobs/
    └── [id]/
        ├── page.tsx              # Job detail page with "Apply" button
        ├── _components/
        │   └── JobActionButton.tsx  # Component containing the Apply button
        │
        └── apply/                # Application feature slice
            ├── page.tsx          # Server Component (protected) rendering application form
            ├── loading.tsx       # Loading state for application page
            ├── error.tsx         # Error handling for application page
            ├── _components/      # Client components for application slice
            │   ├── ApplicationForm.tsx          # Main application form
            │   ├── ResumeSelection.tsx          # Resume selection component
            │   ├── CoverLetterSelection.tsx     # Cover letter selection component
            │   └── ApplicationSuccessModal.tsx  # Success modal component
            ├── _actions.ts       # Server Action for form submission
            ├── _queries.ts       # Database queries specific to application process
            └── _utils/
                └── validation.ts  # Zod validation schemas for application form
```

## 2. Implementation Steps

### 2.1. Trigger: Apply Button on Job Detail Page

#### 2.1.1. Location: `app/jobs/[id]/_components/JobActionButton.tsx`

Create a client component containing the application trigger button:

```typescript
'use client'

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { applicationMethodEnum } from "@/lib/db/schema"

interface JobActionButtonProps {
  id: string
  applicationMethod: typeof applicationMethodEnum.enumValues[number]
  isLoggedIn: boolean
  userRole: string | null
}

export function JobActionButton({ 
  id, 
  applicationMethod, 
  isLoggedIn, 
  userRole 
}: JobActionButtonProps) {
  const router = useRouter()
  
  const handleApply = () => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=/jobs/${id}/apply`)
      return
    }
    
    router.push(`/jobs/${id}/apply`)
  }
  
  // Only show apply button if application via platform is allowed
  if (applicationMethod !== 'PLATFORM') {
    return null
  }
  
  return (
    <Button 
      className="w-full md:w-auto" 
      onClick={handleApply}
      disabled={userRole !== 'candidate' && isLoggedIn}
    >
      Apply Now
    </Button>
  )
}
```

#### 2.1.2. Modify: `app/jobs/[id]/page.tsx`

Update the job detail page to include the Apply button component:

```typescript
// Import the JobActionButton
import { JobActionButton } from "./_components/JobActionButton"
import { getUser } from "@/lib/supabase/server"

// Within the page component:
export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const id = await params.id
  const user = await getUser()
  
  // Fetch job details using existing _queries.ts function
  const job = await getJobByid(id)
  
  if (!job) {
    notFound()
  }
  
  // Render the page with the apply button
  return (
    // ...existing job detail display
    <div className="mt-6">
      <JobActionButton 
        id={id}
        applicationMethod={job.applicationMethod}
        isLoggedIn={!!user}
        userRole={user?.role}
      />
    </div>
    // ...
  )
}
```

### 2.2. Application Page Implementation

#### 2.2.1. Create: `app/jobs/[id]/apply/page.tsx`

Create the Server Component for the application page:

```typescript
import { redirect } from "next/navigation"
import { getUser } from "@/lib/supabase/server"
import { ApplicationForm } from "./_components/ApplicationForm"
import { getApplicationContextData } from "./_queries"

export default async function ApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const id = await params.id
  const user = await getUser()
  
  // Redirect if not logged in
  if (!user) {
    redirect(`/login?redirect=/jobs/${id}/apply`)
  }
  
  // Redirect if not a candidate
  if (user.role !== 'candidate') {
    redirect(`/jobs/${id}?error=notCandidate`)
  }
  
  // Fetch application context data (job and candidate info)
  const { job, candidateProfile } = await getApplicationContextData(id, user.id)
  
  // Redirect if job not found
  if (!job) {
    redirect('/jobs?error=jobNotFound')
  }
  
  // Redirect if job doesn't allow platform applications
  if (job.applicationMethod !== 'PLATFORM') {
    redirect(`/jobs/${id}?error=externalApplication`)
  }
  
  return (
    <div className="container max-w-3xl mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">Apply for: {job.title}</h1>
        <p className="text-gray-dark">at {job.companyName}</p>
      </div>
      
      <ApplicationForm 
        job={job}
        candidateProfile={candidateProfile}
      />
    </div>
  )
}
```

#### 2.2.2. Create: `app/jobs/[id]/apply/_queries.ts`

Create the queries for the application slice:

```typescript
import { db } from "@/lib/db"
import { 
  jobs, 
  employerProfiles,
  candidateProfiles,
  profiles,
  applications,
  type NewApplication
} from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

// Get job and candidate data for application context
export async function getApplicationContextData(
  id: string, 
  userId: string
) {
  // Get job with company information
  const result = await db()
    .select({
      job: {
        id: jobs.id,
        title: jobs.title,
        id: jobs.id,
        applicationMethod: jobs.applicationMethod,
        resumeRequired: jobs.resumeRequired,
      },
      companyName: employerProfiles.companyName,
    })
    .from(jobs)
    .leftJoin(employerProfiles, eq(jobs.companyId, employerProfiles.id))
    .where(eq(jobs.id, id))
    .limit(1)
  
  const jobData = result[0]
  
  // Get candidate profile
  const candidateResult = await db()
    .select({
      id: candidateProfiles.id,
      resumeUrl: candidateProfiles.resumeUrl,
      resumeFilename: candidateProfiles.resumeFilename,
    })
    .from(candidateProfiles)
    .leftJoin(profiles, eq(candidateProfiles.profileId, profiles.id))
    .where(eq(profiles.userId, userId))
    .limit(1)
  
  const candidateProfile = candidateResult[0]
  
  // Check if user already applied
  let existingApplication = null
  if (jobData && candidateProfile) {
    const applicationResult = await db()
      .select({
        id: applications.id,
        status: applications.status,
      })
      .from(applications)
      .where(
        and(
          eq(applications.jobId, jobData.job.id),
          eq(applications.candidateProfileId, candidateProfile.id)
        )
      )
      .limit(1)
    
    existingApplication = applicationResult[0] || null
  }
  
  return {
    job: jobData ? {
      ...jobData.job,
      companyName: jobData.companyName,
    } : null,
    candidateProfile,
    existingApplication
  }
}

// Insert application
export async function insertApplication(data: NewApplication) {
  try {
    const result = await db()
      .insert(applications)
      .values(data)
      .returning({ id: applications.id })
    
    return { success: true, data: result[0] }
  } catch (error: any) {
    // Handle unique constraint violation
    if (error.code === '23505') { // PostgreSQL unique violation
      return { 
        success: false, 
        error: 'You have already applied for this job' 
      }
    }
    
    return { 
      success: false, 
      error: 'Failed to submit application' 
    }
  }
}

// Check if a candidate has already applied to a job
export async function checkExistingApplication(
  jobId: string, 
  candidateProfileId: string
) {
  const result = await db()
    .select({ id: applications.id })
    .from(applications)
    .where(
      and(
        eq(applications.jobId, jobId),
        eq(applications.candidateProfileId, candidateProfileId)
      )
    )
    .limit(1)
  
  return result.length > 0
}
```

#### 2.2.3. Create: `app/jobs/[id]/apply/_utils/validation.ts`

Create the validation schema for the application form:

```typescript
import { z } from "zod"

// Define allowed file types
const ALLOWED_RESUME_TYPES = [
  "application/pdf", 
  "application/msword", 
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// Validation schema for the application form
export const applicationFormSchema = z.object({
  // Resume selection
  resumeOption: z.enum(["profile", "upload"]),
  resumeFile: z.instanceof(File)
    .refine(file => file.size === 0 || file.size <= MAX_FILE_SIZE, {
      message: `File size must be less than 5MB`,
    })
    .refine(file => file.size === 0 || ALLOWED_RESUME_TYPES.includes(file.type), {
      message: "File must be a PDF or Word document",
    })
    .optional()
    .nullable(),
  
  // Cover letter selection
  coverLetterOption: z.enum(["none", "upload", "text"]),
  coverLetterFile: z.instanceof(File)
    .refine(file => file.size === 0 || file.size <= MAX_FILE_SIZE, {
      message: `File size must be less than 5MB`,
    })
    .refine(file => file.size === 0 || ALLOWED_RESUME_TYPES.includes(file.type), {
      message: "File must be a PDF or Word document",
    })
    .optional()
    .nullable(),
  coverLetterText: z.string().max(5000).optional(),
})

export type ApplicationFormValues = z.infer<typeof applicationFormSchema>
```

#### 2.2.4. Create: `app/jobs/[id]/apply/_components/ApplicationForm.tsx`

Create the main application form component:

```typescript
'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Card } from "@/components/ui/card"
import { applicationFormSchema, type ApplicationFormValues } from "../_utils/validation"
import { ResumeSelection } from "./ResumeSelection"
import { CoverLetterSelection } from "./CoverLetterSelection"
import { ApplicationSuccessModal } from "./ApplicationSuccessModal"
import { submitApplication } from "../_actions"

interface ApplicationFormProps {
  job: {
    id: string
    title: string
    companyName: string
    resumeRequired: boolean
  }
  candidateProfile: {
    id: string
    resumeUrl: string | null
    resumeFilename: string | null
  }
}

export function ApplicationForm({ job, candidateProfile }: ApplicationFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  
  // Initialize form with default values
  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      resumeOption: candidateProfile.resumeUrl ? "profile" : "upload",
      resumeFile: null,
      coverLetterOption: "none",
      coverLetterFile: null,
      coverLetterText: "",
    }
  })
  
  // Get form values for conditional rendering
  const resumeOption = form.watch("resumeOption")
  const coverLetterOption = form.watch("coverLetterOption")
  
  // Handle form submission
  const onSubmit = async (data: ApplicationFormValues) => {
    setIsSubmitting(true)
    setSubmitError(null)
    
    try {
      // Call the server action with form data and IDs
      const result = await submitApplication({
        formData: data,
        jobId: job.id,
        candidateProfileId: candidateProfile.id,
        profileResumeUrl: candidateProfile.resumeUrl,
        profileResumeFilename: candidateProfile.resumeFilename,
      })
      
      if (result.success) {
        setShowSuccessModal(true)
      } else {
        setSubmitError(result.error || "Failed to submit application")
      }
    } catch (error) {
      setSubmitError("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Handle modal close
  const handleModalClose = () => {
    setShowSuccessModal(false)
    router.push(`/jobs/${job.id}?applied=true`)
  }
  
  return (
    <>
      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Resume section */}
            <ResumeSelection
              form={form}
              resumeOption={resumeOption}
              profileResumeFilename={candidateProfile.resumeFilename}
              isRequired={job.resumeRequired}
            />
            
            {/* Cover letter section */}
            <CoverLetterSelection
              form={form}
              coverLetterOption={coverLetterOption}
            />
            
            {/* Error message */}
            {submitError && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 text-red-700">
                {submitError}
              </div>
            )}
            
            {/* Submit button */}
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="px-8"
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </Form>
      </Card>
      
      {/* Success modal */}
      <ApplicationSuccessModal
        isOpen={showSuccessModal}
        onClose={handleModalClose}
        jobTitle={job.title}
        companyName={job.companyName}
      />
    </>
  )
}
```

#### 2.2.5. Create: `app/jobs/[id]/apply/_components/ResumeSelection.tsx`

Create the resume selection component:

```typescript
'use client'

import { UseFormReturn } from "react-hook-form"
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel,
  FormMessage 
} from "@/components/ui/form"
import { 
  RadioGroup, 
  RadioGroupItem 
} from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ApplicationFormValues } from "../_utils/validation"

interface ResumeSelectionProps {
  form: UseFormReturn<ApplicationFormValues>
  resumeOption: string
  profileResumeFilename: string | null
  isRequired: boolean
}

export function ResumeSelection({ 
  form, 
  resumeOption, 
  profileResumeFilename,
  isRequired
}: ResumeSelectionProps) {
  // Determine if profile resume exists
  const hasProfileResume = !!profileResumeFilename
  
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Resume</h2>
      
      <FormField
        control={form.control}
        name="resumeOption"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                {hasProfileResume && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="profile" id="profile" />
                    <Label htmlFor="profile" className="cursor-pointer">
                      Use profile resume ({profileResumeFilename})
                    </Label>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="upload" id="upload" />
                  <Label htmlFor="upload" className="cursor-pointer">
                    Upload a new resume
                  </Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Show file upload input when "upload" is selected */}
      {resumeOption === "upload" && (
        <FormField
          control={form.control}
          name="resumeFile"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  type="file"
                  accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => onChange(e.target.files?.[0] || null)}
                  required={isRequired}
                  className="cursor-pointer"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  )
}
```

#### 2.2.6. Create: `app/jobs/[id]/apply/_components/CoverLetterSelection.tsx`

Create the cover letter selection component:

```typescript
'use client'

import { UseFormReturn } from "react-hook-form"
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel,
  FormMessage 
} from "@/components/ui/form"
import { 
  RadioGroup, 
  RadioGroupItem 
} from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ApplicationFormValues } from "../_utils/validation"
import { RichTextEditor } from "@/components/RichTextEditor/editor"

interface CoverLetterSelectionProps {
  form: UseFormReturn<ApplicationFormValues>
  coverLetterOption: string
}

export function CoverLetterSelection({ 
  form, 
  coverLetterOption 
}: CoverLetterSelectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Cover Letter (Optional)</h2>
      
      <FormField
        control={form.control}
        name="coverLetterOption"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="none" />
                  <Label htmlFor="none" className="cursor-pointer">
                    No cover letter
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="upload" id="cl-upload" />
                  <Label htmlFor="cl-upload" className="cursor-pointer">
                    Upload cover letter file
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="text" id="cl-text" />
                  <Label htmlFor="cl-text" className="cursor-pointer">
                    Write/paste cover letter text
                  </Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Show file upload when "upload" is selected */}
      {coverLetterOption === "upload" && (
        <FormField
          control={form.control}
          name="coverLetterFile"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  type="file"
                  accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => onChange(e.target.files?.[0] || null)}
                  className="cursor-pointer"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      
      {/* Show rich text editor when "text" is selected */}
      {coverLetterOption === "text" && (
        <FormField
          control={form.control}
          name="coverLetterText"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RichTextEditor
                  value={field.value || ""}
                  onChange={field.onChange}
                  placeholder="Write your cover letter here..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  )
}
```

#### 2.2.7. Create: `app/jobs/[id]/apply/_components/ApplicationSuccessModal.tsx`

Create the success modal component:

```typescript
'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

interface ApplicationSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  jobTitle: string
  companyName: string
}

export function ApplicationSuccessModal({
  isOpen,
  onClose,
  jobTitle,
  companyName
}: ApplicationSuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-col items-center">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <DialogTitle className="text-center text-xl">Application Submitted</DialogTitle>
          <DialogDescription className="text-center mt-2">
            Your application for <span className="font-medium">{jobTitle}</span> at {companyName} has been successfully submitted.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-center text-gray-dark">
            You can check the status of your application in your candidate dashboard.
          </p>
        </div>
        
        <DialogFooter className="justify-center sm:justify-center">
          <Button onClick={onClose}>
            Return to Job Listing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

#### 2.2.8. Create: `app/jobs/[id]/apply/loading.tsx`

Create a loading state for the application page:

```typescript
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ApplicationLoading() {
  return (
    <div className="container max-w-3xl mx-auto py-10">
      <div className="mb-8">
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-5 w-1/2" />
      </div>
      
      <Card className="p-6">
        <div className="space-y-8">
          <div>
            <Skeleton className="h-6 w-1/6 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          </div>
          
          <div>
            <Skeleton className="h-6 w-1/4 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </Card>
    </div>
  )
}
```

#### 2.2.9. Create: `app/jobs/[id]/apply/error.tsx`

Create an error component for the application page:

```typescript
'use client'

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function ApplicationError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()
  
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])
  
  return (
    <div className="container max-w-3xl mx-auto py-10 flex flex-col items-center">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
        <p className="text-gray-dark mb-6">
          There was an error loading the application form.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => reset()} variant="outline">
            Try again
          </Button>
          <Button onClick={() => router.back()}>
            Go back
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### 2.3. Server Action Implementation

#### 2.3.1. Create: `app/jobs/[id]/apply/_actions.ts`

Create the server action for form submission:

```typescript
'use server'

import { revalidatePath } from "next/cache"
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
    const supabase = createClient()
    
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
        .from('applications')
        .upload(filePath, file)
      
      if (resumeError) {
        return { success: false, error: "Failed to upload resume" }
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('applications')
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
        .from('applications')
        .upload(filePath, file)
      
      if (clError) {
        return { success: false, error: "Failed to upload cover letter" }
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('applications')
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
    
    return result
  } catch (error) {
    console.error("Application submission error:", error)
    return { success: false, error: "Failed to submit application" }
  }
}
```

## 3. Data Flow

### 3.1. Application Initial Load
1. User navigates to `/jobs/[id]/apply`
2. `page.tsx` (server component) receives `id` parameter
3. `page.tsx` calls `getUser()` from `@/lib/supabase/server` to verify authentication
4. If user is authenticated and is a candidate, `page.tsx` calls `getApplicationContextData(id, userId)` from `./_queries.ts`
5. `getApplicationContextData` fetches job details and candidate profile using Drizzle ORM
6. Data is passed to `ApplicationForm` client component

### 3.2. Application Submission
1. User fills out form and clicks submit
2. Form validation occurs client-side via React Hook Form + Zod
3. On valid submission, `ApplicationForm` calls `submitApplication` Server Action with form data
4. Server Action:
   - Validates authentication again
   - Validates form data server-side
   - Checks if user already applied
   - Uploads files to Supabase Storage if needed
   - Prepares application data
   - Calls `insertApplication` from `_queries.ts`
   - Revalidates relevant paths
5. Based on the result, either:
   - Shows success modal, then redirects to job page
   - Shows error message on form

## 4. Error Handling & Edge Cases

1. **User Not Logged In**: Redirect to login page with return URL
2. **Non-Candidate User**: Redirect with error message
3. **Already Applied**: Server action checks for existing application, returns error
4. **Job Not Found**: Redirect to jobs page with error message
5. **External Application Method**: Redirect back to job page with message
6. **File Upload Failures**: Handled in server action, returns error to form
7. **Form Validation Errors**: Handled by Zod + React Hook Form
8. **Database Errors**: Caught in `_queries.ts` functions and returned with appropriate error messages

## 5. Security Considerations

1. **Authentication Checks**: Both client and server-side
2. **Data Validation**: Both client-side (UX) and server-side (security)
3. **File Upload Limits**: Size and type restrictions
4. **User Role Verification**: Ensures only candidates can apply
5. **Existing Application Check**: Prevents duplicate submissions

## 6. Performance Considerations

1. **Streaming Server Components**: Improves initial page load
2. **Loading State**: Shows skeleton UI during data fetching
3. **Error Boundaries**: Graceful error handling with reset options
4. **Revalidation**: Strategic path revalidation to update relevant UI
5. **Optimistic UI Updates**: Show success modal immediately while server processes

## 7. Implementation Notes

1. All components follow the Vertical Slice Architecture
2. Key validation logic is in `_utils/validation.ts`
3. Database interactions are strictly in `_queries.ts`
4. Form submission logic is in Server Action (`_actions.ts`)
5. UI follows the style guide with appropriate spacing, colors, and components
6. File handling is done through Supabase Storage
7. Authentication is handled through Supabase Auth via `getUser()`
