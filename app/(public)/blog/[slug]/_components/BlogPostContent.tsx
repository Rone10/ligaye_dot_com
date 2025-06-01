import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { ShareButton } from './ShareButton';
import type { BlogPostWithAuthor } from '../_queries';

interface BlogPostContentProps {
  post: BlogPostWithAuthor;
}

export function BlogPostContent({ post }: BlogPostContentProps) {
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
      return format(dateObj, 'MMMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const formatReadTime = (content: string) => {
    // Simple reading time calculation (average 200 words per minute)
    const wordCount = content.split(/\s+/).length;
    const readTimeMinutes = Math.ceil(wordCount / 200);
    return `${readTimeMinutes} min read`;
  };

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

        {/* Main Content */}
        <Card className="glass-card overflow-hidden">
          {/* Featured Image */}
          {post.featuredImageUrl && (
            <div className="relative h-96 w-full">
              <Image
                src={post.featuredImageUrl}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <CardContent className="p-2xl">
            {/* Article Header */}
            <header className="mb-2xl">
              {/* Title */}
              <h1 className="text-3xl font-bold text-theme-dark leading-tight mb-lg">
                {post.title}
              </h1>

              {/* Article Meta */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-lg">
                {/* Author Info */}
                <div className="flex items-center gap-md">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={post.author.avatarUrl || ''} />
                    <AvatarFallback className="bg-primary-blue/10 text-primary-blue font-semibold">
                      {getInitials(post.author.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-theme-dark">
                      {post.author.fullName}
                    </div>
                    <div className="flex items-center gap-md text-sm text-theme-gray-dark">
                      <div className="flex items-center gap-xs">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(post.publishedAt)}</span>
                      </div>
                      <span>•</span>
                      <span>{formatReadTime(post.content)}</span>
                    </div>
                  </div>
                </div>

                {/* Share Button (Optional) */}
                <ShareButton title={post.title} excerpt={post.excerpt} />
              </div>

              {/* Excerpt */}
              {post.excerpt && (
                <div className="mt-lg p-lg bg-primary-blue/5 border-l-4 border-primary-blue rounded-md">
                  <p className="text-lg text-theme-gray-dark leading-relaxed italic">
                    {post.excerpt}
                  </p>
                </div>
              )}
            </header>

            {/* Article Content */}
            <article className="prose prose-lg max-w-none">
              <div
                className="blog-content text-theme-dark leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: post.content,
                }}
                style={{
                  fontSize: '1.125rem',
                  lineHeight: '1.75',
                }}
              />
            </article>

            {/* Article Footer */}
            <footer className="mt-2xl pt-xl border-t border-theme-gray">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-lg">
                {/* Author Card */}
                <div className="flex items-center gap-md">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={post.author.avatarUrl || ''} />
                    <AvatarFallback className="bg-primary-blue/10 text-primary-blue font-bold text-lg">
                      {getInitials(post.author.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-theme-dark text-lg">
                      {post.author.fullName}
                    </div>
                    <div className="text-theme-gray-dark">
                      Author
                    </div>
                  </div>
                </div>

                {/* Back to Blog */}
                <Link href="/blog">
                  <Button className="gap-xs">
                    <ArrowLeft className="h-4 w-4" />
                    More Articles
                  </Button>
                </Link>
              </div>
            </footer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 