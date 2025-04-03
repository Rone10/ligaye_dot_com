'use client'

import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle2, XCircle, Users, FileCheck, Calendar, MessageSquare, Award, Send, UserX } from "lucide-react"

interface StatusBadgeProps {
  status: string
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'APPLIED':
        return { 
          label: 'Applied', 
          variant: 'default' as const, 
          className: 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-100 px-3',
          icon: <Clock size={14} className="mr-1" />
        }
      case 'REVIEWING':
        return { 
          label: 'Reviewing', 
          variant: 'default' as const, 
          className: 'bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-100 px-3',
          icon: <FileCheck size={14} className="mr-1" />
        }
      case 'SHORTLISTED':
        return { 
          label: 'Shortlisted', 
          variant: 'default' as const, 
          className: 'bg-indigo-100 text-indigo-800 border border-indigo-200 hover:bg-indigo-100 px-3',
          icon: <Users size={14} className="mr-1" />
        }
      case 'INTERVIEW_SCHEDULED':
        return { 
          label: 'Interview Scheduled', 
          variant: 'default' as const, 
          className: 'bg-purple-100 text-purple-800 border border-purple-200 hover:bg-purple-100 px-3',
          icon: <Calendar size={14} className="mr-1" />
        }
      case 'INTERVIEWED':
        return { 
          label: 'Interviewed', 
          variant: 'default' as const, 
          className: 'bg-violet-100 text-violet-800 border border-violet-200 hover:bg-violet-100 px-3',
          icon: <MessageSquare size={14} className="mr-1" />
        }
      case 'OFFER_EXTENDED':
        return { 
          label: 'Offer Extended', 
          variant: 'default' as const, 
          className: 'bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-100 px-3',
          icon: <Send size={14} className="mr-1" />
        }
      case 'HIRED':
        return { 
          label: 'Hired', 
          variant: 'default' as const, 
          className: 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-100 px-3',
          icon: <Award size={14} className="mr-1" />
        }
      case 'REJECTED':
        return { 
          label: 'Rejected', 
          variant: 'default' as const, 
          className: 'bg-red-100 text-red-800 border border-red-200 hover:bg-red-100 px-3',
          icon: <XCircle size={14} className="mr-1" />
        }
      case 'WITHDRAWN':
        return { 
          label: 'Withdrawn', 
          variant: 'default' as const, 
          className: 'bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-100 px-3',
          icon: <UserX size={14} className="mr-1" />
        }
      default:
        return { 
          label: status, 
          variant: 'default' as const, 
          className: 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-100 px-3',
          icon: <Clock size={14} className="mr-1" />
        }
    }
  }
  
  const { label, variant, className, icon } = getStatusConfig(status)
  
  return (
    <Badge variant={variant} className={`flex items-center whitespace-nowrap font-medium py-1 ${className}`}>
      {icon}
      {label}
    </Badge>
  )
} 