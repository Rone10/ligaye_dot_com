'use client'

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { applicationMethodEnum } from "@/lib/db/schema"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { useEffect } from "react"

interface JobActionButtonProps {
  id: string
  applicationMethod: typeof applicationMethodEnum.enumValues[number]
  isLoggedIn: boolean
  userRole: string | null
  hasApplied?: boolean
}

export function JobActionButton({ 
  id, 
  applicationMethod, 
  isLoggedIn, 
  userRole,
  hasApplied = false
}: JobActionButtonProps) {
  const router = useRouter()
  
  // Log the props for debugging purposes
  useEffect(() => {
    console.log('JobActionButton props:', {
      id,
      applicationMethod,
      isLoggedIn,
      userRole,
      hasApplied
    })
  }, [id, applicationMethod, isLoggedIn, userRole, hasApplied])
  
  const handleApply = () => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=/jobs/${id}/apply`)
      return
    }
    
    router.push(`/jobs/${id}/apply`)
  }
  
  // Only show apply button if application via platform is allowed
  if (applicationMethod !== 'PLATFORM') {
    return null
  }
  
  // Determine button state - FIXED: Now only disable if user has applied OR their role is specifically 'employer'
  // This allows both 'authenticated' and 'candidate' roles to apply
  const isDisabled = (userRole === 'employer' && isLoggedIn) || hasApplied
  
  // Show tooltip if already applied
  if (hasApplied) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button 
                className="w-full md:w-auto" 
                disabled={true}
                variant="secondary"
              >
                Already Applied
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>You have already applied for this job</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }
  
  return (
    <Button 
      className="w-full md:w-auto" 
      onClick={handleApply}
      disabled={isDisabled}
    >
      Apply Now
    </Button>
  )
} 