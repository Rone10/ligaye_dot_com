'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { confirmResetSchema, type ConfirmResetFormData } from '../_utils/validation'
import { confirmPasswordReset, confirmPasswordResetWithSession, type ConfirmResetActionResult } from '../_actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Shadcn UI components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2 } from 'lucide-react'

interface ConfirmResetFormProps {
  resetCode?: string
  source?: string
  isImplicitFlow?: boolean
}

export function ConfirmResetForm({ resetCode, source, isImplicitFlow = false }: ConfirmResetFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ConfirmResetFormData>({
    resolver: zodResolver(confirmResetSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })
  
  const onSubmit = async (data: ConfirmResetFormData) => {
    setIsLoading(true)
    setFormError(null)
    
    try {
      const formData = new FormData()
      formData.append('password', data.password)
      formData.append('confirmPassword', data.confirmPassword)
      
      // Include reset code if available
      if (resetCode) {
        formData.append('resetCode', resetCode)
      }
      
      // Use the appropriate action based on the flow type
      const result = isImplicitFlow 
        ? await confirmPasswordResetWithSession(formData)
        : await confirmPasswordReset(formData)
      
      if (!result.success) {
        // Handle field-specific errors
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, messages]) => {
            setError(field as keyof ConfirmResetFormData, {
              type: 'manual',
              message: messages[0],
            })
          })
        }
        
        // Handle general error
        if (result.error) {
          setFormError(result.error)
          
          // If it's a session-related error, we should provide a way to get a new link
          if (result.error.includes('session') || result.error.includes('expired')) {
            setTimeout(() => {
              router.push('/reset-password')
            }, 3000)
          }
        }
        
        return
      }
      
      // Handle success
      setIsSuccess(true)
      toast.success('Your password has been reset successfully!')
      
      // For mobile source, don't redirect automatically
      if (source !== 'mobile') {
        // Redirect to sign in page after a short delay
        setTimeout(() => {
          router.push('/sign-in')
        }, 2000)
      }
      
    } catch (error) {
      setFormError('An unexpected error occurred. Please try again.')
      console.error('Form submission error:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto glass-card shadow-level-2">
        <CardHeader className="space-y-sm">
          <div className="flex justify-center mb-md">
            <div className="bg-secondary-green/10 p-lg rounded-full">
              <CheckCircle2 className="h-12 w-12 text-secondary-green" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-theme-dark">Password Reset Complete</CardTitle>
          <CardDescription className="text-center text-theme-gray-dark text-base leading-relaxed">
            {source === 'mobile' 
              ? 'Your password has been successfully reset. Please return to the mobile app and sign in with your new password.'
              : 'Your password has been reset successfully. You can now sign in with your new password.'
            }
          </CardDescription>
        </CardHeader>
        {source !== 'mobile' && (
          <CardContent className="flex justify-center pb-xl">
            <Button asChild className="bg-primary-blue hover:bg-primary-blue-light text-white px-xl py-md rounded-md shadow-level-2 hover:shadow-level-3 duration-standard font-semibold">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </CardContent>
        )}
      </Card>
    )
  }
  
  return (
    <Card className="w-full max-w-md mx-auto glass-card shadow-level-2">
      <CardHeader className="space-y-sm">
        <CardTitle className="text-2xl font-bold text-center text-theme-dark">Set New Password</CardTitle>
        <CardDescription className="text-center text-theme-gray-dark">
          Create a new password for your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-lg">
          {formError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                {formError}
                {(formError.includes('session') || formError.includes('expired')) && (
                  <div className="mt-2">
                    <Link href="/reset-password" className="text-red-700 underline text-sm">
                      Request a new password reset link
                    </Link>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-xs">
            <Label htmlFor="password" className="text-sm font-medium text-theme-dark">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              disabled={isLoading}
              className={`h-[46px] px-md rounded-md border ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-theme-gray focus:border-primary-blue'} focus:shadow-focus duration-standard`}
            />
            {errors.password && (
              <p className="text-sm text-red-500 mt-xs">{errors.password.message}</p>
            )}
          </div>
          
          <div className="space-y-xs">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-theme-dark">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...register('confirmPassword')}
              disabled={isLoading}
              className={`h-[46px] px-md rounded-md border ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-theme-gray focus:border-primary-blue'} focus:shadow-focus duration-standard`}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500 mt-xs">{errors.confirmPassword.message}</p>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-primary-blue hover:bg-primary-blue-light text-white px-xl py-md rounded-md shadow-level-2 hover:shadow-level-3 duration-standard font-semibold mt-xl"
            disabled={isLoading}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center pb-xl">
        <p className="text-sm text-theme-gray-dark">
          Remember your password?{' '}
          <Link href="/sign-in" className="text-primary-blue hover:underline font-medium duration-standard">
            Sign In
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
} 