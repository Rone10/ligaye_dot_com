'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  BadgeCheck, 
  Calendar, 
  Clock, 
  Edit, 
  Eye, 
  FileText, 
  MoreHorizontal, 
  Users,
  Ban,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { formatDate, formatJobStatus } from '../_utils/formatters'
import { updateJobStatus } from '../_actions'

interface JobHeaderProps {
  job: any
  applicationsCount: number
}

export default function JobHeader({ job, applicationsCount }: JobHeaderProps) {
  const router = useRouter()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [actionType, setActionType] = useState<'FILLED' | 'EXPIRED' | 'DELETED'>('FILLED')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const statusInfo = formatJobStatus(job.status)
  
  const handleStatusUpdate = async () => {
    setIsSubmitting(true)
    try {
      const result = await updateJobStatus(job.id, actionType)
      if (result.error) {
        console.error(result.error)
      } else {
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to update job status:", error)
    } finally {
      setIsSubmitting(false)
      setIsConfirmOpen(false)
    }
  }
  
  const confirmStatusChange = (status: 'FILLED' | 'EXPIRED' | 'DELETED') => {
    setActionType(status)
    setIsConfirmOpen(true)
  }
  
  const actionMessages = {
    FILLED: {
      title: "Mark Job as Filled",
      description: "Are you sure you want to mark this job as filled? This will stop new applications from coming in."
    },
    EXPIRED: {
      title: "Mark Job as Expired",
      description: "Are you sure you want to mark this job as expired? This will stop new applications from coming in."
    },
    DELETED: {
      title: "Delete Job Posting",
      description: "Are you sure you want to delete this job posting? This action cannot be undone."
    }
  }
  
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold text-theme-dark sm:text-3xl">{job.title}</h1>
          <Badge variant="outline" className={`ml-2 ${statusInfo.color}`}>
            {statusInfo.label}
          </Badge>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 text-sm bg-muted/70 p-2.5 rounded-lg border border-border shadow-sm">
          {job.publishedAt && (
            <div className="flex items-center px-2.5 py-1 rounded-full bg-background border border-border">
              <Calendar className="mr-1.5 h-4 w-4 text-primary-blue" />
              <span className="font-medium">Posted: {formatDate(job.publishedAt)}</span>
            </div>
          )}
          
          {job.expiresAt && (
            <div className="flex items-center px-2.5 py-1 rounded-full bg-background border border-border">
              <Clock className="mr-1.5 h-4 w-4 text-primary-blue" />
              <span className="font-medium">Expires: {formatDate(job.expiresAt)}</span>
            </div>
          )}
          
          <div className="flex items-center px-2.5 py-1 rounded-full bg-background border border-border">
            <Users className="mr-1.5 h-4 w-4 text-primary-blue" />
            <span className="font-medium">{applicationsCount} Applications</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-3">
        <Link href={`/jobs/${job.id}`} target="_blank">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>View Public</span>
          </Button>
        </Link>
        
        <Link href={`/employer/jobs/${job.id}/edit`}>
          <Button variant="outline" size="sm" className="flex items-center gap-1 bg-background">
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </Button>
        </Link>
        
        <Link href={`/employer/jobs/${job.id}/applications`}>
          <Button size="sm" className="flex items-center gap-1 bg-primary-blue hover:bg-primary-blue-light text-white">
            <FileText className="h-4 w-4" />
            <span>Applications</span>
          </Button>
        </Link>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="border-gray-200">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {job.status !== 'FILLED' && (
              <DropdownMenuItem onClick={() => confirmStatusChange('FILLED')}>
                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                <span>Mark as Filled</span>
              </DropdownMenuItem>
            )}
            
            {job.status !== 'EXPIRED' && (
              <DropdownMenuItem onClick={() => confirmStatusChange('EXPIRED')}>
                <Ban className="mr-2 h-4 w-4 text-amber-600" />
                <span>Mark as Expired</span>
              </DropdownMenuItem>
            )}
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={() => confirmStatusChange('DELETED')}
              className="text-red-600 focus:text-red-600"
            >
              <span>Delete Job</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{actionMessages[actionType].title}</AlertDialogTitle>
            <AlertDialogDescription>
              {actionMessages[actionType].description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault()
                handleStatusUpdate()
              }}
              disabled={isSubmitting}
              className={actionType === 'DELETED' ? 'bg-red-600 hover:bg-red-700' : undefined}
            >
              {isSubmitting ? 'Processing...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 