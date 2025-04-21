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
    <div className="min-h-screen bg-gradient-to-br from-[#e9efff] to-[#f4f7ff]">
      <Navbar user={user} />
      <div className="container mx-auto px-4 py-8">
        {/* Header with logo */}
        <header className="mb-8 mt-4">
          <Link href="/" className="flex justify-center">
            <div className="relative h-12 w-32">
              {/* Replace with your actual logo */}
              <div className="flex items-center justify-center">
                <h1 className="text-4xl font-bold text-primary-blue">Ligaye.com</h1>
              </div>
            </div>
          </Link>
        </header>
        
        {/* Main content */}
        <main className="mt-12 mb-20">
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