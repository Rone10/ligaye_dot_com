'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, X, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import { ThemeToggle } from '@/components/theme-toggle';

interface NavbarProps {
  user: any | null;
}

export default function Navbar({ user }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const getDashboardLink = () => {
    if (!user) return '/sign-in';
    if (user?.user_metadata?.role === 'admin') return '/admin/users';
    if (user?.user_metadata?.role === 'candidate') return '/candidate';
    if (user?.user_metadata?.role === 'employer') return '/employer';
    return '/';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-background transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.PNG"
              alt="Ligaye Logo"
              width={120}
              height={70}
              className="object-contain dark:brightness-0 dark:invert"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/jobs" className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white font-medium">
              Find Jobs
            </Link>
            <Link href="/tenders" className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white font-medium">
              Tenders
            </Link>
            <Link href="/about-us" className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white font-medium">
              About
            </Link>
            <Link href="/contact-us" className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white font-medium">
              Contact
            </Link>
            <Link href="/blog" className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white font-medium">
              Blog
            </Link>
          </nav>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          {user ? (
            <div className="hidden md:flex items-center gap-4">
              <Link href={getDashboardLink()} className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white font-medium">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white font-medium">
                Sign out
              </button>
              <Link href="/employer/jobs/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-bold">
                Post a Job
              </Link>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              <Link href="/sign-in" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                Sign in
              </Link>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <Link href="/sign-up" className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white font-medium">
                Create Account
              </Link>
            </div>
          )}

          <button
            className="md:hidden text-gray-700 dark:text-gray-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-background border-t border-gray-200 dark:border-gray-700 py-4 px-4">
          <nav className="flex flex-col space-y-4">
            <Link href="/jobs" className="text-gray-700 dark:text-gray-300 font-medium py-2">Find Jobs</Link>
            <Link href="/tenders" className="text-gray-700 dark:text-gray-300 font-medium py-2">Tenders</Link>
            <Link href="/about-us" className="text-gray-700 dark:text-gray-300 font-medium py-2">About</Link>
            <Link href="/contact-us" className="text-gray-700 dark:text-gray-300 font-medium py-2">Contact</Link>
            <Link href="/blog" className="text-gray-700 dark:text-gray-300 font-medium py-2">Blog</Link>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              {user ? (
                <>
                  <Link href={getDashboardLink()} className="block text-blue-600 dark:text-blue-400 font-bold py-2">Dashboard</Link>
                  <button onClick={handleLogout} className="block text-gray-700 dark:text-gray-300 font-medium py-2 w-full text-left">Sign out</button>
                </>
              ) : (
                <>
                  <Link href="/sign-in" className="block text-blue-600 dark:text-blue-400 font-bold py-2">Sign in</Link>
                  <Link href="/sign-up" className="block text-gray-700 dark:text-gray-300 font-medium py-2">Create Account</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
