'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signInSchema, type SignInFormData } from '../_utils/validation'
import { signInUser, resendVerificationEmail, type SignInActionResult } from '../_actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MailCheck, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

// Shadcn UI components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface SignInFormProps {
  redirectTo?: string
  successMessage?: string
}

export function SignInForm({ redirectTo, successMessage }: SignInFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [emailNotVerified, setEmailNotVerified] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })
  
  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true)
    setFormError(null)
    setEmailNotVerified(false)
    setUnverifiedEmail(null)

    try {
      const formData = new FormData()
      formData.append('email', data.email)
      formData.append('password', data.password)

      // Add redirect parameter if provided
      if (redirectTo) {
        formData.append('redirectTo', redirectTo)
      }

      const result = await signInUser(formData)

      if (!result.success) {
        // Handle field-specific errors
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, messages]) => {
            setError(field as keyof SignInFormData, {
              type: 'manual',
              message: messages[0],
            })
          })
        }

        // Handle email verification error specifically
        if (result.emailNotVerified) {
          setEmailNotVerified(true)
          setUnverifiedEmail(result.userEmail || data.email)
        }

        // Handle general error
        if (result.error) {
          setFormError(result.error)
        }

        return
      }

      // Handle success
      toast.success('Signed in successfully!')

      // The redirect is now handled by the server action
      // But we still refresh the router to ensure client state is updated
      router.refresh()

    } catch (error) {
      setFormError('An unexpected error occurred. Please try again.')
      console.error('Form submission error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return

    setIsResending(true)

    try {
      const result = await resendVerificationEmail(unverifiedEmail)

      if (result.success) {
        toast.success('Verification email sent! Please check your inbox.')
      } else {
        toast.error(result.error || 'Failed to resend verification email.')
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.')
      console.error('Resend verification error:', error)
    } finally {
      setIsResending(false)
    }
  }
  
  return (
          <Card className="w-full max-w-md mx-auto glass-card">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
        <CardDescription className="text-center">
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {successMessage && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-900">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {formError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          {emailNotVerified && unverifiedEmail && (
            <Alert className="mb-4 border-blue-200 bg-blue-50">
              <MailCheck className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900">
                <div className="space-y-2">
                  <p className="text-sm">
                    Please verify your email address before signing in.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResendVerification}
                    disabled={isResending}
                    className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    {isResending ? 'Sending...' : 'Resend Verification Email'}
                  </Button>
                </div>
              </AlertDescription>
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
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/reset-password"
                className="text-sm text-primary-blue hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                disabled={isLoading}
                className={errors.password ? 'border-red-300 pr-10' : 'pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-primary-blue hover:bg-primary-blue-light"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-dark">
          Don&apos;t have an account?{' '}
          <Link href="/sign-up" className="text-primary-blue hover:underline">
            Sign Up
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
} 