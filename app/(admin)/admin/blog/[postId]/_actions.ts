'use server';

import { getUserWithProfile } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { blogPosts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function deleteBlogPostFromDetailAction(postId: string): Promise<{success: boolean, error?: string}> {
  try {
    const { user, isAdmin } = await getUserWithProfile();

    if (!user || !isAdmin) {
      return { success: false, error: 'Unauthorized. Admin access required.' };
    }

    if (!postId) {
      return { success: false, error: 'Post ID is required.' };
    }

    // Soft delete the blog post
    await (await db())
      .update(blogPosts)
      .set({ 
        deleted: true,
        updatedAt: new Date()
      })
      .where(eq(blogPosts.id, postId));

    revalidatePath('/blog');
    revalidatePath('/admin/blog');
    revalidatePath(`/admin/blog/${postId}`);
    revalidatePath(`/blog/${postId}`);
    // redirect('/admin/blog');
    return { success: true };
    
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return { success: false, error: 'Failed to delete blog post. Please try again.' };
  }
}

export async function updateBlogPostStatusAction(
  postId: string, 
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
): Promise<{success: boolean, error?: string}> {
  try {
    const { user, isAdmin } = await getUserWithProfile();

    if (!user || !isAdmin) {
      return { success: false, error: 'Unauthorized. Admin access required.' };
    }

    if (!postId) {
      return { success: false, error: 'Post ID is required.' };
    }

    // Update the blog post status
    await (await db())
      .update(blogPosts)
      .set({ 
        status,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
        updatedAt: new Date()
      })
      .where(eq(blogPosts.id, postId));

    revalidatePath(`/blog/${postId}`);
    revalidatePath('/blog');
    
    return { success: true };
    
  } catch (error) {
    console.error('Error updating blog post status:', error);
    return { success: false, error: 'Failed to update blog post status. Please try again.' };
  }
} 