'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Eye, Edit, Trash2, ExternalLink } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { deleteTenderAction } from '../_actions';
import type { TenderWithRelations } from '../_queries';

interface TendersDataTableProps {
  tenders: TenderWithRelations[];
  currentUserId?: string;
  totalCount: number;
  currentPage: number;
  limit: number;
}

export function TendersDataTable({
  tenders,
  currentUserId,
  totalCount,
  currentPage,
  limit,
}: TendersDataTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tenderToDelete, setTenderToDelete] = useState<TenderWithRelations | null>(null);

  const handleDeleteClick = (tender: TenderWithRelations) => {
    setTenderToDelete(tender);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!tenderToDelete) return;

    setDeletingId(tenderToDelete.id);
    try {
      const result = await deleteTenderAction(tenderToDelete.id);
      if (result.success) {
        setDeleteDialogOpen(false);
        setTenderToDelete(null);
        // The page will revalidate automatically due to revalidatePath in the action
      } else {
        // Handle error - you might want to show a toast notification here
        console.error('Delete failed:', result.error);
      }
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'default';
      case 'DRAFT':
        return 'secondary';
      case 'CLOSED':
        return 'outline';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatDeadline = (deadline: Date | null) => {
    if (!deadline) return 'No deadline';
    return format(new Date(deadline), 'MMM dd, yyyy');
  };

  const formatLocation = (location?: { region: string; city?: string | null }) => {
    if (!location) return 'Not specified';
    return location.city ? `${location.city}, ${location.region}` : location.region;
  };

  const canUserEdit = (tender: TenderWithRelations) => {
    return currentUserId && tender.userId === currentUserId;
  };

  if (tenders.length === 0) {
    return (
      <Card className=" backdrop-blur-lg border border-white/30 rounded-2xl shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tenders found</h3>
            <p className="text-gray-600 mb-4">
              There are no tenders matching your current filters.
            </p>
            {currentUserId && (
              <Button asChild>
                <Link href="/tenders/new">Create New Tender</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className=" backdrop-blur-lg border border-white/30 rounded-2xl shadow-lg">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenders.map((tender) => (
                  <TableRow key={tender.id}>
                    <TableCell className="font-medium">
                      <div className="max-w-xs">
                        <div className="truncate">{tender.title}</div>
                        <div className="text-sm text-gray-500 capitalize">
                          {tender.tenderType.toLowerCase().replace('_', ' ')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{tender.organizationName}</TableCell>
                    <TableCell>
                      {tender.sector?.name || 'Not specified'}
                    </TableCell>
                    <TableCell>{formatLocation(tender.location)}</TableCell>
                    <TableCell>{formatDeadline(tender.deadline)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(tender.status)}>
                        {tender.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/tenders/${tender.id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View tender</span>
                          </Link>
                        </Button>
                        
                        {tender.externalLink && (
                          <Button variant="ghost" size="sm" asChild>
                            <a
                              href={tender.externalLink}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                              <span className="sr-only">External link</span>
                            </a>
                          </Button>
                        )}

                        {canUserEdit(tender) && (
                          <>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/tenders/${tender.id}/edit`}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit tender</span>
                              </Link>
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(tender)}
                              disabled={deletingId === tender.id}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete tender</span>
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination info */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing {((currentPage - 1) * limit) + 1} to{' '}
          {Math.min(currentPage * limit, totalCount)} of {totalCount} tenders
        </div>
        <div>
          Page {currentPage} of {Math.ceil(totalCount / limit)}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tender</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{tenderToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deletingId !== null}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deletingId !== null}
            >
              {deletingId ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 