'use client'

import { useState } from 'react';
import Link from 'next/link';
import { softDeleteUserProfile, restoreDeletedUserProfile, changeUserRole } from '../_actions';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertTriangle, CheckCircle, TrashIcon, RotateCcw, Eye, MoreHorizontal, Shield, ShieldCheck, UserCheck, Briefcase } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface UsersTableProps {
  users: UserListItem[];
  currentUser?: User | null;
}

interface RoleChangeAction {
  profileId: string;
  newRole: string;
  userName: string;
  currentRole: string;
}

export default function UsersTable({ users, currentUser }: UsersTableProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmRestoreId, setConfirmRestoreId] = useState<string | null>(null);
  const [roleChangeAction, setRoleChangeAction] = useState<RoleChangeAction | null>(null);
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
  
  async function handleRoleChange(formData: FormData) {
    if (!roleChangeAction) return;
    
    // Debug: Log the form data being sent
    console.log('Client: Role change action:', roleChangeAction);
    console.log('Client: Form data profileId:', formData.get('profileId'));
    console.log('Client: Form data newRole:', formData.get('newRole'));
    
    setIsSubmitting(true);
    try {
      const result = await changeUserRole(formData);
      console.log('Client: Role change result:', result);
      
      if (result.success) {
        setRoleChangeAction(null);
        // Force refresh the page to see updated data
        window.location.reload();
      } else {
        // Display the error message
        alert(`Error: ${result.error}`);
        console.error('Role change failed:', result.error);
      }
    } catch (error) {
      console.error('Error changing user role:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }
  
  function getRoleColor(role: string) {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'employer':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'candidate':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }
  
  function getRoleIcon(role: string) {
    switch (role) {
      case 'admin':
        return <ShieldCheck className="h-3 w-3" />;
      case 'employer':
        return <Briefcase className="h-3 w-3" />;
      case 'candidate':
        return <UserCheck className="h-3 w-3" />;
      default:
        return null;
    }
  }
  
  function canChangeRole(user: UserListItem): boolean {
    // Can't change own role
    if (currentUser && user.userId === currentUser.id) {
      return false;
    }
    // Can't change deleted users
    return !user.deleted;
  }
  
  function getRoleChangeOptions(currentRole: string) {
    const allRoles = [
      { value: 'candidate', label: 'Candidate', icon: <UserCheck className="h-4 w-4" /> },
      { value: 'employer', label: 'Employer', icon: <Briefcase className="h-4 w-4" /> },
      { value: 'admin', label: 'Admin', icon: <ShieldCheck className="h-4 w-4" /> },
    ];
    
    return allRoles.filter(role => role.value !== currentRole);
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
                        <Link href={`/admin/users/${user.id}`} className='hover:underline'>
                          <div className="font-medium">{user.fullName}</div>
                        </Link>
                        <div className="text-xs text-gray-500 truncate max-w-[180px]">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                      {user.role}
                      {currentUser && user.userId === currentUser.id && (
                        <span className="text-[10px] opacity-75">(You)</span>
                      )}
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
                      <Link href={`/admin/users/${user.id}`} passHref>
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
                        <>
                          {canChangeRole(user) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">More actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <div className="px-2 py-1.5 text-sm font-medium text-gray-900">
                                  Change Role
                                </div>
                                <DropdownMenuSeparator />
                                {getRoleChangeOptions(user.role).map((roleOption) => (
                                  <DropdownMenuItem
                                    key={roleOption.value}
                                    className="flex items-center gap-2 cursor-pointer"
                                    onClick={() => setRoleChangeAction({
                                      profileId: user.id,
                                      newRole: roleOption.value,
                                      userName: user.fullName,
                                      currentRole: user.role
                                    })}
                                  >
                                    {roleOption.icon}
                                    <span>Make {roleOption.label}</span>
                                    {roleOption.value === 'admin' && (
                                      <Shield className="h-3 w-3 ml-auto text-purple-500" />
                                    )}
                                  </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="flex items-center gap-2 text-red-600 cursor-pointer"
                                  onClick={() => setConfirmDeleteId(user.id)}
                                >
                                  <TrashIcon className="h-4 w-4" />
                                  <span>Delete User</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                          
                          {!canChangeRole(user) && (
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
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Role Change Confirmation Dialog */}
      <Dialog open={!!roleChangeAction} onOpenChange={(open) => !open && setRoleChangeAction(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {roleChangeAction?.newRole === 'admin' && <Shield className="h-5 w-5 text-purple-500" />}
              Confirm Role Change
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to change <strong>{roleChangeAction?.userName}</strong>&apos;s role from{' '}
              <span className="font-medium">{roleChangeAction?.currentRole}</span> to{' '}
              <span className="font-medium">{roleChangeAction?.newRole}</span>?
              
              {roleChangeAction?.newRole === 'admin' && (
                <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-md">
                  <div className="flex items-center gap-2 text-purple-800 text-sm font-medium">
                    <Shield className="h-4 w-4" />
                    Granting Admin Access
                  </div>
                  <p className="text-purple-700 text-sm mt-1">
                    This user will have full administrative privileges and access to all admin features.
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <form action={handleRoleChange}>
            <input type="hidden" name="profileId" value={roleChangeAction?.profileId || ''} />
            <input type="hidden" name="newRole" value={roleChangeAction?.newRole || ''} />
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setRoleChangeAction(null)}
                type="button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className={roleChangeAction?.newRole === 'admin' ? 'bg-purple-600 hover:bg-purple-700' : ''}
              >
                {isSubmitting ? 'Changing...' : `Make ${roleChangeAction?.newRole || 'User'}`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
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