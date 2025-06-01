 import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-bg py-2xl">
      <div className="container mx-auto px-lg max-w-4xl">
        {/* Back to Blog Button */}
        <div className="mb-xl">
          <Link href="/blog">
            <Button
              variant="ghost"
              className="gap-xs text-theme-gray-dark hover:text-primary-blue duration-standard"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>

        {/* Loading Skeleton */}
        <Card className="glass-card overflow-hidden animate-pulse">
          {/* Featured Image Skeleton */}
          <div className="h-96 w-full bg-theme-gray/20" />

          <CardContent className="p-2xl">
            {/* Article Header Skeleton */}
            <header className="mb-2xl">
              {/* Title Skeleton */}
              <div className="h-8 bg-theme-gray/20 rounded-md mb-lg w-3/4" />

              {/* Article Meta Skeleton */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-lg">
                {/* Author Info Skeleton */}
                <div className="flex items-center gap-md">
                  <div className="h-12 w-12 bg-theme-gray/20 rounded-full" />
                  <div>
                    <div className="h-5 bg-theme-gray/20 rounded-md mb-xs w-24" />
                    <div className="h-4 bg-theme-gray/20 rounded-md w-32" />
                  </div>
                </div>

                {/* Share Button Skeleton */}
                <div className="h-8 w-16 bg-theme-gray/20 rounded-md" />
              </div>

              {/* Excerpt Skeleton */}
              <div className="mt-lg p-lg bg-theme-gray/10 border-l-4 border-theme-gray/20 rounded-md">
                <div className="h-5 bg-theme-gray/20 rounded-md mb-sm" />
                <div className="h-5 bg-theme-gray/20 rounded-md w-4/5" />
              </div>
            </header>

            {/* Article Content Skeleton */}
            <article className="space-y-lg">
              <div className="h-4 bg-theme-gray/20 rounded-md" />
              <div className="h-4 bg-theme-gray/20 rounded-md w-5/6" />
              <div className="h-4 bg-theme-gray/20 rounded-md w-4/5" />
              <div className="h-4 bg-theme-gray/20 rounded-md" />
              <div className="h-4 bg-theme-gray/20 rounded-md w-3/4" />
              
              <div className="h-6 bg-theme-gray/20 rounded-md w-1/3 mt-xl mb-md" />
              
              <div className="h-4 bg-theme-gray/20 rounded-md" />
              <div className="h-4 bg-theme-gray/20 rounded-md w-4/5" />
              <div className="h-4 bg-theme-gray/20 rounded-md w-5/6" />
              <div className="h-4 bg-theme-gray/20 rounded-md" />
              
              <div className="h-6 bg-theme-gray/20 rounded-md w-2/5 mt-xl mb-md" />
              
              <div className="h-4 bg-theme-gray/20 rounded-md" />
              <div className="h-4 bg-theme-gray/20 rounded-md w-3/4" />
              <div className="h-4 bg-theme-gray/20 rounded-md w-5/6" />
            </article>

            {/* Article Footer Skeleton */}
            <footer className="mt-2xl pt-xl border-t border-theme-gray">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-lg">
                {/* Author Card Skeleton */}
                <div className="flex items-center gap-md">
                  <div className="h-16 w-16 bg-theme-gray/20 rounded-full" />
                  <div>
                    <div className="h-5 bg-theme-gray/20 rounded-md mb-xs w-28" />
                    <div className="h-4 bg-theme-gray/20 rounded-md w-16" />
                  </div>
                </div>

                {/* Back to Blog Button Skeleton */}
                <div className="h-10 w-32 bg-theme-gray/20 rounded-md" />
              </div>
            </footer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 