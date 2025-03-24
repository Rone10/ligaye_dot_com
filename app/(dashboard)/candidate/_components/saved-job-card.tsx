"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowUpRight, Bookmark, Building, Calendar, CreditCard, FileText, MapPin, Trash } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toggleJobSave } from "@/app/actions/candidate/saved-jobs"
import { toast } from "sonner"

type SavedJobCardProps = {
  savedJob: any // Type would be refined in real implementation
  job: any
  employer: any
  hasApplied?: boolean
  onRemove?: () => void
}

export function SavedJobCard({ 
  savedJob, 
  job, 
  employer, 
  hasApplied = false,
  onRemove 
}: SavedJobCardProps) {
  const [isRemoving, setIsRemoving] = useState(false)
  
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
  
  // Handle removing from saved
  const handleRemove = async () => {
    if (isRemoving) return
    
    try {
      setIsRemoving(true)
      await toggleJobSave(job.id)
      
      if (onRemove) {
        onRemove()
      }
      
      toast.success("Job removed from saved jobs")
    } catch (error) {
      console.error("Error removing saved job:", error)
      toast.error("Failed to remove job from saved")
    } finally {
      setIsRemoving(false)
    }
  }
  
  // Format date saved
  const formatDateSaved = () => {
    return savedJob.createdAt 
      ? format(new Date(savedJob.createdAt), "MMM d, yyyy") 
      : null
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
          <Badge 
            variant="outline" 
            className="px-2 py-1 bg-primary/10 text-primary border-primary/20"
          >
            <Bookmark className="h-3.5 w-3.5 fill-primary mr-1" />
            Saved
          </Badge>
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
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-3">
        <div className="text-xs text-muted-foreground">
          Saved on: {formatDateSaved()}
        </div>
        <div className="flex gap-2">
          <Button 
            variant={hasApplied ? "outline" : "default"}
            size="sm"
            disabled={hasApplied || !job.isActive}
            asChild
          >
            {hasApplied ? (
              <span>Applied</span>
            ) : (
              <Link href={job.isActive ? `/jobs/${job.id}/apply` : `/jobs/${job.id}`}>
                {job.isActive ? "Apply Now" : "View Job"}
                <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemove}
            disabled={isRemoving}
          >
            <Trash className="h-4 w-4 text-destructive" />
            <span className="ml-1 sr-only md:not-sr-only">
              Remove
            </span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
} 