'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Poppins } from 'next/font/google';
import { Button } from '@/components/ui/button';
import { BriefcaseIcon, Menu, Search, User, X, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import { ThemeToggle } from '@/components/theme-toggle';


const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

interface NavbarProps {
  user: any | null;
}

export default function Navbar({ user }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
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

    // console.log('user_metadata', user?.user_metadata);
    
    // Redirecting to appropriate dashboard based on user metadata
    // This is simplified and should be adjusted based on your actual user role management
    if (user?.user_metadata?.role === 'admin') return '/admin/users';
    if (user?.user_metadata?.role === 'candidate') return '/candidate';
    if (user?.user_metadata?.role === 'employer') return '/employer';
    return '/'; // Default dashboard for job seekers or unknown roles
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-theme-gray  backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          {/* <div className="h-8 w-8 rounded-lg bg-primary-blue flex items-center justify-center">
            <span className="text-white font-bold text-lg">L</span>
          </div> */}
          <Image src="/logo.PNG" alt="Ligaye Logo" width={170} height={100} />
          {/* <span className="text-2xl md:text-3xl font-bold text-primary-blue">Ligaye</span> */}
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <div className="flex items-center space-x-6">
            <Link 
              href="/jobs" 
              className={`transition-colors font-medium ${
                pathname.startsWith('/jobs') 
                  ? 'text-primary-blue font-semibold' 
                  : 'text-theme-gray-dark hover:text-theme-dark'
              }`}
            >
              Find Jobs
            </Link>
            <Link 
              href="/tenders" 
              className={`transition-colors font-medium ${
                pathname.startsWith('/tenders') 
                  ? 'text-primary-blue font-semibold' 
                  : 'text-theme-gray-dark hover:text-theme-dark'
              }`}
            >
              Tenders
            </Link>
            <Link 
              href="/about-us" 
              className={`transition-colors font-medium ${
                pathname.startsWith('/about-us') 
                  ? 'text-primary-blue font-semibold' 
                  : 'text-theme-gray-dark hover:text-theme-dark'
              }`}
            >
              About
            </Link>
            <Link 
              href="/contact-us" 
              className={`transition-colors font-medium ${
                pathname.startsWith('/contact-us') 
                  ? 'text-primary-blue font-semibold' 
                  : 'text-theme-gray-dark hover:text-theme-dark'
              }`}
            >
              Contact
            </Link>
            <Link 
              href="/blog" 
              className={`transition-colors font-medium ${
                pathname.startsWith('/blog') 
                  ? 'text-primary-blue font-semibold' 
                  : 'text-theme-gray-dark hover:text-theme-dark'
              }`}
            >
              Blog
            </Link>
            {/* <Link 
              href="/pricing" 
              className={`transition-colors font-medium ${
                pathname.startsWith('/pricing') 
                  ? 'text-primary-blue font-semibold' 
                  : 'text-theme-gray-dark hover:text-theme-dark'
              }`}
            >
              Pricing
            </Link> */}
          </div>
        </nav>
        
        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle - Desktop */}
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
          
          {user ? (
            <div className="hidden md:flex items-center gap-3">
              <Link href={getDashboardLink()} className="text-theme-dark font-medium hover:text-primary-blue transition-colors">
              <Button variant="default" size="sm" className="text-white hover:text-white/90">
                Dashboard
              </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-theme-dark hover:text-primary-blue dark:hover:text-white"
                onClick={handleLogout}
              >
                {/* <LogOut className="h-4 w-4 mr-2" /> */}
                Logout
              </Button>
            </div>
          ) : (
            <>
              <Link href="/sign-in" className="text-theme-dark font-medium hover:text-primary-blue transition-colors hidden md:block">
                Sign In
              </Link>
              <Link href="/sign-up">
                <Button variant="default" size="sm" className="hidden md:flex">
                  Create Account
                </Button>
              </Link>
            </>
          )}
          <button 
            className="md:hidden text-theme-dark hover:text-primary-blue transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-sm shadow-level-2 py-4 px-4 animate-appear">
          <nav className="flex flex-col space-y-4">
            <Link 
              href="/jobs" 
              className={`transition-colors font-medium px-2 py-1.5 ${
                pathname.startsWith('/jobs') 
                  ? 'text-primary-blue font-semibold' 
                  : 'text-theme-dark hover:text-primary-blue'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Find Jobs
            </Link>
            <Link 
              href="/tenders" 
              className={`transition-colors font-medium px-2 py-1.5 ${
                pathname.startsWith('/tenders') 
                  ? 'text-primary-blue font-semibold' 
                  : 'text-theme-dark hover:text-primary-blue'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Tenders
            </Link>
            <Link 
              href="/about-us" 
              className={`transition-colors font-medium px-2 py-1.5 ${
                pathname.startsWith('/about-us') 
                  ? 'text-primary-blue font-semibold' 
                  : 'text-theme-dark hover:text-primary-blue'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </Link>
            <Link 
              href="/contact-us" 
              className={`transition-colors font-medium px-2 py-1.5 ${
                pathname.startsWith('/contact-us') 
                  ? 'text-primary-blue font-semibold' 
                  : 'text-theme-dark hover:text-primary-blue'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact Us
            </Link>
            <Link 
              href="/blog" 
              className={`transition-colors font-medium px-2 py-1.5 ${
                pathname.startsWith('/blog') 
                  ? 'text-primary-blue font-semibold' 
                  : 'text-theme-dark hover:text-primary-blue'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Blog
            </Link>
            <Link 
              href="/pricing" 
              className={`transition-colors font-medium px-2 py-1.5 ${
                pathname.startsWith('/pricing') 
                  ? 'text-primary-blue font-semibold' 
                  : 'text-theme-dark hover:text-primary-blue'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <div className="border-t border-theme-gray/30 pt-4 mt-2 flex flex-col space-y-3">
              {/* Theme Toggle - Mobile */}
              <div className="flex items-center justify-between px-2 py-1.5">
                <span className="text-theme-dark font-medium">Theme</span>
                <ThemeToggle />
              </div>
              
              {user ? (
                <>
                  <Link 
                    href={getDashboardLink()} 
                    className="w-full text-theme-dark hover:text-primary-blue transition-colors font-medium px-2 py-1.5"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Button 
                    variant="default" 
                    className="w-full flex items-center justify-center"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link 
                    href="/sign-in" 
                    className="w-full text-theme-dark hover:text-primary-blue transition-colors font-medium px-2 py-1.5"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/sign-up"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button variant="default" className="w-full">
                      Create Account
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
} 