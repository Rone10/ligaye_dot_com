'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updatePasswordSchema, type UpdatePasswordFormData } from '../_utils/validation'
import { updatePassword, type UpdatePasswordActionResult } from '../_actions'
import { toast } from 'sonner'
import Link from 'next/link'

// Shadcn UI components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2 } from 'lucide-react'

export function UpdatePasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })
  
  const onSubmit = async (data: UpdatePasswordFormData) => {
    setIsLoading(true)
    setFormError(null)
    
    try {
      const formData = new FormData()
      formData.append('currentPassword', data.currentPassword)
      formData.append('newPassword', data.newPassword)
      formData.append('confirmPassword', data.confirmPassword)
      
      const result = await updatePassword(formData)
      
      if (!result.success) {
        // Handle field-specific errors
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, messages]) => {
            setError(field as keyof UpdatePasswordFormData, {
              type: 'manual',
              message: messages[0],
            })
          })
        }
        
        // Handle general error
        if (result.error) {
          setFormError(result.error)
        }
        
        return
      }
      
      // Handle success
      setIsSuccess(true)
      toast.success('Your password has been updated successfully!')
      reset() // Clear the form
      
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
          <CardTitle className="text-2xl font-bold text-center">Password Updated</CardTitle>
          <CardDescription className="text-center">
            Your password has been updated successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button 
            onClick={() => setIsSuccess(false)} 
            className="bg-primary-blue hover:bg-primary-blue-light"
          >
            Update Again
          </Button>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className="w-full max-w-md mx-auto bg-white/70 backdrop-blur-lg border border-gray/30 shadow-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Update Password</CardTitle>
        <CardDescription className="text-center">
          Change your account password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {formError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              placeholder="••••••••"
              {...register('currentPassword')}
              disabled={isLoading}
              className={errors.currentPassword ? 'border-red-300' : ''}
            />
            {errors.currentPassword && (
              <p className="text-sm text-red-500">{errors.currentPassword.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="••••••••"
              {...register('newPassword')}
              disabled={isLoading}
              className={errors.newPassword ? 'border-red-300' : ''}
            />
            {errors.newPassword && (
              <p className="text-sm text-red-500">{errors.newPassword.message}</p>
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
            {isLoading ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-dark">
          Forgot your password?{' '}
          <Link href="/reset-password" className="text-primary-blue hover:underline">
            Reset Password
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
} 