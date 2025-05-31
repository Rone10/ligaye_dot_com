'use server';

import { db } from '@/lib/db';
import { blogPosts, profiles } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import type { BlogPost } from '@/lib/db/schema';

export type BlogPostWithAuthorDetail = BlogPost & {
  author: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  };
};

export async function getBlogPostByIdForAdmin(postId: string): Promise<BlogPostWithAuthorDetail | null> {
  try {
    const result = await (await db())
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        content: blogPosts.content,
        excerpt: blogPosts.excerpt,
        featuredImageUrl: blogPosts.featuredImageUrl,
        status: blogPosts.status,
        authorId: blogPosts.authorId,
        publishedAt: blogPosts.publishedAt,
        deleted: blogPosts.deleted,
        createdAt: blogPosts.createdAt,
        updatedAt: blogPosts.updatedAt,
        author: {
          id: profiles.id,
          fullName: profiles.fullName,
          avatarUrl: profiles.avatarUrl,
        },
      })
      .from(blogPosts)
      .leftJoin(profiles, eq(blogPosts.authorId, profiles.id))
      .where(and(
        eq(blogPosts.id, postId),
        eq(blogPosts.deleted, false)
      ))
      .limit(1);

    const row = result[0];
    if (!row) return null;

    return {
      ...row,
      author: row.author || {
        id: '',
        fullName: 'Unknown Author',
        avatarUrl: null,
      },
    };
  } catch (error) {
    console.error('Error fetching blog post for admin detail:', error);
    throw new Error('Failed to fetch blog post');
  }
} 