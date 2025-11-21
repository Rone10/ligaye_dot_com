import { getUserWithProfile } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UnifiedSidebar } from '../_components/UnifiedSidebar'

// Force dynamic rendering for all employer dashboard pages
export const dynamic = 'force-dynamic';

export default async function EmployerDashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { user, profile } = await getUserWithProfile()

  if (!user) {
    redirect('/sign-in')
  }

  // Only allow employer to access this page - check database profile role
  if (profile?.role !== 'employer') {
    if (profile?.role === 'candidate') {
      console.warn(`Redirecting user ${user.id} with role '${profile.role}' from employer layout to /candidate`);
      redirect('/candidate');
    }
    if (profile?.role === 'admin') {
      console.warn(`Redirecting user ${user.id} with role '${profile.role}' from employer layout to /admin/users`);
      redirect('/admin/users');
    }
    // If no profile or unrecognized role, redirect to sign-in
    redirect('/sign-in');
  }

  return (
    <div className="h-screen flex overflow-hidden ">
      <UnifiedSidebar userRole="employer" />
      <main className="flex-1 overflow-y-auto p-6 lg:px-8">
        <div className="container mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
} 