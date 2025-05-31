'use server';

import { db } from '@/lib/db';
import { blogPosts } from '@/lib/db/schema';
import { eq, and, ne } from 'drizzle-orm';
import type { NewBlogPost } from '@/lib/db/schema';

export async function insertBlogPost(data: Omit<NewBlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const result = await (await db())
      .insert(blogPosts)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({ id: blogPosts.id });

    return result[0].id;
  } catch (error) {
    console.error('Error inserting blog post:', error);
    throw new Error('Failed to create blog post');
  }
}

export async function checkSlugUniqueness(slug: string, excludeId?: string): Promise<boolean> {
  try {
    const conditions = [
      eq(blogPosts.slug, slug),
      eq(blogPosts.deleted, false)
    ];

    if (excludeId) {
      conditions.push(ne(blogPosts.id, excludeId));
    }

    const result = await (await db())
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(and(...conditions))
      .limit(1);

    return result.length === 0; // true if unique (no existing posts found)
  } catch (error) {
    console.error('Error checking slug uniqueness:', error);
    throw new Error('Failed to check slug uniqueness');
  }
} 