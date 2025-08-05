import { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { jobs, blogPosts } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

type Sitemap = MetadataRoute.Sitemap;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://ligaye.com';

export default async function sitemap(): Promise<Sitemap> {
  const database = await db();
  
  // Static pages
  const staticPages: Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/jobs`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/tenders`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  // Fetch all active jobs
  const activeJobs = await database
    .select({
      id: jobs.id,
      updatedAt: jobs.updatedAt,
    })
    .from(jobs)
    .where(eq(jobs.status, 'ACTIVE'));

  const jobPages: Sitemap = activeJobs.map((job) => ({
    url: `${BASE_URL}/jobs/${job.id}`,
    lastModified: job.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Fetch all published blog posts
  const publishedPosts = await database
    .select({
      slug: blogPosts.slug,
      updatedAt: blogPosts.updatedAt,
    })
    .from(blogPosts)
    .where(
      and(
        eq(blogPosts.status, 'PUBLISHED'),
        eq(blogPosts.deleted, false)
      )
    );

  const blogPages: Sitemap = publishedPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticPages, ...jobPages, ...blogPages];
}