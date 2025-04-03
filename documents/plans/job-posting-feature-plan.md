# Implementation Plan: Job Posting Feature for Employers

This implementation plan details the technical steps required to create the Job Posting feature for the Ligaye.com job board platform. Following the Vertical Slice Architecture (VSA), we'll implement:
1. Employer Dashboard Sidebar navigation
2. Job Posting Form with payment options
3. Employer's Job Postings view

## 1. Employer Dashboard Sidebar

### Target Location
`app/(dashboard)/employer/layout.tsx`

### Implementation Details

#### File Structure
```
app/
└── (dashboard)/
    └── employer/
        ├── layout.tsx             # Main layout with sidebar
        └── _components/
            └── EmployerSidebar.tsx # Client component for sidebar
```

#### Component Implementation

1. **Layout Component** (`layout.tsx`)
```tsx
import { getUser } from '@/lib/supabase/server'
import EmployerSidebar from './_components/EmployerSidebar'

export default async function EmployerDashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
 try {
    const user = await getUser();
    if (!user) {
      // Early exit for unauthorized user
      return { success: false, message: 'Unauthorized' };
    }

    // --- Combined Query using INNER JOIN ---
   const result = await db()
      .select({ /* ... fields ... */ })
      .from(profiles)
      .innerJoin(employerProfiles, and(
          eq(profiles.id, employerProfiles.profileId),
          eq(employerProfiles.deleted, false) // Ensure employer profile isn't deleted
      ))
      .where(and(
          eq(profiles.userId, user.id),
          eq(profiles.deleted, false) // Ensure base profile isn't deleted
      ))
      .limit(1)
      .then(res => res[0]);

    // --- Check the result of the single query ---
    if (!result) {
      return { success: false, message: 'Employer profile not found' }; // Or a more generic "Access denied"
    }

    // If we reach here, both the profile and employer profile exist
    return {
      success: true,
      profileId: result.profileId,
      employerProfileId: result.employerProfileId,
      // ...other selected fields
    };

  } catch (error) {
    console.error("Error checking employer access:", error);
    // Handle potential database errors or other exceptions
    return { success: false, message: 'An internal error occurred' };
  }
  

  
  return (
    <div className="flex min-h-screen">
      <EmployerSidebar />
      <main className="flex-1 p-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
```

2. **Sidebar Component** (`_components/EmployerSidebar.tsx`)
```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Building2, 
  Users, 
  Menu, 
  X 
} from 'lucide-react'

const navItems = [
  {
    name: 'Dashboard Overview',
    href: '/employer',
    icon: LayoutDashboard
  },
  {
    name: 'Post a Job',
    href: '/employer/jobs/new',
    icon: FileText
  },
  {
    name: 'My Job Postings',
    href: '/employer/jobs',
    icon: Briefcase
  },
  {
    name: 'Company Profile',
    href: '/employer/profile',
    icon: Building2
  },
  {
    name: 'Applicants',
    href: '/employer/jobs',
    icon: Users
  }
]

export default function EmployerSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  
  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-40 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </Button>
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30
        w-64 bg-background/80 backdrop-blur-sm
        border-r shadow-sm
        transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full p-4">
          <div className="py-6 px-2">
            <h2 className="text-xl font-bold">Employer Dashboard</h2>
          </div>
          
          <nav className="space-y-1 mt-6 flex-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              
              return (
                <Link 
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center px-4 py-3 text-sm
                    rounded-md transition-colors
                    hover:bg-primary/10
                    ${isActive ? 'bg-primary/10 text-primary font-medium' : ''}
                  `}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </>
  )
}
```

## 2. Job Posting Form

### Target Location
`app/(dashboard)/employer/jobs/new/`

### Implementation Details

#### File Structure
```
app/
└── (dashboard)/
    └── employer/
        └── jobs/
            └── new/
                ├── page.tsx               # Container for the form
                ├── _components/           # Client components
                │   ├── NewJobForm.tsx     # Main form component
                │   ├── SkillsSelector.tsx # Skills selection component
                │   └── IndustrySelector.tsx # Industry selection component
                ├── _utils/                # Validation and helpers 
                │   └── validation.ts      # Zod schema and validators
                ├── _hooks/                # Client-side hooks
                │   └── useJobForm.ts      # Form state management hook
                ├── _actions.ts            # Server actions for form submission
                └── _queries.ts            # Database queries
```

#### Validation Schema Implementation (`_utils/validation.ts`)
```tsx
import { z } from 'zod'
import { 
  workLocationEnum, 
  jobTypeEnum, 
  experienceLevelEnum,
  scheduleTypeEnum,
  contractPeriodEnum,
  salaryFrequencyEnum,
  salaryDisplayTypeEnum,
  applicationMethodEnum
} from '@/lib/db/schema'

// Helper validation schema for array fields
const textArrayValidator = z.string().array().optional().default([])

export const jobFormSchema = z.object({
  // Basic job details
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  jobLanguage: z.string().default("English"),
  numberOfOpenings: z.coerce.number().int().min(1).default(1),
  displayAddress: z.boolean().default(true),
  
  // Location
  locationId: z.string().uuid().optional(),
  workLocation: z.enum(workLocationEnum.enumValues),
  
  // Requirements
  educationRequirements: textArrayValidator,
  experienceRequirements: textArrayValidator,
  experienceLevel: z.enum(experienceLevelEnum.enumValues).optional(),
  
  // Language
  languageRequirements: textArrayValidator,
  languageTrainingProvided: z.boolean().default(false),
  
  // Job type and schedule
  jobType: z.enum(jobTypeEnum.enumValues),
  schedule: z.enum(scheduleTypeEnum.enumValues).array().optional().default([]),
  expectedHours: z.coerce.number().int().min(1).optional(),
  hoursType: z.string().default("FIXED"),
  
  // Contract details (conditional based on job type)
  contractLength: z.coerce.number().int().min(1).optional(),
  contractPeriod: z.enum(contractPeriodEnum.enumValues).optional(),
  
  // Start date
  plannedStartDate: z.coerce.date().optional(),
  
  // Salary
  salaryRangeMin: z.coerce.number().int().min(0).optional(),
  salaryRangeMax: z.coerce.number().int().min(0).optional(),
  salaryCurrency: z.string().default("GMD"),
  salaryFrequency: z.enum(salaryFrequencyEnum.enumValues).optional(),
  salaryDisplayType: z.enum(salaryDisplayTypeEnum.enumValues).default("NEGOTIABLE"),
  
  // Benefits & supplemental pay
  supplementalPay: textArrayValidator,
  benefits: textArrayValidator,
  
  // Skills & industries
  skillIds: z.string().uuid().array().min(1, "Select at least one skill"),
  industryIds: z.string().uuid().array().min(1, "Select at least one industry"),
  
  // Application settings
  applicationMethod: z.enum(applicationMethodEnum.enumValues).default("PLATFORM"),
  applicationInstructions: z.string().optional(),
  applicationUrl: z.string().url().optional(),
  applicationEmail: z.string().email().optional(),
  resumeRequired: z.boolean().default(true),
  allowCandidateContact: z.boolean().default(false),
  applicationDeadline: z.coerce.date().optional(),
  
  // Job posting settings
  jobDuration: z.coerce.number().int().min(1, "Duration must be at least 1 month"),
  paymentMethod: z.enum(["stripe", "cash"])
})

export type JobFormValues = z.infer<typeof jobFormSchema>
```

#### Custom Hook (`_hooks/useJobForm.ts`)
```tsx
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
    }
  })
  
  const nextStep = () => setStep((prev) => prev + 1)
  const prevStep = () => setStep((prev) => prev - 1)
  
  const totalSteps = 4 // Total form steps
  
  return {
    form,
    step,
    totalSteps,
    nextStep,
    prevStep,
    isSubmitting,
    setIsSubmitting
  }
}
```

#### Page Component (`page.tsx`)
```tsx
import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NewJobForm from './_components/NewJobForm'

export default async function NewJobPage() {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-8">Post a New Job</h1>
      <NewJobForm />
    </div>
  )
}
```

#### Job Form Component (`_components/NewJobForm.tsx`)
```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react'
import useJobForm from '../_hooks/useJobForm'
import { createJobPosting } from '../_actions'
import SkillsSelector from './SkillsSelector'
import IndustrySelector from './IndustrySelector'
import { RichTextEditor } from '@/components/RichTextEditor/editor'

// Form step components would go here (JobDetailsStep, RequirementsStep, etc.)
// For brevity, I'm showing a simplified structure

export default function NewJobForm() {
  const router = useRouter()
  const { form, step, totalSteps, nextStep, prevStep, isSubmitting, setIsSubmitting } = useJobForm()
  const [error, setError] = useState<string | null>(null)
  
  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true)
      setError(null)
      
      const result = await createJobPosting(data)
      
      if (result.error) {
        setError(result.error)
        return
      }
      
      if (result.paymentUrl) {
        // For Stripe, redirect to payment URL
        window.location.href = result.paymentUrl
      } else {
        // For Cash payment, redirect to confirmation page
        router.push('/employer/jobs?status=pending')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Card className="p-6 shadow-md">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              {/* Step 1: Basic Job Details */}
              {/* Title, Description, Language, etc. */}
              {/* Include RichTextEditor for description */}
              <h2 className="text-xl font-semibold mb-4">Basic Job Details</h2>
              
              {/* Form fields for step 1 would go here */}
              
              <div className="flex justify-end mt-6">
                <Button 
                  type="button" 
                  onClick={nextStep}
                  className="flex items-center"
                >
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-4">
              {/* Step 2: Requirements & Qualifications */}
              {/* Skills, Education, Experience, etc. */}
              <h2 className="text-xl font-semibold mb-4">Requirements & Qualifications</h2>
              
              {/* Form fields for step 2 would go here */}
              <SkillsSelector control={form.control} />
              <IndustrySelector control={form.control} />
              
              <div className="flex justify-between mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={prevStep}
                  className="flex items-center"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <Button 
                  type="button" 
                  onClick={nextStep}
                  className="flex items-center"
                >
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="space-y-4">
              {/* Step 3: Compensation & Benefits */}
              {/* Salary, Benefits, etc. */}
              <h2 className="text-xl font-semibold mb-4">Compensation & Benefits</h2>
              
              {/* Form fields for step 3 would go here */}
              
              <div className="flex justify-between mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={prevStep}
                  className="flex items-center"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <Button 
                  type="button" 
                  onClick={nextStep}
                  className="flex items-center"
                >
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          
          {step === 4 && (
            <div className="space-y-4">
              {/* Step 4: Job Posting Settings */}
              {/* Duration, Payment Method, etc. */}
              <h2 className="text-xl font-semibold mb-4">Posting Settings & Payment</h2>
              
              {/* Form fields for step 4 would go here */}
              
              <div className="flex justify-between mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={prevStep}
                  className="flex items-center"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Job Posting'}
                </Button>
              </div>
            </div>
          )}
          
          <div className="pt-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round((step / totalSteps) * 100)}% complete</span>
            </div>
            <div className="mt-2 h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300" 
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </form>
      </Form>
    </Card>
  )
}
```

#### Select Components

##### Skills Selector (`_components/SkillsSelector.tsx`)
```tsx
'use client'

import { useState, useEffect } from 'react'
import { Control, useController } from 'react-hook-form'
import { 
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from '@/components/ui/form'
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, X, ChevronsUpDown } from 'lucide-react'
import { JobFormValues } from '../_utils/validation'
import { cn } from '@/lib/utils'

interface Skill {
  id: string
  name: string
}

export default function SkillsSelector({ control }: { control: Control<JobFormValues> }) {
  const [skills, setSkills] = useState<Skill[]>([])
  const [open, setOpen] = useState(false)
  
  // In a real app, you'd fetch skills from API/DB
  useEffect(() => {
    // Simulating API call to get skills
    setSkills([
      { id: '1', name: 'JavaScript' },
      { id: '2', name: 'TypeScript' },
      { id: '3', name: 'React' },
      { id: '4', name: 'Next.js' },
      { id: '5', name: 'Node.js' }
    ])
  }, [])
  
  const { field, fieldState } = useController({
    name: 'skillIds',
    control
  })
  
  // Filter skills that are already selected
  const availableSkills = skills.filter(
    skill => !field.value.includes(skill.id)
  )
  
  const selectedSkills = skills.filter(
    skill => field.value.includes(skill.id)
  )
  
  const handleSelect = (skillId: string) => {
    field.onChange([...field.value, skillId])
    setOpen(false)
  }
  
  const handleRemove = (skillId: string) => {
    field.onChange(field.value.filter(id => id !== skillId))
  }
  
  return (
    <FormField
      control={control}
      name="skillIds"
      render={() => (
        <FormItem className="flex flex-col">
          <FormLabel>Required Skills</FormLabel>
          
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedSkills.map(skill => (
              <Badge key={skill.id} variant="secondary" className="flex items-center gap-1">
                {skill.name}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleRemove(skill.id)}
                />
              </Badge>
            ))}
          </div>
          
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="justify-between"
              >
                {selectedSkills.length > 0 
                  ? `${selectedSkills.length} skill${selectedSkills.length > 1 ? 's' : ''} selected`
                  : "Select skills..."
                }
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start">
              <Command>
                <CommandInput placeholder="Search skills..." />
                <CommandList>
                  <CommandEmpty>No skills found.</CommandEmpty>
                  <CommandGroup>
                    {availableSkills.map(skill => (
                      <CommandItem
                        key={skill.id}
                        value={skill.name}
                        onSelect={() => handleSelect(skill.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            field.value.includes(skill.id) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {skill.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
```

##### Industry Selector (`_components/IndustrySelector.tsx`)
```tsx
'use client'

import { useState, useEffect } from 'react'
import { Control, useController } from 'react-hook-form'
import { 
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from '@/components/ui/form'
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, X, ChevronsUpDown } from 'lucide-react'
import { JobFormValues } from '../_utils/validation'
import { cn } from '@/lib/utils'

interface Industry {
  id: string
  name: string
}

export default function IndustrySelector({ control }: { control: Control<JobFormValues> }) {
  const [industries, setIndustries] = useState<Industry[]>([])
  const [open, setOpen] = useState(false)
  
  // In a real app, you'd fetch industries from API/DB
  useEffect(() => {
    // Simulating API call to get industries
    setIndustries([
      { id: '1', name: 'Technology' },
      { id: '2', name: 'Finance' },
      { id: '3', name: 'Healthcare' },
      { id: '4', name: 'Education' },
      { id: '5', name: 'Hospitality' }
    ])
  }, [])
  
  const { field, fieldState } = useController({
    name: 'industryIds',
    control
  })
  
  // Filter industries that are already selected
  const availableIndustries = industries.filter(
    industry => !field.value.includes(industry.id)
  )
  
  const selectedIndustries = industries.filter(
    industry => field.value.includes(industry.id)
  )
  
  const handleSelect = (industryId: string) => {
    field.onChange([...field.value, industryId])
    setOpen(false)
  }
  
  const handleRemove = (industryId: string) => {
    field.onChange(field.value.filter(id => id !== industryId))
  }
  
  return (
    <FormField
      control={control}
      name="industryIds"
      render={() => (
        <FormItem className="flex flex-col">
          <FormLabel>Job Industries</FormLabel>
          
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedIndustries.map(industry => (
              <Badge key={industry.id} variant="secondary" className="flex items-center gap-1">
                {industry.name}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleRemove(industry.id)}
                />
              </Badge>
            ))}
          </div>
          
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="justify-between"
              >
                {selectedIndustries.length > 0 
                  ? `${selectedIndustries.length} industr${selectedIndustries.length > 1 ? 'ies' : 'y'} selected`
                  : "Select industries..."
                }
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start">
              <Command>
                <CommandInput placeholder="Search industries..." />
                <CommandList>
                  <CommandEmpty>No industries found.</CommandEmpty>
                  <CommandGroup>
                    {availableIndustries.map(industry => (
                      <CommandItem
                        key={industry.id}
                        value={industry.name}
                        onSelect={() => handleSelect(industry.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            field.value.includes(industry.id) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {industry.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
```

#### Server Action (`_actions.ts`)
```tsx
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import { jobFormSchema } from './_utils/validation'
import { 
  getEmployerProfile, 
  insertNewJob 
} from './_queries'
import { jobStatusEnum } from '@/lib/db/schema'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

// Helper to calculate expiresAt based on duration
function calculateExpiryDate(durationMonths: number): Date {
  const expiryDate = new Date()
  expiryDate.setMonth(expiryDate.getMonth() + durationMonths)
  return expiryDate
}

export async function createJobPosting(formData: z.infer<typeof jobFormSchema>) {
  try {
    // Validate form data
    const validatedData = jobFormSchema.parse(formData)
    
  try {
    const user = await getUser();
    if (!user) {
      // Early exit for unauthorized user
      return { success: false, message: 'Unauthorized' };
    }

    // --- Combined Query using INNER JOIN ---
   const result = await db()
      .select({ /* ... fields ... */ })
      .from(profiles)
      .innerJoin(employerProfiles, and(
          eq(profiles.id, employerProfiles.profileId),
          eq(employerProfiles.deleted, false) // Ensure employer profile isn't deleted
      ))
      .where(and(
          eq(profiles.userId, user.id),
          eq(profiles.deleted, false) // Ensure base profile isn't deleted
      ))
      .limit(1)
      .then(res => res[0]);

    // --- Check the result of the single query ---
    if (!result) {
      return { success: false, message: 'Employer profile not found' }; // Or a more generic "Access denied"
    }

  } catch (error) {
    console.error("Error checking employer access:", error);
    // Handle potential database errors or other exceptions
    return { success: false, message: 'An internal error occurred' };
  }
    
    // Calculate expiry date based on duration
    const expiresAt = calculateExpiryDate(validatedData.jobDuration)
    
    // Determine initial job status based on payment method
    const initialStatus = validatedData.paymentMethod === 'cash' 
      ? jobStatusEnum.enumValues[1] // 'PENDING_PAYMENT'
      : jobStatusEnum.enumValues[0] // 'DRAFT'
    
    // Generate a simple slug
    const slug = `${validatedData.title.toLowerCase().replace(/\s+/g, '-')}-${uuidv4().slice(0, 8)}`
    
    // Extract data needed for job creation
    const jobData = {
      ...validatedData,
      companyId: employerProfile.id,
      status: initialStatus,
      expiresAt,
      slug
    }
    
    // Remove payment-specific fields
    delete jobData.jobDuration
    delete jobData.paymentMethod
    
    // Insert the job (and related records)
    const newJob = await insertNewJob(
      jobData, 
      validatedData.skillIds, 
      validatedData.industryIds
    )
    
    // Create payment record if needed
    // This would be implemented in a real app with actual payment processing
    
    // Handle payment method
    if (validatedData.paymentMethod === 'stripe') {
      // In a real app, we would create a Stripe payment session
      // Mock for demo purposes
      const stripePaymentUrl = `/employer/stripe-mock?jobId=${newJob.id}&amount=${validatedData.jobDuration * 100}`
      return { jobId: newJob.id, paymentUrl: stripePaymentUrl }
    } else {
      // Cash payment
      // In a real app, we might create a payment record with 'pending' status
      
      // Redirect to job listing with pending status
      revalidatePath('/employer/jobs')
      return { jobId: newJob.id, status: 'pending' }
    }
  } catch (error) {
    console.error('Error creating job posting:', error)
    if (error instanceof z.ZodError) {
      return { error: 'Invalid form data. Please check your entries.' }
    }
    return { error: 'Failed to create job posting. Please try again.' }
  }
}
```

#### Database Queries (`_queries.ts`)
```tsx
'use server'

import { db } from '@/lib/db'
import { 
  employerProfiles, 
  jobs, 
  jobSkills, 
  jobIndustries 
} from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import type { NewJob, NewJobSkill, NewJobIndustry } from '@/lib/db/schema'

// Get employer profile for a user
export async function getEmployerProfile(userId: string) {
  try {
    const result = await db()
      .select()
      .from(employerProfiles)
      .innerJoin(
        profiles, 
        and(
          eq(profiles.id, employerProfiles.profileId),
          eq(profiles.userId, userId)
        )
      )
      .limit(1)
    
    return result.length > 0 ? result[0].employerProfiles : null
  } catch (error) {
    console.error('Error getting employer profile:', error)
    return null
  }




  
}

// Insert a new job with related skills and industries
export async function insertNewJob(
  jobData: Omit<NewJob, 'id' | 'createdAt' | 'updatedAt'>,
  skillIds: string[],
  industryIds: string[]
) {
  try {
    // Using a transaction to ensure all related records are created
    return await db().transaction(async (tx) => {
      // Insert the job
      const [newJob] = await tx
        .insert(jobs)
        .values(jobData)
        .returning()
      
      // Insert job skills
      if (skillIds.length > 0) {
        const jobSkillsData: NewJobSkill[] = skillIds.map(skillId => ({
          jobId: newJob.id,
          skillId
        }))
        
        await tx
          .insert(jobSkills)
          .values(jobSkillsData)
      }
      
      // Insert job industries
      if (industryIds.length > 0) {
        const jobIndustriesData: NewJobIndustry[] = industryIds.map(industryId => ({
          jobId: newJob.id,
          industryId
        }))
        
        await tx
          .insert(jobIndustries)
          .values(jobIndustriesData)
      }
      
      return newJob
    })
  } catch (error) {
    console.error('Error inserting new job:', error)
    throw error
  }
}
```

## 3. Employer Job Postings View

### Target Location
`app/(dashboard)/employer/jobs/`

### Implementation Details

#### File Structure
```
app/
└── (dashboard)/
    └── employer/
        └── jobs/
            ├── page.tsx               # Main page for job listings
            ├── _components/           # UI components
            │   └── JobsDataTable.tsx  # Table to display jobs
            ├── _actions.ts            # Actions for job operations
            └── _queries.ts            # Database queries
```

#### Page Component (`page.tsx`)
```tsx
import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getEmployerJobs } from './_queries'
import JobsDataTable from './_components/JobsDataTable'

export default async function EmployerJobsPage({
  searchParams
}: {
  searchParams: { status?: string }
}) {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Get jobs posted by the employer
  const jobs = await getEmployerJobs(user.id)
  
  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Job Postings</h1>
        
        {searchParams.status === 'pending' && (
          <div className="bg-yellow-50 text-yellow-800 px-4 py-2 rounded-md">
            Your job posting is awaiting payment approval.
          </div>
        )}
      </div>
      
      <JobsDataTable jobs={jobs} />
    </div>
  )
}
```

#### Jobs DataTable Component (`_components/JobsDataTable.tsx`)
```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Eye, 
  Edit, 
  MoreHorizontal,
  Users,
  RefreshCcw
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import type { Job } from '@/lib/db/schema'

interface JobWithApplicationCount extends Job {
  applicationCount?: number
}

interface JobsDataTableProps {
  jobs: JobWithApplicationCount[]
}

export default function JobsDataTable({ jobs }: JobsDataTableProps) {
  // In a larger app, this would use a more complete table solution
  // like TanStack Table for sorting, filtering, pagination
  
  if (jobs.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground mb-4">You haven't posted any jobs yet.</p>
        <Button asChild>
          <Link href="/employer/jobs/new">Post a Job</Link>
        </Button>
      </div>
    )
  }
  
  // Format date function
  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success">Active</Badge>
      case 'PENDING_PAYMENT':
        return <Badge variant="warning">Pending Payment</Badge>
      case 'DRAFT':
        return <Badge variant="outline">Draft</Badge>
      case 'EXPIRED':
        return <Badge variant="destructive">Expired</Badge>
      case 'FILLED':
        return <Badge variant="default">Filled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }
  
  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Posted</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead className="text-center">Applicants</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell className="font-medium">{job.title}</TableCell>
              <TableCell>{getStatusBadge(job.status)}</TableCell>
              <TableCell>{formatDate(job.publishedAt)}</TableCell>
              <TableCell>{formatDate(job.expiresAt)}</TableCell>
              <TableCell className="text-center">
                {job.applicationCount || 0}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/jobs/${job.slug}`} className="cursor-pointer">
                        <Eye className="mr-2 h-4 w-4" />
                        View Posting
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/employer/jobs/${job.id}/applicants`} className="cursor-pointer">
                        <Users className="mr-2 h-4 w-4" />
                        View Applicants
                      </Link>
                    </DropdownMenuItem>
                    {job.status === 'EXPIRED' && (
                      <DropdownMenuItem asChild>
                        <Link href={`/employer/jobs/${job.id}/renew`} className="cursor-pointer">
                          <RefreshCcw className="mr-2 h-4 w-4" />
                          Renew Posting
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {['DRAFT', 'PENDING_PAYMENT'].includes(job.status) && (
                      <DropdownMenuItem asChild>
                        <Link href={`/employer/jobs/${job.id}/edit`} className="cursor-pointer">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Posting
                        </Link>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
```

#### Database Queries for Job Listings (`_queries.ts`)
```tsx
'use server'

import { db } from '@/lib/db'
import { 
  profiles, 
  employerProfiles, 
  jobs, 
  applications 
} from '@/lib/db/schema'
import { eq, and, count } from 'drizzle-orm'

// Get all jobs posted by the employer with application counts
export async function getEmployerJobs(userId: string) {
  try {
    // First get the employer profile
    const employerProfileResult = await db()
      .select()
      .from(employerProfiles)
      .innerJoin(
        profiles, 
        and(
          eq(profiles.id, employerProfiles.profileId),
          eq(profiles.userId, userId)
        )
      )
      .limit(1)
    
    if (employerProfileResult.length === 0) {
      return []
    }
    
    const employerProfile = employerProfileResult[0].employerProfiles
    
    // Then get all jobs with application counts
    const jobsWithCounts = await db()
      .select({
        job: jobs,
        applicationCount: count(applications.id).as('applicationCount')
      })
      .from(jobs)
      .where(eq(jobs.companyId, employerProfile.id))
      .leftJoin(applications, eq(applications.jobId, jobs.id))
      .groupBy(jobs.id)
      .orderBy(desc(jobs.createdAt))
    
    return jobsWithCounts.map(({ job, applicationCount }) => ({
      ...job,
      applicationCount
    }))
  } catch (error) {
    console.error('Error fetching employer jobs:', error)
    return []
  }
}
```

## Conclusion

This implementation plan provides a comprehensive approach to building the Job Posting feature for the Ligaye.com platform following Vertical Slice Architecture. The implementation includes:

1. A responsive employer dashboard sidebar navigation
2. A multi-step job posting form with comprehensive fields and validation
3. Payment method handling for both Stripe and Cash options
4. A job listings view for employers to manage their postings

The plan follows the project's architectural principles:
- Feature slices are properly segmented in the app router structure
- Components, actions, queries, utils, and hooks are co-located within their feature slices
- Server Components and Client Components are appropriately separated
- Data flow follows the established patterns: UI -> Server Action -> Queries -> Database
- TypeScript is used throughout with proper typing

This implementation also considers key technical aspects like form validation, user experience, responsive design, and error handling to ensure a robust and user-friendly feature.
