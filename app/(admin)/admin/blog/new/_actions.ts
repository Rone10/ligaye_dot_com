'use server';

import { getUser } from '@/lib/supabase/server';
import { insertBlogPost, checkSlugUniqueness } from './_queries';
import { ensureUniqueSlug } from './_utils/slugify';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { NewBlogPost } from '@/lib/db/schema';
import { getProfileIdFromAuthUserId } from '../_queries';

export async function createBlogPostAction(formData: FormData): Promise<{success: boolean, error?: string, postId?: string}> {
  try {
    const user = await getUser();
    
    if (!user || user?.user_metadata?.role !== 'admin') {
      return { success: false, error: 'Unauthorized. Admin access required.' };
    }

    // Extract form data
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const excerpt = formData.get('excerpt') as string;
    const status = formData.get('status') as 'DRAFT' | 'PUBLISHED';
    let slug = formData.get('slug') as string;
    
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

    // Prepare blog post data
    const blogPostData: Omit<NewBlogPost, 'id' | 'createdAt' | 'updatedAt'> = {
      title,
      slug,
      content,
      excerpt: excerpt || null,
      featuredImageUrl: null, // Will be implemented later with file upload
      status: status || 'DRAFT',
      authorId: profileIdFromAuth,
      publishedAt: status === 'PUBLISHED' ? new Date() : null,
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