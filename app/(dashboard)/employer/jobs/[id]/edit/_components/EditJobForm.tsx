'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react'
import useJobForm from '../_hooks/useJobForm'
import { updateJobPosting } from '../_actions'
import BasicDetailsStep from './form-steps/BasicDetailsStep'
import RequirementsStep from './form-steps/RequirementsStep'
import CompensationStep from './form-steps/CompensationStep'
import PostingSettingsStep from './form-steps/PostingSettingsStep'
import type { Job } from '@/lib/db/schema'

interface EditJobFormProps {
  job: Job
  jobSkills: { skillId: string; name?: string }[]
  jobIndustries: { industryId: string; name?: string }[]
}

export default function EditJobForm({ job, jobSkills, jobIndustries }: EditJobFormProps) {
  const router = useRouter()
  const { form, step, totalSteps, nextStep, prevStep, isSubmitting, setIsSubmitting } = useJobForm(job)
  const [error, setError] = useState<string | null>(null)
  
  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true)
      setError(null)
      
      const result = await updateJobPosting(job.id, data)
      
      if (result.error) {
        setError(result.error)
        return
      }
      
      // Redirect back to job details page after successful update
      router.push(`/employer/jobs/${job.id}`)
      router.refresh()
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Card className="p-6 shadow-[0_8px_32px_rgba(31,38,135,0.1)] bg-background/80 backdrop-blur-md border-[rgba(255,255,255,0.3)] rounded-2xl">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {step === 1 && <BasicDetailsStep form={form} onNext={nextStep} existingLocationId={job.locationId || undefined} />}
          {step === 2 && <RequirementsStep form={form} onNext={nextStep} onPrevious={prevStep} />}
          {step === 3 && <CompensationStep form={form} onNext={nextStep} onPrevious={prevStep} />}
          {step === 4 && <PostingSettingsStep form={form} onPrevious={prevStep} isSubmitting={isSubmitting} isEditing={true} />}
          
          <div className="pt-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round((step / totalSteps) * 100)}% complete</span>
            </div>
            <div className="mt-2 h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#4a6cfa] transition-all duration-300" 
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </form>
      </Form>
    </Card>
  )
} 