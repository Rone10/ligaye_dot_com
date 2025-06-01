'use server';

import { db } from '@/lib/db';
import { blogPosts, profiles } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import type { BlogPost } from '@/lib/db/schema';

export type BlogPostWithAuthor = BlogPost & {
  author: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  };
};

export async function getPublishedBlogPostBySlug(slug: string): Promise<BlogPostWithAuthor | null> {
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
      .where(
        and(
          eq(blogPosts.slug, slug),
          eq(blogPosts.status, 'PUBLISHED'),
          eq(blogPosts.deleted, false)
        )
      )
      .limit(1);

    if (!result[0]) {
      return null;
    }

    const post = {
      ...result[0],
      author: result[0].author || {
        id: '',
        fullName: 'Unknown Author',
        avatarUrl: null,
      },
    };

    return post;
  } catch (error) {
    console.error('Error fetching blog post by slug:', error);
    throw new Error('Failed to fetch blog post');
  }
} 