'use client'

import { MessageSquare } from 'lucide-react'

interface EmployerFeedbackProps {
  notes?: string | null
}

export default function EmployerFeedback({ notes }: EmployerFeedbackProps) {
  if (!notes) {
    return null
  }
  
  return (
    <div className="glass-card overflow-hidden">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <MessageSquare className="h-5 w-5 mr-2 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Employer Feedback</h2>
        </div>
        
        <div className="bg-muted rounded-lg border border-border p-4">
          <p className="text-foreground whitespace-pre-line">
            {notes}
          </p>
        </div>
      </div>
    </div>
  )
} 