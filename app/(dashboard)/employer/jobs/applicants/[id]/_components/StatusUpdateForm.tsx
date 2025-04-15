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
import { updateApplicationStatus } from '../../_actions'
import { ApplicationStatus } from '@/types/application'

interface StatusUpdateFormProps {
  applicationId: string
  currentStatus: string
}

export default function StatusUpdateForm({ applicationId, currentStatus }: StatusUpdateFormProps) {
  const [status, setStatus] = useState(currentStatus)
  const [isUpdating, setIsUpdating] = useState(false)
  
  const handleStatusChange = async () => {
    if (status === currentStatus) return
    
    setIsUpdating(true)
    
    try {
      const result = await updateApplicationStatus(applicationId, status as ApplicationStatus)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Application status updated')
      }
    } catch (error) {
      toast.error('Failed to update status')
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }
  
  return (
    <div className="flex flex-col">
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
        
        <Button 
          onClick={handleStatusChange} 
          disabled={isUpdating || status === currentStatus}
        >
          {isUpdating ? 'Updating...' : 'Update Status'}
        </Button>
      </div>
    </div>
  )
} 