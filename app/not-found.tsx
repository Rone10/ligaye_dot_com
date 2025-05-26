'use client';

import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Frown, Home, ChevronLeft, Search, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <>
    <div>
      <Navbar user={null} />
    </div>
    
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--bg-gradient-from))] to-[hsl(var(--bg-gradient-to))] flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-card p-8 text-center">
        <Frown className="h-20 w-20 text-primary-blue mb-4 mx-auto" />
        
        <h1 className="text-2xl font-bold text-theme-dark mb-2">Page Not Found</h1>
        <p className="text-theme-gray-dark mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>
        
        <div className="space-y-3">
          <Button asChild className="bg-primary-blue hover:bg-primary-blue-light text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300">
            <Link href="/">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="bg-background/50 text-theme-dark border border-theme-gray rounded-xl py-3 hover:bg-background/80 transition-all duration-300 flex items-center justify-center gap-2">
            <Link href="/jobs">
              <Search className="h-4 w-4" />
              Browse Jobs
            </Link>
          </Button>
          
          <Link 
            href="/contact-us"
            className="text-theme-gray-dark hover:text-primary-blue hover:bg-theme-light rounded-xl py-3 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Contact Support
          </Link>
        </div>
      </div>
    </div>
    </>
  );
} 