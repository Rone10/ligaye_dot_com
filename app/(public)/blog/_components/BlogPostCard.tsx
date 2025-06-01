import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Calendar, ArrowRight } from 'lucide-react';
import type { BlogPostWithAuthor } from '../_queries';

interface BlogPostCardProps {
  post: BlogPostWithAuthor;
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  const formatDate = (date: Date | string | null) => {
    if (!date) return 'No date';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return format(dateObj, 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <Card className="glass-card group hover:shadow-level-3 duration-standard cursor-pointer h-full flex flex-col">
      <Link href={`/blog/${post.slug}`} className="flex flex-col h-full">
        {/* Featured Image */}
        <div className="relative h-48 w-full overflow-hidden rounded-t-lg bg-theme-gray/20">
          {post.featuredImageUrl ? (
            <Image
              src={post.featuredImageUrl}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 duration-standard"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-bg">
              <div className="text-theme-gray-dark text-sm font-medium">
                No image available
              </div>
            </div>
          )}
        </div>

        <CardHeader className="p-lg flex-1">
          {/* Title */}
          <h2 className="text-xl font-semibold text-theme-dark leading-tight group-hover:text-primary-blue duration-standard line-clamp-2">
            {post.title}
          </h2>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-base text-theme-gray-dark leading-normal mt-sm line-clamp-3">
              {post.excerpt}
            </p>
          )}
        </CardHeader>

        <CardContent className="p-lg pt-0 mt-auto">
          {/* Date and Read More */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-xs text-sm text-theme-gray-dark">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(post.publishedAt)}</span>
            </div>

            {/* Read More Arrow */}
            <div className="flex items-center text-primary-blue group-hover:translate-x-1 duration-standard">
              <span className="text-sm font-medium mr-xs">Read more</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
} 