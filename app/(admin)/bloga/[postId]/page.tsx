import { getUser } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { getBlogPostByIdForAdmin } from './_queries';
import { BlogPostDetailView } from './_components/BlogPostDetailView';

interface AdminBlogPostDetailPageProps {
  params: Promise<{ postId: string }>;
}

export default async function AdminBlogPostDetailPage({ params }: AdminBlogPostDetailPageProps) {
  const { postId } = await params;
  
  const user = await getUser();
  
  if (!user || user?.user_metadata?.role !== 'admin') {
    redirect('/not-found');
  }

  const blogPost = await getBlogPostByIdForAdmin(postId);

  if (!blogPost) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-bg p-xl">
      <div className="max-w-4xl mx-auto">
        <BlogPostDetailView blogPost={blogPost} />
      </div>
    </div>
  );
} 