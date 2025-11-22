'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { applicationStatusEnum } from "@/lib/db/schema"
import { applicationStatusUpdateSchema, type ApplicationStatusUpdateInput } from "../_utils/validation"
import { updateStatus } from "../_actions"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Check, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface UpdateStatusFormProps {
  applicationId: string
  currentStatus: string
}

export default function UpdateStatusForm({ 
  applicationId, 
  currentStatus 
}: UpdateStatusFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // Define form with validation
  const form = useForm<ApplicationStatusUpdateInput>({
    resolver: zodResolver(applicationStatusUpdateSchema),
    defaultValues: {
      status: currentStatus as any,
      interviewDate: undefined,
      notes: undefined,
    },
  })
  
  // Get current selected status to conditionally show fields
  const watchStatus = form.watch("status")
  const showInterviewDate = watchStatus === "INTERVIEW_SCHEDULED"
  
  async function onSubmit(data: ApplicationStatusUpdateInput) {
    setIsSubmitting(true)
    setError(null)
    
    try {
      const result = await updateStatus(applicationId, data)
      
      if (result.success) {
        setSuccess(true)
        const detailPath = `/employer/jobs/applicants/${applicationId}`
        router.refresh()
        setTimeout(() => {
          router.replace(detailPath)
        }, 2000)
      } else {
        setError(result.error || "Failed to update status")
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Success</AlertTitle>
            <AlertDescription className="text-green-700">
              Application status has been updated successfully. 
              The candidate will receive an email notification.
            </AlertDescription>
          </Alert>
        )}
        
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Application Status</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isSubmitting || success}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a new status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {applicationStatusEnum.enumValues.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                This will send an email to the candidate with the updated status.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {showInterviewDate && (
          <FormField
            control={form.control}
            name="interviewDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interview Date & Time</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    disabled={isSubmitting || success}
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormDescription>
                  Set the date and time for the interview.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide any additional information for the candidate"
                  className="resize-none min-h-[100px]"
                  disabled={isSubmitting || success}
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                These notes will be included in the email to the candidate.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          disabled={isSubmitting || success}
          className="w-full sm:w-auto"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {success ? "Status Updated" : "Update Status"}
        </Button>
      </form>
    </Form>
  )
} 