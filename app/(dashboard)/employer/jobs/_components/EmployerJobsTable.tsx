'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Eye, 
  Edit, 
  MoreVertical, 
  Copy, 
  Trash, 
  Clock, 
  AlertCircle, 
  Check, 
  TimerOff, 
  FileText 
} from 'lucide-react'
import { formatDistance } from 'date-fns'

// Define the job type
interface Job {
  id: string
  title: string
  status: string
  jobType: string
  workLocation: string
  experienceLevel: string | null
  publishedAt: Date | null
  expiresAt: Date | null
  applicationDeadline: Date | null
  createdAt: Date
  updatedAt: Date
}

interface EmployerJobsTableProps {
  jobs: Job[]
}

type BadgeVariant = "outline" | "secondary" | "default" | "destructive"

export default function EmployerJobsTable({ jobs }: EmployerJobsTableProps) {
  // Function to get the appropriate status badge variant and label
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return { 
          variant: 'outline' as BadgeVariant, 
          label: 'Draft',
          icon: <FileText className="mr-1 h-3 w-3" />
        }
      case 'PENDING_PAYMENT':
        return { 
          variant: 'secondary' as BadgeVariant, 
          label: 'Pending Payment',
          icon: <Clock className="mr-1 h-3 w-3" />
        }
      case 'ACTIVE':
        return { 
          variant: 'default' as BadgeVariant, 
          label: 'Active',
          icon: <Check className="mr-1 h-3 w-3" />,
          className: "bg-green-600 hover:bg-green-700"
        }
      case 'EXPIRED':
        return { 
          variant: 'default' as BadgeVariant, 
          label: 'Expired',
          icon: <TimerOff className="mr-1 h-3 w-3" />,
          className: "bg-amber-500 hover:bg-amber-600"
        }
      case 'FILLED':
        return { 
          variant: 'default' as BadgeVariant, 
          label: 'Filled',
          icon: <Check className="mr-1 h-3 w-3" />
        }
      default:
        return { 
          variant: 'destructive' as BadgeVariant, 
          label: 'Deleted',
          icon: <AlertCircle className="mr-1 h-3 w-3" />
        }
    }
  }
  
  if (jobs.length === 0) {
    return (
      <Card className="bg-background/80 backdrop-blur-md border-[rgba(255,255,255,0.3)] rounded-xl shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-[#9aa3bc] mb-4" />
          <h3 className="text-xl font-medium text-[#1a1e2d] mb-2">No job postings found</h3>
          <p className="text-[#9aa3bc] text-center max-w-md mb-6">
            You haven&apos;t created any job postings matching the current filters yet.
          </p>
          <Button asChild className="bg-[#4a6cfa] hover:bg-[#7b90ff]">
            <Link href="/employer/jobs/new">Post a Job</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className="rounded-xl overflow-hidden border bg-background/80 backdrop-blur-md border-[rgba(255,255,255,0.3)] shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Job Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Type</TableHead>
            <TableHead className="hidden md:table-cell">Posted</TableHead>
            <TableHead className="hidden md:table-cell">Expires</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => {
            const statusBadge = getStatusBadge(job.status)
            
            return (
              <TableRow key={job.id}>
                <Link href={`/employer/jobs/${job.id}`}>
                <TableCell className="font-medium">{job.title}</TableCell>
                </Link>
                <TableCell>
                  <Badge 
                    variant={statusBadge.variant}
                    className={`flex w-fit items-center ${statusBadge.className || ''}`}
                  >
                    {statusBadge.icon}
                    {statusBadge.label}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {job.jobType.replace(/_/g, ' ')}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {job.publishedAt 
                    ? formatDistance(new Date(job.publishedAt), new Date(), { addSuffix: true })
                    : 'Not published'}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {job.expiresAt 
                    ? format(new Date(job.expiresAt), 'dd MMM yyyy')
                    : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/employer/jobs/${job.id}`}>
                          <Eye className="mr-2 h-4 w-4" /> View
                        </Link>
                      </DropdownMenuItem>
                      {job.status !== 'DELETED' && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link href={`/employer/jobs/${job.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" /> Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            
                            <Trash className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
} 