import { Toaster } from 'sonner'
import Image from 'next/image'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e9efff] to-[#f4f7ff]">
      <div className="container mx-auto px-4 py-8">
        {/* Header with logo */}
        <header className="mb-8">
          <Link href="/" className="flex justify-center">
            <div className="relative h-12 w-32">
              {/* Replace with your actual logo */}
              <div className="flex items-center justify-center">
                <h1 className="text-2xl font-bold text-primary-blue">Ligaye.com</h1>
              </div>
            </div>
          </Link>
        </header>
        
        {/* Main content */}
        <main>
          {children}
        </main>
        
        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} Ligaye.com. All rights reserved.</p>
        </footer>
      </div>
      
      {/* Toast notifications */}
      {/* <Toaster position="top-center" richColors /> */}
    </div>
  )
} 