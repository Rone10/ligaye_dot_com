'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Poppins } from 'next/font/google';
import { Button } from '@/components/ui/button';
import { BriefcaseIcon, Menu, Search, User, X, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';


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

    console.log('user_metadata', user?.user_metadata);
    
    // Redirecting to appropriate dashboard based on user metadata
    // This is simplified and should be adjusted based on your actual user role management
    if (user?.user_metadata?.role === 'admin') return '/admin/users';
    if (user?.user_metadata?.role === 'candidate') return '/candidate';
    if (user?.user_metadata?.role === 'employer') return '/employer';
    return '/'; // Default dashboard for job seekers or unknown roles
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 backdrop-blur-md bg-white/70">
      <div className="flex h-16 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center ">
          <Link href="/" className="flex items-center ">
            {/* <BriefcaseIcon className="h-6 w-6 text-primary-blue" /> */}
            {/* <Image src="/branding/Suitcase.svg" alt="Ligaye Logo" width={40} height={40} className='py-2 px-2'/>   */}
            <span className={`${poppins.className} font-bold content-baseline text-3xl text-primary-blue`}>Ligaye</span>
          </Link>
        </div>
        
        {/* Navigation - Centered */}
        <nav className="hidden md:flex items-center justify-center">
          <div className="flex space-x-6">
            <Link 
              href="/jobs" 
              className={`transition-colors font-medium ${
                pathname.startsWith('/jobs') 
                  ? 'text-[#4a6cfa] font-semibold' 
                  : 'text-gray-dark hover:text-dark'
              }`}
            >
              Find Jobs
            </Link>
            <Link 
              href="/tenders" 
              className={`transition-colors font-medium ${
                pathname.startsWith('/tenders') 
                  ? 'text-[#4a6cfa] font-semibold' 
                  : 'text-gray-dark hover:text-dark'
              }`}
            >
              Tenders
            </Link>
            <Link 
              href="/about-us" 
              className={`transition-colors font-medium ${
                pathname.startsWith('/about-us') 
                  ? 'text-[#4a6cfa] font-semibold' 
                  : 'text-gray-dark hover:text-dark'
              }`}
            >
              About
            </Link>
            <Link 
              href="/contact-us" 
              className={`transition-colors font-medium ${
                pathname.startsWith('/contact-us') 
                  ? 'text-[#4a6cfa] font-semibold' 
                  : 'text-gray-dark hover:text-dark'
              }`}
            >
              Contact
            </Link>
            <Link 
              href="/blog" 
              className={`transition-colors font-medium ${
                pathname.startsWith('/blog') 
                  ? 'text-[#4a6cfa] font-semibold' 
                  : 'text-gray-dark hover:text-dark'
              }`}
            >
              Blog
            </Link>
            {/* <Link 
              href="/pricing" 
              className={`transition-colors font-medium ${
                pathname.startsWith('/pricing') 
                  ? 'text-[#4a6cfa] font-semibold' 
                  : 'text-gray-dark hover:text-dark'
              }`}
            >
              Pricing
            </Link> */}
          </div>
        </nav>
        
        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="hidden md:flex items-center gap-3">
              <Link href={getDashboardLink()} className="text-dark font-medium hover:text-primary-blue transition-colors">
              <Button variant="default" size="sm" className="text-white hover:text-gray-200">
                Dashboard
              </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-dark hover:text-primary-blue"
                onClick={handleLogout}
              >
                {/* <LogOut className="h-4 w-4 mr-2" /> */}
                Logout
              </Button>
            </div>
          ) : (
            <>
              <Link href="/sign-in" className="text-dark font-medium hover:text-primary-blue transition-colors hidden md:block">
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
            className="md:hidden text-dark hover:text-primary-blue transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-sm shadow-level-2 py-4 px-4 animate-appear">
          <nav className="flex flex-col space-y-4">
            <Link 
              href="/jobs" 
              className={`transition-colors font-medium px-2 py-1.5 ${
                pathname.startsWith('/jobs') 
                  ? 'text-[#4a6cfa] font-semibold' 
                  : 'text-dark hover:text-primary-blue'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Find Jobs
            </Link>
            <Link 
              href="/tenders" 
              className={`transition-colors font-medium px-2 py-1.5 ${
                pathname.startsWith('/tenders') 
                  ? 'text-[#4a6cfa] font-semibold' 
                  : 'text-dark hover:text-primary-blue'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Tenders
            </Link>
            <Link 
              href="/about-us" 
              className={`transition-colors font-medium px-2 py-1.5 ${
                pathname.startsWith('/about-us') 
                  ? 'text-[#4a6cfa] font-semibold' 
                  : 'text-dark hover:text-primary-blue'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </Link>
            <Link 
              href="/contact-us" 
              className={`transition-colors font-medium px-2 py-1.5 ${
                pathname.startsWith('/contact-us') 
                  ? 'text-[#4a6cfa] font-semibold' 
                  : 'text-dark hover:text-primary-blue'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact Us
            </Link>
            <Link 
              href="/blog" 
              className={`transition-colors font-medium px-2 py-1.5 ${
                pathname.startsWith('/blog') 
                  ? 'text-[#4a6cfa] font-semibold' 
                  : 'text-dark hover:text-primary-blue'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Blog
            </Link>
            <Link 
              href="/pricing" 
              className={`transition-colors font-medium px-2 py-1.5 ${
                pathname.startsWith('/pricing') 
                  ? 'text-[#4a6cfa] font-semibold' 
                  : 'text-dark hover:text-primary-blue'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <div className="border-t border-gray/30 pt-4 mt-2 flex flex-col space-y-3">
              {user ? (
                <>
                  <Link 
                    href={getDashboardLink()} 
                    className="w-full text-dark hover:text-primary-blue transition-colors font-medium px-2 py-1.5"
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
                    className="w-full text-dark hover:text-primary-blue transition-colors font-medium px-2 py-1.5"
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