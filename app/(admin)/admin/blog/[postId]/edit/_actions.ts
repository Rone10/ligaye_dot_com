'use server';

import { getUser } from '@/lib/supabase/server';
import { updateBlogPost, getBlogPostByIdForEdit } from './_queries';
import { ensureUniqueSlug } from '../../new/_utils/slugify';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { uploadBlogImage, deleteBlogImage, extractFileNameFromUrl } from '@/lib/utils/blog-image-upload';

export async function updateBlogPostAction(
  postId: string, 
  formData: FormData
): Promise<{success: boolean, error?: string}> {
  try {
    const user = await getUser();
    
    if (!user || user?.user_metadata?.role !== 'admin') {
      return { success: false, error: 'Unauthorized. Admin access required.' };
    }

    if (!postId) {
      return { success: false, error: 'Post ID is required.' };
    }

    // Extract form data
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const excerpt = formData.get('excerpt') as string;
    const status = formData.get('status') as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    let slug = formData.get('slug') as string;
    const originalSlug = formData.get('originalSlug') as string;
    const featuredImage = formData.get('featuredImage') as File | null;
    const removeFeaturedImage = formData.get('removeFeaturedImage') === 'true';
    
    // Basic validation
    if (!title || !content) {
      return { success: false, error: 'Title and content are required.' };
    }

    // Ensure unique slug (exclude current post)
    if (slug !== originalSlug) {
      slug = await ensureUniqueSlug(slug, postId);
    }

    // Get current post data to check existing publishedAt
    const currentPost = await getBlogPostByIdForEdit(postId);
    if (!currentPost) {
      return { success: false, error: 'Blog post not found.' };
    }

    // Handle featured image upload/removal
    let featuredImageUrl = currentPost.featuredImageUrl;
    
    if (removeFeaturedImage) {
      // Remove existing image
      if (currentPost.featuredImageUrl) {
        const fileName = extractFileNameFromUrl(currentPost.featuredImageUrl);
        if (fileName) {
          await deleteBlogImage(fileName);
        }
      }
      featuredImageUrl = null;
    } else if (featuredImage) {
      // Upload new image
      const uploadResult = await uploadBlogImage({ file: featuredImage });
      if (!uploadResult.success) {
        return { success: false, error: uploadResult.error || 'Failed to upload featured image' };
      }
      
      // Delete old image if it exists
      if (currentPost.featuredImageUrl) {
        const fileName = extractFileNameFromUrl(currentPost.featuredImageUrl);
        if (fileName) {
          await deleteBlogImage(fileName);
        }
      }
      
      featuredImageUrl = uploadResult.url || null;
    }

    // Determine publishedAt value:
    // - If post is being published for the first time, set current date
    // - If post was already published, preserve original date
    // - If post is being changed to DRAFT/ARCHIVED, set to null
    let publishedAtValue: Date | null = null;
    
    if (status === 'PUBLISHED') {
      if (currentPost.status === 'PUBLISHED' && currentPost.publishedAt) {
        // Keep the original published date
        publishedAtValue = currentPost.publishedAt;
      } else {
        // First time publishing - set current date
        publishedAtValue = new Date();
      }
    }

    // Prepare update data
    const updateData = {
      title,
      slug,
      content,
      excerpt: excerpt || null,
      featuredImageUrl,
      status: status || 'DRAFT',
      publishedAt: publishedAtValue,
    };

    // Update blog post
    await updateBlogPost(postId, updateData);

    revalidatePath('/admin/blog');
    revalidatePath(`/admin/blog/${postId}/edit`);
    revalidatePath('/blog');
    revalidatePath(`/blog/${postId}`);
    
    return { success: true };
    
  } catch (error) {
    console.error('Error updating blog post:', error);
    return { success: false, error: 'Failed to update blog post. Please try again.' };
  }
} 