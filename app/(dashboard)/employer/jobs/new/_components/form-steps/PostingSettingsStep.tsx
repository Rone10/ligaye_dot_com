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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { CalendarIcon, ArrowLeft, Loader2 } from 'lucide-react'
import { JobFormValues } from '../../_utils/validation'
import { applicationMethodEnum } from '@/lib/db/schema'
import { cn } from '@/lib/utils'

interface PostingSettingsStepProps {
  form: UseFormReturn<JobFormValues>
  onPrevious: () => void
  isSubmitting: boolean
}

export default function PostingSettingsStep({ form, onPrevious, isSubmitting }: PostingSettingsStepProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4 text-[#1a1e2d]">Posting Settings & Payment</h2>
      
      <FormField
        control={form.control}
        name="applicationMethod"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Application Method</FormLabel>
            <Select 
              value={field.value} 
              onValueChange={field.onChange}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select application method" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {applicationMethodEnum.enumValues.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value === 'PLATFORM' ? 'Apply Through Platform' : 
                     value === 'EMAIL' ? 'Apply via Email' :
                     value === 'WEBSITE' ? 'Apply on Company Website' :
                     value === 'PHONE' ? 'Apply by Phone' : 'Apply in Person'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              How should candidates apply to this job?
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {form.watch('applicationMethod') === 'EMAIL' && (
        <FormField
          control={form.control}
          name="applicationEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Application Email</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g. jobs@company.com" 
                  type="email"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Email address where applications should be sent
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      
      {form.watch('applicationMethod') === 'WEBSITE' && (
        <FormField
          control={form.control}
          name="applicationUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Application URL</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g. https://company.com/careers/job123" 
                  type="url"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                URL where candidates can apply
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      
      <FormField
        control={form.control}
        name="applicationInstructions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Application Instructions</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Provide any specific instructions for applicants..." 
                {...field} 
                className="min-h-[100px]"
              />
            </FormControl>
            <FormDescription>
              Additional instructions for applicants
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="applicationDeadline"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Application Deadline</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Last date candidates can submit applications
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="plannedStartDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Planned Start Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                When do you expect the successful candidate to start?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="resumeRequired"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Resume Required</FormLabel>
                <FormDescription>
                  Require candidates to submit a resume
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
        
        <FormField
          control={form.control}
          name="allowCandidateContact"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Allow Candidate Contact</FormLabel>
                <FormDescription>
                  Allow candidates to contact you directly
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
      </div>
      
      <FormField
        control={form.control}
        name="jobDuration"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Posting Duration</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                min={1} 
                max={12}
                placeholder="e.g. 1" 
                {...field} 
                onChange={(e) => field.onChange(parseInt(e.target.value))}
              />
            </FormControl>
            <FormDescription>
              How many months should this job posting be active? (1-12 months)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="paymentMethod"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Payment Method</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="stripe" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Pay Online (Stripe)
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="cash" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Pay with Cash (Manual Approval)
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormDescription>
              Select how you'd like to pay for this job posting
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="flex justify-between mt-8">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onPrevious}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <Button 
          type="submit"
          disabled={isSubmitting}
          className="bg-[#4a6cfa] hover:bg-[#7b90ff] transition-colors duration-300 flex items-center"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Job Posting'
          )}
        </Button>
      </div>
    </div>
  )
} 