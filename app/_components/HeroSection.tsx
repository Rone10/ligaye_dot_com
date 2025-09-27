'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  user: any | null;
}

export default function HeroSection({ user }: HeroSectionProps) {
  return (
    <main className="flex-1 pt-20 md:pt-32 pb-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
        <div className="space-y-6 animate-appear relative">
          {/* Decorative elements */}
          <div className="absolute -top-20 -right-16 w-40 h-40 bg-primary-blue/5 rounded-full blur-3xl z-0"></div>
          <div className="absolute -bottom-12 left-10 w-32 h-32 bg-secondary-green/5 rounded-full blur-2xl z-0"></div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-theme-dark relative z-10">
          <span className="text-primary-blue"> Gambia&apos;s  </span>Digital Career
          <span className="text-primary-blue"> Revolution </span>
          </h1>
          
          <p className="text-xl text-theme-gray-dark max-w-2xl mx-auto relative z-10">
            Find your dream job or hire top talent in The Gambia. Connect with opportunities that match your skills and ambitions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Link href="/jobs">
              <Button className="bg-primary-blue hover:bg-primary-blue-light text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                Find Jobs
              </Button>
            </Link>
            <Link href={user ? "/employer/jobs/new" : "/sign-up"}>
              <Button variant="outline" className="bg-background/90 text-theme-dark border border-theme-gray hover:bg-background/80 transition-all duration-300 font-semibold py-3 px-8 rounded-xl">
                Post a Job
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}