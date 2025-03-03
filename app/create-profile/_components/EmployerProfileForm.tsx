'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from '@/components/ui/form'

// Company size options
const companySizes = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '501-1000', label: '501-1000 employees' },
  { value: '1001+', label: '1001+ employees' },
]

// Industry options
const industries = [
  { value: 'technology', label: 'Technology & IT' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance & Banking' },
  { value: 'education', label: 'Education' },
  { value: 'retail', label: 'Retail & E-commerce' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'media', label: 'Media & Entertainment' },
  { value: 'government', label: 'Government' },
  { value: 'nonprofit', label: 'Nonprofit' },
  { value: 'other', label: 'Other' },
]

// Form validation schema
const formSchema = z.object({
  companyName: z.string().min(2, { message: 'Company name must be at least 2 characters' }),
  companySize: z.string({ required_error: 'Please select a company size' }),
  industry: z.string({ required_error: 'Please select an industry' }),
  companyDescription: z.string().min(10, { message: 'Description must be at least 10 characters' }).max(500, { message: 'Description cannot exceed 500 characters' }),
  companyWebsite: z.string().url({ message: 'Please enter a valid URL' }).or(z.literal('')),
})

type FormValues = z.infer<typeof formSchema>

interface EmployerProfileFormProps {
  initialData: {
    companyName: string
    companySize: string
    industry: string
    companyDescription: string
    companyWebsite: string
  }
  isSubmitting: boolean
  onSubmit: (data: FormValues) => void
}

export function EmployerProfileForm({ initialData, isSubmitting, onSubmit }: EmployerProfileFormProps) {
  // Initialize form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: initialData.companyName || '',
      companySize: initialData.companySize || '',
      industry: initialData.industry || '',
      companyDescription: initialData.companyDescription || '',
      companyWebsite: initialData.companyWebsite || '',
    },
  })
  
  // Handle form submission
  const handleSubmit = (values: FormValues) => {
    onSubmit(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Company Name */}
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your company name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Company Size */}
        <FormField
          control={form.control}
          name="companySize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Size</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {companySizes.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                How many employees work at your company?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Industry */}
        <FormField
          control={form.control}
          name="industry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Industry</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry.value} value={industry.value}>
                      {industry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                What industry does your company operate in?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Company Description */}
        <FormField
          control={form.control}
          name="companyDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Tell candidates about your company, mission, and culture..." 
                  className="min-h-[120px]"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                <span className={field.value.length > 500 ? 'text-red-500' : ''}>
                  {field.value.length}/500 characters
                </span>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Company Website */}
        <FormField
          control={form.control}
          name="companyWebsite"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Website</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com" {...field} />
              </FormControl>
              <FormDescription>
                Optional: Add your company's website URL
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
          >
            Back
          </Button>
          <Button 
            type="submit" 
            disabled={!form.formState.isValid || isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Create Employer Profile'}
          </Button>
        </div>
      </form>
    </Form>
  )
} 