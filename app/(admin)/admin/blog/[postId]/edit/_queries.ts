'use server';

import { db } from '@/lib/db';
import { blogPosts } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import type { BlogPost } from '@/lib/db/schema';

export async function getBlogPostByIdForEdit(postId: string): Promise<BlogPost | null> {
  try {
    const result = await (await db())
      .select()
      .from(blogPosts)
      .where(and(
        eq(blogPosts.id, postId),
        eq(blogPosts.deleted, false)
      ))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error('Error fetching blog post for edit:', error);
    throw new Error('Failed to fetch blog post');
  }
}

export async function updateBlogPost(
  postId: string, 
  data: Partial<Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  try {
    await (await db())
      .update(blogPosts)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(blogPosts.id, postId));
  } catch (error) {
    console.error('Error updating blog post:', error);
    throw new Error('Failed to update blog post');
  }
} 