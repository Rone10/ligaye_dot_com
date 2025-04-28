'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import StatusBadge from '../../_components/StatusBadge'
import { updateStatus } from '../_actions'
import { ApplicationStatus } from '@/types/application'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { format, parseISO } from 'date-fns'
import { Textarea } from '@/components/ui/textarea'
import { FormControl, FormDescription, FormMessage } from '@/components/ui/form'

interface StatusUpdateFormProps {
  applicationId: string
  currentStatus: string
  currentInterviewDate?: Date | null
  currentNotes?: string | null
}

export default function StatusUpdateForm({ 
  applicationId, 
  currentStatus, 
  currentInterviewDate = null,
  currentNotes = null
}: StatusUpdateFormProps) {
  const [status, setStatus] = useState(currentStatus)
  const [isUpdating, setIsUpdating] = useState(false)
  const [interviewDate, setInterviewDate] = useState<string>(
    currentInterviewDate 
      ? format(new Date(currentInterviewDate), "yyyy-MM-dd'T'HH:mm") 
      : ''
  )
  const [notes, setNotes] = useState(currentNotes || '')
  
  const showInterviewFields = status === 'INTERVIEW_SCHEDULED'
  
  const handleSubmit = async () => {
    if (status === 'INTERVIEW_SCHEDULED' && !interviewDate) {
      toast.error('Please select a date and time for the interview')
      return
    }
    
    if (status === currentStatus && interviewDate === (currentInterviewDate ? format(new Date(currentInterviewDate), "yyyy-MM-dd'T'HH:mm") : '') && notes === (currentNotes || '')) {
      toast.info('No changes to update')
      return
    }
    
    setIsUpdating(true)
    
    try {
      // Convert the interviewDate to ISO format for backend validation
      let formattedInterviewDate = undefined
      if (showInterviewFields && interviewDate) {
        try {
          // Ensure the date has seconds and milliseconds for proper ISO format
          const dateObj = new Date(interviewDate)
          formattedInterviewDate = dateObj.toISOString()
        } catch (e) {
          toast.error('Invalid date format')
          setIsUpdating(false)
          return
        }
      }
      
      const result = await updateStatus(applicationId, { 
        status: status as ApplicationStatus,
        ...(showInterviewFields && formattedInterviewDate && { interviewDate: formattedInterviewDate }),
        ...(showInterviewFields && { notes })
      })
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(
          status === 'INTERVIEW_SCHEDULED' 
            ? 'Interview scheduled successfully' 
            : 'Application status updated'
        )
      }
    } catch (error) {
      toast.error('Failed to update status')
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }
  
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col">
          <span className="text-sm font-medium mb-1">Current Status</span>
          <StatusBadge status={currentStatus} />
        </div>
      </div>
      
      <div className="flex flex-col space-y-4">
        <div>
          <span className="text-sm font-medium mb-2 block">Update Status</span>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="APPLIED">Applied</SelectItem>
              <SelectItem value="REVIEWING">Reviewing</SelectItem>
              <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
              <SelectItem value="INTERVIEW_SCHEDULED">Interview Scheduled</SelectItem>
              <SelectItem value="INTERVIEWED">Interviewed</SelectItem>
              <SelectItem value="OFFER_EXTENDED">Offer Extended</SelectItem>
              <SelectItem value="HIRED">Hired</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {showInterviewFields && (
          <>
            <div className="space-y-2 mt-4">
              <Label htmlFor="interview-date">Interview Date & Time</Label>
              <FormControl>
                <Input
                  id="interview-date"
                  type="datetime-local"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0] + 'T00:00'}
                />
              </FormControl>
              {currentInterviewDate && (
                <FormDescription>
                  Current: {format(new Date(currentInterviewDate), 'dd/MM/yyyy p')}
                </FormDescription>
              )}
              <FormMessage />
            </div>
            
            <div className="space-y-2 mt-4">
              <Label htmlFor="notes">Interview Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your notes about this candidate for future reference..."
                className="h-32"
              />
            </div>
          </>
        )}
        
        <Button 
          onClick={handleSubmit} 
          disabled={isUpdating || (status === currentStatus && (!showInterviewFields || (interviewDate === (currentInterviewDate ? format(new Date(currentInterviewDate), "yyyy-MM-dd'T'HH:mm") : '') && notes === (currentNotes || ''))))}
          className="mt-2"
        >
          {isUpdating 
            ? 'Updating...' 
            : status === 'INTERVIEW_SCHEDULED' 
              ? (currentStatus === 'INTERVIEW_SCHEDULED' ? 'Update Interview' : 'Schedule Interview') 
              : 'Update Status'
          }
        </Button>
      </div>
    </div>
  )
} 