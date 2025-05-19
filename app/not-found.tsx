'use client';

import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Frown, Home, ChevronLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <>
    <div>
      <Navbar user={null} />
    </div>
    
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e9efff] to-[#f4f7ff] p-4">
      <div className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/30 rounded-2xl shadow-[0_8px_32px_rgba(31,38,135,0.1)] p-8 text-center">
        <div className="mb-6">
          <div className="flex justify-center">
            <Frown className="h-20 w-20 text-[#4a6cfa] mb-4" />
          </div>
          <h1 className="text-2xl font-bold text-[#1a1e2d] mb-2">Page Not Found</h1>
          <p className="text-[#9aa3bc] mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="flex flex-col gap-3">
            <Button asChild className="bg-[#4a6cfa] hover:bg-[#7b90ff] text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300">
              <Link href="/">
                <Home className="h-4 w-4" />
                <span>Back to Home</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="bg-white/50 text-[#1a1e2d] border border-[#e1e5f2] rounded-xl py-3 hover:bg-white/80 transition-all duration-300 flex items-center justify-center gap-2">
              <Link href="/jobs">
                <Search className="h-4 w-4" />
                <span>Browse Jobs</span>
              </Link>
            </Button>
            
            <Button 
              variant="ghost" 
              className="text-[#9aa3bc] hover:text-[#4a6cfa] hover:bg-[#f8faff] rounded-xl py-3 transition-all duration-300 flex items-center justify-center gap-2"
              onClick={() => window.history.back()}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Go Back</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
} 