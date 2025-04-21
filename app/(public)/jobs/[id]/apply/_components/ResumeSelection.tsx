'use client'

import { UseFormReturn } from "react-hook-form"
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormMessage 
} from "@/components/ui/form"
import { 
  RadioGroup, 
  RadioGroupItem 
} from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ApplicationFormValues } from "../_utils/validation"

interface ResumeSelectionProps {
  form: UseFormReturn<ApplicationFormValues>
  resumeOption: string
  profileResumeFilename: string | null
  isRequired: boolean
}

export function ResumeSelection({ 
  form, 
  resumeOption, 
  profileResumeFilename,
  isRequired
}: ResumeSelectionProps) {
  // Determine if profile resume exists
  const hasProfileResume = !!profileResumeFilename
  
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Resume</h2>
      
      <FormField
        control={form.control}
        name="resumeOption"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                {hasProfileResume && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="profile" id="profile" />
                    <Label htmlFor="profile" className="cursor-pointer">
                      Use profile resume ({profileResumeFilename})
                    </Label>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="upload" id="upload" />
                  <Label htmlFor="upload" className="cursor-pointer">
                    Upload a new resume
                  </Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Show file upload input when "upload" is selected */}
      {resumeOption === "upload" && (
        <FormField
          control={form.control}
          name="resumeFile"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  type="file"
                  accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => onChange(e.target.files?.[0] || null)}
                  required={isRequired}
                  className="cursor-pointer"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  )
} 