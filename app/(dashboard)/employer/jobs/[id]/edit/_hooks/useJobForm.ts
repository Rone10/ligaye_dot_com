'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { JobFormValues, jobFormSchema } from '../_utils/validation'
import { workLocationEnum } from '@/lib/db/schema'
import type { Job } from '@/lib/db/schema'

export default function useJobForm(job?: Job, jobSkills?: {skillId: string, name?: string}[], jobIndustries?: {industryId: string, name?: string}[]) {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Helper to convert null to undefined (for form compatibility)
  const nullToUndefined = <T,>(value: T | null): T | undefined => 
    value === null ? undefined : value
  
  // Prepare initial values from existing job if provided
  const defaultValues: Partial<JobFormValues> = job ? {
    title: job.title,
    description: job.description,
    jobLanguage: job.jobLanguage || 'English',
    numberOfOpenings: job.numberOfOpenings || 1,
    locationId: nullToUndefined(job.locationId),
    displayAddress: job.displayAddress ?? true,
    workLocation: job.workLocation as typeof workLocationEnum.enumValues[number],
    educationRequirements: [],
    experienceRequirements: [],
    educationRequirementsRichText: job.educationRequirements || '',
    experienceRequirementsRichText: job.experienceRequirements || '',
    experienceLevel: nullToUndefined(job.experienceLevel),
    languageRequirements: job.languageRequirements || [],
    languageTrainingProvided: job.languageTrainingProvided ?? false,
    jobType: job.jobType as any,
    schedule: job.schedule || [],
    expectedHours: nullToUndefined(job.expectedHours),
    hoursType: job.hoursType || 'FIXED',
    contractLength: nullToUndefined(job.contractLength),
    contractPeriod: nullToUndefined(job.contractPeriod),
    plannedStartDate: job.plannedStartDate ? new Date(job.plannedStartDate) : undefined,
    salaryRangeMin: nullToUndefined(job.salaryRangeMin),
    salaryRangeMax: nullToUndefined(job.salaryRangeMax),
    salaryCurrency: job.salaryCurrency || 'GMD',
    salaryFrequency: nullToUndefined(job.salaryFrequency),
    salaryDisplayType: job.salaryDisplayType || 'NEGOTIABLE' as any,
    supplementalPay: job.supplementalPay || [],
    benefits: job.benefits || [],
    skillIds: jobSkills?.map(skill => skill.skillId) || [],
    industryIds: jobIndustries?.map(industry => industry.industryId) || [],
    applicationMethod: job.applicationMethod as any,
    applicationInstructions: nullToUndefined(job.applicationInstructions),
    applicationUrl: job.applicationUrl || '',
    applicationEmail: job.applicationEmail || '',
    resumeRequired: job.resumeRequired ?? true,
    allowCandidateContact: job.allowCandidateContact ?? false,
    applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline) : undefined,
  } : {
    title: '',
    description: '',
    jobLanguage: 'English',
    numberOfOpenings: 1,
    displayAddress: true,
    workLocation: 'ON_SITE' as typeof workLocationEnum.enumValues[number],
    educationRequirements: [],
    experienceRequirements: [],
    educationRequirementsRichText: '',
    experienceRequirementsRichText: '',
    languageRequirements: [],
    languageTrainingProvided: false,
    jobType: 'FULL_TIME' as any,
    schedule: [],
    hoursType: 'FIXED',
    salaryCurrency: 'GMD',
    salaryDisplayType: 'NEGOTIABLE' as any,
    supplementalPay: [],
    benefits: [],
    skillIds: [],
    industryIds: [],
    applicationMethod: 'PLATFORM' as any,
    resumeRequired: true,
    allowCandidateContact: false,
  }
  
  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues,
    mode: 'onChange'
  })
  
  const nextStep = () => setStep((prev) => prev + 1)
  const prevStep = () => setStep((prev) => prev - 1)
  const goToStep = (stepNumber: number) => setStep(stepNumber)
  
  const totalSteps = 4 // Total form steps
  
  return {
    form,
    step,
    totalSteps,
    nextStep,
    prevStep,
    goToStep,
    isSubmitting,
    setIsSubmitting
  }
} 