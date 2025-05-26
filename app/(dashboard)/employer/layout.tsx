import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UnifiedSidebar } from '../_components/UnifiedSidebar'

export default async function EmployerDashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const user = await getUser()
  
  if (!user) {
    redirect('/sign-in')
  }
  
  // Only allow employer to access this page
  const userRole = user.user_metadata?.role;
  if (userRole !== 'employer') {
    if (userRole === 'candidate') {
      console.warn(`Redirecting user ${user.id} with role '${userRole}' from employer layout to /candidate`);
      redirect('/candidate'); // Redirect non-employers away
    }
    if (userRole === 'admin') {
      console.warn(`Redirecting user ${user.id} with role '${userRole}' from employer layout to /admin`);
      redirect('/admin/users'); // Redirect non-employers away
    }
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-[#e9efff] to-[#f4f7ff]">
      <UnifiedSidebar userRole="employer" />
      <main className="flex-1 overflow-y-auto p-6 lg:px-8">
        <div className="container mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
} 