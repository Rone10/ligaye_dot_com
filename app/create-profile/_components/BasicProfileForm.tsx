'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Building2 } from 'lucide-react'

// Form validation schema
const formSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters' }),
  avatarUrl: z.string().optional(),
  role: z.enum(['candidate', 'employer'], { 
    required_error: 'Please select a role for your profile' 
  }),
})

type FormValues = z.infer<typeof formSchema>

interface BasicProfileFormProps {
  initialData: {
    fullName: string
    avatarUrl: string
    role: 'candidate' | 'employer' | null
  }
  userEmail: string
  onSubmit: (data: FormValues) => void
}

export function BasicProfileForm({ initialData, userEmail, onSubmit }: BasicProfileFormProps) {
  const [avatarPreview, setAvatarPreview] = useState(initialData.avatarUrl || '')
  
  // Initialize form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: initialData.fullName || '',
      avatarUrl: initialData.avatarUrl || '',
      role: initialData.role || undefined,
    },
  })

  // Get name initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('')
  }
  
  // Handle form submission
  const handleSubmit = (values: FormValues) => {
    onSubmit(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Email Display (non-editable) */}
        <div className="space-y-2">
          <FormLabel>Email</FormLabel>
          <Input 
            value={userEmail} 
            disabled 
            className="bg-gray-50" 
          />
          <p className="text-sm text-gray-500">
            Your email address is tied to your account and cannot be changed
          </p>
        </div>

        {/* Full Name */}
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Avatar URL */}
        <FormField
          control={form.control}
          name="avatarUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Picture</FormLabel>
              <div className="flex items-start space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={avatarPreview} />
                  <AvatarFallback>
                    {getInitials(form.watch('fullName') || 'User Profile')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <FormControl>
                    <Input 
                      placeholder="Enter an image URL" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e)
                        setAvatarPreview(e.target.value)
                      }}
                    />
                  </FormControl>
                  <p className="text-sm text-gray-500 mt-2">
                    Enter a direct link to your profile picture
                  </p>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Role Selection */}
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>I am looking to...</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-col space-y-3"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="candidate" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer flex items-center">
                      <User className="w-5 h-5 mr-2 text-blue-600" />
                      Find a job (Candidate)
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="employer" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer flex items-center">
                      <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                      Hire talent (Employer)
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full"
          disabled={!form.formState.isValid || form.formState.isSubmitting}
        >
          Continue
        </Button>
      </form>
    </Form>
  )
} 