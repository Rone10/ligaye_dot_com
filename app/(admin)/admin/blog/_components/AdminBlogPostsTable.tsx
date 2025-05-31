'use client';

import { useState } from 'react';
import { deleteBlogPostAction } from '../_actions';
import type { BlogPostWithAuthor } from '../_queries';
import { format } from 'date-fns';
import { Pencil, Trash2, Eye, MoreHorizontal } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface AdminBlogPostsTableProps {
  blogPosts: BlogPostWithAuthor[];
}

export function AdminBlogPostsTable({ blogPosts }: AdminBlogPostsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (postId: string) => {
    setDeletingId(postId);
    
    try {
      const result = await deleteBlogPostAction(postId);
      
      if (!result.success) {
        alert(result.error || 'Failed to delete blog post');
      }
    } catch (error) {
      alert('An error occurred while deleting the blog post');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      DRAFT: 'bg-theme-gray/20 text-theme-gray-dark border-theme-gray/30',
      PUBLISHED: 'bg-secondary-green/20 text-secondary-green border-secondary-green/30',
      ARCHIVED: 'bg-theme-gray-dark/20 text-theme-gray-dark border-theme-gray-dark/30',
    };

    return (
      <span className={`px-sm py-xxs rounded-full text-xs font-medium border ${statusColors[status as keyof typeof statusColors] || statusColors.DRAFT}`}>
        {status}
      </span>
    );
  };

  if (blogPosts.length === 0) {
    return (
      <div className="glass-card p-xl rounded-lg text-center">
        <h3 className="text-xl font-semibold text-theme-dark mb-sm">No Blog Posts Yet</h3>
        <p className="text-base text-theme-gray-dark mb-lg">Get started by creating your first blog post.</p>
        <a
          href="/admin/blog/new"
          className="bg-primary-blue text-white px-lg py-md rounded-md shadow-level-2 hover:bg-primary-blue-light duration-standard font-semibold inline-block"
        >
          Create Your First Post
        </a>
      </div>
    );
  }

  return (
    <div className="bg-theme-light rounded-lg border border-theme-gray overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-theme-gray/10">
            <TableHead className="font-semibold text-theme-dark">Title</TableHead>
            <TableHead className="font-semibold text-theme-dark">Status</TableHead>
            <TableHead className="font-semibold text-theme-dark">Author</TableHead>
            <TableHead className="font-semibold text-theme-dark">Published At</TableHead>
            <TableHead className="font-semibold text-theme-dark">Created At</TableHead>
            <TableHead className="font-semibold text-theme-dark text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {blogPosts.map((post) => (
            <TableRow key={post.id} className="hover:bg-theme-gray/5 duration-fast">
              <TableCell>
                <div className="max-w-xs">
                  <p className="font-medium text-theme-dark truncate">{post.title}</p>
                  <p className="text-sm text-theme-gray-dark truncate">{post.slug}</p>
                </div>
              </TableCell>
              <TableCell>
                {getStatusBadge(post.status)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-xs">
                  {post.author.avatarUrl ? (
                    <img
                      src={post.author.avatarUrl}
                      alt={post.author.fullName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-blue/20 flex items-center justify-center">
                      <span className="text-xs font-medium text-primary-blue">
                        {post.author.fullName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-sm text-theme-dark">{post.author.fullName}</span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-theme-gray-dark">
                {post.publishedAt ? format(new Date(post.publishedAt), 'MMM dd, yyyy') : '—'}
              </TableCell>
              <TableCell className="text-sm text-theme-gray-dark">
                {format(new Date(post.createdAt), 'MMM dd, yyyy')}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass-card border border-theme-gray">
                    <DropdownMenuItem asChild>
                      <a
                        href={`/admin/blog/${post.slug}`}
                        className="flex items-center gap-xs cursor-pointer"
                      >
                        <Eye className="h-4 w-4" />
                        View Post
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a
                        href={`/admin/blog/${post.id}/edit`}
                        className="flex items-center gap-xs cursor-pointer"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </a>
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem 
                          onSelect={(e) => e.preventDefault()}
                          className="flex items-center gap-xs cursor-pointer text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="glass-card border border-theme-gray">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-theme-dark">Delete Blog Post</AlertDialogTitle>
                          <AlertDialogDescription className="text-theme-gray-dark">
                            Are you sure you want to delete "{post.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-theme-gray">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(post.id)}
                            disabled={deletingId === post.id}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            {deletingId === post.id ? 'Deleting...' : 'Delete'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 