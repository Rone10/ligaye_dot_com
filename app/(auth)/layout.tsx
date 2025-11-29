import { Toaster } from 'sonner'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { getUser } from '@/lib/supabase/server'
import Footer from '@/components/Footer'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()
  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--bg-gradient-from))] to-[hsl(var(--bg-gradient-to))]">
      <Navbar user={user} />
      <div className="container mx-auto px-4 py-8">
        {/* Main content */}
        <main className="mb-20">
          {children}
        </main>

        {/* Footer */}
        <div className="mt-12">
          <Footer />
        </div>
      </div>

      {/* Toast notifications */}
      {/* <Toaster position="top-center" richColors /> */}
    </div>
  )
} 