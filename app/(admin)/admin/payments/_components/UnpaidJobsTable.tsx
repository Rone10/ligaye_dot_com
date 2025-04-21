'use client'

import { useState, useTransition } from 'react'
import { format } from 'date-fns'
import { Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter, 
  DialogClose
} from '@/components/ui/dialog'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from "@/components/ui/select"
import { Label } from '@/components/ui/label'
import type { UnpaidJobListItem } from '../_queries'
import { updateJobStatus } from '../_actions'
import { jobStatusEnum } from '@/lib/db/schema'
import { formatJobStatus } from '../_utils/formatters'

interface UnpaidJobsTableProps {
  jobs: UnpaidJobListItem[];
}

type EditingJob = UnpaidJobListItem | null;

export default function UnpaidJobsTable({ jobs }: UnpaidJobsTableProps) {
  const [isPending, startTransition] = useTransition();
  const [editingJob, setEditingJob] = useState<EditingJob>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  function handleEditClick(jobItem: UnpaidJobListItem) {
    setEditingJob(jobItem);
    setSelectedStatus(jobItem.job.status);
    setError(null);
  }

  function handleCloseModal() {
    setEditingJob(null);
    setSelectedStatus('');
    setError(null);
  }

  function handleSaveChanges() {
    if (!editingJob || !selectedStatus) return;
    
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append('jobId', editingJob.job.id);
      formData.append('newStatus', selectedStatus);

      const result = await updateJobStatus(formData);

      if (result.success) {
        handleCloseModal();
      } else {
        setError(result.error || 'Failed to update job status.');
      }
    });
  }

  const allowedStatuses = jobStatusEnum.enumValues.filter(status => 
    ['DRAFT', 'PENDING_PAYMENT', 'ACTIVE', 'DELETED'].includes(status)
  );

  return (
    <>
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No unpaid jobs found.
                  </TableCell>
                </TableRow>
              ) : (
                jobs.map((jobItem) => {
                  const statusInfo = formatJobStatus(jobItem.job.status);
                  return (
                    <TableRow key={jobItem.job.id}>
                      <TableCell className="font-medium">
                        {jobItem.job.title || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div>{jobItem.employer.companyName || 'N/A'}</div>
                        <div className="text-xs text-muted-foreground">{jobItem.employerUser.fullName || ''}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusInfo.color} variant="outline">
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(jobItem.job.createdAt), 'PPP')}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditClick(jobItem)}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit Status</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingJob} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Job Status</DialogTitle>
            <DialogDescription>
              Update the status for job: 
              <span className="font-semibold"> {editingJob?.job.title}</span> at 
              <span className="font-semibold"> {editingJob?.employer.companyName}</span>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="jobStatus" className="text-right">
                  Status
                </Label>
                <Select 
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                  disabled={isPending}
                >
                  <SelectTrigger id="jobStatus" className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {allowedStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {formatJobStatus(status).label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
             </div>
             {error && (
                <p className="col-span-4 text-sm text-red-600 px-1 text-center">{error}</p>
             )}
          </div>

          <DialogFooter>
             <DialogClose asChild>
                 <Button type="button" variant="secondary" onClick={handleCloseModal}>
                   Cancel
                 </Button>
             </DialogClose>
            <Button 
              type="button" 
              onClick={handleSaveChanges} 
              disabled={isPending || !selectedStatus || selectedStatus === editingJob?.job.status}
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 