'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from '@/components/ui/form'
import { X } from 'lucide-react'

// Form validation schema
const formSchema = z.object({
  jobTitle: z.string().min(2, { message: 'Job title must be at least 2 characters' }),
  yearsOfExperience: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Years of experience must be a valid number',
  }),
  skills: z.array(z.string()).min(1, { message: 'Please add at least one skill' }),
  bio: z.string().min(10, { message: 'Bio must be at least 10 characters' }).max(500, { message: 'Bio cannot exceed 500 characters' }),
})

type FormValues = z.infer<typeof formSchema>

interface CandidateProfileFormProps {
  initialData: {
    jobTitle: string
    yearsOfExperience: string
    skills: string[]
    bio: string
  }
  isSubmitting: boolean
  onSubmit: (data: FormValues) => void
}

export function CandidateProfileForm({ initialData, isSubmitting, onSubmit }: CandidateProfileFormProps) {
  const [skillInput, setSkillInput] = useState('')
  
  // Initialize form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobTitle: initialData.jobTitle || '',
      yearsOfExperience: initialData.yearsOfExperience || '',
      skills: initialData.skills || [],
      bio: initialData.bio || '',
    },
  })
  
  // Watch current skills array
  const skills = form.watch('skills')

  // Add a skill to the form
  const handleAddSkill = () => {
    if (skillInput.trim() !== '' && !skills.includes(skillInput.trim())) {
      form.setValue('skills', [...skills, skillInput.trim()])
      setSkillInput('')
    }
  }

  // Remove a skill from the form
  const handleRemoveSkill = (skill: string) => {
    form.setValue('skills', skills.filter(s => s !== skill))
  }

  // Handle skill input key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSkill()
    }
  }
  
  // Handle form submission
  const handleSubmit = (values: FormValues) => {
    onSubmit(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Job Title */}
        <FormField
          control={form.control}
          name="jobTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Frontend Developer" {...field} />
              </FormControl>
              <FormDescription>
                Your current job title or the position you're seeking
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Years of Experience */}
        <FormField
          control={form.control}
          name="yearsOfExperience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Years of Experience</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0"
                  placeholder="e.g. 3" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Number of years of professional experience in your field
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Skills */}
        <FormField
          control={form.control}
          name="skills"
          render={() => (
            <FormItem>
              <FormLabel>Skills</FormLabel>
              <div className="flex flex-wrap gap-2 mb-3">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="py-1.5 pl-2">
                    {skill}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 pl-1"
                      onClick={() => handleRemoveSkill(skill)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove {skill}</span>
                    </Button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type a skill and press Enter"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddSkill}
                >
                  Add
                </Button>
              </div>
              <FormDescription>
                Add skills relevant to your profession (e.g. React, JavaScript, Project Management)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Bio / About Me */}
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Professional Bio</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Tell employers about yourself, your experience, and what you're looking for..." 
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
            {isSubmitting ? 'Saving...' : 'Create Candidate Profile'}
          </Button>
        </div>
      </form>
    </Form>
  )
} 