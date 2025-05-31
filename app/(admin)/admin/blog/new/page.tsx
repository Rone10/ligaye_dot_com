import { getUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BlogPostForm } from './_components/BlogPostForm';

export default async function NewBlogPostPage() {
  const user = await getUser();
  
  if (!user || user?.user_metadata?.role !== 'admin') {
    redirect('/not-found');
  }

  return (
    <div className="min-h-screen bg-gradient-bg p-xl">
      <div className="max-w-4xl mx-auto">
        <div className="glass-card p-xl rounded-lg shadow-level-2">
          <div className="mb-lg">
            <h1 className="text-3xl font-bold text-theme-dark mb-xs">Create New Blog Post</h1>
            <p className="text-base text-theme-gray-dark">Write and publish a new blog post</p>
          </div>
          
          <BlogPostForm />
        </div>
      </div>
    </div>
  );
} 