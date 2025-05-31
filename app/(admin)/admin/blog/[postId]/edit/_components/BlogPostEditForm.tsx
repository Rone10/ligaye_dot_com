'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateBlogPostAction } from '../_actions';
import { generateSlug } from '../../../new/_utils/slugify';
import { Editor } from '@/components/RichTextEditor/editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Save, Eye } from 'lucide-react';
import type { BlogPost } from '@/lib/db/schema';
import { format } from 'date-fns';

const blogPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  slug: z.string().min(1, 'Slug is required').max(200, 'Slug must be less than 200 characters'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(500, 'Excerpt must be less than 500 characters').optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
});

type BlogPostFormData = z.infer<typeof blogPostSchema>;

interface BlogPostFormProps {
  blogPost: BlogPost;
}

export function BlogPostForm({ blogPost }: BlogPostFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [content, setContent] = useState(blogPost.content);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: blogPost.title,
      slug: blogPost.slug,
      content: blogPost.content,
      excerpt: blogPost.excerpt || '',
      status: blogPost.status,
    },
  });

  const watchedTitle = watch('title');
  const watchedSlug = watch('slug');

  // Auto-generate slug from title (but preserve manual changes)
  useEffect(() => {
    if (watchedTitle && watchedTitle !== blogPost.title) {
      if (!watchedSlug || watchedSlug === blogPost.slug || watchedSlug === generateSlug(watchedTitle.slice(0, -1))) {
        const newSlug = generateSlug(watchedTitle);
        setValue('slug', newSlug);
      }
    }
  }, [watchedTitle, watchedSlug, setValue, blogPost.title, blogPost.slug]);

  // Sync content with form
  useEffect(() => {
    setValue('content', content);
  }, [content, setValue]);

  const onSubmit = async (data: BlogPostFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('slug', data.slug);
      formData.append('content', content);
      formData.append('excerpt', data.excerpt || '');
      formData.append('status', data.status);
      formData.append('originalSlug', blogPost.slug);

      const result = await updateBlogPostAction(blogPost.id, formData);

      if (!result.success) {
        setSubmitError(result.error || 'Failed to update blog post');
      } else {
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 3000);
      }
    } catch (error) {
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-lg">
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-md flex items-center gap-sm">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{submitError}</p>
        </div>
      )}

      {submitSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-md p-md flex items-center gap-sm">
          <div className="h-5 w-5 text-green-600 flex-shrink-0">✓</div>
          <p className="text-sm text-green-700">Blog post updated successfully!</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-lg">
          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-base font-semibold text-theme-dark">
              Title *
            </Label>
            <Input
              id="title"
              {...register('title')}
              className="mt-xs h-[46px] px-md rounded-md border border-theme-gray focus:border-primary-blue focus:shadow-focus duration-standard"
              placeholder="Enter blog post title..."
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-xs">{errors.title.message}</p>
            )}
          </div>

          {/* Slug */}
          <div>
            <Label htmlFor="slug" className="text-base font-semibold text-theme-dark">
              URL Slug *
            </Label>
            <Input
              id="slug"
              {...register('slug')}
              className="mt-xs h-[46px] px-md rounded-md border border-theme-gray focus:border-primary-blue focus:shadow-focus duration-standard"
              placeholder="url-friendly-slug"
            />
            {errors.slug && (
              <p className="text-sm text-red-600 mt-xs">{errors.slug.message}</p>
            )}
            <p className="text-xs text-theme-gray-dark mt-xs">
              This will be used in the URL: /blog/{watchedSlug || 'your-slug-here'}
            </p>
          </div>

          {/* Content */}
          <div>
            <Label className="text-base font-semibold text-theme-dark mb-xs block">
              Content *
            </Label>
            <div className="mt-xs border border-theme-gray rounded-md overflow-hidden">
              <Editor
                value={content}
                onChange={setContent}
                height={400}
                className="min-h-[400px]"
              />
            </div>
            {errors.content && (
              <p className="text-sm text-red-600 mt-xs">{errors.content.message}</p>
            )}
          </div>

          {/* Excerpt */}
          <div>
            <Label htmlFor="excerpt" className="text-base font-semibold text-theme-dark">
              Excerpt
            </Label>
            <Textarea
              id="excerpt"
              {...register('excerpt')}
              className="mt-xs px-md py-sm rounded-md border border-theme-gray focus:border-primary-blue focus:shadow-focus duration-standard resize-none"
              placeholder="Brief summary for blog post previews..."
              rows={3}
            />
            {errors.excerpt && (
              <p className="text-sm text-red-600 mt-xs">{errors.excerpt.message}</p>
            )}
            <p className="text-xs text-theme-gray-dark mt-xs">
              Optional. Will be shown in blog post listings and social previews.
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-lg">
          {/* Post Information */}
          <Card className="glass-card border border-theme-gray">
            <CardHeader className="pb-md">
              <CardTitle className="text-lg font-semibold text-theme-dark">Post Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-sm text-sm">
              <div>
                <span className="text-theme-gray-dark">Created:</span>
                <span className="text-theme-dark ml-sm">
                  {format(new Date(blogPost.createdAt), 'MMM dd, yyyy')}
                </span>
              </div>
              <div>
                <span className="text-theme-gray-dark">Last Updated:</span>
                <span className="text-theme-dark ml-sm">
                  {format(new Date(blogPost.updatedAt), 'MMM dd, yyyy')}
                </span>
              </div>
              {blogPost.publishedAt && (
                <div>
                  <span className="text-theme-gray-dark">Published:</span>
                  <span className="text-theme-dark ml-sm">
                    {format(new Date(blogPost.publishedAt), 'MMM dd, yyyy')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Publish Settings */}
          <Card className="glass-card border border-theme-gray">
            <CardHeader className="pb-md">
              <CardTitle className="text-lg font-semibold text-theme-dark">Publish Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              <div>
                <Label htmlFor="status" className="text-sm font-medium text-theme-dark">
                  Status
                </Label>
                <Select 
                  defaultValue={blogPost.status}
                  onValueChange={(value) => setValue('status', value as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED')}
                >
                  <SelectTrigger className="mt-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-red-600 mt-xs">{errors.status.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card className="glass-card border border-theme-gray">
            <CardHeader className="pb-md">
              <CardTitle className="text-lg font-semibold text-theme-dark">Featured Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-theme-gray rounded-md p-lg text-center">
                <p className="text-sm text-theme-gray-dark">Image upload coming soon</p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-sm">
            <Button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="w-full bg-primary-blue text-white hover:bg-primary-blue-light duration-standard font-semibold"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-sm" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-sm" />
                  Update Post
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full border-theme-gray text-theme-dark hover:bg-theme-gray/10 duration-standard"
              asChild
            >
              <a href={`/blog/${blogPost.slug}`} target="_blank">
                <Eye className="w-4 h-4 mr-sm" />
                Preview Post
              </a>
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="w-full border-theme-gray text-theme-dark hover:bg-theme-gray/10 duration-standard"
              onClick={() => window.history.back()}
            >
              Back to List
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
} 