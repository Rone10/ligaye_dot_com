import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublishedBlogPostBySlug } from './_queries';
import { BlogPostContent } from './_components/BlogPostContent';
import { generateSEOMetadata } from '@/lib/seo/metadata';
import { generateArticleSchema } from '@/lib/seo/structured-data';
import StructuredData from '@/components/StructuredData';




interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const post = await getPublishedBlogPostBySlug(slug);

    if (!post) {
      return {
        title: 'Blog Post Not Found | Ligaye.com',
        description: 'The requested blog post could not be found.',
      };
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ligaye.com';
    const postUrl = `${baseUrl}/blog/${post.slug}`;

    return generateSEOMetadata({
      title: post.title,
      description: post.excerpt || `Read ${post.title} on Ligaye.com - insights and trends in the Gambian job market.`,
      path: `/blog/${post.slug}`,
      image: post.featuredImageUrl || undefined,
      keywords: [
        post.title,
        'Gambia jobs',
        'career advice',
        'job market trends',
        'employment tips Gambia',
        'career guidance Gambia',
        post.author.fullName
      ],
      type: 'article',
      publishedTime: post.publishedAt || undefined,
      modifiedTime: post.updatedAt || undefined,
      author: post.author.fullName,
    });
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Blog Post | Ligaye.com',
      description: 'Read the latest insights and trends in the Gambian job market.',
    };
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  try {
    const post = await getPublishedBlogPostBySlug(slug);

    if (!post) {
      notFound();
    }

    // Generate Article structured data
    const articleSchema = generateArticleSchema({
      title: post.title,
      description: post.excerpt || post.content.substring(0, 160),
      author: {
        name: post.author.fullName,
      },
      datePublished: post.publishedAt || post.createdAt,
      dateModified: post.updatedAt || undefined,
      image: post.featuredImageUrl || undefined,
      keywords: [
        'Gambia jobs',
        'career advice',
        'job market',
        'employment tips',
      ],
      wordCount: post.content.split(' ').length,
      slug: post.slug,
    });

    return (
      <>
        <StructuredData data={articleSchema} />
        <BlogPostContent post={post} />
      </>
    );
  } catch (error) {
    console.error('Error loading blog post:', error);
    notFound();
  }
} 