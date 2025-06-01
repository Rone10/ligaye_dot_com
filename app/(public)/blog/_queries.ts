'use server';

import { db } from '@/lib/db';
import { blogPosts, profiles } from '@/lib/db/schema';
import { eq, desc, and, count } from 'drizzle-orm';
import type { BlogPost, Profile } from '@/lib/db/schema';

export type BlogPostWithAuthor = BlogPost & {
  author: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  };
};

export async function getPublishedBlogPosts(params: {
  page: number;
  limit: number;
}): Promise<{ posts: BlogPostWithAuthor[]; totalCount: number }> {
  try {
    const { page, limit } = params;
    const offset = (page - 1) * limit;

    // Get total count of published posts
    const totalCountResult = await (await db())
      .select({ count: count() })
      .from(blogPosts)
      .where(
        and(
          eq(blogPosts.status, 'PUBLISHED'),
          eq(blogPosts.deleted, false)
        )
      );

    const totalCount = totalCountResult[0]?.count || 0;

    // Get paginated posts with author information
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
      .where(
        and(
          eq(blogPosts.status, 'PUBLISHED'),
          eq(blogPosts.deleted, false)
        )
      )
      .orderBy(desc(blogPosts.publishedAt))
      .limit(limit)
      .offset(offset);

    const posts = result.map(row => ({
      ...row,
      author: row.author || {
        id: '',
        fullName: 'Unknown Author',
        avatarUrl: null,
      },
    }));

    return { posts, totalCount };
  } catch (error) {
    console.error('Error fetching published blog posts:', error);
    throw new Error('Failed to fetch blog posts');
  }
} 