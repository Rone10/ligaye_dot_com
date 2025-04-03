'use client'

import { format } from 'date-fns'
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import StatusBadge from '../../_components/StatusBadge'
import Link from 'next/link'
import { ExternalLink, FileText, Calendar } from 'lucide-react'

interface ApplicationDetailsProps {
  application: {
    id: string
    status: string
    appliedAt: Date
    updatedAt: Date
    coverLetterText: string | null
    coverLetterUrl: string | null
    coverLetterFilename: string | null
    resumeUrl: string | null
    resumeFilename: string | null
    notes: string | null
    interviewDate: Date | null
  }
  job: {
    id: string
    title: string
    description: string
    workLocation: string
    jobType: string
  }
}

export default function ApplicationDetails({ application, job }: ApplicationDetailsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Application Details</CardTitle>
              <CardDescription>Review the application for {job.title}</CardDescription>
            </div>
            <StatusBadge status={application.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Applied For</h3>
            <div className="flex items-center gap-2">
              <Link href={`/employer/jobs/${job.id}`} className="text-blue-600 hover:underline flex items-center gap-1">
                {job.title} <ExternalLink size={14} />
              </Link>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="outline">{job.jobType}</Badge>
              <Badge variant="outline">{job.workLocation}</Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Applied On</h3>
              <p>{format(new Date(application.appliedAt), 'PPP')}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h3>
              <p>{format(new Date(application.updatedAt), 'PPP')}</p>
            </div>
            
            {application.interviewDate && (
              <div className="col-span-1 md:col-span-2 bg-purple-50 p-3 rounded-md flex items-center gap-3">
                <Calendar className="text-purple-500" />
                <div>
                  <h3 className="font-medium">Interview Scheduled</h3>
                  <p className="text-sm">{format(new Date(application.interviewDate), 'PPP p')}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-500">Application Documents</h3>
            
            <div className="space-y-2">
              {application.resumeUrl ? (
                <a 
                  href={application.resumeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:underline"
                >
                  <FileText size={16} />
                  {application.resumeFilename || 'Resume'}
                </a>
              ) : (
                <p className="text-sm text-gray-500">No resume uploaded</p>
              )}
              
              {application.coverLetterUrl && (
                <a 
                  href={application.coverLetterUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:underline"
                >
                  <FileText size={16} />
                  {application.coverLetterFilename || 'Cover Letter'}
                </a>
              )}
            </div>
          </div>
          
          {application.coverLetterText && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Cover Letter</h3>
              <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
                {application.coverLetterText}
              </div>
            </div>
          )}
          
          {application.notes && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Notes</h3>
              <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
                {application.notes}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 