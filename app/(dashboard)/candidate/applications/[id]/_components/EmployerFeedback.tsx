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
    <div className="bg-white/70 backdrop-blur-md rounded-xl border border-[rgba(255,255,255,0.3)] overflow-hidden shadow-[0_8px_32px_rgba(31,38,135,0.1)]">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <MessageSquare className="h-5 w-5 mr-2 text-[#4a6cfa]" />
          <h2 className="text-lg font-semibold text-[#1a1e2d]">Employer Feedback</h2>
        </div>
        
        <div className="bg-[#f8faff] rounded-lg border border-[#e1e5f2] p-4">
          <p className="text-[#1a1e2d] whitespace-pre-line">
            {notes}
          </p>
        </div>
      </div>
    </div>
  )
} 