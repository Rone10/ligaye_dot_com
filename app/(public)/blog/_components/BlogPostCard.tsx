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
    <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group h-full flex flex-col">
      <Link href={`/blog/${post.slug}`} className="flex flex-col h-full">
        {/* Featured Image */}
        <div className="relative h-48 w-full overflow-hidden rounded-t-xl bg-muted">
          {post.featuredImageUrl ? (
            <Image
              src={post.featuredImageUrl}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-muted">
              <div className="text-muted-foreground text-sm font-medium">
                No image available
              </div>
            </div>
          )}
        </div>

        <CardHeader className="p-6 flex-1">
          {/* Title */}
          <h2 className="text-xl font-semibold text-card-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h2>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-base text-muted-foreground leading-normal mt-2 line-clamp-3">
              {post.excerpt}
            </p>
          )}
        </CardHeader>

        <CardContent className="p-6 pt-0 mt-auto">
          {/* Date and Read More */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(post.publishedAt)}</span>
            </div>

            {/* Read More Arrow */}
            <div className="flex items-center text-primary group-hover:translate-x-1 transition-transform duration-300">
              <span className="text-sm font-medium mr-1">Read more</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
} 