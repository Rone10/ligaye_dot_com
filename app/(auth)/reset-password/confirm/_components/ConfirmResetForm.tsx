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
      <Card className="w-full max-w-md mx-auto bg-white/70 backdrop-blur-lg border border-gray/30 shadow-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Password Reset Complete</CardTitle>
          <CardDescription className="text-center">
            Your password has been reset successfully. You can now sign in with your new password.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          {source === 'mobile' ? (
            <div className="text-center space-y-4">
              <p className="text-gray-600">You can now return to the mobile app and sign in with your new password.</p>
              <Button className="bg-primary-blue hover:bg-primary-blue-light w-full">
                Return to App
              </Button>
            </div>
          ) : (
            <Button asChild className="bg-primary-blue hover:bg-primary-blue-light">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className="w-full max-w-md mx-auto bg-white/70 backdrop-blur-lg border border-gray/30 shadow-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Set New Password</CardTitle>
        <CardDescription className="text-center">
          Create a new password for your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              disabled={isLoading}
              className={errors.password ? 'border-red-300' : ''}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...register('confirmPassword')}
              disabled={isLoading}
              className={errors.confirmPassword ? 'border-red-300' : ''}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-primary-blue hover:bg-primary-blue-light"
            disabled={isLoading}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-dark">
          Remember your password?{' '}
          <Link href="/sign-in" className="text-primary-blue hover:underline">
            Sign In
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
} 