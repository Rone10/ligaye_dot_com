'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateStatus } from '../_actions'

interface InterviewSchedulerProps {
  applicationId: string
  currentInterviewDate: Date | null
}

export default function InterviewScheduler({ applicationId, currentInterviewDate }: InterviewSchedulerProps) {
  const [interviewDate, setInterviewDate] = useState<string>(
    currentInterviewDate 
      ? format(new Date(currentInterviewDate), "yyyy-MM-dd'T'HH:mm") 
      : ''
  )
  const [isScheduling, setIsScheduling] = useState(false)
  
  const handleScheduleInterview = async () => {
    if (!interviewDate) {
      toast.error('Please select a date and time for the interview')
      return
    }
    
    setIsScheduling(true)
    
    try {
      const result = await updateStatus(applicationId, {
        status: 'INTERVIEW_SCHEDULED',
        interviewDate: interviewDate
      })
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Interview scheduled successfully')
      }
    } catch (error) {
      toast.error('Failed to schedule interview')
      console.error(error)
    } finally {
      setIsScheduling(false)
    }
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Schedule Interview</h3>
      
      <div className="space-y-2">
        <Label htmlFor="interview-date">Interview Date & Time</Label>
        <Input
          id="interview-date"
          type="datetime-local"
          value={interviewDate}
          onChange={(e) => setInterviewDate(e.target.value)}
          min={new Date().toISOString().split('T')[0] + 'T00:00'}
        />
      </div>
      
      {currentInterviewDate && (
        <div className="text-sm text-gray-500 mt-1">
          Current:{' '}
          {format(new Date(currentInterviewDate), 'dd/MM/yyyy p')}
        </div>
      )}
      
      <Button
        onClick={handleScheduleInterview}
        disabled={isScheduling || !interviewDate}
      >
        {isScheduling 
          ? 'Scheduling...' 
          : currentInterviewDate 
            ? 'Reschedule Interview' 
            : 'Schedule Interview'
        }
      </Button>
    </div>
  )
} 