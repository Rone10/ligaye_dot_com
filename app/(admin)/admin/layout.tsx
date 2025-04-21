import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { eq, and } from 'drizzle-orm'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import AdminSidebar from './_components/AdminSidebar'

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get logged-in user
  const user = await getUser()
  
  // Handle unauthorized access
  if (!user) {
    redirect('/sign-in')
  }
  
  // Check if user has admin role
 if (user.user_metadata.role !== 'admin') {
  redirect('/sign-in')
 }
  
  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-blue-50 to-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:px-8">
        <div className="container mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
} 