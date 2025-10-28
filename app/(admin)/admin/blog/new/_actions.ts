'use server';

import { getUserWithProfile } from '@/lib/supabase/server';
import { insertBlogPost, checkSlugUniqueness } from './_queries';
import { ensureUniqueSlug } from './_utils/slugify';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { NewBlogPost } from '@/lib/db/schema';
import { getProfileIdFromAuthUserId } from '../_queries';
import { uploadBlogImage } from '@/lib/utils/blog-image-upload';

export async function createBlogPostAction(formData: FormData): Promise<{success: boolean, error?: string, postId?: string}> {
  try {
    const { user, isAdmin } = await getUserWithProfile();

    if (!user || !isAdmin) {
      return { success: false, error: 'Unauthorized. Admin access required.' };
    }

    // Extract form data
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const excerpt = formData.get('excerpt') as string;
    const status = formData.get('status') as 'DRAFT' | 'PUBLISHED';
    let slug = formData.get('slug') as string;
    const featuredImage = formData.get('featuredImage') as File | null;
    

    
    // Basic validation
    if (!title || !content) {
      return { success: false, error: 'Title and content are required.' };
    }

    // Ensure unique slug
    slug = await ensureUniqueSlug(slug);

    // Get user's profile ID
    const profileIdFromAuth = await getProfileIdFromAuthUserId(user.id);
    if (!profileIdFromAuth) {
      return { success: false, error: 'User profile not found.' };
    }

    // Handle featured image upload
    let featuredImageUrl: string | null = null;
    if (featuredImage) {
      const uploadResult = await uploadBlogImage({ file: featuredImage });
      if (!uploadResult.success) {
        return { success: false, error: uploadResult.error || 'Failed to upload featured image' };
      }
      featuredImageUrl = uploadResult.url || null;
    }

    // Determine publishedAt value
    const publishedAt = status === 'PUBLISHED' ? new Date() : null;

    // Prepare blog post data
    const blogPostData: Omit<NewBlogPost, 'id' | 'createdAt' | 'updatedAt'> = {
      title,
      slug,
      content,
      excerpt: excerpt || null,
      featuredImageUrl,
      status: status || 'DRAFT',
      authorId: profileIdFromAuth,
      publishedAt,
      deleted: false,
    };

    // Insert blog post
    const postId = await insertBlogPost(blogPostData);

    revalidatePath('/admin/blog');
    revalidatePath('/admin/blog/new');
    revalidatePath('/blog');
    return { success: true, postId };
    // redirect(`/blog/${postId}/edit`);
    
  } catch (error) {
    console.error('Error creating blog post:', error);
    return { success: false, error: 'Failed to create blog post. Please try again.' };
  }
} 