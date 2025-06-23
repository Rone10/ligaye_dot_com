'use client'

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { applicationMethodEnum } from "@/lib/db/schema"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

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
  
  const handleApply = () => {
    if (!isLoggedIn) {
      router.push(`/sign-in?redirect=/jobs/${id}/apply`)
      return
    }
    
    router.push(`/jobs/${id}/apply`)
  }
  
  // Only show apply button if application via platform is allowed
  if (applicationMethod !== 'PLATFORM') {
    return null
  }
  
  // Determine button state - FIXED: 
  // - For authenticated users: only disable if they have applied OR their role is specifically 'employer'
  // - For unauthenticated users: always enable the button (they'll be redirected to login on click)
  const isDisabled = isLoggedIn ? ((userRole === 'employer') || hasApplied) : false
  
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