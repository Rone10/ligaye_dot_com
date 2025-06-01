import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ArrowRight } from 'lucide-react';
import type { BlogPostWithAuthor } from '../_queries';

interface BlogPostCardProps {
  post: BlogPostWithAuthor;
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

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
          {/* Author and Date */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-sm">
              <Avatar className="h-8 w-8">
                <AvatarImage src={post.author.avatarUrl || ''} />
                <AvatarFallback className="bg-primary-blue/10 text-primary-blue text-xs font-medium">
                  {getInitials(post.author.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-theme-dark">
                  {post.author.fullName}
                </span>
                <div className="flex items-center gap-xs text-xs text-theme-gray-dark">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(post.publishedAt)}</span>
                </div>
              </div>
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