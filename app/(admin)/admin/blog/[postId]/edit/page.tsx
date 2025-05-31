import { getUser } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { getBlogPostByIdForEdit } from './_queries';
import { BlogPostForm } from './_components/BlogPostEditForm';

interface EditBlogPostPageProps {
  params: Promise<{ postId: string }>;
}

export default async function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const { postId } = await params;
  
  const user = await getUser();
  
  if (!user || user?.user_metadata?.role !== 'admin') {
    redirect('/not-found');
  }

  const blogPost = await getBlogPostByIdForEdit(postId);

  if (!blogPost) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-bg p-xl">
      <div className="max-w-4xl mx-auto">
        <div className="glass-card p-xl rounded-lg shadow-level-2">
          <div className="mb-lg">
            <h1 className="text-3xl font-bold text-theme-dark mb-xs">Edit Blog Post</h1>
            <p className="text-base text-theme-gray-dark">Make changes to your blog post</p>
          </div>
          
          <BlogPostForm blogPost={blogPost} />
        </div>
      </div>
    </div>
  );
} 