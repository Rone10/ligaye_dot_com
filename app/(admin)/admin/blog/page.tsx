import { getUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getAllBlogPostsForAdmin } from './_queries';
import { AdminBlogPostsTable } from './_components/AdminBlogPostsTable';

export default async function AdminBlogPage() {
  const user = await getUser();
  
  if (!user || user?.user_metadata?.role !== 'admin') {
    redirect('/not-found');
  }

  const blogPosts = await getAllBlogPostsForAdmin();

  return (
    <div className="min-h-screen bg-gradient-bg p-xl">
      <div className="max-w-7xl mx-auto">
        <div className="glass-card p-xl rounded-lg shadow-level-2 mb-xl">
          <div className="flex items-center justify-between mb-lg">
            <div>
              <h1 className="text-3xl font-bold text-theme-dark mb-xs">Blog Management</h1>
              <p className="text-base text-theme-gray-dark">Manage all blog posts and articles</p>
            </div>
            <a
              href="/admin/blog/new"
              className="bg-primary-blue text-white px-lg py-md rounded-md shadow-level-2 hover:bg-primary-blue-light hover:shadow-level-3 duration-standard font-semibold"
            >
              Create New Post
            </a>
          </div>
          
          <AdminBlogPostsTable blogPosts={blogPosts} />
        </div>
      </div>
    </div>
  );
} 