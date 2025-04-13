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