import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublishedBlogPostBySlug } from './_queries';
import { BlogPostContent } from './_components/BlogPostContent';




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

    return {
      title: `${post.title} | Ligaye.com Blog`,
      description: post.excerpt || `Read ${post.title} on Ligaye.com - insights and trends in the Gambian job market.`,
      keywords: `${post.title}, Gambia jobs, career advice, job market trends, ${post.author.fullName}`,
      authors: [{ name: post.author.fullName }],
      openGraph: {
        title: post.title,
        description: post.excerpt || `Read ${post.title} on Ligaye.com`,
        type: 'article',
        url: postUrl,
        siteName: 'Ligaye.com',
        locale: 'en_US',
        publishedTime: post.publishedAt?.toISOString(),
        modifiedTime: post.updatedAt?.toISOString(),
        authors: [post.author.fullName],
        images: post.featuredImageUrl ? [
          {
            url: post.featuredImageUrl,
            width: 1200,
            height: 630,
            alt: post.title,
          }
        ] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.excerpt || `Read ${post.title} on Ligaye.com`,
        images: post.featuredImageUrl ? [post.featuredImageUrl] : [],
        creator: `@${post.author.fullName.replace(/\s+/g, '').toLowerCase()}`,
      },
      alternates: {
        canonical: postUrl,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
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

    return <BlogPostContent post={post} />;
  } catch (error) {
    console.error('Error loading blog post:', error);
    notFound();
  }
} 