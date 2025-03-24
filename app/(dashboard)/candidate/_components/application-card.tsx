"use client"

import { format } from "date-fns"
import Link from "next/link"
import { ArrowUpRight, Building, CalendarIcon, Clock, FileText, MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { applicationStatusMap } from "@/lib/constants"

type ApplicationCardProps = {
  application: any // Type would be refined in a real implementation
  job: any
  employer: any
}

export function ApplicationCard({ application, job, employer }: ApplicationCardProps) {
  const statusColor = getStatusColor(application.status)
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold hover:text-primary transition-colors">
              <Link href={`/jobs/${job.id}`} className="hover:underline focus:outline-none focus:underline">
                {job.title}
              </Link>
            </CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <Building className="h-3.5 w-3.5" />
              <span>{employer.companyName}</span>
            </CardDescription>
          </div>
          <Badge variant={statusColor as any}>
            {applicationStatusMap[application.status] || application.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            {job.jobType && (
              <div className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                <span>{job.jobType.replace(/_/g, ' ')}</span>
              </div>
            )}
            
            {job.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                <span>{job.location}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>Applied {formatDate(application.appliedAt)}</span>
            </div>
          </div>
          
          {application.interviewDate && (
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="h-4 w-4 text-primary" />
              <span className="font-medium">
                Interview scheduled: {format(new Date(application.interviewDate), "PPP 'at' p")}
              </span>
            </div>
          )}
          
          {application.coverLetter && (
            <div className="mt-2">
              <h4 className="text-sm font-medium mb-1">Cover Letter</h4>
              <div 
                className="text-sm text-muted-foreground line-clamp-2 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: application.coverLetter
                    .replace(/<[^>]*>/g, ' ')
                    .substring(0, 120) + (application.coverLetter.length > 120 ? '...' : '') 
                }}
              />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-3">
        <div className="text-xs text-muted-foreground">
          Last updated: {formatDate(application.updatedAt)}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            asChild
          >
            <Link href={`/candidate/applications/${application.id}`}>
              View Details
              <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

// Helper function to map status to color variant
function getStatusColor(status: string): "default" | "outline" | "secondary" | "destructive" {
  switch (status) {
    case "PENDING":
    case "REVIEWING":
      return "default"
    case "SHORTLISTED":
    case "INTERVIEW_SCHEDULED":
      return "secondary"
    case "INTERVIEWED":
      return "outline"
    case "OFFER_EXTENDED":
    case "HIRED":
      return "secondary"
    case "REJECTED":
      return "destructive"
    default:
      return "default"
  }
}

// Helper function to format dates
function formatDate(dateString: string | Date) {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  return format(date, "MMM d, yyyy")
} 