"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Trash,
  Edit,
  Eye,
} from "lucide-react";
import { updateJobStatus, deleteJob } from "../_actions";

interface JobActionsProps {
  job: {
    id: string;
    status: string;
    title: string;
  };
}

export function JobActions({ job }: JobActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    
    let result;
    try {
      result = await updateJobStatus(job.id, newStatus);
    } catch (error) {
      toast.error("Failed to communicate with server");
      setIsUpdating(false);
      return;
    }

    setIsUpdating(false);

    if (result.success) {
      toast.success(`Job status updated to ${newStatus.replace("_", " ").toLowerCase()}`);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update job status");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    
    let result;
    try {
      result = await deleteJob(job.id);
    } catch (error) {
      toast.error("Failed to communicate with server");
      setIsDeleting(false);
      setShowDeleteDialog(false);
      return;
    }

    setIsDeleting(false);
    setShowDeleteDialog(false);

    if (result.success) {
      toast.success("Job deleted successfully");
      router.push("/admin/jobs");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to delete job");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" disabled={isUpdating}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem asChild>
            <a href={`/jobs/${job.id}`} target="_blank" rel="noopener noreferrer">
              <Eye className="mr-2 h-4 w-4" />
              View Public Page
            </a>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <a href={`/employer/jobs/${job.id}/edit`} target="_blank" rel="noopener noreferrer">
              <Edit className="mr-2 h-4 w-4" />
              Edit Job
            </a>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Update Status</DropdownMenuLabel>
          
          {job.status !== "ACTIVE" && (
            <DropdownMenuItem onClick={() => handleStatusUpdate("ACTIVE")}>
              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
              Mark as Active
            </DropdownMenuItem>
          )}
          
          {job.status !== "EXPIRED" && (
            <DropdownMenuItem onClick={() => handleStatusUpdate("EXPIRED")}>
              <Clock className="mr-2 h-4 w-4 text-orange-600" />
              Mark as Expired
            </DropdownMenuItem>
          )}
          
          {job.status !== "FILLED" && (
            <DropdownMenuItem onClick={() => handleStatusUpdate("FILLED")}>
              <CheckCircle className="mr-2 h-4 w-4 text-blue-600" />
              Mark as Filled
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600"
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete Job
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{job.title}"? This action cannot be undone.
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
    </>
  );
}