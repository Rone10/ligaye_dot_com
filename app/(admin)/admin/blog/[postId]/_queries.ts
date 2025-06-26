'use server';

import { db } from '@/lib/db';
import { blogPosts, profiles } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import type { BlogPost } from '@/lib/db/schema';

export type BlogPostWithAuthorDetail = BlogPost & {
  author: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  };
};

// Cache tags for hierarchical invalidation
const CACHE_TAGS = {
  blogPost: (id: string) => `blog-post-${id}`,
  blogPostDetail: (id: string) => `blog-post-detail-${id}`,
  adminBlogData: 'admin-blog-data'
};

// Internal function without caching
async function getBlogPostByIdForAdminInternal(postId: string): Promise<BlogPostWithAuthorDetail | null> {
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

// Cached version with on-demand invalidation
export const getBlogPostByIdForAdmin = async (postId: string): Promise<BlogPostWithAuthorDetail | null> => {
  const cachedFunction = unstable_cache(
    async () => getBlogPostByIdForAdminInternal(postId),
    [`blog-post-detail-${postId}`],
    {
      tags: [CACHE_TAGS.blogPost(postId), CACHE_TAGS.blogPostDetail(postId), CACHE_TAGS.adminBlogData]
      // NO revalidate property = indefinite cache until tag invalidation
    }
  );
  
  return cachedFunction();
};

// Request-level cache for repeated calls within same request
export const getBlogPostByIdForAdminCached = cache(getBlogPostByIdForAdmin);

// Cache invalidation helper
export async function invalidateBlogPostDetailCache(postId: string) {
  const { revalidateTag } = await import('next/cache');
  
  await Promise.all([
    revalidateTag(CACHE_TAGS.blogPost(postId)),
    revalidateTag(CACHE_TAGS.blogPostDetail(postId)),
    revalidateTag(CACHE_TAGS.adminBlogData)
  ]);
} 