'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ArrowLeft, Edit, Trash2, Eye, Share2, Calendar, User, Clock, Globe, Archive, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { deleteBlogPostFromDetailAction, updateBlogPostStatusAction } from '../_actions';
import type { BlogPostWithAuthorDetail } from '../_queries';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';

interface BlogPostDetailViewProps {
  blogPost: BlogPostWithAuthorDetail;
}

export function BlogPostDetailView({ blogPost }: BlogPostDetailViewProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(blogPost.status);

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const result = await deleteBlogPostFromDetailAction(blogPost.id);
      
      if (!result.success) {
        alert(result.error || 'Failed to delete blog post');
        setIsDeleting(false);
      }
      //if successful, redirect to the admin blog page
      if (result.success) {
        toast.success('Blog post deleted successfully');
        router.push('/admin/blog');
      }
    } catch (error) {
      alert('An error occurred while deleting the blog post');
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;
    
    setIsUpdatingStatus(true);
    
    try {
      const result = await updateBlogPostStatusAction(
        blogPost.id, 
        newStatus as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
      );
      
      if (result.success) {
        setCurrentStatus(newStatus as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED');
        toast.success('Blog post status updated successfully');
        // router.refresh();
      } else {
        toast.error(result.error || 'Failed to update blog post status');
      }
    } catch (error) {
      alert('An error occurred while updating the blog post status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { 
        label: 'Draft', 
        className: 'bg-theme-gray/20 text-theme-gray-dark border-theme-gray/30 hover:bg-theme-gray/30' 
      },
      PUBLISHED: { 
        label: 'Published', 
        className: 'bg-secondary-green/20 text-secondary-green border-secondary-green/30 hover:bg-secondary-green/30' 
      },
      ARCHIVED: { 
        label: 'Archived', 
        className: 'bg-theme-gray-dark/20 text-theme-gray-dark border-theme-gray-dark/30 hover:bg-theme-gray-dark/30' 
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;

    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const copyUrl = async () => {
    const url = `${window.location.origin}/blog/${blogPost.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      // You could add a toast notification here
      alert('URL copied to clipboard!');
    } catch (error) {
      alert('Failed to copy URL');
    }
  };

  return (
    <div className="space-y-lg">
      {/* Header with Navigation and Actions */}
      <div className="glass-card p-lg rounded-lg shadow-level-2">
        <div className="flex items-center justify-between mb-md">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="border-theme-gray text-theme-dark hover:bg-theme-gray/10 duration-standard"
          >
            <ArrowLeft className="w-4 h-4 mr-sm" />
            Back to Blog List
          </Button>

          <div className="flex items-center gap-sm">
            <Button
              variant="outline"
              onClick={copyUrl}
              className="border-theme-gray text-theme-dark hover:bg-theme-gray/10 duration-standard"
            >
              <Share2 className="w-4 h-4 mr-sm" />
              Copy URL
            </Button>
            
            <Button
              variant="outline"
              asChild
              className="border-theme-gray text-theme-dark hover:bg-theme-gray/10 duration-standard"
            >
              <Link href={`/blog/${blogPost.slug}`}>
                <Eye className="w-4 h-4 mr-sm" />
                Preview
              </Link>
            </Button>

            <Button
              variant="outline"
              asChild
              className="border-primary-blue text-primary-blue hover:bg-primary-blue/10 duration-standard"
            >
              <Link href={`/admin/blog/${blogPost.id}/edit`}>
                <Edit className="w-4 h-4 mr-sm" />
                Edit
              </Link>
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 duration-standard"
                >
                  <Trash2 className="w-4 h-4 mr-sm" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="glass-card border border-theme-gray">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-theme-dark">Delete Blog Post</AlertDialogTitle>
                  <AlertDialogDescription className="text-theme-gray-dark">
                    Are you sure you want to delete "{blogPost.title}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-theme-gray">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-lg">
          {/* Blog Post Header */}
          <div className="glass-card p-xl rounded-lg shadow-level-2">
            <div className="flex items-start justify-between mb-md">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-theme-dark mb-xs leading-tight">
                  {blogPost.title}
                </h1>
                <p className="text-base text-theme-gray-dark">
                  <Globe className="w-4 h-4 inline mr-xs" />
                  /blog/{blogPost.slug}
                </p>
              </div>
              <div className="ml-md">
                {getStatusBadge(currentStatus)}
              </div>
            </div>

            {/* Author and Dates */}
            <div className="flex flex-wrap items-center gap-lg text-sm text-theme-gray-dark mb-lg">
              <div className="flex items-center gap-xs">
                {blogPost.author.avatarUrl ? (
                  <Image
                    src={blogPost.author.avatarUrl}
                    alt={blogPost.author.fullName}
                    className="w-6 h-6 rounded-full object-cover"
                    width={24}
                    height={24}
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-primary-blue/20 flex items-center justify-center">
                    <User className="w-3 h-3 text-primary-blue" />
                  </div>
                )}
                <span>By {blogPost.author.fullName}</span>
              </div>

              <div className="flex items-center gap-xs">
                <Calendar className="w-4 h-4" />
                <span>Created {format(new Date(blogPost.createdAt), 'MMM dd, yyyy')}</span>
              </div>

              <div className="flex items-center gap-xs">
                <Clock className="w-4 h-4" />
                <span>Updated {format(new Date(blogPost.updatedAt), 'MMM dd, yyyy')}</span>
              </div>

              {blogPost.publishedAt && (
                <div className="flex items-center gap-xs">
                  <Globe className="w-4 h-4" />
                  <span>Published {format(new Date(blogPost.publishedAt), 'MMM dd, yyyy')}</span>
                </div>
              )}
            </div>

            {/* Excerpt */}
            {blogPost.excerpt && (
              <div className="bg-theme-gray/10 rounded-md p-md mb-lg">
                <h3 className="text-sm font-semibold text-theme-dark mb-xs flex items-center">
                  <FileText className="w-4 h-4 mr-xs" />
                  Excerpt
                </h3>
                <p className="text-sm text-theme-gray-dark italic leading-relaxed">
                  "{blogPost.excerpt}"
                </p>
              </div>
            )}
          </div>

          {/* Featured Image Section */}
          {blogPost.featuredImageUrl ? (
            <div className="glass-card p-xl rounded-lg shadow-level-2">
              <h3 className="text-lg font-semibold text-theme-dark mb-md">Featured Image</h3>
              <div className="rounded-md overflow-hidden">
                <Image
                  src={blogPost.featuredImageUrl}
                  alt={blogPost.title}
                  className="w-full h-auto object-cover"
                  width={24}
                  height={24}
                />
              </div>
            </div>
          ) : (
            <div className="glass-card p-xl rounded-lg shadow-level-2">
              <h3 className="text-lg font-semibold text-theme-dark mb-md">Featured Image</h3>
              <div className="border-2 border-dashed border-theme-gray rounded-md p-xl text-center">
                <p className="text-theme-gray-dark">No featured image set</p>
              </div>
            </div>
          )}

          {/* Blog Content */}
          <div className="glass-card p-xl rounded-lg shadow-level-2">
            <h3 className="text-lg font-semibold text-theme-dark mb-lg">Content</h3>
            <div 
              className="prose prose-gray max-w-none text-theme-dark leading-relaxed"
              dangerouslySetInnerHTML={{ __html: blogPost.content }}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-lg">
          {/* Quick Actions */}
          <Card className="glass-card border border-theme-gray">
            <CardHeader className="pb-md">
              <CardTitle className="text-lg font-semibold text-theme-dark">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              <div>
                <label className="text-sm font-medium text-theme-dark mb-xs block">
                  Change Status
                </label>
                <Select 
                  value={currentStatus}
                  onValueChange={handleStatusChange}
                  disabled={isUpdatingStatus}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
                {isUpdatingStatus && (
                  <p className="text-xs text-theme-gray-dark mt-xs">Updating status...</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Post Statistics */}
          <Card className="glass-card border border-theme-gray">
            <CardHeader className="pb-md">
              <CardTitle className="text-lg font-semibold text-theme-dark">Post Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-sm text-sm">
              <div className="flex justify-between">
                <span className="text-theme-gray-dark">Word Count:</span>
                <span className="text-theme-dark font-medium">
                  {blogPost.content.replace(/<[^>]*>/g, '').split(/\s+/).length} words
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-theme-gray-dark">Character Count:</span>
                <span className="text-theme-dark font-medium">
                  {blogPost.content.replace(/<[^>]*>/g, '').length} chars
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-theme-gray-dark">Reading Time:</span>
                <span className="text-theme-dark font-medium">
                  {Math.ceil(blogPost.content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200)} min
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-theme-gray-dark">Has Excerpt:</span>
                <span className="text-theme-dark font-medium">
                  {blogPost.excerpt ? 'Yes' : 'No'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* SEO Information */}
          <Card className="glass-card border border-theme-gray">
            <CardHeader className="pb-md">
              <CardTitle className="text-lg font-semibold text-theme-dark">SEO Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-sm text-sm">
              <div>
                <span className="text-theme-gray-dark block mb-xs">URL Slug:</span>
                <code className="bg-theme-gray/20 px-xs py-xxs rounded text-xs text-theme-dark">
                  {blogPost.slug}
                </code>
              </div>
              <div>
                <span className="text-theme-gray-dark block mb-xs">Title Length:</span>
                <span className={`text-theme-dark font-medium ${blogPost.title.length > 60 ? 'text-orange-600' : 'text-secondary-green'}`}>
                  {blogPost.title.length}/60 chars
                </span>
              </div>
              {blogPost.excerpt && (
                <div>
                  <span className="text-theme-gray-dark block mb-xs">Excerpt Length:</span>
                  <span className={`text-theme-dark font-medium ${blogPost.excerpt.length > 160 ? 'text-orange-600' : 'text-secondary-green'}`}>
                    {blogPost.excerpt.length}/160 chars
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 