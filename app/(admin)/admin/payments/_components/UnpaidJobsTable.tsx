'use client'

import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import type { UnpaidJobListItem } from '../_queries' // Import the correct type

// Define props for the new table
interface UnpaidJobsTableProps {
  jobs: UnpaidJobListItem[];
}

// Renamed component
export default function UnpaidJobsTable({ jobs }: UnpaidJobsTableProps) {

  // Function to get badge variant based on job status
  function getStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
    switch (status) {
      case 'DRAFT':
        return 'secondary' // Grayish
      case 'PENDING_PAYMENT':
        return 'outline' // Orange/Yellow outline might fit
      case 'ACTIVE':
        return 'default' // Primary color (Green/Blue)
      case 'EXPIRED':
        return 'destructive' // Red
      default:
        return 'secondary'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Details</CardTitle>
        <CardDescription>Overview of jobs awaiting payment or activation.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Title</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created Date</TableHead>
              {/* Remove Actions column */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No unpaid jobs found.
                </TableCell>
              </TableRow>
            ) : (
              jobs.map(({ job, employer, employerUser }) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">
                    {job.title || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div>{employer.companyName || 'N/A'}</div>
                    <div className="text-xs text-muted-foreground">{employerUser.fullName || ''}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(job.status)}>
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(job.createdAt), 'PPP')} {/* Format date */}
                  </TableCell>
                  {/* Remove action buttons */}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
} 