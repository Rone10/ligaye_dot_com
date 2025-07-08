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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Edit,
  Trash,
  ArrowUpDown,
} from "lucide-react";
import { format } from "date-fns";
import { JobStatusBadge } from "./JobStatusBadge";
import { parseAsString, useQueryState } from "nuqs";

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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortButton column="title">Job Title</SortButton>
              </TableHead>
              <TableHead>
                <SortButton column="company">Company</SortButton>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <SortButton column="location">Location</SortButton>
              </TableHead>
              <TableHead>Work Type</TableHead>
              <TableHead>
                <SortButton column="createdAt">Posted</SortButton>
              </TableHead>
              <TableHead>
                <SortButton column="expiresAt">Expires</SortButton>
              </TableHead>
              <TableHead className="text-center">Applications</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No jobs found
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium max-w-xs truncate">
                    {job.title}
                  </TableCell>
                  <TableCell>
                    {job.employer?.companyName || "N/A"}
                  </TableCell>
                  <TableCell>
                    <JobStatusBadge status={job.status} />
                  </TableCell>
                  <TableCell>
                    {job.location?.city || "Remote"}
                  </TableCell>
                  <TableCell className="capitalize">
                    {job.workLocation.toLowerCase().replace("_", " ")}
                  </TableCell>
                  <TableCell>
                    {format(new Date(job.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    {job.expiresAt
                      ? format(new Date(job.expiresAt), "MMM d, yyyy")
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-center">
                    {job.applicationCount}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/jobs/${job.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/jobs/${job.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Job
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash className="mr-2 h-4 w-4" />
                          Delete Job
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
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(pageNumber - 1) * pageSize + 1} to{" "}
            {Math.min(pageNumber * pageSize, totalCount)} of {totalCount} jobs
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pageNumber - 1)}
              disabled={pageNumber <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
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
                    className="w-9"
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
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}