'use client'

import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { withdrawApplication } from '../_actions'

interface ApplicationWithdrawDialogProps {
  applicationId: string
  jobTitle: string
  employerName: string
}

export default function ApplicationWithdrawDialog({
  applicationId,
  jobTitle,
  employerName
}: ApplicationWithdrawDialogProps) {
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  
  const handleWithdraw = async () => {
    setIsWithdrawing(true)
    setError(null)
    
    try {
      const result = await withdrawApplication(applicationId)
      
      if (result.success) {
        // Redirect back to applications list
        router.push('/candidate/applications')
        router.refresh()
      } else {
        setError(result.error || 'Failed to withdraw application')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Error withdrawing application:', err)
    } finally {
      setIsWithdrawing(false)
    }
  }
  
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300">
          Withdraw Application
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white backdrop-blur-md border-[rgba(255,255,255,0.3)] shadow-[0_8px_32px_rgba(31,38,135,0.1)]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[#1a1e2d]">Withdraw Application</AlertDialogTitle>
          <AlertDialogDescription className="text-[#9aa3bc]">
            Are you sure you want to withdraw your application for <span className="font-medium text-[#1a1e2d]">{jobTitle}</span> at <span className="font-medium text-[#1a1e2d]">{employerName}</span>?
            <br /><br />
            This action cannot be undone. You will need to apply again if you change your mind.
          </AlertDialogDescription>
          
          {/* Show error if any */}
          {error && (
            <div className="flex items-center gap-2 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-transparent border border-gray-200 text-[#1a1e2d] hover:bg-gray-50 hover:text-[#1a1e2d]">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleWithdraw()
            }}
            className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
            disabled={isWithdrawing}
          >
            {isWithdrawing ? 'Withdrawing...' : 'Withdraw Application'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 