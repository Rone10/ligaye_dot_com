import React from 'react';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { parseAsInteger, createSearchParamsCache } from 'nuqs/server';
import { getPublishedBlogPosts } from './_queries';
import { BlogPostCard } from './_components/BlogPostCard';
import { BlogPagination } from './_components/BlogPagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog | Ligaye.com - Latest Insights & Job Market Trends',
  description: 'Stay updated with the latest trends in the Gambian job market, career advice, and insights from industry experts.',
  keywords: 'Gambia jobs, career advice, job market trends, employment insights, professional development',
  openGraph: {
    title: 'Blog | Ligaye.com',
    description: 'Latest insights and job market trends in Gambia',
    type: 'website',
  },
};

const searchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
});

interface BlogPageProps {
  searchParams: Promise<{ page?: string }>;
}

// Loading skeleton component
function BlogPostsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-xl">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="glass-card animate-pulse">
          <div className="h-48 bg-theme-gray/20 rounded-t-lg" />
          <CardHeader className="p-lg">
            <div className="h-6 bg-theme-gray/20 rounded-md mb-sm" />
            <div className="h-4 bg-theme-gray/20 rounded-md mb-xs" />
            <div className="h-4 bg-theme-gray/20 rounded-md w-3/4" />
          </CardHeader>
          <CardContent className="p-lg pt-0">
            <div className="flex items-center gap-sm">
              <div className="h-8 w-8 bg-theme-gray/20 rounded-full" />
              <div className="flex flex-col gap-xs">
                <div className="h-4 bg-theme-gray/20 rounded-md w-20" />
                <div className="h-3 bg-theme-gray/20 rounded-md w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Empty state component
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-2xl">
      <Card className="glass-card max-w-md w-full text-center p-xl">
        <CardHeader className="items-center">
          <div className="mb-lg inline-flex items-center justify-center p-lg bg-primary-blue/10 rounded-full">
            <BookOpen className="h-10 w-10 text-primary-blue" />
          </div>
          <CardTitle className="text-2xl font-bold text-theme-dark mb-sm">
            No Blog Posts Yet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base text-theme-gray-dark leading-normal">
            We&apos;re working on bringing you the latest insights and trends in the job market. 
            Check back soon for updates!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { page } = searchParamsCache.parse(await searchParams);
  const postsPerPage = 9;

  try {
    const { posts, totalCount } = await getPublishedBlogPosts({
      page,
      limit: postsPerPage,
    });

    const totalPages = Math.ceil(totalCount / postsPerPage);

    if (totalCount === 0) {
      return (
        <div className="min-h-screen bg-gradient-bg py-2xl">
          <div className="container mx-auto px-lg">
            <EmptyState />
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-bg py-2xl">
        <div className="container mx-auto px-lg">
          {/* Header */}
          <div className="text-center mb-2xl">
            <h1 className="text-3xl font-bold text-theme-dark mb-md">
              Latest Insights & Trends
            </h1>
            <p className="text-lg text-theme-gray-dark max-w-2xl mx-auto leading-normal">
              Stay updated with the latest trends in the Gambian job market, career advice, 
              and professional development insights.
            </p>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-xl mb-2xl">
            {posts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Pagination */}
          <Suspense fallback={<div className="flex justify-center py-xl">Loading...</div>}>
            <BlogPagination
              currentPage={page}
              totalPages={totalPages}
              totalPosts={totalCount}
              postsPerPage={postsPerPage}
            />
          </Suspense>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading blog posts:', error);
    
    return (
      <div className="min-h-screen bg-gradient-bg py-2xl">
        <div className="container mx-auto px-lg">
          <div className="flex flex-col items-center justify-center py-2xl">
            <Card className="glass-card max-w-md w-full text-center p-xl">
              <CardHeader className="items-center">
                <div className="mb-lg inline-flex items-center justify-center p-lg bg-red-100 rounded-full">
                  <Search className="h-10 w-10 text-red-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-theme-dark mb-sm">
                  Something went wrong
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base text-theme-gray-dark leading-normal">
                  We&apos;re having trouble loading the blog posts. Please try again later.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
} 