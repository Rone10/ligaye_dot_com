'use server'

import { db } from '@/lib/db';
import { blogPosts, profiles } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import type { BlogPost, Profile } from '@/lib/db/schema';

export type BlogPostWithAuthor = BlogPost & {
  author: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  };
};

// Cache tags for hierarchical invalidation
const CACHE_TAGS = {
  blogPost: (id: string) => `blog-post-${id}`,
  blogPostCollection: 'blog-posts-collection',
  adminBlogData: 'admin-blog-data',
  userProfile: (userId: string) => `user-profile-${userId}`
};

// Internal function without caching
async function getAllBlogPostsForAdminInternal(): Promise<BlogPostWithAuthor[]> {
  try {
    // Optimized query using Drizzle query API with relations
    const result = await (await db()).query.blogPosts.findMany({
      where: eq(blogPosts.deleted, false),
      orderBy: [desc(blogPosts.createdAt)],
      with: {
        // Assuming you have a relation defined in schema - if not, we'll use the existing leftJoin approach
        author: {
          columns: {
            id: true,
            fullName: true,
            avatarUrl: true
          }
        }
      }
    });

    // Fallback to leftJoin approach if relations aren't defined
    if (!result || result.length === 0) {
      const fallbackResult = await (await db())
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
        .where(eq(blogPosts.deleted, false))
        .orderBy(desc(blogPosts.createdAt));

      return fallbackResult.map(row => ({
        ...row,
        author: row.author || {
          id: '',
          fullName: 'Unknown Author',
          avatarUrl: null,
        },
      }));
    }

    return result.map(post => ({
      ...post,
      author: post.author || {
        id: '',
        fullName: 'Unknown Author',
        avatarUrl: null,
      },
    }));
  } catch (error) {
    console.error('Error fetching blog posts for admin:', error);
    throw new Error('Failed to fetch blog posts');
  }
}

// Cached version with on-demand invalidation
export const getAllBlogPostsForAdmin = async (): Promise<BlogPostWithAuthor[]> => {
  const cachedFunction = unstable_cache(
    async () => getAllBlogPostsForAdminInternal(),
    ['admin-blog-posts'],
    {
      tags: [CACHE_TAGS.blogPostCollection, CACHE_TAGS.adminBlogData]
      // NO revalidate property = indefinite cache until tag invalidation
    }
  );
  
  return cachedFunction();
};

// Request-level cache for repeated calls within same request
export const getAllBlogPostsForAdminCached = cache(getAllBlogPostsForAdmin);

// Internal function for profile lookup
async function getProfileIdFromAuthUserIdInternal(userId: string): Promise<string | null> {
  try {
    const result = await (await db())
      .select({ id: profiles.id })
      .from(profiles)
      .where(and(eq(profiles.userId, userId), eq(profiles.deleted, false)))
      .limit(1);

    return result[0]?.id || null;
  } catch (error) {
    console.error('Error fetching profile ID from auth user ID:', error);
    return null;
  }
}

// Cached version with on-demand invalidation
export const getProfileIdFromAuthUserId = async (userId: string): Promise<string | null> => {
  const cachedFunction = unstable_cache(
    async () => getProfileIdFromAuthUserIdInternal(userId),
    [`profile-id-${userId}`],
    {
      tags: [CACHE_TAGS.userProfile(userId)]
      // NO revalidate property = indefinite cache until tag invalidation
    }
  );
  
  return cachedFunction();
};

// Cache invalidation helpers - call these when data changes
export async function invalidateBlogPostCache(postId?: string) {
  const { revalidateTag } = await import('next/cache');
  
  const tags = [
    CACHE_TAGS.blogPostCollection,
    CACHE_TAGS.adminBlogData
  ];
  
  if (postId) {
    tags.push(CACHE_TAGS.blogPost(postId));
  }
  
  await Promise.all(tags.map(tag => revalidateTag(tag)));
}

export async function invalidateUserProfileCache(userId: string) {
  const { revalidateTag } = await import('next/cache');
  
  await revalidateTag(CACHE_TAGS.userProfile(userId));
} 