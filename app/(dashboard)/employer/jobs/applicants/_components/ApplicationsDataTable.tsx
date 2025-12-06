'use client'

import Link from 'next/link'
import { formatDistance } from 'date-fns'
import { useSearchParams } from 'next/navigation'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import StatusBadge from './StatusBadge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import { Calendar, Clock } from 'lucide-react'

interface ApplicationData {
  application: {
    id: string
    status: string
    appliedAt: Date
    updatedAt: Date
    coverLetterText: string | null
    coverLetterUrl: string | null
    resumeUrl: string | null
    interviewDate: Date | null
  }
  job: {
    id: string
    title: string
  }
  candidate: {
    id: string
    fullName: string
    title: string | null
    avatarUrl: string | null
  }
}

interface ApplicationsDataTableProps {
  applications: ApplicationData[]
}

export default function ApplicationsDataTable({ applications }: ApplicationsDataTableProps) {
  const searchParams = useSearchParams()
  
  // Build query string from current search params to preserve filters
  const buildQueryString = () => {
    const params = new URLSearchParams()
    const status = searchParams.get('status')
    const q = searchParams.get('q')
    const sort = searchParams.get('sort')
    
    if (status) params.set('status', status)
    if (q) params.set('q', q)
    if (sort) params.set('sort', sort)
    
    const queryString = params.toString()
    return queryString ? `?${queryString}` : ''
  }
  
  const queryString = buildQueryString()
  
  if (!applications.length) {
    return null; // Empty state is handled in the parent component
  }
  
  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="bg-gray-50 border-b border-gray-100 pb-6">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg text-gray-800">Job Applications</CardTitle>
            <CardDescription className="text-gray-500">
              Manage and review applications for your job postings
            </CardDescription>
          </div>
          <div className="text-sm text-gray-500">
            {applications.length} {applications.length === 1 ? 'application' : 'applications'} found
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="rounded-md">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="font-medium">Candidate</TableHead>
                <TableHead className="font-medium">Job Position</TableHead>
                <TableHead className="font-medium">Status</TableHead>
                <TableHead className="font-medium">Applied</TableHead>
                <TableHead className="font-medium">Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((item) => (
                <TableRow key={item.application.id} className="hover:bg-blue-50 transition-colors">
                  <TableCell>
                    <Link 
                      href={`/employer/jobs/applicants/${item.application.id}${queryString}`}
                      className="flex items-center gap-3 hover:underline group"
                    >
                      <Avatar className="h-10 w-10 border border-gray-200">
                        {item.candidate.avatarUrl ? (
                          <AvatarImage src={item.candidate.avatarUrl} alt={item.candidate.fullName} />
                        ) : null}
                        <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">{getInitials(item.candidate.fullName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-blue-600 group-hover:text-blue-700">{item.candidate.fullName}</div>
                        {item.candidate.title && (
                          <div className="text-xs text-gray-500">{item.candidate.title}</div>
                        )}
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="text-gray-700">{item.job.title}</TableCell>
                  <TableCell>
                    <StatusBadge status={item.application.status} />
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} className="text-gray-400" />
                      {formatDistance(new Date(item.application.appliedAt), new Date(), { addSuffix: true })}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock size={14} className="text-gray-400" />
                      {formatDistance(new Date(item.application.updatedAt), new Date(), { addSuffix: true })}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
} 