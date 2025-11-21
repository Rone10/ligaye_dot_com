import { getUserWithProfile } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UnifiedSidebar } from '../_components/UnifiedSidebar'

// Force dynamic rendering for all candidate dashboard pages
export const dynamic = 'force-dynamic';

export default async function CandidateDashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { user, profile } = await getUserWithProfile()

  if (!user) {
    redirect('/sign-in')
  }

  // Only allow candidate to access this page - check database profile role
  if (profile?.role !== 'candidate') {
    if (profile?.role === 'employer') {
      console.warn(`Redirecting user ${user.id} with role '${profile.role}' from candidate layout to /employer`);
      redirect('/employer');
    }
    if (profile?.role === 'admin') {
      console.warn(`Redirecting user ${user.id} with role '${profile.role}' from candidate layout to /admin/users`);
      redirect('/admin/users');
    }
    // If no profile or unrecognized role, redirect to sign-in
    redirect('/sign-in');
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