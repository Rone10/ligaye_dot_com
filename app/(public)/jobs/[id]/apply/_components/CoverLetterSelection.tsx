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
import { Editor } from "@/components/RichTextEditor/editor"

interface CoverLetterSelectionProps {
  form: UseFormReturn<ApplicationFormValues>
  coverLetterOption: string
}

export function CoverLetterSelection({ 
  form, 
  coverLetterOption 
}: CoverLetterSelectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Cover Letter (Optional)</h2>
      
      <FormField
        control={form.control}
        name="coverLetterOption"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="none" />
                  <Label htmlFor="none" className="cursor-pointer">
                    No cover letter
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="upload" id="cl-upload" />
                  <Label htmlFor="cl-upload" className="cursor-pointer">
                    Upload cover letter file
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="text" id="cl-text" />
                  <Label htmlFor="cl-text" className="cursor-pointer">
                    Write/paste cover letter text
                  </Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Show file upload when "upload" is selected */}
      {coverLetterOption === "upload" && (
        <FormField
          control={form.control}
          name="coverLetterFile"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  type="file"
                  accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => onChange(e.target.files?.[0] || null)}
                  className="cursor-pointer"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      
      {/* Show rich text editor when "text" is selected */}
      {coverLetterOption === "text" && (
        <FormField
          control={form.control}
          name="coverLetterText"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Editor
                  value={field.value || ""}
                  onChange={field.onChange}
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