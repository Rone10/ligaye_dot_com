'use client'

import { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription, 
  FormMessage 
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { workLocationEnum } from '@/lib/db/schema'
import { Editor } from '@/components/RichTextEditor/editor'
import { ArrowRight } from 'lucide-react'
import { JobFormValues } from '../../_utils/validation'

interface BasicDetailsStepProps {
  form: UseFormReturn<JobFormValues>
  onNext: () => void
}

export default function BasicDetailsStep({ form, onNext }: BasicDetailsStepProps) {
  const handleNext = () => {
    const basicFieldsValid = form.trigger([
      'title',
      'description',
      'jobLanguage',
      'numberOfOpenings',
      'workLocation',
      'displayAddress'
    ])
    
    basicFieldsValid.then(isValid => {
      if (isValid) {
        onNext()
      }
    })
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4 text-[#1a1e2d]">Basic Job Details</h2>
      
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Job Title</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Senior Software Engineer" {...field} />
            </FormControl>
            <FormDescription>
              The title of the job position you're hiring for
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Job Description</FormLabel>
            <FormControl>
              <Editor
                value={field.value}
                onChange={field.onChange}
                // placeholder="Describe the job role, responsibilities, and requirements..."
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="jobLanguage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Post Language</FormLabel>
              <Select 
                defaultValue={field.value} 
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="French">French</SelectItem>
                  <SelectItem value="Arabic">Arabic</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="numberOfOpenings"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Openings</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min={1} 
                  {...field} 
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="workLocation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Work Location Type</FormLabel>
            <Select 
              defaultValue={field.value} 
              onValueChange={field.onChange}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select work location type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {workLocationEnum.enumValues.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value === 'ON_SITE' ? 'On-site' : 
                     value === 'HYBRID' ? 'Hybrid' : 'Remote'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              How will the employee work at this job?
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="displayAddress"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Display Location Address</FormLabel>
              <FormDescription>
                Show the job location address in the job listing
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      <div className="flex justify-end mt-8">
        <Button 
          type="button" 
          onClick={handleNext}
          className="bg-[#4a6cfa] hover:bg-[#7b90ff] transition-colors duration-300 flex items-center"
        >
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
} 