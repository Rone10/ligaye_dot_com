'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

interface ApplicationSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  jobTitle: string
  companyName: string
}

export function ApplicationSuccessModal({
  isOpen,
  onClose,
  jobTitle,
  companyName
}: ApplicationSuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-col items-center">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <DialogTitle className="text-center text-xl">Application Submitted</DialogTitle>
          <DialogDescription className="text-center mt-2">
            Your application for <span className="font-medium">{jobTitle}</span> at {companyName} has been successfully submitted.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-center text-gray-dark">
            You can check the status of your application in your candidate dashboard.
          </p>
        </div>
        
        <DialogFooter className="justify-center sm:justify-center">
          <Button onClick={onClose}>
            Return to Job Listing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 