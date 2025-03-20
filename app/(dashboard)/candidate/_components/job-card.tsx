"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowUpRight, Bookmark, Building, Calendar, Clock, CreditCard, FileText, MapPin } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toggleJobSave } from "@/app/actions/candidate/saved-jobs"
import { toast } from "sonner"

type JobCardProps = {
  job: any // Type would be refined in real implementation
  employer: any
  isSaved?: boolean
  hasApplied?: boolean
  showApplyButton?: boolean
  showSaveButton?: boolean
  onApplyClick?: () => void
}

export function JobCard({
  job,
  employer,
  isSaved = false,
  hasApplied = false,
  showApplyButton = true,
  showSaveButton = true,
  onApplyClick
}: JobCardProps) {
  const [saved, setSaved] = useState(isSaved)
  const [isTogglingSave, setIsTogglingSave] = useState(false)
  
  // Format salary display
  const formatSalary = () => {
    if (!job.salaryRangeMin && !job.salaryRangeMax) return null
    
    let salaryText = ""
    const currency = job.salaryCurrency || "GMD"
    
    if (job.salaryRangeMin && job.salaryRangeMax) {
      salaryText = `${currency} ${job.salaryRangeMin.toLocaleString()} - ${job.salaryRangeMax.toLocaleString()}`
    } else if (job.salaryRangeMin) {
      salaryText = `${currency} ${job.salaryRangeMin.toLocaleString()}+`
    } else if (job.salaryRangeMax) {
      salaryText = `Up to ${currency} ${job.salaryRangeMax.toLocaleString()}`
    }
    
    if (job.salaryFrequency) {
      salaryText += ` per ${job.salaryFrequency.toLowerCase()}`
    }
    
    return salaryText
  }
  
  // Handle save/unsave toggle
  const handleSaveToggle = async () => {
    if (isTogglingSave) return
    
    try {
      setIsTogglingSave(true)
      await toggleJobSave(job.id)
      setSaved(!saved)
      toast.success(saved ? "Job removed from saved jobs" : "Job saved successfully")
    } catch (error) {
      console.error("Error toggling job save:", error)
      toast.error("Failed to update saved jobs")
    } finally {
      setIsTogglingSave(false)
    }
  }
  
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
          {job.isActive ? (
            <Badge variant="outline" className="px-2 py-1 bg-primary/10 text-primary border-primary/20">
              Active
            </Badge>
          ) : (
            <Badge variant="outline" className="px-2 py-1 bg-muted text-muted-foreground">
              Closed
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            {job.jobType && (
              <div className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                <span>{job.jobType}</span>
              </div>
            )}
            
            {job.workLocation && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                <span>{job.workLocation}</span>
              </div>
            )}
            
            {formatSalary() && (
              <div className="flex items-center gap-1">
                <CreditCard className="h-3.5 w-3.5" />
                <span>{formatSalary()}</span>
              </div>
            )}
            
            {job.applicationDeadline && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>Deadline: {format(new Date(job.applicationDeadline), "MMM d, yyyy")}</span>
              </div>
            )}
          </div>
          
          {job.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
              {job.description}
            </p>
          )}
          
          {job.experienceLevel && (
            <Badge variant="outline" className="mt-1">
              {job.experienceLevel}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-3">
        <div className="text-xs text-muted-foreground">
          Posted: {format(new Date(job.createdAt), "MMM d, yyyy")}
        </div>
        <div className="flex gap-2">
          {showApplyButton && (
            <Button 
              variant={hasApplied ? "outline" : "default"}
              size="sm"
              onClick={onApplyClick}
              disabled={hasApplied || !job.isActive}
              asChild={hasApplied || !onApplyClick}
            >
              {hasApplied ? (
                <span>Applied</span>
              ) : onApplyClick ? (
                <span>Apply Now</span>
              ) : (
                <Link href={`/jobs/${job.id}`}>
                  View Job
                  <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              )}
            </Button>
          )}
          
          {showSaveButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveToggle}
              disabled={isTogglingSave}
              className={saved ? "text-primary border-primary/30" : ""}
            >
              <Bookmark className={`h-4 w-4 ${saved ? "fill-primary" : ""}`} />
              <span className="ml-1 sr-only md:not-sr-only">
                {saved ? "Saved" : "Save"}
              </span>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
} 