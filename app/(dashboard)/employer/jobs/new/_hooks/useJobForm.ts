'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { JobFormValues, jobFormSchema } from '../_utils/validation'
import { workLocationEnum } from '@/lib/db/schema'

export default function useJobForm() {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: '',
      description: '',
      jobLanguage: 'English',
      numberOfOpenings: 1,
      displayAddress: true,
      workLocation: 'ON_SITE' as typeof workLocationEnum.enumValues[number],
      educationRequirements: [],
      experienceRequirements: [],
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
      jobDuration: 1,
      paymentMethod: 'stripe'
    },
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