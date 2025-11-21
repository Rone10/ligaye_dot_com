"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash,
  ArrowUpDown,
  MoreHorizontal,
} from "lucide-react";
import { format } from "date-fns";
import { JobStatusSelect } from "./JobStatusSelect";
import { CompanyAvatar } from "./CompanyAvatar";
import { parseAsString, useQueryState } from "nuqs";
import { toast } from "sonner";
import { updateJobStatus, deleteJob } from "../[id]/_actions";
import { bulkUpdateJobStatus, bulkDeleteJobs } from "../_actions";

interface Job {
  id: string;
  title: string;
  status: string;
  createdAt: Date;
  expiresAt: Date | null;
  workLocation: string;
  jobType: string;
  experienceLevel: string | null;
  applicationCount: number;
  employer: {
    id: string | null;
    companyName: string;
    companyLogoUrl?: string | null;
    website?: string | null;
    user: {
      id: string | null;
      fullName: string;
    } | null;
  } | null;
  location: {
    id: string;
    city: string | null;
    district: string | null;
    region: string;
  } | null;
}

interface JobsTableProps {
  jobs: Job[];
  totalCount: number;
}

export function JobsTable({ jobs, totalCount }: JobsTableProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useQueryState("page",
    parseAsString.withDefault("1")
  );
  const [sortBy, setSortBy] = useQueryState("sortBy",
    parseAsString.withDefault("createdAt")
  );
  const [sortOrder, setSortOrder] = useQueryState("sortOrder",
    parseAsString.withDefault("desc")
  );

  // State for delete dialog and operations
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // State for bulk selection
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  const pageNumber = parseInt(currentPage || "1");
  const pageSize = 10;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage.toString());
  };

  const handleSelectAll = (checked: boolean) => {
    setIsSelectAll(checked);
    if (checked) {
      setSelectedJobIds(new Set(jobs.map(job => job.id)));
    } else {
      setSelectedJobIds(new Set());
    }
  };

  const handleSelectJob = (jobId: string, checked: boolean) => {
    const newSelectedIds = new Set(selectedJobIds);
    if (checked) {
      newSelectedIds.add(jobId);
    } else {
      newSelectedIds.delete(jobId);
    }
    setSelectedJobIds(newSelectedIds);
    setIsSelectAll(newSelectedIds.size === jobs.length);
  };

  const handleStatusUpdate = async (jobId: string, newStatus: string) => {
    setIsUpdating(jobId);

    let result;
    try {
      result = await updateJobStatus(jobId, newStatus);
    } catch (error) {
      toast.error("Failed to communicate with server");
      setIsUpdating(null);
      return;
    }

    setIsUpdating(null);

    if (result.success) {
      toast.success(`Job status updated to ${newStatus.replace("_", " ").toLowerCase()}`);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update job status");
    }
  };

  const handleDeleteClick = (job: Job) => {
    setSelectedJob(job);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!selectedJob) return;

    setIsDeleting(true);

    let result;
    try {
      result = await deleteJob(selectedJob.id);
    } catch (error) {
      toast.error("Failed to communicate with server");
      setIsDeleting(false);
      setShowDeleteDialog(false);
      return;
    }

    setIsDeleting(false);
    setShowDeleteDialog(false);
    setSelectedJob(null);

    if (result.success) {
      toast.success("Job deleted successfully");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to delete job");
    }
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedJobIds.size === 0) return;

    setIsBulkUpdating(true);
    const jobIds = Array.from(selectedJobIds);

    let result;
    try {
      result = await bulkUpdateJobStatus(jobIds, newStatus);
    } catch (error) {
      toast.error("Failed to communicate with server");
      setIsBulkUpdating(false);
      return;
    }

    setIsBulkUpdating(false);

    if (result.success) {
      toast.success(`${jobIds.length} job(s) updated to ${newStatus.replace("_", " ").toLowerCase()}`);
      setSelectedJobIds(new Set());
      setIsSelectAll(false);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update jobs");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedJobIds.size === 0) return;

    setIsDeleting(true);
    const jobIds = Array.from(selectedJobIds);

    let result;
    try {
      result = await bulkDeleteJobs(jobIds);
    } catch (error) {
      toast.error("Failed to communicate with server");
      setIsDeleting(false);
      setShowBulkDeleteDialog(false);
      return;
    }

    setIsDeleting(false);
    setShowBulkDeleteDialog(false);

    if (result.success) {
      toast.success(`${jobIds.length} job(s) deleted successfully`);
      setSelectedJobIds(new Set());
      setIsSelectAll(false);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to delete jobs");
    }
  };

  const SortButton = ({ column, children }: { column: string; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-0 font-medium hover:bg-transparent"
      onClick={() => handleSort(column)}
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  return (
    <div className="space-y-4">
      {selectedJobIds.size > 0 && (
        <div className="flex items-center justify-between px-5 py-3.5 bg-emerald-50 rounded-lg border border-emerald-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={true}
                onCheckedChange={() => {
                  setSelectedJobIds(new Set());
                  setIsSelectAll(false);
                }}
                className="border-emerald-600 data-[state=checked]:bg-emerald-600"
              />
              <span className="text-sm font-medium text-emerald-900">
                {selectedJobIds.size} {selectedJobIds.size === 1 ? 'job' : 'jobs'} selected
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select onValueChange={handleBulkStatusUpdate} disabled={isBulkUpdating}>
              <SelectTrigger className="w-40 h-9 border-emerald-300 bg-white">
                <SelectValue placeholder="Update status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Mark as Active</SelectItem>
                <SelectItem value="EXPIRED">Mark as Expired</SelectItem>
                <SelectItem value="FILLED">Mark as Filled</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowBulkDeleteDialog(true)}
              disabled={isBulkUpdating || isDeleting}
              className="h-9"
            >
              <Trash className="h-3.5 w-3.5 mr-1.5" />
              Delete
            </Button>
          </div>
        </div>
      )}
      <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50 border-b border-gray-200 hover:bg-gray-50/50">
              <TableHead className="w-12 py-3">
                <Checkbox
                  checked={isSelectAll}
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                  aria-label="Select all jobs"
                />
              </TableHead>
              <TableHead className="w-14 py-3"></TableHead>
              <TableHead className="py-3">
                <SortButton column="title">Job Title</SortButton>
              </TableHead>
              <TableHead className="py-3">
                <SortButton column="company">Company</SortButton>
              </TableHead>
              <TableHead className="py-3">Status</TableHead>
              <TableHead className="hidden md:table-cell py-3">
                <SortButton column="location">Location</SortButton>
              </TableHead>
              <TableHead className="hidden lg:table-cell py-3">Work Type</TableHead>
              <TableHead className="hidden md:table-cell py-3">
                <SortButton column="createdAt">Posted</SortButton>
              </TableHead>
              <TableHead className="hidden xl:table-cell py-3">
                <SortButton column="expiresAt">Expires</SortButton>
              </TableHead>
              <TableHead className="text-center py-3">Applications</TableHead>
              <TableHead className="text-right w-16 py-3">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-12 text-muted-foreground">
                  No jobs found
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => (
                <TableRow
                  key={job.id}
                  className={`border-b border-gray-100 transition-colors ${
                    selectedJobIds.has(job.id)
                      ? "bg-emerald-50/50"
                      : "hover:bg-gray-50/50"
                  }`}
                >
                  <TableCell className="w-12 py-3">
                    <Checkbox
                      checked={selectedJobIds.has(job.id)}
                      onCheckedChange={(checked) => handleSelectJob(job.id, !!checked)}
                      aria-label={`Select ${job.title}`}
                    />
                  </TableCell>
                  <TableCell className="w-14 py-3">
                    <CompanyAvatar
                      companyName={job.employer?.companyName || "N/A"}
                      logoUrl={job.employer?.companyLogoUrl}
                      size="sm"
                    />
                  </TableCell>
                  <TableCell className="font-medium max-w-xs truncate py-3">
                    {job.title}
                  </TableCell>
                  <TableCell className="py-3">
                    {job.employer?.companyName || "N/A"}
                  </TableCell>
                  <TableCell className="py-3">
                    <JobStatusSelect
                      jobId={job.id}
                      currentStatus={job.status}
                      onStatusChange={handleStatusUpdate}
                      disabled={isUpdating === job.id}
                    />
                  </TableCell>
                  <TableCell className="hidden md:table-cell py-3 text-gray-600">
                    {job.location?.city || "Remote"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell capitalize py-3 text-gray-600">
                    {job.workLocation.toLowerCase().replace("_", " ")}
                  </TableCell>
                  <TableCell className="hidden md:table-cell py-3 text-gray-600 text-sm">
                    {format(new Date(job.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="hidden xl:table-cell py-3 text-gray-600 text-sm">
                    {job.expiresAt
                      ? format(new Date(job.expiresAt), "MMM d, yyyy")
                      : "—"}
                  </TableCell>
                  <TableCell className="text-center py-3 font-medium">
                    {job.applicationCount}
                  </TableCell>
                  <TableCell className="text-right py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-gray-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/jobs/${job.id}`} className="cursor-pointer">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(job)}
                          disabled={isUpdating === job.id}
                          className="text-red-600 focus:text-red-600 cursor-pointer"
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium text-gray-900">{(pageNumber - 1) * pageSize + 1}</span> to{" "}
            <span className="font-medium text-gray-900">{Math.min(pageNumber * pageSize, totalCount)}</span> of{" "}
            <span className="font-medium text-gray-900">{totalCount}</span> jobs
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pageNumber - 1)}
              disabled={pageNumber <= 1}
              className="h-9 border-gray-200"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pageNumber <= 3) {
                  pageNum = i + 1;
                } else if (pageNumber >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = pageNumber - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={pageNumber === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-9 h-9 ${
                      pageNumber === pageNum
                        ? "bg-emerald-600 hover:bg-emerald-700 border-emerald-600"
                        : "border-gray-200"
                    }`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pageNumber + 1)}
              disabled={pageNumber >= totalPages}
              className="h-9 border-gray-200"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedJob?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Jobs?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedJobIds.size} selected job{selectedJobIds.size > 1 ? 's' : ''}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}