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
          className: 'bg-muted text-muted-foreground border border-border hover:bg-muted px-3',
          icon: <Clock size={14} className="mr-1" />
        }
      case 'REVIEWING':
        return { 
          label: 'Reviewing', 
          variant: 'default' as const, 
          className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/40 px-3',
          icon: <FileCheck size={14} className="mr-1" />
        }
      case 'SHORTLISTED':
        return { 
          label: 'Shortlisted', 
          variant: 'default' as const, 
          className: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 px-3',
          icon: <Users size={14} className="mr-1" />
        }
      case 'INTERVIEW_SCHEDULED':
        return { 
          label: 'Interview Scheduled', 
          variant: 'default' as const, 
          className: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/40 px-3',
          icon: <Calendar size={14} className="mr-1" />
        }
      case 'INTERVIEWED':
        return { 
          label: 'Interviewed', 
          variant: 'default' as const, 
          className: 'bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-300 border border-violet-200 dark:border-violet-700 hover:bg-violet-100 dark:hover:bg-violet-900/40 px-3',
          icon: <MessageSquare size={14} className="mr-1" />
        }
      case 'OFFER_EXTENDED':
        return { 
          label: 'Offer Extended', 
          variant: 'default' as const, 
          className: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/40 px-3',
          icon: <Send size={14} className="mr-1" />
        }
      case 'HIRED':
        return { 
          label: 'Hired', 
          variant: 'default' as const, 
          className: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/40 px-3',
          icon: <Award size={14} className="mr-1" />
        }
      case 'REJECTED':
        return { 
          label: 'Rejected', 
          variant: 'default' as const, 
          className: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/40 px-3',
          icon: <XCircle size={14} className="mr-1" />
        }
      case 'WITHDRAWN':
        return { 
          label: 'Withdrawn', 
          variant: 'default' as const, 
          className: 'bg-slate-100 dark:bg-slate-900/30 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900/40 px-3',
          icon: <UserX size={14} className="mr-1" />
        }
      default:
        return { 
          label: status, 
          variant: 'default' as const, 
          className: 'bg-muted text-muted-foreground border border-border hover:bg-muted px-3',
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