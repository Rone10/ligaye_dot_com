import { db } from '@/lib/db';
import { blogPosts, profiles } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import type { BlogPost, Profile } from '@/lib/db/schema';

export type BlogPostWithAuthor = BlogPost & {
  author: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  };
};

export async function getAllBlogPostsForAdmin(): Promise<BlogPostWithAuthor[]> {
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
      .where(eq(blogPosts.deleted, false))
      .orderBy(desc(blogPosts.createdAt));

    return result.map(row => ({
      ...row,
      author: row.author || {
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

export async function getProfileIdFromAuthUserId(userId: string): Promise<string | null> {
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