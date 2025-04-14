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
import { formatEnumValue } from '@/lib/utils'

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
  // Parse HTML and preserve formatting in cover letter text
  const parseCoverLetterText = (text: string) => {
    if (!text) return '';
    
    // Replace HTML entities first
    let parsedText = text
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&nbsp;/g, ' ');
    
    // Replace paragraph tags with appropriate markup
    parsedText = parsedText
      .replace(/<p\s*[^>]*>/g, '<div class="mb-4">')
      .replace(/<\/p>/g, '</div>')
      .replace(/<br\s*\/?>/g, '<br />');
    
    // Handle headers with proper styling
    parsedText = parsedText
      .replace(/<h1\s*[^>]*>(.*?)<\/h1>/g, '<div class="text-3xl font-bold mb-4">$1</div>')
      .replace(/<h2\s*[^>]*>(.*?)<\/h2>/g, '<div class="text-2xl font-bold mb-3">$1</div>')
      .replace(/<h3\s*[^>]*>(.*?)<\/h3>/g, '<div class="text-xl font-bold mb-2">$1</div>')
      .replace(/<h4\s*[^>]*>(.*?)<\/h4>/g, '<div class="text-lg font-semibold mb-2">$1</div>')
      .replace(/<h5\s*[^>]*>(.*?)<\/h5>/g, '<div class="text-base font-semibold mb-1">$1</div>')
      .replace(/<h6\s*[^>]*>(.*?)<\/h6>/g, '<div class="text-sm font-semibold mb-1">$1</div>');
    
    // Preserve text formatting
    parsedText = parsedText
      .replace(/<strong\s*[^>]*>(.*?)<\/strong>/g, '<span class="font-bold">$1</span>')
      .replace(/<b\s*[^>]*>(.*?)<\/b>/g, '<span class="font-bold">$1</span>')
      .replace(/<em\s*[^>]*>(.*?)<\/em>/g, '<span class="italic">$1</span>')
      .replace(/<i\s*[^>]*>(.*?)<\/i>/g, '<span class="italic">$1</span>')
      .replace(/<u\s*[^>]*>(.*?)<\/u>/g, '<span class="underline">$1</span>');
    
    // Handle lists
    parsedText = parsedText
      .replace(/<ul\s*[^>]*>/g, '<div class="pl-6 mb-4 space-y-1">')
      .replace(/<\/ul>/g, '</div>')
      .replace(/<ol\s*[^>]*>/g, '<div class="pl-6 mb-4 space-y-1 list-decimal">')
      .replace(/<\/ol>/g, '</div>')
      .replace(/<li\s*[^>]*>(.*?)<\/li>/g, '<div class="flex"><span class="mr-2">•</span><span>$1</span></div>');
    
    // Clean up any potentially unsafe tags while keeping our safe ones
    const safeTagsRegex = /<(?!\/?(div|span|br)(?!\w)[^>]*>)([^>]*)>/g;
    parsedText = parsedText.replace(safeTagsRegex, '');
    
    return parsedText;
  };

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
              <Badge variant="outline">{formatEnumValue(job.jobType)}</Badge>
              <Badge variant="outline">{formatEnumValue(job.workLocation)}</Badge>
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
              <div className="bg-gray-50 p-4 rounded-md">
                <div 
                  className="prose prose-sm max-w-none" 
                  dangerouslySetInnerHTML={{ __html: parseCoverLetterText(application.coverLetterText) }}
                />
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