'use client'

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { applicationMethodEnum } from "@/lib/db/schema"

interface JobActionButtonProps {
  id: string
  applicationMethod: typeof applicationMethodEnum.enumValues[number]
  isLoggedIn: boolean
  userRole: string | null
}

export function JobActionButton({ 
  id, 
  applicationMethod, 
  isLoggedIn, 
  userRole 
}: JobActionButtonProps) {
  const router = useRouter()
  
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
  
  return (
    <Button 
      className="w-full md:w-auto" 
      onClick={handleApply}
      disabled={userRole !== 'candidate' && isLoggedIn}
    >
      Apply Now
    </Button>
  )
} 