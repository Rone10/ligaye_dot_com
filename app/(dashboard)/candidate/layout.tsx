import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CandidateSidebar from './_components/CandidateSidebar'

export default async function CandidateDashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const user = await getUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  // only allow candidate or admin to access this page
  if (user.user_metadata.role !== 'candidate') {
    redirect('/sign-in')
  }
  
  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-[#e9efff] to-[#f4f7ff]">
      <CandidateSidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:px-8">
        <div className="container mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
} 