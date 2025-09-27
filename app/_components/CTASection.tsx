'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface CTASectionProps {
  user: any | null;
}

export default function CTASection({ user }: CTASectionProps) {
  return (
    <section className="py-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="glass-card p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-theme-dark mb-6">Ready to Get Started?</h2>
          
          <div className="space-y-4 mb-8">
            <p className="text-theme-gray-dark max-w-2xl mx-auto">Explore new job opportunities and manage your applications from your personalized dashboard.</p>
            
            <p className="text-theme-gray-dark max-w-2xl mx-auto">Manage your job postings and discover qualified candidates from your employer dashboard.</p>
            
            <p className="text-theme-gray-dark max-w-2xl mx-auto">Whether you&apos;re looking for your next opportunity or seeking talented professionals, Ligaye.com has you covered.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={user ? "/jobs" : "/sign-up"}>
              <Button className="bg-primary-blue hover:bg-primary-blue-light text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                Join as Job Seeker
              </Button>
            </Link>
            <Link href={user ? "/employer/jobs/new" : "/sign-up"}>
              <Button variant="outline" className="border-secondary-green text-secondary-green hover:bg-secondary-green hover:text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300">
                Join as Employer
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}