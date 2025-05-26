'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { requestResetSchema, type RequestResetFormData } from '../_utils/validation'
import { requestPasswordReset, type RequestResetActionResult } from '../_actions'
import { toast } from 'sonner'
import Link from 'next/link'

// Shadcn UI components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2 } from 'lucide-react'

export function RequestResetForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RequestResetFormData>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: {
      email: '',
    },
  })
  
  const onSubmit = async (data: RequestResetFormData) => {
    setIsLoading(true)
    setFormError(null)
    
    try {
      const formData = new FormData()
      formData.append('email', data.email)
      
      const result = await requestPasswordReset(formData)
      
      if (!result.success) {
        // Handle field-specific errors
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, messages]) => {
            setError(field as keyof RequestResetFormData, {
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
      toast.success('Password reset instructions sent to your email')
      
    } catch (error) {
      setFormError('An unexpected error occurred. Please try again.')
      console.error('Form submission error:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto glass-card">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Check Your Email</CardTitle>
          <CardDescription className="text-center">
            If an account exists with that email, we&apos;ve sent password reset instructions.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/sign-in">Return to Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className="w-full max-w-md mx-auto glass-card">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
        <CardDescription className="text-center">
          Enter your email address and we&apos;ll send you a password reset link
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              {...register('email')}
              disabled={isLoading}
              className={errors.email ? 'border-red-300' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Remember your password?{' '}
          <Link href="/sign-in" className="text-primary hover:underline">
            Sign In
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
} 