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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="bg-card border border-border rounded-xl animate-pulse">
          <div className="h-48 bg-muted rounded-t-xl" />
          <CardHeader className="p-6">
            <div className="h-6 bg-muted rounded-md mb-2" />
            <div className="h-4 bg-muted rounded-md mb-1" />
            <div className="h-4 bg-muted rounded-md w-3/4" />
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-muted rounded-full" />
              <div className="flex flex-col gap-1">
                <div className="h-4 bg-muted rounded-md w-20" />
                <div className="h-3 bg-muted rounded-md w-16" />
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
    <div className="flex flex-col items-center justify-center py-12">
      <Card className="bg-card border border-border rounded-xl max-w-md w-full text-center p-8">
        <CardHeader className="items-center">
          <div className="mb-6 inline-flex items-center justify-center p-4 bg-primary/10 rounded-full">
            <BookOpen className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold mb-2">
            No Blog Posts Yet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base text-muted-foreground leading-normal">
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
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <EmptyState />
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
              Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Insights</span> & Trends
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Stay updated with the latest trends in the Gambian job market, career advice,
              and professional development insights.
            </p>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {posts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Pagination */}
          <Suspense fallback={<div className="flex justify-center py-8">Loading...</div>}>
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
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-12">
            <Card className="bg-card border border-border rounded-xl max-w-md w-full text-center p-8">
              <CardHeader className="items-center">
                <div className="mb-6 inline-flex items-center justify-center p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <Search className="h-10 w-10 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-2xl font-bold mb-2">
                  Something went wrong
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base text-muted-foreground leading-normal">
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