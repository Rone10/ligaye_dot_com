import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UnifiedSidebar } from '../_components/UnifiedSidebar'

export default async function CandidateDashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const user = await getUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  // Only allow candidate to access this page
  const userRole = user.user_metadata?.role;
  if (userRole !== 'candidate') {
    if (userRole === 'employer') {
      console.warn(`Redirecting user ${user.id} with role '${userRole}' from candidate layout to /employer`);
      redirect('/employer'); // Redirect non-candidates away
    }
    if (userRole === 'admin') {
      console.warn(`Redirecting user ${user.id} with role '${userRole}' from candidate layout to /admin`);
      redirect('/admin/users'); // Redirect non-candidates away
    }
  }
  
  return (
    <div className="h-screen flex overflow-hidden bg-gradient-from-theme-light to-theme-gray dark:bg-gradient-from-theme-dark dark:to-theme-gray">
      <UnifiedSidebar userRole="candidate" />
      <main className="flex-1 overflow-y-auto p-6 lg:px-8">
        <div className="container mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
} 