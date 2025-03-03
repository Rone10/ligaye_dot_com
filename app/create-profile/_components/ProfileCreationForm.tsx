'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User } from '@supabase/supabase-js'
import { toast } from 'sonner'

// Server Actions
import { 
  createCandidateProfileAction, 
  createEmployerProfileAction 
} from '../../actions/profile'

// Step Components
import { BasicProfileForm } from './BasicProfileForm'
import { CandidateProfileForm } from './CandidateProfileForm'
import { EmployerProfileForm } from './EmployerProfileForm'

// Types
type ProfileRole = 'candidate' | 'employer' | null
type FormStep = 'basic' | 'role-specific' | 'complete'

interface ProfileCreationFormProps {
  user: User
}

export function ProfileCreationForm({ user }: ProfileCreationFormProps) {
  const router = useRouter()
  const [step, setStep] = useState<FormStep>('basic')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  
  // Basic profile data
  const [profile, setProfile] = useState({
    fullName: '',
    avatarUrl: '',
    role: null as ProfileRole,
  })

  // Role-specific data
  const [candidateData, setCandidateData] = useState({
    jobTitle: '',
    yearsOfExperience: '',
    skills: [] as string[],
    bio: '',
  })
  
  const [employerData, setEmployerData] = useState({
    companyName: '',
    companySize: '',
    industry: '',
    companyDescription: '',
    companyWebsite: '',
  })

  // Handle basic profile form submission
  const handleBasicProfileSubmit = async (data: {
    fullName: string
    avatarUrl?: string
    role: ProfileRole
  }) => {
    setProfile({
      fullName: data.fullName,
      avatarUrl: data.avatarUrl || '',
      role: data.role
    })
    setStep('role-specific')
  }

  // Handle candidate profile form submission
  const handleCandidateSubmit = async (data: {
    jobTitle: string
    yearsOfExperience: string
    skills: string[]
    bio: string
  }) => {
    setIsSubmitting(true)
    setCandidateData(data)
    
    try {
      // Call the server action to create the candidate profile
      const result = await createCandidateProfileAction(
        {
          fullName: profile.fullName,
          avatarUrl: profile.avatarUrl,
          role: 'candidate',
        },
        data
      )
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create profile')
      }
      
      setStep('complete')
      toast.success("Your candidate profile has been successfully created.")
      
      // Redirect after a brief delay to show success state
      setTimeout(() => {
        router.push('/candidate/dashboard')
      }, 1500)
      
    } catch (error) {
      console.error('Error saving profile:', error)
      setFormError('There was an error saving your profile. Please try again.')
      toast.error("Failed to create profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle employer profile form submission
  const handleEmployerSubmit = async (data: {
    companyName: string
    companySize: string
    industry: string
    companyDescription: string
    companyWebsite: string
  }) => {
    setIsSubmitting(true)
    setEmployerData(data)
    
    try {
      // Call the server action to create the employer profile
      const result = await createEmployerProfileAction(
        {
          fullName: profile.fullName,
          avatarUrl: profile.avatarUrl,
          role: 'employer',
        },
        data
      )
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create profile')
      }
      
      setStep('complete')
      toast.success("Your employer profile has been successfully created.")
      
      // Redirect after a brief delay to show success state
      setTimeout(() => {
        router.push('/employer/dashboard')
      }, 1500)
      
    } catch (error) {
      console.error('Error saving profile:', error)
      setFormError('There was an error saving your profile. Please try again.')
      toast.error("Failed to create profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {formError && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md">
          {formError}
        </div>
      )}
      
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'basic' || step === 'role-specific' || step === 'complete' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className="ml-2 font-medium">Basic Info</div>
          </div>
          <div className="h-px bg-gray-300 w-12 sm:w-24"></div>
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'role-specific' || step === 'complete'
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
            <div className="ml-2 font-medium">
              {profile.role ? `${profile.role === 'candidate' ? 'Candidate' : 'Employer'} Details` : 'Role Details'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Form steps */}
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {step === 'basic' && (
          <BasicProfileForm 
            initialData={profile} 
            userEmail={user.email || ''}
            onSubmit={handleBasicProfileSubmit} 
          />
        )}
        
        {step === 'role-specific' && profile.role === 'candidate' && (
          <CandidateProfileForm
            initialData={candidateData}
            onSubmit={handleCandidateSubmit}
            isSubmitting={isSubmitting}
          />
        )}
        
        {step === 'role-specific' && profile.role === 'employer' && (
          <EmployerProfileForm
            initialData={employerData}
            onSubmit={handleEmployerSubmit}
            isSubmitting={isSubmitting}
          />
        )}
        
        {step === 'complete' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Profile Created!</h2>
            <p className="text-gray-600 mb-6">
              Your {profile.role} profile has been successfully created.
              Redirecting you to your dashboard...
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
} 