"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { applyToJob } from "@/app/actions/candidate/applications"

// Form schema
const formSchema = z.object({
  coverLetter: z.string().max(1000, {
    message: "Cover letter must not exceed 1000 characters."
  }).optional(),
  useProfileResume: z.boolean().default(true)
});

type ApplyJobFormProps = {
  job: any // Type would be refined in real implementation
  employer: any
  candidateHasResume?: boolean
  onSuccess?: () => void
  onCancel?: () => void
}

export function ApplyJobForm({ 
  job, 
  employer,
  candidateHasResume = false,
  onSuccess,
  onCancel
}: ApplyJobFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  
  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      coverLetter: "",
      useProfileResume: candidateHasResume
    }
  })
  
  // Submit handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!job?.id) {
      toast.error("Job information is missing")
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const formData = new FormData()
      formData.append("jobId", job.id)
      
      if (values.coverLetter) {
        formData.append("coverLetter", values.coverLetter)
      }
      
      // Handle resume
      if (values.useProfileResume) {
        formData.append("usedProfileCv", "true")
      } else if (resumeFile) {
        formData.append("resume", resumeFile)
      }
      
      const result = await applyToJob(formData)
      
      if (result.success) {
        toast.success("Application submitted successfully")
        
        if (onSuccess) {
          onSuccess()
        } else {
          router.push("/candidate/applications")
        }
      } else {
        throw new Error("Failed to submit application")
      }
    } catch (error) {
      console.error("Error submitting application:", error)
      toast.error("Failed to submit application. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Handle resume file selection
  function handleResumeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null
    setResumeFile(file)
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Apply for {job?.title}</CardTitle>
        <CardDescription className="flex flex-col gap-1">
          <span>at {employer?.companyName}</span>
          <span className="text-muted-foreground text-sm mt-2">Complete the form below to apply for this position</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="coverLetter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Letter</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Introduce yourself and explain why you're a good fit for this position..."
                      className="min-h-32 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional. Share why you're interested in this position and highlight relevant skills (max 1000 characters).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {candidateHasResume && (
              <FormField
                control={form.control}
                name="useProfileResume"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Use resume from my profile
                      </FormLabel>
                      <FormDescription>
                        Your current resume will be attached to this application
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            )}
            
            {!form.watch("useProfileResume") && (
              <div className="space-y-2">
                <FormLabel htmlFor="resume">Upload Resume</FormLabel>
                <input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeChange}
                  className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary/90"
                />
                <p className="text-sm text-muted-foreground">
                  Accepted formats: PDF, DOC, DOCX (max 5MB)
                </p>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button 
          type="submit"
          disabled={isSubmitting}
          onClick={form.handleSubmit(onSubmit)}
        >
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </Button>
      </CardFooter>
    </Card>
  )
} 