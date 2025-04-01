'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signUpSchema, type SignUpFormData } from '../_utils/validation'
import { signUpUser, type SignUpActionResult } from '../_actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Shadcn UI components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { BriefcaseIcon, UserIcon } from 'lucide-react'

export function SignUpForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    control,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      userRole: 'candidate',
    },
  })
  
  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true)
    setFormError(null)
    
    try {
      const formData = new FormData()
      formData.append('firstName', data.firstName)
      formData.append('lastName', data.lastName)
      formData.append('email', data.email)
      formData.append('password', data.password)
      formData.append('userRole', data.userRole)
      
      const result = await signUpUser(formData)
      
      if (!result.success) {
        // Handle field-specific errors
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, messages]) => {
            setError(field as keyof SignUpFormData, {
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
      setFormSuccess(true)
      toast.success('Account created! Please check your email to verify your account.')
      
      // Redirect to verification page after a short delay
      setTimeout(() => {
        router.push('/sign-in')
      }, 2000)
      
    } catch (error) {
      setFormError('An unexpected error occurred. Please try again.')
      console.error('Form submission error:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <Card className="glass-card w-full max-w-md mx-auto shadow-level-2 animate-appear-zoom">
      <CardHeader className="space-y-1">
        <CardTitle className="text-3xl font-bold text-center">Sign Up</CardTitle>
        <CardDescription className="text-center text-gray-dark">
          Create an account to start using Ligaye.com
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-xl">
          {formError && (
            <Alert variant="destructive" className="mb-lg">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-2 gap-md">
            <div className="space-y-xs">
              <Label htmlFor="firstName" className="text-dark font-medium">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                {...register('firstName')}
                disabled={isLoading}
                className={`input-field ${errors.firstName ? 'border-destructive' : ''}`}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>
            
            <div className="space-y-xs">
              <Label htmlFor="lastName" className="text-dark font-medium">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                {...register('lastName')}
                disabled={isLoading}
                className={`input-field ${errors.lastName ? 'border-destructive' : ''}`}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-xs">
            <Label htmlFor="email" className="text-dark font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              {...register('email')}
              disabled={isLoading}
              className={`input-field ${errors.email ? 'border-destructive' : ''}`}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          
          <div className="space-y-xs">
            <Label htmlFor="password" className="text-dark font-medium">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              disabled={isLoading}
              className={`input-field ${errors.password ? 'border-destructive' : ''}`}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          
          <div className="space-y-sm">
            <Label className="text-dark font-medium">Account Type</Label>
            <RadioGroup 
              defaultValue="candidate" 
              className="grid grid-cols-2 gap-md pt-xs"
              {...register('userRole')}
            >
              <div>
                <RadioGroupItem
                  value="candidate"
                  id="candidate"
                  className="peer sr-only"
                  disabled={isLoading}
                />
                <Label
                  htmlFor="candidate"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-md hover:bg-gray/10 hover:border-gray-dark transition-all duration-standard peer-data-[state=checked]:border-primary-blue [&:has([data-state=checked])]:border-primary-blue"
                >
                  <UserIcon className="mb-xs h-6 w-6 text-primary-blue" />
                  <span className="text-base font-medium">Job Seeker</span>
                </Label>
              </div>
              
              <div>
                <RadioGroupItem
                  value="employer"
                  id="employer"
                  className="peer sr-only"
                  disabled={isLoading}
                />
                <Label
                  htmlFor="employer"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-md hover:bg-gray/10 hover:border-gray-dark transition-all duration-standard peer-data-[state=checked]:border-primary-blue [&:has([data-state=checked])]:border-primary-blue"
                >
                  <BriefcaseIcon className="mb-xs h-6 w-6 text-primary-blue" />
                  <span className="text-base font-medium">Employer</span>
                </Label>
              </div>
            </RadioGroup>
            {errors.userRole && (
              <p className="text-sm text-destructive">{errors.userRole.message}</p>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="button-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-dark">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-primary-blue hover:underline font-medium">
            Sign In
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
} 