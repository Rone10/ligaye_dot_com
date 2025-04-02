import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EmployerSidebar from './_components/EmployerSidebar'

export default async function EmployerDashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  return (
    <div className="container mx-auto flex min-h-screen bg-gradient-to-br from-[#e9efff] to-[#f4f7ff]">
      <EmployerSidebar />
      <main className="flex-1 p-6 lg:px-8 ">
        {children}
      </main>
    </div>
  )
} 