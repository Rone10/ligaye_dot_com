'use client'

import { useState } from 'react';
import Link from 'next/link';
import { softDeleteUserProfile, restoreDeletedUserProfile } from '../_actions';
import type { UserListItem } from '../_queries';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertTriangle, CheckCircle, TrashIcon, RotateCcw, Eye } from 'lucide-react';

interface UsersTableProps {
  users: UserListItem[];
}

export default function UsersTable({ users }: UsersTableProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmRestoreId, setConfirmRestoreId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const userToDelete = confirmDeleteId ? users.find(user => user.id === confirmDeleteId) : null;
  const userToRestore = confirmRestoreId ? users.find(user => user.id === confirmRestoreId) : null;
  
  async function handleDelete(formData: FormData) {
    if (!confirmDeleteId) return;
    
    setIsSubmitting(true);
    try {
      await softDeleteUserProfile(formData);
      setConfirmDeleteId(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setIsSubmitting(false);
    }
  }
  
  async function handleRestore(formData: FormData) {
    if (!confirmRestoreId) return;
    
    setIsSubmitting(true);
    try {
      await restoreDeletedUserProfile(formData);
      setConfirmRestoreId(null);
    } catch (error) {
      console.error('Error restoring user:', error);
    } finally {
      setIsSubmitting(false);
    }
  }
  
  function getRoleColor(role: string) {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'employer':
        return 'bg-blue-100 text-blue-800';
      case 'candidate':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
  
  return (
    <>
      <div className="rounded-md border shadow-sm bg-white/70 backdrop-blur-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Profile Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className={user.deleted ? 'bg-red-50/50' : ''}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatarUrl || ''} alt={user.fullName} />
                        <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.fullName}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[180px]">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    {user.deleted ? (
                      <span className="flex items-center text-red-600 text-sm">
                        <AlertTriangle className="mr-1 h-4 w-4" />
                        Deleted
                      </span>
                    ) : user.hasCompletedProfile ? (
                      <span className="flex items-center text-green-600 text-sm">
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Complete
                      </span>
                    ) : (
                      <span className="text-amber-600 text-sm">Incomplete</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link href={`/users/${user.id}`} passHref>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                      </Link>
                      {user.deleted ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700"
                          onClick={() => setConfirmRestoreId(user.id)}
                        >
                          <RotateCcw className="h-4 w-4" />
                          <span className="sr-only">Restore</span>
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          onClick={() => setConfirmDeleteId(user.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the profile for <strong>{userToDelete?.fullName}</strong>? 
              This will mark the profile as deleted but won&apos;t remove it from the database.
            </DialogDescription>
          </DialogHeader>
          <form action={handleDelete}>
            <input type="hidden" name="profileId" value={confirmDeleteId || ''} />
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setConfirmDeleteId(null)}
                type="button"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Deleting...' : 'Delete User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Restore Confirmation Dialog */}
      <Dialog open={!!confirmRestoreId} onOpenChange={(open) => !open && setConfirmRestoreId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Restore User</DialogTitle>
            <DialogDescription>
              Are you sure you want to restore the profile for <strong>{userToRestore?.fullName}</strong>?
            </DialogDescription>
          </DialogHeader>
          <form action={handleRestore}>
            <input type="hidden" name="profileId" value={confirmRestoreId || ''} />
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setConfirmRestoreId(null)}
                type="button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Restoring...' : 'Restore User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
} 